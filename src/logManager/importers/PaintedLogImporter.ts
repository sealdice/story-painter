import dayjs from "dayjs";
import { useStore } from "~/store";
import { CharItem, LogItem } from "../types";
import { LogImporter } from "./_logImpoter";

// 支持两种格式: <角色名>消息内容 或 [角色名]消息内容
export const rePaintedLogAngleBrackets = /^<([^>]+)>(.*)$/m;
export const rePaintedLogSquareBrackets = /^\[([^\]]+)\](.*)$/m;

// 也支持日期时间前缀
export const rePaintedLogWithDateTime =
  /^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})<([^>]+)>(.*)$/m;

export class PaintedLogImporter extends LogImporter {
  check(text: string): boolean {
    const lines = text.split("\n");
    for (const line of lines) {
      if (
        rePaintedLogAngleBrackets.test(line) ||
        rePaintedLogSquareBrackets.test(line) ||
        rePaintedLogWithDateTime.test(line)
      ) {
        return true;
      }
    }
    return false;
  }

  get name() {
    return "已染色日志格式";
  }

  parse(text: string) {
    const store = useStore();
    const charInfo = new Map<string, CharItem>();
    const items = [] as LogItem[];
    let startText = "";

    // 按行分割文本
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    let currentItem: LogItem | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 匹配<角色名>消息格式
      let angleMatch = rePaintedLogAngleBrackets.exec(line);
      // 匹配[角色名]消息格式
      let squareMatch = rePaintedLogSquareBrackets.exec(line);
      // 匹配带日期时间的格式
      let dateTimeMatch = rePaintedLogWithDateTime.exec(line);

      // 如果找到新的对话行
      if (angleMatch || squareMatch || dateTimeMatch) {
        if (currentItem) {
          items.push(currentItem);
        }

        currentItem = {} as LogItem;

        if (dateTimeMatch) {
          // 处理带有日期时间的格式
          currentItem.nickname = dateTimeMatch[2];
          currentItem.message = dateTimeMatch[3].trimStart();
          currentItem.time = dayjs(
            dateTimeMatch[1],
            "YYYY/MM/DD HH:mm:ss"
          ).unix();
        } else if (angleMatch) {
          // 处理<角色名>格式
          currentItem.nickname = angleMatch[1];
          currentItem.message = angleMatch[2].trimStart();
          currentItem.time = dayjs().unix(); // 使用当前时间
        } else if (squareMatch) {
          // 处理[角色名]格式
          currentItem.nickname = squareMatch[1];
          currentItem.message = squareMatch[2].trimStart();
          currentItem.time = dayjs().unix(); // 使用当前时间
        }

        currentItem.IMUserId = this.getAutoIMUserId(
          store.pcList.length,
          currentItem.nickname
        );
        this.setCharInfo(charInfo, currentItem);
      } else if (currentItem) {
        // 如果当前行不是新的对话，则添加到当前对话的消息中
        currentItem.message += "\n" + line;
      } else {
        // 如果是开头没有角色的文本，添加到startText
        startText += line + "\n";
      }
    }

    // 保存最后一个对话项
    if (currentItem) {
      items.push(currentItem);
    }

    // 确保所有消息末尾都有两个换行符
    for (let item of items) {
      item.message = item.message.trimEnd() + "\n\n";
    }

    return { items, charInfo, startText };
  }
}

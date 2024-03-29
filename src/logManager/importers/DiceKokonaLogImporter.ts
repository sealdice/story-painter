import { useStore } from "~/store";
import { CharItem, LogItem, packNameId } from "../types";
import { LogImporter, TextInfo } from "./_logImpoter";

// 注: 某种情况下，发言条的句末会带一个空格，已调整（某版本赵骰，原始文件及从上方文本框复制时）
export const reEditLogTest = /^([^(<\n]+)(\(([^(\n]+)\)|\<[^(\n]+\>)?(\s+)(\d{4}-\d{1,2}-\d{1,2} )?(\d{1,2}:\d{1,2}:\d{2})( #\d+)? ?$/m
export const reEditLog = new RegExp(reEditLogTest, 'gm')


export class DiceKokonaLogImporter extends LogImporter {
  // ？？(1111) 2022-10-18 16:59:42
  // 战斗轮
  check(text: string): boolean {
    if (reEditLogTest.test(text)) {
      return true;
    }
    return false;
  }

  get name() {
    return 'Dice!编辑器默认格式'
  }

  parse(text: string): TextInfo {
    const store = useStore();

    reEditLog.lastIndex = 0; // 注: 默认值即为0 并非-1
    const charInfo = new Map<string, CharItem>();
    const items = [] as LogItem[];
    let lastItem: LogItem = null as any;
    let lastIndex = 0;
    let startText = '';

    // 这个不要trim，以免和实际文本不符

    while (true) {
      const m = reEditLog.exec(text);
      if (m) {
        if (lastItem) {
          lastItem.message += text.slice(lastIndex, m.index);
          lastItem.message = lastItem.message;
        } else {
          startText = text.slice(0, m.index);
        }

        const item = {} as LogItem;
        item.nickname = m[1];
        [item.time, item.timeText] = this.parseTime((m[5] || '') + m[6]);
        item.message = '';
        if (m[2]) {
          item.IMUserId = m[2].slice(1, -1);
        } else {
          item.IMUserId = this.getAutoIMUserId(store.pcList.length, item.nickname);
        }
        this.setCharInfo(charInfo, item);
        items.push(item);

        lastItem = item;
        lastIndex = m.index + m[0].length;
      } else {
        if (lastItem) {
          lastItem.message += text.slice(lastIndex, text.length);
          lastItem.message = lastItem.message;
        }
        break;
      }
    }

    for (let i of items) {
      // if (i.message.endsWith('\n\n')) {
      //   i.message = i.message.slice(1, i.message.length-2);
      // } else if (i.message.endsWith('\n')) {
      //   i.message = i.message.slice(1, i.message.length-1);
      // } else {
      i.message = i.message.slice(1);
      // }
    }

    return { items, charInfo, startText, exporter: 'dice!' };
  }
}

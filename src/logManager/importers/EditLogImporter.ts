import { useStore } from "~/store";
import { CharItem, LogItem, packNameId } from "../types";
import { LogImporter, TextInfo } from "./_logImpoter";
import { reEditLogTest, unwrapName } from "../editLogHeader";

// 名字这一组有两种形态：
//
//   希亚(12345) 19:33:39      裸名字。原本只认这一种。
//   <希亚>(12345) 19:33:39    整个名字被尖括号包起来。
//
// 第二种来自一个已经修掉的上游 bug：Dice!Next 一度把**回复里**那个带包裹的
// 显示名（<希亚>）当成名字存进日志并上传。骰子那边改了，但已经传上去的日志
// 改不了——而名字这一组原本明确排除 `<`，于是那些日志里每一个玩家的行都解析
// 失败，只剩骰娘自己那行认得出来，七个角色显示成一个。
//
// 只在**整行开头**认这种包裹，所以 `希亚<12345> 19:33:39`（名字后面跟尖括号
// id，本来就支持的写法）不受影响：那一行不以 `<` 开头，走的还是原来那条分支。
// 捕获到的包裹由 unwrapName 剥掉，否则预览层再包一次就成了 <<希亚>>。
export { reEditLogTest } from "../editLogHeader";
export const reEditLog = new RegExp(reEditLogTest, 'gm')


export class EditLogImporter extends LogImporter {
  // TODO 信息等待补充
  // 2022-05-10 11:28:25 名字(12345)
  check(text: string): boolean {
    if (reEditLogTest.test(text)) {
      return true;
    }
    return false;
  }

  get name() {
    return '海豹编辑器格式'
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
        item.nickname = unwrapName(m[1]);
        [item.time, item.timeText] = this.parseTime((m[5] || '') + m[6]);
        item.message = '';
        if (m[2]) {
          item.IMUserId = m[2].slice(1, -1);
        } else {
          // console.log('???', item, m);
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

    return { items, charInfo, startText, exporter: 'editLog' };
  }
}

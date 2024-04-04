import { LogImporter, TextInfo  } from "./importers/_logImpoter"
import { SealDiceLogImporter } from "./importers/SealDiceLogImporter";
import { QQExportLogImporter } from "./importers/QQExportLogImporter";
import { SinaNyaLogImporter } from "./importers/SinaNyaLogImporter";
import { EditLogExporter } from "./exporters/EditLogExporter";
import { Emitter } from "./event";
import { indexInfoListItem } from "./exporters/logExporter";
import { EditLogImporter } from "./importers/EditLogImporter";
import { CharItem, LogItem } from "./types";
import { DiceKokonaLogImporter } from "./importers/DiceKokonaLogImporter";
import { RenderedLogImporter } from "./importers/RenderedLogImporter";
import { FvttLogImporter } from "./importers/FvttLogImporter";


export class LogManager {
  ev = new Emitter<{
    'textSet': (text: string) => void,
    'parsed': (ti: TextInfo) => void;
  }>(this);

  importers = [
    ['sealDice', new SealDiceLogImporter(this)],
    ['editLog', new EditLogImporter(this)],
    ['qqExport', new QQExportLogImporter(this)],
    ['sinaNya', new SinaNyaLogImporter(this)],
    ['dice!', new DiceKokonaLogImporter(this)],
    ['rendered', new RenderedLogImporter(this)],
    ['fvtt', new FvttLogImporter(this)],
  ]

  exporters = {
    editLog: new EditLogExporter()
  }

  constructor() {
  }

  rename(item: CharItem, lastPCName: string, name: string) {
    const a = `<${lastPCName}>`;
    const b = `<${name}>`;
    for (let i of this.curItems) {
      if (item.IMUserId === i.IMUserId && lastPCName == i.nickname) {
        i.nickname = name;
      }

      i.message = i.message.replaceAll(a, b);
    }
    this.flush();
  }

  deleteByCharItem(item: CharItem) {
    const newItems = [];
    for (let i of this.curItems) {
      if (!(item.IMUserId === i.IMUserId && item.name == i.nickname)) {
        newItems.push(i);
      }
    }
    this.curItems = newItems;
    this.flush();
  }

  /**
   * 解析log
   * @param text 文本
   * @param genFakeHeadItem 生成一个伪项，专门用于放在最前面，来处理用户在页面最前方防止非格式化文本的情况
   * @returns 
   */
  parse(text: string, genFakeHeadItem: boolean = false) {
    for (let [theName, _importer] of this.importers) {
      const importer = _importer as LogImporter;
      if (importer.check(text)) {
        const ret = importer.parse(text);
        console.log(`初步识别log为 ${importer.name} 格式，解析为:`, ret)
        if (genFakeHeadItem) {
          const item = {} as LogItem;
          item.isRaw = true;
          item.message = ret.startText
          ret.items = [item, ...ret.items];
        }

        this.ev.emit('parsed', ret);
        return ret;
      }
    }
    console.log(`解析log格式失败，可能是纯文本或未知格式`);
  }

  flush() {
    const ret = this.exporters.editLog.doExport(this.curItems);
    if (ret) {
      const { text, indexInfoList} = ret;
      this.lastText = text;
      this.lastIndexInfoList = indexInfoList;
      this.ev.emit('textSet', text);
    }
  }

  lastText = '';
  curItems: LogItem[] = [];
  lastIndexInfoList: indexInfoListItem[] = [];

  working = false;

  syncChange(curText: string, r1: number[], r2: number[]) {
    if (curText === this.lastText) {
      return
    }
    if (this.working) return;
    this.working = true;
    console.log('syncChange')

    if (!this.lastText) {
      const info = this.parse(curText, true);
      if (info) {
        this.curItems = info.items;
        const ret = this.exporters.editLog.doExport(info.items);
        if (ret) {
          const { text, indexInfoList} = ret;
          this.lastText = text;
          this.lastIndexInfoList = indexInfoList;
          this.ev.emit('textSet', text);
        }
      }
    } else {
      // 增删
      const influence = []
      const [a, b] = r1;
      let last: indexInfoListItem | undefined = undefined;
      if (this.lastIndexInfoList.length) {
        last = this.lastIndexInfoList[this.lastIndexInfoList.length - 1];
      }

      // flush 代表刷新当前editer的文本，使其与内部数据结构一致，用于导入非海豹文本格式日志
      let needFlush = false;

      for (let i of this.lastIndexInfoList) {
        if (a < i.indexEnd && b >= i.indexStart) {
          influence.push(i);
        }
        if (i == last) {
          if (last.indexEnd === r1[0]) {
            influence.push(i);
          }
        }
      }
      // console.log("H", this.lastIndexInfoList, r1, influence)
      console.log("TEST", this.lastIndexInfoList, r1, r2, influence);

      // 省事起见，不做精细控制，直接重建被影响的部分
      const replacePart = curText.slice(...r2)
      if (influence.length) {
        const li = influence[0];
        const ri = influence[influence.length-1];
        const partLeft = this.lastText.slice(li.indexStart, a);
        const partRight = this.lastText.slice(b, ri.indexEnd);

        // 这部分就是被影响被影响区间的新的文本
        const changedText = partLeft + replacePart + partRight;
        const liIndex = this.lastIndexInfoList.indexOf(li);
        const riIndex = this.lastIndexInfoList.indexOf(ri);

        const left = this.lastIndexInfoList.slice(0, liIndex);
        const right = this.lastIndexInfoList.slice(riIndex+1, this.lastIndexInfoList.length);

        const rInfo = this.parse(changedText, influence[0] === this.lastIndexInfoList[0]);
        console.log('changedText', [changedText], rInfo);
        const offset = r2[1] - r2[0] - (r1[1] - r1[0]);
  
        if (rInfo) {
          needFlush = rInfo?.exporter != 'editLog';
        }
        // console.log("C2", left, 'R', right, 'O', offset)

        if (rInfo) {
          // 检查左方是否有文本剩余
          if (rInfo.startText) {
            if (left.length !== 0) {
              // 如果左侧仍有内容，归并进去
              left[left.length-1].item.message += rInfo.startText;
              left[left.length-1].indexEnd += rInfo.startText.length;  
            } else {
              // 如果自己已经是最左方，左侧可以选择不管，因为上一步parse的时候应该会生成一个新的顶部节点
              // 但是右侧需要进行合并
              if (right.length) {
                // 合并到当前最后一个节点中
                if (right[0].item.isRaw) {
                  // 没有这种情况？？？为什么
                  console.log('XXXXXXXXXXX', right)
                }
              }
            }
          }

          const ret = this.exporters.editLog.doExport(rInfo.items, li.indexStart);

          if (ret) {
            const { text, indexInfoList} = ret;

            // TODO: left 的最后一个
            // console.log('CCC', liIndex, riIndex, 'X', this.lastIndexInfoList.length);
            // console.log('CCC', left, 'I', indexInfoList, 'R', right);

            // 将受影响部分的LogItems替换
            this.lastIndexInfoList = [...left, ...indexInfoList, ...right];
            // 依次推迟右侧区域offset
            this.curItems = [...left.map(i => i.item), ...rInfo.items, ...right.map(i => i.item)];
          }
        } else {
          // 不能再构成规范格式，比如被删掉一部分
          if (left.length !== 0) {
            // 如果在中间的被删除，这样处理
            left[left.length-1].item.message += changedText;
            left[left.length-1].indexEnd += changedText.length;
            this.lastIndexInfoList = [...left, ...right];
            this.curItems = [...left.map(i => i.item), ...right.map(i => i.item)];
          } else {
            // 如果在开头的受到影响
            this.curItems[0].message = changedText;
            this.lastIndexInfoList[0].indexEnd = changedText.length;
            this.lastIndexInfoList = [this.lastIndexInfoList[0], ...right];
            this.curItems = [this.curItems[0], ...right.map(i => i.item)];
          }
        }

        right.map(i => {
          i.indexStart += offset;
          i.indexContent += offset;
          i.indexEnd += offset;
        });

        // 封装最终文本
        const newText = this.lastText.slice(0, li.indexStart) + changedText + this.lastText.slice(ri.indexEnd, this.lastText.length)
        this.lastText = newText;
        if (needFlush) this.flush();
      }

      // 遍历受影响部分
      // for (let i of influence) {
      //   if (a < i.indexStart && b > i.indexEnd) {
      //     console.log('此段被删除', i);
      //   } else if (a < i.indexContent && b < i.indexContent) {
      //     // 只影响标题
      //     console.log('只影响标题', i);
      //   } else if (a < i.indexContent && b >= i.indexContent) {
      //     console.log('标题加正文', i);
      //   } else if (a >= i.indexContent) {
      //     console.log('仅正文', i);
      //   } else {
      //     console.log('????', i, r1)
      //   }
      // }

      // this.ev.emit('textSet', newText);
    }
    this.working = false;
    // console.log(333, textAll.slice(...r1), textAll.slice(...r2));
  }
}

export const logMan = new LogManager()

setTimeout(() => {
  (globalThis as any).logMan = logMan;
}, 1000)

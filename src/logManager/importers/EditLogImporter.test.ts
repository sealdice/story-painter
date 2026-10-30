import { EditorState } from "@codemirror/state";
import { ensureSyntaxTree, highlightingFor } from "@codemirror/language";
import { highlightTree } from "@lezer/highlight";
import { describe, expect, it, vi } from "vitest";
import { generateLang } from "~/utils/highlight";
import { LogManager } from "../logManager";
import { EditLogImporter } from "./EditLogImporter";

vi.mock("~/store", () => ({ useStore: () => ({ pcList: [] }) }));

const officialId = "4016132341-5EA6C43899D7ADE5F491D7FFBF96442F";
const nickname = "只是一颗蓝莓(ᗜ ˰ ᗜ) •";
const issueLog = `骰娘有点甜(QQ:3889000001) 2026/09/30 23:20:00
好神秘

${nickname}(${officialId}) 2026/09/30 23:20:34
（开始便秘）

${nickname}(${officialId}) 2026/09/30 23:27:21
几周前

梅林·赫尔墨斯(QQ:515537695) 2026/10/05 19:02:41
命运的车轮即将开始转动。`;

describe("editor log headers", () => {
  it("keeps all speakers and messages from sealdice-core#1828 separate", () => {
    const manager = new LogManager();
    const result = manager.parse(issueLog)!;

    expect(result.items.map(item => [item.nickname, item.IMUserId, item.message.trim()])).toEqual([
      ["骰娘有点甜", "QQ:3889000001", "好神秘"],
      [nickname, officialId, "（开始便秘）"],
      [nickname, officialId, "几周前"],
      ["梅林·赫尔墨斯", "QQ:515537695", "命运的车轮即将开始转动。"],
    ]);
    expect(result.charInfo.size).toBe(3);

    const exported = manager.exporters.editLog.doExport(result.items)!;
    const reparsed = manager.parse(exported.text)!;
    expect(reparsed.items).toEqual(result.items);
    expect(reparsed.charInfo).toEqual(result.charInfo);
  });

  it("keeps the official bot speaker separate after editing a message", () => {
    const manager = new LogManager();
    manager.syncChange(issueLog, [0, 0], [0, issueLog.length]);

    const start = manager.lastText.indexOf("几周前");
    const replacement = "几周前（补充）";
    const changed = manager.lastText.replace("几周前", replacement);
    manager.syncChange(changed, [start, start + "几周前".length], [start, start + replacement.length]);

    const items = manager.curItems.filter(item => !item.isRaw);
    expect(items).toHaveLength(4);
    expect(items[2].nickname).toBe(nickname);
    expect(items[2].IMUserId).toBe(officialId);
    expect(items[2].message.trim()).toBe(replacement);
    expect(items[0].message.trim()).toBe("好神秘");
  });

  it("highlights the same headers and speakers as the importer", () => {
    const result = new LogManager().parse(issueLog)!;
    const colors = ["#112233", "#445566", "#778899"];
    const characters = [...result.charInfo.values()].map((item, index) => ({ ...item, color: colors[index] }));
    const state = EditorState.create({
      doc: issueLog,
      extensions: generateLang(characters, {}),
    });
    const tree = ensureSyntaxTree(state, state.doc.length, 1000)!;
    const tokens: { from: number, to: number, style: string }[] = [];
    highlightTree(tree, { style: tags => highlightingFor(state, tags) }, (from, to, style) => {
      tokens.push({ from, to, style });
    });
    const styleAt = (text: string) => {
      const index = issueLog.indexOf(text);
      expect(index).toBeGreaterThanOrEqual(0);
      const token = tokens.find(token => token.from <= index && index < token.to);
      expect(token).toBeDefined();
      return token!.style;
    };

    const headerStyle = styleAt("骰娘有点甜");
    expect(styleAt(nickname)).toBe(headerStyle);
    expect(styleAt(officialId)).toBe(headerStyle);
    expect(styleAt("梅林·赫尔墨斯")).toBe(headerStyle);
    expect(styleAt("（开始便秘）")).toBe(styleAt("几周前"));
    expect(styleAt("几周前")).not.toBe(styleAt("好神秘"));
    expect(styleAt("几周前")).not.toBe(styleAt("命运的车轮"));
  });

  it.each([
    ["玩家(12345)", "玩家", "12345"],
    ["玩家(QQ:12345)", "玩家", "QQ:12345"],
    ["玩家<player@example.com>", "玩家", "player@example.com"],
    [`${nickname}(${officialId})`, nickname, officialId],
    ["玩家(123)(QQ:12345)", "玩家(123)", "QQ:12345"],
    ["玩家(外层(内层))(QQ:12345)", "玩家(外层(内层))", "QQ:12345"],
    ["玩家(左括号(QQ:12345)", "玩家(左括号", "QQ:12345"],
    ["玩家）(QQ:12345)", "玩家）", "QQ:12345"],
    ["玩家（备注）(QQ:12345)", "玩家（备注）", "QQ:12345"],
    ["名 字/备注(QQ:12345)", "名 字/备注", "QQ:12345"],
  ])("preserves nickname and account in %s", (header, expectedName, expectedId) => {
    const importer = new EditLogImporter(new LogManager());
    const text = `${header} 2026/9/3 1:2:03 #42\n发言`;
    expect(importer.check(text)).toBe(true);
    const result = importer.parse(text);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ nickname: expectedName, IMUserId: expectedId, message: "发言" });
    expect(result.items[0].time).toBeGreaterThan(0);
  });

  it("keeps account-free names distinct and supports time-only headers", () => {
    const importer = new EditLogImporter(new LogManager());
    const result = importer.parse("玩家甲 23:20:00\n第一条\n\n玩家乙 23:21:00\n第二条");
    expect(result.items.map(item => item.nickname)).toEqual(["玩家甲", "玩家乙"]);
    expect(result.items[0].IMUserId).not.toBe(result.items[1].IMUserId);
    expect(result.items.map(item => item.message.trim())).toEqual(["第一条", "第二条"]);
  });

  it("does not combine a nickname and timestamp on separate lines into a header", () => {
    const importer = new EditLogImporter(new LogManager());
    expect(importer.check("玩家(QQ:12345)\n23:20:00\n发言")).toBe(false);
  });

  it("supports Windows line endings without adding a newline to the message", () => {
    const importer = new EditLogImporter(new LogManager());
    const result = importer.parse(`${nickname}(${officialId}) 2026/09/30 23:20:00\r\n发言`);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ nickname, IMUserId: officialId, message: "发言" });
  });
});

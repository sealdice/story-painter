// QQ 官方消息的旧版表情标记。预览先 escapeHTML，因此同时识别原文和 HTML 转义形式。
// 只匹配 faceType 数字标记，不吞普通尖括号文本、@ 提及或相邻消息。
const raw = String.raw`<faceType\s*=\s*\d+\b[^<>]*>`;
const escaped = String.raw`&lt;faceType\s*=\s*\d+\b(?:(?!&(?:lt|gt);)[\s\S])*&gt;`;

export const qqOfficialFaceAtStart = new RegExp(`^(?:${raw}|${escaped})`);

export function stripQQOfficialFaces(message: string): string {
  return message.replace(new RegExp(`${raw}|${escaped}`, 'g'), '');
}

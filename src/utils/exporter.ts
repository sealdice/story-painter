import dayjs from "dayjs";
import { saveAs } from 'file-saver';
import { AlignmentType, Document, Packer, Paragraph, TextRun } from 'docx';
import { LogItem } from "~/logManager/types";
import { useStore } from "~/store";

// TODO: 移植到logMan/exporters
export function exportFileQQ(results: LogItem[], options: any = undefined) {
  const store = useStore();

  let text = ''
  for (let i of results) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    let timeText = i.time.toString()
    if (typeof i.time === 'number') {
      timeText = dayjs.unix(i.time).format(options.yearHide ? 'HH:mm:ss' : 'YYYY/MM/DD HH:mm:ss')
    }
    if (options.timeHide) {
      timeText = ''
    }
    let userid = '(' + i.IMUserId + ')'
    if (options.userIdHide) {
      userid = ''
    }
    text += `${i.nickname}${userid} ${timeText}\n${i.message.replaceAll('<br />', '\n')}`
  }

  saveAs(new Blob([text],  {type: "text/plain;charset=utf-8"}), '跑团记录(QQ风格).txt')
  return text
}

export function exportFileIRC(results: LogItem[], options: any = undefined) {
  const store = useStore();

  let text = ''
  for (let i of results) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    let timeText = i.time.toString()
    if (typeof i.time === 'number') {
      timeText = dayjs.unix(i.time).format(options.yearHide ? 'HH:mm:ss' : 'YYYY/MM/DD HH:mm:ss')
    }
    if (options.timeHide) {
      timeText = ''
    }
    let userid = '(' + i.IMUserId + ')'
    if (options.userIdHide) {
      userid = ''
    }
    text += `${timeText}<${i.nickname}${userid}>:${i.message.replaceAll('<br />', '\n')}`
  }

  saveAs(new Blob([text],  {type: "text/plain;charset=utf-8"}), '跑团记录(主流风格).txt')
  return text
}

export function exportFileRaw(doc: string) {
  saveAs(new Blob([doc],  {type: "text/plain;charset=utf-8"}), '跑团记录(未处理).txt')
}

export function exportFileDoc(html: string, options: any = undefined) {
  const text = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_WritingBug"

此文档为“单个文件网页”，也称为“Web 档案”文件。如果您看到此消息，但是您的浏览器或编辑器不支持“Web 档案”文件。请下载支持“Web 档案”的浏览器。

------=_NextPart_WritingBug
Content-Type: text/html; charset="utf-8"

<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
` + html +
`
</body>
</html>
------=_NextPart_WritingBug
Content-Transfer-Encoding: quoted-printable
Content-Type: text/xml; charset="utf-8"

<xml xmlns:o=3D"urn:schemas-microsoft-com:office:office">
 <o:MainFile HRef=3D"../file4969.htm"/>
 <o:File HRef=3D"themedata.thmx"/>
 <o:File HRef=3D"colorschememapping.xml"/>
 <o:File HRef=3D"header.htm"/>
 <o:File HRef=3D"filelist.xml"/>
</xml>
------=_NextPart_WritingBug--`

  saveAs(new Blob([text],  {type: "application/msword"}), '跑团记录.doc')
  return text
}

export interface DocxExportEntry {
  time?: string;
  timeColor?: string;
  nickname?: string;
  nicknameColor?: string;
  messageLines: string[];
  messageColor?: string;
}

function colorToDocx(color?: string): string | undefined {
  if (!color) return undefined;
  let value = color.trim();
  if (!value) return undefined;
  if (value.startsWith('#')) {
    value = value.slice(1);
    if (value.length === 3) {
      value = value.split('').map((char) => char + char).join('');
    }
    return value.toUpperCase();
  }
  const rgbMatch = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const hex = rgbMatch.slice(1, 4).map((segment) => {
      const n = Number(segment);
      if (Number.isNaN(n) || n < 0) {
        return '00';
      }
      return Math.min(255, n).toString(16).padStart(2, '0');
    }).join('');
    return hex.toUpperCase();
  }
  return undefined;
}

function buildDocxParagraphs(entry: DocxExportEntry): Paragraph[] {
  const lines = entry.messageLines && entry.messageLines.length > 0 ? [...entry.messageLines] : [''];
  const firstLine = lines.shift() ?? '';
  const timeText = (entry.time ?? '').trim();
  const nicknameText = (entry.nickname ?? '').trim();

  const timeColor = colorToDocx(entry.timeColor) ?? '666666';
  const nicknameColor = colorToDocx(entry.nicknameColor) ?? colorToDocx(entry.messageColor) ?? '333333';
  const messageColor = colorToDocx(entry.messageColor) ?? nicknameColor;

  const runs: TextRun[] = [];

  if (timeText) {
    runs.push(new TextRun({ text: timeText, color: timeColor }));
  }
  if (timeText && (nicknameText || firstLine)) {
    runs.push(new TextRun({ text: ' ' }));
  }
  if (nicknameText) {
    runs.push(new TextRun({ text: nicknameText, color: nicknameColor }));
  }
  if (nicknameText && firstLine) {
    runs.push(new TextRun({ text: ' ' }));
  }
  if (firstLine) {
    runs.push(new TextRun({ text: firstLine, color: messageColor }));
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text: '' }));
  }

  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: runs,
      spacing: { after: 120 },
      alignment: AlignmentType.LEFT,
    }),
  ];

  lines.forEach((line) => {
    if (!line) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: '' })],
        spacing: { after: 120 },
        alignment: AlignmentType.LEFT,
      }));
      return;
    }

    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: line, color: messageColor })],
      indent: { left: 720 },
      spacing: { after: 120 },
      alignment: AlignmentType.LEFT,
    }));
  });

  return paragraphs;
}

export function exportFileDocx(entries: DocxExportEntry[], filename = '跑团记录.docx') {
  const children = entries.length > 0
    ? entries.flatMap((entry) => buildDocxParagraphs(entry))
    : [new Paragraph({ children: [new TextRun({ text: '' })], alignment: AlignmentType.LEFT })];

  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBlob(document)
    .then((blob) => {
      saveAs(blob, filename);
      return blob;
    });
}

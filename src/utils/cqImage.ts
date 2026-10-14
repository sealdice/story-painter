// CQ 参数与 HTML 是两层转义：预览先还原 HTML，再还原 CQ，最后安全写入 src 属性。
export function decodeCqParameter(value: string): string {
  return value.replaceAll('&#44;', ',').replaceAll('&#91;', '[')
    .replaceAll('&#93;', ']').replaceAll('&amp;', '&');
}

export function encodeCqParameter(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('[', '&#91;')
    .replaceAll(']', '&#93;').replaceAll(',', '&#44;');
}

export function cqImageHtml(htmlEncodedUrl: string): string {
  const cqUrl = htmlEncodedUrl.replaceAll('&quot;', '"').replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
  const url = decodeCqParameter(cqUrl);
  if (!/^https?:\/\//.test(url) || /[\u0000-\u0020\u007f]/.test(url)) return '[图片]';
  const attribute = url.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<img style="max-width: 300px" src="${attribute}" />`;
}

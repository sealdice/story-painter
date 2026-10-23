import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();
function load(relative) {
  if (modules.has(relative)) return modules.get(relative);
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const exports = {};
  const localRequire = (name) => {
    if (name === './qqOfficialFace') return load('src/utils/qqOfficialFace.ts');
    if (name === './cqImage') return load('src/utils/cqImage.ts');
    if (name === './types' || name === './rkey') return {};
    throw new Error('Unexpected dependency: ' + name);
  };
  vm.runInNewContext(code, { exports, require: localRequire, URL }, { filename: relative });
  modules.set(relative, exports);
  return exports;
}
const { msgImageFormat } = load('src/utils/index.ts');
const { qqOfficialFaceAtStart } = load('src/utils/qqOfficialFace.ts');
const builtIn = '<faceType=1,faceId="424",ext="eyJ0ZXh0Ijoi57ut5qCH6K+GIn0=">';
const custom = '<faceType=6,faceId="0",ext="eyJ0ZXh0IjoiIn0=">';
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

test('标准 CQ 图片链接只解一层 CQ 转义，HTML 预览不破坏查询参数', () => {
  const code = '[CQ:image,file=https://example.test/img?a=1&amp;b=2&#44;3&#91;4&#93;]';
  assert.equal(msgImageFormat(escape(code), { imageHide: false }, true),
    '<img style="max-width: 300px" src="https://example.test/img?a=1&amp;b=2,3[4]" />');
  assert.equal(msgImageFormat(code, { imageHide: false }), code);
  const { cqImageHtml } = load('src/utils/cqImage.ts');
  assert.equal(cqImageHtml('javascript:alert(1)'), '[图片]');
  assert.equal(cqImageHtml('https://example.test/img&quot;onerror=&quot;alert(1)'),
    '<img style="max-width: 300px" src="https://example.test/img&quot;onerror=&quot;alert(1)" />');
});

test('更新图片 rkey 时正确解析与保留标准 CQ 参数', () => {
  const { applyQQImageRKeyReplacement } = load('src/utils/rkey.ts');
  const message = '[CQ:image,file=https://multimedia.nt.qq.com.cn/x?appid=1407&amp;foo=bar&amp;rkey=old]';
  const result = JSON.parse(applyQQImageRKeyReplacement(JSON.stringify({ items: [{ message }] }),
    { group_rkey: 'new-key' }));
  assert.equal(result.items[0].message,
    '[CQ:image,file=https://multimedia.nt.qq.com.cn/x?appid=1407&amp;foo=bar&amp;rkey=new-key]');
});

test('过滤开关覆盖原文、纯文本导出和 HTML 转义后的各类预览', () => {
  for (const encode of [(x) => x, escape]) {
    for (const html of [false, true]) {
      assert.equal(msgImageFormat(encode('前' + builtIn + '中' + custom + '后'),
        { imageHide: true }, html), '前中后');
      assert.equal(msgImageFormat(encode(builtIn + custom), { imageHide: true }, html), '');
    }
  }
});
test('关闭过滤不改表情正文', () => {
  for (const encode of [(x) => x, escape]) {
    for (const html of [false, true]) {
      const text = encode('前' + builtIn + custom + '后');
      assert.equal(msgImageFormat(text, { imageHide: false }, html), text);
    }
  }
});
test('不误删普通尖括号、提及、无效或未闭合标记', () => {
  for (const value of ['<调查员>', '<@123>', '<faceType=not-a-number>',
    '<faceType=6oops,faceId="0">', '<faceType=6,faceId="0"', '&lt;faceType=6']) {
    assert.equal(msgImageFormat(value, { imageHide: true }), value);
  }
});
test('与原有 CQ、mirai、图片过滤一起工作', () => {
  assert.equal(msgImageFormat('a[CQ:image,file=x]b' + custom +
    'c[CQ:face,id=424]d[mirai:image:foo]e[图:https://example.test/x]f',
    { imageHide: true }), 'abcdef');
});
test('编辑器染色只匹配当前位置的完整表情代码', () => {
  for (const marker of [builtIn, custom, escape(builtIn), escape(custom)]) {
    assert.equal(qqOfficialFaceAtStart.exec(marker + '后')[0], marker);
    assert.equal(qqOfficialFaceAtStart.exec('前' + marker), null);
  }
});

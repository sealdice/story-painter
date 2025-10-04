<template>
  <div v-show="isShow">
    <div class="preview" id="preview-bbs-pineapple">
      <div style="position: absolute; right: 2rem; direction: rtl;">
        <n-button secondary type="primary" @click="copied" id="btnCopyPreviewBBSPineapple" style="z-index: 100">一键复制</n-button>
        <div class="mt-0.5 text-xs">注意: 长文本速度较慢</div>
      </div>

      <div v-if="formattedItems.length === 0">
        <div>染色失败，内容为空或无法识别此格式。</div>
        <div>已知支持的格式有: 海豹Log(json)、赵/Dice!原始文件、塔原始文件</div>
        <div>请先清空编辑框，再行复制</div>
      </div>

      <VirtualList class="list-dynamic scroll-touch scroller"
                   :data-key="'index'"
                   :data-sources="formattedItems"
                   :data-component="Item"
                   :estimate-size="24"
                   :item-class="''" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ClipboardJS from 'clipboard';
import { computed, nextTick, onBeforeUnmount, watch } from 'vue';
import { useStore } from '~/store';
import { LogItem, packNameId } from '~/logManager/types';
import { useMessage } from 'naive-ui';
// @ts-ignore
import VirtualList from 'vue3-virtual-scroll-list';
import Item from './preview-bbs-pineapple-item.vue';
import { escapeHTML, msgAtFormat, msgCommandFormat, msgImageFormat, msgIMUseridFormat, msgOffTopicFormat } from '~/utils';

const props = defineProps<{
  isShow: boolean,
  previewItems: LogItem[],
}>();

const store = useStore();
const message = useMessage();

let clip: ClipboardJS | null = null;

const copied = () => {
  message.success('进行了复制！');
};
const decodeHTML = (text: string) => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || '';
};

const nameReplace = (msg: string) => {
  for (const pc of store.pcList) {
    msg = msg.replaceAll(`<${pc.name}>`, `${pc.name}`);
  }
  return msg;
};

const colorByName = (item: LogItem, map = store.pcMap): string => {
  const info = map.get(packNameId(item));
  if (store.bbsUseColorName) {
    const color = store.colorHexToName(info?.color || '#ffffff');
    return color || 'silver';
  }
  return info?.color || '#ffffff';
};

const nicknameSolve = (item: LogItem) => {
  const options = store.exportOptions;
  let userId = `(${item.IMUserId})`;
  if (options.userIdHide) {
    userId = '';
  }
  return `<${item.nickname}${userId}>`;
};
const normalizeMessage = (item: LogItem) => {
  const options = { ...store.exportOptions, imageHide: true };
  let msg = msgImageFormat(escapeHTML(item.message), options);
  msg = msgAtFormat(msg, store.pcList);
  msg = msgOffTopicFormat(msg, store.exportOptions, item.isDice);
  msg = msgCommandFormat(msg, store.exportOptions);
  msg = msgIMUseridFormat(msg, store.exportOptions, item.isDice);
  msg = msgOffTopicFormat(msg, store.exportOptions, item.isDice);
  if (item.isDice) {
    msg = nameReplace(msg);
  }
  msg = msg.replaceAll('<br />', '\n')
           .replaceAll('<br/>', '\n')
           .replaceAll('<br>', '\n')
           .replace(/\r\n/g, '\n');
  msg = decodeHTML(msg);
  return msg.trim();
};

type PineappleBlock = {
  key: string;
  name: string;
  color: string;
  lines: string[];
};

const formattedItems = computed(() => {
  const map = store.pcMap;
  const blocks: PineappleBlock[] = [];
  let current: PineappleBlock | null = null;

  for (const entry of props.previewItems) {
    if (entry.isRaw) continue;
    if (store.isHiddenLogItem(entry)) continue;

    const text = normalizeMessage(entry);
    if (!text) continue;

    const key = `${entry.nickname}-${entry.IMUserId}`;
    if (current && current.key === key) {
      current.lines.push(text);
      continue;
    }

    if (current) {
      blocks.push(current);
    }

    current = {
      key,
      name: nicknameSolve(entry),
      color: colorByName(entry, map),
      lines: [text],
    };
  }

  if (current) {
    blocks.push(current);
  }

  return blocks.map((block, index) => ({
    index,
    text: `[color=silver]${block.name}[/color][color=${block.color}] ${block.lines.join('\n')} [/color]`,
  }));
});
watch(() => props.isShow, (val) => {
  if (!val) return;
  store.exportOptions.imageHide = true;

  nextTick(() => {
    if (clip) return;
    clip = new ClipboardJS('#btnCopyPreviewBBSPineapple', {
      text: () => formattedItems.value.map((item) => item.text).join('\n'),
    });
  });
});

onBeforeUnmount(() => {
  if (clip) {
    clip.destroy();
    clip = null;
  }
});
</script>

<script setup lang="ts">
import { NSwitch, NGrid, NGridItem } from 'naive-ui';
import { useStore } from '~/store';

const option_store = useStore().exportOptions
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({ disableTransition: false })

interface Option {
  label: string
  desc: string
  key: keyof typeof option_store
}

const list: Option[] = [
  {
    label: "骰子指令过滤",
    desc: "开启后，不显示pc指令，正常显示指令结果",
    key: 'commandHide',
  },
  {
    label: "表情图片过滤",
    desc: "开启后，文本内所有的表情包和图片将被豹豹藏起来不显示",
    key: 'imageHide',
  },
  {
    label: "场外发言过滤",
    desc: "开启后，所有以(和（为开头的发言将被豹豹吃掉不显示",
    key: 'offTopicHide',
  },
  {
    label: "时间显示过滤",
    desc: "开启后，日期和时间会被豹豹丢入海里不显示",
    key: 'timeHide',
  },
  {
    label: "平台帐号隐藏",
    desc: "开启后，IM 平台账号（如 QQ 号）将在导出结果中不显示",
    key: 'userIdHide',
  },
  {
    label: "年月日不展示",
    desc: "开启后，导出结果的日期将只显示几点几分(如果可能)",
    key: 'yearHide',
  },
  {
    label: "首行缩进对齐",
    desc: "开启后，缩进将以名字为基准进行对齐",
    key: 'textIndentAll',
  },
]
</script>

<template>
  <n-grid cols="1 640:2" :x-gap="24" :y-gap="8" responsive="screen">
    <n-grid-item v-for="opt in list">
      <label class="flex items-center justify-between gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-accent cursor-pointer">
        <span>
          <span class="block text-sm font-medium">{{ opt.label }}</span>
          <span class="block text-xs text-muted-foreground mt-0.5">{{ opt.desc }}</span>
        </span>
        <n-switch v-model:value="option_store[opt.key]" />
      </label>
    </n-grid-item>
    <n-grid-item>
      <label class="flex items-center justify-between gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-accent cursor-pointer">
        <span>
          <span class="block text-sm font-medium">深色模式</span>
          <span class="block text-xs text-muted-foreground mt-0.5">开启后，以深色模式展示，适合夜间使用</span>
        </span>
        <n-switch v-model:value="isDark" @on-update:value="useToggle" />
      </label>
    </n-grid-item>
  </n-grid>
</template>

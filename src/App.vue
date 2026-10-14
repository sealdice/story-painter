<script setup lang="ts">
import Main from "~/Main.vue";
import { darkTheme, lightTheme } from "naive-ui";
import type { GlobalThemeOverrides } from "naive-ui";
import { computed } from "vue";

import { useDark } from '@vueuse/core'

const isDark = useDark({ disableTransition: false })

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const dark = isDark.value
  return {
    common: {
      primaryColor: '#18a058',
      primaryColorHover: '#36ad6a',
      primaryColorPressed: '#0c7a43',
      primaryColorSuppl: '#36ad6a',
      infoColor: dark ? '#70c0e8' : '#2080f0',
      infoColorHover: dark ? '#8acbec' : '#4098fc',
      infoColorPressed: dark ? '#66afd3' : '#1060c9',
      infoColorSuppl: dark ? '#70c0e8' : '#2080f0',
      errorColor: dark ? '#f87171' : '#ef4444',
      errorColorHover: dark ? '#fca5a5' : '#dc2626',
      errorColorPressed: dark ? '#ef4444' : '#b91c1c',
      errorColorSuppl: dark ? '#f87171' : '#ef4444',
      successColor: dark ? '#4ade80' : '#22c55e',
      warningColor: dark ? '#facc15' : '#eab308',
      borderRadius: '6px',
      borderRadiusSmall: '4px',
      fontFamily: "Inter, system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      fontWeightStrong: '600',
      borderColor: 'hsl(var(--border))',
      dividerColor: 'hsl(var(--border))',
    },
  }
})
</script>

<template>
  <n-config-provider :theme="isDark ? darkTheme : lightTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-modal-provider>
        <n-notification-provider>
          <Main/>
        </n-notification-provider>
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>

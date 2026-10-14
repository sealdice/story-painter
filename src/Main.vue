<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-40 h-14 border-b bg-background">
      <div class="mx-auto flex h-full max-w-[1100px] items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <img :src="logoUrl" alt="海豹" class="h-7 w-7 shrink-0 object-contain" />
          <h1 class="text-lg font-bold tracking-tight text-brand-600 dark:text-brand-400">海豹TRPG</h1>
          <n-tag size="small" :bordered="false" type="primary">v2.5.5</n-tag>
        </div>
        <div class="flex items-center gap-2">
          <n-button quaternary size="small" @click="toggleDark()" :title="isDark ? '切换至亮色模式' : '切换至深色模式'"
            :aria-label="isDark ? '切换至亮色模式' : '切换至深色模式'">
            <template #icon>
              <n-icon>
                <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </n-icon>
            </template>
            <span class="hidden sm:inline">{{ isDark ? '亮色' : '深色' }}</span>
          </n-button>
          <n-button quaternary size="small" square tag="a" href="https://github.com/sealdice/story-painter"
            target="_blank" :title="'GitHub'" :aria-label="'GitHub'">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="currentColor"
                    d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" />
                </svg>
              </n-icon>
            </template>
          </n-button>
          <n-button quaternary size="small" tag="a" href="https://www.sealdice.com" target="_blank"
            :title="'海豹官网'" :aria-label="'海豹官网'">
            <template #icon>
              <n-icon><launch /></n-icon>
            </template>
            官网
          </n-button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1100px] px-4 py-6 space-y-6 pb-12">
      <div class="flex flex-wrap items-center justify-between gap-3 animate-fade-in">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">跑团日志着色</h2>
          <p class="text-sm text-muted-foreground">粘贴或导入跑团日志，自动识别角色并染色，支持多种格式预览与导出</p>
          <p class="mt-2 text-sm text-brand-600 dark:text-brand-400">SealDice骰QQ群 524364253 [群介绍中有其余3群]</p>
        </div>
      </div>

      <section class="dn-card animate-fade-in">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="dn-card-title">渲染选项</h3>
            <p class="dn-card-desc">控制预览与导出内容的显示细节</p>
          </div>
          <n-button quaternary size="small" class="self-start"
            @click="renderOptionsExpanded = !renderOptionsExpanded" :aria-expanded="renderOptionsExpanded">
            <template #icon>
              <n-icon><chevron-up v-if="renderOptionsExpanded" /><chevron-down v-else /></n-icon>
            </template>
            {{ renderOptionsExpanded ? '收起' : '展开' }}
          </n-button>
        </div>
        <n-collapse-transition :show="renderOptionsExpanded">
          <div class="pt-4">
            <option-view></option-view>
          </div>
        </n-collapse-transition>
      </section>

      <n-spin :show="loading">
        <template #description>
          正在试图加载远程记录……
        </template>
        <div class="space-y-6">
          <section class="dn-card animate-fade-in">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="dn-card-title">
                  角色列表
                  <n-tag size="small" :bordered="false">{{ store.pcList.length }}</n-tag>
                </h3>
                <p class="dn-card-desc">修改角色名称、类型与颜色，颜色将同步到预览与导出</p>
              </div>
              <div class="flex items-center gap-2 ml-auto self-start">
                <n-tooltip placement="top-end">
                  <template #trigger>
                    <n-button size="small" @click="refreshColors">刷新色板</n-button>
                  </template>
                  重新随机生成颜色选择中的预置颜色
                </n-tooltip>
                <n-button quaternary size="small" class="self-start"
                  @click="charactersExpanded = !charactersExpanded" :aria-expanded="charactersExpanded">
                  <template #icon>
                    <n-icon><chevron-up v-if="charactersExpanded" /><chevron-down v-else /></n-icon>
                  </template>
                  {{ charactersExpanded ? '收起' : '展开' }}
                </n-button>
              </div>
            </div>
            <n-collapse-transition :show="charactersExpanded">
              <div class="pc-list pt-4">
                <div v-for="(i, index) in store.pcList" :key="i.IMUserId + '-' + index" class="pc-card">
                  <label class="pc-field">
                    <span class="pc-field-label">姓名</span>
                    <n-input :disabled="isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG"
                      v-model:value="i.name" :prefix-icon="User" @focus="nameFocus(i)" @change="nameChanged(i)" />
                  </label>

                  <label class="pc-field">
                    <span class="pc-field-label">平台账号</span>
                    <n-input :disabled="true" v-model:value="i.IMUserId" />
                  </label>

                  <label class="pc-field">
                    <span class="pc-field-label">类型</span>
                    <n-select v-model:value="i.role"
                      :options="[{ value: '主持人', label: '主持人' }, { value: '角色', label: '角色' }, { value: '骰子', label: '骰子' }, { value: '隐藏', label: '隐藏' }]" />
                  </label>

                  <label class="pc-field">
                    <span class="pc-field-label">颜色</span>
                    <n-color-picker v-model:value="i.color" :show-alpha="false" show-preview
                      :swatches="colors" :on-update:value="(v: string) => colorChanged(v, i)" />
                  </label>

                  <n-button class="pc-delete" type="error" size="small" secondary @click="deletePc(index, i)"
                    :disabled="isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG">
                    <template #icon><n-icon><icon-delete /></n-icon></template>
                    删除
                  </n-button>
                </div>
                <n-empty v-if="store.pcList.length === 0" description="导入或粘贴日志后，将在这里显示识别到的角色" />
              </div>
            </n-collapse-transition>
          </section>

          <section class="dn-card animate-fade-in">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 class="dn-card-title">日志编辑</h3>
                <p class="dn-card-desc">在编辑器中粘贴日志文本，自动解析并染色；勾选下方选项切换预览</p>
              </div>
              <n-flex size="small" wrap class="items-center">
                <n-checkbox label="预览" v-model:checked="isShowPreview" @click="previewClick('preview')" />
                <n-checkbox label="论坛代码" v-model:checked="isShowPreviewBBS" @click="previewClick('bbs')" />
                <n-checkbox label="论坛代码(内容多行)" v-model:checked="isShowPreviewBBSPineapple"
                  @click="previewClick('bbspineapple')" />
                <n-checkbox label="回声工坊" v-model:checked="isShowPreviewTRG" @click="previewClick('trg')" />
              </n-flex>
            </div>

            <code-mirror v-show="!(isShowPreview || isShowPreviewBBS || isShowPreviewBBSPineapple || isShowPreviewTRG)"
              ref="editor" @change="onChange">
              <div class="z-50 absolute right-2 flex flex-col items-center gap-1">
                <n-button size="small" secondary type="primary" @click="clearText" id="btnCopyPreviewBBS" class="w-full">
                  清空内容
                </n-button>
                <n-button size="small" secondary type="primary" @click="doFlush" class="w-full">强制刷新</n-button>
                <n-checkbox label="编辑器染色" v-model:checked="store.doEditorHighlight" :border="false" class="w-full"
                  @click.native="doEditorHighlightClick($event)" />
              </div>
            </code-mirror>

            <n-message-provider>
              <preview-main :is-show="isShowPreview" :preview-items="previewItems"></preview-main>
              <preview-bbs :is-show="isShowPreviewBBS" :preview-items="previewItems"></preview-bbs>
              <preview-bbs-pineapple :is-show="isShowPreviewBBSPineapple"
                :preview-items="previewItems"></preview-bbs-pineapple>
              <preview-trg :is-show="isShowPreviewTRG" :preview-items="previewItems"></preview-trg>
            </n-message-provider>
          </section>

          <section class="dn-card animate-fade-in">
            <div class="mb-4">
              <h3 class="dn-card-title">导出</h3>
              <p class="dn-card-desc">将日志导出为原始文本或带格式的文档</p>
            </div>
            <n-flex size="small" wrap>
              <n-button type="primary" @click="exportRecordRaw">下载原始文件</n-button>
              <!-- <n-button secondary type="primary" v-show="false" @click="exportRecordQQ">下载QQ风格记录</n-button>-->
              <!-- <n-button secondary type="primary" v-show="false" @click="exportRecordIRC">下载IRC风格记录</n-button>-->
              <n-button secondary type="primary" @click="exportRecordDOC">下载带图doc</n-button>
              <n-button secondary type="primary" @click="exportRecordTalkDOC">下载对话doc</n-button>
              <n-button secondary type="primary" @click="exportRecordDocx">下载docx</n-button>
            </n-flex>
          </section>
        </div>
      </n-spin>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, watch, h, render, renderList, computed } from "vue";
import { useStore } from './store'
import CodeMirror from './components/CodeMirror.vue'
import { debounce, delay } from 'lodash-es'
import { exportFileRaw, exportFileQQ, exportFileIRC, exportFileDoc, exportFileDocx } from "./utils/exporter";
import type { DocxExportEntry } from "./utils/exporter";
import { strFromU8, unzlibSync } from 'fflate';
import uaParser from 'ua-parser-js'

import { logMan } from './logManager/logManager'
import { ViewUpdate } from "@codemirror/view";
import { TextInfo } from "./logManager/importers/_logImpoter";
import previewMain from "./components/previews/preview-main.vue";
import previewBbs from "./components/previews/preview-bbs.vue";
import previewBbsPineapple from "./components/previews/preview-bbs-pineapple.vue";
import previewTrg from "./components/previews/preview-trg.vue";
import PreviewItem from './components/previews/preview-main-item.vue'
import PreviewTableTR from './components/previews/preview-table-tr.vue'
import { LogItem, CharItem, packNameId } from "./logManager/types";
import { setCharInfo } from './logManager/importers/_logImpoter'
import { applyQQImageRKeyReplacement, shouldApplyQQImageRKeyReplacement, msgCommandFormat, msgImageFormat, msgIMUseridFormat, msgOffTopicFormat, msgAtFormat } from "./utils";
import { NButton, NText, useMessage, useModal, useNotification } from "naive-ui";
import { User, Delete as IconDelete, ChevronDown, ChevronUp, Launch } from '@vicons/carbon'
import { useDark, useToggle } from '@vueuse/core'
import OptionView from "./components/OptionView.vue";
import randomColor from "randomcolor";

import { parquetReadObjects } from 'hyparquet'
import { asyncBufferFrom } from 'hyperparam'
import { compressors } from 'hyparquet-compressors'

const logoUrl = 'data:image/webp;base64,UklGRrwLAABXRUJQVlA4WAoAAAAQAAAAeAEAcQEAQUxQSPECAAABoFBbT11higQkIAEJkVAJSKiESKiESKiESEACEnCQ/zFTKO1d95snETEB9OzAWQ4zq/4FVzM7JHOgjx/zYc2/czty/Fgxa/Uvv505fp64FwdhkfRJwl4cimWPH4LVAXnyB8jFQVnzy+XqwKz5xXJ1cNb8UlwcoIVfKKiD9IxvszeHadtfJZpD1eJ7bM3B2vJLBHXAaniDWByyJT2Pm4O2bU/LDtz8LHHo6pPUwavPUYevPkUdwPoMdQjrE9RBrPPtDmOZLTuQ81ypIcnTTKE5lFuYyBzMZR5xOB+zsAOa5wgVUS1McTikzxnYQb1NUFFVw23isJa7YsOVx5vUgX3eEx3afIthy+5gBzffoOiycdHhnYYpvnRUaPjyMGh3gO+DCsLqmOQQT0MOjOmQirE2IjnItwEHyo4BBWW1LzrMY1fGWe5SnGlXwVntCQ700MFI444dadJxIO3sMKRZR0OadzjsEtb4Ev9NLl/asSaXZPlv+W/5b/lv+W/5b/lv+W/5b/lv+W/5b/lv+W/5b/lv+W/5b/lv+W8pz/7mx3+Tq7jzS/R3uXjJsMaXTtwJ1uQS4y5i7bxEFWp27YRavbZDza8lrIVLVKHG1xRq27UNanKNGtKODkWadWxIqx1UgeY9B9JiR0Qad9AJtL2HgSY9ZDizrow7qjDzvg1nsYsMZtzHMNv7SFEmA0IDmQ2gHWRlBBnGfEhsGEsjaMcYD6ETYjImVITpGEoIs0GUAdZG0YEvD6NI8cXDQoFXHkahoEvGUSjgshsoFGzVOygUaPktFAq0+BYiRVa+iQRYchdtDVZ2G6WCqnIfhQNUPgHR1jCVZqBwQmqbgogroGQSCtLgdM5CFBVNdR6iqFjymYiiQomnIgpScZQnI6LtRJHMRxTyCSF7AhGFrBU+9SG/p6wFOv6gP0ybqBXQ8MMuJv6a5Q/VzKw+bH+LLz4x8yYiYmY21wGfgcy8iYia2U2Gp97AzLvIYWZdDV29kXkTkdOsuUcAVlA4IKQIAAAwUACdASp5AXIBPlEokkWjoqITyeQEOAUEtLdwup8Aeh+vc7j/ql/kfol8p/8z569RyVuYW+/Gg3sB4AX4t/IN3RAB+W/2n0KZpuJ3hNzLX0751vqn2DP5n/eOsh+4vsefsmJ1+A8domycOsz2VyL5A4FLD9KxnL4i7n0+ydaiXoJbo11S8aVyEHStGm9WfBYTlGjXVLxpXIvkDOl6vQ6HvGlci+QOBUPeETN40rkXyBwKh7xpAfGkKFVNa81fiXHeccNF9QQuGdTffqEpotp74MNRf4kU/qV+Z6i5npXrtccD0qGPrjR4JUUlzxZpBtDSoaLoJSHHiKD3DxB9OSyv+OnEuFr//BFV0XLkKKwla5urAvG6MxYjHuOdDCGh7u9rftJ+D4HbVay3RrkE81K63q+KAVE2h6i5m9SypjHuKqQ58/u9uEsSvlZW0c9sNSpQP+ChdRGm6TdgHZvgsSPRntlUySM3k15DmOYpa829ywcYg8h0qHS1w4aUqdiakii1TN40eReM9vgbsaaMHDl9T6UCfUfnz6LCYAjDcsjqfIhurkWqZvGO73hKPIvjXVaFpgvfteLHouZ7ID40qtDoajjbK5F6+bNgCzXRaaGPUws7giE/MIqD9ghrYyoeEqh7ex/1G60CBowkhoX13y5YSTiAMz13C+5nsgPjSvMHlXSEqYmlDEvM3//qqMgXy0AJhO9KoeUKomIlDCg/EKL5A4FTeZua6NcohbK5F8gcCoe8aVwaHwovkDgVD3jSuRZ6XEpALBGpNsKL5A4FQ940rkWpomzyFKglujXVLxpXIvjVRzO0+b/7P9HsrkXyBwKh7wiZhfLtagFcbkhKFxQCuNyQlCzQEP6cgAD+/FE7/i+2umACy6bSi7X/F93/rdgTusAAVV4AC0XnNqN8ZFHgjgAiGTFddtEVifJCWtz2MZALfajWHHLQ5/956ZgKBppt50foAgcGVl3Yg6mD0GfNs9cxCpwaL58uFwIfQItH7gx3wjzyHYr1sdqQHl3txMG9wL8jU3Vlh2ImiKV2WRqhhYxUVnMdra1savkkgTZYS8+9DH6z6AE3sdfmOHHL3uK3a4yl69YRa4Vc9YLl7ECbLQqPBhAM/fn/WwgyHDJtndqjBzZjcYktlbgog7YxAhPT6hxzoYck+5tTqKmwZQqZVuW4/3PrjRb2Fx8b2oB5NiEaIa/h0khgUSDHvoXvHmojowsn8vZ79AVp/IkIGevVs2b029KSmIZVxMhURzUpZ/9mZnnx2ns5F9ZSs+9xXZP2nomQPSOMI7NWD4FQLWV+6Jrx1CXOJfIFCjqyStxdvcCXpz2hNv0xDt83LDsP2/AmmxPElE7i7DtZq2iOTfJ/mlMtzJzNPGt0IbEPIZoybtUVbM8kUqbdNyb+AgfltjrCkOpq3/yga3ruHEHaQxzjd7l6gLnRiWmW2wAuGcVlcUYJKF81RdlzUV++miTEqKI/KsqZZRRevcvCi/ZzIuFHDpgf9Ri1Qq8RiI9wf3Q7m/Anqu7gfTZY/IUaEnE2PbcZikaYjSi3sUrL+qeM9gfAfQSa/JKOcxL9YeSNjI/raiYp5iSaXALJ3lJghebXGkqndadME//ZmWeFuM76xigwIEG1A01BjPbvxASg+On73yoi3WP6QRB90cCJ3/U+IktHrj3xQ/D8t7A3tQ2aMu9+O0DfPKRn4DafZqiwk6jwhrcCmSawUj28Hg+FcE3e3V9XcVt8Pxp7/Q1HGriMzXBl4COQ8P8bcQjQ9pGlJSyZK81lrenZu4vAngj4sFqJjjHCs9UnKatZGlDdurt6Had0/X1m9jDU5aWrPehFtyYxU5l26gTY4oprge023aa9JbXXPaUk5ga4jH/hX78JM8Izrcy9qLuOQGcpopjegnbz+U9JWy9oj6ip1W9wc4kcm8pnFXc2MreWVCO1GkWP6NuRJtqojb1uvqIz/hgk8hyHP1TU2+RSLXHVDPzFEPd2FbVRsOhoEHvFz3rmc0rc4sb4/kbok2WncjJtZL5QHm4riB+jT6oshzFib3E8AfZHoKZTGDjCyjaneHPXMPPtFrzVJgUk6uHzqOajiqywfv9qN0ksy/lJH+rF0Eq37CzA6Z9d4aoJV00wA22rEGoaZ7lRLlQlpydPHd3H0HvkZF6LSIxqcYBubwvihLV8F4V4d206+9NnGsoUXX8/t/YpPK+Dk7llKIYuk59R2i9mpJy1Clqa8mik7J3ppTX514Jx5Js/YqkU6KMazJS2+4lGGu6rqtO3DvUWnJIdgACZnImp9pgP5n7MNdYAazLd0IXyQ6ntwuvrk9Yw67i/r2Dk6/QI9PRAaCoWP7AHKTmUBAZiWVhcscMX893Y+T5LjxHvW47lL62zZ4Pbg7KsTPuI5fGItku2UXPs3TYx9YrNGstS4GUQQIsfkpDgEu6CO+nlSWTS3Ls2TGJvyZtSnZKGFfb6Gx9v9EdFXFeoOuBa4vDQ54VkqMxsZqw48s3ZV+nDz91BzKVmFYjuiKVmX+D+Mk50/4B2sKMW4v1C0H1+d5Ne/hsKkffpeiPpIjVZcUbw3JBp3dKRIEvDIi40IrkMnx9wzIIBVg36Lmqmc74llfbQQC3T/mnOVAuggpVg6KxOVCul+p+i9/Nw/iW1P+WcdzF2108Z7Y4Sq7iplLeMwWa5PP4g1WfRB7fMCxnwcwg8kWpT+bXxDY+38eMYaVdLuo5kIWSmJfMenT0XW62p8re3cxU2sPNmV6xaXO69fbY7ewAITfslwn8mPokFXCeeLGzbvuUoND8I2KxIIrEFmWAIsWquQ7+xN8J6ZpJgy7W7XkPxncXxG6IB1SCJdFatvv5JJFtEDRAMsDlE9+ROlhQzmrK4UwnQgPHiP+97VrFl4Hlwo4In2qWSp/ZMG4YaVDwZyKm0oxvx/BbcS0stkDUPA2r/P4uWRAAAAAQPj4AAAAAAAAAA'


const isDark = useDark()
const toggleDark = useToggle(isDark)

// 不用他了 虽然很不错，但是没有屏幕取色
// import { ColorPicker } from 'vue-color-kit'
// import 'vue-color-kit/dist/vue-color-kit.css'

const message = useMessage()
const modal = useModal()
const notification = useNotification()

const loading = ref<boolean>(false)

const isMobile = ref(false)
const downloadUsableRank = ref(0)

const isShowPreview = ref(false)
const isShowPreviewBBS = ref(false)
const isShowPreviewBBSPineapple = ref(false)
const isShowPreviewTRG = ref(false)
const renderOptionsExpanded = ref(false)
const charactersExpanded = ref(false)

const colors = ref<string[]>([])
const refreshColors = () => {
  colors.value = randomColor({ count: 16 })
  message.success("色板刷新成功！", { duration: 800 })
}

const colorChanged = debounce((v: string, i: CharItem) => {
  i.color = v
  store.pcNameColorMap.set(i.name, v)
  store.colorMapSave();
}, 300)

const backV1 = () => {
  // 预留：官网跳转
}

// 清空文本
const clearText = () => {
  store.editor.dispatch({
    changes: { from: 0, to: store.editor.state.doc.length, insert: '' }
  })
}

const doFlush = () => {
  console.log('flush')
  logMan.flush();
}

const previewClick = (mode: 'preview' | 'bbs' | 'bbspineapple' | 'trg') => {
  switch (mode) {
    case 'preview':
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      break;
    case 'bbs':
      isShowPreview.value = false
      isShowPreviewBBSPineapple.value = false
      isShowPreviewTRG.value = false
      store.exportOptions.imageHide = true
      break;
    case 'bbspineapple':
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewTRG.value = false
      store.exportOptions.imageHide = true
      break;
    case 'trg':
      isShowPreview.value = false
      isShowPreviewBBS.value = false
      isShowPreviewBBSPineapple.value = false
      store.exportOptions.imageHide = true
      break;
  }
  showPreview();
}

function setupUA() {
  const parser = new uaParser.UAParser()
  parser.setUA(navigator.userAgent)
  const deviceType = parser.getDevice()

  const browser = parser.getBrowser().name
  downloadUsableRank.value = 1

  isMobile.value = deviceType.type === 'mobile'
  if (deviceType.type === 'mobile') {
    // 经测可以使用的
    switch (browser) {
      // case '360 Browser': // 手机360 但是手机360无特征，自己是Chrome WebView
      // 手机:X浏览器 Chrome WebView无特征
      case 'Edge':
      case 'Chrome':
      case 'Chromium':
      case 'Firefox':
      case 'MIUI Browser':
      case 'Opera':
        downloadUsableRank.value = 2
    }

    // 经测无法使用的
    switch (browser) {
      case 'baiduboxapp': // 手机:百度浏览器
      case 'QQBrowser': // 手机:搜狗浏览器极速版，手机:QQ浏览器
      // 手机:万能浏览器，Chrome WebView无特征，会直接崩溃
      case 'UCBrowser': // 手机:UC浏览器
      case 'Quark': // 手机:夸克
      // 手机:Via浏览器，Chrome WebView无特征，会直接崩溃
      case 'QQ': // 手机:QQ
      case 'WeChat':
        downloadUsableRank.value = 0
    }
  }
}

setupUA()

const applyQQImageRKey = async (text: string) => {
  if (!shouldApplyQQImageRKeyReplacement(text)) {
    return text
  }

  try {
    const payload = await store.tryFetchRKey()
    return applyQQImageRKeyReplacement(text, payload)
  } catch (e) {
    console.log(e)
    return text
  }
}

const browserAlert = () => {
  if (downloadUsableRank.value === 0) {
    message.warning('你目前所使用的浏览器无法下载文件，请更换对标准支持较好的浏览器。建议使用Chrome/Firefox/Edge')
  }
  if (downloadUsableRank.value === 1) {
    if (isMobile.value) {
      message.warning('你目前所使用的浏览器可能在下载文件时遇到乱码，或无法下载文件，最好更换对标准支持较好的浏览器。建议使用Chrome/Firefox/Edge')
    }
  }
  // 2 不做提示 因为兼容良好
}

onMounted(async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as any)
  })
  const key = (params as any).key
  const password = location.hash.slice(1)

  const showHl = () => {
    setTimeout(() => {
      if (!isMobile.value) {
        store.doEditorHighlight = true
        store.reloadEditor()
      }
    }, 1000)
  }

  if (key && password) {
    loading.value = true
    try {
      const record = await store.tryFetchLog(key, password) as {
        client: 'SealDice' | 'Parquet',
        created_at: string,
        data: string,
        name: string,
        note: string,
        updated_at: string,
      }

      switch (record.client) {
        case 'Parquet': {
          const uint8 = Uint8Array.from(atob(record.data), c => c.charCodeAt(0))
          const asyncBuffer = await asyncBufferFrom({ file: new File([uint8], 'default'), byteLength: uint8.byteLength })
          const res = await parquetReadObjects({
            file: asyncBuffer,
            compressors,
          })
          const items = res.map(v => {
            v.id = Number(v.id)
            v.time = Number(v.time)
            v.commandId = Number(v.commandId)
            return v
          })
          const rawText = JSON.stringify({
            items,
            version: 105
          })
          const text = await applyQQImageRKey(rawText)
          nextTick(() => {
            store.pcList.length = 0

            logMan.lastText = '';
            logMan.syncChange(text, [0, store.editor.state.doc.length], [0, text.length])
          });
        }
          break
        case 'SealDice':
        default:
          {
            const log = unzlibSync(Uint8Array.from(atob(record.data), c => c.charCodeAt(0)));

            const rawText = strFromU8(log)
            const text = await applyQQImageRKey(rawText)
            nextTick(() => {
              store.pcList.length = 0

              logMan.lastText = '';
              logMan.syncChange(text, [0, store.editor.state.doc.length], [0, text.length])

            });
          }
          break
      }


      loading.value = false
      showHl()
    } catch (e) {
      console.log(e)
      notification['error']({
        content: '错误',
        meta: '加载日志失败，可能是序号或密码不正确',
        duration: 5000
      })
      loading.value = false
      browserAlert()
      return true
    }
  } else {
    store.editor.dispatch({
      changes: { from: 0, to: store.editor.state.doc.length, insert: store.editor.state.doc.toString() }
    })
    showHl()
  }

  // cminstance.value = cmRefDom.value?.cminstance;
  // cminstance.value?.focus();
  // console.log(cminstance.value)
  colors.value = randomColor({ count: 16 })
  browserAlert()
  await nextTick(() => {
    setTimeout(() => {
      doFlush()
    }, 3000)
  })
});

function exportRecordRaw() {
  browserAlert()
  exportFileRaw(store.editor.state.doc.toString())
}

function exportRecordQQ() {
  browserAlert()
  showPreview()
  exportFileQQ(previewItems.value, store.exportOptions)
}

function exportRecordIRC() {
  browserAlert()
  showPreview()
  exportFileIRC(previewItems.value, store.exportOptions)
}

function exportRecordDOC() {
  browserAlert()
  if (isMobile.value) {
    message.warning('你当前处于移动端环境，已知只有WPS能够查看生成的Word文件，且无法看图！使用PC打开可以查看图片。')
  }

  const solveImg = (el: Element) => {
    if (el.tagName === 'IMG') {
      let width = el.clientWidth;
      let height = el.clientHeight;
      if (width === 0) {
        width = 300;
        height = 300;
      }
      el.setAttribute('width', `${width}`)
      el.setAttribute('height', `${height}`)
    }
    for (let i = 0; i < el.children.length; i += 1) {
      solveImg(el.children[i])
    }
  }

  const el = document.createElement('span');
  const elRoot = document.createElement('div');
  const items = [];

  showPreview()
  for (let i of previewItems.value) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    const html = h(PreviewItem, { source: i });
    render(html, el);

    const c = el;
    solveImg(c);
    items.push(c.innerHTML);
  }

  exportFileDoc(items.join('\n'));
}

function exportRecordTalkDOC() {
  browserAlert()
  if (isMobile.value) {
    message.warning('你当前处于移动端环境，已知只有WPS能够查看生成的Word文件，且无法看图！使用PC打开可以查看图片。')
  }

  const solveImg = (el: Element) => {
    if (el.tagName === 'IMG') {
      let width = el.clientWidth;
      let height = el.clientHeight;
      if (width === 0) {
        width = 300;
        height = 300;
      }
      el.setAttribute('width', `${width}`)
      el.setAttribute('height', `${height}`)
    }
    for (let i = 0; i < el.children.length; i += 1) {
      solveImg(el.children[i])
    }
  }

  const el = document.createElement('span');
  const elRoot = document.createElement('div');
  const items: string[] = [];

  showPreview()
  for (let i of previewItems.value) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    const html = h(PreviewTableTR, { source: i });
    render(html, el);

    const c = el;
    solveImg(c);
    items.push(c.innerHTML);
  }
  exportFileDoc(`<table style="border-collapse: collapse;"><tbody>${items.join('\n')}</tbody></table>`);
}

const readElementColor = (el: HTMLElement | null): string | undefined => {
  if (!el) return undefined;
  if (el.style && el.style.color) {
    return el.style.color;
  }
  const computed = window.getComputedStyle(el);
  return computed?.color || undefined;
};

const extractMessageLines = (el: HTMLElement | null): string[] => {
  if (!el) return [''];
  const clone = el.cloneNode(true) as HTMLElement;
  const doc = el.ownerDocument || document;

  clone.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const placeholder = src ? `[图:${src}]` : '[图:无可用链接]';
    img.replaceWith(doc.createTextNode(placeholder));
  });

  const blockTags = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'BLOCKQUOTE']);
  const lines: string[] = [];
  let current = '';

  const pushLine = (forceEmpty = false) => {
    const normalized = current.replace(/\u00A0/g, ' ').replace(/\s+$/g, '');
    if (normalized || forceEmpty || lines.length === 0) {
      lines.push(normalized);
    }
    current = '';
  };

  const appendText = (text: string | null) => {
    if (!text) return;
    const normalized = text.replace(/\u00A0/g, ' ');
    const segments = normalized.split(/\r?\n/);
    segments.forEach((segment, index) => {
      current += segment;
      if (index < segments.length - 1) {
        pushLine();
      }
    });
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.textContent);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as HTMLElement;

    if (element.tagName === 'BR') {
      pushLine(true);
      return;
    }

    if (blockTags.has(element.tagName)) {
      if (current) {
        pushLine();
      }

      if (element.tagName === 'LI') {
        const parent = element.parentElement;
        if (parent?.tagName === 'OL') {
          const siblings = Array.from(parent.children).filter((child) => child.tagName === 'LI');
          const index = siblings.indexOf(element);
          appendText(`${index + 1}. `);
        } else {
          appendText('• ');
        }
      }

      const before = lines.length;
      Array.from(element.childNodes).forEach(processNode);

      if (current) {
        pushLine();
      } else if (lines.length === before) {
        pushLine(true);
      }
      return;
    }

    Array.from(element.childNodes).forEach(processNode);
  };

  Array.from(clone.childNodes).forEach(processNode);

  if (current !== '' || lines.length === 0) {
    pushLine(lines.length === 0);
  }

  while (lines.length > 1 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  if (lines.length === 0) {
    lines.push('');
  }

  return lines;
};

function exportRecordDocx() {
  browserAlert()
  showPreview()

  const entries: DocxExportEntry[] = []

  for (const item of previewItems.value) {
    if (item.isRaw) continue
    if (store.isHiddenLogItem(item)) continue

    const mountPoint = document.createElement('div')
    const vnode = h(PreviewItem, { source: item })
    render(vnode, mountPoint)

    const host = mountPoint.firstElementChild as HTMLElement | null
    if (!host) {
      render(null, mountPoint)
      continue
    }

    const timeEl = host.querySelector('._time') as HTMLElement | null
    const nicknameEl = host.querySelector('._nickname') as HTMLElement | null
    const messageEl = host.querySelector('._message') as HTMLElement | null

    const entry: DocxExportEntry = {
      time: (timeEl?.textContent ?? '').trim(),
      timeColor: readElementColor(timeEl),
      nickname: (nicknameEl?.textContent ?? '').trim(),
      nicknameColor: readElementColor(nicknameEl),
      messageLines: extractMessageLines(messageEl),
      messageColor: readElementColor(messageEl),
    }

    entries.push(entry)
    render(null, mountPoint)
  }

  if (!entries.length) {
    message.warning('没有可导出的内容')
    return
  }

  exportFileDocx(entries, '跑团记录.docx').catch((err) => {
    console.error(err)
    message.error('Docx 导出失败，请稍后重试')
  })
}

const previewItems = ref<LogItem[]>([])

function showPreview() {
  const tmp: LogItem[] = [];
  let index = 0;
  const offTopicHide = store.exportOptions.offTopicHide;
  console.log('当前日志条目数量: ', logMan.curItems.length)

  for (let i of logMan.curItems) {
    if (i.isRaw) continue;
    if (store.isHiddenLogItem(i)) continue;

    // // 处理ot
    // if (offTopicHide && !i.isDice) {
    //   const msg = i.message.replaceAll(/^[(（].+?$/gm, '') // 【
    //   if (msg.trim() === '') continue;
    // }
    let msg = msgImageFormat(i.message, store.exportOptions);
    msg = msgAtFormat(msg, store.pcList);
    msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice);
    msg = msgCommandFormat(msg, store.exportOptions);
    msg = msgIMUseridFormat(msg, store.exportOptions, i.isDice);
    msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice); // 再过滤一次
    if (msg.trim() === '') continue;

    i.index = index;
    tmp.push(i);
    index += 1;
  }
  previewItems.value = tmp;
}

const store = useStore()
store.colorMapLoad();

// 修改ot选项后重建items
watch(() => store.exportOptions.offTopicHide, showPreview)
watch(
  () => store.pcList.map(pc => `${pc.IMUserId}-${pc.role}-${pc.name}`),
  () => showPreview(),
  { deep: false }
)

const editor = ref()
watch(isDark, () => {
  console.log('dark watch')
  store.reloadEditor()
})

const deletePc = (index: number, i: CharItem) => {
  const now = Date.now();
  if (now - lastNameChange < 100) return;
  lastNameChange = now;

  const m = modal.create({
    title: '删除角色',
    preset: 'card',
    style: {
      width: '30rem',
    },
    content: `即将删除角色「${i.name}」及其全部发言，确定吗？`,
    footer: () => [
      h(
        NButton,
        { type: 'default', onClick: () => m.destroy(), style: { marginRight: '1rem' } },
        () => '取消',
      ),
      h(
        NButton,
        {
          type: 'primary', onClick: () => {
            try {
              store.pcList.splice(index, 1);
              logMan.deleteByCharItem(i);
            } finally {
              m.destroy()
            }
          }
        },
        () => '确定'
      ),
    ]
  })
}

let lastPCName = ''

const nameFocus = (i: CharItem) => {
  lastPCName = i.name
}

let lastNameChange = 0;
const nameChanged = (i: CharItem) => {
  const now = Date.now();
  if (now - lastNameChange < 100) return;
  lastNameChange = now;

  const oldName = lastPCName; // 这样做的原因是，如果按回车确认，那么 nameFocus 会在promise触发前触发一遍导致无效
  const newName = i.name;
  if (oldName && newName) {
    const el = document.createElement('span');

    render(h('span', `${oldName}`), el);
    const name1 = el.innerHTML;

    render(h('span', `${newName}`), el);
    const name2 = el.innerHTML;

    render(h('span', `<${oldName}>`), el);
    const name1w = el.innerHTML;

    render(h('span', `<${newName}>`), el);
    const name2w = el.innerHTML;

    const m = modal.create({
      title: '名字变更',
      preset: 'card',
      style: {
        width: '30rem',
      },
      content: () => [
        h(
          NText,
          { innerHTML: `即将进行名字变更 <b>${name1} -> ${name2}</b><br />将修改信息行，并在文本中进行批量替换（${name1w} 替换为 ${name2w}），确定吗？` },
        ),
      ],
      footer: () => [
        h(
          NButton,
          { type: 'default', onClick: () => m.destroy(), style: { marginRight: '1rem' } },
          () => '取消',
        ),
        h(
          NButton,
          {
            type: 'primary', onClick: () => {
              try {
                logMan.rename(i, oldName, newName)
              } catch (_e) {
                i.name = oldName;
              } finally {
                m.destroy()
              }
            }
          },
          () => '确定'
        ),
      ]
    })
  }
}


logMan.ev.on('textSet', (text) => {
  store.editor.dispatch({
    changes: { from: 0, to: store.editor.state.doc.length, insert: text }
  });

  let m = new Map<string, CharItem>();
  for (let i of logMan.curItems) {
    if (i.isRaw) continue;
    setCharInfo(m, i);
  }
  store.updatePcList(m);
});

logMan.ev.on('parsed', (ti: TextInfo) => {
  store.updatePcList(ti.charInfo);
})

const onChange = (v: ViewUpdate) => {
  let payloadText = '';
  if (v) {
    if (v.docChanged) {
      // 有一种我不太清楚的特殊情况会导致二次调用，从而使得pclist清零
      // 看不出明显变化，只是一个隐藏参数flags为0
      // 破案了，是flush
      if (!v.viewportChanged && (v as any).flags === 0) {
        return;
      }

      const ranges = (v as any).changedRanges;
      if (ranges.length) {
        for (let i = ranges.length - 1; i >= 0; i--) {
          const payloadText = store.editor.state.doc.toString()

          const r1 = [ranges[i].fromA, ranges[i].toA];
          const r2 = [ranges[i].fromB, ranges[i].toB];

          console.log('XXX', v, r1, r2);
          if (r1[0] === 0 && r1[1] === logMan.lastText.length) {
            console.log('全部文本被删除，清除pc列表');
            store.pcList = [];
          }
          logMan.syncChange(payloadText, r1, r2);
        }
      }
    }
  }

  // payloadText = store.editor.state.doc.toString()
  // let isLog = false
}

const doEditorHighlightClick = (e: any) => {
  // 因为原生click事件会执行两次，第一次在label标签上，第二次在input标签上，故此处理
  if (e.target.tagName === 'INPUT') return;

  const doHl = () => {
    // 编辑器染色
    setTimeout(() => {
      store.reloadEditor()
    }, 500)
  }

  if (store.doEditorHighlight) {
    // 如果要开启
    if (isMobile.value) {
      const m = modal.create({
        title: '开启编辑器染色？',
        preset: 'card',
        style: {
          width: '30rem',
        },
        content: '部分移动设备上的特定浏览器可能会因为兼容性问题而卡死，继续吗？',
        footer: () => [
          h(
            NButton,
            {
              type: 'default',
              onClick: () => {
                store.doEditorHighlight = false
                m.destroy()
                setTimeout(() => {
                  doFlush()
                }, 3000)
              },
              style: { marginRight: '1rem' }
            },
            () => '取消',
          ),
          h(
            NButton,
            {
              type: 'primary', onClick: () => {
                try {
                  doHl()
                } catch (_e) {
                  // 重新关闭
                  setTimeout(() => {
                    store.doEditorHighlight = false
                    store.reloadEditor()
                  }, 500)
                } finally {
                  m.destroy()
                }
              }
            },
            () => '确定'
          ),
        ]
      })

      return
    }
  }

  doHl()
}

const reloadFunc = () => {
  store.reloadEditor()
}
const pcList = computed(() => store.pcList)
watch(pcList, reloadFunc, { deep: true })

const exportOptions = computed(() => store.exportOptions)
watch(exportOptions, reloadFunc, { deep: true })

const code = ref("")

</script>

<style lang="scss">
.element-plus-logo {
  width: 50%;
}

.options>div {
  width: 30rem;
  max-width: 30rem;
  margin-bottom: 2rem;
}

.options>div>.switch {
  display: flex;
  align-items: center;
  justify-content: center;

  &>h4 {
    margin-top: 0rem;
    margin-bottom: 0rem;
    margin-left: 1rem;
  }
}

.myLineDecoration {
  // background: lightblue;
  margin-bottom: 20px;
  font-size: large;
}

.pc-list {
  display: grid;
  gap: 0.75rem;
}

.pc-card {
  display: grid;
  grid-template-columns: minmax(11rem, 1.25fr) minmax(10rem, 1fr) minmax(8rem, 0.72fr) minmax(9rem, 0.8fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  background: hsl(var(--muted) / 0.28);
}

.pc-field {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.pc-field-label {
  flex: none;
  color: hsl(var(--muted-foreground));
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.pc-field :deep(.n-input),
.pc-field :deep(.n-base-selection),
.pc-field :deep(.n-color-picker) {
  min-width: 0;
  flex: 1;
}

.pc-delete {
  justify-self: end;
}

@media (max-width: 900px) {
  .pc-card {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .pc-delete {
    grid-column: 2;
  }
}

@media (max-width: 640px) {
  .pc-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .pc-delete {
    grid-column: 1;
    width: 100%;
  }
}

#app {
  overflow-y: auto;
}

.preview {
  word-break: break-all;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  position: relative;
  // font-family: monospace;
}


.list-dynamic {
  width: 100%;
  height: 500px;
  overflow-y: auto;
}

.list-item-dynamic {
  // display: flex;
  // align-items: center;
  padding: 0.5em 0;
  border-color: lightgray;
}

.scroller {
  height: 95vh;
}
</style>

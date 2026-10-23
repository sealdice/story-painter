/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 日志数据 API 地址（store.ts 中 diceAPIBase） */
  readonly LOG_API_BASE?: string
  /** RKey 获取接口地址（store.ts 中 tryFetchRKey） */
  readonly RKEY_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

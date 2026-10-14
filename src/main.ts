import { createApp } from "vue";
import App from "./App.vue";

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono/400.css'

import "~/styles/index.scss";
import './str.polyfill.ts'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import { createPinia } from 'pinia'
// import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

const app = createApp(App);
app.use(createPinia())
// app.component('DynamicScroller', DynamicScroller);
// app.component('DynamicScrollerItem', DynamicScrollerItem);
// app.component('RecycleScroller', RecycleScroller);
// app.use(ElementPlus);
app.mount("#app");

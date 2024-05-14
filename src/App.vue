<script setup lang="ts">
import Main from "~/Main.vue";
import { darkTheme, lightTheme } from "naive-ui";
import { ref } from "vue";

const darkMode = ref<boolean>(false)
</script>

<template>
  <n-config-provider :theme="darkMode ? darkTheme : lightTheme">
    <n-message-provider>
      <n-modal-provider>
        <n-notification-provider>
          <Main v-model="darkMode"/>
        </n-notification-provider>
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>
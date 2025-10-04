<template>
  <div class="pineapple-item">
    <pre class="pineapple-text">{{ source.text }}</pre>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  source: {
    index: number
    text: string
  }
}>();
</script>

<style scoped>
.pineapple-item {
  padding: 0.25rem 0;
}
.pineapple-text {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
}
</style>

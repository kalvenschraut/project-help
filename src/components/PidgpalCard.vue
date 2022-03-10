<template>
  <div @click="emits('goToSpotlight')">
    <img
      :src="props.pic"
      alt="no pic"
      style="border-radius: 30%; width: 25px; height: 25px; border: 4px solid #333"
    />
    <span style="color: blue">{{ props.friend }} --status--> {{ props.status }}</span>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ friend: string; status: string; pic: string }>();
const emits = defineEmits<{ (e: "goToSpotlight"): void }>();
</script>

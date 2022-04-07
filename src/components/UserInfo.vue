<template>
  <div class="card-image" style="margin-top: 25px; margin-left: 10px">
    <img
      :src="props.pic"
      alt="no pic"
      style="border-radius: 50%; width: 75px; height: 75px; border: 4px solid #333"
    />
    <span>{{ props.displayName }}</span>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ pic: string; displayName: string }>();
</script>

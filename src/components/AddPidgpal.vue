<template>
  <p>Add Pidgpal component</p>
  <button @click="$emit('shutitdown')">Close</button>
  <input
    :disabled="checkStarted"
    type="text"
    placeholder="enter pidgpal username"
    v-model="ppUserName"
    title="Enter pidgpal username"
  />
  <button @click="checkppName" v-if="!checkStarted">Add Pidgpal</button>
  <p v-if="!ppNameExists && checkStarted">The username {{ ppUserName }} does not exist</p>
  <button v-if="!ppNameExists && checkStarted" @click="checkStarted = false">
    Try Again
  </button>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { checkIfUserNameUnique } from "../firestore";

const emits = defineEmits<{
  (e: "pidgpalchosen", userName: string): void;
  (f: "shutitdown"): void;
}>();
const pattern = /^([a-zA-Z0-9_.]){5,30}$/; //regex pattern
const ppUserName = ref("");
const ppNameExists = ref(false);
const checkStarted = ref(false);

const checkppName = async () => {
  checkStarted.value = true;
  if (pattern.test(ppUserName.value)) {
    await checkIfUserNameUnique(ppUserName.value.toLowerCase()).then((result) => {
      if (result) {
        ppNameExists.value = true;
        emits("pidgpalchosen", ppUserName.value);
      } else {
        ppNameExists.value = false;
      }
    });
  } else {
    //if they fail the pattern
    ppNameExists.value = false;
  }
};
</script>

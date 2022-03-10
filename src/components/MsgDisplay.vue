<template>
  <p>gotMessages: {{ gotMessages }}</p>

  <ul v-for="item of gotMessages">
    <h4 style="color: blue" v-if="item.sender === palname">
      {{ item.msgText }}
    </h4>
    <h5 style="color: red" v-if="item.sender === myUsrName">
      {{ item.msgText }}
    </h5>
  </ul>
</template>
<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { getMessagesfromMessagesCollection } from "../firestore";

const gstate: any = inject("global");
const myUsrName: string = gstate.global.loggedInUserProfile.userName;
const palname: string = gstate.global.globalPpSpotlight.palname;
const palstatus: any = computed(() => gstate.global.globalPpSpotlight.status);
const palpairid: any = computed(() => gstate.global.globalPpSpotlight.pairID);

const gotMessages = ref([]);

getMessages();
defineExpose({ getMessages }); //so msgcompose can trigger after send

async function getMessages() {
  const result = await getMessagesfromMessagesCollection(palpairid.value).catch((err) =>
    console.log(err)
  );
  if (result) {
    const length = result.msgsArr.length;
    gotMessages.value = result.msgsArr.map((singlemsg, index) => {
      // if transit and last msg sender not me dont display
      if (index == length - 1) {
        if (
          palstatus.value === "home" ||
          palstatus.value === "away" ||
          (palstatus.value === "transit" && singlemsg.sender === myUsrName)
        ) {
          return singlemsg;
        } else {
          console.log("message in transit and not sent by me so do not show");
          return {
            timeSent: singlemsg.timeSent,
            sender: singlemsg.sender,
            msgText: "A pigeon is on the way to you",
          };
        }
      } else {
        return singlemsg;
      }
    });
  }
}
</script>

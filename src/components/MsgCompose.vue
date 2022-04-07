<template>
  <input
    type="text"
    placeholder="send a a message"
    v-model="msgTxtInput"
    title="Send a message"
  />
  <button @click="sendMessage">Send Message</button>
  <h6>Your current status is : {{ palStatus }}</h6>
</template>
<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { addMsgToExisting, addMsgToNew, addPair2PpCollection } from "../firestore";

const gState: any = inject("global");
const myUsrName: string = gState.global.loggedInUserProfile.userName;

//globalPpSpotlight is for the pal that was clicked
const palName: string = gState.global.globalPpSpotlight.palname;
const palPic: string = gState.global.globalPpSpotlight.palpic;
const palStatus: any = computed(() => gState.global.globalPpSpotlight.status);
const palPairId: any = computed(() => gState.global.globalPpSpotlight.pairID);

const msgTxtInput = ref("");
const emits = defineEmits<{ (e: "newMsgSent"): void }>();

//if a msg has never been sent then create a pairid in the pidgpals collection
async function sendMessage() {
  if (palStatus.value === "notStarted") {
    //create pair id
    const newPairID = await createPidpalPair();
    //save message
    await saveNewMsg(
      {
        msgText: msgTxtInput.value,
        sender: myUsrName,
      },
      newPairID
    );
    //update to transit so new message cannot be sent
    //and new pairid so messages can be retrieved
    gState.global.updateGlobalPpSpotlight({
      palpic: palPic,
      status: "transit",
      pairID: newPairID,
      palname: palName,
    });
    emits("newMsgSent");
    msgTxtInput.value = "";
  } else if (palStatus.value === "home") {
    //get pair id
    const existingPairID = palPairId.value;
    //save message
    await saveExistingMsg(
      {
        msgText: msgTxtInput.value,
        sender: myUsrName,
      },
      existingPairID
    );
    //update to transit so new message cannot be sent
    gState.global.updateGlobalPpSpotlight({
      palpic: palPic,
      status: "transit",
      pairID: existingPairID,
      palname: palName,
    });
    emits("newMsgSent");
    msgTxtInput.value = "";
  } else {
    alert("You must wait until the pigeon is home");
  }
}

async function createPidpalPair() {
  const newPairID = await addPair2PpCollection(myUsrName, palName);
  return newPairID;
}

async function saveExistingMsg(msg: object, pairID: string) {
  const result = await addMsgToExisting(msg, pairID).catch((e) => console.log(e));
  return result;
}

async function saveNewMsg(msg: object, pairID: string) {
  const result = await addMsgToNew(msg, pairID).catch((e) => console.log(e));
  return result;
}
</script>

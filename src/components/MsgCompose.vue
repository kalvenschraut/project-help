<template>
  <input
    type="text"
    placeholder="send a a message"
    v-model="msgTxtInput"
    title="Send a message"
  />
  <button @click="sendMessage">Send Message</button>
  <h6>Your current status is : {{ palstatus }}</h6>
  <MsgDisplay ref="MsgDisplayVueRef" />
</template>
<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { addMsgToExisting, addMsgToNew, addPair2PpCollection } from "../firestore";
import MsgDisplay from "./MsgDisplay.vue";

const gstate: any = inject("global");
const myUsrName: string = gstate.global.loggedInUserProfile.userName;

//globalPpSpotlight is for the pal that was clicked
const palname: string = gstate.global.globalPpSpotlight.palname;
const palpic: string = gstate.global.globalPpSpotlight.palpic;
const palstatus: any = computed(() => gstate.global.globalPpSpotlight.status);
const palpairid: any = computed(() => gstate.global.globalPpSpotlight.pairID);

const msgTxtInput = ref("");

const MsgDisplayVueRef = ref();

//for messages to refresh in msgdisplay component
function syncMsgs() {
  MsgDisplayVueRef.value.getMessages();
}

//if a msg has never been sent then create a pairid id the pidgpals collection
async function sendMessage() {
  if (palstatus.value === "notStarted") {
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
    gstate.global.updateGlobalPpSpotlight({
      palpic: palpic,
      status: "transit",
      pairID: newPairID,
      palname: palname,
    });
    syncMsgs();
    msgTxtInput.value = "";
  } else if (palstatus.value === "home") {
    //get pair id
    const existingPairID = palpairid.value;
    //save message
    await saveExistingMsg(
      {
        msgText: msgTxtInput.value,
        sender: myUsrName,
      },
      existingPairID
    );
    //update to transit so new message cannot be sent
    gstate.global.updateGlobalPpSpotlight({
      palpic: palpic,
      status: "transit",
      pairID: existingPairID,
      palname: palname,
    });
    syncMsgs();
    msgTxtInput.value = "";
  } else {
    alert("You must wait until the pigeon is home");
  }
}

async function createPidpalPair() {
  const newPairID = await addPair2PpCollection(myUsrName, palname);
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

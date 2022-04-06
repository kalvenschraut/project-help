<template>
  <h3>This is the pidgpal spotlight</h3>
  <button @click="router.back()">◀️ back</button>
  <UserInfoVue :pic="palPic" :display-name="palName"></UserInfoVue>
  <button class="btn btn-success" @click="blockUser(palName)">Block</button>
  <br />
  <br />
  <br />
  <MsgCompose @new-msg-sent="newMessageSent()"></MsgCompose>
  <MsgDisplayVue v-model:update-messages="shouldUpdateMessages" />
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import UserInfoVue from "../components/UserInfo.vue";
import { addPidgpalToBlockedContacts, getUsrProfileFirestore } from "../firestore";
import MsgCompose from "../components/MsgCompose.vue";
import MsgDisplay from "./MsgDisplay.vue"; //I dont know why I cant import it like this? Gives an error
import MsgDisplayVue from "../components/MsgDisplay.vue"; 

const router = useRouter();
const gState: any = inject("global");
const uid = gState.global.loggedInUserProfile.uid;

const palName: string = gState.global.globalPpSpotlight.palname;
const palPic: string = gState.global.globalPpSpotlight.palpic;

const shouldUpdateMessages = ref(false);
function newMessageSent(){
  shouldUpdateMessages.value=true;
}

async function blockUser(blockThisPal) {
  // alert(`Are you sure you want to block ${blockThisPal}?`);
  await addPidgpalToBlockedContacts(uid, blockThisPal).catch((e) => {
    console.log(e);
  });
  updateGstateUserProfile();
  router.back();
}

async function updateGstateUserProfile() {
  //get the latest user profile from firebase
  const userProfileData = await getUsrProfileFirestore(uid).catch((e) => console.log(e));
  //update the global variable
  gState.global.updateUsrGlobalState({ uid: uid, ...userProfileData });
}
</script>

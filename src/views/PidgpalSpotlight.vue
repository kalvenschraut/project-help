<template>
  <h3>This is the pidgpal spotlight</h3>
  <button @click="router.back()">◀️ back</button>
  <UserInfoVue :pic="palpic" :display-name="palname"></UserInfoVue>
  <button class="btn btn-success" @click="blockUser(palname)">Block</button>
  <br />
  <br />
  <br />
  <MsgCompose></MsgCompose>
  <!-- <MsgDisplayVue></MsgDisplayVue> -->
</template>

<script setup lang="ts">
import MsgDisplayVue from "../components/MsgDisplay.vue";
import { inject } from "vue";
import { useRouter } from "vue-router";
import UserInfoVue from "../components/UserInfo.vue";
import { addPidgpalToBlockedContacts, getUsrProfileFirestore } from "../firestore";
import MsgCompose from "../components/MsgCompose.vue";

const router = useRouter();
const gstate: any = inject("global");
const uid = gstate.global.loggedInUserProfile.uid;

const palname: string = gstate.global.globalPpSpotlight.palname;
const palpic: string = gstate.global.globalPpSpotlight.palpic;

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
  gstate.global.updateUsrGlobalState({ uid: uid, ...userProfileData });
}
</script>

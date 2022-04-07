<template>
  <button v-if="!newUser" @click="googleSignIn">googleIn</button>
  <div v-if="newUser">
    <UsernameComponent
      msg="enter your username"
      @addthisuser="registerNewUser"
    ></UsernameComponent>
  </div>
</template>

<script setup lang="ts">
import { auth } from "../firebaseInit";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getUsrProfileFirestore, addUserToUserProfilesCollection } from "../firestore";
import { useRouter } from "vue-router";
import { inject, ref } from "vue";
import UsernameComponent from "../components/UsernameCheck.vue";

const router = useRouter();
const googleProvider = new GoogleAuthProvider();
const uid = ref("");
const photoURL = ref("");
const newUser = ref(false);
const gstate = inject("global");

const googleSignIn = () => {
  signInWithPopup(auth, googleProvider)
    .then((user) => {
      uid.value = user.user.uid;
      user.user.photoURL
        ? (photoURL.value = user.user.photoURL)
        : (photoURL.value = "no pic");
      checkIfUserInUsersCollection();
    })
    .catch((error) => {
      console.error(error);
    });
};

const checkIfUserInUsersCollection = () => {
  getUsrProfileFirestore(uid.value).then((userProfileData) => {
    if (userProfileData != null) {
      gstate.global.updateUsrGlobalState({ uid: uid.value, ...userProfileData });
      router.push("pidgin-hole");
    } else {
      newUser.value = true;
    }
  });
};

const registerNewUser = async (username: any) => {
  await addUserToUserProfilesCollection({
    displayName: username,
    userName: username.toLowerCase(),
    uid: uid.value,
    photoURL: photoURL.value,
  });
  router.push("pidgin-hole");
};
</script>

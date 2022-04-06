<template>
  <UserInfoVue :pic="pic" :display-name="dName" @getout="logOut"></UserInfoVue>
  <button class="btn btn-success" @click="logOut">Logout</button>

  <button v-if="!isAddPidgpal" @click="isAddPidgpal = true">Add Pidgpal</button>

  <AddPidgpalVue
    v-if="isAddPidgpal"
    @pidgpalchosen="addPidgpal"
    @shutitdown="isAddPidgpal = false"
  ></AddPidgpalVue>
  <h3>global state : {{ gState.global.loggedInUserProfile }}</h3>
  <h3>Pidpals : {{ pidgPals }}</h3>
  <h4>palFromPairs : {{ palFromPairs }}</h4>
  <h4>msgPairIdPerContact : {{ msgPairIdPerContact }}</h4>
  <h3>contactGrid : {{ contactGrid }}</h3>
  <h6 style="color: crimson">Status Grid :{{ statusGrid }}</h6>

  <ol>
    <PidgpalCardVue
      v-for="individualPal in statusGrid"
      v-bind:friend="individualPal.pal"
      :status="individualPal.status"
      :pic="individualPal.pic"
      v-bind:key="individualPal.pal"
      @go-to-spotlight="
        goToSpotlight(
          individualPal.pal,
          individualPal.pic,
          individualPal.status,
          individualPal.pairID
        )"
    ></PidgpalCardVue>
  </ol>
</template>

<script setup lang="ts">
import { onAuthStateChanged, signOut } from "firebase/auth";
import { computed, inject, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AddPidgpalVue from "../components/AddPidgpal.vue";
import PidgpalCardVue from "../components/PidgpalCard.vue";
import UserInfoVue from "../components/UserInfo.vue";
import { auth } from "../firebaseInit";
import {
  addPidgpalToUserContacts,
  getUsrProfileFirestore,
  getLastMsgStatusfromMsgsCollection,
  usePidgPalListener,
  getUserProfilePic,
} from "../firestore";

const gState: any = inject("global");
const router = useRouter();
const isAddPidgpal = ref(false);
const uid = gState.global.loggedInUserProfile.uid;
const pic = gState.global.loggedInUserProfile.photoURL;
const uName: string = gState.global.loggedInUserProfile.userName;
const dName = gState.global.loggedInUserProfile.displayName
  ? gState.global.loggedInUserProfile.displayName
  : gState.global.loggedInUserProfile.userName;
const userContacts = computed(() => gState.global.loggedInUserProfile.ppContacts);
const blockedContacts = computed(() => gState.global.loggedInUserProfile.ppBlocked);
const statusGrid = computed(() => gState.global.statusGrid.value);

const cleanupHandleASC = onAuthStateChanged(auth, handleAuthStateChange);
onBeforeUnmount(cleanupHandleASC);

const { foundPairs: pidgPals } = usePidgPalListener(uName);

//get the pals name from palpairs
const palFromPairs = computed(() =>
  pidgPals.value.map((doc) => {
    return {
      id: doc.id,
      pal: doc.pal1 != uName ? doc.pal1 : doc.pal2,
    };
  })
);

//check if a palpair (and therefore  msgid) exists for each contact
const msgPairIdPerContact = computed(() =>
  userContacts.value.map((contact) => {
    if (palFromPairs.value.find((pair) => pair.pal === contact)) {
      return palFromPairs.value.find((pair) => pair.pal === contact);
    } else {
      return {
        id: "notStarted",
        pal: contact,
      };
    }
  })
);

//for each contact get a picture and get the last message from msgcollection
//calculate flight status for each last message
const contactGrid: any[] = computed(async () => {
  const cttGrid = [];
  for (const pair of msgPairIdPerContact.value) {
    const gotPic = await getUserProfilePic(pair.pal);

    if (pair.id != "notStarted") {
      const gotStatus = await getLastMsgStatusfromMsgsCollection(
        pair.id,
        pair.pal,
        gState.global.loggedInUserProfile.userName
      ).catch((e) => console.log(e));

      cttGrid.push({
        pal: pair.pal,
        status: gotStatus.status,
        pic: gotPic,
        pairID: pair.id,
      });
    } else {
      cttGrid.push({
        pal: pair.pal,
        status: "notStarted",
        pic: gotPic,
        pairID: pair.id,
        
      });
    }
  }
  gState.global.updateStatusGrid(cttGrid);
});

//watch the pairs collection. add any new pairs to my contacts
//a new pair means that a new message has been sent to me
function addPalfromPairsToUserContacts() {
  watch(
    () => palFromPairs.value,
    () => {
      palFromPairs.value.map((doc) => {
        if (!blockedContacts.value.includes(doc.pal)) {
          if (!userContacts.value.includes(doc.pal)) {
            console.log(`The user ${doc.pal} is Not in your contacts and will be added`);
            addPidgpalToUserContacts(uid, doc.pal).catch((e) => {
              console.log(e);
            });
            updateGstateUserProfile();
          }
        }
      });
    }
  );
}
addPalfromPairsToUserContacts();

async function updateGstateUserProfile() {
  //get the latest user profile from firebase
  const userProfileData = await getUsrProfileFirestore(uid).catch((e) => console.log(e));
  //update the global variable
  gState.global.updateUsrGlobalState({ uid: uid, ...userProfileData });
}

const goToSpotlight = (pal: string, pic: string, status: string, pairID: string) => {
  gState.global.updateGlobalPpSpotlight({
    palpic: pic,
    status: status,
    pairID: pairID,
    palname: pal,
  });
  router.push("pidgpal-spotlight");
};

const addPidgpal = async (ppName: string) => {
  isAddPidgpal.value = false;
  const tempUsrContacts = userContacts.value;
  const tempBlockedContacts = blockedContacts.value;
  if (tempUsrContacts.includes(ppName)) {
    alert("This contact exists");
  } else if (tempBlockedContacts.includes(ppName)) {
    alert("This contact is blocked");
  } else {
    await addPidgpalToUserContacts(uid, ppName.toLowerCase()).catch((e) => {
      console.log(e);
    });
    //update the global data with the new data from the user profile including updated array
    updateGstateUserProfile();
  }
};

function handleAuthStateChange(user: any): void {
  if (!user) {
    router.push("/"); //home is sign-in page
  }
}

const logOut = () => {
  signOut(auth).catch((err) => {
    console.error(err);
  });
};
</script>

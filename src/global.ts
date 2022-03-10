import { reactive, readonly, ref } from "vue";

//example state
const state = reactive({
  count: 0,
});
const increment = function () {
  state.count++;
};

//userprofile
const loggedInUserProfile = reactive({
  uid:"",
  userName: "example",
  displayName: "",
  photoURL: "",
  ppContacts: [],
  ppBlocked: [],
});
const updateUsrGlobalState = function (data) {
  loggedInUserProfile.uid = data.uid;
  loggedInUserProfile.userName = data.userName;
  loggedInUserProfile.displayName = data.displayName ? data.displayName : "";
  loggedInUserProfile.photoURL = data.photoURL ? data.photoURL : "";
  loggedInUserProfile.ppContacts = data.ppContacts ? data.ppContacts : [];
  loggedInUserProfile.ppBlocked = data.ppBlocked ? data.ppBlocked : [];
};

//statusGrid
interface LastMsgStatus {
  status: string;
  pal: string;
  pic: string;
}
const statusGrid = ref<LastMsgStatus[]>([]);
const updateStatusGrid = function (data) {
  statusGrid.value = data.map((doc) => {
    return { ...doc };
  });
};

//spotlight global
const globalPpSpotlight = reactive({
  palpic:"",
  status: "",
  pairID: "",
  palname: "",
});

const updateGlobalPpSpotlight = function (newData) {
  globalPpSpotlight.status = newData.status;
  globalPpSpotlight.palpic = newData.palpic;
  globalPpSpotlight.pairID = newData.pairID;
  globalPpSpotlight.palname = newData.palname;
};

export default {
  statusGrid: readonly(statusGrid),
  updateStatusGrid,
  state: readonly(state),
  increment,
  loggedInUserProfile: readonly(loggedInUserProfile),
  updateUsrGlobalState,
  globalPpSpotlight:readonly(globalPpSpotlight),
  updateGlobalPpSpotlight
};



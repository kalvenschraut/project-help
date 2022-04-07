import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { onUnmounted, Ref, ref } from "vue";
import { firestore } from "./firebaseInit";

const userProfilesCollection = collection(firestore, "userProfiles"); //v9
const pidgpalsCollection = collection(firestore, "pidgpals");
const messagesCollection = collection(firestore, "messages");

export const getUsrProfileFirestore = async (id: string) => {
  const searchForThisUser = doc(userProfilesCollection, id);
  const userProfileQuery = await getDoc(searchForThisUser); //v9
  return userProfileQuery.exists() ? userProfileQuery.data() : null;
};

export const checkIfUserNameUnique = async (userName: string) => {
  const searchForThisUserName = query(
    userProfilesCollection,
    where("userName", "==", userName)
  );
  const matchingUserNames = await getDocs(searchForThisUserName);
  return matchingUserNames.size > 0 ? true : false;
};

export const getMessagesfromMessagesCollection =async (msgID:string) => {
  const getThisMsgArray = doc(messagesCollection, msgID);
  const msgQuery = await getDoc(getThisMsgArray);
  return msgQuery.exists() && msgQuery.data();
}

interface LastMsgStatus {
  status: string;
  pal: string;
}

//gets the last message, calculates status based on flight time
export const getLastMsgStatusfromMsgsCollection:LastMsgStatus = async (msgID:string, pal:string, uname:string) => {
  const getThisMsgArray = doc(messagesCollection, msgID);
  const msgQuery = await getDoc(getThisMsgArray);
  const msgsArrlength = msgQuery.exists()?msgQuery.data().msgsArr.length:1;
  const lastMsg = msgQuery.exists()? msgQuery.data().msgsArr[msgsArrlength-1]:null;
  if (!lastMsg) {return {pal:pal, status:'notStarted'}}
  const sender = lastMsg.sender;
  const timeSent = lastMsg.timeSent.seconds;
  const status = calcStatus(timeSent, sender, uname);
  return {
    pal: pal,
    status: status,
  }
}

function calcStatus(timeSent:number, sender:string, uname:string) {
  const timeNow = new Date().getTime();
  const timeSentToMilli = timeSent * 1000;
  let status: string;

  if (timeNow - timeSentToMilli > flightTime()) {
    if (sender != uname) {
      status = "home";
      return status;
    } else {
      status = "away";
      return status;
    }
  } else {
    status = "transit";
    return status;
  }
}

//calculate flighttime of 3 days
const flightTime: number = () => {
  //3 days to milliseconds
  const day1 = new Date(2000, 0, 1).getTime();
  const day2 = new Date(2000, 0, 4).getTime();
  const ft = day2 - day1;
  return ft;
};


export const addUserToUserProfilesCollection = (userProfile: any) => {
  // exclude display name when username is already lowercase
  if (userProfile.displayName == userProfile.userName) {
    return setDoc(doc(userProfilesCollection, userProfile.uid), {
      userName: userProfile.userName,
      photoURL: userProfile.photoURL,
    });
  } else {
    return setDoc(doc(userProfilesCollection, userProfile.uid), {
      userName: userProfile.userName,
      photoURL: userProfile.photoURL,
      displayName: userProfile.displayName,
    });
  }
};

export const addPidgpalToUserContacts = async (id: string, pidgpal: string) => {
  const userRef = doc(userProfilesCollection, id);
  return await updateDoc(userRef, {
    ppContacts: arrayUnion(pidgpal), //arrayUnion does not add duplicates although this is checked for on the code
  });
};

export const addPidgpalToBlockedContacts = async (
  id: string,
  pidgpal: string
) => {
  const userRef = doc(userProfilesCollection, id);
  return await updateDoc(userRef, {
    ppContacts: arrayRemove(pidgpal),
    ppBlocked: arrayUnion(pidgpal), //arrayUnion does not add duplicates although this is checked for on the code
  });
};

interface PidgPal {
  id: string;
  pal1: string;
  pal2: string;
}

interface PidgPalListenerReturns {
  foundPairs: Ref<PidgPal[]>;
}

export function usePidgPalListener(userName: string): PidgPalListenerReturns {
  const foundPairs = ref<PidgPal[]>([]);
  let found1: PidgPal[] = [];
  let found2: PidgPal[] = [];
  const q1 = query(pidgpalsCollection, where("pal1", "==", userName));
  const q2 = query(pidgpalsCollection, where("pal2", "==", userName));
  const close1 = onSnapshot(q1, (snapshot) => {
    found1 = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    const close2 = onSnapshot(q2, (snapshot) => {
      found2 = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      foundPairs.value = found1.concat(found2);
    });
  });
  onUnmounted(close1);
  return { foundPairs };
}

export async function addPair2PpCollection(name1: string, name2: string) {
  const addedPairRef =  await addDoc(pidgpalsCollection, {
    pal1: name1,
    pal2: name2,
  });
  return (addedPairRef.id);
}

export async function getUserProfilePic(userName:string) {
  const searchForThisUserName = query(
    userProfilesCollection,
    where("userName", "==", userName)
  );
  const matchingUserNames = await getDocs(searchForThisUserName);
  const thePic = matchingUserNames.docs.map((doc) => {
    return{pic:doc.data().photoURL}
  })
  return matchingUserNames.size > 0 ? thePic[0].pic : "noPic";
}

export async function addMsgToExisting(msg:object, pairID:string): Promise<void> {
  const msgRef = doc(messagesCollection, pairID);
  return await updateDoc(msgRef,{
    msgsArr:arrayUnion({msgText:msg.msgText,sender:msg.sender,timeSent:Timestamp.now()})
  });
}

export async function addMsgToNew(msg:object, pairID:string) {
  const msgRef = doc(messagesCollection, pairID);
  return await setDoc(msgRef,{
    msgsArr:arrayUnion({msgText:msg.msgText,sender:msg.sender,timeSent:Timestamp.now()})
  });
}
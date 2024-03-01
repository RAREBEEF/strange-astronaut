import * as firebase from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import * as firestore from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// liveID = "fhbjpkjhalgkhlfbhcbnejkgbnjnmjmn"
const ORIGIN = "chrome-extension://dbghdjgofbcficjlbhbgacbdgimnmodi/";
const FB_CONFIG = {
  apiKey: "AIzaSyDNcFppFUzUytQB-6r-rfx3tUMGH9mTYXE",
  authDomain: "strange-astronaut-payment.firebaseapp.com",
  projectId: "strange-astronaut-payment",
  storageBucket: "strange-astronaut-payment.appspot.com",
  messagingSenderId: "894019223845",
  appId: "1:894019223845:web:b09c2313e7bc7d7548dacc",
};
const FIREBASE_APP = firebase.initializeApp(FB_CONFIG);

let USER_DATA = null;

// popup으로부터 메세지 수신
// 유저 데이터 먼저 요청 -> 유저 데이터 존재하면 결제 여부 요청 -> 결제 여부 존재하면 마지막 체크일 요청 순으로 진행된다.
window.addEventListener("message", async (e) => {
  const { data } = e;

  // 유저데이터 수신
  if (data.responseUserData) {
    console.log("유저데이터 수신", data.userData);
    // 유저데이터가 존재하면 마지막 체크일 요청
    if (data.userData) {
      USER_DATA = data.userData;
      // postMessage({ requestIsPaid: true });
      postMessage({ requestLastCheckDate: true });
    } else {
      return;
    }
  }

  // 마지막 체크일 수신
  if (data.responseLastCheckDate) {
    console.log("마지막 체크일 수신", data.lastCheckDate);

    // 마지막 체크일 확인
    const { lastCheckDate } = data;
    const now = Date.now();
    const msDiff = Math.abs(lastCheckDate - now);
    const daysDiff = msDiff / (1000 * 60 * 60 * 24);

    // 마지막 체크일이 7일 이내일 경우 체크하지 않고 넘어감
    if (!!lastCheckDate && daysDiff < 7) {
      console.log(daysDiff, "마지막 체크일이 7일 이내");
      return;
      // 그 외에는 체크 실시
    } else {
      console.log("체크한다.");
      await getPaymentData(USER_DATA.uid)
        .then((paymentData) => {
          console.log(paymentData);
          // 결제 데이터가 아예 없거나(결제 내역 없음) 상태가 COMLTETED가 아닌 경우 프리미엄 취소
          if (!paymentData || paymentData.status !== "COMPLETED") {
            postMessage({ paymentCanceled: true });
          } else {
            postMessage({ paymentCompleted: true });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
});

// popup에 메세지 전송 함수
function postMessage(message) {
  window.parent.postMessage(message, ORIGIN);
}

document.addEventListener("DOMContentLoaded", () => {
  // 돔 로드가 완료되면 유저데이터를 요청해 프로세스 시작
  console.log("유저데이터 요청");
  postMessage({ requestUserData: true });
});

const getPaymentData = async (uid) => {
  const { getFirestore, doc, getDoc } = firestore;
  const db = getFirestore();
  const docRef = doc(db, "payments", uid);
  const docSnap = await getDoc(docRef);

  return docSnap.data();
};

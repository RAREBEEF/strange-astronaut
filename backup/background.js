let AVAILABLE = true;
let TRIAL_START_AT = null;
let TIMER_INTERVAL = null;
let TRIAL_OVER = false;
let IS_PAID = false;

// 초기화
async function init() {
  // 결제 여부 초기화
  await getStorageItem("isPaid", (result) => {
    if (Object.keys(result).length > 0 && result.isPaid === true) {
      IS_PAID = true;
    } else {
      IS_PAID = false;
    }
  });
  // 체험 종료 여부 초기화
  await getStorageItem("trialOver", (result) => {
    if (result.trialOver === true) {
      TRIAL_OVER = true;
    } else {
      TRIAL_OVER = false;
    }
  });
  // 앱 활성화 여부 초기화
  await getStorageItem("available", (result) => {
    if (Object.keys(result).length <= 0) {
      updateAppStatus({ available: true });
      AVAILABLE = true;
    } else if (result.available === true) {
      AVAILABLE = true;
    } else {
      AVAILABLE = false;
    }
  });

  updateAppStatus();
}

// 앱 상태 체크
function updateAppStatus() {
  // 체험이 종료되지 않았고 결제가 안되었다면 타이머 실행
  if (!TRIAL_OVER && !IS_PAID) {
    console.log("체험 중이고 결제 안됨 -> 타이머 시작");
    startTimer();
    return;
    // 체험이 종료되었거나 결제가 되었다면 타이머 종료
  } else if (TRIAL_OVER || IS_PAID) {
    console.log("체험이 종료되었거나 결제가 완료됨 -> 타이머 종료");
    shutdownTimer();
  }
  // 만약 체험이 종료되었는데 결제가 안되었다면 앱 비활성화
  if (TRIAL_OVER && !IS_PAID) {
    console.log("체험 종료인데 결제 안됨 -> 앱 비활성");
    appAvailable(false);
  } else {
    console.log("체험 중이거나 결제가 완료됨 -> 앱 활성");
    appAvailable(true);
  }
}

// 결제 여부 및 체험 종료 감시
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (const key in changes) {
    if (key === "isPaid") {
      const isPaid = changes[key].newValue;

      if (isPaid) {
        IS_PAID = true;
      } else {
        IS_PAID = false;
      }
    } else if (key === "trialOver") {
      const trialOver = changes[key].newValue;

      if (trialOver) {
        TRIAL_OVER = true;
      } else {
        TRIAL_OVER = false;
      }
    } else if (key === "trialStartAt") {
      const trialStartAt = changes[key].newValue;

      if (trialStartAt) {
        TRIAL_START_AT = trialStartAt;
      }
    }
  }

  updateAppStatus();
});

// 메세지 수신 (팝업 요청 or 결제 완료 or 체험 시작 시간)
chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (chrome.runtime.id !== sender.id) {
    return;
  }

  if (message.openPayment) {
    openPayment();
  } else if (message.paymentComplete) {
    paymentComplete(sendResponse);
  } else if (message.checkSw) {
    sendResponse("sw online");
  }
});

// 팝업 열기
function openPayment() {
  let openPopupStatus = true;
  try {
    try {
      chrome.windows.create({
        url: `https://b064zwg6-5500.asse.devtunnels.ms/index.html?eid=${chrome.runtime.id}`,
        width: 800,
        height: 1000,
        type: "popup",
      });
    } catch (e) {
      console.log(e);
    }
  } catch (error) {
    openPopupStatus = false;
  } finally {
    sendResponse({ success: openPopupStatus });
  }
}

// 결제 완료
function paymentComplete(responseSender) {
  responseSender("결제 확인 완료");
  updateStorageItem({ isPaid: true });
  updateStorageItem({ trialOver: true });
}

// 체험 타이머 시작
async function startTimer() {
  // 활성화된 타이머가 없을 경우 타이머 실행
  if (!TIMER_INTERVAL) {
    // 타이머 시간 초기화(불러오기)
    await getStorageItem("trialStartAt", async (result) => {
      if (!!result.trialStartAt) {
        TRIAL_START_AT = result.trialStartAt;
      } else {
        // 스토리지에 체험 시작 시간이 없을 경우 새로 추가
        const now = await getUnixTime();
        updateStorageItem({ trialStartAt: now });
        TRIAL_START_AT = now;
      }
    });
    // 타이머 인터벌 실행
    TIMER_INTERVAL ??= setInterval(async () => {
      const remain = 3600 + (TRIAL_START_AT - (await getUnixTime()));
      // 타이머 시간이 종료되면
      if (remain <= 0) {
        trialOver(); // 체험 종료
      }
    }, 5000);
  }

  updateStorageItem({ timerActivate: true });
}

// 체험 타이머 종료
async function shutdownTimer() {
  if (!!TIMER_INTERVAL) {
    clearInterval(TIMER_INTERVAL);
    TIMER_INTERVAL = null;
  }

  updateStorageItem({ timerActivate: false });
}

// 체험 시간 소진
function trialOver() {
  console.log("time over");
  if (!!TIMER_INTERVAL) {
    clearInterval(TIMER_INTERVAL);
    TIMER_INTERVAL = null;
  }
  updateStorageItem({ trialOver: true });

  // 체험이 종료되었다는 팝업 띄우고 결제 팝업과 연계
  openPayment();
}

async function getUnixTime() {
  let time = null;
  await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC")
    .then((response) => response.json())
    .then((data) => {
      time = data.unixtime;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return time;
}

function updateStorageItem(item) {
  chrome.storage.sync.set(item);
}

async function getStorageItem(key, callback = () => null) {
  let res = null;
  await chrome.storage.sync.get([key], (result) => {
    callback(result);
    res = result;
  });

  return res;
}

function appAvailable(status) {
  if (status === true) {
    updateStorageItem({ available: true });
    AVAILABLE = true;
  } else {
    updateStorageItem({ enabled: false });
    updateStorageItem({ available: false });
    AVAILABLE = false;
  }
}

init();

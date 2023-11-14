let IS_PAID = false;
let ENABLED = true;
let TIMER_START_AT = null;
let TIMER_INTERVAL = null;

function startTimer() {
  if (!TIMER_INTERVAL) {
    const now = Date.now();
    updateStorageItem({ timerStartAt: now });

    TIMER_START_AT = now;
    TIMER_INTERVAL = setInterval(() => {
      console.log(TIMER_START_AT, "back");
      const remain = (30000 + TIMER_START_AT - Date.now()) / 1000;
      if (remain <= 0) {
        shutdownTimer();
        updateStorageItem({ enabled: false });
      }
    }, 1000);
  }
}

function shutdownTimer() {
  if (!!TIMER_INTERVAL) {
    clearInterval(TIMER_INTERVAL);

    TIMER_INTERVAL = null;
    TIMER_START_AT = null;
  }
}

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

  // 토글 여부 초기화
  await getStorageItem("enabled", (result) => {
    if (Object.keys(result).length <= 0) {
      updateStorageItem({ enabled: false });
      chrome.tabs.query({ active: false, currentWindow: true }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.reload(tab.id);
        });
      });
      ENABLED = false;
    } else if (result.enabled === true) {
      ENABLED = true;
    } else {
      ENABLED = false;
    }
  });

  updateAppStatus();
}

// 앱 상태 체크
function updateAppStatus() {
  if (IS_PAID) {
    shutdownTimer();
    return;
  } else if (ENABLED) {
    startTimer();
  } else {
    shutdownTimer();
  }
}

// 결제 여부 및 체험 종료 감시
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (const key in changes) {
    if (key === "isPaid") {
      const isPaid = changes[key].newValue;
      IS_PAID = isPaid;
    } else if (key === "enabled") {
      const enabled = changes[key].newValue;
      ENABLED = enabled;
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
    openPayment(sendResponse);
  } else if (message.paymentComplete) {
    paymentComplete(sendResponse);
  } else if (message.timerStartAt) {
    sendResponse(TIMER_START_AT);
  } else if (message.swKeepAlive) {
    sendResponse("sw online");
  }
});

// 팝업 열기
function openPayment(sendResponse) {
  let openPopupStatus = true;
  try {
    chrome.windows.create({
      url: `http://localhost:3000/payment`,
      width: 800,
      height: 1000,
      type: "popup",
    });
  } catch (error) {
    openPopupStatus = false;
  } finally {
    sendResponse({ success: openPopupStatus });
  }
}

// 결제 완료
function paymentComplete(responseSender) {
  updateStorageItem({ isPaid: true });
  responseSender("Payment confirmed at background.");
}

function updateStorageItem(item) {
  chrome.storage.sync.set(item);
}

async function getStorageItem(key, callback = (result) => result) {
  await chrome.storage.sync.get([key], (result) => {
    callback(result);
  });
}

init();

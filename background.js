let IS_PAID = null;
let ENABLED = null;
let TIMER_START_AT = null;
let TIMER_INTERVAL = null;

function startTimer() {
  if (!TIMER_INTERVAL) {
    const now = Date.now();
    updateStorageItem({ timerStartAt: now });

    TIMER_START_AT = now;
    TIMER_INTERVAL = setInterval(() => {
      console.log(TIMER_START_AT, "back");
      const remain = (300000 + TIMER_START_AT - Date.now()) / 1000;
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
      paymentCancel();
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

  updateTimerStatus();
}

// 앱 상태 체크
function updateTimerStatus() {
  if (ENABLED === null || IS_PAID === null) {
    return;
  } else if (IS_PAID) {
    shutdownTimer();
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
      if (!isPaid) paymentCancel();
    } else if (key === "enabled") {
      const enabled = changes[key].newValue;
      ENABLED = enabled;
    }
  }

  updateTimerStatus();
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
  } else if (message.closePayment) {
    await closePayment(sendResponse);
  } else if (message.openManage) {
    openManage(sendResponse);
  } else if (message.paymentCanceled) {
    paymentCancel(sendResponse);
  }
});

// 결제 팝업 열기/닫기
function openPayment(sendResponse) {
  let openPopupStatus = true;
  try {
    chrome.windows.create(
      {
        url: `http://localhost:3000/`,
        width: 800,
        height: 900,
        type: "popup",
      },
      (window) => {
        updateStorageItem({ paymentPopupId: window.id });
      }
    );
  } catch (error) {
    console.log(error);
    openPopupStatus = false;
  } finally {
    sendResponse({ success: openPopupStatus });
  }
}
async function closePayment(sendResponse) {
  let closePopupStatus = true;
  await getStorageItem("paymentPopupId", (result) => {
    if (Object.keys(result).length <= 0) {
      return;
    } else {
      try {
        chrome.windows.remove(result.paymentPopupId, () => {
          console.log("Popup closed");
        });
      } catch (error) {
        console.log(error);
        closePopupStatus = false;
      } finally {
        sendResponse({ success: closePopupStatus });
      }
    }
  });
}

// 결제 완료
function paymentComplete(sendResponse) {
  updateStorageItem({ isPaid: true });
  sendResponse("Payment confirmed at background.");
}

// 결제관리 팝업 열기/닫기
function openManage(sendResponse) {
  let openPopupStatus = true;
  try {
    chrome.windows.create({
      url: `http://localhost:3000/manage`,
      width: 800,
      height: 900,
      type: "popup",
    });
  } catch (error) {
    console.log(error);
    openPopupStatus = false;
  } finally {
    sendResponse({ success: openPopupStatus });
  }
}

function paymentCancel(sendResponse = null) {
  updateStorageItem({ isPaid: false });
  updateStorageItem({ skin: "default" });
  updateStorageItem({ allowKeyboardControl: false });
  updateStorageItem({ allowDotsCustom: false });
  updateStorageItem({ dotCount: 20 });
  updateStorageItem({ size: 100 });
  sendResponse && sendResponse("Cancel confirmed at background.");
}

function updateStorageItem(item) {
  chrome.storage.sync.set(item);
}

function getStorageItem(key, callback = () => null) {
  return new Promise((res, rej) => {
    chrome.storage.sync.get([key], (result) => {
      callback(result);
      res(result);
    });
  });
}

init();

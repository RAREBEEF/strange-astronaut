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

  updateAppStatus();
}

// 앱 상태 체크
function updateAppStatus() {}

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

init();

let IS_PAID = null;
let ENABLED = null;

// 초기화
async function init() {
  // 결제 여부 초기화
  await getStorageItem("isPaid", async (result) => {
    if (!!result?.isPaid) {
      IS_PAID = true;
    } else {
      IS_PAID = false;
      paymentCancel();
    }
  });

  // 토글 여부 초기화
  await getStorageItem("enabled", (result) => {
    if (Object.keys(result).length <= 0) {
      chrome.tabs.query({}, function (arrayOfTabs) {
        arrayOfTabs?.forEach((tab) => {
          chrome.tabs.reload(tab.id);
        });
      });
      try {
        chrome.windows.create({
          url: `http://localhost:3000/tutorial`,
          width: 800,
          height: 900,
          type: "popup",
        });
      } catch (error) {
        console.log(error);
      }
      updateStorageItem({ enabled: true });
      ENABLED = false;
    } else if (!!result?.enabled) {
      ENABLED = true;
    } else {
      ENABLED = false;
    }
  });
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
  } else if (message.paymentCompleted) {
    paymentComplete(sendResponse);
  } else if (message.swKeepAlive) {
    sendResponse("sw online");
  } else if (message.closePayment) {
    await closePayment(sendResponse);
  } else if (message.openManage) {
    openManage(sendResponse);
  } else if (message.paymentCanceled) {
    paymentCancel(sendResponse);
  } else if (message.openRefund) {
    openRefund(sendResponse);
  }
});

// 결제 팝업 열기/닫기
function openPayment(sendResponse) {
  let openPopupStatus = true;
  try {
    chrome.windows.create(
      {
        url: `http://localhost:3000/purchase`,
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
    if (!!result?.paymentPopupId) {
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

// 환불 팝업 열기/닫기
function openRefund(sendResponse) {
  let openPopupStatus = true;
  try {
    chrome.windows.create({
      url: `http://localhost:3000/manage/refund`,
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
  updateStorageItem({ size: 100 });
  updateStorageItem({ speed: 100 });
  updateStorageItem({ glitchIncludesAllSkins: false });
  sendResponse && sendResponse("Cancel confirmed at background.");
}

function updateStorageItem(item) {
  chrome.storage.sync.set(item);
}

function getStorageItem(key, callback = () => null) {
  return new Promise((res, rej) => {
    chrome.storage.sync.get([key], (result) => {
      callback(result || {});
      res(result || {});
    });
  });
}

init();

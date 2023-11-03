let AVAILABLE = true;
let TIMER_INTERVAL = null;
let TRIAL_OVER = false;
let IS_PAID = false;
let ALLOW_DOTS_CUSTOM = false;
let DOT_COUNT = 20;
let SIZE_RATIO = 100;
const LOCALE_TEXTS = {
  paymentPopup: {
    success:
      "팝업 15호가 곧 도착합니다.\n탑승 후 결제를 진행하여 우주비행사를 도와주세요.",
    fail: "팝업 15호 호출에 실패하였습니다.\n아무래도 은하간 통신 시스템에 문제가 있거나 팝업 차단 시스템에 감지된 모양입니다.",
  },
};

const DOMContentLoadedHandler = async () => {
  // ELEMENTS
  // // 언어 관련
  const paymentKo = document.getElementById("payment-ko");
  const footerKo = document.getElementById("footer-ko");
  const timerHeaderKo = document.getElementById("trial-timer-header-ko");
  const paymentEn = document.getElementById("payment-en");
  const footerEn = document.getElementById("footer-en");
  const timerHeaderEn = document.getElementById("trial-timer-header-en");
  const customizeKo = document.getElementById("customize-wrapper-ko");
  const customizeEn = document.getElementById("customize-wrapper-en");
  // // 토글
  const toggleBtn = document.getElementById("toggle-btn");
  const toggleUnavailable = document.getElementById("app-unavailable");
  // // 타이머
  const timerHour = document.getElementById("timer-hour");
  const timerMinute = document.getElementById("timer-minute");
  const timerSecond = document.getElementById("timer-second");
  // // 결제
  const paymentSection = document.getElementById("payment-wrapper");
  const paymentBtns = document.getElementsByClassName("payment-btn");
  // // 커스텀
  const sizeInputs = document.getElementsByClassName("customize-size-input");
  const sizeIndicators = document.getElementsByClassName("size-indicator");
  const dotCountInputs = document.getElementsByClassName(
    "customize-dot-count-input"
  );
  const dotCountIndicators = document.getElementsByClassName(
    "dot-count-indicator"
  );
  const allowDotsCustomInputs = document.getElementsByClassName(
    "allow-dots-custom-input"
  );

  // 초기화 함수
  async function init() {
    // 언어 초기화
    const userLanguage = navigator.language || navigator.userLanguage;
    if (userLanguage.startsWith("ko")) {
      paymentEn.style.display = "none";
      footerEn.style.display = "none";
      timerHeaderEn.style.display = "none";
    } else {
      paymentKo.style.display = "none";
      footerKo.style.display = "none";
      timerHeaderKo.style.display = "none";
      LOCALE_TEXTS.paymentPopup.fail =
        "Failed to open the payment pop-up window. Please check your Internet connection or pop-up settings.";
      LOCALE_TEXTS.paymentPopup.success =
        "A pop-up window will open. Continue payment in the pop-up window.";
    }
    // 결제 여부 초기화
    await getStorageItem("isPaid", (result) => {
      paymentHandler(result.isPaid);
    });
    // 체험 종료 여부 초기화
    await getStorageItem("trialOver", (result) => {
      if (result.trialOver === true) {
        trialOverHandler(true);
      } else {
        trialOverHandler(false);
      }
    });
    // 토글 상태 초기화
    await getStorageItem("enabled", (result) => {
      if (Object.keys(result).length <= 0 || result.enabled === true) {
        updateStorageItem({ enabled: true });
        enable();
      } else {
        updateStorageItem({ enabled: false });
        disable();
      }
    });
    // 타이머 초기화
    await getStorageItem("timerActivate", (result) => {
      if (result.timerActivate === true) {
        startTimer();
      }
    });
    // 앱 활성화 초기화
    await getStorageItem("available", (result) => {
      if (Object.keys(result).length <= 0 || result.available === true) {
        appAvailableHandler(true);
      } else {
        appAvailableHandler(false);
      }
    });
    // 커스텀 초기화
    // // 사이즈
    await getStorageItem("size", (result) => {
      if (Object.keys(result).length > 0) {
        SIZE_RATIO = result.size;
        for (const input of sizeInputs) {
          input.value = result.size;
        }
        for (const indicator of sizeIndicators) {
          indicator.textContent = `${result.size}%`;
        }
      }
    });
    // // 고정점 변경 허용
    await getStorageItem("allowDotsCustom", (result) => {
      const allowDotsCustom =
        Object.keys(result).length > 0 && result.allowDotsCustom === true;
      ALLOW_DOTS_CUSTOM = result.allowDotsCustom;
      for (const input of allowDotsCustomInputs) {
        input.checked = allowDotsCustom;
      }
      for (const input of dotCountInputs) {
        input.disabled = !allowDotsCustom;
      }
    });
    // // 고정점
    await getStorageItem("dotCount", (result) => {
      if (Object.keys(result).length > 0) {
        DOT_COUNT = result.dotCount;
        for (const input of dotCountInputs) {
          input.value = result.dotCount;
        }
        for (const indicator of dotCountIndicators) {
          indicator.textContent = result.dotCount;
        }
      }
    });
  }

  // 스토리지 변경 감시
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
      // 토글 여부 감시
      if (key === "enabled") {
        if (changes[key].newValue === true) {
          enable();
        } else {
          disable();
        }
      } else if (key === "isPaid") {
        if (changes[key].newValue === true) {
          paymentHandler(true);
        } else {
          paymentHandler(false);
        }
      } else if (key === "trialOver") {
        if (changes[key].newValue === true) {
          trialOverHandler(true);
        } else {
          trialOverHandler(false);
        }
      } else if (key === "timerActivate") {
        if (changes[key].newValue === true) {
          startTimer();
        } else {
          shutdownTimer();
        }
      } else if (key === "available") {
        if (changes[key].newValue === true) {
          appAvailableHandler(true);
        } else {
          appAvailableHandler(false);
        }
      }
    }
  });

  // 앱 활성화 여부
  function appAvailableHandler(status) {
    if (status === true) {
      AVAILABLE = true;
      // toggleUnavailable.style.display = "none";
    } else {
      AVAILABLE = false;
      // toggleUnavailable.style.display = "flex";
    }
  }

  // 체험 종료 여부에 따른 설정
  function trialOverHandler(trialOver) {
    if (trialOver === true) {
      TRIAL_OVER = true;
      timerHour.textContent = "00";
      timerMinute.textContent = "00";
      timerSecond.textContent = "00";
    } else {
      TRIAL_OVER = false;
    }
  }

  async function startTimer() {
    if (!TIMER_INTERVAL) {
      timerHour.textContent = "--";
      timerMinute.textContent = "--";
      timerSecond.textContent = "--";

      await getStorageItem("trialStartAt", async (result) => {
        const { trialStartAt } = result;
        if (!trialStartAt) {
          timerHour.textContent = "--";
          timerMinute.textContent = "--";
          timerSecond.textContent = "--";
        } else {
          const intervalStartAt = await getUnixTime();
          const remainInit = 3600 + (trialStartAt - intervalStartAt);

          let sec = remainInit;
          TIMER_INTERVAL ??= setInterval(() => {
            sec -= 1;
            const [hour, minute, second] = secToHMS(sec);
            timerHour.textContent = hour.toString().padStart(2, "0");
            timerMinute.textContent = minute.toString().padStart(2, "0");
            timerSecond.textContent = second.toString().padStart(2, "0");
          }, 1000);
        }
      });
    }
  }

  function shutdownTimer() {
    !!TIMER_INTERVAL && clearInterval(TIMER_INTERVAL);
    TIMER_INTERVAL = null;
  }

  // 결제 여부에 따른 설정
  function paymentHandler(isPaid) {
    if (isPaid) {
      IS_PAID = true;
      paymentSection.style.display = "none";
    } else {
      IS_PAID = false;
      paymentSection.style.display = "flex";
      // 결제 버튼
      for (const btn of paymentBtns) {
        btn.addEventListener("click", () => {
          // 결제 팝업 열기 요청 메세지 전송
          sendMessage({ openPayment: true }, (res) => {
            // 팝업 오픈 실패 시
            if (!res.success) {
              alert(LOCALE_TEXTS.paymentPopup.fail); // 알림창 띄우기
            }
          });
        });
      }
    }
  }

  // 활성화 설정
  function enable() {
    toggleBtn.classList.add("enabled");
  }
  function disable() {
    toggleBtn.classList.remove("enabled");
  }

  // 토글 버튼 클릭 (스토리지만 업데이트하고 앱 상태 변경에는 관여하지 않음)
  toggleBtn.addEventListener("click", async () => {
    await getStorageItem("enabled", (result) => {
      if (result.enabled === true) {
        updateStorageItem({ enabled: false });
      } else {
        updateStorageItem({ enabled: true });
      }
    });
  });

  // 커스텀 기능
  //
  function propotionDotCount(sizeRatio) {
    return Math.round(2000 / sizeRatio);
  }
  function updateDotCount(dotCount) {
    DOT_COUNT = dotCount;
    for (const dotCountInput of dotCountInputs) {
      dotCountInput.value = DOT_COUNT;
    }
    for (const dotCountIndicator of dotCountIndicators) {
      dotCountIndicator.textContent = DOT_COUNT;
    }
  }
  // // 사이즈
  for (const input of sizeInputs) {
    input.addEventListener("input", (e) => {
      const { value } = e.target;
      SIZE_RATIO = value;
      for (const indicator of sizeIndicators) {
        indicator.textContent = `${value}%`;
      }

      if (!ALLOW_DOTS_CUSTOM) {
        updateDotCount(propotionDotCount(value));
      }
    });
    input.addEventListener("change", (e) => {
      const { value } = e.target;
      updateStorageItem({ size: value });
      if (!ALLOW_DOTS_CUSTOM) {
        updateStorageItem({ dotCount: DOT_COUNT });
      }
    });
  }
  // // 고정점 변경 허용
  for (const input of allowDotsCustomInputs) {
    input.addEventListener("change", (e) => {
      const { checked } = e.target;
      ALLOW_DOTS_CUSTOM = checked;
      updateStorageItem({ allowDotsCustom: checked });

      updateDotCount(propotionDotCount(SIZE_RATIO));
      updateStorageItem({ dotCount: DOT_COUNT });
      for (const dotsInput of dotCountInputs) {
        dotsInput.disabled = !checked;
      }
    });
  }
  // // 고정점 개수
  for (const input of dotCountInputs) {
    input.addEventListener("input", (e) => {
      const { value } = e.target;
      DOT_COUNT = value;
      for (const indicator of dotCountIndicators) {
        indicator.textContent = `${value}`;
      }
    });
    input.addEventListener("change", (e) => {
      const { value } = e.target;
      updateStorageItem({ dotCount: value });
    });
  }

  init();
};

//
//
// functions
//
//
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

function removeStorageItem(item) {
  chrome.storage.sync.remove(item);
}

async function getStorageItem(key, callback = () => null) {
  let res = null;
  await chrome.storage.sync.get([key], (result) => {
    callback(result);
    res = result;
  });

  return res;
}

function reset() {
  removeStorageItem("enabled");
  removeStorageItem("pizza");
  removeStorageItem("isPaid");
  removeStorageItem("trialStartAt");
  removeStorageItem("trialOver");
  removeStorageItem("available");
  removeStorageItem("timerActivate");
  removeStorageItem("size");
  removeStorageItem("allowDotsCustom");
  removeStorageItem("dotCount");
}

function sendMessage(message, callback) {
  chrome.runtime.sendMessage(message, (res) => callback(res));
}

function secToHMS(sec) {
  const hour = Math.max(Math.floor(sec / 3600), 0);
  const minute = Math.min(Math.max(Math.floor((sec % 3600) / 60), 0), 59);
  const second = Math.min(Math.max(sec % 60, 0), 59);
  return [hour, minute, second];
}

//
// 네트워크 연결 체크
//
(() => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://www.google.com", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log("network connection online");
      } else {
        console.log("network connection offline");
        const container = document.getElementById("container");
        container.textContent = "Network connection lost";
      }
    }
  };
  xhr.send();
})();

//
// 서비스워커 활성화 체크
//
if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
  console.log(
    "service worker online",
    navigator.serviceWorker,
    navigator.serviceWorker.controller
  );
} else {
  console.log("service worker offline");
}

document.addEventListener("DOMContentLoaded", DOMContentLoadedHandler);

// 디버그용
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("reset-btn");
  const paidBtn = document.getElementById("paid-btn");
  resetBtn?.addEventListener("click", () => {
    reset();
  });
  paidBtn?.addEventListener("click", () => {
    updateStorageItem({ isPaid: true });
  });
});

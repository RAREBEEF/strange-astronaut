let IS_PAID = false;
let ENABLED = true;
let TIMER_INTERVAL = null;
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
  const langSelect = document.getElementById("lang-select");
  const paymentKo = document.getElementById("payment-ko");
  const footerKo = document.getElementById("footer-ko");
  const timerDescriptionKo = document.getElementById("timer-description-ko");
  const paymentEn = document.getElementById("payment-en");
  const footerEn = document.getElementById("footer-en");
  const timerDescriptionEn = document.getElementById("timer-description-en");
  const customizeKo = document.getElementById("customize-ko");
  const customizeEn = document.getElementById("customize-en");
  // // 토글
  const toggleBtn = document.getElementById("toggle-btn");
  const toggleUnavailable = document.getElementById("app-unavailable");
  // // 타이머
  const timerWrapper = document.getElementById("timer-wrapper");
  const timerMinute = document.getElementById("timer-minute");
  const timerSecond = document.getElementById("timer-second");
  // // 결제
  const paymentSection = document.getElementById("payment-wrapper");
  const paymentBtns = document.getElementsByClassName("payment-btn");
  // // 커스텀
  const locker = document.getElementById("locker");
  const customizeWrappers =
    document.getElementsByClassName("customize-wrapper");
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

  // 언어 초기화 및 설정
  getStorageItem("lang", (result) => {
    let lang = "default";

    if (result.lang === "ko") {
      lang = "ko";
    } else if (result.lang === "en") {
      lang = "en";
    }

    changeLang(lang);
  });

  langSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    updateStorageItem({ lang });
    changeLang(lang);
  });

  function changeLang(lang) {
    let userLanguage = navigator.language || navigator.userLanguage;
    if (lang === "default") {
      langSelect.value = "default";
    } else {
      userLanguage = lang;
      langSelect.value = lang;
    }

    if (userLanguage.startsWith("ko")) {
      paymentEn.style.display = "none";
      footerEn.style.display = "none";
      timerDescriptionEn.style.display = "none";
      customizeEn.style.display = "none";
      paymentKo.style.display = "flex";
      footerKo.style.display = "block";
      timerDescriptionKo.style.display = "block";
      customizeKo.style.display = "flex";
    } else {
      paymentKo.style.display = "none";
      footerKo.style.display = "none";
      timerDescriptionKo.style.display = "none";
      customizeKo.style.display = "none";
      paymentEn.style.display = "flex";
      footerEn.style.display = "block";
      timerDescriptionEn.style.display = "block";
      customizeEn.style.display = "flex";
      LOCALE_TEXTS.paymentPopup.fail =
        "Failed to open the payment pop-up window. Please check your Internet connection or pop-up settings.";
      LOCALE_TEXTS.paymentPopup.success =
        "A pop-up window will open. Continue payment in the pop-up window.";
    }
  }

  // 앱 상태 체크
  function updateAppStatus() {
    if (IS_PAID) {
      return;
    } else if (ENABLED) {
      startTimer();
    } else {
      shutdownTimer();
    }
  }

  async function startTimer() {
    if (!TIMER_INTERVAL) {
      timerSecond.textContent = "--";
      timerMinute.textContent = "";

      let timerStartAt = null;
      sendMessage({ timerStartAt: true }, (res) => {
        timerStartAt = res;
        console.log(res);
      });

      TIMER_INTERVAL = setInterval(() => {
        const remain = (30000 + timerStartAt - Date.now()) / 1000;
        console.log(timerStartAt, "popup");
        const [H, M, S] = secToHMS(remain);
        timerMinute.textContent = M.toString().padStart(2, "0");
        timerSecond.textContent = Math.round(S).toString().padStart(2, "0");
        if (remain <= 0) {
          shutdownTimer();
        }
      }, 100);
    }
  }

  function shutdownTimer() {
    if (!!TIMER_INTERVAL) {
      clearInterval(TIMER_INTERVAL);
      TIMER_INTERVAL = null;
      timerSecond.textContent = "30";
      timerMinute.textContent = "00";
    }
  }

  // 초기화 함수
  async function init() {
    // 결제 여부 초기화
    await getStorageItem("isPaid", (result) => {
      paymentHandler(result.isPaid);
    });
    // 토글 상태 초기화
    await getStorageItem("enabled", (result) => {
      if (Object.keys(result).length <= 0) {
        disable();
      } else if (result.enabled === true) {
        enable();
      } else {
        disable();
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

    updateAppStatus();
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
      }
    }

    updateAppStatus();
  });

  // 결제 여부에 따른 설정
  function paymentHandler(isPaid) {
    if (isPaid) {
      IS_PAID = true;
      paymentSection.style.display = "none";
      locker.style.display = "none";
      timerWrapper.style.display = "none";
      shutdownTimer();
      for (const customizeWrapper of customizeWrappers) {
        customizeWrapper.style.pointerEvents = "all";
      }
    } else {
      IS_PAID = false;
      paymentSection.style.display = "flex";
      locker.style.display = "flex";
      timerWrapper.style.display = "flex";
      for (const customizeWrapper of customizeWrappers) {
        customizeWrapper.style.pointerEvents = "none";
      }
      // 결제 버튼
      for (const btn of paymentBtns) {
        btn.addEventListener("click", () => {
          // 결제 팝업 열기 요청 메세지 전송
          sendMessage({ openPayment: true }, (res) => {
            // 팝업 오픈 실패 시
            if (!res.success) {
              alert(LOCALE_TEXTS.paymentPopup.fail);
              console.log("Failed to open popup.");
            } else {
              console.log("Successfully opened a popup");
            }
          });
        });
      }
    }
  }

  // 활성화 설정
  function enable() {
    ENABLED = true;
    toggleBtn.classList.add("enabled");
  }
  function disable() {
    ENABLED = false;
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
      if (!IS_PAID) {
        e.target.value = 100;
      } else {
        const { value } = e.target;
        SIZE_RATIO = value;
        for (const indicator of sizeIndicators) {
          indicator.textContent = `${value}%`;
        }

        if (!ALLOW_DOTS_CUSTOM) {
          updateDotCount(propotionDotCount(SIZE_RATIO));
        }
      }
    });
    input.addEventListener("change", (e) => {
      if (!IS_PAID) {
        e.target.value = 100;
      } else {
        const { value } = e.target;
        updateStorageItem({ size: value });
        if (!ALLOW_DOTS_CUSTOM) {
          updateStorageItem({ dotCount: DOT_COUNT });
        }
      }
    });
  }
  // // 고정점 변경 허용
  for (const input of allowDotsCustomInputs) {
    input.addEventListener("change", (e) => {
      if (!IS_PAID) {
        e.target.checked = false;
      } else {
        const { checked } = e.target;
        ALLOW_DOTS_CUSTOM = checked;
        updateStorageItem({ allowDotsCustom: checked });

        updateDotCount(propotionDotCount(SIZE_RATIO));
        updateStorageItem({ dotCount: DOT_COUNT });
        for (const dotsInput of dotCountInputs) {
          dotsInput.disabled = !checked;
        }
      }
    });
  }
  // // 고정점 개수
  for (const input of dotCountInputs) {
    input.addEventListener("input", (e) => {
      if (!IS_PAID) {
        e.target.value = 20;
      } else {
        const { value } = e.target;
        DOT_COUNT = value;
        for (const indicator of dotCountIndicators) {
          indicator.textContent = `${value}`;
        }
      }
    });
    input.addEventListener("change", (e) => {
      if (!IS_PAID) {
        e.target.value = 20;
      } else {
        const { value } = e.target;
        updateStorageItem({ dotCount: value });
      }
    });
  }

  init();
};

//
//
// functions
//
//
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
  removeStorageItem("size");
  removeStorageItem("allowDotsCustom");
  removeStorageItem("dotCount");
}

function sendMessage(message, callback = () => null) {
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

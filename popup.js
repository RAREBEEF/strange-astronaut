let IS_PAID = false;
let ENABLED = true;
let TIMER_INTERVAL = null;
let ALLOW_DOTS_CUSTOM = false;
let DOT_COUNT = 20;
let SIZE_RATIO = 100;

const DOMContentLoadedHandler = async () => {
  // ELEMENTS
  // // 언어 관련
  const langSelect = document.getElementById("lang-select");
  const timerDescription = document.getElementById("timer-description");
  const paymentDescription = document.getElementById("payment-description");
  const paymentBtnText = document.getElementById("payment-btn-text");
  const restoreBtn = document.getElementById("restore-btn");
  const customizeSizeLabel = document.getElementById("customize-size-label");
  const customizeDotCountLabel = document.getElementById("customize-dot-count");
  const copyright = document.getElementById("copyright");
  // // 토글
  const toggleBtn = document.getElementById("toggle-btn");
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

  // 언어 초기화
  // ko en default
  getStorageItem("lang", (result) => {
    let lang = navigator.language || navigator.userLanguage;

    if (result.lang === "ko") {
      lang = "ko";
      langSelect.value = "ko";
    } else if (result.lang === "en") {
      lang = "en";
      langSelect.value = "en";
    } else {
      langSelect.value = "default";
    }

    changeLang(lang);
  });

  langSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    updateStorageItem({ lang });
    changeLang(lang);
  });

  async function changeLang(lang) {
    if (lang !== "en" && lang !== "ko") {
      lang = "en";
    }

    const translateUrl = chrome.runtime.getURL(
      `locales/${lang}/translate.json`
    );
    const translate = await fetch(translateUrl).then((res) => res.json());

    timerDescription.textContent = translate.toggle.timer.description;
    paymentDescription.textContent = translate.payment.description;
    paymentBtnText.textContent = translate.payment.btn;
    restoreBtn.textContent = translate.payment.restore;
    customizeSizeLabel.textContent = translate.customize.size;
    customizeDotCountLabel.textContent = translate.customize.dotCount;
    copyright.textContent = translate.footer.copyright;
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
      timerMinute.textContent = "00";
      timerSecond.textContent = "30";
    }
  }

  // 초기화 함수
  async function init() {
    // 결제 여부 초기화
    await getStorageItem("isPaid", async (result) => {
      await paymentHandlerSync(result.isPaid);
    });
    // 토글 상태 초기화
    await getStorageItem("enabled", async (result) => {
      if (Object.keys(result).length <= 0) {
        await disableSync();
      } else if (result.enabled === true) {
        await enableSync();
      } else {
        await disableSync();
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
  chrome.storage.onChanged.addListener(async function (changes, namespace) {
    for (var key in changes) {
      // 토글 여부 감시
      if (key === "enabled") {
        if (changes[key].newValue === true) {
          await enableSync();
        } else {
          await disableSync();
        }
      } else if (key === "isPaid") {
        if (changes[key].newValue === true) {
          await paymentHandlerSync(true);
        } else {
          await paymentHandlerSync(false);
        }
      }
    }

    updateAppStatus();
  });

  // 결제 여부에 따른 설정
  function paymentHandlerSync(isPaid) {
    return new Promise((res, rej) => {
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
                console.log("Failed to open popup.");
              } else {
                console.log("Successfully opened a popup");
              }
            });
          });
        }
      }

      res(true);
    });
  }

  // 활성화 설정
  function enableSync() {
    return new Promise((res, rej) => {
      ENABLED = true;
      toggleBtn.classList.add("enabled");
      res(true);
    });
  }
  function disableSync() {
    return new Promise((res, rej) => {
      ENABLED = false;
      toggleBtn.classList.remove("enabled");
      res(true);
    });
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

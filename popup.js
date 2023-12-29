let IS_PAID = null;
let ENABLED = null;
let TIMER_INTERVAL = null;
let ALLOW_DOTS_CUSTOM = false;
let DOT_COUNT = 20;
let SIZE_RATIO = 100;

const DOMContentLoadedHandler = async () => {
  // HEADER
  const headerImg = document.getElementById("header-img");
  headerImg.src = chrome.runtime.getURL("src/images/logo.png");
  // ELEMENTS
  // // 언어 관련
  const langSelect = document.getElementById("lang-select");
  const timerDescription = document.getElementById("timer-description");
  const paymentDescription = document.getElementById("payment-description");
  const paymentBtnText = document.getElementById("payment-btn-text");
  const restoreBtn = document.getElementById("restore-btn");
  const customizeMovementTypeLabel = document.getElementById(
    "customize-movement-type-label"
  );
  const customizeSizeLabel = document.getElementById("customize-size-label");
  const customizeDotCountLabel = document.getElementById(
    "customize-dot-count-label"
  );
  const customizeSkinDefaultLabel = document.getElementById(
    "customize-skin-default-label"
  );
  const customizeSkinGlitchLabel = document.getElementById(
    "customize-skin-glitch-label"
  );
  const termsOfUse = document.getElementById("termsOfUse");
  const privacyPolicy = document.getElementById("privacyPolicy");
  const refundBtn = document.getElementById("refund");

  const copyright = document.getElementById("copyright");
  // // 토글
  const toggleBtn = document.getElementById("toggle-btn");
  // // 타이머
  const timerWrapper = document.getElementById("timer-wrapper");
  const timerMinute = document.getElementById("timer-minute");
  const timerSecond = document.getElementById("timer-second");
  // // 결제
  const paymentSection = document.getElementById("payment-wrapper");
  const paymentBtn = document.getElementById("payment-btn");
  // // 커스텀
  const locker = document.getElementById("locker");
  const sizeInput = document.getElementById("customize-size-input");
  const sizeIndicator = document.getElementById("size-indicator");
  const dotCountInput = document.getElementById("customize-dot-count-input");
  const dotCountIndicator = document.getElementById("dot-count-indicator");
  const allowDotsCustomInput = document.getElementById(
    "customize-allow-dots-custom-input"
  );
  const defaultSkinThumb = document.getElementById("default-skin-thumb");
  const glitchSkinThumb = document.getElementById("glitch-skin-thumb");
  defaultSkinThumb.src = chrome.runtime.getURL(
    "src/images/original_character_right.png"
  );
  glitchSkinThumb.src = chrome.runtime.getURL(
    `src/images/glitch_character_right_1.png`
  );
  const skinForm = document.getElementById("customize-skin-wrapper");
  const skinRadios = skinForm.elements["skin"];
  const movementTypeForm = document.getElementById(
    "customize-movement-type-wrapper"
  );
  const movementTypeRadios = movementTypeForm.elements["movement-type"];

  // 언어 초기화
  getStorageItem("lang", (result) => {
    changeLang(result.lang);
  });

  langSelect.addEventListener("change", (e) => {
    const lang = e.target.value;
    updateStorageItem({ lang });
    changeLang(lang);
  });

  async function changeLang(lang) {
    if (!lang) {
      const defaultLang = navigator.language || navigator.userLanguage;
      if (defaultLang.startsWith("ko")) {
        langSelect.value = "ko";
        lang = "ko";
        updateStorageItem({ lang: "ko" });
      } else {
        langSelect.value = "en";
        lang = "en";
        updateStorageItem({ lang: "en" });
      }
    } else if (lang.startsWith("ko")) {
      langSelect.value = "ko";
    } else {
      langSelect.value = "en";
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
    customizeMovementTypeLabel.textContent = translate.customize.movementType;
    customizeSizeLabel.textContent = translate.customize.size;
    customizeDotCountLabel.textContent = translate.customize.dotCount;
    customizeSkinDefaultLabel.textContent = translate.customize.skin.default;
    customizeSkinGlitchLabel.textContent = translate.customize.skin.glitch;
    copyright.textContent = translate.footer.copyright;
    termsOfUse.textContent = translate.footer.termsOfUse;
    privacyPolicy.textContent = translate.footer.privacyPolicy;
    refundBtn && (refundBtn.textContent = translate.footer.refund);
  }

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

  function startTimer() {
    if (!TIMER_INTERVAL) {
      timerSecond.textContent = "--";
      timerMinute.textContent = "";

      let timerStartAt = null;
      sendMessage({ timerStartAt: true }, (res) => {
        timerStartAt = res;
      });

      TIMER_INTERVAL = setInterval(() => {
        const remain = (300000 + timerStartAt - Date.now()) / 1000;
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
      timerMinute.textContent = "05";
      timerSecond.textContent = "00";
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
        disable();
      } else if (result.enabled === true) {
        enable();
      } else {
        disable();
      }
    });
    // 커스텀 초기화
    // // 사이즈
    getStorageItem("size", (result) => {
      if (Object.keys(result).length > 0) {
        SIZE_RATIO = result.size;
        sizeInput.value = result.size;
        sizeIndicator.textContent = `${result.size}%`;
      }
    });
    // // 고정점 변경 허용
    getStorageItem("allowDotsCustom", (result) => {
      const allowDotsCustom =
        Object.keys(result).length > 0 && result.allowDotsCustom === true;
      ALLOW_DOTS_CUSTOM = allowDotsCustom;
      allowDotsCustomInput.checked = allowDotsCustom;
      dotCountInput.disabled = !allowDotsCustom;
    });
    // // 고정점
    getStorageItem("dotCount", (result) => {
      if (Object.keys(result).length > 0) {
        DOT_COUNT = result.dotCount;
        dotCountInput.value = result.dotCount;
        dotCountIndicator.textContent = result.dotCount;
      }
    });
    // // 스킨
    getStorageItem("skin", (result) => {
      const selectedSkin =
        IS_PAID && Object.keys(result).length > 0 ? result.skin : "default";
      for (let skinRadio of skinRadios) {
        if (skinRadio.value === selectedSkin) {
          skinRadio.checked = true;
          break;
        }
      }
    });
    // // 이동 방식
    getStorageItem("movementType", (result) => {
      const selectedType =
        IS_PAID && Object.keys(result).length > 0 ? result.movementType : "A";
      for (let movementTypeRadio of movementTypeRadios) {
        if (movementTypeRadio.value === selectedType) {
          movementTypeRadio.checked = true;
          break;
        }
      }
    });

    updateTimerStatus();
  }

  // 스토리지 변경 감시
  chrome.storage.onChanged.addListener(async function (changes, namespace) {
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
          await paymentHandlerSync(true);
        } else {
          await paymentHandlerSync(false);
        }
      }
    }

    updateTimerStatus();
  });

  // 결제 여부에 따른 설정
  function paymentHandlerSync(isPaid) {
    return new Promise((res, rej) => {
      if (isPaid) {
        IS_PAID = true;
        paymentSection.style.display = "none";
        locker.style.display = "none";
        timerWrapper.style.display = "none";
      } else {
        IS_PAID = false;
        paymentSection.style.display = "flex";
        locker.style.display = "flex";
        timerWrapper.style.display = "flex";
        // 결제 버튼
        paymentBtn.addEventListener("click", () => {
          // 결제 팝업 열기 요청 메세지 전송
          sendMessage({ openPayment: true }, (res) => {
            // 팝업 오픈 실패 시
            if (!res.success) {
            } else {
            }
          });
        });
      }

      res(true);
    });
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
    dotCountInput.value = DOT_COUNT;
    dotCountIndicator.textContent = DOT_COUNT;
  }

  // // 사이즈
  sizeInput.addEventListener("input", (e) => {
    if (!IS_PAID) {
      e.target.value = 100;
    } else {
      const { value } = e.target;
      SIZE_RATIO = value;
      sizeIndicator.textContent = `${value}%`;

      if (!ALLOW_DOTS_CUSTOM) {
        updateDotCount(propotionDotCount(SIZE_RATIO));
      }
    }
  });
  sizeInput.addEventListener("change", (e) => {
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

  // // 고정점 변경 허용
  allowDotsCustomInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.checked = false;
    } else {
      const { checked } = e.target;
      ALLOW_DOTS_CUSTOM = checked;
      updateStorageItem({ allowDotsCustom: checked });

      updateDotCount(propotionDotCount(SIZE_RATIO));
      updateStorageItem({ dotCount: DOT_COUNT });
      dotCountInput.disabled = !checked;
    }
  });

  // // 고정점 개수
  dotCountInput.addEventListener("input", (e) => {
    if (!IS_PAID) {
      e.target.value = 20;
    } else {
      const { value } = e.target;
      DOT_COUNT = value;
      dotCountIndicator.textContent = `${value}`;
    }
  });
  dotCountInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.value = 20;
    } else {
      const { value } = e.target;
      updateStorageItem({ dotCount: value });
    }
  });

  // 스킨 변경
  skinForm.addEventListener("change", () => {
    let selectedSkin = "default";
    if (IS_PAID) {
      for (let skinRadio of skinRadios) {
        if (skinRadio.checked) {
          if (skinRadio.value !== "default") {
            updateStorageItem({ paidContentsUsed: true });
          }
          selectedSkin = skinRadio.value;
          break;
        }
      }
    }
    updateStorageItem({ skin: selectedSkin });
  });

  // 이동 방식 변경
  movementTypeForm.addEventListener("change", () => {
    let selectedType = "A";
    if (IS_PAID) {
      for (let movementTypeRadio of movementTypeRadios) {
        if (movementTypeRadio.checked) {
          if (movementTypeRadio.value !== "A") {
            updateStorageItem({ paidContentsUsed: true });
          }
          selectedType = movementTypeRadio.value;
          break;
        }
      }
    }
    updateStorageItem({ movementType: selectedType });
  });

  console.log(movementTypeRadios);

  // 환불 버튼
  refundBtn?.addEventListener("click", () => {
    // 결제 팝업 열기 요청 메세지 전송
    sendMessage({ openManage: true }, (res) => {
      // 팝업 오픈 실패 시
      if (!res.success) {
      } else {
      }
    });
  });

  // 구매 복원 버튼
  restoreBtn.addEventListener("click", () => {
    // 결제 팝업 열기 요청 메세지 전송
    sendMessage({ openManage: true }, (res) => {
      // 팝업 오픈 실패 시
      if (!res.success) {
      } else {
      }
    });
  });

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

function getStorageItem(key, callback = () => null) {
  return new Promise((res, rej) => {
    chrome.storage.sync.get([key], (result) => {
      callback(result);
      res(result);
    });
  });
}

function reset() {
  removeStorageItem("enabled");
  removeStorageItem("pizza");
  removeStorageItem("isPaid");
  removeStorageItem("size");
  removeStorageItem("allowDotsCustom");
  removeStorageItem("dotCount");
  removeStorageItem("skin");
  removeStorageItem("movementType");
  removeStorageItem("paidContentsUsed");
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
} else {
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

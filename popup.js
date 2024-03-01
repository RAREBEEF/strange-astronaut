let IS_PAID = null;
let ENABLED = null;
let USER_DATA = null;
const TIMER = { interval: null };
const CUSTOMIZE = {
  allowDotCustom: false,
  handleSpacing: 40,
  sizeRatio: 100,
};

// 여기부터 빌드 시 삭제
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("date-del").onclick = () => {
    removeStorageItem("lastCheckDate");
  };
  document.getElementById("date-back").onclick = () => {
    updateStorageItem({ lastCheckDate: Date.now() - 604800000 });
  };
  document.getElementById("auth-del").onclick = () => {
    removeStorageItem("userData");
  };
  document.getElementById("isPaid-true").addEventListener("click", () => {
    updateStorageItem({ isPaid: true });
  });
  document.getElementById("isPaid-false").addEventListener("click", () => {
    updateStorageItem({ isPaid: false });
  });
});
// 여기까지 빌드 시 삭제

const DOMContentLoadedHandler = async () => {
  // iframe과 통신
  const iframe = document.getElementById("iframe");
  const iframeWindow = iframe.contentWindow;

  // 메세지 수신
  window.addEventListener("message", async (e) => {
    const { data } = e;

    if (data.requestIsPaid) {
      await getStorageItem("isPaid", (result) => {
        iframeWindow.postMessage(
          { responseIsPaid: true, isPaid: !!result?.isPaid },
          "*"
        );
      });
      // 마지막 체크일을 요청받음
    } else if (data.requestLastCheckDate) {
      await getStorageItem("lastCheckDate", (result) => {
        iframeWindow.postMessage(
          { responseLastCheckDate: true, lastCheckDate: result?.lastCheckDate },
          "*"
        );
      });
      // 유저 데이터 요청받음
    } else if (data.requestUserData) {
      await getStorageItem("userData", (result) => {
        USER_DATA = result?.userData;
        iframeWindow.postMessage(
          { responseUserData: true, userData: result?.userData },
          "*"
        );
      });
      // 결제 유지 중
    } else if (data.paymentCompleted) {
      sendMessage({ paymentCompleted: true }, (res) => {
        console.log(res);
      });
      updateStorageItem({ lastCheckDate: Date.now() });
      // 결제 취소됨을 확인함
    } else if (data.paymentCanceled) {
      // 백그라운드에 프리미엄 취소 요청
      sendMessage({ paymentCanceled: true }, (res) => {
        console.log(res);
      });
      updateStorageItem({ lastCheckDate: Date.now() });
    }
  });

  // HEADER
  const headerImg = document.getElementById("header-img");
  headerImg.src = chrome.runtime.getURL("src/images/logo512x265.png");
  // ELEMENTS

  // // 토글
  const toggleBtn = document.getElementById("toggle-btn");
  // // 타이머
  const timerWrapper = document.getElementById("timer-wrapper");
  const timerMinute = document.getElementById("timer-minute");
  const timerSecond = document.getElementById("timer-second");
  // // 결제
  const paymentSection = document.getElementById("payment-wrapper");
  const paymentBtn = document.getElementById("payment-btn");
  const restoreBtn = document.getElementById("restore-btn");
  // // 커스텀
  const locker = document.getElementById("locker");
  const sizeInput = document.getElementById("customize-size-input");
  const sizeIndicator = document.getElementById("size-indicator");
  const handleSpacingInput = document.getElementById(
    "customize-handle-spacing-input"
  );
  const handleSpacingIndicator = document.getElementById(
    "handle-spacing-indicator"
  );
  const allowDotsCustomInput = document.getElementById(
    "customize-allow-dots-custom-input"
  );
  const glitchTypeInput = document.getElementById(
    "customize-glitch-type-input"
  );
  const skinList = [
    "default",
    "glitch",
    "black",
    "blue",
    "red",
    "green",
    "pink",
  ];
  for (let skin of skinList) {
    const imgEl = document.getElementById(`${skin}-skin-thumb`);
    imgEl.src = chrome.runtime.getURL(
      `src/images/${skin}_character_right${skin === "glitch" ? "_1" : ""}.png`
    );
  }
  const skinForm = document.getElementById("customize-skin-wrapper");
  const skinRadios = skinForm.elements["skin"];
  const movementTypeForm = document.getElementById(
    "customize-movement-type-wrapper"
  );
  const movementTypeRadios = movementTypeForm.elements["movement-type"];
  // // 로그인/아웃
  const accountId = document.getElementById("account-id");
  const signInBtn = document.getElementById("signIn");
  const signOutBtn = document.getElementById("signOut");

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
    if (!TIMER.interval) {
      timerSecond.textContent = "--";
      timerMinute.textContent = "";

      let timerStartAt = null;
      sendMessage({ timerStartAt: true }, (res) => {
        timerStartAt = res;
      });

      TIMER.interval = setInterval(() => {
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
    if (!!TIMER.interval) {
      clearInterval(TIMER.interval);
      TIMER.interval = null;
      timerMinute.textContent = "05";
      timerSecond.textContent = "00";
    }
  }

  // 로그인/아웃 ui 업데이트 함수
  function updateSignUi(isSigned) {
    if (isSigned) {
      signInBtn.classList.add("hide");
      signOutBtn.classList.remove("hide");
      let account = "";

      if (USER_DATA.email) {
        const { email } = USER_DATA;
        const atSign = email.indexOf("@");
        account = email.slice(0, atSign);
      } else if (USER_DATA.phoneNumber) {
        account = USER_DATA.phoneNumber;
      }

      accountId.textContent = "account: " + account;
    } else {
      signInBtn.classList.remove("hide");
      signOutBtn.classList.add("hide");
      accountId.textContent = "";
    }
  }
  // 로그아웃 함수
  function signOut() {
    removeStorageItem("userData");
    removeStorageItem("lastCheckDate");
    sendMessage({ paymentCanceled: true }, (res) => {
      console.log(res);
    });
  }
  signOutBtn.onclick = signOut;

  // 초기화 함수
  async function init() {
    // 결제 여부 초기화
    await getStorageItem("isPaid", async (result) => {
      await paymentHandlerSync(!!result?.isPaid);
    });
    // 유저 데이터 초기화
    await getStorageItem("userData", async (result) => {
      USER_DATA = result?.userData;
      updateSignUi(!!result?.userData);
    });
    // 토글 상태 초기화
    await getStorageItem("enabled", async (result) => {
      if (!!result?.enabled) {
        enable();
      } else {
        disable();
      }
    });
    // 커스텀 초기화
    // // 글리치 타입
    getStorageItem("glitchIncludesAllSkins", (result) => {
      glitchTypeInput.checked = !!result?.glitchIncludesAllSkins;
    });
    // // 사이즈
    getStorageItem("size", (result) => {
      if (!!result?.size) {
        CUSTOMIZE.sizeRatio = result.size;
        sizeInput.value = result.size;
        sizeIndicator.textContent = `${result.size}%`;
      }
    });
    // // 고정점 변경 허용
    getStorageItem("allowDotsCustom", (result) => {
      const allowDotsCustom = !!result?.allowDotsCustom === true;
      CUSTOMIZE.allowDotCustom = allowDotsCustom;
      allowDotsCustomInput.checked = allowDotsCustom;
      handleSpacingInput.disabled = !allowDotsCustom;
    });
    // // 고정점
    getStorageItem("handleSpacing", (result) => {
      if (!!result?.handleSpacing) {
        CUSTOMIZE.handleSpacing = result.handleSpacing;
        handleSpacingInput.value = result.handleSpacing;
        handleSpacingIndicator.textContent = result.handleSpacing;
      }
    });
    // // 스킨
    getStorageItem("skin", (result) => {
      const selectedSkin = IS_PAID && !!result?.skin ? result.skin : "default";
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
        IS_PAID && !!result?.movementType ? result.movementType : "A";
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
      } else if (key === "userData") {
        USER_DATA = changes[key].newValue;
        updateSignUi(!!changes[key].newValue);
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
    toggleBtn.checked = true;
  }
  function disable() {
    ENABLED = false;
    toggleBtn.checked = false;
  }

  // 토글 버튼 클릭 (스토리지만 업데이트하고 앱 상태 변경에는 관여하지 않음)
  toggleBtn.addEventListener("change", async (e) => {
    const enabled = e.target.checked;
    updateStorageItem({ enabled });
  });

  // 커스텀 기능
  function propotionHandleSpacing(sizeRatio) {
    return Math.round(60 - 2000 / sizeRatio);
  }
  function updateHandleSpacing(handleSpacing) {
    CUSTOMIZE.handleSpacing = handleSpacing;
    handleSpacingInput.value = CUSTOMIZE.handleSpacing;
    handleSpacingIndicator.textContent = CUSTOMIZE.handleSpacing;
  }

  // // 글리치 타입
  glitchTypeInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.checked = false;
    } else {
      const { checked } = e.target;
      updateStorageItem({ glitchIncludesAllSkins: checked });
    }
  });

  // // 사이즈
  sizeInput.addEventListener("input", (e) => {
    if (!IS_PAID) {
      e.target.value = 100;
    } else {
      const { value } = e.target;
      CUSTOMIZE.sizeRatio = value;
      sizeIndicator.textContent = `${value}%`;

      if (!CUSTOMIZE.allowDotCustom) {
        updateHandleSpacing(propotionHandleSpacing(CUSTOMIZE.sizeRatio));
      }
    }
  });
  sizeInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.value = 100;
    } else {
      const { value } = e.target;
      updateStorageItem({ size: value });
      if (!CUSTOMIZE.allowDotCustom) {
        updateStorageItem({ handleSpacing: CUSTOMIZE.handleSpacing });
      }
    }
  });

  // // 고정점 변경 허용
  allowDotsCustomInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.checked = false;
    } else {
      const { checked } = e.target;
      CUSTOMIZE.allowDotCustom = checked;
      updateStorageItem({ allowDotsCustom: checked });

      updateHandleSpacing(propotionHandleSpacing(CUSTOMIZE.sizeRatio));
      updateStorageItem({ handleSpacing: CUSTOMIZE.handleSpacing });
      handleSpacingInput.disabled = !checked;
    }
  });

  // // 고정점 개수
  handleSpacingInput.addEventListener("input", (e) => {
    if (!IS_PAID) {
      e.target.value = 40;
    } else {
      const { value } = e.target;
      CUSTOMIZE.handleSpacing = value;
      handleSpacingIndicator.textContent = `${value}`;
    }
  });
  handleSpacingInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.value = 40;
    } else {
      const { value } = e.target;
      updateStorageItem({ handleSpacing: value });
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

  // 구매 복원 버튼
  restoreBtn.addEventListener("click", () => {
    // 구매 복원 팝업 열기 요청 메세지 전송
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
      callback(result || {});
      res(result || {});
    });
  });
}

function reset() {
  removeStorageItem("enabled");
  removeStorageItem("pizza");
  removeStorageItem("isPaid");
  removeStorageItem("size");
  removeStorageItem("allowDotsCustom");
  removeStorageItem("handleSpacing");
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

// // 언어 관련
// const langSelect = document.getElementById("lang-select");
// const timerDescription = document.getElementById("timer-description");
// const paymentDescription = document.getElementById("payment-description");
// const paymentBtnText = document.getElementById("payment-btn-text");

// const customizeMovementTypeLabel = document.getElementById(
//   "customize-movement-type-label"
// );
// const customizeSizeLabel = document.getElementById("customize-size-label");
// const customizeHandleSpacingLabel = document.getElementById(
//   "customize-handle-spacing-label"
// );
// const customizeSkinDefaultLabel = document.getElementById(
//   "customize-skin-default-label"
// );
// const customizeSkinGlitchLabel = document.getElementById(
//   "customize-skin-glitch-label"
// );
// const customizeSkinBlackLabel = document.getElementById(
//   "customize-skin-black-label"
// );
// const customizeSkinBlueLabel = document.getElementById(
//   "customize-skin-blue-label"
// );
// const customizeSkinRedLabel = document.getElementById(
//   "customize-skin-red-label"
// );
// const customizeSkinGreenLabel = document.getElementById(
//   "customize-skin-green-label"
// );
// const customizeSkinPinkLabel = document.getElementById(
//   "customize-skin-pink-label"
// );
// const termsOfUse = document.getElementById("termsOfUse");
// const privacyPolicy = document.getElementById("privacyPolicy");
// const copyright = document.getElementById("copyright");
// 언어 초기화
// getStorageItem("lang", (result) => {
//   changeLang(result.lang);
// });

// langSelect.addEventListener("change", (e) => {
//   const lang = e.target.value;
//   updateStorageItem({ lang });
//   changeLang(lang);
// });

// async function changeLang(lang) {
//   if (!lang) {
//     const defaultLang = navigator.language || navigator.userLanguage;
//     if (defaultLang.startsWith("ko")) {
//       langSelect.value = "ko";
//       lang = "ko";
//       updateStorageItem({ lang: "ko" });
//     } else {
//       langSelect.value = "en";
//       lang = "en";
//       updateStorageItem({ lang: "en" });
//     }
//   } else if (lang.startsWith("ko")) {
//     langSelect.value = "ko";
//   } else {
//     langSelect.value = "en";
//     lang = "en";
//   }

//   const translateUrl = chrome.runtime.getURL(
//     `locales/${lang}/translate.json`
//   );
//   const translate = await fetch(translateUrl).then((res) => res.json());
//   timerDescription.textContent = translate.toggle.timer.description;
//   paymentDescription.textContent = translate.payment.description;
//   paymentBtnText.textContent = translate.payment.btn;
//   restoreBtn.textContent = translate.payment.restore;
//   customizeMovementTypeLabel.textContent = translate.customize.movementType;
//   customizeSizeLabel.textContent = translate.customize.size;
//   customizeHandleSpacingLabel.textContent = translate.customize.handleSpacing;
//   customizeSkinDefaultLabel.textContent = translate.customize.skin.default;
//   customizeSkinGlitchLabel.textContent = translate.customize.skin.glitch;
//   customizeSkinBlackLabel.textContent = translate.customize.skin.black;
//   customizeSkinBlueLabel.textContent = translate.customize.skin.blue;
//   customizeSkinRedLabel.textContent = translate.customize.skin.red;
//   customizeSkinGreenLabel.textContent = translate.customize.skin.green;
//   customizeSkinPinkLabel.textContent = translate.customize.skin.pink;
//   copyright.textContent = translate.footer.copyright;
//   termsOfUse.textContent = translate.footer.termsOfUse;
//   privacyPolicy.textContent = translate.footer.privacyPolicy;
// }

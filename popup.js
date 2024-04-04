let IS_PAID = null;
let ENABLED = null;
let USER_DATA = null;
const CUSTOMIZE = {
  allowDotCustom: false,
  sizeRatio: 100,
  speedRatio: 100,
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
  // // 결제
  const paymentSection = document.getElementById("payment-wrapper");
  const paymentBtn = document.getElementById("payment-btn");
  const restoreBtn = document.getElementById("restore-btn");
  // // 커스텀
  const locker = document.getElementById("locker");
  const sizeInput = document.getElementById("customize-size-input");
  const sizeIndicator = document.getElementById("size-indicator");
  const speedInput = document.getElementById("customize-speed-input");
  const speedIndicator = document.getElementById("speed-indicator");
  const glitchTypeInput = document.getElementById(
    "customize-glitch-type-input"
  );
  const disableDropInput = document.getElementById(
    "customize-disable-drop-input"
  );
  const dropItemsInput = document.getElementById("customize-drop-items-input");
  const disableSpeechInput = document.getElementById(
    "customize-disable-speech-input"
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
  // // 로그인/아웃
  const accountId = document.getElementById("account-id");
  const signInBtn = document.getElementById("signIn");
  const signOutBtn = document.getElementById("signOut");

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
    // 드롭 토글
    getStorageItem("disableDrop", (result) => {
      disableDropInput.checked = !!result?.disableDrop;
    });
    // 드롭 아이템
    getStorageItem("dropItems", (result) => {
      dropItemsInput.value = result?.dropItems || "🍕🥕🥄🔧🔑💵";
    });
    // 말풍선 토글
    getStorageItem("disableSpeech", (result) => {
      disableSpeechInput.checked = !!result?.disableSpeech;
    });
    // // 사이즈
    getStorageItem("size", (result) => {
      if (!!result?.size) {
        CUSTOMIZE.sizeRatio = result.size;
        sizeInput.value = result.size;
        sizeIndicator.textContent = `${result.size}%`;
      }
    });
    // // 사이즈
    getStorageItem("speed", (result) => {
      if (!!result?.speed) {
        CUSTOMIZE.speedRatio = result.speed;
        speedInput.value = result.speed;
        speedIndicator.textContent = `${result.speed}%`;
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

    // updateTimerStatus();
  });

  // 결제 여부에 따른 설정
  function paymentHandlerSync(isPaid) {
    return new Promise((res, rej) => {
      if (isPaid) {
        IS_PAID = true;
        paymentSection.style.display = "none";
        locker.style.display = "none";
      } else {
        IS_PAID = false;
        paymentSection.style.display = "flex";
        locker.style.display = "flex";
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
  // // 글리치 타입
  glitchTypeInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.checked = false;
    } else {
      const { checked } = e.target;
      updateStorageItem({ glitchIncludesAllSkins: checked });
    }
  });
  // // 드롭 토글
  disableDropInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.checked = false;
    } else {
      const { checked } = e.target;
      updateStorageItem({ disableDrop: checked });
    }
  });
  // // 드롭 아이템
  dropItemsInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.value = "🍕,🥕,🥄,🔧,🔑,💵";
    } else {
      const { value } = e.target;
      updateStorageItem({ dropItems: value });
    }
  });
  // // 말풍선 토글
  disableSpeechInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.checked = false;
    } else {
      const { checked } = e.target;
      updateStorageItem({ disableSpeech: checked });
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
    }
  });
  sizeInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.value = 100;
    } else {
      const { value } = e.target;
      updateStorageItem({ size: value });
    }
  });

  // // 스피드
  speedInput.addEventListener("input", (e) => {
    if (!IS_PAID) {
      e.target.value = 100;
    } else {
      const { value } = e.target;
      CUSTOMIZE.speedRatio = value;
      speedIndicator.textContent = `${value}%`;
    }
  });
  speedInput.addEventListener("change", (e) => {
    if (!IS_PAID) {
      e.target.value = 100;
    } else {
      const { value } = e.target;
      updateStorageItem({ speed: value });
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
  removeStorageItem("isPaid");
  removeStorageItem("size");
  removeStorageItem("skin");
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

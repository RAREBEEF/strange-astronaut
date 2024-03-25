// canvas & context
const cvs = document.createElement("canvas");
const ctx = cvs.getContext("2d");
const offscreenCvs = document.createElement("canvas");
const offscreenCtx = offscreenCvs.getContext("2d");

// canvas styles
cvs.id = "Strange_Astronaut";
cvs.style.position = "fixed";
cvs.style.top = 0;
cvs.style.left = 0;
cvs.style.pointerEvents = "none";
cvs.style.zIndex = 10000;
cvs.style.transform = "translate3d(-100vw,-100vh,0)";
cvs.style.maxHeight = "200vh";
cvs.style.maxWidth = "200vw";
// 뷰포트의 2배 크기인 캔버스를 0.5배율로 조절해 사이즈를 맞춤
cvs.style.scale = "0.5";

const skin = {
  current: "default",
  getSkinList: function () {
    return Object.keys(this).filter(
      (name) => !["current", "getSkinList", "getThis"].includes(name)
    );
  },
  default: {
    color: {
      body: "#F5F5F5",
      feet: "#ffec00",
      outline: "lightgray",
    },
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/default_character_right.png`),
        left: chrome.runtime.getURL(`src/images/default_character_left.png`),
      },
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
  },
  black: {
    color: {
      body: "#151515",
      feet: "#ffec00",
      outline: "lightgray",
    },
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/black_character_right.png`),
        left: chrome.runtime.getURL(`src/images/black_character_left.png`),
      },
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
  },
  blue: {
    color: {
      body: "#3384C6",
      feet: "#ffec00",
      outline: "lightgray",
    },
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/blue_character_right.png`),
        left: chrome.runtime.getURL(`src/images/blue_character_left.png`),
      },
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
  },
  red: {
    color: {
      body: "#E61C44",
      feet: "#ffec00",
      outline: "lightgray",
    },
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/red_character_right.png`),
        left: chrome.runtime.getURL(`src/images/red_character_left.png`),
      },
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
  },
  green: {
    color: {
      body: "#00A260",
      feet: "#ffec00",
      outline: "lightgray",
    },
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/green_character_right.png`),
        left: chrome.runtime.getURL(`src/images/green_character_left.png`),
      },
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
  },
  pink: {
    color: {
      body: "#E95883",
      feet: "#ffec00",
      outline: "lightgray",
    },
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/pink_character_right.png`),
        left: chrome.runtime.getURL(`src/images/pink_character_left.png`),
      },
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
  },
  glitch: {
    includesAllSkin: false,
    image: {
      head: {
        right: chrome.runtime.getURL(`src/images/glitch_character_right_1.png`),
        left: chrome.runtime.getURL(`src/images/glitch_character_left_1.png`),
      },
      effect: [
        chrome.runtime.getURL("src/images/glitch_effect_0.png"),
        chrome.runtime.getURL("src/images/glitch_effect_1.png"),
        chrome.runtime.getURL("src/images/glitch_effect_2.png"),
      ],
      finger: {
        left: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
        right: `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`,
      },
    },
    color: {
      blue: "rgb(90, 198, 198)",
      red: "rgb(220, 80, 80)",
      body: "#F5F5F5",
      feet: "#ffec00",
      outline: "lightgray",
    },
    srcs: {
      head: {
        left: new Array(6)
          .fill(null)
          .map((_, i) =>
            chrome.runtime.getURL(`src/images/glitch_character_left_${i}.png`)
          ),
        right: new Array(6)
          .fill(null)
          .map((_, i) =>
            chrome.runtime.getURL(`src/images/glitch_character_right_${i}.png`)
          ),
      },
      effect: new Array(9)
        .fill(null)
        .map((_, i) =>
          chrome.runtime.getURL(`src/images/glitch_effect_${i}.png`)
        ),
    },
    /**
     * 글리치 이미지(0~12) 혹은 그 외 다른 모든 스킨들 중 하나로 글리치 스킨의 외형을 랜덤화하는 메소드
     */
    randomize: function () {
      const includeOtherSkins = this.includesAllSkin;
      const skinList = includeOtherSkins ? skin.getSkinList() : [];

      // 글리치 이펙트 (0~8)
      for (let i = 0; i < 3; i++) {
        const randomEffectInt = Math.round(Math.random() * 8);
        this.image.effect[i] = this.srcs.effect[randomEffectInt];
      }
      // 글리치 머리 이미지 개수 (6)
      const glitchImgCount = this.srcs.head.right.length;
      // 0 ~ 6
      // [glitch0, glitch1, glitch2, glitch3, glitch4, glitch5]
      // 7 ~ 13
      // ['default', 'black', 'blue', 'red', 'green', 'pink', 'glitch']
      // 맥시멈을 12로 제한해 13번인 글리치가 나오지 않도록
      const randomBodyInt = Math.round(
        Math.random() * (glitchImgCount + skinList.length - 1)
      );
      // 랜덤값이 글리치 범위 내면 글리치 머리 이미지와 색상 사용
      if (randomBodyInt < glitchImgCount) {
        this.image.head.right = this.srcs.head.right[randomBodyInt];
        this.image.head.left = this.srcs.head.left[randomBodyInt];
        this.color.body = "#F5F5F5";
      } else {
        // 랜덤값이 글리치 범위 외면 값에 해당하는 스킨의 머리 이미지와 색상 사용
        const currentColor = skinList[randomBodyInt - glitchImgCount];
        this.image.head.right = skin[currentColor].image.head.right;
        this.image.head.left = skin[currentColor].image.head.left;
        this.color.body = skin[currentColor].color.body;
      }
    },
  },
};

// variable
let isPaid = false;
// let timerStartAt = null;
let headToRight = true;
let dots = {};
// 고해상도를 위해 캔버스 사이즈를 뷰포트 사이즈의 2배로 설정
let cvsSize = [window.innerWidth * 2, window.innerHeight * 2];
let mousePos = [null, null];
let bodyPos = [null, null];
let feet = null;
let animationFrameId = null;
let areaDivide = 20;
let areaGap = 10;
let sizeRatio = 1;
let bodyWidth = Math.max(...cvsSize) * 0.01 * sizeRatio;
let bodyHeight = bodyWidth * 2.3;
let limbsWidth = bodyWidth * 0.8;
let movementType = "A";

function sendMessage(message, callback = () => null) {
  chrome.runtime.sendMessage(message, (res) => callback(res));
}

// 서비스워커가 꺼지지 않도록
const swKeepAlive = {
  interval: null,
  sendMsgToSw() {
    sendMessage({ swKeepAlive: true }, (res) => {
      console.log(res);
    });
  },
};

// 프로그램 토글 여부 초기화
getStorageItem("enabled", (result) => {
  if (!!result?.enabled) {
    enable();
  }
});
// 타이머 초기화
// getStorageItem("timerStartAt", (result) => {
//   if (!!result?.timerStartAt) {
//     timerStartAt = result.timerStartAt;
//   }
// });
// 결제 여부 초기화
getStorageItem("isPaid", (result) => {
  isPaid = !!result?.isPaid;
});
// 사이즈 초기화
getStorageItem("size", (result) => {
  if (!!result?.size) {
    customizeSize(result.size);
  }
});
// 고정점 개수 초기화
getStorageItem("handleSpacing", (result) => {
  if (!!result?.handleSpacing) {
    customizeDots(parseInt(result.handleSpacing));
  }
});
// 스킨 초기화
getStorageItem("skin", (result) => {
  if (!!result?.skin) {
    skin.current = result.skin;
  }
});
// 글리치 타입 초기화
getStorageItem("glitchIncludesAllSkins", (result) => {
  skin.glitch.includesAllSkin = !!result?.glitchIncludesAllSkins;
});
// 이동 방식 초기화
getStorageItem("movementType", (result) => {
  if (!!result?.movementType) {
    movementType = result.movementType;
  }
});

// 프로그램 활성화 여부 및 결제 여부 등 감시
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    // 활성화 여부
    if (key === "enabled") {
      const status = changes[key].newValue;
      if (status === true) {
        enable();
      } else {
        disable();
      }
    } else if (key === "isPaid") {
      const status = changes[key].newValue;
      if (status === true) {
        isPaid = true;
        clearInterval(swKeepAlive.interval);
        swKeepAlive.interval = null;
      } else {
        isPaid = false;
      }
    } else if (key === "size") {
      const size = changes[key].newValue;
      customizeSize(size);
    } else if (key === "handleSpacing") {
      const handleSpacing = changes[key].newValue;
      customizeDots(parseInt(handleSpacing));
    } else if (key === "skin") {
      const newSkin = changes[key].newValue;
      skin.current = newSkin;
    } else if (key === "glitchIncludesAllSkins") {
      const glitchIncludesAllSkins = changes[key].newValue;
      skin.glitch.includesAllSkin = glitchIncludesAllSkins;
    } else if (key === "movementType") {
      const newType = changes[key].newValue;
      movementType = newType;
    }
    // else if (key === "timerStartAt") {
    //   const startAt = changes[key].newValue;
    //   timerStartAt = startAt;
    // }
  }
});
// 팝업에서 메세지를 보낼 경우 여기에서 가장 먼저 수신한다.
const receiveMessage = async (e) => {
  // 보안 검사
  if (
    e.origin !== window.location.origin ||
    e.origin !== "http://localhost:3000"
  ) {
    return;
  }
  // 받은 데이터
  const { data } = e;

  console.log("content has received data.", data);

  // 로그인 성공
  if (data.uid) {
    updateStorageItem({ userData: data });
    // 결제가 성공한 경우
  } else if (data.status === "COMPLETED") {
    // 백그라운드에 결제가 성공했음을 알림는 메세지를 전송한다.
    sendMessage({ paymentCompleted: true }, function (res) {
      console.log(res);
      // 백그라운드에서 확인이 완료되면 결제 팝업에 확인했다고 답장 보내기
      window.postMessage("Payment confirmed.", "http://localhost:3000");
    });
    // 결제가 취소된 경우
  } else if (data.status === "REFUNDED") {
    console.log(data);
    sendMessage({ paymentCanceled: true }, function (res) {
      console.log(res);
      // 백그라운드에서 확인이 완료되면 결제 팝업에 확인했다고 답장 보내기
      window.postMessage("Payment canceled.", "http://localhost:3000");
    });
  }
};
window.addEventListener("message", receiveMessage);

function updateStorageItem(item) {
  chrome.storage.sync.set(item);
}
function removeStorageItem(item) {
  chrome.storage.sync.remove(item);
}
async function getStorageItem(key, callback = () => null) {
  let res = null;
  await chrome.storage.sync.get([key], (result) => {
    callback(result || {});
    res = result || {};
  });
  return res;
}

const createDots = (cvsSize) => {
  dots = {};
  let [cvsWidth, cvsHeight] = cvsSize;
  cvs.width = cvsWidth;
  cvs.height = cvsHeight;
  offscreenCvs.width = cvsWidth;
  offscreenCvs.height = cvsHeight;

  const areas = [];
  const areaWidth = (cvsWidth - areaGap * areaDivide) / areaDivide;
  const areaHeight = (cvsHeight - areaGap * areaDivide) / areaDivide;

  for (let i = 1; i <= areaDivide + 2; i++) {
    const startY =
      areaGap / 2 + (areaHeight + areaGap) * (i - 1) - (areaHeight + areaGap);
    const endY = startY + areaHeight;

    for (let j = 1; j <= areaDivide + 2; j++) {
      const startX =
        areaGap / 2 + (areaWidth + areaGap) * (j - 1) - (areaWidth + areaGap);
      const endX = startX + areaWidth;

      areas.push({
        startX,
        startY,
        endX,
        endY,
        width: areaWidth,
        height: areaHeight,
      });
    }
  }

  for (const area of areas) {
    const { startX, endX, startY, endY } = area;
    const x = Math.floor(Math.random() * (endX - startX) + startX);
    const y = Math.floor(Math.random() * (endY - startY) + startY);

    const dot = {
      x,
      y,
      trackingMouse: false,
    };

    dots[GENERATE_ID()] = dot;
  }
};

const updateFeet = () => {
  const [mouseX, mouseY] = mousePos;
  if (mouseX === null || mouseY === null) return;

  const bodyX = bodyPos[0] ?? mouseX;
  const bodyY = bodyPos[1] ?? mouseY;

  const mouseBodyX = mouseX;
  const mouseBodyY = mouseY + bodyHeight;

  // 몸통 위치
  let newBodyX = bodyX;
  let newBodyY = bodyY;

  let deltaX, deltaY, distance;

  deltaX = mouseBodyX - bodyX;
  deltaY = mouseBodyY - bodyY;
  // 몸통과 마우스 사이의 거리를 좀 두고 싶다면 아래 값으로 사용
  distance = Math.sqrt(deltaX ** 2 + deltaY ** 2) - bodyHeight * 2;

  if (movementType === "B" || distance <= bodyHeight * 2) {
    const centerFeetX =
      (feet?.reduce(
        (acc, cur, i) => (cur.trackingMouse ? acc : acc + cur.x),
        0
      ) +
        mouseX) /
        4 || 0;
    const centerFeetY =
      (feet?.reduce(
        (acc, cur, i) => (cur.trackingMouse ? acc : acc + cur.y),
        0
      ) +
        mouseY) /
        4 || 0;
    deltaX = centerFeetX - bodyX;
    deltaY = centerFeetY - bodyY;
    // 몸통이 마우스 정위치로 움직이고 싶다면 아래 값으로 사용
    distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  }

  const dampingFactor = 0.2;
  const curSpeed = Math.min(
    distance / (movementType === "B" ? 5 : 20),
    bodyWidth * 1.5
  );
  const SPEED = curSpeed < 0.01 ? 0 : curSpeed * dampingFactor;

  if (SPEED > 0) {
    const angle = Math.atan2(deltaY, deltaX);
    const velocityX = SPEED * Math.cos(angle);
    const velocityY = SPEED * Math.sin(angle);
    newBodyX += velocityX;
    newBodyY += velocityY;
    bodyPos = [newBodyX, newBodyY];
  } else {
    bodyPos = [bodyX, bodyY];
  }

  // 다리 위치
  const quadrant1 = [],
    quadrant2 = [],
    quadrant3 = [],
    quadrant4 = [];

  for (const [id, dot] of Object.entries(dots)) {
    const { x: dotX, y: dotY } = dot;

    const deltaX = newBodyX - dotX;
    const deltaY = newBodyY - dotY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const dotDistance = { id, distance };

    if (dotX <= bodyX) {
      if (dotY <= bodyY) {
        quadrant2.push(dotDistance);
      } else {
        quadrant3.push(dotDistance);
      }
    } else {
      if (dotY <= bodyY) {
        quadrant1.push(dotDistance);
      } else {
        quadrant4.push(dotDistance);
      }
    }
  }

  const sortedQuadrant1 = DOT_SORT(quadrant1),
    sortedQuadrant2 = DOT_SORT(quadrant2),
    sortedQuadrant3 = DOT_SORT(quadrant3),
    sortedQuadrant4 = DOT_SORT(quadrant4);

  // const nearDot1 = sortedQuadrant1[0]?.id,
  //   nearDot2 = sortedQuadrant2[0]?.id,
  //   nearDot3 = sortedQuadrant3[0]?.id,
  //   nearDot4 = sortedQuadrant4[0]?.id,
  //   nearDots = [nearDot1, nearDot2, nearDot3, nearDot4];

  // 다리는 몸통과 너무 가깝지 않도록 조절
  const nearDot1 = sortedQuadrant1[0]?.id,
    nearDot2 = sortedQuadrant2[0]?.id,
    nearDot3 =
      dots[sortedQuadrant3[0]?.id]?.y > bodyY + bodyHeight * 0.3
        ? sortedQuadrant3[0]?.id
        : sortedQuadrant3[1]?.id,
    nearDot4 =
      dots[sortedQuadrant4[0]?.id]?.y > bodyY + bodyHeight * 0.3
        ? sortedQuadrant4[0]?.id
        : sortedQuadrant4[1]?.id,
    nearDots = [nearDot1, nearDot2, nearDot3, nearDot4];

  let newFeet = feet;

  if (
    !newFeet &&
    (!dots[nearDot1] || !dots[nearDot2] || !dots[nearDot3] || !dots[nearDot4])
  ) {
    return null;
  }

  newFeet ??= [dots[nearDot1], dots[nearDot2], dots[nearDot3], dots[nearDot4]];

  for (let i = 0; i < newFeet.length; i++) {
    const foot = newFeet[i];
    const { x: footX, y: footY } = foot;
    const nearDot = nearDots[i];
    let targetX, targetY;

    // 손가락 가리키는거 비활성화하려면 아래 값을 false로
    const isTrackingMouse =
      (i === 0 && bodyX <= mouseBodyX) || (i === 1 && bodyX > mouseBodyX);

    // 마우스 방향따라 머리 방향 지정
    if (i === 0 && isTrackingMouse) {
      headToRight = true;
    } else if (i === 1 && isTrackingMouse) {
      headToRight = false;
    }

    if (isTrackingMouse) {
      targetX =
        mouseX +
        limbsWidth *
          ((bodyX - mouseX - Math.sign(bodyX - mouseX) * limbsWidth * 2) /
            (limbsWidth * 4));
      targetY = mouseY + Math.sign(bodyY - mouseY) * limbsWidth * 1.5;

      const deltaX = bodyX - targetX;
      const deltaY = bodyY - targetY;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      if (distance >= bodyHeight * 3) {
        const directionX = mouseX - bodyX;
        const directionY = mouseY - bodyY;
        const length = Math.sqrt(
          directionX * directionX + directionY * directionY
        );
        const unitDirectionX = directionX / length;
        const unitDirectionY = directionY / length;
        targetX = bodyX + unitDirectionX * bodyHeight * 3;
        targetY = bodyY + unitDirectionY * bodyHeight * 3;
      }
    } else {
      targetX = dots[nearDot]?.x;
      targetY = dots[nearDot]?.y;
    }

    if (!targetX || !targetY) continue;

    let newFootX, newFootY;

    const deltaX = targetX - footX;
    const deltaY = targetY - footY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const dampingFactor = 0.6;
    const curSpeed = Math.min(distance / 3, bodyWidth * 1.5);
    console.log(curSpeed, bodyWidth);
    const SPEED = curSpeed < 0.01 ? 0 : curSpeed * dampingFactor;

    if (SPEED > 0) {
      const angle = Math.atan2(deltaY, deltaX);
      const velocityX = SPEED * Math.cos(angle);
      const velocityY = SPEED * Math.sin(angle);
      newFootX = footX + velocityX;
      newFootY = footY + velocityY;
    } else {
      newFootX = targetX;
      newFootY = targetY;
    }

    newFeet[i] = {
      ...newFeet[i],
      x: newFootX,
      y: newFootY,
      trackingMouse: isTrackingMouse,
    };
  }

  feet = newFeet;
};

const draw = () => {
  if (bodyPos[0] === null || bodyPos[1] === null) return;

  const [cvsWidth, cvsHeight] = cvsSize;
  let [mouseX, mouseY] = mousePos;
  let [bodyX, bodyY] = bodyPos;

  const isGlitch = skin.current === "glitch";
  let glitchRandomValue = 0;
  if (isGlitch) {
    skin.glitch.randomize();
    glitchRandomValue =
      (bodyWidth / Math.round(Math.random() * (25 - 20) + 20)) *
      (Math.random() < 0.5 ? -1 : 1);
  }

  // 그리기 명령 배열
  const drawCommands1 = [];
  const drawCommands2 = [];
  const drawCommands3 = [];
  const drawShadowCommads = [];

  // 팔다리 몸통 그리기
  // 팔다리
  if (!!feet) {
    for (let i = 0; i < feet.length; i++) {
      let { x, y } = feet[i];
      x += glitchRandomValue;
      y += glitchRandomValue;
      let jointX = bodyX + glitchRandomValue;
      let jointY = bodyY + glitchRandomValue;
      let controlX = (x + jointX) / 2 + glitchRandomValue;
      let controlY = (y + jointY) / 2 + glitchRandomValue;

      // 오른팔
      if (i === 0) {
        jointX += bodyWidth / 2 - limbsWidth / 2;
        jointY -= bodyHeight / 2;

        // 왼팔
      } else if (i === 1) {
        jointX -= bodyWidth / 2 - limbsWidth / 2;
        jointY -= bodyHeight / 2;

        // 왼다리
      } else if (i === 2) {
        jointX -= bodyWidth / 2 - limbsWidth / 2;
        jointY += bodyHeight / 2 - limbsWidth / 2;
        controlY -= limbsWidth;
        // 오른 다리
      } else {
        jointX += bodyWidth / 2 - limbsWidth / 2;
        jointY += bodyHeight / 2 - limbsWidth / 2;
        controlY -= limbsWidth;
      }

      // 팔다리 테두리
      (i <= 1 ? drawCommands3 : drawCommands2).push((ctx) => {
        ctx.strokeStyle = "#000000";
        ctx.lineCap = "round";
        ctx.lineWidth = limbsWidth * 1.1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(controlX, controlY, jointX, jointY);
        ctx.stroke();
      });

      // 팔다리
      (i <= 1 ? drawCommands3 : drawCommands2).push((ctx) => {
        ctx.strokeStyle = skin[skin.current].color.body;
        ctx.lineCap = "round";
        ctx.lineWidth = limbsWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(controlX, controlY, jointX, jointY);
        ctx.stroke();
      });

      // 팔다리 그림자
      drawShadowCommads.push((ctx) => {
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          controlX - bodyWidth,
          controlY + bodyWidth,
          jointX - bodyWidth,
          jointY + bodyWidth
        );
      });

      if (isGlitch) {
        (i <= 1 ? drawCommands3 : drawCommands2).unshift((ctx) => {
          ctx.strokeStyle = skin.glitch.color.red;
          ctx.lineCap = "round";
          ctx.lineWidth = limbsWidth * 1.1 + glitchRandomValue * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            controlX + glitchRandomValue * 2,
            controlY + glitchRandomValue * 2,
            jointX + glitchRandomValue * 2,
            jointY + glitchRandomValue * 2
          );
          ctx.stroke();
          ctx.strokeStyle = skin.glitch.color.blue;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            controlX - glitchRandomValue * 2,
            controlY - glitchRandomValue * 2,
            jointX - glitchRandomValue * 2,
            jointY - glitchRandomValue * 2
          );
          ctx.stroke();
        });

        const glitchEffect1 = new Image();
        const glitchEffect2 = new Image();
        const glitchEffect3 = new Image();
        glitchEffect1.src = skin.glitch.image.effect[0];
        glitchEffect2.src = skin.glitch.image.effect[1];
        glitchEffect3.src = skin.glitch.image.effect[2];

        let effectX1 = x;
        let effectY1 = y;
        let effectX2 = jointX;
        let effectY2 = jointY;
        let effectX3 = controlX;
        let effectY3 = controlY;

        const deltaX = x - jointX;
        const deltaY = y - jointY;
        const effectSize = Math.sqrt(deltaX ** 2 + deltaY ** 2) / 2;

        if (i <= 1) {
          effectY1 -= effectSize / 2;
          effectY2 -= effectSize / 2;
          effectY3 -= effectSize / 2;
          if (i === 0) {
            effectX1 -= effectSize / 2;
            effectX3 -= effectSize / 4;
          } else if (i === 1) {
            effectX1 -= effectSize / 2;
            effectX2 -= effectSize;
            effectX3 -= effectSize;
          }
        } else {
          effectY1 -= effectSize / 2;
          if (i === 2) {
            effectX1 -= effectSize / 2;
            effectX2 -= effectSize;
            effectX3 -= effectSize;
          } else if (i === 3) {
            effectX1 -= effectSize / 2;
            effectX2 -= effectSize / 2;
            effectX3 -= effectSize / 2;
          }
        }

        drawCommands3.push((ctx) => {
          ctx.drawImage(
            glitchEffect1,
            effectX1,
            effectY1,
            effectSize,
            effectSize
          );
        });
        drawCommands3.push((ctx) => {
          ctx.drawImage(
            glitchEffect2,
            effectX2,
            effectY2,
            effectSize,
            effectSize
          );
        });
        drawCommands3.push((ctx) => {
          ctx.drawImage(
            glitchEffect3,
            effectX3,
            effectY3,
            effectSize,
            effectSize
          );
        });
      }
    }
  }

  // 몸통 테두리
  drawCommands2.push((ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.rect(
      bodyX - (bodyWidth * 1.1) / 2,
      bodyY - bodyHeight / 2,
      bodyWidth * 1.1,
      bodyHeight - bodyHeight / 5
    );
    ctx.closePath();
    ctx.fill();
  });
  // 몸통
  drawCommands2.push((ctx) => {
    ctx.fillStyle = skin[skin.current].color.body;
    ctx.beginPath();
    ctx.rect(
      bodyX - bodyWidth / 2,
      bodyY - bodyHeight / 2,
      bodyWidth,
      bodyHeight - bodyHeight / 5
    );
    ctx.closePath();
    ctx.fill();
  });

  // 몸통 그림자
  drawShadowCommads.push((ctx) => {
    ctx.moveTo(bodyX - bodyWidth, bodyY);
    ctx.lineTo(bodyX - bodyWidth, bodyY + bodyHeight - bodyWidth / 2);
  });

  // 어깨
  drawCommands2.push((ctx) => {
    ctx.fillStyle = skin[skin.current].color.body;
    ctx.beginPath();
    ctx.arc(bodyX, bodyY - bodyHeight / 2, bodyWidth / 2, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  });

  // 엉덩이 테두리
  drawCommands2.push((ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(
      bodyX + glitchRandomValue,
      bodyY + bodyHeight / 2 - bodyHeight / 5 + glitchRandomValue,
      (bodyWidth * 1.1) / 2,
      Math.PI * 2,
      Math.PI * 3
    );
    ctx.closePath();
    ctx.fill();
  });

  // 엉덩이
  drawCommands2.push((ctx) => {
    ctx.fillStyle = skin[skin.current].color.body;
    ctx.beginPath();
    ctx.arc(
      bodyX,
      bodyY + bodyHeight / 2 - bodyHeight / 5,
      bodyWidth / 2,
      Math.PI * 2,
      Math.PI * 3
    );
    ctx.closePath();
    ctx.fill();
  });

  // 손발 그리기
  if (!!feet) {
    for (let j = 0; j < feet?.length; j++) {
      const i = isGlitch ? Math.round(Math.random() * 3) : j;
      const { x, y, trackingMouse } = feet[i];
      const deltaX = x - mouseX;
      const deltaY = y - mouseY;
      const angle = -Math.atan2(deltaX, deltaY);

      // 오른손
      if (i === 0) {
        if (trackingMouse) {
          const img = new Image();
          img.src =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(skin[skin.current].image.finger.right);

          drawCommands3.unshift((ctx) => {
            // 계산한 각도로 컨텍스트 회전
            ctx.rotate(angle);

            const rotatedRHandX = x * Math.cos(angle) + y * Math.sin(angle);
            const rotatedRHandY = -x * Math.sin(angle) + y * Math.cos(angle);

            ctx.drawImage(
              img,
              rotatedRHandX - limbsWidth,
              rotatedRHandY - limbsWidth * 1.5,
              limbsWidth * 2,
              limbsWidth * 2
            );

            ctx.setTransform(1, 0, 0, 1, 0, 0);
          });
        } else {
          drawCommands2.unshift((ctx) => {
            ctx.fillStyle = skin[skin.current].color.feet;
            ctx.beginPath();
            ctx.ellipse(
              x,
              y - limbsWidth / 4,
              limbsWidth * 0.5,
              limbsWidth * 0.8,
              (Math.PI / 180) * 20,
              0,
              Math.PI * 2
            );
            ctx.ellipse(
              x - limbsWidth / 2,
              y - limbsWidth / 4,
              limbsWidth * 0.4,
              limbsWidth * 0.2,
              (Math.PI / 180) * 45,
              0,
              Math.PI * 2
            );
            ctx.closePath();
            ctx.fill();
          });
        }
        // 왼손
      } else if (i === 1) {
        if (trackingMouse) {
          const img = new Image();
          img.src =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(skin[skin.current].image.finger.left);

          drawCommands3.unshift((ctx) => {
            // 계산한 각도로 컨텍스트 회전
            ctx.rotate(angle);

            const rotatedRHandX = x * Math.cos(angle) + y * Math.sin(angle);
            const rotatedRHandY = -x * Math.sin(angle) + y * Math.cos(angle);

            ctx.drawImage(
              img,
              rotatedRHandX - limbsWidth,
              rotatedRHandY - limbsWidth * 1.5,
              limbsWidth * 2,
              limbsWidth * 2
            );

            ctx.setTransform(1, 0, 0, 1, 0, 0);
          });
        } else {
          drawCommands2.unshift((ctx) => {
            ctx.fillStyle = skin[skin.current].color.feet;
            ctx.beginPath();
            ctx.ellipse(
              x,
              y - limbsWidth / 4,
              limbsWidth * 0.5,
              limbsWidth * 0.8,
              (Math.PI / 180) * 340,
              0,
              Math.PI * 2
            );
            ctx.ellipse(
              x + limbsWidth / 2,
              y - limbsWidth / 4,
              limbsWidth * 0.4,
              limbsWidth * 0.2,
              (Math.PI / 180) * 135,
              0,
              Math.PI * 2
            );
            ctx.closePath();
            ctx.fill();
          });
        }
        // 발
      } else {
        drawCommands2.unshift((ctx) => {
          ctx.fillStyle = skin[skin.current].color.feet;
          ctx.beginPath();
          ctx.ellipse(
            x,
            y - limbsWidth / 5,
            limbsWidth * 0.6,
            limbsWidth * 0.8,
            0,
            0,
            Math.PI * 2
          );
          ctx.closePath();
          ctx.fill();
        });
      }
    }
  }

  // // 머리
  const headImg = new Image();
  headImg.src = headToRight
    ? skin[skin.current].image.head.right
    : skin[skin.current].image.head.left;

  drawCommands3.push((ctx) => {
    ctx.drawImage(
      headImg,
      bodyX - bodyWidth * 2.1,
      bodyY - bodyHeight * 1.5,
      bodyWidth * 4.2,
      bodyWidth * 4.2
    );
  });

  // 머리 그림자
  drawShadowCommads.push((ctx) => {
    ctx.arc(
      bodyX - bodyWidth,
      bodyY - bodyHeight + bodyWidth,
      limbsWidth / 2,
      Math.PI * 2,
      0
    );
  });

  // !isPaid &&
  //   drawCommands3.push((ctx) => {
  //     const [H, M, S] = secToHMS(
  //       Math.round((300000 + timerStartAt - Date.now()) / 1000)
  //     );
  //     const text = `${M.toString().padStart(2, "0")}:${Math.round(S)
  //       .toString()
  //       .padStart(2, "0")}`;
  //     ctx.fillStyle = "black";
  //     ctx.font = "24px monospace";
  //     ctx.fillText(text, bodyX - 36, bodyY - bodyHeight * 1.5);
  //   });

  // 그림자 그리기 명령을 drawCommands1으로 합치기
  drawCommands1.unshift(
    (ctx) => {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.lineCap = "round";
      ctx.lineWidth = limbsWidth * 1.05;
      ctx.beginPath();
    },
    ...drawShadowCommads,
    (ctx) => {
      ctx.stroke();
    }
  );

  // 캔버스 전체 지우기 및 설정
  drawCommands1.unshift((ctx) => {
    ctx.clearRect(0, 0, cvsWidth, cvsHeight);
  });

  const allDrawCommands = drawCommands1.concat(drawCommands2, drawCommands3);

  // 머리 이미지의 로드가 완료되면
  headImg.onload = () => {
    // 모든 그리기 명령 실행
    for (let i = 0; i < allDrawCommands.length; i++) {
      const command = allDrawCommands[i];
      command(offscreenCtx);
    }

    // 더블 버퍼링
    ctx.clearRect(0, 0, ...cvsSize);
    ctx.drawImage(offscreenCvs, 0, 0);
  };
};

const updateAndDraw = () => {
  animationFrameId = requestAnimationFrame(() => {
    updateFeet();
    draw();
    updateAndDraw();
  });
};

let allEventListeners = [];
const windowResizeHandler = () => {
  // 고해상도를 위해 캔버스 사이즈를 윈도우 사이즈 2배로 설정
  const newCvsSize = [window.innerWidth * 2, window.innerHeight * 2];

  cvsSize = newCvsSize;
  bodyWidth = Math.max(...newCvsSize) * 0.01 * sizeRatio;
  bodyHeight = bodyWidth * 2.3;
  limbsWidth = bodyWidth * 0.8;
  createDots(newCvsSize);
};
const windowMouseMoveHandler = (e) => {
  // 캔버스를 0.5배율 했기 때문에 마우스의 위치는 2배율된 좌표로 계산
  mousePos = [e.clientX * 2, e.clientY * 2];
};
const iframeMouseMoveHandler = (e, x = 0, y = 0) => {
  console.log(x, y);
  mousePos = [e.clientX * 2 + x, e.clientY * 2 + y];
};

function enable() {
  windowResizeHandler();

  // iframe에 마우스무브 핸들러 추가
  try {
    for (const iframe of document.getElementsByTagName("iframe")) {
      const { x, y } = iframe.getBoundingClientRect();

      // iframe 마우스무브 이벤트
      const mouseMoveHandler = (e) => iframeMouseMoveHandler(e, x, y);
      iframe.contentWindow.addEventListener("mousemove", mouseMoveHandler);
      allEventListeners.push([
        iframe.contentWindow,
        "mousemove",
        mouseMoveHandler,
      ]);

      // iframe 로드 이벤트, iframe의 src가 변경될 때 핸들러를 갱신하기 위함
      const loadHandler = () => {
        // 로드시 기존 마우스무브 핸들러 제거 후 새로 등록
        iframe.contentWindow.removeEventListener("mousemove", handler);
        const newHandler = (e) => iframeMouseMoveHandler(e, 4, 4);
        iframe.contentWindow.addEventListener("mousemove", newHandler);
      };
      iframe.addEventListener("load", loadHandler);
      allEventListeners.push([iframe, "load", loadHandler]);
    }
  } catch (error) {
    console.log(error);
  }

  document.body.appendChild(cvs);
  window.addEventListener("resize", windowResizeHandler);
  window.addEventListener("mousemove", windowMouseMoveHandler);
  allEventListeners.push(
    [window, "resize", windowResizeHandler],
    [window, "mousemove", windowMouseMoveHandler]
  );

  updateAndDraw();
  if (!isPaid) {
    swKeepAlive.interval ??= setInterval(swKeepAlive.sendMsgToSw, 10000);
  }
}
function disable() {
  cancelAnimationFrame(animationFrameId);
  cvs.remove();
  clearInterval(swKeepAlive.interval);
  swKeepAlive.interval = null;

  // 이벤트 리스너 클린업
  for (const [eventTarget, eventType, handler] of allEventListeners) {
    eventTarget.removeEventListener(eventType, handler);
  }
  allEventListeners = [];
}

//
// tools
//
const DOT_SORT = (dots) => {
  if (dots.length < 2) return dots;

  const center = Math.round(dots.length / 2),
    left = DOT_SORT(dots.slice(0, center)),
    right = DOT_SORT(dots.slice(center)),
    merged = [];

  let indexL = 0,
    indexR = 0;

  while (indexL < left.length && indexR < right.length) {
    const distanceL = left[indexL].distance,
      distanceR = right[indexR].distance;

    if (distanceL <= distanceR) {
      merged.push(left[indexL]);
      indexL += 1;
    } else {
      merged.push(right[indexR]);
      indexR += 1;
    }
  }

  return merged.concat(left.slice(indexL), right.slice(indexR));
};
const GENERATE_ID = () => {
  const now = Date.now();
  const dateReverse = now.toString().split("").reverse();
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";

  for (let i = 0; i < dateReverse.length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters.charAt(randomIndex) + dateReverse[i];
  }

  return id;
};
const customizeSize = (ratio) => {
  ratio /= 100;
  sizeRatio = ratio;
  bodyWidth = Math.max(...cvsSize) * 0.01 * sizeRatio;
  bodyHeight = bodyWidth * 2.3;
  limbsWidth = bodyWidth * 0.8;
};
const customizeDots = (handleSpacing) => {
  areaDivide = 60 - handleSpacing;
  windowResizeHandler();
};
function secToHMS(sec) {
  const hour = Math.max(Math.floor(sec / 3600), 0);
  const minute = Math.min(Math.max(Math.floor((sec % 3600) / 60), 0), 59);
  const second = Math.min(Math.max(sec % 60, 0), 59);
  return [hour, minute, second];
}

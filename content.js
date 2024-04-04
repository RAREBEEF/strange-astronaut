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
cvs.style.zIndex = 10001;
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
// 팔다리
let feet = null;
// 현재 움직이는 중인 팔다리 (0:오른팔 1:왼팔 2:왼다리 3:오른다리)
let currentMoving = 0;
// 현재 모드(이동, 포인팅)
let mode = "moving";
// 머리 방향
let headToRight = true;
// 마우스 좌표
let mousePos = [null, null];
// 몸통 좌표
let bodyPos = [null, null];
// 속도
let speedRatio = 1;
// 분실물 토글
let disableDrop = false;
// 분실물 목록
let dropItems = ["🍕", "🥕", "🥄", "🔧", "🔑", "💵"];
// 말풍선 토글
let disableSpeech = false;
// 결제 여부
let isPaid = false;
// 고해상도를 위해 캔버스 사이즈를 뷰포트 사이즈의 2배로 설정
let cvsSize = [window.innerWidth * 2, window.innerHeight * 2];
// 애니메이션 프레임
let animationFrameId = null;
// 크기 비율
let sizeRatio = 1;
// 몸통 너비
let bodyWidth = Math.max(...cvsSize) * 0.01 * sizeRatio;
// 몸통 길이
let bodyHeight = bodyWidth * 2.5;
// 팔다리 너비
let limbsWidth = bodyWidth * 0.8;
// 현재 등록된 이벤트리스너들
let allEventListeners = [];

/**
 * 분실물 생성*/
// const createDrop = (bodyPos) => {
//   const [bodyX, bodyY] = bodyPos;

//   if (!bodyX || !bodyY) return;

//   // 분실물 위치, 크기 등 설정
//   const drop = document.createElement("p");
//   drop.textContent = "🍕";
//   drop.style.position = "absolute";
//   drop.style.zIndex = "10000";
//   drop.style.top = `${window.scrollY + bodyY / 2}px`;
//   drop.style.left = `${bodyX / 2}px`;
//   drop.style.fontSize = `${bodyWidth}px`;
//   drop.style.lineHeight = `${bodyWidth}px`;
//   drop.style.cursor = "pointer";
//   drop.style.userSelect = "none";
//   drop.style.rotate = `${Math.random() * 360}deg`;

//   // 페이지에 추가
//   document.body.appendChild(drop);

//   // 클릭 혹은 시간 만료시 페이지에서 제거
//   const timer = setTimeout(() => {
//     document.body.removeChild(drop);
//   }, 300000);
//   drop.onclick = () => {
//     mode === "pointing" && document.body.removeChild(drop);
//     clearTimeout(timer);
//   };

//   return {
//     x: bodyX,
//     y: bodyY,
//     element: drop,
//   };
// };

/**
 * 말풍선
 */
let speechBubble = null;
class SpeechBubble {
  constructor(text) {
    if (disableSpeech) return;
    this.text = text;
    this.show = true;
    this.timer = setTimeout(() => {
      this.show = false;
    }, 2000);
  }
}

// // 분실물
let drops = {};
class Drop {
  constructor(bodyPos) {
    if (disableDrop) return;
    const [bodyX, bodyY] = bodyPos;
    this.id = generateRandomId(10);
    this.x = bodyX;
    this.y = bodyY;
    this.element = document.createElement("div");

    const dropItemIndex = Math.round(Math.random() * (dropItems.length - 1));
    this.element.textContent = dropItems[dropItemIndex].trim();
    this.element.style.position = "absolute";
    this.element.style.zIndex = "10000";
    this.element.style.top = `${window.scrollY + bodyY / 2}px`;
    this.element.style.left = `${window.scrollX + bodyX / 2}px`;
    this.element.style.fontSize = `${bodyWidth}px`;
    this.element.style.lineHeight = `${bodyWidth}px`;
    this.element.style.cursor = "pointer";
    this.element.style.userSelect = "none";
    this.element.style.rotate = `${Math.random() * 360}deg`;

    document.body.appendChild(this.element);

    this.timer = setTimeout(() => {
      this.remove();
    }, 300000);

    this.element.onclick = () => {
      if (mode === "pointing") {
        const random = Math.random();
        if (random > 0.5) {
          speechBubble = new SpeechBubble("thx!");
        } else {
          speechBubble = new SpeechBubble(":D");
        }
        clearTimeout(this.timer);
        this.remove();
      }
    };
  }

  remove() {
    document.body.removeChild(this.element);
    delete drops[this.id];
  }
}

/**
 * 팔다리의 랜덤위치를 반환하는 함수*/
// const getRandomFeetPos = (currentMoving, deltaX, deltaY) => {
//   const [bodyX, bodyY] = bodyPos;
//   const range = bodyHeight * 2;
//   const total = deltaX + deltaY;
//   const directionX = Math.sign(deltaX);
//   const directionY = Math.sign(deltaY);
//   const rangeX = Math.abs(
//     Math.min(
//       Math.max(((range * deltaX) / total) * directionX, 0),
//       bodyHeight * 2
//     )
//   );
//   const rangeY = Math.abs((range - rangeX) * directionY);

//   console.log(range, rangeX, rangeY);

//   let xMin;
//   let xMax;
//   let yMin;
//   let yMax;

//   // 오른손
//   if (currentMoving === 0) {
//     xMin = Math.max(bodyX + directionX * bodyHeight, bodyX);
//     xMax = bodyX + rangeX + directionX * bodyHeight;
//     yMin = bodyY - rangeY + directionY * bodyHeight;
//     yMax = bodyY + directionY * bodyHeight;
//     // 왼손
//   } else if (currentMoving === 1) {
//     xMin = bodyX - rangeX + directionX * bodyHeight;
//     xMax = Math.min(bodyX + directionX * bodyHeight, bodyX);
//     yMin = bodyY - rangeY + directionY * bodyHeight;
//     yMax = bodyY + directionY * bodyHeight;
//     //왼다리
//   } else if (currentMoving === 2) {
//     xMin = bodyX - rangeX + directionX * bodyHeight;
//     xMax = Math.min(bodyX + directionX * bodyHeight, bodyX);
//     yMin = bodyHeight / 2 + bodyY + directionY * bodyHeight;
//     yMax = bodyHeight / 2 + bodyY + rangeY + directionY * bodyHeight;
//     //오른다리
//   } else if (currentMoving === 3) {
//     xMin = Math.max(bodyX + directionX * bodyHeight, bodyX);
//     xMax = bodyX + rangeX + directionX * bodyHeight;
//     yMin = bodyHeight / 2 + bodyY + directionY * bodyHeight;
//     yMax = bodyHeight / 2 + bodyY + rangeY + directionY * bodyHeight;
//   }

//   // // 오른손
//   // if (currentMoving === 0) {
//   //   xMin = Math.max(bodyX + rangeX, bodyX);
//   //   xMax = bodyX + rangeX;
//   //   yMin = bodyY + rangeY;
//   //   yMax = bodyY + rangeY;
//   //   // 왼손
//   // } else if (currentMoving === 1) {
//   //   xMin = bodyX + rangeX;
//   //   xMax = Math.min(bodyX + rangeX, bodyX);
//   //   yMin = bodyY + rangeY;
//   //   yMax = bodyY + rangeY;
//   //   //왼다리
//   // } else if (currentMoving === 2) {
//   //   xMin = bodyX + rangeX;
//   //   xMax = Math.min(bodyX + rangeX, bodyX);
//   //   yMin = bodyHeight / 2 + bodyY + rangeY;
//   //   yMax = bodyHeight / 2 + bodyY + rangeY;
//   //   //오른다리
//   // } else if (currentMoving === 3) {
//   //   xMin = Math.max(bodyX + rangeX, bodyX);
//   //   xMax = bodyX + rangeX;
//   //   yMin = bodyHeight / 2 + bodyY + rangeY;
//   //   yMax = bodyHeight / 2 + bodyY + rangeY;
//   // }

//   const x = Math.random() * (xMax - xMin) + xMin;
//   const y = Math.random() * (yMax - yMin) + yMin;

//   return { x, y };
// };
const getRandomFeetPos = (currentMoving, directionX, directionY) => {
  const [bodyX, bodyY] = bodyPos;
  const range = bodyHeight * 2;

  let xMin;
  let xMax;
  let yMin;
  let yMax;

  // 오른손
  if (currentMoving === 0) {
    xMin = Math.max(bodyX + directionX * bodyHeight, bodyX - bodyWidth);
    xMax = bodyX + range + directionX * bodyHeight;
    yMin = bodyY - range + directionY * bodyHeight;
    yMax = bodyY + directionY * bodyHeight;
    // 왼손
  } else if (currentMoving === 1) {
    xMin = bodyX - range + directionX * bodyHeight;
    xMax = Math.min(bodyX + directionX * bodyHeight, bodyX + bodyWidth);
    yMin = bodyY - range + directionY * bodyHeight;
    yMax = bodyY + directionY * bodyHeight;
    //왼다리
  } else if (currentMoving === 2) {
    xMin = bodyX - range + directionX * bodyHeight;
    xMax = Math.min(bodyX + directionX * bodyHeight, bodyX);
    yMin = bodyHeight / 2 + bodyY + directionY * bodyHeight;
    yMax = bodyHeight / 2 + bodyY + range + directionY * bodyHeight;
    //오른다리
  } else if (currentMoving === 3) {
    xMin = Math.max(bodyX + directionX * bodyHeight, bodyX);
    xMax = bodyX + range + directionX * bodyHeight;
    yMin = bodyHeight / 2 + bodyY + directionY * bodyHeight;
    yMax = bodyHeight / 2 + bodyY + range + directionY * bodyHeight;
  }

  const x = Math.random() * (xMax - xMin) + xMin;
  const y = Math.random() * (yMax - yMin) + yMin;

  return { x, y };
};

const updateFeet = () => {
  // 마우스 좌표
  const [mouseX, mouseY] = mousePos;

  if (!mouseX || !mouseY) {
    return;
  }

  // 현재 몸통 좌표
  const [bodyX, bodyY] = bodyPos;

  // 손발 초기화
  if (!feet) {
    bodyPos = [mouseX, mouseY];
    feet = [
      {
        ...getRandomFeetPos(0, -1, 0),
        targetX: null,
        targetY: null,
        trackingMouse: false,
      },
      {
        ...getRandomFeetPos(1, -1, 0),
        targetX: null,
        targetY: null,
        trackingMouse: false,
      },
      { ...getRandomFeetPos(2, -1, 0), targetX: null, targetY: null },
      { ...getRandomFeetPos(3, -1, 0), targetX: null, targetY: null },
    ];

    return;
  }

  // 마우스와 몸통 사이 거리
  const mouseBodyDeltaX = mouseX - bodyX;
  const mouseBodyDeltaY = mouseY - bodyY;
  const mouseBodyDistance = Math.sqrt(
    mouseBodyDeltaX ** 2 + mouseBodyDeltaY ** 2
  );
  // 몸통 기준 마우스 방향
  const directionX = Math.sign(mouseBodyDeltaX); // 몸통 기준 마우스가 우측이면 +, 좌측이면 -
  const directionY = Math.sign(mouseBodyDeltaY); // 몸통 기준 마우스가 위면 -, 아래면 +

  // 이동모드(마우스를 향해서 움직이는 중)
  if (mode === "moving") {
    // 커서 방향에 따라 머리 방향 변경
    // 이동 시에는 수직으로 움직일 때 움직임을 완화하기 위한 데드존 설정
    if (Math.abs(bodyX - mouseX) >= bodyHeight) {
      headToRight = directionX > 0;
    }
    // 계산할 팔다리의 데이터
    const { x: feetX, y: feetY, targetX, targetY } = feet[currentMoving];

    // 아직 타겟이 없으면 새로운 타겟 좌표 계산
    if (!targetX || !targetY) {
      const { x: newTargetX, y: newTargetY } = getRandomFeetPos(
        currentMoving,
        directionX,
        directionY
      );

      feet[currentMoving] = {
        ...feet[currentMoving],
        targetX: newTargetX,
        targetY: newTargetY,
      };
    } else {
      if (!disableDrop) {
        // 이동시 일정 확률로 물건을 흘림
        const random = Math.random();
        const isDropped = random > 0.999 && !speechBubble?.show;
        if (isDropped) {
          const drop = new Drop(bodyPos);
          drops[drop.id] = drop;
          if (random < 0.99925) {
            speechBubble = new SpeechBubble("I dropped something!");
          } else if (random < 0.9995) {
            speechBubble = new SpeechBubble("Oops!");
          } else if (random < 0.99975) {
            speechBubble = new SpeechBubble("I think I lost something...");
          }
        }
      }

      // 타겟이 있으면 속력 계산 및 이동
      const deltaX = targetX - feetX;
      const deltaY = targetY - feetY;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      const dampingFactor = 0.6 - speedRatio / 10;
      const curSpeed = (distance / 1.5) * speedRatio;
      const SPEED =
        curSpeed < (bodyHeight / 5) * speedRatio ? 0 : curSpeed * dampingFactor;

      if (SPEED > 0) {
        const angle = Math.atan2(deltaY, deltaX);
        const velocityX = SPEED * Math.cos(angle);
        const velocityY = SPEED * Math.sin(angle);
        feet[currentMoving].x = feetX + velocityX;
        feet[currentMoving].y = feetY + velocityY;
      } else {
        feet[currentMoving].x = targetX;
        feet[currentMoving].y = targetY;
      }
    }

    // 팔다리가 목표 위치에 도달하면 다음 팔다리로 바톤터치
    if (feetX === targetX && feetY === targetY) {
      switch (currentMoving) {
        case 0:
          currentMoving = 2;
          break;
        case 1:
          currentMoving = 3;
          break;
        case 2:
          currentMoving = 1;
          break;
        case 3:
          currentMoving = 0;
          break;
      }

      feet[currentMoving].targetX = null;
      feet[currentMoving].targetY = null;

      // 현재 팔다리가 목표 위치에 도달했고 몸통도 마우스에 인접했다면 포인팅모드로 변경
      if (mouseBodyDistance < bodyHeight * 2.5) {
        mode = "pointing";
        // const random = Math.random();
        // const say = random > 0.9 && !speechBubble?.show;
        // if (say) {
        //   if (random > 0.95) {
        //     speechBubble = new SpeechBubble("I got you :b");
        //   } else {
        //     speechBubble = new SpeechBubble("Got it!");
        //   }
        // }
      }
    }
  } else {
    // 포인팅모드(위치는 고정하고 커서를 가리기는 모드), 커서가 우측이면 오른손, 좌측이면 왼손으로
    const pointingHand = 0 <= mouseX - bodyX ? 0 : 1;
    feet[pointingHand].trackingMouse = true;
    feet[1 - pointingHand].trackingMouse = false;

    // 커서 방향에 따라 머리 방향 설정, 이동모드와 다르게 포인팅모드에는 데드존이 없다.
    headToRight = directionX > 0;

    // 포인팅 중인 손의 데이터
    const { x, y } = feet[pointingHand];

    // 포인팅 중인 손의 위치 업데이트
    const targetX =
      mouseX +
      limbsWidth *
        ((bodyX - mouseX + Math.sign(mouseX - bodyX) * limbsWidth * 2) /
          (limbsWidth * 4));
    const targetY = mouseY - Math.sign(mouseY - bodyY) * limbsWidth * 1.5;
    const deltaX = targetX - x;
    const deltaY = targetY - y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const dampingFactor = 0.8;
    const curSpeed = distance / 5;
    const SPEED = curSpeed * dampingFactor;

    const angle = Math.atan2(deltaY, deltaX);
    const velocityX = SPEED * Math.cos(angle);
    const velocityY = SPEED * Math.sin(angle);
    feet[pointingHand].x = x + velocityX;
    feet[pointingHand].y = y + velocityY;
  }

  // 몸통 좌표 계산
  const targetBodyX = feet.reduce((acc, cur) => acc + cur.x, 0) / 4;
  const targetBodyY = feet.reduce((acc, cur) => acc + cur.y, 0) / 4;

  const bodyDeltaX = targetBodyX - bodyX;
  const bodyDeltaY = targetBodyY - bodyY;
  const distance = Math.sqrt(bodyDeltaX ** 2 + bodyDeltaY ** 2);

  const dampingFactor = 0.8;
  const curSpeed = (distance / 4) * speedRatio;
  const SPEED = curSpeed * dampingFactor;

  const angle = Math.atan2(bodyDeltaY, bodyDeltaX);
  const velocityX = SPEED * Math.cos(angle);
  const velocityY = SPEED * Math.sin(angle);

  bodyPos[0] = bodyX + velocityX;
  bodyPos[1] = bodyY + velocityY;

  // 마우스가 몸통 근처에서 벗어났으면 이동모드로 변경
  if (mouseBodyDistance >= bodyHeight * 3.5) {
    feet[0].trackingMouse = false;
    feet[1].trackingMouse = false;
    mode = "moving";
    // const random = Math.random();
    // const say = random > 0.999 && !speechBubble?.show;
    // if (say) {
    //   if (random > 0.9995) {
    //     speechBubble = new SpeechBubble("Wait!");
    //   } else {
    //     speechBubble = new SpeechBubble("Take me too :(");
    //   }
    // }
  }
};

// 캔버스에 그리기
const draw = () => {
  if (bodyPos[0] === null || bodyPos[1] === null) return;

  const [cvsWidth, cvsHeight] = cvsSize;
  let [mouseX, mouseY] = mousePos;
  let [bodyX, bodyY] = bodyPos;

  // 스킨이 글리치일 경우
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
  const drawdropsCommads = [];

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

  // feetRanges.forEach((feetRange) => {
  //   const [xMin, xMax, yMin, yMax] = feetRange;
  //   drawCommands3.push((ctx) => {
  //     ctx.lineWidth = 0.5;
  //     ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
  //   });
  // });

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

  // 말풍선
  if (speechBubble?.show) {
    drawCommands3.push((ctx) => {
      const fontSize = Math.min(Math.max(bodyHeight / 2, 20), 30);
      const { text } = speechBubble;
      ctx.font = fontSize + "px Arial";
      ctx.lineWidth = 2;

      const padding = fontSize / 2;

      const textWidth = ctx.measureText(text).width;
      const textHeight = fontSize * 0.8;
      const x = bodyX;
      const y = bodyY - bodyHeight * 2;

      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";

      ctx.fillRect(
        x - padding,
        y - textHeight - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      );
      ctx.strokeRect(
        x - padding,
        y - textHeight - padding,
        textWidth + padding * 2,
        textHeight + padding * 2
      );

      ctx.fillStyle = "black";
      ctx.fillText(text, x, y);
    });
  }

  // 캔버스 전체 지우기
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

const windowResizeHandler = () => {
  // 고해상도를 위해 캔버스 사이즈를 윈도우 사이즈 2배로 설정
  const newCvsSize = [window.innerWidth * 2, window.innerHeight * 2];

  cvsSize = newCvsSize;
  cvs.width = newCvsSize[0];
  cvs.height = newCvsSize[1];
  offscreenCvs.width = newCvsSize[0];
  offscreenCvs.height = newCvsSize[1];
  bodyWidth = Math.max(...newCvsSize) * 0.01 * sizeRatio;
  bodyHeight = bodyWidth * 2.3;
  limbsWidth = bodyWidth * 0.8;
};
const windowMouseMoveHandler = (e) => {
  // 캔버스를 0.5배율 했기 때문에 마우스의 위치는 2배율된 좌표로 계산
  mousePos = [e.clientX * 2, e.clientY * 2];
};
const iframeMouseMoveHandler = (e, x = 0, y = 0) => {
  // 캔버스를 0.5배율 했기 때문에 마우스의 위치는 2배율된 좌표로 계산
  mousePos = [e.clientX * 2 + x, e.clientY * 2 + y];
};

// 활성화
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

// 비활성화
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

  // 분실물 클린업
  for (let id of Object.keys(drops)) {
    const drop = drops[id];
    drop.remove();
  }
}

//
// TOOLS
//

const customizeSize = (ratio) => {
  ratio /= 100;
  sizeRatio = ratio;
  bodyWidth = Math.max(...cvsSize) * 0.01 * sizeRatio;
  bodyHeight = bodyWidth * 2.3;
  limbsWidth = bodyWidth * 0.8;
};
const customizeSpeed = (ratio) => {
  ratio /= 100;
  speedRatio = ratio;
};

function generateRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomIndex);
  }

  return randomId;
}

//
// CHROME EXTENSION & WINDOW MESSAGE
//
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
// 속도 초기화
getStorageItem("speed", (result) => {
  if (!!result?.speed) {
    customizeSpeed(result.speed);
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
// 드롭 토글 초기화
getStorageItem("disableDrop", (result) => {
  disableDrop = !!result?.disableDrop;
});
// 드롭 아이템 초기화
getStorageItem("dropItems", (result) => {
  dropItems = result?.dropItems.split(",").filter((item) => !!item) || [
    "🍕",
    "🥕",
    "🥄",
    "🔧",
    "🔑",
    "💵",
  ];
});
// 말풍선 토글 초기화
getStorageItem("disableSpeech", (result) => {
  disableSpeech = !!result?.disableSpeech;
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
    } else if (key === "speed") {
      const speed = changes[key].newValue;
      customizeSpeed(speed);
    } else if (key === "skin") {
      const newSkin = changes[key].newValue;
      skin.current = newSkin;
    } else if (key === "glitchIncludesAllSkins") {
      const glitchIncludesAllSkins = changes[key].newValue;
      skin.glitch.includesAllSkin = glitchIncludesAllSkins;
    } else if (key === "disableDrop") {
      const isDisabled = changes[key].newValue;
      disableDrop = isDisabled;
    } else if (key === "dropItems") {
      const items = changes[key].newValue;
      dropItems = items.split(",").filter((item) => !!item) || [
        "🍕",
        "🥕",
        "🥄",
        "🔧",
        "🔑",
        "💵",
      ];
    } else if (key === "disableSpeech") {
      const isDisabled = changes[key].newValue;
      disableSpeech = isDisabled;
    }
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

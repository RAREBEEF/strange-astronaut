// canvas & context
const cvs = document.createElement("canvas");
const ctx = cvs.getContext("2d");
const offscreenCvs = document.createElement("canvas");
const offscreenCtx = offscreenCvs.getContext("2d");
let mouseMoveTarget = window;
let appendTarget = document.body;

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

// finger img
const LEFT_FINGER_SVG = `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="226.55" cy="349.91" rx="151.53" ry="162.44" transform="translate(-61.72 48.81) rotate(-10.83)"/><polygon class="cls-1" points="251.8 337.92 343.95 322.43 295.33 38.16 203.17 53.65 251.8 337.92"/><ellipse class="cls-1" cx="249.25" cy="45.9" rx="46.74" ry="46.32"/></svg>`;
const RIGHT_FINGER_SVG = `<svg id="_레이어_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#ffec00;stroke-width:0px;}</style></defs><ellipse class="cls-1" cx="285.45" cy="349.91" rx="162.44" ry="151.53" transform="translate(-111.87 564.52) rotate(-79.17)"/><polygon class="cls-1" points="260.2 337.92 168.05 322.43 216.67 38.16 308.83 53.65 260.2 337.92"/><ellipse class="cls-1" cx="262.75" cy="45.9" rx="46.74" ry="46.32"/></svg>`;

// footstep audio
// const footstepAudioSrc = chrome.runtime.getURL(`src/audios/footstep.m4a`);

// variable
let isPaid = false;
let timerStartAt = null;
let headToRight = true;
let dots = {};
// 고해상도를 위해 캔버스 사이즈를 뷰포트 사이즈의 2배로 설정
let cvsSize = [window.innerWidth * 2, window.innerHeight * 2];
let mousePos = [100, 100];
let bodyPos = [0, 0];
let feet = null;
let animationFrameId = null;
let areaDivide = 20;
let areaGap = 10;
let bodyColor = "#F5F5F5";
let feetColor = "#ffec00";
let lineColor = "lightgray";
let glitchBlue = "rgb(90, 198, 198)";
let glitchRed = "rgb(220, 80, 80)";
let dotColor = "rgba(0, 0, 0, 0.2)";
let sizeRatio = 1;
let bodyWidth = Math.max(...cvsSize) * 0.01 * sizeRatio;
let bodyHeight = bodyWidth * 2.3;
let limbsWidth = bodyWidth * 0.8;
let skin = "default";
let movementType = "A";

// 프로그램 토글 여부 초기화
getStorageItem("enabled", (result) => {
  if (result.enabled === true) {
    enable();
  }
});
// 타이머 초기화
getStorageItem("timerStartAt", (result) => {
  if (Object.keys(result).length > 0) {
    timerStartAt = result.timerStartAt;
  }
});
// 결제 여부 초기화
getStorageItem("isPaid", (result) => {
  if (Object.keys(result).length > 0 && result.isPaid === true) {
    isPaid = true;
  }
});
// 사이즈 초기화
getStorageItem("size", (result) => {
  if (Object.keys(result).length > 0) {
    customizeSize(result.size);
  }
});
// 고정점 개수 초기화
getStorageItem("dotCount", (result) => {
  if (Object.keys(result).length > 0) {
    customizeDots(parseInt(result.dotCount));
  }
});
// 스킨 초기화
getStorageItem("skin", (result) => {
  if (Object.keys(result).length) {
    skin = result.skin;
  }
});
// 이동 방식 초기화
getStorageItem("movementType", (result) => {
  if (Object.keys(result).length) {
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
      } else {
        isPaid = false;
      }
    } else if (key === "timerStartAt") {
      const startAt = changes[key].newValue;
      timerStartAt = startAt;
    } else if (key === "size") {
      const size = changes[key].newValue;
      customizeSize(size);
    } else if (key === "dotCount") {
      const dotCount = changes[key].newValue;
      customizeDots(parseInt(dotCount));
    } else if (key === "skin") {
      const newSkin = changes[key].newValue;
      skin = newSkin;
    } else if (key === "movementType") {
      const newType = changes[key].newValue;
      movementType = newType;
    }
  }
});
// 팝업에서 메세지를 보낼 경우 여기에서 가장 먼저 수신한다.
const receiveMessage = async (e) => {
  // 보안 검사
  if (
    e.origin !== window.location.origin ||
    e.origin.indexOf("localhost:3000") <= -1
  ) {
    return;
  }
  // 받은 데이터
  const { data } = e;

  if (!!data?.payment_source) {
    console.log("content has received payment data.", data);

    // 결제가 성공한 경우
    if (data.status === "COMPLETED") {
      // 백그라운드에 결제가 성공했음을 알림는 메세지를 전송한다.
      sendMessage({ paymentComplete: true }, function (res) {
        console.log(res);
        // 백그라운드에서 확인이 완료되면 결제 팝업에 확인했다고 답장 보내기
        window.postMessage(
          "Payment confirmed.",
          "https://strange-astronaut.vercel.app"
        );
      });
      // 결제가 취소된 경우
    } else if (data.status === "CANCELED") {
      sendMessage({ paymentCanceled: true }, function (res) {
        console.log(res);
        // 백그라운드에서 확인이 완료되면 결제 팝업에 확인했다고 답장 보내기
        window.postMessage(
          "Payment canceled.",
          "https://strange-astronaut.vercel.app"
        );
      });
    }
    // 결제 팜업 닫기 요청
  } else if (data === "closePayment") {
    sendMessage({ closePayment: true }, function (res) {
      console.log(res);
    });
    // 유료 콘텐츠 이용 여부 요청
  } else if (data === "isPaidContentsUsed") {
    await getStorageItem("paidContentsUsed", (result) => {
      console.log(result);
      window.postMessage(
        { paidContentsUsed: result.paidContentsUsed === true ? true : false },
        "https://strange-astronaut.vercel.app"
      );
    });
  }
};
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
function sendMessage(message, callback = () => null) {
  chrome.runtime.sendMessage(message, (res) => callback(res));
}
window.addEventListener("message", receiveMessage);

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
      isMoving: false,
    };

    dots[GENERATE_ID()] = dot;
  }
};

const updateFeet = () => {
  const [bodyX, bodyY] = bodyPos;
  const [mouseX, mouseY] = mousePos;
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

  const dampingFactor = 0.5;
  const curSpeed = distance / (movementType === "B" ? 2.5 : 10);
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
    const { x: footX, y: footY, soundPlayed } = foot;
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
        console.log("aa");
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

    const dampingFactor = 0.8;
    const curSpeed = distance / 2.5;
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
  const [cvsWidth, cvsHeight] = cvsSize;
  const glitchRandomImg =
    skin === "glitch" ? Math.round(Math.random() * 13) : 0;
  const glitchRandomValue =
    skin === "glitch"
      ? bodyWidth / Math.round(Math.random() * (25 - 20) + 20)
      : 0;
  const glitchRandomSign =
    skin === "glitch" ? (Math.random() < 0.5 ? -1 : 1) : 0;

  let [mouseX, mouseY] = mousePos;
  let [bodyX, bodyY] = bodyPos;

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
      x += glitchRandomValue * glitchRandomSign;
      y += glitchRandomValue * glitchRandomSign;
      let jointX = bodyX + glitchRandomValue * glitchRandomSign;
      let jointY = bodyY + glitchRandomValue * glitchRandomSign;
      let controlX = (x + jointX) / 2 + glitchRandomValue * glitchRandomSign;
      let controlY = (y + jointY) / 2 + glitchRandomValue * glitchRandomSign;

      // let jointX = bodyX;
      // let jointY = bodyY;
      // let controlX = (x + jointX) / 2;
      // let controlY = (y + jointY) / 2;

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
        ctx.strokeStyle = bodyColor;
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

      // 글리치 팔다리 테두리
      skin === "glitch" &&
        (i <= 1 ? drawCommands3 : drawCommands2).unshift((ctx) => {
          ctx.strokeStyle = glitchRed;
          ctx.lineCap = "round";
          ctx.lineWidth =
            limbsWidth * 1.1 + glitchRandomValue * glitchRandomSign * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            controlX + glitchRandomValue * glitchRandomSign * 2,
            controlY + glitchRandomValue * glitchRandomSign * 2,
            jointX + glitchRandomValue * glitchRandomSign * 2,
            jointY + glitchRandomValue * glitchRandomSign * 2
          );
          ctx.stroke();
          ctx.strokeStyle = glitchBlue;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            controlX - glitchRandomValue * glitchRandomSign * 2,
            controlY - glitchRandomValue * glitchRandomSign * 2,
            jointX - glitchRandomValue * glitchRandomSign * 2,
            jointY - glitchRandomValue * glitchRandomSign * 2
          );
          ctx.stroke();
        });

      const glitchEffect1 = new Image();
      const glitchEffect2 = new Image();
      const glitchEffect3 = new Image();

      if (skin === "glitch") {
        const glitchEffectRandomImg1 = Math.round(Math.random() * 8);
        const glitchEffectRandomImg2 = Math.round(Math.random() * 8);
        const glitchEffectRandomImg3 = Math.round(Math.random() * 8);

        glitchEffect1.src = chrome.runtime.getURL(
          `src/images/glitch_effect_${glitchEffectRandomImg1}.png`
        );
        glitchEffect2.src = chrome.runtime.getURL(
          `src/images/glitch_effect_${glitchEffectRandomImg2}.png`
        );
        glitchEffect3.src = chrome.runtime.getURL(
          `src/images/glitch_effect_${glitchEffectRandomImg3}.png`
        );
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
    ctx.fillStyle = bodyColor;
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
    ctx.fillStyle = bodyColor;
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
      bodyX + glitchRandomValue * glitchRandomSign,
      bodyY +
        bodyHeight / 2 -
        bodyHeight / 5 +
        glitchRandomValue * glitchRandomSign,
      (bodyWidth * 1.1) / 2,
      Math.PI * 2,
      Math.PI * 3
    );
    ctx.closePath();
    ctx.fill();
  });

  // 엉덩이
  drawCommands2.push((ctx) => {
    ctx.fillStyle = bodyColor;
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
      const i = skin === "glitch" ? Math.round(Math.random() * 3) : j;
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
            encodeURIComponent(RIGHT_FINGER_SVG);

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
            ctx.fillStyle = feetColor;
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
            encodeURIComponent(LEFT_FINGER_SVG);

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
            ctx.fillStyle = feetColor;
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
          ctx.fillStyle = feetColor;
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

  // // 머리 및 타이머
  const headImg = new Image();
  // 글리치 머리
  if (skin === "glitch") {
    headImg.src = chrome.runtime.getURL(
      `src/images/glitch_character_${
        headToRight ? "right" : "left"
      }_${glitchRandomImg}.png`
    );
    // 오리지널 머리
  } else {
    headImg.src = chrome.runtime.getURL(
      `src/images/original_character_${headToRight ? "right" : "left"}.png`
    );
  }

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

  !isPaid &&
    drawCommands3.push((ctx) => {
      const [H, M, S] = secToHMS(
        Math.round((300000 + timerStartAt - Date.now()) / 1000)
      );
      const text = `${M.toString().padStart(2, "0")}:${Math.round(S)
        .toString()
        .padStart(2, "0")}`;
      ctx.fillStyle = "black";
      ctx.font = "24px monospace";
      ctx.fillText(text, bodyX - 36, bodyY - bodyHeight * 1.5);
    });

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

const windowResizeHandler = () => {
  // 고해상도를 위해 캔버스 사이즈를 뷰포트 사이즈의 2배로 설정
  const newCvsSize = [window.innerWidth * 2, window.innerHeight * 2];
  cvsSize = newCvsSize;
  bodyWidth = Math.max(...newCvsSize) * 0.01 * sizeRatio;
  bodyHeight = bodyWidth * 2.3;
  limbsWidth = bodyWidth * 0.8;
  createDots(newCvsSize);
};
const mouseMoveHandler = (e) => {
  // 캔버스를 0.5배율 했기 때문에 마우스의 위치는 2배율된 좌표로 계산
  mousePos = [e.clientX * 2, e.clientY * 2];
};

let swKeepAliveInterval = null;
function swKeepAlive() {
  sendMessage({ swKeepAlive: true }, (res) => {
    console.log(res);
  });
}
const enable = () => {
  windowResizeHandler();

  const { innerWidth, innerHeight } = window;

  for (const iframe of document.getElementsByTagName("iframe")) {
    const { offsetWidth, offsetHeight } = iframe;

    if (innerWidth * 0.8 <= offsetWidth && innerHeight * 0.8 <= offsetHeight) {
      const iframeDoc = iframe.contentDocument;

      if (!iframeDoc || !iframeDoc.body) {
        appendTarget = document.body;
        mouseMoveTarget = document.body;
      } else {
        appendTarget = iframeDoc.body;
        mouseMoveTarget = iframeDoc.body;
      }
      break;
    } else {
      continue;
    }
  }

  appendTarget.appendChild(cvs);
  window.addEventListener("resize", windowResizeHandler);
  mouseMoveTarget.addEventListener("mousemove", mouseMoveHandler);

  updateAndDraw();
  if (!isPaid) {
    swKeepAliveInterval ??= setInterval(swKeepAlive, 10000);
  }
};
const disable = () => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", windowResizeHandler);
  mouseMoveTarget.removeEventListener("mousemove", mouseMoveHandler);
  cvs.remove();
  clearInterval(swKeepAliveInterval);
  swKeepAliveInterval = null;
};

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
const customizeDots = (dotCount) => {
  areaDivide = dotCount;
  windowResizeHandler();
};

function secToHMS(sec) {
  const hour = Math.max(Math.floor(sec / 3600), 0);
  const minute = Math.min(Math.max(Math.floor((sec % 3600) / 60), 0), 59);
  const second = Math.min(Math.max(sec % 60, 0), 59);
  return [hour, minute, second];
}

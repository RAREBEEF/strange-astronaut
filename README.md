# **Strange Astronaut chrome extenstion**

![](https://velog.velcdn.com/images/drrobot409/post/dabcc2af-7cbe-4671-a6f0-637c6ccd8278/image.png)

<br />

크롬 브라우저를 사용하는 동안 캐릭터가 마우스를 따라다니도록 하는 확장 프로그램을 개발해 보았다.

일전에 <a href="https://www.rarebeef.co.kr/projects/huggywuggy" target="_blank">Canvas API로 제작한 허기워기</a>를 기반으로 개발한 프로그램이기 때문에 좀 더 자세한 개발 과정이나 코드는 <a href="https://velog.io/@drrobot409/Canvas-API%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-Interactive-%EC%95%84%EC%9D%B4%EB%94%94%EC%96%B4-%EA%B5%AC%ED%98%84" target="_blank">이전 설명</a>을 참고.

다만 허기워기는 이미 주인이 있는 캐릭터기 때문에 오리지널 캐릭터를 디자인해 만들어 보았다.

<br />
<br />

## **1. content**

![](https://velog.velcdn.com/images/drrobot409/post/f864a926-a940-4ea5-be57-614c688f0780/image.png)

스크린샷처럼 다양한 사이트와 상황에서 우주인을 데리고 돌아다닐 수 있다.

프로그램의 작동 방식은 현재 탭에 활성화되어 있는 웹사이트의 DOM 트리에 캔버스를 추가하고 우주인을 그리는 방식이다.

프로그램의 활성화 여부는 chrome.storage API로 저장되기 때문에 페이지나 탭을 변경하여도 그대로 유지된다.

주요 코드는 <a href="https://github.com/RAREBEEF/rarebeef-next/blob/main/components/HuggyWuggy.tsx" target="_blank">포트폴리오 버전</a>과 거의 동일하며 해당 코드(react & typescript)를 바닐라 js로 리팩토링 후 약간의 수정을 거쳐 사용하였다.

<br />
<br />

## **2. popup**

![](https://velog.velcdn.com/images/drrobot409/post/13106898-5576-4b4b-9260-945c4321435c/image.png)

브라우저 툴바에서 우주인의 아이콘을 누르면 프로그램의 활성화 여부를 토글할 수 있는 팝업창이 나온다.

뭔가 더 추가하고 싶어도 넣을 내용이 없어서 버튼이라도 예쁘게 만들어 보았다.

<br />

---

<br />

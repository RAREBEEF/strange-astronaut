const fs = require("fs");

console.log("문자열 치환 시작");

const path = "./build/";

const files = [
  "background.js",
  "popup.js",
  "content.js",
  "sandbox.js",
  "popup.html",
];

const searchUrl = "http://localhost:3000";
const replaceUrl = "https://strange-astronaut.rarebeef.co.kr";
const searchId = "dbghdjgofbcficjlbhbgacbdgimnmodi";
const replaceId = "fhbjpkjhalgkhlfbhcbnejkgbnjnmjmn";

for (const file of files) {
  // 파일을 읽어들임
  fs.readFile(path + file, "utf8", (err, data) => {
    if (err) {
      console.error("파일을 읽는 도중 에러가 발생했습니다:", err);
      return;
    }

    // 문자열 치환
    const replacedData = data
      .replace(new RegExp(searchUrl, "g"), replaceUrl)
      .replace(new RegExp(searchId, "g"), replaceId);

    // 파일에 쓰기
    fs.writeFile(path + file, replacedData, "utf8", (err) => {
      if (err) {
        console.error("파일을 쓰는 도중 에러가 발생했습니다:", err);
        return;
      }
      console.log(path + file + " 내 문자열 치환 완료");
    });
  });
}

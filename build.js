const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const { execSync } = require("child_process");

// 복사에서 제외할 파일 또는 폴더
const copyExcludeList = [
  ".git",
  ".gitignore",
  "README.md",
  "package.json",
  "package-lock.json",
  "backup",
  "build",
  "replace-string.js",
  "build.js",
  "locales",
];
// 문자열을 치환할 폴더
const replaceTargetFiles = [
  "background.js",
  "popup.js",
  "content.js",
  "sandbox.js",
  "popup.html",
];
// 치환할 문자열
const replaceStrings = [
  ["http://localhost:3000", "https://strange-astronaut.rarebeef.co.kr"],
  ["dbghdjgofbcficjlbhbgacbdgimnmodi", "fhbjpkjhalgkhlfbhcbnejkgbnjnmjmn"],
  ["// 여기부터 빌드 시 삭제(.*?)// 여기까지 빌드 시 삭제", ""],
  ["<!-- 여기부터 빌드 시 삭제 -->(.*?)<!-- 여기까지 빌드 시 삭제 -->", ""],
];

/**
 * 소스 폴더의 내용을 대상 폴더로 복사하는 재귀 함수
 * */
function copyFolderRecursiveSync(source, target) {
  // 폴더 생성
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // 폴더 읽기
  const files = fs.readdirSync(source);

  for (const file of files) {
    const currentSource = path.join(source, file);
    const currentTarget = path.join(target, file);

    // 제외 목록에 포함되었는지 확인
    if (!copyExcludeList.includes(file)) {
      if (fs.lstatSync(currentSource).isDirectory()) {
        // 폴더인 경우 재귀 호출해 폴더 내용 복사
        copyFolderRecursiveSync(currentSource, currentTarget);
      } else {
        // 파일이면 그냥 복사
        fs.copyFileSync(currentSource, currentTarget);
      }
    }
  }
}
/**
 * 대상 파일에서 특정 문자열을 치환하는 함수
 * */
async function replaceString(targetFiles, targetStrings) {
  for (const file of targetFiles) {
    try {
      // 파일을 읽어들임
      const data = await fs.promises.readFile(file, "utf8");

      // 치환
      const replacedData = targetStrings.reduce((acc, cur) => {
        return acc.replace(new RegExp(cur[0], "gs"), cur[1]);
      }, data);

      // 파일에 쓰기
      await fs.promises.writeFile(file, replacedData, "utf8").then(() => {
        console.log(file + " 내 문자열 치환 완료\n");
      });
    } catch (error) {
      console.log(error);
    }
  }
}

// 현재 폴더와 대상 폴더 지정 후 복사
console.log("폴더 및 파일 복사 시작\n");
const copySource = process.cwd();
const pasteTarget = path.join(copySource, "build/Strange Astronaut");
copyFolderRecursiveSync(copySource, pasteTarget);
console.log("폴더 및 파일 복사 완료\n");

console.log("문자열 치환 시작\n");
// 빌드 폴더로 작업경로 이동
process.chdir("./build/Strange Astronaut");
replaceString(replaceTargetFiles, replaceStrings).then(() => {
  console.log("모든 문자열 치환 완료\n");
  console.log("난독화 시작\n");
  execSync(
    "uglifyjs ./sandbox.js -o ./sandbox.js -c drop_console --no-annotations && uglifyjs ./popup.js -o ./popup.js -c drop_console --no-annotations && uglifyjs ./background.js -o ./background.js -c drop_console --no-annotations && uglifyjs ./content.js -o ./content.js -c drop_console --no-annotations",
    { stdio: "inherit" }
  );
  console.log("난독화 완료\n");
  console.log("프로세스 종료\n");
  execSync(`open ../`);
});

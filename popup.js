document.addEventListener("DOMContentLoaded", () => {
  const userLanguage = navigator.language || navigator.userLanguage;

  if (userLanguage.startsWith("ko")) {
    const enFooter = document.getElementsByClassName("footer-en");
    enFooter[0].style.display = "none";
  } else {
    const koFooter = document.getElementsByClassName("footer-ko");
    koFooter[0].style.display = "none";
  }

  const toggleBtn = document.getElementById("toggle-btn");

  chrome.storage.local.get(["enabled"], (result) => {
    if (Object.keys(result).length <= 0 || result.enabled === true) {
      chrome.storage.local.set({ enabled: true });
      toggleBtn.classList.add("enabled");
    } else {
      chrome.storage.local.set({ enabled: false });
      toggleBtn.classList.remove("enabled");
    }
  });

  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get(["enabled"], (result) => {
      if (Object.keys(result).length <= 0 || result.enabled === true) {
        chrome.storage.local.set({ enabled: false });
        toggleBtn.classList.remove("enabled");
      } else {
        chrome.storage.local.set({ enabled: true });
        toggleBtn.classList.add("enabled");
      }
    });
  });
});

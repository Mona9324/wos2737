// ===== GLOBAL =====
var currentBuff = "monday";
var bookingSettings = { tabs: {} };

// ===== TIME =====
function refreshTimeTexts() {
  updateCountdown();
  updateTabBookingStateText();
}

// 🔥 핵심 변경
function updateTabBookingStateText() {
  var el = document.getElementById("tabBookingState");
  if (!el) return;

  var setting = getTabSetting(currentBuff);
  var now = new Date();
  var openAt = parseLocalDateTime(setting.openAt);
  var closeAt = parseLocalDateTime(setting.closeAt);

  if (!setting.manualOpen) {
    el.textContent = "Booking locked by admin";
    return;
  }

  if (openAt && now < openAt) {
    var diff = openAt - now;
    var h = Math.floor(diff / (1000*60*60));
    var m = Math.floor((diff / (1000*60)) % 60);
    el.textContent = "Booking opens in " + h + "h " + m + "m";
    return;
  }

  if (closeAt && now <= closeAt) {
    var diff2 = closeAt - now;
    var h2 = Math.floor(diff2 / (1000*60*60));
    var m2 = Math.floor((diff2 / (1000*60)) % 60);
    el.textContent = "Booking closes in " + h2 + "h " + m2 + "m";
    return;
  }

  el.textContent = "Booking open";
}

// ===== TAB =====
function switchBuff(buff) {
  currentBuff = buff;
  setActiveTab();
  renderAll();
  updateTabBookingStateText();
}

// ===== SETTINGS =====
function getTabSetting(buff) {
  var base = { manualOpen: true, openAt: "", closeAt: "" };
  return Object.assign({}, base, bookingSettings.tabs[buff] || {});
}

// ===== UTIL =====
function parseLocalDateTime(val) {
  if (!val) return null;
  return new Date(val);
}

// ===== INIT =====
setInterval(refreshTimeTexts, 60000);
refreshTimeTexts();

var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var currentLang = localStorage.getItem("svs_lang") || "ko"; 

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    globalCloseTime: "", 
    closedSlots: [], 
    adminLogs: [], 
    tabs: { monday: { isOpen: true, showSpeeds: false }, tuesday: { isOpen: true, showSpeeds: false }, thursday: { isOpen: true, showSpeeds: false } } 
};
var adminAuthenticated = false;
var sc = 0;

var langPack = {
    ko: { notice: "📢 요일별 1인 1타임만 예약 가능합니다.<br />(상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1", confirmedHeader: "👑 내 예약 시간", addAlarm: "🔔 알람 등록", mon: "월요일 (건설)", tue: "화요일 (연구)", thu: "목요일 (훈련)", mondayShort: "월요일", tuesdayShort: "화요일", thursdayShort: "목요일", optAll: "전체 / All", optMine: "내 예약 / Mine", openAvailable: "✅ 예약 가능", openClosed: "🔒 예약 마감", pers: "명", noRes: "No Reservation / 예약 없음", addTitle: "새 예약 추가", confirmBtn: "확정", closeBtn: "닫기", statusTitle: "예약 현황", cancelLabel: "취소 비밀번호", cancelBtn: "나의 예약 전체 취소", addBookingBtn: "예약 추가", closedAlert: "예약 마감되었습니다.", speedUnit: "일", pAlliance: "연맹 (ZTP, BUG 등)", pNickname: "닉네임", pId: "플레이어 ID (9자리)", pSpeed: "가속 일수", pPass: "비밀번호 (아무거나)", editBtn: "수정", cancelBtnSmall: "취소", delBtn: "삭제", slotOpenBtn: "🔓 예약 열기", slotCloseBtn: "🔒 예약 마감", errFill: "비밀번호 칸에 본인의 비밀번호를 먼저 입력해주세요.", errWrongPass: "비밀번호가 올바르지 않습니다.", errNoRes: "삭제할 예약 데이터를 찾을 수 없습니다.", errFillAll: "모든 항목을 입력해야 합니다.", errIdDigit: "플레이어 ID는 반드시 숫자 9자리여야 합니다.", promptEdit: "새로운 가속 일수(숫자만)를 입력하세요:", errNan: "숫자 형식만 입력 가능합니다.", promptDelete: "정말 삭제하시겠습니까?", promptClear: "모든 데이터를 초기화하시겠습니까? (이 작업은 기록에 남습니다)", promptSaved: "저장되었습니다!" },
    en: { notice: "📢 1 Booking Per Person Per Day.\n(You can change the language using the blue menu at the top)", curvedTxt: "The website usage fee is Mona's Island 💚+1", confirmedHeader: "👑 My Booked Buffs", addAlarm: "🔔 Add Alarm", mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)", mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday", optAll: "All", optMine: "My Booking", openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed", pers: "Pers.", noRes: "No Reservation", addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close", statusTitle: "Booking Status", cancelLabel: "Password", cancelBtn: "Cancel My All Bookings", addBookingBtn: "Add Booking", closedAlert: "Reservation Closed.", speedUnit: "d", pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password (any password)", editBtn: "Edit", cancelBtnSmall: "Cancel", delBtn: "Delete", slotOpenBtn: "🔓 Open", slotCloseBtn: "🔒 Close", errFill: "Please enter your password in the bottom field first.", errWrongPass: "Wrong password.", errNoRes: "Reservation not found.", errFillAll: "Please fill all fields.", errIdDigit: "ID must be exactly 9 digits.", promptEdit: "Enter new speed-up days (numbers only):", errNan: "Please enter a valid number.", promptDelete: "Are you sure you want to delete?", promptClear: "Clear all data? (This action is logged)", promptSaved: "Saved!" }
};

function getMinSpeedRequired() {
    var day = new Date().getUTCDay(); 
    if (day === 3) return 50; 
    if (day === 4) return 30; 
    if (day === 5) return 15; 
    return 0; 
}

function openCustomAlert(msg) {
    var titleEl = document.getElementById("alert-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "⚠️ 안내" : "⚠️ Notice";
    var msgEl = document.getElementById("alertModalMessage");
    if(msgEl) msgEl.innerText = msg;
    document.getElementById("alertModal").classList.add("show");
}

window.customConfirmCallback = null;
window.openCustomConfirm = function(msg, callback) {
    var titleEl = document.getElementById("confirm-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "⚠️ 확인" : "⚠️ Confirm";
    var msgEl = document.getElementById("confirmModalMessage");
    if(msgEl) msgEl.innerText = msg;
    
    var cancelBtn = document.getElementById("btn-confirm-cancel");
    if (cancelBtn) cancelBtn.innerText = langPack[currentLang].cancelBtnSmall || "Cancel";
    var okBtn = document.getElementById("btn-confirm-ok");
    if (okBtn) okBtn.innerText = langPack[currentLang].confirmBtn || "Confirm";

    window.customConfirmCallback = callback;
    document.getElementById("confirmModal").classList.add("show");
};
window.closeCustomConfirm = function() {
    document.getElementById("confirmModal").classList.remove("show");
    window.customConfirmCallback = null;
};
window.executeCustomConfirm = function() {
    if (window.customConfirmCallback) { window.customConfirmCallback(); }
    window.closeCustomConfirm();
};

window.customPromptCallback = null;
window.openCustomPrompt = function(msg, defaultVal, callback) {
    var titleEl = document.getElementById("prompt-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "가속 일수 수정" : "Edit Speed-up";
    var msgEl = document.getElementById("promptModalMessage");
    if(msgEl) msgEl.innerText = msg;
    var inputEl = document.getElementById("promptInputValue");
    if(inputEl) inputEl.value = defaultVal || "";
    
    var cancelBtn = document.getElementById("btn-prompt-cancel");
    if (cancelBtn) cancelBtn.innerText = langPack[currentLang].cancelBtnSmall;
    var confirmBtn = document.getElementById("btn-prompt-confirm");
    if (confirmBtn) confirmBtn.innerText = langPack[currentLang].confirmBtn;

    window.customPromptCallback = callback;
    document.getElementById("promptModal").classList.add("show");
    if(inputEl) inputEl.focus();
};

window.closeCustomPrompt = function() {
    document.getElementById("promptModal").classList.remove("show");
    window.customPromptCallback = null;
};

window.confirmCustomPrompt = function() {
    var inputEl = document.getElementById("promptInputValue");
    var val = inputEl ? inputEl.value : "";
    if (window.customPromptCallback) { window.customPromptCallback(val); }
    window.closeCustomPrompt();
};

window.changeLanguage = function(lang) { currentLang = lang; localStorage.setItem("svs_lang", lang); applyLanguagePack(); window.renderAll(); };

function applyLanguagePack() {
    var p = langPack[currentLang] || langPack['en'];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = currentLang;
    
    var reqSpeed = getMinSpeedRequired();
    var noticeKoEl = document.getElementById("notice-dynamic-txt");
    
    var speedNoticeKo = reqSpeed > 0 ? ("<br><span style='color:#ffeaa7; font-weight:bold;'>※ 오늘 기준 예약 최소 조건: 가속 " + reqSpeed + "일 이상</span>") : "<br><span style='color:#55efc4; font-weight:bold;'>※ 오늘은 누구나 자유롭게 예약 가능합니다!</span>";
    var speedNoticeEn = reqSpeed > 0 ? ("<br><span style='color:#ffeaa7; font-weight:bold;'>※ Today's req: " + reqSpeed + "+ days</span>") : "<br><span style='color:#55efc4; font-weight:bold;'>※ Open to everyone today!</span>";

    if (noticeKoEl) {
        if (currentLang === "ko") noticeKoEl.innerHTML = p.notice + speedNoticeKo;
        else noticeKoEl.innerHTML = p.notice + speedNoticeEn;
    }
    
    var safeSetText = function(id, text) { var el = document.getElementById(id); if (el) el.innerText = text; };
    var safeSetPlaceholder = function(id, placeholder) { var el = document.getElementById(id); if (el) el.placeholder = placeholder; };

    safeSetText("tab-mon-txt", p.mon); safeSetText("tab-tue-txt", p.tue); safeSetText("tab-thu-txt", p.thu);
    safeSetText("opt-all", p.optAll); safeSetText("opt-mine", p.optMine); safeSetText("btn-reset-txt", "Reset");
    safeSetText("modal-title-txt", p.addTitle); safeSetText("btn-confirm-txt", p.confirmBtn); safeSetText("btn-close-txt", p.closeBtn);
    
    safeSetPlaceholder("alliance", p.pAlliance); safeSetPlaceholder("player", p.pNickname);
    safeSetPlaceholder("playerId", p.pId); safeSetPlaceholder("daysSaved", p.pSpeed); safeSetPlaceholder("cancelKey", p.pPass);
    
    safeSetText("res-title-txt", p.statusTitle); safeSetText("cancel-label-txt", p.cancelLabel);
    safeSetText("btn-cancel-txt", p.cancelBtn); safeSetText("btn-add-txt", p.addBookingBtn); safeSetText("btn-res-close-txt", p.closeBtn);
    
    var curvedEl = document.getElementById("

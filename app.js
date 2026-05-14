var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 초기 구조 선언으로 데이터 로드 전 오류 방지
var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } 
};

var loginAttempts = 0, lockoutTime = 0, adminAuthenticated = false, sc = 0;

// Utils
function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// 로그 기록 기능
function addLog(msg) {
    const logsBox = document.getElementById('logsBox');
    if (!logsBox) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement('div');
    logItem.textContent = `[${timeStr}] ${msg}`;
    logsBox.prepend(logItem);
}

// 관리자 UI 업데이트 (안전 장치 강화)
function updateAdminUI() {
    if (!adminAuthenticated) return;
    const days = ['monday', 'tuesday', 'thursday'];
    let openCount = 0;
    days.forEach(day => {
        const isOpen = (bookingSettings.tabs && bookingSettings.tabs[day]) ? bookingSettings.tabs[day].isOpen : false;
        const btn = document.querySelector(`button[onclick="toggleTabStatus('${day}')"]`);
        if (btn) {
            btn.classList.toggle('status-on', isOpen);
            btn.classList.toggle('status-off', !isOpen);
            if (isOpen) openCount++;
        }
    });
    const allOpenBtn = document.querySelector('button[onclick="toggleAllTabs(true)"]');
    if (allOpenBtn) allOpenBtn.classList.toggle('status-on', openCount === 3);
}

function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) bookingSettings = doc.data(); 
        updateStatusMessage();
        updateCountdown();
        updateAdminUI();
        renderAll(); 
    });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {};
        snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
    setInterval(updateCountdown, 60000);
}

function updateStatusMessage() {
    var el = document.getElementById("bookingStatusMsg");
    var isOpen = (bookingSettings.tabs && bookingSettings.tabs[currentBuff]) ? bookingSettings.tabs[currentBuff].isOpen : false;
    if(el) el.innerText = isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 관리자가 예약을 잠갔습니다 / Booking is Locked";
}

function renderAll() {
    var grid = document.getElementById("slots");
    if (!grid) return;
    grid.innerHTML = "";
    var isTabLocked = !(bookingSettings.tabs && bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].isOpen);
    var search = normalizeText(document.getElementById("searchInput").value);
    var filter = document.getElementById("filterStatus").value;

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var timeId = padTime(h, m), id = currentBuff + "_" + timeId;
            var slot = allSlotsData[id] || { attendees: [] }, attendees = slot.attendees || [];
            if (filter === "mine" && !attendees.some(isMyReservation)) continue;
            if (search && !attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;

            var div = document.createElement("div");
            div.className = "slot " + (h < 12 ? "am-slot" : "pm-slot") + (isTabLocked ? " locked" : "") + (attendees.some(isMyReservation) ? " myReservation" : "");
            div.innerHTML = `<div class="timeRow"><span class="timeUTC">${timeId}-${padTime(h, m+30)} UTC</span><span>${isTabLocked ? '잠김' : attendees.length + '명'}</span></div><div class="timeLocal">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h, m, 0, 0)))}</div>`;
            
            // 클릭 이벤트 바인딩 고정
            div.onclick = (function(sId, lock) { 
                return function() { 
                    if(lock) return alert("현재 예약이 잠겨있습니다."); 
                    selectedSlot = sId; 
                    if (allSlotsData[sId]?.attendees?.length > 0) {
                        document.getElementById("reservedModal").classList.add("show");
                        // 예약 현황 업데이트 로직 생략(기존 유지)
                    } else {
                        document.getElementById("modal").classList.add("show");
                    }
                }; 
            })(id, isTabLocked);
            grid.appendChild(div);
        }
    }
}

function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }

function isMyReservation(person) { 
    var mine = getMyBookingInfo(); 
    return person && mine && normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance); 
}
function getMyBookingInfo() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } }

function updateCountdown() {
    var diff = new Date(bookingSettings.baseDate) - new Date();
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000;
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m`;
}

document.querySelector(".creatorAvatar").onclick = function() {
    if (sc++ >= 2) { sc = 0; if (prompt("Password:") === "2737") { adminAuthenticated = true; document.getElementById("adminPanel").classList.add("show"); updateAdminUI(); } }
};
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); adminAuthenticated = false; }
function toggleTabStatus(tab) { bookingSettings.tabs[tab].isOpen = !bookingSettings.tabs[tab].isOpen; db.collection("settings").doc("booking").set(bookingSettings); }
function toggleAllTabs(s) { Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = s); db.collection("settings").doc("booking").set(bookingSettings); }

init();

var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } 
};

// 관리자 관련 변수
var adminAuthenticated = false;
var sc = 0; // 클릭 카운터

function padTime(h, m) { 
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; 
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); 
}

function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) bookingSettings = doc.data(); 
        updateStatusMessage();
        updateCountdown();
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
    if(el) el.innerText = isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 예약 잠금 상태 / Booking is Locked";
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
            var timeId = padTime(h, m), endId = padTime(h, m + 30), id = currentBuff + "_" + timeId;
            var slot = allSlotsData[id] || { attendees: [] }, attendees = slot.attendees || [];
            
            if (filter === "mine" && !attendees.some(isMyReservation)) continue;
            if (search && !attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;

            var div = document.createElement("div");
            div.className = "slot " + (h >= 12 ? "pm-slot" : "") + (isTabLocked ? " locked" : "") + (attendees.some(isMyReservation) ? " myReservation" : "");
            
            var miniListHtml = "";
            attendees.slice(0, 3).forEach((a, i) => {
                miniListHtml += `<div class="miniItem"><span>${i+1}. ${a.player}</span><span>${a.daysSaved}d</span></div>`;
            });
            if (attendees.length > 3) miniListHtml += `<div style="text-align:center; font-size:10px; color:#a0aec0; margin-top:3px;">+ ${attendees.length - 3} more</div>`;

            div.innerHTML = `
                <div class="timeRow">
                    <span class="timeUTC">${timeId}~${endId} UTC</span>
                    <span style="font-size:11px;">${attendees.length} Booked</span>
                </div>
                <div style="font-size:11px; color:#718096; margin-bottom:10px;">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h, m, 0, 0)))}</div>
                <div class="attendeeMiniList">${miniListHtml || '<div style="color:#cbd5e0; text-align:center; font-size:11px;">No Reservation</div>'}</div>
            `;
            
            div.onclick = (function(sId, lock) { 
                return function() { 
                    if(lock) return alert("잠겨있습니다 / Locked."); 
                    selectedSlot = sId; 
                    if (allSlotsData[sId]?.attendees?.length > 0) openReservedModal(sId);
                    else openReserveModal();
                }; 
            })(id, isTabLocked);
            grid.appendChild(div);
        }
    }
}

function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function openReserveModal() { document.getElementById("modal").classList.add("show"); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }

function openReservedModal(id) {
    var list = document.getElementById("attendeeListDetail");
    list.innerHTML = "";
    allSlotsData[id]?.attendees?.forEach((a, i) => {
        var d = document.createElement("div");
        d.className = "miniItem"; d.style.fontSize = "14px"; d.style.padding = "5px 0";
        d.innerHTML = `<span>${i+1}. [${a.alliance}] ${a.player}</span><span>${a.daysSaved}d Speed-up</span>`;
        list.appendChild(d);
    });
    document.getElementById("reservedModal").classList.add("show");
}

function openReserveFromStatus() { closeReservedModal(); openReserveModal(); }

// 관리자 진입 함수 (아바타 클릭 시 호출)
function handleAdminAccess() {
    sc++;
    if (sc >= 3) { // 3번 클릭 시 비밀번호창
        sc = 0;
        var p = prompt("관리자 비밀번호를 입력하세요 / Admin Password:");
        if (p === "2737") {
            adminAuthenticated = true;
            document.getElementById("adminPanel").classList.add("show");
        } else {
            alert("비밀번호가 틀렸습니다 / Wrong Password.");
        }
    }
}

function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); adminAuthenticated = false; }

function isMyReservation(person) { 
    var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false;
    var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player);
}

function updateCountdown() {
    var diff = new Date(bookingSettings.baseDate) - new Date();
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000;
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m`;
}

function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }

init();

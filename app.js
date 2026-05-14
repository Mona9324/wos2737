var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { baseDate: "2026-05-23T21:00:00", tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } };
var adminAuthenticated = false;
var sc = 0;

function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) bookingSettings = doc.data(); 
        updateStatusMessage(); updateAdminUI(); renderAll();
    });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {}; snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
    setInterval(updateCountdown, 1000);
}

function renderAll() {
    const grid = document.getElementById("slots");
    if (!grid) return; grid.innerHTML = "";
    const isLocked = !bookingSettings.tabs[currentBuff].isOpen;

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId;
            const slot = allSlotsData[id] || { attendees: [] };
            const div = document.createElement("div");
            const myClass = slot.attendees.some(isMyReservation) ? " myReservation" : "";
            div.className = "slot " + (h >= 12 ? "pm-slot" : "") + (isLocked ? " locked" : "") + myClass;
            
            div.innerHTML = `
                <div class="timeRow"><span class="timeUTC">${tId}~${eId} UTC</span><span>${slot.attendees.length}명</span></div>
                <div style="font-size:11px; color:#718096; margin-bottom:10px;">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0)))}</div>
                <div class="attendeeMiniList">${slot.attendees.slice(0,3).map((a,i)=>`<div class='miniItem'><span>${i+1}. ${a.player}</span><span>${a.daysSaved}d</span></div>`).join('')}</div>
            `;
            div.onclick = () => { 
                if(isLocked && !adminAuthenticated) return alert("마감됨 / Locked."); 
                selectedSlot = id; 
                if (slot.attendees.length > 0) openReservedModal(id);
                else openReserveModal();
            };
            grid.appendChild(grid.appendChild(div));
        }
    }
}

function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("모든 정보를 입력하세요.");
    if(idNum.length !== 9 || isNaN(idNum)) return alert("ID는 9자리 숫자여야 합니다.");
    
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true})
    .then(() => { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); 
        closeModal(); alert("예약 성공!"); renderAll();
    });
}

function handleAdminAccess() { sc++; if(sc>=3) { sc=0; var p=prompt("Password:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); updateAdminUI(); } } }

function toggleTabStatus(day) {
    bookingSettings.tabs[day].isOpen = !bookingSettings.tabs[day].isOpen;
    db.collection("settings").doc("booking").update(bookingSettings).then(() => { addLog(`${day} 변경됨`); updateAdminUI(); });
}

function updateAdminUI() {
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        const btn = document.getElementById(`btn-admin-${day}`);
        if (btn) btn.className = bookingSettings.tabs[day].isOpen ? "admin-btn-on" : "admin-btn-off";
    });
}

// ... 기타 닫기, 취소, 로그, 엑셀 함수 유지 ...
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }
function openReserveModal() {
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance; document.getElementById("player").value = mine.player; }
    document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC";
    document.getElementById("modal").classList.add("show");
}
function isMyReservation(person) { var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false; var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player); }
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); if(el) el.innerText = bookingSettings.tabs[currentBuff].isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 예약 잠금 상태 / Booking is Locked"; }
function updateCountdown() {
    var diff = new Date(bookingSettings.baseDate) - new Date();
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000;
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m ${s}s`;
}

init();

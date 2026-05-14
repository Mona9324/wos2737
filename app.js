var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { baseDate: "2026-05-23T21:00:00", tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } };
var adminAuthenticated = false;
var sc = 0;

function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
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
}

function addLog(msg) {
    const box = document.getElementById('logsBox');
    if (!box) return;
    const log = document.createElement('div');
    log.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    box.prepend(log);
}

function updateAdminUI() {
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        const btn = document.getElementById(`btn-admin-${day}`);
        if (btn) {
            const isOpen = bookingSettings.tabs[day].isOpen;
            btn.className = isOpen ? "btn-primary admin-btn-on" : "btn-primary admin-btn-off";
        }
    });
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
            div.className = "slot " + (h >= 12 ? "pm-slot" : "") + (isLocked ? " locked" : "");
            
            div.innerHTML = `
                <div class="timeRow"><span class="timeUTC">${tId}~${eId} UTC</span><span>${slot.attendees.length}명</span></div>
                <div style="font-size:11px; color:#718096; margin-bottom:10px;">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0)))}</div>
                <div class="attendeeMiniList">${slot.attendees.slice(0,3).map((a,i)=>`<div class='miniItem'><span>${i+1}. ${a.player}</span><span>${a.daysSaved}d</span></div>`).join('')}</div>
            `;
            div.onclick = () => { if(isLocked && !adminAuthenticated) return alert("마감됨"); selectedSlot = id; openReservedModal(id); };
            grid.appendChild(div);
        }
    }
}

function toggleTabStatus(day) {
    bookingSettings.tabs[day].isOpen = !bookingSettings.tabs[day].isOpen;
    db.collection("settings").doc("booking").update(bookingSettings).then(() => addLog(`${day} 상태 변경`));
}

function toggleAllTabs(status) {
    Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = status);
    db.collection("settings").doc("booking").update(bookingSettings).then(() => addLog(`전체 ${status?'열림':'닫힘'}`));
}

function exportAllCSV() {
    try {
        const wb = XLSX.utils.book_new();
        ["monday", "tuesday", "thursday"].forEach(day => {
            const rows = [];
            Object.keys(allSlotsData).filter(k=>k.startsWith(day)).sort().forEach(id => {
                allSlotsData[id].attendees.forEach(a => rows.push({Time: id.split('_')[1], Alliance: a.alliance, Nickname: a.player, Days: a.daysSaved}));
            });
            if(rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day);
        });
        XLSX.writeFile(wb, "SVS_Booking.xlsx");
        addLog("엑셀 추출 완료");
    } catch(e) { alert("XLSX 라이브러리 오류"); }
}

function handleAdminAccess() { sc++; if(sc>=3) { sc=0; if(prompt("Pass:")==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); addLog("관리자 로그인"); } } }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
function updateStatusMessage() { 
    var el = document.getElementById("bookingStatusMsg");
    if(el) el.innerText = bookingSettings.tabs[currentBuff].isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 예약 잠금 상태 / Booking is Locked";
}
function updateCountdown() {
    var diff = new Date(bookingSettings.baseDate) - new Date();
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000;
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m`;
}

init();

var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    tabs: { 
        monday: { isOpen: true }, 
        tuesday: { isOpen: true }, 
        thursday: { isOpen: true } 
    } 
};

var adminAuthenticated = false;
var sc = 0;

// 유틸리티 함수
function padTime(h, m) { 
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; 
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); 
}
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// 시스템 로그
function addLog(msg) {
    const logsBox = document.getElementById('logsBox');
    if (!logsBox) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement('div');
    logItem.textContent = `[${timeStr}] ${msg}`;
    logsBox.prepend(logItem);
}

// 초기화
function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) {
            bookingSettings = doc.data(); 
            updateAdminStatusButtons();
        }
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

// 메인 렌더링
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
                    if(lock && !adminAuthenticated) return alert("잠겨있습니다 / Locked."); 
                    selectedSlot = sId; 
                    if (allSlotsData[sId]?.attendees?.length > 0) openReservedModal(sId);
                    else openReserveModal();
                }; 
            })(id, isTabLocked);
            grid.appendChild(div);
        }
    }
    updateTabsUI();
}

function updateTabsUI() {
    document.querySelectorAll(".tabs button").forEach(btn => {
        btn.classList.toggle("active", btn.id === "tab-" + currentBuff);
    });
}

function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function openReserveModal() { 
    document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC";
    document.getElementById("modal").classList.add("show"); 
}
function closeModal() { document.getElementById("modal").classList.remove("show"); }

function openReservedModal(id) {
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC";
    var list = document.getElementById("attendeeListDetail");
    list.innerHTML = "";
    allSlotsData[id]?.attendees?.forEach((a, i) => {
        var d = document.createElement("div");
        d.className = "miniItem"; d.style.fontSize = "14px"; d.style.padding = "8px 0";
        var delBtn = adminAuthenticated ? `<button onclick="deleteAttendee('${id}', ${i})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">[삭제/DEL]</button>` : "";
        d.innerHTML = `<span>${i+1}. [${a.alliance}] ${a.player} (${a.daysSaved}d)</span> ${delBtn}`;
        list.appendChild(d);
    });
    document.getElementById("reservedModal").classList.add("show");
}
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function openReserveFromStatus() { closeReservedModal(); openReserveModal(); }

// 예약 및 취소 로직
function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("모든 항목을 입력하세요 / Fill all fields.");
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true})
    .then(() => { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); closeModal(); alert("예약 성공 / Success!"); });
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!m || !pass) return alert("정보가 없거나 비밀번호가 비어있습니다.");
    var mine = JSON.parse(m), ref = db.collection("slots").doc(selectedSlot);
    ref.get().then(doc => {
        var list = doc.data().attendees.filter(a => !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
        if(list.length === doc.data().attendees.length) return alert("비밀번호가 틀렸거나 본인의 예약이 아닙니다.");
        ref.update({ attendees: list }).then(() => { closeReservedModal(); alert("취소 완료 / Cancelled."); });
    });
}

// 관리자 기능
function handleAdminAccess() {
    sc++;
    if (sc >= 3) {
        sc = 0;
        var p = prompt("Password:");
        if (p === "2737") {
            adminAuthenticated = true;
            document.getElementById("adminPanel").classList.add("show");
            addLog("관리자 로그인 성공");
            updateAdminStatusButtons();
        }
    }
}
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }

function toggleTabStatus(tab) {
    bookingSettings.tabs[tab].isOpen = !bookingSettings.tabs[tab].isOpen;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`${tab} 상태 변경: ${bookingSettings.tabs[tab].isOpen ? 'Open' : 'Closed'}`);
    });
}

function toggleAllTabs(status) {
    Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = status);
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`전체 상태 변경: ${status ? 'All Open' : 'All Closed'}`);
    });
}

function updateAdminStatusButtons() {
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        const btn = document.getElementById(`btn-admin-${day}`);
        if (btn) btn.style.background = bookingSettings.tabs[day].isOpen ? "#48bb78" : "#a0aec0";
    });
}

function deleteAttendee(slotId, index) {
    if(!confirm("삭제하시겠습니까?")) return;
    var ref = db.collection("slots").doc(slotId);
    ref.get().then(doc => {
        var list = doc.data().attendees;
        var removed = list.splice(index, 1);
        ref.update({ attendees: list }).then(() => {
            addLog(`삭제됨: ${removed[0].player} (${slotId})`);
            openReservedModal(slotId);
        });
    });
}

function exportAllCSV() {
    var wb = XLSX.utils.book_new();
    var dayNames = { monday: "Monday", tuesday: "Tuesday", thursday: "Thursday" };
    ["monday", "tuesday", "thursday"].forEach(day => {
        var rows = [];
        Object.keys(allSlotsData).filter(k => k.startsWith(day)).sort().forEach(id => {
            allSlotsData[id]?.attendees?.forEach(a => {
                rows.push({ Time: id.split('_')[1], Alliance: a.alliance, Nickname: a.player, ID: a.playerId, Days: a.daysSaved });
            });
        });
        if (rows.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), dayNames[day]);
    });
    XLSX.writeFile(wb, "SVS_Booking.xlsx");
}

function backupAndClearAll() {
    if(!confirm("진짜 다 지워요?")) return;
    db.collection("slots").get().then(snap => {
        var batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        batch.commit().then(() => { addLog("전체 데이터 초기화"); alert("완료"); });
    });
}

function saveAdminBaseDate() {
    var val = document.getElementById("adminBaseDate").value;
    if(!val) return;
    bookingSettings.baseDate = val;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => { addLog("기준일 변경 완료"); alert("저장됨"); });
}

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

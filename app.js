var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    tabs: { 
        monday: { isOpen: true, openTime: "", closeTime: "" }, 
        tuesday: { isOpen: true, openTime: "", closeTime: "" }, 
        thursday: { isOpen: true, openTime: "", closeTime: "" } 
    } 
};
var adminAuthenticated = false;
var sc = 0;

// 유틸리티 함수
function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }

// 초기화
function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) {
            bookingSettings = doc.data(); 
            if(adminAuthenticated) fillAdminInputs();
        }
        updateStatusMessage(); updateAdminUI(); renderAll(); 
    });
    db.collection("slots").onSnapshot(snap => { 
        allSlotsData = {}; snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); }); 
        renderAll(); 
    });
    // 1초마다 모든 시간 관련 로직 업데이트
    setInterval(updateSystemTick, 1000);
}

// 시간 관련 통합 티커
function updateSystemTick() {
    updateCountdown();     // 상단 SVS 카운트다운
    updateTabCountdowns(); // 요일 탭별 자동 오픈/마감 카운트다운
}

// 실시간 시스템 로그
function addLog(msg) {
    const box = document.getElementById('logsBox'); if (!box) return;
    const log = document.createElement('div');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    log.textContent = `[${timeStr}] ${msg}`; box.prepend(log);
}

// 탭 버튼별 카운트다운 및 상태 업데이트
function updateTabCountdowns() {
    const now = new Date();
    const days = ['monday', 'tuesday', 'thursday'];

    days.forEach(day => {
        const settings = bookingSettings.tabs[day];
        const cdEl = document.getElementById(`cd-${day}`);
        if (!cdEl || !settings.openTime || !settings.closeTime) return;

        const openDate = new Date(settings.openTime);
        const closeDate = new Date(settings.closeTime);
        let statusText = "";

        if (now < openDate) {
            const diff = openDate - now;
            statusText = `오픈까지 ${formatDiff(diff)}`;
            cdEl.style.color = "#3182ce"; // 대기중 (파랑)
        } else if (now >= openDate && now <= closeDate) {
            const diff = closeDate - now;
            statusText = `마감까지 ${formatDiff(diff)}`;
            cdEl.style.color = "#e53e3e"; // 진행중 (빨강)
        } else {
            statusText = "예약 종료 / Closed";
            cdEl.style.color = "#718096"; // 종료 (회색)
        }
        cdEl.innerText = statusText;
    });
    updateStatusMessage();
}

function formatDiff(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return d > 0 ? `${d}d ${h}h` : `${h}h ${m}m ${s}s`;
}

// 실제 예약 가능 여부 체크 (시간 기준)
function isTabActuallyOpen(day) {
    const settings = bookingSettings.tabs[day];
    if (!settings.openTime || !settings.closeTime) return false;
    const now = new Date();
    return now >= new Date(settings.openTime) && now <= new Date(settings.closeTime);
}

function updateTabsUI() { 
    document.querySelectorAll(".tabs button").forEach(btn => { 
        btn.classList.toggle("active", btn.id === "tab-" + currentBuff); 
    }); 
}

// 메인 렌더링 (가속 일수 숨김 처리)
function renderAll() {
    const grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    const isOpen = isTabActuallyOpen(currentBuff);
    const search = normalizeText(document.getElementById("searchInput").value);
    const filter = document.getElementById("filterStatus").value;
    const dayLabel = currentBuff === "monday" ? "월 / Mon" : currentBuff === "tuesday" ? "화 / Tue" : "목 / Thu";

    updateTabsUI();
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId;
            const slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            if (search && !slot.attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;
            
            const div = document.createElement("div");
            const myClass = slot.attendees.some(isMyReservation) ? " myReservation" : "";
            const pmClass = h >= 12 ? "pm-slot " : "";
            div.className = "slot " + pmClass + (!isOpen ? " locked" : "") + myClass;
            
            // [보안] 메인 화면에서 가속 일수(daysSaved) 제거
            const listHtml = slot.attendees.slice(0,3).map((a,i) => `<div class='miniItem'><span class="pName">${i+1}. ${a.player}</span></div>`).join('');
            
            div.innerHTML = `<div class="dayBadge">${dayLabel}</div><div class="timeRow"><span class="timeUTC">${tId}~${eId} UTC</span><span>${slot.attendees.length}명</span></div><div class="localTime">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0)))}</div><div class="attendeeMiniList">${listHtml || '<div style="color:#cbd5e0; text-align:center; font-size:12px;">No Reservation</div>'}</div>${slot.attendees.length > 3 ? `<div style="text-align:center; font-size:10px; color:#a0aec0; margin-top:5px;">+ ${slot.attendees.length - 3} more</div>` : ''}`;
            
            div.onclick = () => { 
                if(!isOpen && !adminAuthenticated) return alert("현재 예약 가능한 시간이 아닙니다. / Reservation is currently closed."); 
                selectedSlot = id; 
                if (slot.attendees.length > 0) openReservedModal(id); 
                else openReserveModal(); 
            };
            grid.appendChild(div);
        }
    }
}

// 예약 확정 (ID 및 가속 필수 검증 + 한/영 병기 알림)
function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    if(!a || !p || !idNum || !d || !pass) return alert("필수 항목 입력 누락! / Please fill all fields.");
    if(idNum.length !== 9 || isNaN(idNum)) return alert("ID는 숫자 9자리여야 합니다! / ID must be 9 digits.");
    
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(() => { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: idNum, cancelKey: pass })); 
        closeModal(); addLog(`New Booking: ${p} (${selectedSlot})`); alert("예약 성공! / Success!"); 
    });
}

// 예약 취소
function confirmCancel() {
    var pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!m || !pass) return alert("취소 비밀번호를 입력하세요! / Please enter password.");
    var mine = JSON.parse(m), ref = db.collection("slots").doc(selectedSlot);
    ref.get().then(doc => {
        if(!doc.exists) return;
        var list = doc.data().attendees.filter(a => !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
        if(list.length === doc.data().attendees.length) return alert("비밀번호가 틀렸습니다! / Wrong password.");
        ref.update({ attendees: list }).then(() => { closeReservedModal(); addLog(`Cancelled: ${mine.player}`); alert("취소 완료! / Cancelled."); });
    });
}

// [보안] 관리자 전용 엑셀 추출 (가속 일수 포함)
function exportAllCSV() {
    try {
        const wb = XLSX.utils.book_new(); let hasData = false;
        ["monday", "tuesday", "thursday"].forEach(day => {
            const rows = [];
            Object.keys(allSlotsData).filter(k => k.startsWith(day)).sort().forEach(id => {
                allSlotsData[id].attendees.forEach(a => { rows.push({ "Day": day.toUpperCase(), "Time(UTC)": id.split('_')[1], "Alliance": a.alliance, "Nickname": a.player, "ID": a.playerId, "Speed-up Days": a.daysSaved }); });
            });
            if (rows.length > 0) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); hasData = true; }
        });
        if (!hasData) return alert("데이터 없음! / No data."); 
        XLSX.writeFile(wb, `SVS_Export_${new Date().toLocaleDateString()}.xlsx`); addLog("Excel Exported");
    } catch (e) { alert("추출 실패! / Export failed."); }
}

// 관리자 시간 설정 저장
function saveAutoSchedule() {
    const days = ['monday', 'tuesday', 'thursday'];
    days.forEach(day => {
        bookingSettings.tabs[day].openTime = document.getElementById(`open-${day}`).value;
        bookingSettings.tabs[day].closeTime = document.getElementById(`close-${day}`).value;
    });
    db.collection("settings").doc("booking").update(bookingSettings).then(() => {
        addLog("Auto Schedule Saved"); alert("시간 설정 저장됨! / Schedule Saved!");
    });
}

function handleAdminAccess() { sc++; if(sc>=3) { sc=0; var p=prompt("Password:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); fillAdminInputs(); updateAdminUI(); addLog("Admin Login"); } } }
function saveAdminBaseDate() { var val = document.getElementById("adminBaseDate").value; if(!val) return; db.collection("settings").doc("booking").update({baseDate: val}).then(()=> { addLog("Base Date Updated"); alert("저장됨! / Saved!"); }); }
function toggleTabStatus(day) { var current = bookingSettings.tabs[day].isOpen; bookingSettings.tabs[day].isOpen = !current; db.collection("settings").doc("booking").update(bookingSettings).then(() => addLog(`${day} Manual Toggle`)); }
function toggleAllTabs(status) { Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = status); db.collection("settings").doc("booking").update(bookingSettings).then(() => addLog(`All Manual Toggle: ${status}`)); }
function backupAndClearAll() { if(!confirm("전체 삭제하시겠습니까? / Confirm Clear all?")) return; db.collection("slots").get().then(snap => { var batch = db.batch(); snap.forEach(doc => batch.delete(doc.ref)); batch.commit().then(() => { addLog("Data Cleared"); alert("삭제 완료! / Cleared!"); }); }); }

function updateAdminUI() { ['monday', 'tuesday', 'thursday'].forEach(day => { const btn = document.getElementById(`btn-admin-${day}`); if (btn) btn.className = bookingSettings.tabs[day].isOpen ? "admin-btn-on" : "admin-btn-off"; }); }
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); if(el) el.innerText = isTabActuallyOpen(currentBuff) ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 예약 잠금 상태 / Booking is Locked"; }
function updateCountdown() { var diff = new Date(bookingSettings.baseDate) - new Date(); while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m ${s}s`; }
function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }

function fillAdminInputs() {
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        if(bookingSettings.tabs[day].openTime) document.getElementById(`open-${day}`).value = bookingSettings.tabs[day].openTime;
        if(bookingSettings.tabs[day].closeTime) document.getElementById(`close-${day}`).value = bookingSettings.tabs[day].closeTime;
    });
}

function openReserveModal() { 
    var m = localStorage.getItem(MY_BOOKING_KEY); 
    if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; document.getElementById("cancelKey").value = mine.cancelKey || ""; } 
    document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); 
}

function openReservedModal(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); list.innerHTML = ""; 
    allSlotsData[id]?.attendees?.forEach((a, i) => { 
        var d = document.createElement("div"); d.className = "miniItem"; d.style.padding = "8px 0";
        // [보안] 상세 리스트에서도 가속 일수(daysSaved) 제거
        d.innerHTML = `<span class="pName">${i+1}. [${a.alliance}] ${a.player}</span>`; 
        if (adminAuthenticated) { 
            var delBtn = document.createElement("button"); delBtn.innerText = "삭제 / Del"; 
            delBtn.style.marginLeft = "10px"; delBtn.onclick = () => deleteAttendee(id, i); d.appendChild(delBtn); 
        } 
        list.appendChild(d); 
    }); 
    document.getElementById("reservedModal").classList.add("show"); 
}

function deleteAttendee(slotId, index) { 
    if(!confirm("삭제하시겠습니까? / Confirm Delete?")) return;
    var ref = db.collection("slots").doc(slotId); 
    ref.get().then(doc => { 
        var list = doc.data().attendees; var pName = list[index].player;
        list.splice(index, 1); ref.update({ attendees: list }).then(() => { addLog(`Admin del: ${pName}`); openReservedModal(slotId); }); 
    }); 
}

function openReserveFromStatus() { 
    if(!isTabActuallyOpen(currentBuff) && !adminAuthenticated) return alert("예약 마감되었습니다. / Locked.");
    closeReservedModal(); openReserveModal(); 
}
function isMyReservation(person) { var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false; var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player); }

init();

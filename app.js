var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { baseDate: "2026-05-23T21:00:00", globalOpenTime: "", tabs: { monday: { isOpen: true, closeTime: "" }, tuesday: { isOpen: true, closeTime: "" }, thursday: { isOpen: true, closeTime: "" } } };
var adminAuthenticated = false;
var sc = 0;

function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }

function init() {
    if(!db) return;
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) { bookingSettings = doc.data(); if(adminAuthenticated) fillAdminInputs(); }
        updateStatusMessage(); updateAdminUI(); renderAll(); 
    });
    db.collection("slots").onSnapshot(snap => { allSlotsData = {}; snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); }); renderAll(); });
    setInterval(() => { updateCountdown(); updateTabCountdowns(); }, 1000);
}

function updateTabCountdowns() {
    const now = new Date();
    const gOpenStr = bookingSettings.globalOpenTime;
    const gOpen = gOpenStr ? new Date(gOpenStr) : null;

    ['monday', 'tuesday', 'thursday'].forEach(day => {
        const s = bookingSettings.tabs[day];
        const cdEl = document.getElementById(`cd-${day}`);
        if (!cdEl) return;

        // 탭에 표시할 텍스트 결정
        if (gOpen && !isNaN(gOpen) && now < gOpen) {
            cdEl.innerText = `Open in: ${formatDiff(gOpen - now)}`;
        } else if (s.closeTime && !isNaN(new Date(s.closeTime))) {
            const cDate = new Date(s.closeTime);
            if (now <= cDate) {
                cdEl.innerText = `Close in: ${formatDiff(cDate - now)}`;
            } else {
                cdEl.innerText = "Closed";
            }
        } else {
            cdEl.innerText = s.isOpen ? "Ready" : "Locked";
        }
    });
}

function formatDiff(ms) {
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
}

function isTabActuallyOpen(day) {
    const s = bookingSettings.tabs[day], now = new Date();
    if (!s.isOpen) return false; 
    if (bookingSettings.globalOpenTime && now < new Date(bookingSettings.globalOpenTime)) return false;
    if (s.closeTime && now > new Date(s.closeTime)) return false;
    return true;
}

function renderAll() {
    const grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    const isOpen = isTabActuallyOpen(currentBuff);
    const search = normalizeText(document.getElementById("searchInput").value);
    const filter = document.getElementById("filterStatus").value;
    document.querySelectorAll(".tab-item").forEach(item => item.classList.toggle("active", item.id === "tab-" + currentBuff));

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId;
            const slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            if (search && !slot.attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;
            const div = document.createElement("div");
            div.className = "slot " + (h >= 12 ? "pm-slot " : "") + (!isOpen ? " locked" : "") + (slot.attendees.some(isMyReservation) ? " myReservation" : "");
            const listHtml = slot.attendees.slice(0,3).map((a,i) => `<div class='miniItem'>${i+1}. ${a.player}</div>`).join('');
            div.innerHTML = `<div class="dayBadge">${currentBuff.toUpperCase().slice(0,3)}</div><div class="timeRow"><span>${tId}~${eId} UTC</span><span style="color:#d34b4b;">${slot.attendees.length}명</span></div><div class="localTime">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0)))}</div><div class="attendeeMiniList">${listHtml || 'No Reservation'}</div>`;
            div.onclick = () => { if(!isOpen && !adminAuthenticated) return alert("마감되었습니다."); selectedSlot = id; if (slot.attendees.length > 0) openReservedModal(id); else openReserveModal(); };
            grid.appendChild(div);
        }
    }
}

// [이하 관리자 및 유틸리티 함수들 유지]
function addLog(msg) { const box = document.getElementById('logsBox'); if (box) { const log = document.createElement('div'); log.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`; box.prepend(log); } }
function handleAdminAccess() { sc++; if(sc>=3) { sc=0; var p=prompt("Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); fillAdminInputs(); updateAdminUI(); addLog("Admin Login"); } } }
function updateAdminUI() { ['monday', 'tuesday', 'thursday'].forEach(day => { const btn = document.getElementById(`btn-admin-${day}`); if (btn) btn.classList.toggle("on", bookingSettings.tabs[day].isOpen); }); }
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); if(el) el.innerText = isTabActuallyOpen(currentBuff) ? "✅ 예약 가능 / Booking Open" : "🔒 예약 마감 / Booking Closed"; }
function updateCountdown() { var diff = new Date(bookingSettings.baseDate) - new Date(); while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m ${s}s`; }
function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }
function fillAdminInputs() { document.getElementById("global-open-time").value = bookingSettings.globalOpenTime || ""; ['monday', 'tuesday', 'thursday'].forEach(day => { if(bookingSettings.tabs[day].closeTime) document.getElementById(`close-${day}`).value = bookingSettings.tabs[day].closeTime; }); }
function openReserveModal() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; document.getElementById("cancelKey").value = mine.cancelKey || ""; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); }
function openReservedModal(id) { document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; var list = document.getElementById("attendeeListDetail"); list.innerHTML = ""; allSlotsData[id]?.attendees?.forEach((a, i) => { var d = document.createElement("div"); d.className = "miniItem"; d.innerHTML = `<span>${i+1}. [${a.alliance}] ${a.player}</span>`; if (adminAuthenticated) { var delBtn = document.createElement("button"); delBtn.innerText = "삭제"; delBtn.style.marginLeft="10px"; delBtn.onclick = () => deleteAttendee(id, i); d.appendChild(delBtn); } list.appendChild(d); }); document.getElementById("reservedModal").classList.add("show"); }
function deleteAttendee(slotId, index) { if(!confirm("Delete?")) return; var ref = db.collection("slots").doc(slotId); ref.get().then(doc => { var list = doc.data().attendees; list.splice(index, 1); ref.update({ attendees: list }).then(() => { addLog("Entry Deleted"); openReservedModal(slotId); }); }); }
function confirmBooking() { var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value; if(!a || !p || !idNum || !d || !pass) return alert("항목 누락!"); if(idNum.length !== 9) return alert("ID 9자리!"); var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() }; db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(() => { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: idNum, cancelKey: pass })); closeModal(); addLog(`New: ${p}`); alert("성공!"); }); }
function confirmCancel() { var pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !pass) return alert("비번!"); var mine = JSON.parse(m), ref = db.collection("slots").doc(selectedSlot); ref.get().then(doc => { var list = doc.data().attendees.filter(a => !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass))); if(list.length === doc.data().attendees.length) return alert("비번 오류!"); ref.update({ attendees: list }).then(() => { closeReservedModal(); alert("완료!"); }); }); }
function saveAutoSchedule() { bookingSettings.globalOpenTime = document.getElementById("global-open-time").value; ['monday', 'tuesday', 'thursday'].forEach(d => { bookingSettings.tabs[d].closeTime = document.getElementById(`close-${d}`).value; }); db.collection("settings").doc("booking").update(bookingSettings).then(() => { addLog("Schedule Saved"); alert("Saved!"); }); }
function saveAdminBaseDate() { var val = document.getElementById("adminBaseDate").value; if(!val) return; db.collection("settings").doc("booking").update({baseDate: val}).then(()=> { addLog("Base Date Changed"); alert("Saved"); }); }
function toggleTabStatus(day) { var c = bookingSettings.tabs[day].isOpen; bookingSettings.tabs[day].isOpen = !c; db.collection("settings").doc("booking").update(bookingSettings); }
function backupAndClearAll() { if(!confirm("전체 삭제?")) return; db.collection("slots").get().then(snap => { var batch = db.batch(); snap.forEach(doc => batch.delete(doc.ref)); batch.commit().then(()=>addLog("DB Clear")); }); }
function exportAllCSV() { try { const wb = XLSX.utils.book_new(); let hd = false; ["monday", "tuesday", "thursday"].forEach(day => { const rows = []; Object.keys(allSlotsData).filter(k => k.startsWith(day)).forEach(id => { allSlotsData[id].attendees.forEach(a => { rows.push({ "Day": day, "Time": id.split('_')[1], "Alliance": a.alliance, "Nickname": a.player, "ID": a.playerId, "Days": a.daysSaved }); }); }); if (rows.length > 0) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); hd = true; } }); if (!hd) return alert("No data."); XLSX.writeFile(wb, `SVS_Booking.xlsx`); addLog("Excel Export"); } catch (e) { alert("Fail."); } }
function openReserveFromStatus() { if(!isTabActuallyOpen(currentBuff) && !adminAuthenticated) return alert("Locked."); closeReservedModal(); openReserveModal(); }
function isMyReservation(person) { var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false; var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player); }

init();

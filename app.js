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
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }

function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) bookingSettings = doc.data(); 
        updateStatusMessage(); updateAdminUI(); renderAll();
    });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {}; snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// 로그 시스템 개선
function addLog(msg) {
    const box = document.getElementById('logsBox');
    if (!box) return;
    const log = document.createElement('div');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    log.textContent = `[${timeStr}] ${msg}`;
    box.prepend(log);
}

function renderAll() {
    const grid = document.getElementById("slots");
    if (!grid) return; grid.innerHTML = "";
    const isLocked = !bookingSettings.tabs[currentBuff].isOpen;
    const search = normalizeText(document.getElementById("searchInput").value);
    const filter = document.getElementById("filterStatus").value;

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId;
            const slot = allSlotsData[id] || { attendees: [] };
            
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            if (search && !slot.attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;

            const div = document.createElement("div");
            const myClass = slot.attendees.some(isMyReservation) ? " myReservation" : "";
            div.className = "slot " + (h >= 12 ? "pm-slot" : "") + (isLocked ? " locked" : "") + myClass;
            
            const listHtml = slot.attendees.slice(0,3).map((a,i) => `
                <div class='miniItem'>
                    <span class="pName">${i+1}. ${a.player}</span>
                    <span class="pDays">${a.daysSaved}d</span>
                </div>
            `).join('');

            div.innerHTML = `
                <div class="timeRow"><span class="timeUTC">${tId}~${eId} UTC</span><span>${slot.attendees.length}명</span></div>
                <div style="font-size:11px; color:#718096; margin-bottom:10px;">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0)))}</div>
                <div class="attendeeMiniList">${listHtml || '<div style="color:#cbd5e0; text-align:center; font-size:12px;">No Reservation</div>'}</div>
                ${slot.attendees.length > 3 ? `<div style="text-align:center; font-size:10px; color:#a0aec0; margin-top:5px;">+ ${slot.attendees.length - 3} more</div>` : ''}
            `;

            div.onclick = () => { 
                if(isLocked && !adminAuthenticated) return alert("Locked."); 
                selectedSlot = id; 
                if (slot.attendees.length > 0) openReservedModal(id);
                else openReserveModal();
            };
            grid.appendChild(div);
        }
    }
}

function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("Fill all fields.");
    if(idNum.length !== 9 || isNaN(idNum)) return alert("ID must be 9 digits.");
    
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true})
    .then(() => { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); 
        closeModal(); 
        addLog(`예약 완료: ${p} (${selectedSlot})`);
        alert("Success!"); 
    });
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!m || !pass) return alert("Check password.");
    var mine = JSON.parse(m), ref = db.collection("slots").doc(selectedSlot);
    ref.get().then(doc => {
        if(!doc.exists) return;
        var list = doc.data().attendees.filter(a => !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
        if(list.length === doc.data().attendees.length) return alert("Wrong password.");
        ref.update({ attendees: list }).then(() => { 
            closeReservedModal(); 
            addLog(`예약 취소: ${selectedSlot}`);
            alert("Cancelled."); 
        });
    });
}

function handleAdminAccess() { sc++; if(sc>=3) { sc=0; var p=prompt("Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); updateAdminUI(); addLog("Admin Login"); } } }
function saveAdminBaseDate() { var val = document.getElementById("adminBaseDate").value; if(!val) return; db.collection("settings").doc("booking").update({baseDate: val}).then(()=>{ addLog("SVS 기준일 변경 완료"); alert("Saved"); }); }
function toggleTabStatus(day) { 
    var current = bookingSettings.tabs[day].isOpen;
    bookingSettings.tabs[day].isOpen = !current; 
    db.collection("settings").doc("booking").update(bookingSettings).then(() => {
        addLog(`${day} 상태 변경: ${!current ? 'Open' : 'Closed'}`);
    });
}
function toggleAllTabs(status) { 
    Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = status); 
    db.collection("settings").doc("booking").update(bookingSettings).then(() => {
        addLog(`전체 요일 상태 변경: ${status ? 'Open' : 'Closed'}`);
    });
}

// 엑셀 추출 기능 수정
function exportAllCSV() {
    try {
        if (typeof XLSX === 'undefined') {
            alert("엑셀 라이브러리가 로드되지 않았습니다.");
            return;
        }
        const wb = XLSX.utils.book_new();
        let hasData = false;
        ["monday", "tuesday", "thursday"].forEach(day => {
            const rows = [];
            Object.keys(allSlotsData).filter(k => k.startsWith(day)).sort().forEach(id => {
                allSlotsData[id].attendees.forEach(a => {
                    rows.push({
                        "요일": day.toUpperCase(),
                        "시간(UTC)": id.split('_')[1],
                        "연맹": a.alliance,
                        "닉네임": a.player,
                        "ID": a.playerId,
                        "가속일수": a.daysSaved
                    });
                });
            });
            if (rows.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day);
                hasData = true;
            }
        });

        if (!hasData) {
            alert("추출할 예약 데이터가 없습니다.");
            return;
        }

        XLSX.writeFile(wb, `SVS_Booking_${new Date().toLocaleDateString()}.xlsx`);
        addLog("엑셀 데이터 추출 완료");
    } catch (e) {
        console.error(e);
        alert("엑셀 추출 중 오류가 발생했습니다.");
    }
}

function backupAndClearAll() { 
    if(!confirm("진짜 다 지워요?")) return; 
    db.collection("slots").get().then(snap => { 
        var batch = db.batch(); 
        snap.forEach(doc => batch.delete(doc.ref)); 
        batch.commit().then(() => {
            addLog("전체 예약 데이터 삭제됨");
            alert("Clear Complete");
        }); 
    }); 
}

function updateAdminUI() { ['monday', 'tuesday', 'thursday'].forEach(day => { const btn = document.getElementById(`btn-admin-${day}`); if (btn) btn.className = bookingSettings.tabs[day].isOpen ? "admin-btn-on" : "admin-btn-off"; }); }
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); if(el) el.innerText = bookingSettings.tabs[currentBuff].isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 예약 잠금 상태 / Booking is Locked"; }
function updateCountdown() { var diff = new Date(bookingSettings.baseDate) - new Date(); while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m ${s}s`; }
function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }
function openReserveModal() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance; document.getElementById("player").value = mine.player; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); }

function openReservedModal(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); 
    list.innerHTML = ""; 
    allSlotsData[id]?.attendees?.forEach((a, i) => { 
        var d = document.createElement("div"); 
        d.className = "miniItem"; 
        d.style.padding = "8px 0";
        d.innerHTML = `<span class="pName">${i+1}. [${a.alliance}] ${a.player}</span><span class="pDays">${a.daysSaved}d</span>`; 
        if (adminAuthenticated) {
            var delBtn = document.createElement("button");
            delBtn.innerText = "삭제"; delBtn.style.marginLeft = "10px";
            delBtn.style.background = "#ffcdd2"; delBtn.style.border = "none"; delBtn.style.borderRadius = "4px";
            delBtn.onclick = () => deleteAttendee(id, i);
            d.appendChild(delBtn);
        }
        list.appendChild(d); 
    }); 
    document.getElementById("reservedModal").classList.add("show"); 
}

function deleteAttendee(slotId, index) {
    if(!confirm("삭제하시겠습니까?")) return;
    var ref = db.collection("slots").doc(slotId);
    ref.get().then(doc => {
        var list = doc.data().attendees;
        list.splice(index, 1);
        ref.update({ attendees: list }).then(() => {
            addLog(`관리자 개별 삭제 완료: ${slotId}`);
            openReservedModal(slotId);
        });
    });
}

function openReserveFromStatus() { closeReservedModal(); openReserveModal(); }
function isMyReservation(person) { var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false; var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player); }

init();

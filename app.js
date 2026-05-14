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
            
            // 닉네임과 가속을 span으로 나누어 CSS에서 space-between 적용
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
                if(isLocked && !adminAuthenticated) return alert("마감됨 / Locked."); 
                selectedSlot = id; 
                if (slot.attendees.length > 0) openReservedModal(id);
                else openReserveModal();
            };
            grid.appendChild(div);
        }
    }
}

// 나머지 함수들(confirmBooking, toggleTabStatus, exportAllCSV 등)은 이전과 동일하게 유지
function handleAdminAccess() { sc++; if(sc>=3) { sc=0; var p=prompt("Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); updateAdminUI(); } } }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }

function openReserveModal() {
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance; document.getElementById("player").value = mine.player; }
    document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC";
    document.getElementById("modal").classList.add("show");
}

function openReservedModal(id) {
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC";
    var list = document.getElementById("attendeeListDetail");
    list.innerHTML = "";
    allSlotsData[id]?.attendees?.forEach((a, i) => {
        var d = document.createElement("div");
        d.className = "miniItem"; d.style.padding = "10px 0";
        d.innerHTML = `<span class="pName">${i+1}. [${a.alliance}] ${a.player}</span><span class="pDays">${a.daysSaved}d</span>`;
        if (adminAuthenticated) {
            var delBtn = document.createElement("button");
            delBtn.innerText = "DEL"; delBtn.style.marginLeft = "10px";
            delBtn.onclick = () => deleteAttendee(id, i);
            d.appendChild(delBtn);
        }
        list.appendChild(d);
    });
    document.getElementById("reservedModal").classList.add("show");
}

function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("필수 정보를 입력하세요.");
    if(idNum.length !== 9 || isNaN(idNum)) return alert("ID는 9자리 숫자여야 합니다.");
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true})
    .then(() => { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); closeModal(); alert("예약 성공!"); });
}

function updateStatusMessage() { 
    var el = document.getElementById("bookingStatusMsg");
    if(el) el.innerText = bookingSettings.tabs[currentBuff].isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 예약 잠금 상태 / Booking is Locked";
}

function updateCountdown() {
    var diff = new Date(bookingSettings.baseDate) - new Date();
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000;
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m ${s}s`;
}

function isMyReservation(person) { var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false; var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player); }

init();

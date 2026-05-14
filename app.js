var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// Utils
function padTime(h, m) { return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function escapeHtml(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { 
    var str = String(v || ""); var hash = 0;
    for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
    return "h_" + Math.abs(hash);
}
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// Identity
function saveMyBookingInfo(a, p) { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); }
function getMyBookingInfo() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } }
function isMyReservation(person) {
    var mine = getMyBookingInfo();
    return mine && normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance);
}

// Init
function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { renderAll(); });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {};
        snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
}

// Render
function renderAll() {
    var grid = document.getElementById("slots");
    if (!grid) return;
    grid.innerHTML = "";
    var search = normalizeText(document.getElementById("searchInput").value);
    var filter = document.getElementById("filterStatus").value;

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var id = currentBuff + "_" + padTime(h, m);
            var slot = allSlotsData[id] || { attendees: [] };
            var attendees = slot.attendees || [];

            if (filter === "mine" && !attendees.some(isMyReservation)) continue;
            if (search && !attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;

            var div = document.createElement("div");
            div.className = "slot" + (attendees.some(isMyReservation) ? " myReservation" : "");
            
            var utcStart = padTime(h, m);
            var utcEnd = padTime(h, m + 30);
            var localDate = new Date(); localDate.setUTCHours(h, m, 0, 0);

            var html = `<div class="timeRow"><span class="timeUTC">${utcStart}-${utcEnd} UTC</span><span class="statusAvailable">${attendees.length} Booked</span></div>`;
            html += `<div class="timeLocal">Local: ${formatLocalTime(localDate)}</div><div class="attendeeListWrap">`;
            
            attendees.slice(0, 3).forEach((p, i) => {
                html += `<div class="attendeeItem ${isMyReservation(p) ? 'isMine' : ''}"><span>${i+1}. ${p.player}</span><span class="days">${p.daysSaved}d</span></div>`;
            });
            if(attendees.length > 3) html += `<div style="font-size:10px; color:gray; text-align:center;">+ ${attendees.length-3} more</div>`;
            html += `</div>`;

            div.innerHTML = html;
            div.onclick = (function(slotId) { return function() { 
                selectedSlot = slotId;
                if (allSlotsData[slotId] && allSlotsData[slotId].attendees.length > 0) openReservedModal(slotId);
                else openReserveModal(slotId);
            }; })(id);
            grid.appendChild(div);
        }
    }
    updateTabs();
}

function updateTabs() {
    document.querySelectorAll(".tabs button").forEach(btn => {
        btn.classList.toggle("active", btn.id === "tab-" + currentBuff);
    });
}

function switchBuff(b) { currentBuff = b; renderAll(); }

// Modals
function openReserveModal(id) {
    selectedSlot = id;
    var info = id.split("_");
    document.getElementById("selectedSlotInfo").innerHTML = `<b>${info[0].toUpperCase()} / ${info[1]} UTC</b><br>예약 신청 / New Booking`;
    document.getElementById("modal").classList.add("show");
    var mine = getMyBookingInfo();
    if(mine) { document.getElementById("alliance").value = mine.alliance; document.getElementById("player").value = mine.player; }
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }

function openReservedModal(id) {
    selectedSlot = id;
    var slot = allSlotsData[id];
    var listDiv = document.getElementById("attendeeListDetail");
    listDiv.innerHTML = "";
    slot.attendees.forEach((p, i) => {
        var d = document.createElement("div");
        d.className = "attendeeItem " + (isMyReservation(p) ? "isMine" : "");
        d.innerHTML = `<span>${i+1}. [${p.alliance}] ${p.player}</span><span class="days">${p.daysSaved}d</span>`;
        listDiv.appendChild(d);
    });
    var info = id.split("_");
    document.getElementById("reservedSlotInfo").innerHTML = `<b>${info[0].toUpperCase()} / ${info[1]} UTC</b><br>예약 현황 / Booking Status`;
    document.getElementById("reservedModal").classList.add("show");
}

function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }

// Booking Actions
function confirmBooking() {
    var a = document.getElementById("alliance").value.trim();
    var p = document.getElementById("player").value.trim();
    var d = document.getElementById("daysSaved").value;
    var pass = document.getElementById("password").value;

    if(!a || !p || !pass) {
        alert("모든 칸을 입력하세요.\nPlease fill all fields.");
        return;
    }

    var newEntry = { alliance: a, player: p, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var data = doc.exists ? doc.data() : { attendees: [] };
            if(data.attendees.some(ex => ex.playerNormalized === newEntry.playerNormalized)) {
                throw "이미 이 슬롯에 예약되어 있습니다.\nYou are already booked in this slot.";
            }
            t.set(ref, { attendees: [...data.attendees, newEntry], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true});
        });
    }).then(() => { 
        saveMyBookingInfo(a, p); 
        closeModal(); 
        closeReservedModal(); 
        alert("예약이 완료되었습니다!\nBooking Confirmed!"); 
    }).catch(e => {
        alert(e);
    });
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value;
    var mine = getMyBookingInfo();
    if(!mine || !pass) {
        alert("비밀번호를 입력하세요.\nPlease enter your password.");
        return;
    }

    var ref = db.collection("slots").doc(selectedSlot);
    var hash = simpleHash(pass);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            if (!doc.exists) throw "데이터가 없습니다.\nData not found.";
            var data = doc.data();
            var attendees = data.attendees || [];
            var newList = attendees.filter(a => !(a.playerNormalized === normalizeText(mine.player) && a.passwordHash === hash));
            
            if(newList.length === attendees.length) {
                throw "비밀번호가 틀렸거나 본인의 예약이 아닙니다.\nWrong password or it's not your booking.";
            }
            t.update(ref, { attendees: newList });
        });
    }).then(() => { 
        closeReservedModal(); 
        alert("성공적으로 취소되었습니다.\nSuccessfully cancelled."); 
    }).catch(e => {
        alert(e);
    });
}

function clearSearch() { 
    document.getElementById("searchInput").value = ""; 
    renderAll(); 
}

document.getElementById("searchInput").oninput = renderAll;

init();

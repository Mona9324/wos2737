var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var bookingSettings = { baseDate: "2026-03-23", tabs: { monday: { manualOpen: true }, tuesday: { manualOpen: true }, thursday: { manualOpen: true } } };

var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 유틸리티
function padTime(h, m) { return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function escapeHtml(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { 
    var str = String(v || ""); var hash = 0;
    for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
    return "h_" + Math.abs(hash);
}
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// 로컬 스토리지 (내 정보 기억)
function saveMyBookingInfo(a, p) { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); }
function getMyBookingInfo() { 
    try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } 
}
function isMyReservation(person) {
    var mine = getMyBookingInfo();
    return mine && normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance);
}

// 초기화 및 리스너
function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { if(doc.exists) bookingSettings = doc.data(); renderAll(); });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {};
        snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
}

// 화면 그리기
function renderAll() {
    var grid = document.getElementById("slots");
    grid.innerHTML = "";
    var search = normalizeText(document.getElementById("searchInput").value);
    var filter = document.getElementById("filterStatus").value;

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var id = currentBuff + "_" + padTime(h, m);
            var slot = allSlotsData[id] || { attendees: [] };
            var attendees = slot.attendees || [];

            // 필터 및 검색 로직
            if (filter === "mine" && !attendees.some(isMyReservation)) continue;
            if (search && !attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;

            var div = document.createElement("div");
            div.className = "slot" + (attendees.some(isMyReservation) ? " myReservation" : "");
            
            var utcStart = padTime(h, m);
            var utcEnd = padTime(h, m + 30);
            var localDate = new Date(); localDate.setUTCHours(h, m, 0, 0);

            var html = `<div class="timeRow"><span class="timeUTC">${utcStart}-${utcEnd} UTC</span><span class="statusAvailable">${attendees.length}명 신청</span></div>`;
            html += `<div class="timeLocal">내 시간: ${formatLocalTime(localDate)}</div><div class="attendeeListWrap">`;
            
            attendees.slice(0, 3).forEach((p, i) => {
                html += `<div class="attendeeItem ${isMyReservation(p) ? 'isMine' : ''}"><span>${i+1}. ${p.player}</span><span class="days">${p.daysSaved}d</span></div>`;
            });
            if(attendees.length > 3) html += `<div style="font-size:10px; color:gray; text-align:center;">+ 외 ${attendees.length-3}명</div>`;
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

// 모달 제어
function openReserveModal(id) {
    selectedSlot = id;
    document.getElementById("selectedSlotInfo").innerText = id.replace("_", " ") + " 슬롯 예약";
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
    document.getElementById("reservedSlotInfo").innerText = id.replace("_", " ") + " 예약 현황";
    document.getElementById("reservedModal").classList.add("show");
}

function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }

// 예약 및 취소 핵심 로직
function confirmBooking() {
    var a = document.getElementById("alliance").value.trim();
    var p = document.getElementById("player").value.trim();
    var d = document.getElementById("daysSaved").value;
    var pass = document.getElementById("password").value;

    if(!a || !p || !pass) return alert("모든 칸을 입력하세요.");

    var newEntry = { alliance: a, player: p, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var data = doc.exists ? doc.data() : { attendees: [] };
            if(data.attendees.some(ex => ex.playerNormalized === newEntry.playerNormalized)) throw "이미 예약됨";
            t.set(ref, { attendees: [...data.attendees, newEntry], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true});
        });
    }).then(() => { saveMyBookingInfo(a, p); closeModal(); closeReservedModal(); alert("완료!"); }).catch(e => alert(e));
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value;
    var mine = getMyBookingInfo();
    if(!mine || !pass) return alert("정보가 없습니다.");

    var ref = db.collection("slots").doc(selectedSlot);
    var hash = simpleHash(pass);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var data = doc.data();
            var newList = data.attendees.filter(a => !(a.playerNormalized === normalizeText(mine.player) && a.passwordHash === hash));
            if(newList.length === data.attendees.length) throw "비밀번호 틀림";
            t.update(ref, { attendees: newList });
        });
    }).then(() => { closeReservedModal(); alert("취소됨"); }).catch(e => alert(e));
}

function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
document.getElementById("searchInput").oninput = renderAll;

// 실행
init();

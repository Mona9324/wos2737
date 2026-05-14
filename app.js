var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } 
};

var adminAuthenticated = false, sc = 0;

function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }

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
}

function updateStatusMessage() {
    var el = document.getElementById("bookingStatusMsg");
    var isOpen = (bookingSettings.tabs && bookingSettings.tabs[currentBuff]) ? bookingSettings.tabs[currentBuff].isOpen : false;
    if(el) el.innerText = isOpen ? "✅ 예약 가능 기간입니다" : "🔒 예약이 잠겨 있습니다";
}

function renderAll() {
    var grid = document.getElementById("slots");
    if (!grid) return;
    grid.innerHTML = "";
    var isTabLocked = !(bookingSettings.tabs && bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].isOpen);

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var timeId = padTime(h, m), id = currentBuff + "_" + timeId;
            var slot = allSlotsData[id] || { attendees: [] }, attendees = slot.attendees || [];
            
            var div = document.createElement("div");
            div.className = "slot " + (h < 12 ? "am-slot" : "pm-slot") + (isTabLocked ? " locked" : "") + (attendees.some(isMyReservation) ? " myReservation" : "");
            div.innerHTML = `<div><b>${timeId} UTC</b></div><div>${attendees.length}명 예약됨</div>`;
            div.onclick = (function(sId, lock) { 
                return function() { 
                    if(lock) return alert("잠겨있습니다."); 
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
    allSlotsData[id]?.attendees?.forEach(a => {
        var d = document.createElement("div");
        d.innerHTML = `[${a.alliance}] ${a.player} ${a.daysSaved}d`;
        list.appendChild(d);
    });
    document.getElementById("reservedModal").classList.add("show");
}

function openReserveModalFromStatus() {
    closeReservedModal();
    openReserveModal();
}

function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("필수 정보를 모두 입력하세요.");
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);
    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var attendees = (doc.exists ? doc.data().attendees : []) || [];
            t.set(ref, { attendees: [...attendees, newEntry] }, {merge: true});
        });
    }).then(() => { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p }));
        closeModal(); alert("예약 완료!"); 
    });
}

function isMyReservation(person) { 
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if(!m || !person) return false;
    var mine = JSON.parse(m);
    return normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance);
}

function updateCountdown() {
    var diff = new Date(bookingSettings.baseDate) - new Date();
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000;
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = `Next SVS in ${d}d ${h}h ${m}m`;
}

init();

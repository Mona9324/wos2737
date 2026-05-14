var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var adminAuthenticated = false;
var currentUser = null;
var db = window.db;
var auth = window.auth;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 관리자 설정 (기본값)
var bookingSettings = { 
    baseDate: "2026-03-23", 
    tabs: { 
        monday: { manualOpen: true, openAt: "", closeAt: "" }, 
        tuesday: { manualOpen: true, openAt: "", closeAt: "" }, 
        thursday: { manualOpen: true, openAt: "", closeAt: "" } 
    } 
};

// Utils
function padTime(h, m) { 
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    h = h % 24;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); 
}
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
    // 설정 불러오기
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) bookingSettings = doc.data(); 
        renderAll(); 
    });
    // 슬롯 데이터 실시간 감시
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {};
        snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
}

// Render (클릭 오류 수정 포함)
function renderAll() {
    var grid = document.getElementById("slots");
    if (!grid) return;
    grid.innerHTML = "";
    var search = normalizeText(document.getElementById("searchInput").value);
    var filter = document.getElementById("filterStatus").value;

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var timeId = padTime(h, m);
            var id = currentBuff + "_" + timeId;
            var slot = allSlotsData[id] || { attendees: [] };
            var attendees = slot.attendees || [];

            if (filter === "mine" && !attendees.some(isMyReservation)) continue;
            if (search && !attendees.some(a => normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search))) continue;

            var div = document.createElement("div");
            div.className = "slot" + (attendees.some(isMyReservation) ? " myReservation" : "");
            
            var utcStart = timeId;
            var nextM = m + 30;
            var utcEnd = padTime(h, nextM);

            var localDate = new Date(); localDate.setUTCHours(h, m, 0, 0);

            var html = `<div class="timeRow"><span class="timeUTC">${utcStart}-${utcEnd} UTC</span><span class="statusAvailable">${attendees.length} Booked</span></div>`;
            html += `<div class="timeLocal">Local: ${formatLocalTime(localDate)}</div><div class="attendeeListWrap">`;
            
            attendees.slice(0, 3).forEach((p, i) => {
                html += `<div class="attendeeItem ${isMyReservation(p) ? 'isMine' : ''}"><span>${i+1}. ${p.player}</span><span class="days">${p.daysSaved}d</span></div>`;
            });
            if(attendees.length > 3) html += `<div style="font-size:10px; color:gray; text-align:center;">+ ${attendees.length-3} more</div>`;
            html += `</div>`;

            div.innerHTML = html;
            
            // 클로저를 이용한 클릭 이벤트 바인딩 (id가 정확히 전달되도록 수정)
            (function(slotId) {
                div.onclick = function() {
                    selectedSlot = slotId;
                    if (allSlotsData[slotId] && allSlotsData[slotId].attendees && allSlotsData[slotId].attendees.length > 0) {
                        openReservedModal(slotId);
                    } else {
                        openReserveModal(slotId);
                    }
                };
            })(id);
            
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
    if(mine) { 
        document.getElementById("alliance").value = mine.alliance; 
        document.getElementById("player").value = mine.player; 
    }
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }

function openReservedModal(id) {
    selectedSlot = id;
    var slot = allSlotsData[id];
    var listDiv = document.getElementById("attendeeListDetail");
    listDiv.innerHTML = "";
    if (slot && slot.attendees) {
        slot.attendees.forEach((p, i) => {
            var d = document.createElement("div");
            d.className = "attendeeItem " + (isMyReservation(p) ? "isMine" : "");
            d.innerHTML = `<span>${i+1}. [${p.alliance}] ${p.player}</span><span class="days">${p.daysSaved}d</span>`;
            listDiv.appendChild(d);
        });
    }
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

    if(!a || !p || !pass) { alert("모든 칸을 입력하세요 / Fill all fields."); return; }

    var newEntry = { alliance: a, player: p, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var data = doc.exists ? doc.data() : { attendees: [] };
            if(data.attendees.some(ex => ex.playerNormalized === newEntry.playerNormalized)) throw "이미 예약되었습니다 / Already booked.";
            t.set(ref, { attendees: [...data.attendees, newEntry], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true});
        });
    }).then(() => { 
        saveMyBookingInfo(a, p); 
        closeModal(); 
        closeReservedModal(); 
        alert("성공 / Success!"); 
    }).catch(e => alert(e));
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value;
    var mine = getMyBookingInfo();
    if(!mine || !pass) { alert("비밀번호 필요 / Need Password."); return; }

    var ref = db.collection("slots").doc(selectedSlot);
    var hash = simpleHash(pass);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            if (!doc.exists) throw "데이터 없음 / No data.";
            var data = doc.data();
            var attendees = data.attendees || [];
            var newList = attendees.filter(a => !(a.playerNormalized === normalizeText(mine.player) && a.passwordHash === hash));
            
            if(newList.length === attendees.length) throw "비밀번호 틀림 / Wrong password.";
            t.update(ref, { attendees: newList });
        });
    }).then(() => { closeReservedModal(); alert("취소됨 / Cancelled."); }).catch(e => alert(e));
}

// === 관리자 시스템 (엑셀 내보내기, 삭제 등) ===

function exportAllCSV() {
    if (typeof XLSX === "undefined") { alert("Excel 라이브러리 로드 실패"); return; }
    var rows = [];
    Object.keys(allSlotsData).forEach(id => {
        var slot = allSlotsData[id];
        if (slot.attendees) {
            slot.attendees.forEach((a, idx) => {
                rows.push({
                    Buff: id.split("_")[0],
                    Time: id.split("_")[1],
                    Order: idx + 1,
                    Alliance: a.alliance,
                    Player: a.player,
                    Days: a.daysSaved
                });
            });
        }
    });
    var worksheet = XLSX.utils.json_to_sheet(rows);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SVS_Booking");
    XLSX.writeFile(workbook, "SVS_Booking_All.xlsx");
}

function backupAndClearAll() {
    if (!confirm("전체 데이터를 삭제하시겠습니까? (삭제 전 엑셀 백업 권장)\nClear all data?")) return;
    var pass = prompt("관리자 비밀번호를 입력하세요 / Enter admin password:");
    if (pass === "2737") { // 관리자 비밀번호 임시 설정
        db.collection("slots").get().then(snap => {
            var batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
        }).then(() => alert("전체 삭제 완료 / All cleared."));
    } else {
        alert("비밀번호 틀림 / Wrong password.");
    }
}

// 비밀 관리자 트리거 (Mona 글자 3번 클릭)
var secretCount = 0;
document.querySelector(".creatorCredit").onclick = function() {
    secretCount++;
    if (secretCount >= 3) {
        secretCount = 0;
        var mode = prompt("관리자 명령 입력 / Admin Command:\n1: 엑셀 내보내기 (Excel)\n2: 전체 삭제 (Clear All)");
        if (mode === "1") exportAllCSV();
        if (mode === "2") backupAndClearAll();
    }
};

function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
document.getElementById("searchInput").oninput = renderAll;

init();

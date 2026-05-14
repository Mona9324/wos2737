var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 관리자 설정 (기본 날짜 수정 가능)
var bookingSettings = { 
    baseDate: "2026-03-23", 
    tabs: { 
        monday: { openAt: "", closeAt: "" }, 
        tuesday: { openAt: "", closeAt: "" }, 
        thursday: { openAt: "", closeAt: "" } 
    } 
};

var loginAttempts = 0;
var lockoutTime = 0;

function padTime(h, m) { 
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    h = h % 24;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); 
}
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { 
    var str = String(v || ""); var hash = 0;
    for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
    return "h_" + Math.abs(hash);
}
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

function saveMyBookingInfo(a, p, id) { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: id })); }
function getMyBookingInfo() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } }
function isMyReservation(person) {
    var mine = getMyBookingInfo();
    if (!person || !mine) return false;
    return normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance);
}

// SVS 카운트다운 로직
function updateCountdown() {
    var now = new Date();
    var base = new Date("2026-03-23T12:00:00Z"); // 기준일 (SVS 주기 28일 가정)
    var cycle = 28 * 24 * 60 * 60 * 1000;
    var nextSvs = new Date(base.getTime());
    while(nextSvs <= now) nextSvs = new Date(nextSvs.getTime() + cycle);

    var diff = nextSvs - now;
    var d = Math.floor(diff / (1000*60*60*24));
    var h = Math.floor((diff / (1000*60*60)) % 24);
    var m = Math.floor((diff / (1000*60)) % 60);
    
    var el = document.getElementById("countdown");
    if(el) el.innerText = `Next SVS in ${d}d ${h}h ${m}m`;
}

// 예약 시간 체크 로직
function isBookingOpen() {
    var tab = bookingSettings.tabs[currentBuff];
    if(!tab || (!tab.openAt && !tab.closeAt)) return true;
    var now = new Date();
    if(tab.openAt && now < new Date(tab.openAt)) return false;
    if(tab.closeAt && now > new Date(tab.closeAt)) return false;
    return true;
}

function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { 
        if(doc.exists) bookingSettings = doc.data(); 
        updateStatusMessage();
        renderAll(); 
    });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {};
        snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
    });
    setInterval(updateCountdown, 60000);
    updateCountdown();
}

function updateStatusMessage() {
    var el = document.getElementById("bookingStatusMsg");
    if(!el) return;
    el.innerText = isBookingOpen() ? "✅ 예약 가능 기간입니다 / Booking is Open" : "🔒 예약 기간이 아닙니다 / Booking is Closed";
}

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
            var timeClass = (h < 12) ? "am-slot" : "pm-slot";
            div.className = "slot " + timeClass + (attendees.some(isMyReservation) ? " myReservation" : "");
            
            var utcStart = timeId;
            var utcEnd = padTime(h, m + 30);
            var localDate = new Date(); localDate.setUTCHours(h, m, 0, 0);

            var html = `<div class="timeRow"><span class="timeUTC">${utcStart}-${utcEnd} UTC</span><span class="statusAvailable">${attendees.length}명 예약됨</span></div>`;
            html += `<div class="timeLocal">Local: ${formatLocalTime(localDate)}</div><div class="attendeeListWrap">`;
            
            attendees.slice(0, 3).forEach((p, i) => {
                html += `<div class="attendeeItem ${isMyReservation(p) ? 'isMine' : ''}"><span>${i+1}. ${p.player}</span><span class="days">${p.daysSaved}d</span></div>`;
            });
            if(attendees.length > 3) html += `<div style="font-size:10px; color:gray; text-align:center; margin-top:5px;">+ ${attendees.length-3} more</div>`;
            html += `</div>`;

            div.innerHTML = html;
            (function(slotId) {
                div.onclick = function() {
                    if(!isBookingOpen() && !adminAuthenticated) return alert("예약 기간이 아닙니다.");
                    selectedSlot = slotId;
                    if (allSlotsData[slotId] && allSlotsData[slotId].attendees && allSlotsData[slotId].attendees.length > 0) openReservedModal(slotId);
                    else openReserveModal(slotId);
                };
            })(id);
            grid.appendChild(div);
        }
    }
    updateTabs();
}

function updateTabs() { document.querySelectorAll(".tabs button").forEach(btn => btn.classList.toggle("active", btn.id === "tab-" + currentBuff)); }
function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }

function openReserveModal(id) {
    closeReservedModal();
    selectedSlot = id;
    var info = id.split("_");
    document.getElementById("selectedSlotInfo").innerHTML = `<b>${info[0].toUpperCase()} / ${info[1]} UTC</b><br>예약 신청 / New Booking`;
    document.getElementById("modal").classList.add("show");
    var mine = getMyBookingInfo();
    if(mine) { 
        document.getElementById("alliance").value = mine.alliance || ""; 
        document.getElementById("player").value = mine.player || ""; 
        document.getElementById("playerId").value = mine.playerId || ""; 
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

function confirmBooking() {
    var a = document.getElementById("alliance").value.trim();
    var p = document.getElementById("player").value.trim();
    var idNum = document.getElementById("playerId").value.trim();
    var d = document.getElementById("daysSaved").value;
    var pass = document.getElementById("password").value;

    if(!/^\d{9}$/.test(idNum)) return alert("ID는 숫자 9자리를 입력해주세요.");
    if(!a || !p || !pass) return alert("모든 칸을 입력하세요.");

    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var data = doc.exists ? doc.data() : { attendees: [] };
            if(data.attendees.some(ex => ex.playerNormalized === newEntry.playerNormalized)) throw "이미 예약됨";
            t.set(ref, { attendees: [...data.attendees, newEntry], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true});
        });
    }).then(() => { 
        saveMyBookingInfo(a, p, idNum); closeModal(); closeReservedModal(); alert("성공!"); 
    }).catch(e => alert(e));
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value;
    var mine = getMyBookingInfo();
    if(!mine || !pass) return alert("비밀번호 필요.");
    var ref = db.collection("slots").doc(selectedSlot);
    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var newList = doc.data().attendees.filter(a => !(a.playerNormalized === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
            if(newList.length === doc.data().attendees.length) throw "비밀번호 틀림.";
            t.update(ref, { attendees: newList });
        });
    }).then(() => { closeReservedModal(); alert("취소됨"); }).catch(e => alert(e));
}

// 관리자 기능
var adminAuthenticated = false;
var sc = 0;
document.querySelector(".creatorAvatar").onclick = function() {
    if (Date.now() < lockoutTime) return alert("잠금 중입니다.");
    sc++;
    if (sc >= 3) {
        sc = 0;
        var p = prompt("Admin Password:");
        if (p === "2737") {
            adminAuthenticated = true;
            document.getElementById("adminPanel").classList.add("show");
            document.getElementById("scheduleOpenAt").value = bookingSettings.tabs[currentBuff].openAt || "";
            document.getElementById("scheduleCloseAt").value = bookingSettings.tabs[currentBuff].closeAt || "";
            loadLogs();
        } else {
            loginAttempts++;
            if (loginAttempts >= 3) lockoutTime = Date.now() + 3600000;
            alert("비밀번호 틀림.");
        }
    }
};

function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }

function saveAdminSchedule() {
    var open = document.getElementById("scheduleOpenAt").value;
    var close = document.getElementById("scheduleCloseAt").value;
    bookingSettings.tabs[currentBuff] = { openAt: open, closeAt: close };
    db.collection("settings").doc("booking").set(bookingSettings).then(() => alert("저장 완료!"));
}

function exportAllCSV() {
    var rows = [];
    Object.keys(allSlotsData).forEach(id => {
        if(allSlotsData[id].attendees) allSlotsData[id].attendees.forEach(a => {
            rows.push({ Buff: id.split("_")[0], Time: id.split("_")[1], ID: a.playerId, Player: a.player, Days: a.daysSaved });
        });
    });
    var ws = XLSX.utils.json_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SVS");
    XLSX.writeFile(wb, "SVS_Booking.xlsx");
}

function backupAndClearAll() {
    if (confirm("Reset All Data?")) db.collection("slots").get().then(snap => {
        var batch = db.batch(); snap.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
    }).then(() => alert("Cleared."));
}

function loadLogs() { document.getElementById("logsBox").innerHTML = "[" + new Date().toLocaleString() + "] Admin session started."; }

function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
document.getElementById("searchInput").oninput = renderAll;
init();

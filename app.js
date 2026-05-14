var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 관리자 보안 설정
var loginAttempts = 0;
var lockoutTime = 0;

// Utils
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

// Identity
function saveMyBookingInfo(a, p, id) { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: id })); }
function getMyBookingInfo() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } }
function isMyReservation(person) {
    var mine = getMyBookingInfo();
    if (!person || !mine) return false;
    return normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance);
}

// Init
function init() {
    db.collection("settings").doc("booking").onSnapshot(doc => { renderAll(); });
    db.collection("slots").onSnapshot(snap => {
        allSlotsData = {};
        snap.forEach(doc => { allSlotsData[doc.id] = doc.data(); });
        renderAll();
        if(document.getElementById("adminPanel").classList.contains("show")) updateAdminAttendeeList();
    });
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

            var html = `<div class="timeRow">
                            <span class="timeUTC">${utcStart}-${utcEnd} UTC</span>
                            <span class="statusAvailable">${attendees.length} 명 예약됨 / Booked</span>
                        </div>`;
            html += `<div class="timeLocal">Local: ${formatLocalTime(localDate)}</div><div class="attendeeListWrap">`;
            
            attendees.slice(0, 3).forEach((p, i) => {
                html += `<div class="attendeeItem ${isMyReservation(p) ? 'isMine' : ''}"><span>${i+1}. ${p.player}</span><span class="days">${p.daysSaved}d</span></div>`;
            });
            if(attendees.length > 3) html += `<div style="font-size:10px; color:gray; text-align:center;">+ ${attendees.length-3} more</div>`;
            html += `</div>`;

            div.innerHTML = html;
            (function(slotId) {
                div.onclick = function() {
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
function switchBuff(b) { currentBuff = b; renderAll(); }

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

    if(!/^\d{9}$/.test(idNum)) { alert("ID는 숫자 9자리를 입력해주세요 / 9 digits ID required."); return; }
    if(!a || !p || !pass) { alert("모든 칸을 입력하세요 / Fill all fields."); return; }

    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);

    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var data = doc.exists ? doc.data() : { attendees: [] };
            var attendees = data.attendees || [];
            if(attendees.some(ex => ex.playerNormalized === newEntry.playerNormalized)) throw "이미 예약됨 / Already booked.";
            t.set(ref, { attendees: [...attendees, newEntry], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true});
        });
    }).then(() => { 
        saveMyBookingInfo(a, p, idNum); closeModal(); closeReservedModal(); 
        alert("예약 성공 / Success!"); 
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

// 관리자 보안
var sc = 0;
document.querySelector(".creatorAvatar").onclick = function() {
    var now = Date.now();
    if (now < lockoutTime) {
        var remain = Math.ceil((lockoutTime - now) / 60000);
        alert(`보안 잠금 중: ${remain}분 후 가능 / Locked for ${remain}m.`);
        return;
    }
    sc++;
    if (sc >= 3) {
        sc = 0;
        var p = prompt("Admin Password:");
        if (p === "2737") {
            loginAttempts = 0;
            document.getElementById("adminPanel").classList.add("show");
            updateAdminAttendeeList();
            loadLogs();
        } else {
            loginAttempts++;
            if (loginAttempts >= 3) {
                lockoutTime = Date.now() + 3600000;
                alert("3회 실패: 1시간 차단 / Locked for 1h.");
            } else {
                alert(`틀림 (${loginAttempts}/3) / Wrong.`);
            }
        }
    }
};

function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }

function updateAdminAttendeeList() {
    var label = document.getElementById("adminSelectedSlotLabel");
    var list = document.getElementById("adminAttendeeList");
    if(!selectedSlot) { label.innerText = "슬롯 선택 필요"; list.innerHTML = ""; return; }
    
    label.innerText = `관리 중: ${selectedSlot}`;
    var slot = allSlotsData[selectedSlot];
    list.innerHTML = "";
    
    if(slot && slot.attendees) {
        slot.attendees.forEach((a, i) => {
            var d = document.createElement("div");
            d.className = "attendeeItem";
            d.innerHTML = `<span>${i+1}. [${a.alliance}] ${a.player}</span>
                           <button onclick="adminCancelBooking('${a.playerNormalized}', '${a.createdAt}')" style="background:#ff7d7d; border:none; color:white; border-radius:4px; padding:4px 8px; cursor:pointer;">삭제</button>`;
            list.appendChild(d);
        });
    } else { list.innerHTML = "예약자 없음"; }
}

function adminCancelBooking(playerNorm, createdAt) {
    if(!confirm("삭제하시겠습니까? / Delete?")) return;
    var ref = db.collection("slots").doc(selectedSlot);
    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var attendees = doc.data().attendees;
            var newList = attendees.filter(a => !(a.playerNormalized === playerNorm && a.createdAt == createdAt));
            t.update(ref, { attendees: newList });
        });
    }).then(() => { alert("삭제 완료"); updateAdminAttendeeList(); });
}

function loadLogs() { document.getElementById("logsBox").innerHTML = "[" + new Date().toLocaleString() + "] Admin session started."; }

function exportAllCSV() {
    var rows = [];
    Object.keys(allSlotsData).forEach(id => {
        var slot = allSlotsData[id];
        if (slot.attendees) {
            slot.attendees.forEach((a, idx) => {
                rows.push({ Buff: id.split("_")[0], Time: id.split("_")[1], ID: a.playerId, Alliance: a.alliance, Player: a.player, Days: a.daysSaved });
            });
        }
    });
    var ws = XLSX.utils.json_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SVS");
    XLSX.writeFile(wb, "SVS_Booking.xlsx");
}

function backupAndClearAll() {
    if (confirm("Clear all data?")) {
        db.collection("slots").get().then(snap => {
            var batch = db.batch(); snap.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
        }).then(() => { alert("Cleared."); location.reload(); });
    }
}

function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
document.getElementById("searchInput").oninput = renderAll;
init();

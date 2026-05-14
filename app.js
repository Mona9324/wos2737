var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 관리자 설정 (기본 SvS 시작: 5월 23일 21:00)
var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    tabs: { 
        monday: { isOpen: true }, 
        tuesday: { isOpen: true }, 
        thursday: { isOpen: true } 
    } 
};

var loginAttempts = 0;
var lockoutTime = 0;

// Utils
function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// Identity
function saveMyBookingInfo(a, p, id) { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: id })); }
function getMyBookingInfo() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } }
function isMyReservation(person) { var mine = getMyBookingInfo(); if (!person || !mine) return false; return normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance); }

// SvS 카운트다운 (4주 주기)
function updateCountdown() {
    var now = new Date();
    var base = new Date(bookingSettings.baseDate);
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
    setInterval(updateCountdown, 60000);
}

function updateStatusMessage() {
    var el = document.getElementById("bookingStatusMsg");
    var isOpen = bookingSettings.tabs[currentBuff]?.isOpen;
    if(!el) return;
    el.innerText = isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 관리자가 예약을 잠갔습니다 / Booking is Locked";
}

function renderAll() {
    var grid = document.getElementById("slots");
    if (!grid) return;
    grid.innerHTML = "";
    var search = normalizeText(document.getElementById("searchInput").value);
    var filter = document.getElementById("filterStatus").value;
    var isTabLocked = !bookingSettings.tabs[currentBuff]?.isOpen;

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
            var lockClass = isTabLocked ? " locked" : "";
            div.className = "slot " + timeClass + lockClass + (attendees.some(isMyReservation) ? " myReservation" : "");
            
            var utcStart = timeId;
            var utcEnd = padTime(h, m + 30);
            var localDate = new Date(); localDate.setUTCHours(h, m, 0, 0);

            var html = `<div class="timeRow"><span class="timeUTC">${utcStart}-${utcEnd} UTC</span><span class="statusAvailable">${isTabLocked ? '잠김' : attendees.length + '명 예약됨'}</span></div>`;
            html += `<div class="timeLocal">Local: ${formatLocalTime(localDate)}</div><div class="attendeeListWrap">`;
            attendees.slice(0, 3).forEach((p, i) => {
                html += `<div class="attendeeItem ${isMyReservation(p) ? 'isMine' : ''}"><span>${i+1}. ${p.player}</span><span class="days">${p.daysSaved}d</span></div>`;
            });
            if(attendees.length > 3) html += `<div style="font-size:10px; color:gray; text-align:center;">+ more</div>`;
            html += `</div>`;

            div.innerHTML = html;
            (function(slotId, locked) {
                div.onclick = function() {
                    if(locked) return alert("현재 관리자가 예약을 막아두었습니다.");
                    selectedSlot = slotId;
                    if (allSlotsData[slotId]?.attendees?.length > 0) openReservedModal(slotId);
                    else openReserveModal(slotId);
                };
            })(id, isTabLocked);
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
    document.getElementById("selectedSlotInfo").innerHTML = `<b>${id.replace('_',' ').toUpperCase()} UTC</b><br>예약 신청 / New Booking`;
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
    var listDiv = document.getElementById("attendeeListDetail");
    listDiv.innerHTML = "";
    allSlotsData[id]?.attendees?.forEach((p, i) => {
        var d = document.createElement("div"); d.className = "attendeeItem " + (isMyReservation(p) ? "isMine" : "");
        d.innerHTML = `<span>${i+1}. [${p.alliance}] ${p.player}</span><span class="days">${p.daysSaved}d</span>`;
        listDiv.appendChild(d);
    });
    document.getElementById("reservedSlotInfo").innerHTML = `<b>${id.replace('_',' ').toUpperCase()} UTC</b><br>예약 현황`;
    document.getElementById("reservedModal").classList.add("show");
}
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }

function confirmBooking() {
    var a = document.getElementById("alliance").value.trim(), p = document.getElementById("player").value.trim(), idNum = document.getElementById("playerId").value.trim(), d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!/^\d{9}$/.test(idNum)) return alert("ID 숫자 9자리를 입력하세요.");
    if(!a || !p || !pass) return alert("모든 칸을 입력하세요.");
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    var ref = db.collection("slots").doc(selectedSlot);
    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var attendees = (doc.exists ? doc.data().attendees : []) || [];
            if(attendees.some(ex => ex.playerNormalized === newEntry.playerNormalized)) throw "이미 예약됨";
            t.set(ref, { attendees: [...attendees, newEntry], updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge: true});
        });
    }).then(() => { saveMyBookingInfo(a, p, idNum); closeModal(); alert("성공!"); }).catch(e => alert(e));
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value, mine = getMyBookingInfo();
    if(!mine || !pass) return alert("비밀번호 입력 필요.");
    var ref = db.collection("slots").doc(selectedSlot);
    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var newList = doc.data().attendees.filter(a => !(a.playerNormalized === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
            if(newList.length === doc.data().attendees.length) throw "비번 틀림";
            t.update(ref, { attendees: newList });
        });
    }).then(() => { closeReservedModal(); alert("취소됨"); }).catch(e => alert(e));
}

// 엑셀 추출 함수 (안정화 버전)
function exportAllCSV() {
    try {
        if (typeof XLSX === "undefined") {
            alert("엑셀 라이브러리 로딩 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        var wb = XLSX.utils.book_new();
        var hasData = false;

        // 요일별 시트 이름 설정
        var dayNames = {
            monday: "월요일 (Monday)",
            tuesday: "화요일 (Tuesday)",
            thursday: "목요일 (Thursday)"
        };

        // 각 요일별로 데이터를 분류하여 시트 생성
        ["monday", "tuesday", "thursday"].forEach(day => {
            var rows = [];
            Object.keys(allSlotsData).sort().forEach(id => {
                // 현재 처리 중인 요일에 해당하는 데이터만 필터링
                if (id.startsWith(day)) {
                    var slot = allSlotsData[id];
                    if (slot && slot.attendees && slot.attendees.length > 0) {
                        slot.attendees.forEach((a, idx) => {
                            rows.push({
                                "시간(UTC)": id.split('_')[1],
                                "연맹(Alliance)": a.alliance,
                                "닉네임(Player)": a.player,
                                "ID": a.playerId,
                                "가속(Days)": a.daysSaved,
                                "순서": idx + 1
                            });
                        });
                    }
                }
            });

            // 해당 요일에 데이터가 있는 경우에만 시트 추가
            if (rows.length > 0) {
                var ws = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, ws, dayNames[day]);
                hasData = true;
            }
        });

        if (!hasData) {
            return alert("추출할 데이터가 없습니다.");
        }

        // 파일 저장
        var fileName = "2737_SVS_Booking_" + new Date().toISOString().slice(0, 10) + ".xlsx";
        XLSX.writeFile(wb, fileName);
        
        alert("요일별로 분리된 엑셀 파일 다운로드를 시작합니다.");
    } catch (e) {
        console.error("Excel Export Error:", e);
        alert("엑셀 추출 중 오류가 발생했습니다: " + e.message);
    }
}

// 관리자 보안
var adminAuthenticated = false;
var sc = 0;
document.querySelector(".creatorAvatar").onclick = function() {
    if (Date.now() < lockoutTime) return alert("차단 중입니다.");
    sc++;
    if (sc >= 3) {
        sc = 0;
        var p = prompt("Admin Password:");
        if (p === "2737") {
            adminAuthenticated = true;
            document.getElementById("adminPanel").classList.add("show");
            document.getElementById("adminBaseDate").value = bookingSettings.baseDate.substring(0,16);
            loadLogs();
        } else {
            loginAttempts++;
            if (loginAttempts >= 3) lockoutTime = Date.now() + 3600000;
            alert("틀렸습니다.");
        }
    }
};

function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }
function saveAdminBaseDate() {
    bookingSettings.baseDate = document.getElementById("adminBaseDate").value;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => alert("SvS 날짜 저장 완료!"));
}
function toggleTabStatus(tab) {
    bookingSettings.tabs[tab].isOpen = !bookingSettings.tabs[tab].isOpen;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => alert(`${tab} 상태 변경 완료!`));
}
function toggleAllTabs(status) {
    Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = status);
    db.collection("settings").doc("booking").set(bookingSettings).then(() => alert(`전체 상태 변경 완료!`));
}
function loadLogs() { document.getElementById("logsBox").innerHTML = "[" + new Date().toLocaleString() + "] Admin session started."; }
function backupAndClearAll() { if (confirm("데이터를 모두 지울까요?")) db.collection("slots").get().then(snap => { var b = db.batch(); snap.forEach(d => b.delete(d.ref)); return b.commit(); }).then(() => alert("초기화됨")); }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
document.getElementById("searchInput").oninput = renderAll;
init();

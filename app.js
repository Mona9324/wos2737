var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";

// 관리자 설정 및 상태 초기값 (오류 방지를 위해 기본 구조 선언)
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
var adminAuthenticated = false;
var sc = 0; // 비밀번호 진입용 카운터

// Utils
function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// 로그 기록 함수
function addLog(msg) {
    const logsBox = document.getElementById('logsBox');
    if (!logsBox) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement('div');
    logItem.textContent = `[${timeStr}] ${msg}`;
    logsBox.prepend(logItem);
}

// 관리자 UI 업데이트 (오류 수정: 데이터가 없을 경우를 대비한 안전코드 적용)
function updateAdminUI() {
    const days = ['monday', 'tuesday', 'thursday'];
    let openCount = 0;

    days.forEach(day => {
        // bookingSettings.tabs[day]가 undefined인지 체크 (?. 연산자 사용)
        const isOpen = bookingSettings.tabs && bookingSettings.tabs[day] ? bookingSettings.tabs[day].isOpen : false;
        const btn = document.querySelector(`button[onclick="toggleTabStatus('${day}')"]`);
        
        if (btn) {
            if (isOpen) {
                btn.classList.add('status-on');
                btn.classList.remove('status-off');
                openCount++;
            } else {
                btn.classList.add('status-off');
                btn.classList.remove('status-on');
            }
        }
    });

    const allOpenBtn = document.querySelector('button[onclick="toggleAllTabs(true)"]');
    if (allOpenBtn) {
        if (openCount === 3) {
            allOpenBtn.classList.add('status-on');
            allOpenBtn.classList.remove('status-off');
        } else {
            allOpenBtn.classList.add('status-off');
            allOpenBtn.classList.remove('status-on');
        }
    }
}

// Identity
function saveMyBookingInfo(a, p, id) { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: id })); }
function getMyBookingInfo() { try { return JSON.parse(localStorage.getItem(MY_BOOKING_KEY)); } catch(e) { return null; } }
function isMyReservation(person) { var mine = getMyBookingInfo(); if (!person || !mine) return false; return normalizeText(person.player) === normalizeText(mine.player) && normalizeText(person.alliance) === normalizeText(mine.alliance); }

// SvS 카운트다운
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
        if(doc.exists) {
            bookingSettings = doc.data(); 
        }
        updateStatusMessage();
        updateCountdown();
        if(adminAuthenticated) updateAdminUI();
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
    var isOpen = bookingSettings.tabs && bookingSettings.tabs[currentBuff] ? bookingSettings.tabs[currentBuff].isOpen : false;
    if(!el) return;
    el.innerText = isOpen ? "✅ 모든 슬롯 예약 가능 / Booking is Open" : "🔒 관리자가 예약을 잠갔습니다 / Booking is Locked";
}

function renderAll() {
    var grid = document.getElementById("slots");
    if (!grid) return;
    grid.innerHTML = "";
    var search = normalizeText(document.getElementById("searchInput").value);
    var filter = document.getElementById("filterStatus").value;
    var isTabLocked = !(bookingSettings.tabs && bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].isOpen);

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

// 모달 제어 함수 (HTML에 맞춰 호출)
function openReserveModal(id) { document.getElementById("reserveModal").classList.add("show"); }
function closeModal() { document.getElementById("reserveModal").classList.remove("show"); }
function openReservedModal(id) { document.getElementById("reservedModal").classList.add("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }

// 예약 및 취소 로직
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
    }).then(() => { 
        addLog(`예약 성공: [${a}] ${p}`);
        saveMyBookingInfo(a, p, idNum); closeModal(); alert("성공!"); 
    }).catch(e => alert(e));
}

function confirmCancel() {
    var pass = document.getElementById("editPassword").value, mine = getMyBookingInfo();
    if(!mine || !pass) return alert("비밀번호 입력 필요.");
    var ref = db.collection("slots").doc(selectedSlot);
    db.runTransaction(t => {
        return t.get(ref).then(doc => {
            var attendees = doc.data().attendees;
            var newList = attendees.filter(a => !(a.playerNormalized === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
            if(newList.length === attendees.length) throw "비밀번호가 일치하지 않거나 본인의 예약이 아닙니다.";
            t.update(ref, { attendees: newList });
        });
    }).then(() => { 
        addLog(`예약 취소: ${mine.player}`);
        closeReservedModal(); alert("취소됨"); 
    }).catch(e => alert(e));
}

// 관리자 진입
document.querySelector(".creatorAvatar").onclick = function() {
    if (Date.now() < lockoutTime) return alert("잠시 후 다시 시도하세요.");
    sc++;
    if (sc >= 3) {
        sc = 0;
        var p = prompt("관리자 비밀번호를 입력하세요:");
        if (p === "2737") {
            adminAuthenticated = true;
            document.getElementById("adminPanel").classList.add("show");
            document.getElementById("adminBaseDate").value = bookingSettings.baseDate.substring(0,16);
            addLog("관리자 패널 접속");
            updateAdminUI();
        } else {
            loginAttempts++;
            if (loginAttempts >= 3) lockoutTime = Date.now() + 60000;
            alert("비밀번호가 틀렸습니다.");
        }
    }
};

function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); adminAuthenticated = false; }
function saveAdminBaseDate() {
    bookingSettings.baseDate = document.getElementById("adminBaseDate").value;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`기준일 변경: ${bookingSettings.baseDate}`);
        alert("저장 완료");
    });
}
function toggleTabStatus(tab) {
    if(!bookingSettings.tabs[tab]) bookingSettings.tabs[tab] = { isOpen: true };
    bookingSettings.tabs[tab].isOpen = !bookingSettings.tabs[tab].isOpen;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`${tab} 상태: ${bookingSettings.tabs[tab].isOpen ? "ON" : "OFF"}`);
        updateAdminUI();
    });
}
function toggleAllTabs(status) {
    Object.keys(bookingSettings.tabs).forEach(k => {
        bookingSettings.tabs[k].isOpen = status;
    });
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`전체 상태 변경: ${status ? "ON" : "OFF"}`);
        updateAdminUI();
    });
}

function exportAllCSV() {
    try {
        if (typeof XLSX === "undefined") return alert("엑셀 라이브러리 로딩 중...");
        var wb = XLSX.utils.book_new();
        var hasData = false;
        var dayNames = { monday: "월요일", tuesday: "화요일", thursday: "목요일" };
        ["monday", "tuesday", "thursday"].forEach(day => {
            var rows = [];
            Object.keys(allSlotsData).sort().forEach(id => {
                if (id.startsWith(day)) {
                    var slot = allSlotsData[id];
                    slot?.attendees?.forEach((a, idx) => {
                        rows.push({ "시간(UTC)": id.split('_')[1], "연맹": a.alliance, "닉네임": a.player, "ID": a.playerId, "가속(일)": a.daysSaved, "순서": idx + 1 });
                    });
                }
            });
            if (rows.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), dayNames[day]);
                hasData = true;
            }
        });
        if (!hasData) return alert("데이터가 없습니다.");
        XLSX.writeFile(wb, "SVS_Booking.xlsx");
        addLog("엑셀 데이터 추출");
    } catch (e) { alert("추출 실패: " + e.message); }
}

function backupAndClearAll() { 
    if (confirm("정말로 모든 예약 데이터를 삭제하시겠습니까? (복구 불가)")) {
        db.collection("slots").get().then(snap => { 
            var b = db.batch(); snap.forEach(d => b.delete(d.ref)); 
            return b.commit(); 
        }).then(() => {
            addLog("전체 데이터 초기화");
            alert("초기화 완료");
        }); 
    }
}

// 초기화 시작
init();

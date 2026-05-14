// 전역 변수 설정 (최상단 배치로 관리자 진입 보장)
var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { baseDate: "2026-05-23T21:00:00", tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } };
var adminAuthenticated = false;
var sc = 0;

// 유틸리티 함수
function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// 시스템 로그
function addLog(msg) {
    const box = document.getElementById('logsBox');
    if (!box) return;
    const log = document.createElement('div');
    log.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    box.prepend(log);
}

// 초기화 시작
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

// 내 예약 여부 확인 (파스텔 연두색 반영 핵심)
function isMyReservation(person) {
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if(!m || !person) return false;
    var mine = JSON.parse(m);
    return normalizeText(person.player) === normalizeText(mine.player);
}

// 메인 렌더링
function renderAll() {
    const grid = document.getElementById("slots");
    if (!grid) return; grid.innerHTML = "";
    const isLocked = !bookingSettings.tabs[currentBuff].isOpen;

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId;
            const slot = allSlotsData[id] || { attendees: [] };
            const div = document.createElement("div");
            
            // 내 예약이 포함되어 있으면 myReservation 클래스 추가
            const myClass = slot.attendees.some(isMyReservation) ? " myReservation" : "";
            div.className = "slot " + (h >= 12 ? "pm-slot" : "") + (isLocked ? " locked" : "") + myClass;
            
            div.innerHTML = `
                <div class="timeRow"><span class="timeUTC">${tId}~${eId} UTC</span><span>${slot.attendees.length}명</span></div>
                <div style="font-size:11px; color:#718096; margin-bottom:10px;">Local: ${formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0)))}</div>
                <div class="attendeeMiniList">${slot.attendees.slice(0,3).map((a,i)=>`<div class='miniItem'><span>${i+1}. ${a.player}</span><span>${a.daysSaved}d</span></div>`).join('')}</div>
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

// 예약 신청 모달 열기 (기존 정보 불러오기)
function openReserveModal() {
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if(m) {
        var mine = JSON.parse(m);
        document.getElementById("alliance").value = mine.alliance || "";
        document.getElementById("player").value = mine.player || "";
    }
    document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC";
    document.getElementById("modal").classList.add("show");
}

// 예약 확정 및 정보 저장
function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("필수 정보를 입력하세요.");
    
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true})
    .then(() => { 
        // 정보 저장 (내 정보 기억)
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); 
        closeModal(); 
        alert("예약 성공 / Success!"); 
        renderAll(); // 즉시 색상 업데이트
    });
}

// 관리자 클릭 복구
function handleAdminAccess() {
    sc++;
    if(sc >= 3) {
        sc = 0;
        var p = prompt("Password:");
        if(p === "2737") {
            adminAuthenticated = true;
            document.getElementById("adminPanel").classList.add("show");
            addLog("관리자 로그인 성공");
            updateAdminUI();
        }
    }
}

// 기타 제어 함수들 (유지)
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }
function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }

function updateAdminUI() {
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        const btn = document.getElementById(`btn-admin-${day}`);
        if (btn) {
            const isOpen = bookingSettings.tabs[day].isOpen;
            btn.className = isOpen ? "btn-primary admin-btn-on" : "btn-primary admin-btn-off";
        }
    });
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

// 실행
init();

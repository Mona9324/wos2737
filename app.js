var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var db = window.db;
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { baseDate: "2026-05-23T21:00:00", tabs: { monday: { isOpen: true }, tuesday: { isOpen: true }, thursday: { isOpen: true } } };
var adminAuthenticated = false;
var sc = 0;

function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

// 초기화
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
            div.className = "slot " + (h >= 12 ? "pm-slot" : "") + (isLocked ? " locked" : "") + (slot.attendees.some(isMyReservation) ? " myReservation" : "");
            
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

// 예약 확정 (버튼 작동 복구)
function confirmBooking() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("password").value;
    if(!a || !p || !idNum || !pass) return alert("필수 정보를 입력하세요 / Fill all fields.");
    
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: d, passwordHash: simpleHash(pass), createdAt: Date.now() };
    
    db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true})
    .then(() => { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); 
        closeModal(); 
        alert("예약 성공 / Success!"); 
        document.getElementById("alliance").value = ""; document.getElementById("player").value = ""; document.getElementById("playerId").value = ""; document.getElementById("daysSaved").value = ""; document.getElementById("password").value = "";
    }).catch(err => alert("오류 발생: " + err.message));
}

// 예약 취소 (버튼 작동 복구)
function confirmCancel() {
    var pass = document.getElementById("editPassword").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!m || !pass) return alert("정보가 없거나 비밀번호를 입력하지 않았습니다.");
    
    var mine = JSON.parse(m), ref = db.collection("slots").doc(selectedSlot);
    ref.get().then(doc => {
        if(!doc.exists) return;
        var list = doc.data().attendees.filter(a => !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)));
        if(list.length === doc.data().attendees.length) return alert("비밀번호가 틀렸거나 본인의 예약이 아닙니다.");
        
        ref.update({ attendees: list }).then(() => { 
            closeReservedModal(); 
            alert("취소 완료 / Cancelled."); 
            document.getElementById("editPassword").value = "";
        });
    });
}

// 모달 제어 함수들
function openReserveModal() {
    document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC";
    document.getElementById("modal").classList.add("show");
}
function closeModal() { document.getElementById("modal").classList.remove("show"); }
function openReservedModal(id) {
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC";
    var list = document.getElementById("attendeeListDetail");
    list.innerHTML = "";
    allSlotsData[id]?.attendees?.forEach((a, i) => {
        var d = document.createElement("div");
        d.className = "miniItem"; d.style.fontSize = "14px"; d.style.padding = "8px 0";
        var delBtn = adminAuthenticated ? `<button onclick="deleteAttendee('${id}', ${i})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">[삭제/DEL]</button>` : "";
        d.innerHTML = `<span>${i+1}. [${a.alliance}] ${a.player} (${a.daysSaved}d)</span> ${delBtn}`;
        list.appendChild(d);
    });
    document.getElementById("reservedModal").classList.add("show");
}
function closeReservedModal() { document.getElementById("reservedModal").classList.remove("show"); }
function openReserveFromStatus() { 
    if(!bookingSettings.tabs[currentBuff].isOpen && !adminAuthenticated) return alert("마감되었습니다.");
    closeReservedModal(); 
    openReserveModal(); 
}

// 관리자 및 기타 유틸리티 (복구 완료)
function handleAdminAccess() { sc++; if(sc>=3) { sc=0; var p=prompt("Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); updateAdminUI(); } } }
function closeAdmin() { document.getElementById("adminPanel").classList.remove("show"); }
function switchBuff(b) { currentBuff = b; updateStatusMessage(); renderAll(); }
function clearSearch() { document.getElementById("searchInput").value = ""; renderAll(); }
function isMyReservation(person) { var m = localStorage.getItem(MY_BOOKING_KEY); if(!m || !person) return false; var mine = JSON.parse(m); return normalizeText(person.player) === normalizeText(mine.player); }

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

init();

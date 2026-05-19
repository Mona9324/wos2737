var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var currentLang = localStorage.getItem("svs_lang") || "en";

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    closedSlots: [], 
    tabs: { monday: { isOpen: true, closeTime: "", showSpeeds: false }, tuesday: { isOpen: true, closeTime: "", showSpeeds: false }, thursday: { isOpen: true, closeTime: "", showSpeeds: false } } 
};
var adminAuthenticated = false;
var sc = 0;

// (langPack은 이전과 동일하므로 생략 - 전체 복사 시 그대로 사용하세요)
// [참고: 위에서 드린 app.js의 langPack 및 기타 함수들은 그대로 유지하고, 아래 init과 renderAll만 확인하세요]

function init() {
    // 렌더링 락 방지를 위해 DOM이 완벽히 그려진 후 실행
    document.addEventListener("DOMContentLoaded", function() {
        applyLanguagePack();
        if(!window.db) { setTimeout(init, 200); return; }
        
        window.db.collection("settings").doc("booking").onSnapshot(function(doc) { 
            if(doc.exists) { bookingSettings = doc.data(); }
            updateStatusMessage(); updateAdminUI(); window.renderAll(); 
        });
        window.db.collection("slots").onSnapshot(function(snap) { 
            allSlotsData = {}; snap.forEach(function(doc) { allSlotsData[doc.id] = doc.data(); }); window.renderAll(); 
        });
        setInterval(function() { updateCountdown(); updateTabCountdowns(); }, 1000);
    });
}

window.renderAll = function() {
    var grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    var isOpen = isTabActuallyOpen(currentBuff), filter = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + currentBuff); });
    
    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var id = currentBuff + "_" + padTime(h, m), slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            
            var isSpecificallyClosed = bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id);
            var effectivelyOpen = isOpen && !isSpecificallyClosed;
            
            var div = document.createElement("div"); 
            div.className = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "");
            
            var p = langPack[currentLang];
            var listHtml = slot.attendees.map(function(a) { return "<div class='miniItem" + (a.isDesignated ? " is-designated" : "") + "'><span>" + (a.isDesignated ? "👑 " : "") + "[" + a.alliance + "] " + a.player + "</span></div>"; }).join('');
            
            div.innerHTML = "<div class='timeRow'><span>" + padTime(h, m) + "~" + padTime(h, m+30) + " UTC" + (isSpecificallyClosed ? " 🔒" : "") + "</span><span>" + slot.attendees.length + p.pers + "</span></div><div class='attendeeMiniList'>" + (listHtml || p.noRes) + "</div>";
            
            // 클릭 이벤트 직접 주입 (이 방식이 가장 확실합니다)
            div.setAttribute("onclick", "window.handleSlotClick('" + id + "', " + effectivelyOpen + ")");
            grid.appendChild(div);
        }
    }
    updateMyConfirmedSummary();
};

window.handleSlotClick = function(id, isOpen) {
    var p = langPack[currentLang];
    if(!isOpen && !adminAuthenticated) return openCustomAlert(p.closedAlert);
    selectedSlot = id;
    window.openReservedModal(id);
};

// ... (나머지 하단 함수는 이전 코드와 동일하게 유지)

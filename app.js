var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    tabs: { 
        monday: { isOpen: true, closeTime: "", showSpeeds: false }, 
        tuesday: { isOpen: true, closeTime: "", showSpeeds: false }, 
        thursday: { isOpen: true, closeTime: "", showSpeeds: false } 
    } 
};
var adminAuthenticated = false;
var sc = 0;

function padTime(h, m) { if (m >= 60) { h += Math.floor(m / 60); m = m % 60; } h = h % 24; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }

function isMyReservation(person) { 
    var m = localStorage.getItem(MY_BOOKING_KEY); 
    if(!m || !person) return false; 
    var mine = JSON.parse(m); 
    return normalizeText(person.player) === normalizeText(mine.player); 
}

function getGoogleCalendarUrl(dayName, timeStr) {
    var parts = timeStr.split(":");
    var hour = parseInt(parts[0], 10);
    var min = parseInt(parts[1], 10);
    var daysMap = { monday: 1, tuesday: 2, thursday: 4 };
    var targetDay = daysMap[dayName];
    
    var now = new Date();
    var targetDate = new Date();
    var currentDay = now.getDay();
    var distance = targetDay - currentDay;
    if (distance <= 0) distance += 7;
    
    targetDate.setDate(now.getDate() + distance);
    targetDate.setUTCHours(hour, min, 0, 0);
    var endDate = new Date(targetDate.getTime() + 30 * 60 * 1000);
    
    var formatTime = function(d) {
        return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };
    
    var title = encodeURIComponent("👑 [2737 SVS] 장관 버프 타임 / SVS Buff");
    var details = encodeURIComponent("장관 버프 시간입니다! 늦지 않게 접속하셔서 가속을 사용해 주세요! / Minister Buff Time");
    var dates = formatTime(targetDate) + "/" + formatTime(endDate);
    
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + title + "&dates=" + dates + "&details=" + details;
}

function updateMyConfirmedSummary() {
    var el = document.getElementById("myConfirmedSection");
    var listEl = document.getElementById("confirmedList");
    if (!el || !listEl) return;
    
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if (!m) { el.style.display = "none"; return; }
    var mine = JSON.parse(m);
    var myName = normalizeText(mine.player);
    
    var confirmedTracks = [];
    Object.keys(allSlotsData).forEach(function(slotId) {
        var slot = allSlotsData[slotId];
        if (slot && slot.attendees) {
            slot.attendees.forEach(function(a) {
                if (normalizeText(a.player) === myName && a.isDesignated) {
                    var parts = slotId.split("_");
                    confirmedTracks.push({ day: parts[0], time: parts[1], slotId: slotId });
                }
            });
        }
    });
    
    if (confirmedTracks.length === 0) {
        el.style.display = "none";
        return;
    }
    
    listEl.innerHTML = "";
    confirmedTracks.forEach(function(track) {
        var card = document.createElement("div");
        card.className = "confirmedCard";
        
        var dayKo = { monday: "월요일(건설)", tuesday: "화요일(연구)", thursday: "목요일(훈련)" }[track.day];
        var displayTime = dayKo + " " + track.time + " UTC";
        
        var timeSpan = document.createElement("span");
        timeSpan.className = "confirmedTime";
        timeSpan.innerText = displayTime;
        
        var calBtn = document.createElement("button");
        calBtn.type = "button";
        calBtn.className = "btn-cal";
        calBtn.innerText = "🔔 알람 등록";
        calBtn.onclick = function() {
            var url = getGoogleCalendarUrl(track.day, track.time);
            window.open(url, "_blank");
        };
        
        card.appendChild(timeSpan);
        card.appendChild(calBtn);
        listEl.appendChild(card);
    });
    
    el.style.display = "block";
}

function init() {
    window.renderAll();
    if(!window.db) { setTimeout(init, 200); return; }
    
    window.db.collection("settings").doc("booking").onSnapshot(function(doc) { 
        if(doc.exists) { bookingSettings = doc.data(); if(adminAuthenticated) fillAdminInputs(); }
        updateStatusMessage(); updateAdminUI(); window.renderAll(); 
    }, function(err) { console.error(err); });
    
    window.db.collection("slots").onSnapshot(function(snap) { 
        allSlotsData = {}; snap.forEach(function(doc) { allSlotsData[doc.id] = doc.data(); }); window.renderAll(); 
    }, function(err) { console.error(err); });
    
    setInterval(function() { updateCountdown(); updateTabCountdowns(); }, 1000);
}

function formatDiff(ms) {
    const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
    if (d > 0) return d + "d " + h + "h " + m + "m"; return h + "h " + m + "m";
}

function updateTabCountdowns() {
    var now = new Date(), gOpenStr = bookingSettings.globalOpenTime, gOpen = gOpenStr ? new Date(gOpenStr) : null;
    ['monday', 'tuesday', 'thursday'].forEach(function(day) {
        var s = bookingSettings.tabs[day], cdEl = document.getElementById("cd-" + day); if (!cdEl) return;
        if (gOpen && !isNaN(gOpen) && now < gOpen) cdEl.innerText = "Open in: " + formatDiff(gOpen - now);
        else if (s.closeTime && !isNaN(new Date(s.closeTime))) {
            var cDate = new Date(s.closeTime); if (now <= cDate) cdEl.innerText = "Close in: " + formatDiff(cDate - now); else cdEl.innerText = "Closed / 마감";
        } else cdEl.innerText = s.isOpen ? "Ready / 준비됨" : "Locked / 잠김";
    });
}

function isTabActuallyOpen(day) {
    if (!bookingSettings.tabs || !bookingSettings.tabs[day]) return false;
    var s = bookingSettings.tabs[day], now = new Date();
    if (!s.isOpen) return false; 
    if (bookingSettings.globalOpenTime && now < new Date(bookingSettings.globalOpenTime)) return false;
    if (s.closeTime && now > new Date(s.closeTime)) return false; return true;
}

window.renderAll = function() {
    var grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    var isOpen = isTabActuallyOpen(currentBuff), search = normalizeText(document.getElementById("searchInput").value), filter = document.getElementById("filterStatus").value;
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + currentBuff); });
    
    var showSpeeds = (bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].showSpeeds) || adminAuthenticated;
    
    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId, slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            if (search && !slot.attendees.some(function(a) { return normalizeText(a.player).includes(search) || normalizeText(a.alliance).includes(search); })) continue;
            
            var div = document.createElement("div"); 
            div.className = "slot " + (h >= 12 ? "pm-slot " : "") + (!isOpen ? " locked" : "") + (slot.attendees.some(isMyReservation) ? " myReservation" : "");
            
            var displayList = ((allSlotsData[id] || {}).attendees || []).slice().sort(function(a, b) {
                return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0);
            });
            
            var listHtml = displayList.slice(0,3).map(function(a, i) { 
                var speedText = showSpeeds ? "(" + a.daysSaved + "일/d)" : "";
                var crownText = a.isDesignated ? "👑 " : (i+1) + ". ";
                var itemClass = a.isDesignated ? "miniItem is-designated" : "miniItem";
                
                return "<div class='" + itemClass + "'><span>" + crownText + "[" + a.alliance + "] " + a.player + "</span><span>" + speedText + "</span></div>"; 
            }).join('');
            
            div.innerHTML = "<div class=\"dayBadge\">" + currentBuff.toUpperCase().slice(0,3) + "</div><div class=\"timeRow\"><span>" + tId + "~" + eId + " UTC</span><span style=\"color:#d34b4b;\">" + slot.attendees.length + "명 / Pers.</span></div><div class=\"localTime\">Local: " + formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0))) + "</div><div class=\"attendeeMiniList\">" + (listHtml || 'No Reservation / 예약 없음') + "</div>";
            
            (function(savedId) {
                div.onclick = function() { if(!isOpen && !adminAuthenticated) return alert("예약 마감되었습니다. / Reservation Closed."); selectedSlot = savedId; if ((allSlotsData[savedId] || {attendees:[]}).attendees.length > 0) openReservedModal(savedId); else window.openReserveModal(); };
            })(id);
            grid.appendChild(div);
        }
    }
    updateMyConfirmedSummary();
};

window.toggleTabStatus = function(day) {
    if (!window.db || !bookingSettings.tabs || !bookingSettings.tabs[day]) return;
    var newStatus = !bookingSettings.tabs[day].isOpen;
    var path = "tabs." + day + ".isOpen";
    var obj = {}; obj[path] = newStatus;
    window.db.collection("settings").doc("booking").update(obj).then(function() { addLog(day.toUpperCase() + " Toggle Success"); });
};

window.toggleSpeedVisibility = function(day) {
    if (!window.db || !bookingSettings.tabs || !bookingSettings.tabs[day]) return;
    var currentStatus = bookingSettings.tabs[day].showSpeeds || false;
    var newStatus = !currentStatus;
    var path = "tabs." + day + ".showSpeeds";
    var obj = {}; obj[path] = newStatus;
    window.db.collection("settings").doc("booking").update(obj).then(function() { addLog(day.toUpperCase() + " Speed Show: " + newStatus); });
};

window.toggleDesignateById = function(slotId, playerId) {
    if (!window.db) return;
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return String(a.playerId) === String(playerId); });
        if (!target) return;
        
        var nextState = !target.isDesignated;
        list.forEach(function(a) {
            if (String(a.playerId) === String(playerId)) {
                a.isDesignated = nextState;
            } else {
                a.isDesignated = false;
            }
        });
        
        ref.update({ attendees: list }).then(function() {
            addLog("Designation Changed for ID: " + playerId);
            openReservedModal(slotId);
        });
    });
};

window.deleteAttendeeById = function(slotId, playerId) {
    if (!confirm("이 예약을 삭제하시겠습니까? / Delete this entry?")) return;
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        var list = doc.data().attendees.filter(function(a) { return String(a.playerId) !== String(playerId); });
        ref.update({ attendees: list }).then(function() { openReservedModal(slotId); });
    });
};

window.exportAllCSV = function() {
    try {
        if (typeof XLSX === 'undefined') return alert("엑셀 라이브러리 로딩 중입니다. / XLSX Library Loading...");
        var wb = XLSX.utils.book_new(); var hasData = false;
        ["monday", "tuesday", "thursday"].forEach(function(day) {
            var rows = [];
            Object.keys(allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(function(slotId) {
                var timeStr = slotId.split('_')[1];
                allSlotsData[slotId].attendees.forEach(function(a) {
                    rows.push({ "요일/Day": day, "시간/Time(UTC)": timeStr, "연맹/Alliance": a.alliance, "닉네임/Nickname": a.player, "Player ID": a.playerId, "가속일수/SpeedDays": a.daysSaved, "지정여부/Designated": a.isDesignated ? "Y" : "N" });
                });
            });
            if (rows.length > 0) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); hasData = true; }
        });
        if (!hasData) return alert("추출할 데이터가 없습니다. / No data."); XLSX.writeFile(wb, "2737_SVS_Booking.xlsx"); addLog("Excel Download Success");
    } catch (e) { alert("Failed."); }
};

window.confirmBooking = function() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    if(!a || !p || !idNum || !d || !pass) return alert("모든 항목을 입력해주세요! / Please fill all fields.");
    if(idNum.length !== 9) return alert("ID는 반드시 숫자 9자리여야 합니다! / Player ID must be 9 digits.");
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: Number(d), passwordHash: simpleHash(pass), isDesignated: false, createdAt: Date.now() };
    window.db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(function() { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: idNum, cancelKey: pass })); window.closeModal(); alert("예약이 완료되었습니다! / Booking Successful!"); addLog("New: [" + a + "] " + p); });
};

window.confirmCancel = function() {
    var pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!pass) return alert("비밀번호를 입력해주세요! / Please enter password.");
    var mine = JSON.parse(m), ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        var list = doc.data().attendees.filter(function(a) { return !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)); });
        if(list.length === doc.data().attendees.length) return alert("비밀번호가 틀렸습니다! / Wrong password.");
        ref.update({ attendees: list }).then(function() { window.closeReservedModal(); alert("취소가 완료되었습니다! / Cancellation Complete!"); addLog("Cancel: " + mine.player); });
    });
};

window.handleAdminAccess = function() { sc++; if(sc>=3) { sc=0; var p=prompt("Admin Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); fillAdminInputs(); updateAdminUI(); addLog("Admin Login"); } } };
window.saveAutoSchedule = function() { if(!window.db) return; bookingSettings.globalOpenTime = document.getElementById("global-open-time").value; ['monday', 'tuesday', 'thursday'].forEach(function(d) { bookingSettings.tabs[d].closeTime = document.getElementById("close-" + d).value; }); window.db.collection("settings").doc("booking").update(bookingSettings).then(function() { alert("설정이 저장되었습니다! / Settings Saved!"); }); };
window.saveAdminBaseDate = function() { if(!window.db) return; var val = document.getElementById("adminBaseDate").value; if(!val) return; window.db.collection("settings").doc("booking").update({baseDate: val}).then(function() { alert("설정이 저장되었습니다! / Settings Saved!"); }); };
window.backupAndClearAll = function() { if(!window.db || !confirm("정말 전체 삭제하시겠습니까? 복구할 수 없습니다. / Are you sure you want to clear all data? This cannot be undone.")) return; window.db.collection("slots").get().then(snap => { var batch = window.db.batch(); snap.forEach(doc => batch.delete(doc.ref)); batch.commit().then(() => { alert("전체 삭제 완료! / All data cleared!"); }); }); };

function updateAdminUI() { 
    ['monday', 'tuesday', 'thursday'].forEach(function(day) { 
        var btn = document.getElementById("btn-admin-" + day); if (btn) { btn.classList.toggle("on", !!bookingSettings.tabs[day].isOpen); } 
        var sBtn = document.getElementById("btn-speed-" + day); if (sBtn) { sBtn.classList.toggle("on-speed", !!bookingSettings.tabs[day].showSpeeds); }
    }); 
}
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); if(el) el.innerText = isTabActuallyOpen(currentBuff) ? "✅ 예약 가능 / Booking Open" : "🔒 예약 마감 / Booking Closed"; }
function addLog(msg) { var box = document.getElementById('logsBox'); if (box) { var log = document.createElement('div'); log.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg; box.prepend(log); } }
function updateCountdown() { var diff = new Date(bookingSettings.baseDate) - new Date(); while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); if(document.getElementById("countdown")) document.getElementById("countdown").innerText = "Next SVS in " + d + "d " + h + "h " + m + "m " + s + "s"; }
window.switchBuff = function(b) { currentBuff = b; updateStatusMessage(); window.renderAll(); };
window.clearSearch = function() { document.getElementById("searchInput").value = ""; window.renderAll(); };
window.closeModal = function() { document.getElementById("modal").classList.remove("show"); };
window.closeReservedModal = function() { document.getElementById("reservedModal").classList.remove("show"); };
window.closeAdmin = function() { document.getElementById("adminPanel").classList.remove("show"); };
function fillAdminInputs() { document.getElementById("adminBaseDate").value = bookingSettings.baseDate.slice(0, 16); document.getElementById("global-open-time").value = bookingSettings.globalOpenTime || ""; ['monday', 'tuesday', 'thursday'].forEach(function(day) { if(bookingSettings.tabs[day].closeTime) document.getElementById("close-" + day).value = bookingSettings.tabs[day].closeTime; }); }
window.openReserveFromStatus = function() { if(!isTabActuallyOpen(currentBuff) && !adminAuthenticated) return alert("Closed."); window.closeReservedModal(); window.openReserveModal(); };

window.openReserveModal = function() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; document.getElementById("cancelKey").value = mine.cancelKey || ""; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); };

function openReservedModal(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); list.innerHTML = ""; 
    var showSpeeds = (bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].showSpeeds) || adminAuthenticated;
    
    var displayList = ((allSlotsData[id] || {}).attendees || []).slice().sort(function(a, b) {
        return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0);
    });
    
    displayList.forEach(function(a) { 
        var d = document.createElement("div"); 
        d.className = a.isDesignated ? "miniItem is-designated" : "miniItem"; 
        d.style.display = "flex"; d.style.justifyContent = "space-between"; d.style.alignItems = "center"; d.style.margin = "4px 0";
        
        var speedText = showSpeeds ? "(" + a.daysSaved + "일/d)" : "";
        var crownPrefix = a.isDesignated ? "👑 " : "";
        
        var mainWrapper = document.createElement("div");
        mainWrapper.style.display = "flex"; mainWrapper.style.justifyContent = "space-between"; mainWrapper.style.width = "100%"; mainWrapper.style.alignItems = "center";
        
        var textSpan = document.createElement("span");
        textSpan.innerHTML = crownPrefix + "[" + a.alliance + "] " + a.player;
        
        var speedSpan = document.createElement("span");
        speedSpan.innerHTML = speedText;
        
        mainWrapper.appendChild(textSpan); mainWrapper.appendChild(speedSpan);
        d.appendChild(mainWrapper);
        
        if (adminAuthenticated) { 
            var btnGroup = document.createElement("div");
            btnGroup.style.display = "flex"; btnGroup.style.gap = "4px"; btnGroup.style.marginLeft = "10px";
            
            var desBtn = document.createElement("button"); 
            desBtn.innerText = a.isDesignated ? "해제/Unpick" : "지정/Pick";
            desBtn.className = "btn-primary"; desBtn.style.padding = "4px 8px"; desBtn.style.fontSize = "11px"; desBtn.style.flex = "none"; desBtn.style.width = "auto";
            desBtn.onclick = function() { window.toggleDesignateById(id, a.playerId); };
            
            var delBtn = document.createElement("button"); 
            delBtn.innerText = "삭제"; delBtn.className = "btn-danger"; delBtn.style.padding = "4px 8px"; delBtn.style.fontSize = "11px"; delBtn.style.flex = "none"; delBtn.style.width = "auto";
            delBtn.onclick = function() { window.deleteAttendeeById(id, a.playerId); };
            
            btnGroup.appendChild(desBtn); btnGroup.appendChild(delBtn); d.innerHTML = ""; d.appendChild(mainWrapper); d.appendChild(btnGroup); 
        } 
        list.appendChild(d); 
    }); 
    document.getElementById("reservedModal").classList.add("show"); 
}

init();

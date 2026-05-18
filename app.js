var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var currentLang = localStorage.getItem("svs_lang") || "ko";

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

var langPack = {
    ko: {
        notice: "📢 가능한 모든 시간을 중복으로 신청해주세요.",
        curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1",
        confirmedHeader: "👑 내 확정 버프 시간",
        addAlarm: "🔔 알람 등록",
        mon: "월요일 (건설)", tue: "화요일 (연구)", thu: "목요일 (훈련)",
        mondayShort: "월요일", tuesdayShort: "화요일", thursdayShort: "목요일",
        optAll: "전체 / All", optMine: "내 예약 / Mine",
        openAvailable: "✅ 예약 가능", openClosed: "🔒 예약 마감",
        pers: "명", noRes: "No Reservation / 예약 없음",
        addTitle: "새 예약 추가", confirmBtn: "확정", closeBtn: "닫기",
        statusTitle: "예약 현황", cancelLabel: "취소 비밀번호", cancelBtn: "예약 취소", addBookingBtn: "예약 추가",
        closedAlert: "예약 마감되었습니다.", speedUnit: "일",
        pAlliance: "연맹 (ZTP, BUG, ZYZ 등)", pNickname: "닉네임", pId: "ID (숫자 9자리)", pSpeed: "가속 일수", pPass: "예약 취소용 비밀번호 (아무거나)"
    },
    en: {
        notice: "📢 Please book all available time slots you can attend.",
        curvedTxt: "The website usage fee is Mona's Island 💚+1",
        confirmedHeader: "👑 My Confirmed Buffs",
        addAlarm: "🔔 Add Alarm",
        mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)",
        mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday",
        optAll: "All", optMine: "My Booking",
        openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed",
        pers: "Pers.", noRes: "No Reservation",
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close",
        statusTitle: "Booking Status", cancelLabel: "Password", cancelBtn: "Cancel Booking", addBookingBtn: "Add Booking",
        closedAlert: "Reservation Closed.", speedUnit: "d",
        pAlliance: "Alliance (ZTP, BUG, ZYZ etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password for cancel (any password)"
    },
    zh: {
        notice: "📢 请尽可能重叠申请所有您可以参加的时间段。",
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1",
        confirmedHeader: "👑 我的确定的增益时间",
        addAlarm: "🔔 添加提醒",
        mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)",
        mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四",
        optAll: "全部", optMine: "我的预约",
        openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止",
        pers: "放人", noRes: "暂无预约",
        addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭",
        statusTitle: "预约状态", cancelLabel: "取消密码", cancelBtn: "取消预约", addBookingBtn: "添加预约",
        closedAlert: "预约已截止。", speedUnit: "天",
        pAlliance: "联盟 (ZTP, BUG, ZYZ 等)", pNickname: "游戏昵称", pId: "玩家ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消的密码 (任意)"
    },
    fr: {
        notice: "📢 Veuillez réserver tous les créneaux horaires disponibles auxquels vous pouvez participer.",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1",
        confirmedHeader: "👑 Mes Buffs Confirmés",
        addAlarm: "🔔 Alarme",
        mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)",
        mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi",
        optAll: "Tout", optMine: "Mes Réservations",
        openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée",
        pers: "Pers.", noRes: "Aucune Réservation",
        addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer",
        statusTitle: "Statut de Réservation", cancelLabel: "Mot de passe", cancelBtn: "Annuler Réservation", addBookingBtn: "Ajouter Réservation",
        closedAlert: "Réservation fermée.", speedUnit: "j",
        pAlliance: "Alliance (ZTP, BUG, ZYZ etc)", pNickname: "Pseudo", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe pour annuler"
    },
    ja: {
        notice: "📢 参加可能なすべての時間帯を重複して申請してください。",
        curvedTxt: "予約サイトの利用料は Monaの島 💚+1",
        confirmedHeader: "👑 確定した大統領バフ時間",
        addAlarm: "🔔 アラーム登録",
        mon: "月曜日 (建設)", tue: "火曜日 (研究)", thu: "木曜日 (訓練)",
        mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日",
        optAll: "すべて", optMine: "自分の予約",
        openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了",
        pers: "人", noRes: "予約なし",
        addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる",
        statusTitle: "予約状況", cancelLabel: "キャンセルパスワード", cancelBtn: "予約キャンセル", addBookingBtn: "予約追加",
        closedAlert: "予約は締め切られました。", speedUnit: "日",
        pAlliance: "同盟 (ZTP, BUG, ZYZ など)", pNickname: "名前", pId: "プレイヤーID (9桁)", pSpeed: "加速日数", pPass: "キャンセル用パスワード"
    },
    id: {
        notice: "📢 Silakan pesan semua slot waktu tersedia yang bisa Anda ikuti.",
        curvedTxt: "Biaya penggunaan situs adalah Pulau Mona 💚+1",
        confirmedHeader: "👑 Buff Saya yang Dikonfirmasi",
        addAlarm: "🔔 Pasang Alarm",
        mon: "Senin (Konstruksi)", tue: "Selasa (Riset)", thu: "Kamis (Pelatihan)",
        mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis",
        optAll: "Semua", optMine: "Pesanan Saya",
        openAvailable: "✅ Pendaftaran Buka", openClosed: "🔒 Pendaftaran Tutup",
        pers: "Orang", noRes: "Belum Ada Pesanan",
        addTitle: "Tambah Pesanan Baru", confirmBtn: "Konfirmasi", closeBtn: "Tutup",
        statusTitle: "Status Pesanan", cancelLabel: "Kata Sandi", cancelBtn: "Batalkan Pesanan", addBookingBtn: "Tambah Pesanan",
        closedAlert: "Pendaftaran telah ditutup.", speedUnit: "hari",
        pAlliance: "Aliansi (ZTP, BUG, ZYZ dll)", pNickname: "Nama Pengguna", pId: "ID Pemain (9 digit)", pSpeed: "Jumlah Hari Speed-up", pPass: "Kata sandi pembatalan"
    }
};

window.changeLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem("svs_lang", lang);
    applyLanguagePack();
    window.renderAll();
};

function applyLanguagePack() {
    var p = langPack[currentLang];
    document.getElementById("langSelect").value = currentLang;
    document.getElementById("notice-dynamic-txt").innerText = p.notice;
    
    /* [완벽 세팅] 일반 텍스트가 아닌 SVG 전용 명형어 textContent 사양으로 교환 완료 */
    document.getElementById("curved-profile-txt").textContent = p.curvedTxt;
    
    document.getElementById("confirmed-header-txt").innerText = p.confirmedHeader;
    document.getElementById("tab-mon-txt").innerText = p.mon;
    document.getElementById("tab-tue-txt").innerText = p.tue;
    document.getElementById("tab-thu-txt").innerText = p.thu;
    
    document.getElementById("opt-all").innerText = p.optAll;
    document.getElementById("opt-mine").innerText = p.optMine;
    
    document.getElementById("modal-title-txt").innerText = p.addTitle;
    document.getElementById("btn-confirm-txt").innerText = p.confirmBtn;
    document.getElementById("btn-close-txt").innerText = p.closeBtn;
    
    document.getElementById("alliance").placeholder = p.pAlliance;
    document.getElementById("player").placeholder = p.pNickname;
    document.getElementById("playerId").placeholder = p.pId;
    document.getElementById("daysSaved").placeholder = p.pSpeed;
    document.getElementById("cancelKey").placeholder = p.pPass;

    document.getElementById("res-title-txt").innerText = p.statusTitle;
    document.getElementById("cancel-label-txt").innerText = p.cancelLabel;
    document.getElementById("btn-cancel-txt").innerText = p.cancelBtn;
    document.getElementById("btn-add-txt").innerText = p.addBookingBtn;
    document.getElementById("btn-res-close-txt").innerText = p.closeBtn;
}

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
    
    var title = encodeURIComponent("👑 [2737 SVS] Minister Buff Time");
    var details = encodeURIComponent("It's your minister buff time! Please use speedups.");
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
    var p = langPack[currentLang];
    confirmedTracks.forEach(function(track) {
        var card = document.createElement("div");
        card.className = "confirmedCard";
        
        var dayTxt = p[track.day + "Short"];
        var displayTime = dayTxt + " " + track.time + " UTC";
        
        var timeSpan = document.createElement("span");
        timeSpan.className = "confirmedTime";
        timeSpan.innerText = displayTime;
        
        var calBtn = document.createElement("button");
        calBtn.type = "button";
        calBtn.className = "btn-cal";
        calBtn.innerText = p.addAlarm;
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
    applyLanguagePack();
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
            var cDate = new Date(s.closeTime); if (now <= cDate) cdEl.innerText = "Close in: " + formatDiff(cDate - now); else cdEl.innerText = "Closed";
        } else cdEl.innerText = s.isOpen ? "Ready" : "Locked";
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
    var isOpen = isTabActuallyOpen(currentBuff), filter = document.getElementById("filterStatus").value;
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + currentBuff); });
    
    var showSpeeds = (bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].showSpeeds) || adminAuthenticated;
    var p = langPack[currentLang];
    var badgeDay = currentBuff.toUpperCase().slice(0,3);

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId, slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            
            var div = document.createElement("div"); 
            div.className = "slot " + (h >= 12 ? "pm-slot " : "") + (!isOpen ? " locked" : "") + (slot.attendees.some(isMyReservation) ? " myReservation" : "");
            
            var displayList = ((allSlotsData[id] || {}).attendees || []).slice().sort(function(a, b) {
                return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0);
            });
            
            var listHtml = displayList.slice(0,3).map(function(a, i) { 
                var speedText = showSpeeds ? "(" + a.daysSaved + p.speedUnit + ")" : "";
                var crownText = a.isDesignated ? "👑 " : (i+1) + ". ";
                var itemClass = a.isDesignated ? "miniItem is-designated" : "miniItem";
                
                return "<div class='" + itemClass + "'><span>" + crownText + "[" + a.alliance + "] " + a.player + "</span><span>" + speedText + "</span></div>"; 
            }).join('');
            
            div.innerHTML = "<div class=\"dayBadge\">" + badgeDay + "</div><div class=\"timeRow\"><span>" + tId + "~" + eId + " UTC</span><span style=\"color:#d34b4b;\">" + slot.attendees.length + p.pers + "</span></div><div class=\"localTime\">Local: " + formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0))) + "</div><div class=\"attendeeMiniList\">" + (listHtml || p.noRes) + "</div>";
            
            (function(savedId) {
                div.onclick = function() { if(!isOpen && !adminAuthenticated) return alert(p.closedAlert); selectedSlot = savedId; if ((allSlotsData[savedId] || {attendees:[]}).attendees.length > 0) openReservedModal(savedId); else window.openReserveModal(); };
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
    if (!confirm("Delete?")) return;
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        var list = doc.data().attendees.filter(function(a) { return String(a.playerId) !== String(playerId); });
        ref.update({ attendees: list }).then(function() { openReservedModal(slotId); });
    });
};

window.exportAllCSV = function() {
    try {
        if (typeof XLSX === 'undefined') return alert("XLSX Loading...");
        var wb = XLSX.utils.book_new(); var hasData = false;
        ["monday", "tuesday", "thursday"].forEach(function(day) {
            var rows = [];
            Object.keys(allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(function(slotId) {
                var timeStr = slotId.split('_')[1];
                allSlotsData[slotId].attendees.forEach(function(a) {
                    rows.push({ "Day": day, "Time(UTC)": timeStr, "Alliance": a.alliance, "Nickname": a.player, "Player ID": a.playerId, "SpeedDays": a.daysSaved, "Designated": a.isDesignated ? "Y" : "N" });
                });
            });
            if (rows.length > 0) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); hasData = true; }
        });
        if (!hasData) return alert("No data."); XLSX.writeFile(wb, "2737_SVS_Booking.xlsx"); addLog("Excel Download Success");
    } catch (e) { alert("Failed."); }
};

window.confirmBooking = function() {
    var a = document.getElementById("alliance").value, p = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    if(!a || !p || !idNum || !d || !pass) return alert("Fill all fields.");
    if(idNum.length !== 9) return alert("ID must be 9 digits.");
    var newEntry = { alliance: a, player: p, playerId: idNum, playerNormalized: normalizeText(p), daysSaved: Number(d), passwordHash: simpleHash(pass), isDesignated: false, createdAt: Date.now() };
    window.db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(function() { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p, playerId: idNum, cancelKey: pass })); window.closeModal(); window.renderAll(); });
};

window.confirmCancel = function() {
    var pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!pass) return alert("Enter password.");
    var mine = JSON.parse(m), ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        var list = doc.data().attendees.filter(function(a) { return !(normalizeText(a.player) === normalizeText(mine.player) && a.passwordHash === simpleHash(pass)); });
        if(list.length === doc.data().attendees.length) return alert("Wrong password.");
        ref.update({ attendees: list }).then(function() { window.closeReservedModal(); window.renderAll(); });
    });
};

window.handleAdminAccess = function() { sc++; if(sc>=3) { sc=0; var p=prompt("Admin Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); fillAdminInputs(); updateAdminUI(); addLog("Admin Login"); } } };
window.saveAutoSchedule = function() { if(!window.db) return; bookingSettings.globalOpenTime = document.getElementById("global-open-time").value; ['monday', 'tuesday', 'thursday'].forEach(function(d) { bookingSettings.tabs[d].closeTime = document.getElementById("close-" + d).value; }); window.db.collection("settings").doc("booking").update(bookingSettings).then(function() { alert("Saved!"); }); };
window.saveAdminBaseDate = function() { if(!window.db) return; var val = document.getElementById("adminBaseDate").value; if(!val) return; window.db.collection("settings").doc("booking").update({baseDate: val}).then(function() { alert("Saved!"); }); };
window.backupAndClearAll = function() { if(!window.db || !confirm("Clear all data?")) return; window.db.collection("slots").get().then(snap => { var batch = window.db.batch(); snap.forEach(doc => batch.delete(doc.ref)); batch.commit().then(() => { window.closeAdmin(); }); }); };

function updateAdminUI() { 
    ['monday', 'tuesday', 'thursday'].forEach(function(day) { 
        var btn = document.getElementById("btn-admin-" + day); if (btn) { btn.classList.toggle("on", !!bookingSettings.tabs[day].isOpen); } 
        var sBtn = document.getElementById("btn-speed-" + day); if (sBtn) { sBtn.classList.toggle("on-speed", !!bookingSettings.tabs[day].showSpeeds); }
    }); 
}
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); var p = langPack[currentLang]; if(el) el.innerText = isTabActuallyOpen(currentBuff) ? p.openAvailable : p.openClosed; }
function addLog(msg) { var box = document.getElementById('logsBox'); if (box) { var log = document.createElement('div'); log.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg; box.prepend(log); } }
function updateCountdown() { var diff = new Date(bookingSettings.baseDate) - new Date(); while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); if(document.getElementById("countdown")) document.getElementById("countdown").innerText = "Next SVS in " + d + "d " + h + "h " + m + "m " + s + "s"; }
window.switchBuff = function(b) { currentBuff = b; updateStatusMessage(); window.renderAll(); };
window.clearSearch = function() { window.renderAll(); };
window.closeModal = function() { document.getElementById("modal").classList.remove("show"); };
window.closeReservedModal = function() { document.getElementById("reservedModal").classList.remove("show"); };
window.closeAdmin = function() { document.getElementById("adminPanel").classList.remove("show"); };
function fillAdminInputs() { document.getElementById("adminBaseDate").value = bookingSettings.baseDate.slice(0, 16); document.getElementById("global-open-time").value = bookingSettings.globalOpenTime || ""; ['monday', 'tuesday', 'thursday'].forEach(function(day) { if(bookingSettings.tabs[day].closeTime) document.getElementById("close-" + day).value = bookingSettings.tabs[day].closeTime; }); }
window.openReserveFromStatus = function() { if(!isTabActuallyOpen(currentBuff) && !adminAuthenticated) return; window.closeReservedModal(); window.openReserveModal(); };

window.openReserveModal = function() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; document.getElementById("cancelKey").value = mine.cancelKey || ""; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); };

function openReservedModal(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); list.innerHTML = ""; 
    var showSpeeds = (bookingSettings.tabs[currentBuff] && bookingSettings.tabs[currentBuff].showSpeeds) || adminAuthenticated;
    var p = langPack[currentLang];
    
    var displayList = ((allSlotsData[id] || {}).attendees || []).slice().sort(function(a, b) {
        return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0);
    });
    
    displayList.forEach(function(a) { 
        var d = document.createElement("div"); 
        d.className = a.isDesignated ? "miniItem is-designated" : "miniItem"; 
        d.style.display = "flex"; d.style.justifyContent = "space-between"; d.style.alignItems = "center"; d.style.margin = "4px 0";
        
        var speedText = showSpeeds ? "(" + a.daysSaved + p.speedUnit + ")" : "";
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
            desBtn.innerText = a.isDesignated ? "해제" : "지정";
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

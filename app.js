var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var currentLang = localStorage.getItem("svs_lang") || "en

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    closedSlots: [], 
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
        notice: "📢 가능한 모든 시간을 중복으로 신청해주세요.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1",
        confirmedHeader: "👑 내 확정 버프 시간",
        addAlarm: "🔔 알람 등록",
        mon: "월요일 (건설)", tue: "화요일 (연구)", thu: "목요일 (훈련)",
        optAll: "전체 / All", optMine: "내 예약 / Mine",
        openAvailable: "✅ 예약 가능", openClosed: "🔒 예약 마감",
        pers: "명", noRes: "No Reservation / 예약 없음",
        addTitle: "새 예약 추가", confirmBtn: "확정", closeBtn: "닫기",
        statusTitle: "예약 현황", cancelLabel: "비밀번호 (아무거나)", cancelBtn: "전체 예약 취소", addBookingBtn: "예약 추가",
        closedAlert: "예약 마감되었습니다.", speedUnit: "일",
        pAlliance: "연맹 (ZTP, BUG 등)", pNickname: "닉네임", pId: "플레이어 ID (9자리)", pSpeed: "가속 일수", pPass: "비밀번호 (아무거나)",
        editBtn: "수정", cancelBtnSmall: "취소", desBtn: "지정", delBtn: "삭제"
    },
    en: {
        notice: "📢 Please book all available time slots you can attend.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "The website usage fee is Mona's Island 💚+1",
        confirmedHeader: "👑 My Confirmed Buffs",
        addAlarm: "🔔 Add Alarm",
        mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)",
        optAll: "All", optMine: "My Booking",
        openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed",
        pers: "Pers.", noRes: "No Reservation",
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close",
        statusTitle: "Booking Status", cancelLabel: "Password", cancelBtn: "Cancel All", addBookingBtn: "Add Booking",
        closedAlert: "Reservation Closed.", speedUnit: "d",
        pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password (any password)",
        editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: "Crown", delBtn: "Delete"
    },
    zh: {
        notice: "📢 请尽可能重叠申请所有您可以参加的时间段。\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1",
        confirmedHeader: "👑 我的确定的增益时间",
        addAlarm: "🔔 添加提醒",
        mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)",
        optAll: "全部", optMine: "我的预约",
        openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止",
        pers: "人", noRes: "暂无预约",
        addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭",
        statusTitle: "预约状态", cancelLabel: "取消密码", cancelBtn: "取消全额预约", addBookingBtn: "添加预约",
        closedAlert: "预约已截止。", speedUnit: "天",
        pAlliance: "联盟 (ZTP, BUG 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消的密码 (任意)",
        editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: " 지정", delBtn: "Delete"
    },
    fr: {
        notice: "📢 Veuillez réserver tous les créneaux horaires disponibles auxquels vous pouvez participer.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1",
        confirmedHeader: "👑 Mes Buffs Confirmés",
        addAlarm: "🔔 Alarme",
        mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)",
        optAll: "Tout", optMine: "Mes Réservations",
        openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée",
        pers: "Pers.", noRes: "Aucune Réservation",
        addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer",
        statusTitle: "Statut de Réservation", cancelLabel: "Mot de passe", cancelBtn: "Tout Annuler", addBookingBtn: "Ajouter Réservation",
        closedAlert: "Réservation fermée.", speedUnit: "j",
        pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Pseudo", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe pour annuler",
        editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: " 지정", delBtn: "Delete"
    },
    ja: {
        notice: "📢 参加可能なすべての時間帯を重複して申請してください。\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "予約サイト의 이용료는 Mona의 👑+1",
        confirmedHeader: "👑 確定した大統領バフ時間",
        addAlarm: "🔔 ア라ーム登録",
        mon: "月曜日 (建設)", tue: "火曜日 (研究)", thu: "木曜日 (訓練)",
        optAll: "すべて", optMine: "自分の予約",
        openAvailable: "✅ 予約受付중", openClosed: "🔒 予約終了",
        pers: "人", noRes: "予約なし",
        addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる",
        statusTitle: "予約状況", cancelLabel: "キャンセルパスワード", cancelBtn: "すべての予約를 取消", addBookingBtn: "予約追加",
        closedAlert: "予約は締め切られました。", speedUnit: "日",
        pAlliance: "同盟 (ZTP, BUG など)", pNickname: "名前", pId: "プレイヤーID (9桁)", pSpeed: "加速日数", pPass: "キャンセル用パスワード",
        editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: " 지정", delBtn: "Delete"
    },
    id: {
        notice: "📢 Silakan pesan semua slot waktu tersedia yang bisa Anda ikuti.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "Biaya penggunaan situs adalah Pulau Mona 💚+1",
        confirmedHeader: "👑 Buff Saya yang Dikonfirmasi",
        addAlarm: "🔔 Pasang Alarm",
        mon: "Senin (Konstruksi)", tue: "Selasa (Riset)", thu: "Kamis (Pelatihan)",
        optAll: "Semua", optMine: "Pesanan Saya",
        openAvailable: "✅ Pendaftaran Buka", openClosed: "🔒 Pendaftaran Tutup",
        pers: "Orang", noRes: "Belum Ada Pesanan",
        addTitle: "Tambah Pesanan Baru", confirmBtn: "Konfirmasi", closeBtn: "Tutup",
        statusTitle: "Status Pesanan", cancelLabel: "Kata Sandi", cancelBtn: "Batalkan Semua", addBookingBtn: "Tambah Pesanan",
        closedAlert: "Pendaftaran telah ditutup.", speedUnit: "hari",
        pAlliance: "Aliansi (ZTP, BUG etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi pembatalan",
        editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: " 지정", delBtn: "Delete"
    }
};

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

window.renderAll = function() {
    var grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    var isOpen = isTabActuallyOpen(currentBuff), filter = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
    
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + currentBuff); });
    
    var h = 0; for (; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var id = currentBuff + "_" + padTime(h, m), slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            
            var effectivelyOpen = isOpen && !(bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id));
            
            var div = document.createElement("div"); div.className = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "") + (slot.attendees.some(isMyReservation) ? " myReservation" : "");
            
            var showSpeeds = (adminAuthenticated || bookingSettings.tabs[currentBuff].showSpeeds) ? "" : " display:none;";
            var pPers = langPack[currentLang].pers, pNoRes = langPack[currentLang].noRes, pSpeed = langPack[currentLang].pSpeed;
            
            var listHtml = slot.attendees.map(function(a) { var designClass = a.isDesignated ? " miniDesignated" : ""; var dText = a.isDesignated ? " 👑" : ""; return "<div class='miniItem" + designClass + "'><span class='mask-text'>[" + a.alliance + "] " + a.player + dText + "</span><span style='font-weight:700;" + showSpeeds + "'> (" + a.daysSaved + "d)</span></div>"; }).join("");
            
            div.innerHTML = "<div class=\"timeRow\"><span>" + padTime(h, m) + "~" + padTime(h, m+30) + " UTC</span><span style=\"color:#d34b4b;\">" + slot.attendees.length + pPers + "</span></div><div class=\"localTime\">Local: " + formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0))) + "</div><div class=\"attendeeMiniList\">" + (listHtml || pNoRes) + "</div>";
            (function(savedId) { div.onclick = function() { selectedSlot = savedId; window.openReservedModal(savedId); }; })(id);
            grid.appendChild(div);
        }
    }
};

window.toggleTabStatus = function(day) {
    if (!window.db || !bookingSettings.tabs || !bookingSettings.tabs[day]) return;
    var newStatus = !bookingSettings.tabs[day].isOpen;
    var path = "tabs." + day + ".isOpen";
    var obj = {}; obj[path] = newStatus;
    window.db.collection("settings").doc("booking").update(obj);
};

window.toggleSpeedVisibility = function(day) {
    if (!window.db || !bookingSettings.tabs || !bookingSettings.tabs[day]) return;
    var currentStatus = bookingSettings.tabs[day].showSpeeds || false;
    var newStatus = !currentStatus;
    var path = "tabs." + day + ".showSpeeds";
    var obj = {}; obj[path] = newStatus;
    window.db.collection("settings").doc("booking").update(obj);
};

window.toggleSpecificSlot = function(slotId) {
    if (!window.db) return;
    var closedList = bookingSettings.closedSlots || [];
    if (closedList.includes(slotId)) {
        closedList = closedList.filter(function(s) { return s !== slotId; });
    } else {
        closedList.push(slotId);
    }
    window.db.collection("settings").doc("booking").update({ closedSlots: closedList }).then(function() { openReservedModal(slotId); });
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
        list.forEach(function(a) { a.isDesignated = (String(a.playerId) === String(playerId)) ? nextState : false; });
        ref.update({ attendees: list }).then(function() { openReservedModal(slotId); });
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
        var wb = XLSX.utils.book_new();
        ["monday", "tuesday", "thursday"].forEach(function(day) {
            var rows = [];
            Object.keys(allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(function(slotId) {
                var timeStr = slotId.split('_')[1];
                allSlotsData[slotId].attendees.forEach(function(a) {
                    rows.push({ "Day": day, "Time(UTC)": timeStr, "Alliance": a.alliance, "Nickname": a.player, "PlayerID": a.playerId, "SpeedDays": a.daysSaved, "Designated": a.isDesignated ? "Y" : "N" });
                });
            });
            if (rows.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day);
        });
        XLSX.writeFile(wb, "2737_SVS_Booking.xlsx");
    } catch (e) { alert("Failed."); }
};

window.confirmBooking = function() {
    var a = document.getElementById("alliance").value, nickname = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    if(!a || !nickname || !idNum || !d || !pass) return alert("Fill all.");
    if(idNum.length !== 9) return alert("ID 9 digits.");
    var newEntry = { alliance: a, player: nickname, playerId: idNum, playerNormalized: normalizeText(nickname), daysSaved: Number(d), passwordHash: simpleHash(pass), isDesignated: false };
    window.db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(function() { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: nickname, playerId: idNum })); window.closeModal(); window.renderAll(); });
};

window.confirmCancelAll = function() {
    var pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!pass || !m) return alert("Fill pass or no booking.");
    var mine = JSON.parse(m), pNormalized = normalizeText(mine.player);
    var ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return a.playerNormalized === pNormalized && String(a.playerId) === String(mine.playerId); });
        if(!target || target.passwordHash !== simpleHash(pass)) return alert("Wrong pass or no booking.");
        var updatedList = list.filter(function(a) { return !(a.playerNormalized === pNormalized && String(a.playerId) === String(mine.playerId)); });
        ref.update({ attendees: updatedList }).then(function() { window.closeReservedModal(); window.renderAll(); });
    });
};

window.confirmCancel = function() { window.confirmCancelAll(); };

window.handleAdminAccess = function() { sc++; if(sc>=3) { sc=0; var p=prompt("Admin Pass:"); if(p==="2737") { adminAuthenticated=true; document.getElementById("adminPanel").classList.add("show"); fillAdminInputs(); updateAdminUI(); } } };
window.saveAutoSchedule = function() { if(!window.db) return; bookingSettings.globalOpenTime = document.getElementById("global-open-time").value; ['monday', 'tuesday', 'thursday'].forEach(function(d) { bookingSettings.tabs[d].closeTime = document.getElementById("close-" + d).value; }); window.db.collection("settings").doc("booking").update(bookingSettings).then(function() { alert("Saved!"); }); };
window.saveAdminBaseDate = function() { if(!window.db) return; var val = document.getElementById("adminBaseDate").value; if(!val) return; window.db.collection("settings").doc("booking").update({baseDate: val}).then(function() { alert("Saved!"); }); };
window.backupAndClearAll = function() { if(!window.db || !confirm("Clear all data?")) return; window.db.collection("slots").get().then(snap => { var batch = window.db.batch(); snap.forEach(doc => batch.delete(doc.ref)); batch.commit().then(() => { window.closeAdmin(); }); }); };

function updateAdminUI() { ['monday', 'tuesday', 'thursday'].forEach(function(day) { var btn = document.getElementById("btn-admin-" + day); if (btn) { btn.classList.toggle("on", bookingSettings.tabs[day].isOpen); } var sBtn = document.getElementById("btn-speed-" + day); if (sBtn) { sBtn.classList.toggle("on-speed", bookingSettings.tabs[day].showSpeeds); } }); }
function updateStatusMessage() { var el = document.getElementById("bookingStatusMsg"); if(el) el.innerText = isTabActuallyOpen(currentBuff) ? langPack[currentLang].openAvailable : langPack[currentLang].openClosed; }
function updateCountdown() { if (!bookingSettings.baseDate) return; var diff = new Date(bookingSettings.baseDate) - new Date(); while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); if(document.getElementById("countdown")) document.getElementById("countdown").innerText = "Next SVS in " + d + "d " + h + "h " + m + "m " + s + "s"; }
window.switchBuff = function(b) { currentBuff = b; updateStatusMessage(); window.renderAll(); };
window.clearSearch = function() { window.renderAll(); };
window.closeModal = function() { document.getElementById("modal").classList.remove("show"); };
window.closeReservedModal = function() { document.getElementById("reservedModal").classList.remove("show"); };
window.closeAdmin = function() { document.getElementById("adminPanel").classList.remove("show"); };
window.changeLanguage = function(lang) { currentLang = lang; localStorage.setItem("svs_lang", lang); applyLanguagePack(); window.renderAll(); };
function fillAdminInputs() { if (!bookingSettings.baseDate) return; document.getElementById("adminBaseDate").value = bookingSettings.baseDate.slice(0, 16); document.getElementById("global-open-time").value = bookingSettings.globalOpenTime || ""; ['monday', 'tuesday', 'thursday'].forEach(function(day) { if(bookingSettings.tabs[day].closeTime) document.getElementById("close-" + day).value = bookingSettings.tabs[day].closeTime; }); }
window.openReserveModal = function() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); };
window.openReservedModal = function(id) { document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; var list = document.getElementById("attendeeListDetail"); list.innerHTML = ""; var slot = allSlotsData[id] || { attendees: [] }; var effectivelyOpen = isTabActuallyOpen(currentBuff) && !(bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id)); if (adminAuthenticated) { var toggleCloseBtn = document.createElement("button"); toggleCloseBtn.innerText = EffectivelyOpen ? langPack[currentLang].openAvailable : langPack[currentLang].openClosed; toggleCloseBtn.style = EffectivelyOpen ? "" : "background:#ffcdd2;color:#e53935;"; toggleCloseBtn.className = EffectivelyOpen ? "tab-open-btn active" : "tab-open-btn active locked"; toggleCloseBtn.style.padding = "5px 10px"; toggleCloseBtn.style.fontSize = "11px"; toggleCloseBtn.style.width = "100%"; toggleCloseBtn.style.marginBottom = "10px"; toggleCloseBtn.onclick = function() { window.toggleSpecificSlot(id); }; list.appendChild(toggleCloseBtn); effectivelyOpen = true; } if (!EffectivelyOpen) { list.innerHTML = langPack[currentLang].closedAlert; } else if (slot.attendees.length === 0 && !adminAuthenticated) { closeModal(); openReserveModal(); return; } slot.attendees.forEach(function(a) { var d = document.createElement("div"); d.className = "miniItem"; if (adminAuthenticated) { var desBtn = document.createElement("button"); desBtn.innerText = a.isDesignated ? " 해제" : langPack[currentLang].desBtn; desBtn.className = "btn-confirm"; desBtn.style.padding = "3px 6px"; desBtn.style.fontSize = "10px"; desBtn.onclick = function() { window.toggleDesignateById(id, a.playerId); }; var delBtn = document.createElement("button"); delBtn.innerText = langPack[currentLang].delBtn; delBtn.className = "btn-confirm danger"; delBtn.style.padding = "3px 6px"; delBtn.style.fontSize = "10px"; delBtn.onclick = function() { window.deleteAttendeeById(id, a.playerId); }; d.innerHTML = "<span class='mask-text des'>[" + a.alliance + "] " + a.player + "</span>"; d.appendChild(desBtn); d.appendChild(delBtn); } else { var crown = a.isDesignated ? " 👑" : ""; d.innerHTML = "<span class='mask-text'>[" + a.alliance + "] " + a.player + crown + "</span>"; } list.appendChild(d); }); if (adminAuthenticated || EffectivelyOpen) { var area = document.createElement("div"); area.className = "reserveStatusArea"; area.style.marginTop = "15px"; area.style.borderTop = "1px solid #ddd"; area.style.paddingTop = "10px"; var label = document.createElement("label"); label.innerText = langPack[currentLang].cancelLabel; area.appendChild(label); var input = document.createElement("input"); input.type = "password"; input.id = "editCancelKey"; input.placeholder = langPack[currentLang].pPass; area.appendChild(input); var row = document.createElement("div"); row.className = "buttonRow"; var cBtn = document.createElement("button"); cBtn.innerText = langPack[currentLang].cancelBtn; cBtn.className = "btn-confirm danger"; cBtn.style.flex = "1"; cBtn.onclick = window.confirmCancelAll; row.appendChild(cBtn); var aBtn = document.createElement("button"); aBtn.innerText = langPack[currentLang].addBookingBtn; aBtn.className = "btn-confirm"; aBtn.style.flex = "1"; aBtn.onclick = function() { window.closeReservedModal(); window.openReserveModal(); }; row.appendChild(aBtn); area.appendChild(row); list.appendChild(area); } document.getElementById("reservedModal").classList.add("show"); };

function applyLanguagePack() {
    var p = langPack[currentLang];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = currentLang;
    var noticeKoEl = document.querySelector(".notice-ko");
    if (noticeKoEl) {
        if (currentLang === "ko") {
            noticeKoEl.innerHTML = "📢 가능한 모든 시간을 중복으로 신청해주세요.<br />(상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)";
        } else {
            noticeKoEl.innerHTML = "📢 Please book all available time slots you can attend.<br />(You can change the language using the blue menu at the top.)";
        }
    }
    
    var tabMonEl = document.getElementById("tab-monday");
    if (tabMonEl) tabMonEl.querySelector(".tabTitle").innerText = p.mon;
    var tabTueEl = document.getElementById("tab-tuesday");
    if (tabTueEl) tabTueEl.querySelector(".tabTitle").innerText = p.tue;
    var tabThuEl = document.getElementById("tab-thursday");
    if (tabThuEl) tabThuEl.querySelector(".tabTitle").innerText = p.thu;
    
    var optAllEl = document.getElementById("opt-all");
    if (optAllEl) optAllEl.innerText = p.optAll;
    var optMineEl = document.getElementById("opt-mine");
    if (optMineEl) optMineEl.innerText = p.optMine;
    var btnResetEl = document.getElementById("btn-reset-txt");
    if (btnResetEl) btnResetEl.innerText = "Reset";
    
    var modalTitleEl = document.getElementById("modal-title-txt");
    if (modalTitleEl) modalTitleEl.innerText = p.addTitle;
    var btnConfirmEl = document.getElementById("btn-confirm-txt");
    if (btnConfirmEl) btnConfirmEl.innerText = p.confirmBtn;
    var btnCloseEl = document.getElementById("btn-close-txt");
    if (btnCloseEl) btnCloseEl.innerText = p.closeBtn;
    
    var allianceEl = document.getElementById("alliance");
    if (allianceEl) allianceEl.placeholder = p.pAlliance;
    var playerEl = document.getElementById("player");
    if (playerEl) playerEl.placeholder = p.pNickname;
    var playerIdEl = document.getElementById("playerId");
    if (playerIdEl) playerIdEl.placeholder = p.pId;
    var daysSavedEl = document.getElementById("daysSaved");
    if (daysSavedEl) daysSavedEl.placeholder = p.pSpeed;
    var cancelKeyEl = document.getElementById("cancelKey");
    if (cancelKeyEl) cancelKeyEl.placeholder = p.pPass;
}

init();

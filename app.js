var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var currentLang = localStorage.getItem("svs_lang") || "en";

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
        statusTitle: "예약 현황", cancelLabel: "취소 비밀번호", cancelBtn: "전체 예약 취소", addBookingBtn: "예약 추가",
        closedAlert: "예약 마감되었습니다.", speedUnit: "일",
        pAlliance: "연맹 (ZTP, BUG 등)", pNickname: "닉네임", pId: "플레이어 ID (9자리)", pSpeed: "가속 일수", pPass: "비밀번호 (아무거나)",
        editBtn: "수정", cancelBtnSmall: "취소", desBtn: "지정", delBtn: "삭제", slotOpenBtn: "🔓 이 예약칸 열기", slotCloseBtn: "🔒 이 예약칸 마감하기",
        errFill: "비밀번호 칸에 본인의 비밀번호를 먼저 입력해주세요.",
        errWrongPass: "비밀번호가 올바르지 않습니다.",
        errNoRes: "삭제할 예약 데이터를 찾을 수 없습니다.",
        errFillAll: "모든 항목을 입력해야 합니다.",
        errIdDigit: "플레이어 ID는 반드시 숫자 9자리여야 합니다.",
        promptEdit: "새로운 가속 일수(숫자만)를 입력하세요:",
        errNan: "숫자 형식만 입력 가능합니다."
    },
    en: {
        notice: "📢 Please book all available time slots you can attend.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "The website usage fee is Mona's Island 💚+1",
        confirmedHeader: "👑 My Confirmed Buffs",
        addAlarm: "🔔 Add Alarm",
        mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)",
        mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday",
        optAll: "All", optMine: "My Booking",
        openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed",
        pers: "Pers.", noRes: "No Reservation",
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close",
        statusTitle: "Booking Status", cancelLabel: "Password", cancelBtn: "Cancel All", addBookingBtn: "Add Booking",
        closedAlert: "Reservation Closed.", speedUnit: "d",
        pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password (any password)",
        editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: "Crown", delBtn: "Delete", slotOpenBtn: "🔓 Open this Slot", slotCloseBtn: "🔒 Close this Slot",
        errFill: "Please enter your password in the bottom field first.",
        errWrongPass: "Wrong password.",
        errNoRes: "Reservation not found.",
        errFillAll: "Please fill all fields.",
        errIdDigit: "ID must be exactly 9 digits.",
        promptEdit: "Enter new speed-up days (numbers only):",
        errNan: "Please enter a valid number."
    },
    zh: {
        notice: "📢 请尽可能重叠申请所有您可以参加的时间段。\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1",
        confirmedHeader: "👑 我的确定的增益时间",
        addAlarm: "🔔 添加提醒",
        mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)",
        mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四",
        optAll: "全部", optMine: "我的预约",
        openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止",
        pers: "人", noRes: "暂无预约",
        addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭",
        statusTitle: "预约状态", cancelLabel: "取消密码", cancelBtn: "取消全额预约", addBookingBtn: "添加预约",
        closedAlert: "预约已截止。", speedUnit: "天",
        pAlliance: "联盟 (ZTP, BUG 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消密码 (任意)",
        editBtn: "修改", cancelBtnSmall: "取消", desBtn: "指定", delBtn: "删除", slotOpenBtn: "🔓 开放此时间段", slotCloseBtn: "🔒 关闭此时间段",
        errFill: "请先在下方输入您的密码。",
        errWrongPass: "密码错误。",
        errNoRes: "找不到预约数据。",
        errFillAll: "必须填写所有字段。",
        errIdDigit: "玩家ID必须为9位数字。",
        promptEdit: "请输入新的加速天数（仅限数字）:",
        errNan: "只能输入数字格式。"
    },
    fr: {
        notice: "📢 Veuillez réserver tous les créneaux horaires disponibles auxquels vous pouvez participer.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1",
        confirmedHeader: "👑 Mes Buffs Confirmés",
        addAlarm: "🔔 Alarme",
        mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)",
        mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi",
        optAll: "Tout", optMine: "Mes Réservations",
        openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée",
        pers: "Pers.", noRes: "Aucune Réservation",
        addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer",
        statusTitle: "Statut de Réservation", cancelLabel: "Mot de passe", cancelBtn: "Tout Annuler", addBookingBtn: "Ajouter Réservation",
        closedAlert: "Réservation fermée.", speedUnit: "j",
        pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Pseudo", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe pour annuler",
        editBtn: "Modifier", cancelBtnSmall: "Annuler", desBtn: "Couronne", delBtn: "Supprimer", slotOpenBtn: "🔓 Ouvrir ce créneau", slotCloseBtn: "🔒 Fermer ce créneau",
        errFill: "Veuillez d'abord saisir votre mot de passe ci-dessous.",
        errWrongPass: "Mot de passe incorrect.",
        errNoRes: "Réservation introuvable.",
        errFillAll: "Veuillez remplir tous les champs.",
        errIdDigit: "L'identifiant doit comporter 9 chiffres.",
        promptEdit: "Entrez le nouveau nombre de jours (chiffres uniquement):",
        errNan: "Veuillez entrer un nombre valide."
    },
    ja: {
        notice: "📢 参加可能なすべての時間帯を重複して申請してください。\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "予約サイトの利用料は Monaの島 💚+1",
        confirmedHeader: "👑 確定した大統領バフ時間",
        addAlarm: "🔔 アラーム登録",
        mon: "月曜日 (建設)", tue: "火曜日 (研究)", thu: "木曜日 (訓練)",
        mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日",
        optAll: "すべて", optMine: "自分の予約",
        openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了",
        pers: "人", noRes: "予約なし",
        addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる",
        statusTitle: "予約状況", cancelLabel: "キャンセルパスワード", cancelBtn: "すべての予約を取消", addBookingBtn: "予約追加",
        closedAlert: "予約は締め切られました。", speedUnit: "日",
        pAlliance: "同盟 (ZTP, BUG など)", pNickname: "名前", pId: "プレイヤーID (9桁)", pSpeed: "加速日数", pPass: "キャンセル用パスワード",
        editBtn: "修正", cancelBtnSmall: "取消", desBtn: "指定", delBtn: "削除", slotOpenBtn: "🔓 スロットを開く", slotCloseBtn: "🔒 スロットを閉じる",
        errFill: "まず下欄にパスワードを入力してください。",
        errWrongPass: "パスワードが間違っています。",
        errNoRes: "予約データが見つかりません。",
        errFillAll: "すべての項目を入力してください。",
        errIdDigit: "プレイヤーIDは9桁の数字でなければなりません。",
        promptEdit: "新しい加速日数（数字のみ）を入力してください:",
        errNan: "数字形式のみ入力可能です。"
    },
    id: {
        notice: "📢 Silakan pesan semua slot waktu tersedia yang bisa Anda ikuti.\n(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "Biaya penggunaan situs adalah Pulau Mona 💚+1",
        confirmedHeader: "👑 Buff Saya yang Dikonfirmasi",
        addAlarm: "🔔 Pasang Alarm",
        mon: "Senin (Konstruksi)", tue: "Selasa (Riset)", thu: "Kamis (Pelatihan)",
        mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis",
        optAll: "Semua", optMine: "Pesanan Saya",
        openAvailable: "✅ Pendaftaran Buka", openClosed: "🔒 Pendaftaran Tutup",
        pers: "Orang", noRes: "Belum Ada Pesanan",
        addTitle: "Tambah Pesanan Baru", confirmBtn: "Konfirmasi", closeBtn: "Tutup",
        statusTitle: "Status Pesanan", cancelLabel: "Kata Sandi", cancelBtn: "Batalkan Semua", addBookingBtn: "Tambah Pesanan",
        closedAlert: "Pendaftaran telah ditutup.", speedUnit: "hari",
        pAlliance: "Aliansi (ZTP, BUG etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi pembatalan",
        editBtn: "Ubah", cancelBtnSmall: "Batal", desBtn: "Mahkota", delBtn: "Hapus", slotOpenBtn: "🔓 Buka Slot Ini", slotCloseBtn: "🔒 Tutup Slot Ini",
        errFill: "Silakan masukkan kata sandi Anda di kolom bawah terlebih dahulu.",
        errWrongPass: "Kata sandi salah.",
        errNoRes: "Data reservasi tidak ditemukan.",
        errFillAll: "Semua kolom harus diisi.",
        errIdDigit: "ID Pemain harus berupa 9 digit angka.",
        promptEdit: "Masukkan jumlah hari speed-up yang baru (angka saja):",
        errNan: "Hanya format angka yang diperbolehkan."
    }
};

function openCustomAlert(msg) {
    var titleEl = document.getElementById("alert-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "⚠️ 안내" : "⚠️ Notice";
    var msgEl = document.getElementById("alertModalMessage");
    if(msgEl) msgEl.innerText = msg;
    document.getElementById("alertModal").classList.add("show");
}

window.changeLanguage = function(lang) { currentLang = lang; localStorage.setItem("svs_lang", lang); applyLanguagePack(); window.renderAll(); };

function applyLanguagePack() {
    var p = langPack[currentLang];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = currentLang;
    var noticeKoEl = document.getElementById("notice-dynamic-txt");
    if (noticeKoEl) {
        if (currentLang === "ko") noticeKoEl.innerHTML = "📢 가능한 모든 시간을 중복으로 신청해주세요.";
        else noticeKoEl.innerHTML = "📢 Please book all available time slots you can attend.<br />(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)";
    }
    document.getElementById("tab-mon-txt").innerText = p.mon;
    document.getElementById("tab-tue-txt").innerText = p.tue;
    document.getElementById("tab-thu-txt").innerText = p.thu;
    document.getElementById("opt-all").innerText = p.optAll;
    document.getElementById("opt-mine").innerText = p.optMine;
    document.getElementById("btn-reset-txt").innerText = "Reset";
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
    document.getElementById("curved-profile-txt").textContent = p.curvedTxt;
}

function padTime(h, m) { return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function formatLocalTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }
function isTabActuallyOpen(day) { var s = bookingSettings.tabs[day], now = new Date(); if (!s.isOpen) return false; if (bookingSettings.globalOpenTime && now < new Date(bookingSettings.globalOpenTime)) return false; if (s.closeTime && now > new Date(s.closeTime)) return false; return true; }

function updateMyConfirmedSummary() {
    var el = document.getElementById("myConfirmedSection");
    var listEl = document.getElementById("confirmedList");
    if (!el || !listEl) return;
    var m = localStorage.getItem(MY_BOOKING_KEY);
    if (!m) { el.style.display = "none"; return; }
    var mine = JSON.parse(m), myName = normalizeText(mine.player);
    var confirmedTracks = [];
    Object.keys(allSlotsData).forEach(function(slotId) {
        var slot = allSlotsData[slotId];
        slot.attendees.forEach(function(a) { if (normalizeText(a.player) === myName && a.isDesignated) { var parts = slotId.split("_"); confirmedTracks.push({ day: parts[0], time: parts[1], slotId: slotId }); } });
    });
    if (confirmedTracks.length === 0) { el.style.display = "none"; return; }
    var dayOrder = { monday: 1, tuesday: 2, thursday: 4 };
    confirmedTracks.sort(function(a, b) { return dayOrder[a.day] - dayOrder[b.day]; });
    listEl.innerHTML = "";
    confirmedTracks.forEach(function(track) {
        var card = document.createElement("div"); card.className = "confirmedCard";
        card.innerHTML = "<span class='confirmedTime'>" + langPack[currentLang][track.day + "Short"] + " " + track.time + " UTC</span>";
        listEl.appendChild(card);
    });
    el.style.display = "block";
}

function init() {
    document.addEventListener("DOMContentLoaded", function() {
        applyLanguagePack();
        if(!window.db) { setTimeout(init, 200); return; }
        window.db.collection("settings").doc("booking").onSnapshot(function(doc) { if(doc.exists) { bookingSettings = doc.data(); } updateStatusMessage(); updateAdminUI(); window.renderAll(); });
        window.db.collection("slots").onSnapshot(function(snap) { allSlotsData = {}; snap.forEach(function(doc) { allSlotsData[doc.id] = doc.data(); }); window.renderAll(); });
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
            var div = document.createElement("div"); div.className = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "");
            var p = langPack[currentLang];
            var listHtml = slot.attendees.map(function(a) { return "<div class='miniItem" + (a.isDesignated ? " is-designated" : "") + "'><span>" + (a.isDesignated ? "👑 " : "") + "[" + a.alliance + "] " + a.player + "</span></div>"; }).join('');
            div.innerHTML = "<div class='timeRow'><span>" + padTime(h, m) + "~" + padTime(h, m+30) + " UTC" + (isSpecificallyClosed ? " 🔒" : "") + "</span><span>" + slot.attendees.length + p.pers + "</span></div><div class='attendeeMiniList'>" + (listHtml || p.noRes) + "</div>";
            div.onclick = function() { window.handleSlotClick(id, effectivelyOpen); };
            grid.appendChild(div);
        }
    }
    updateMyConfirmedSummary();
};

window.handleSlotClick = function(id, effectivelyOpen) {
    var p = langPack[currentLang];
    if(!effectivelyOpen && !adminAuthenticated) return openCustomAlert(p.closedAlert);
    selectedSlot = id;
    window.openReservedModal(id);
};

window.toggleTabStatus = function(day) {
    if (!window.db) return;
    var newStatus = !bookingSettings.tabs[day].isOpen;
    var path = "tabs." + day + ".isOpen";
    var obj = {}; obj[path] = newStatus;
    window.db.collection("settings").doc("booking").update(obj);
};

window.toggleSpeedVisibility = function(day) {
    if (!window.db) return;
    var newStatus = !(bookingSettings.tabs[day].showSpeeds || false);
    var path = "tabs." + day + ".showSpeeds";
    var obj = {}; obj[path] = newStatus;
    window.db.collection("settings").doc("booking").update(obj);
};

window.toggleSpecificSlot = function(slotId) {
    if (!window.db) return;
    var closedList = bookingSettings.closedSlots || [];
    if (closedList.includes(slotId)) closedList = closedList.filter(function(s) { return s !== slotId; });
    else closedList.push(slotId);
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
        if (typeof XLSX === 'undefined') return openCustomAlert("XLSX Loading...");
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
    } catch (e) { openCustomAlert("Failed."); }
};

window.confirmBooking = function() {
    var p = langPack[currentLang];
    var a = document.getElementById("alliance").value, nickname = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    if(!a || !nickname || !idNum || !d || !pass) return openCustomAlert(p.errFillAll);
    if(idNum.length !== 9) return openCustomAlert(p.errIdDigit);
    var newEntry = { alliance: a, player: nickname, playerId: idNum, playerNormalized: normalizeText(nickname), daysSaved: Number(d), passwordHash: simpleHash(pass), isDesignated: false };
    window.db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(function() { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: nickname, playerId: idNum })); window.closeModal(); window.renderAll(); });
};

window.confirmCancelAll = function() {
    var p = langPack[currentLang], pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!pass || !m) return openCustomAlert(p.errFill);
    var mine = JSON.parse(m), pNormalized = normalizeText(mine.player);
    var ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return a.playerNormalized === pNormalized && String(a.playerId) === String(mine.playerId); });
        if(!target || target.passwordHash !== simpleHash(pass)) return openCustomAlert(p.errWrongPass);
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
function fillAdminInputs() { if (!bookingSettings.baseDate) return; document.getElementById("adminBaseDate").value = bookingSettings.baseDate.slice(0, 16); document.getElementById("global-open-time").value = bookingSettings.globalOpenTime || ""; ['monday', 'tuesday', 'thursday'].forEach(function(day) { if(bookingSettings.tabs[day].closeTime) document.getElementById("close-" + day).value = bookingSettings.tabs[day].closeTime; }); }
window.openReserveFromStatus = function() { if(!isTabActuallyOpen(currentBuff) && !adminAuthenticated) return; window.closeReservedModal(); window.openReserveModal(); };

window.openReserveModal = function() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); };

window.openReservedModal = function(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); list.innerHTML = ""; 
    var p = langPack[currentLang];
    var isSpecificallyClosed = bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id);
    var effectivelyOpen = isTabActuallyOpen(currentBuff) && !isSpecificallyClosed;

    if (adminAuthenticated) {
        var btn = document.createElement("button"); btn.innerText = effectivelyOpen ? p.slotOpenBtn : p.slotCloseBtn;
        btn.className = effectivelyOpen ? "btn-primary" : "btn-danger"; btn.style.width = "100%"; btn.style.marginBottom = "10px";
        btn.onclick = function() { window.toggleSpecificSlot(id); }; list.appendChild(btn);
    }
    
    var slot = allSlotsData[id] || { attendees: [] };
    if (!effectivelyOpen && !adminAuthenticated) { list.innerHTML = "<div style='padding:20px; font-weight:800; color:#e53935;'>" + p.closedAlert + "</div>"; }
    else if (slot.attendees.length === 0 && !adminAuthenticated) { window.closeReservedModal(); window.openReserveModal(); return; }
    
    slot.attendees.forEach(function(a) { 
        var d = document.createElement("div"); d.className = "miniItem" + (a.isDesignated ? " is-designated" : "");
        d.innerHTML = "<span>" + (a.isDesignated ? "👑 " : "") + "[" + a.alliance + "] " + a.player + " (" + a.daysSaved + "d)</span>";
        if (adminAuthenticated) {
            var desBtn = document.createElement("button"); desBtn.innerText = a.isDesignated ? "해제" : p.desBtn; desBtn.onclick = function() { window.toggleDesignateById(id, a.playerId); }; d.appendChild(desBtn);
            var delBtn = document.createElement("button"); delBtn.innerText = p.delBtn; delBtn.onclick = function() { window.deleteAttendeeById(id, a.playerId); }; d.appendChild(delBtn);
        }
        list.appendChild(d); 
    });
    
    if (adminAuthenticated || effectivelyOpen) {
        var area = document.createElement("div"); area.style.marginTop = "15px"; area.style.borderTop = "1px solid #eee"; area.style.paddingTop = "10px";
        area.innerHTML = "<label style='display:block; margin-bottom:5px; font-size:13px; font-weight:800;'>" + p.cancelLabel + "</label><input type='password' id='editCancelKey' placeholder='" + p.pPass + "' style='margin-bottom:10px;' />";
        var row = document.createElement("div"); row.className = "buttonRow";
        var cBtn = document.createElement("button"); cBtn.innerText = p.cancelBtn; cBtn.className = "btn-danger"; cBtn.onclick = window.confirmCancelAll; row.appendChild(cBtn);
        var aBtn = document.createElement("button"); aBtn.innerText = p.addBookingBtn; aBtn.className = "btn-primary"; aBtn.onclick = function() { window.closeReservedModal(); window.openReserveModal(); }; row.appendChild(aBtn);
        area.appendChild(row); list.appendChild(area);
    }
    document.getElementById("reservedModal").classList.add("show");
};

init();

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
        /* [공지 다이어트] 한국어 모드일 때는 불필요한 번역 가이드를 삭제하고 깔끔하게 1줄로 출력합니다 */
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
        pAlliance: "연맹 (ZTP, BUG, ZYZ 등)", pNickname: "닉네임", pId: "ID (숫자 9자리)", pSpeed: "가속 일수", pPass: "예약 취소용 비밀번호 (아무거나)",
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
        pAlliance: "Alliance (ZTP, BUG, ZYZ etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password for cancel (any password)",
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
        pAlliance: "联盟 (ZTP, BUG, ZYZ 等)", pNickname: "游戏昵称", pId: "玩家ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消密码 (任意)",
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
        pAlliance: "Alliance (ZTP, BUG, ZYZ etc)", pNickname: "Pseudo", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe pour annuler",
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
        pAlliance: "同盟 (ZTP, BUG, ZYZ など)", pNickname: "名前", pId: "プレイヤーID (9桁)", pSpeed: "加速日数", pPass: "キャンセル用パスワード",
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
        pAlliance: "Aliansi (ZTP, BUG, ZYZ dll)", pNickname: "Nama Pengguna", pId: "ID Pemain (9 digit)", pSpeed: "Jumlah Hari Speed-up", pPass: "Kata sandi pembatalan",
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
    if(titleEl) {
        titleEl.innerText = currentLang === 'ko' ? "⚠️ 안내" : "⚠️ Notice";
    }
    var msgEl = document.getElementById("alertModalMessage");
    if(msgEl) msgEl.innerText = msg;
    var modalEl = document.getElementById("alertModal");
    if(modalEl) modalEl.classList.add("show");
}

window.changeLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem("svs_lang", lang);
    applyLanguagePack();
    window.renderAll();
};

function applyLanguagePack() {
    var p = langPack[currentLang];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = currentLang;
    
    var noticeEl = document.getElementById("notice-dynamic-txt");
    if (noticeEl) noticeEl.innerText = p.notice;
    
    var curvedEl = document.getElementById("curved-profile-txt");
    if (curvedEl) curvedEl.textContent = p.curvedTxt;
    
    var confHeaderEl = document.getElementById("confirmed-header-txt");
    if (confHeaderEl) confHeaderEl.innerText = p.confirmedHeader;
    
    var tabMonEl = document.getElementById("tab-mon-txt");
    if (tabMonEl) tabMonEl.innerText = p.mon;
    var tabTueEl = document.getElementById("tab-tue-txt");
    if (tabTueEl) tabTueEl.innerText = p.tue;
    var tabThuEl = document.getElementById("tab-thu-txt");
    if (tabThuEl) tabThuEl.innerText = p.thu;
    
    var optAllEl = document.getElementById("opt-all");
    if (optAllEl) optAllEl.innerText = p.optAll;
    var optMineEl = document.getElementById("opt-mine");
    if (optMineEl) optMineEl.innerText = p.optMine;
    
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

    var resTitleEl = document.getElementById("res-title-txt");
    if (resTitleEl) resTitleEl.innerText = p.statusTitle;
    var cancelLabelEl = document.getElementById("cancel-label-txt");
    if (cancelLabelEl) cancelLabelEl.innerText = p.cancelLabel;
    var btnCancelEl = document.getElementById("btn-cancel-txt");
    if (btnCancelEl) btnCancelEl.innerText = p.cancelBtn;
    var btnAddEl = document.getElementById("btn-add-txt");
    if (btnAddEl) btnAddEl.innerText = p.addBookingBtn;
    var btnResCloseEl = document.getElementById("btn-res-close-txt");
    if (btnResCloseEl) btnResCloseEl.innerText = p.closeBtn;
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
    if (!bookingSettings || !bookingSettings.tabs) return;
    var now = new Date(), gOpenStr = bookingSettings.globalOpenTime, gOpen = gOpenStr ? new Date(gOpenStr) : null;
    ['monday', 'tuesday', 'thursday'].forEach(function(day) {
        var s = bookingSettings.tabs[day], cdEl = document.getElementById("cd-" + day); if (!cdEl) return;
        if (!s) return;
        if (gOpen && !isNaN(gOpen) && now < gOpen) cdEl.innerText = "Open in: " + formatDiff(gOpen - now);
        else if (s.closeTime && !isNaN(new Date(s.closeTime))) {
            var cDate = new Date(s.closeTime); if (now <= cDate) cdEl.innerText = "Close in: " + formatDiff(cDate - now); else cdEl.innerText = "Closed";
        } else cdEl.innerText = s.isOpen ? "Ready" : "Locked";
    });
}

function isTabActuallyOpen(day) {
    if (!bookingSettings || !bookingSettings.tabs || !bookingSettings.tabs[day]) return false;
    var s = bookingSettings.tabs[day], now = new Date();
    if (!s.isOpen) return false; 
    if (bookingSettings.globalOpenTime && now < new Date(bookingSettings.globalOpenTime)) return false;
    if (s.closeTime && now > new Date(s.closeTime)) return false; return true;
}

window.renderAll = function() {
    var grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    var isOpen = isTabActuallyOpen(currentBuff), filter = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
    
    var tabItemEl = document.getElementById("tab-" + currentBuff);
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + currentBuff); });
    
    var showSpeeds = false;
    if (bookingSettings && bookingSettings.tabs && bookingSettings.tabs[currentBuff]) {
        showSpeeds = bookingSettings.tabs[currentBuff].showSpeeds || false;
    }
    if (adminAuthenticated) showSpeeds = true;
    
    var p = langPack[currentLang];
    var badgeDay = currentBuff.toUpperCase().slice(0,3);

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var tId = padTime(h, m), eId = padTime(h, m + 30), id = currentBuff + "_" + tId, slot = allSlotsData[id] || { attendees: [] };
            if (filter === "mine" && !slot.attendees.some(isMyReservation)) continue;
            
            var isSpecificallyClosed = bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id);
            var effectivelyOpen = isOpen && !isSpecificallyClosed;
            
            var div = document.createElement("div"); 
            var slotClass = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "") + (slot.attendees.some(isMyReservation) ? " myReservation" : "");
            div.className = slotClass;
            
            var displayList = ((allSlotsData[id] || {}).attendees || []).slice().sort(function(a, b) {
                return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0);
            });
            
            var listHtml = displayList.slice(0,3).map(function(a, i) { 
                var speedText = showSpeeds ? "(" + a.daysSaved + p.speedUnit + ")" : "";
                var crownText = a.isDesignated ? "👑 " : (i+1) + ". ";
                var itemClass = a.isDesignated ? "miniItem is-designated" : "miniItem";
                
                return "<div class='" + itemClass + "'><span>" + crownText + "[" + a.alliance + "] " + a.player + "</span><span>" + speedText + "</span></div>"; 
            }).join('');
            
            var lockMark = isSpecificallyClosed ? " <span style='color:red;'>🔒</span>" : "";
            div.innerHTML = "<div class=\"dayBadge\">" + badgeDay + "</div><div class=\"timeRow\"><span>" + tId + "~" + eId + " UTC" + lockMark + "</span><span style=\"color:#d34b4b;\">" + slot.attendees.length + p.pers + "</span></div><div class=\"localTime\">Local: " + formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0))) + "</div><div class=\"attendeeMiniList\">" + (listHtml || p.noRes) + "</div>";
            
            (function(savedId) {
                div.onclick = function() { 
                    if(!effectivelyOpen && !adminAuthenticated) return openCustomAlert(p.closedAlert); 
                    selectedSlot = savedId; 
                    if ((allSlotsData[savedId] || {attendees:[]}).attendees.length > 0 || adminAuthenticated) openReservedModal(savedId); 
                    else window.openReserveModal(); 
                };
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

window.toggleSpecificSlot = function(slotId) {
    if (!window.db) return;
    var closedList = bookingSettings.closedSlots || [];
    if (closedList.includes(slotId)) {
        closedList = closedList.filter(function(s) { return s !== slotId; });
    } else {
        closedList.push(slotId);
    }
    window.db.collection("settings").doc("booking").update({ closedSlots: closedList }).then(function() {
        addLog("Slot " + slotId + " toggled.");
        openReservedModal(slotId); 
    });
};

window.toggleDesignateById = function(slotId, uniqueId) {
    if (!window.db) return;
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return String(a.id) === String(uniqueId); });
        if (!target) return;
        
        var nextState = !target.isDesignated;
        list.forEach(function(a) {
            if (String(a.id) === String(uniqueId)) {
                a.isDesignated = nextState;
            } else {
                a.isDesignated = false;
            }
        });
        
        ref.update({ attendees: list }).then(function() {
            addLog("Designation Changed for Unique ID: " + uniqueId);
            openReservedModal(slotId);
        });
    });
};

window.deleteAttendeeById = function(slotId, uniqueId) {
    if (!confirm("Delete?")) return;
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        var list = doc.data().attendees.filter(function(a) { return String(a.id) !== String(uniqueId); });
        ref.update({ attendees: list }).then(function() { openReservedModal(slotId); });
    });
};

window.exportAllCSV = function() {
    try {
        if (typeof XLSX === 'undefined') return openCustomAlert("XLSX Loading...");
        var wb = XLSX.utils.book_new(); var hasData = false;
        ["monday", "tuesday", "thursday"].forEach(function(day) {
            var rows = [];
            Object.keys(allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(

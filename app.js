var currentBuff = "monda
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

var langPack = {
    ko: { notice: "📢 가능한 모든 시간을 중복으로 신청해주세요.", curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1", confirmedHeader: "👑 내 확정 버프 시간", addAlarm: "🔔 알람 등록", mon: "월요일 (건설)", tue: "화요일 (연구)", thu: "목요일 (훈련)", mondayShort: "월요일", tuesdayShort: "화요일", thursdayShort: "목요일", optAll: "전체 / All", optMine: "내 예약 / Mine", openAvailable: "✅ 예약 가능", openClosed: "🔒 예약 마감", pers: "명", noRes: "No Reservation / 예약 없음", addTitle: "새 예약 추가", confirmBtn: "확정", closeBtn: "닫기", statusTitle: "예약 현황", cancelLabel: "취소 비밀번호", cancelBtn: "나의 예약 전체 취소", addBookingBtn: "예약 추가", closedAlert: "예약 마감되었습니다.", speedUnit: "일", pAlliance: "연맹 (ZTP, BUG 등)", pNickname: "닉네임", pId: "플레이어 ID (9자리)", pSpeed: "가속 일수", pPass: "비밀번호 (아무거나)", editBtn: "수정", cancelBtnSmall: "취소", desBtn: "지정", delBtn: "삭제", slotOpenBtn: "🔓 이 예약칸 열기", slotCloseBtn: "🔒 이 예약칸 마감하기", errFill: "비밀번호 칸에 본인의 비밀번호를 먼저 입력해주세요.", errWrongPass: "비밀번호가 올바르지 않습니다.", errNoRes: "삭제할 예약 데이터를 찾을 수 없습니다.", errFillAll: "모든 항목을 입력해야 합니다.", errIdDigit: "플레이어 ID는 반드시 숫자 9자리여야 합니다.", promptEdit: "새로운 가속 일수(숫자만)를 입력하세요:", errNan: "숫자 형식만 입력 가능합니다." },
    en: { notice: "📢 Please book all available time slots you can attend.<br />(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "The website usage fee is Mona's Island 💚+1", confirmedHeader: "👑 My Confirmed Buffs", addAlarm: "🔔 Add Alarm", mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)", mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday", optAll: "All", optMine: "My Booking", openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed", pers: "Pers.", noRes: "No Reservation", addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close", statusTitle: "Booking Status", cancelLabel: "Password", cancelBtn: "Cancel My All Bookings", addBookingBtn: "Add Booking", closedAlert: "Reservation Closed.", speedUnit: "d", pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password (any password)", editBtn: "Edit", cancelBtnSmall: "Cancel", desBtn: "Crown", delBtn: "Delete", slotOpenBtn: "🔓 Open this Slot", slotCloseBtn: "🔒 Close this Slot", errFill: "Please enter your password in the bottom field first.", errWrongPass: "Wrong password.", errNoRes: "Reservation not found.", errFillAll: "Please fill all fields.", errIdDigit: "ID must be exactly 9 digits.", promptEdit: "Enter new speed-up days (numbers only):", errNan: "Please enter a valid number." },
    zh: { notice: "📢 请尽可能重叠申请所有您可以参加的时间段。<br />(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "预约网站使用费是 Mona的岛 💚+1", confirmedHeader: "👑 我的确定的增益时间", addAlarm: "🔔 添加提醒", mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)", mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四", optAll: "全部", optMine: "我的预约", openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止", pers: "人", noRes: "暂无预约", addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭", statusTitle: "预约状态", cancelLabel: "取消密码", cancelBtn: "取消我的所有预约", addBookingBtn: "添加预约", closedAlert: "预约已截止。", speedUnit: "天", pAlliance: "联盟 (ZTP, BUG 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消密码 (任意)", editBtn: "修改", cancelBtnSmall: "取消", desBtn: "指定", delBtn: "删除", slotOpenBtn: "🔓 开放此时间段", slotCloseBtn: "🔒 关闭此时间段", errFill: "请先在下方输入您的密码。", errWrongPass: "密码错误。", errNoRes: "找不到预约数据。", errFillAll: "必须填写所有字段。", errIdDigit: "玩家ID必须为9位数字。", promptEdit: "请输入新的加速天数（仅限数字）:", errNan: "只能输入数字格式。" },
    fr: { notice: "📢 Veuillez réserver tous les créneaux horaires disponibles auxquels vous pouvez participer.<br />(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1", confirmedHeader: "👑 Mes Buffs Confirmés", addAlarm: "🔔 Alarme", mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)", mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi", optAll: "Tout", optMine: "Mes Réservations", openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée", pers: "Pers.", noRes: "Aucune Réservation", addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer", statusTitle: "Statut de Réservation", cancelLabel: "Mot de passe", cancelBtn: "Annuler toutes mes réservations", addBookingBtn: "Ajouter Réservation", closedAlert: "Réservation fermée.", speedUnit: "j", pAlliance: "Alliance (ZTP, BUG etc)", pNickname: "Pseudo", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe pour annuler", editBtn: "Modifier", cancelBtnSmall: "Annuler", desBtn: "Couronne", delBtn: "Supprimer", slotOpenBtn: "🔓 Ouvrir ce créneau", slotCloseBtn: "🔒 Fermer ce créneau", errFill: "Veuillez d'abord saisir votre mot de passe ci-dessous.", errWrongPass: "Mot de passe incorrect.", errNoRes: "Réservation introuvable.", errFillAll: "Veuillez remplir tous champs.", errIdDigit: "L'identifiant doit comporter 9 chiffres.", promptEdit: "Entrez le nouveau nombre de jours (chiffres uniquement):", errNan: "Veuillez entrer un nombre valide." },
    ja: { notice: "📢 参加可能なすべての時間帯を重複して申請してください。<br />(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "予約サイトの利用料は Monaの島 💚+1", confirmedHeader: "👑 確定した大統領バフ時間", addAlarm: "🔔 アラーム登録", mon: "月曜日 (建設)", tue: "火曜日 (研究)", thu: "木曜日 (訓練)", mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日", optAll: "すべて", optMine: "自分の予約", openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了", pers: "人", noRes: "予約なし", addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる", statusTitle: "予約状況", cancelLabel: "キャンセルパスワード", cancelBtn: "自分の予約をすべて取消", addBookingBtn: "予約追加", closedAlert: "予約は締め切られました。", speedUnit: "日", pAlliance: "同盟 (ZTP, BUG など)", pNickname: "名前", pId: "プレイヤーID (9桁)", pSpeed: "加速日数", pPass: "キャンセル用パスワード", editBtn: "修正", cancelBtnSmall: "取消", desBtn: "指定", delBtn: "削除", slotOpenBtn: "🔓 スロットを開く", slotCloseBtn: "🔒 スロットを閉じる", errFill: "まず下欄にパスワードを入力してください。", errWrongPass: "パスワードが間違っています。", errNoRes: "予約データが見つかりません。", errFillAll: "すべての項目を入力してください。", errIdDigit: "プレイヤーIDは9桁の数字でなければなりません。", promptEdit: "新しい加速日数（数字のみ）を入力してください:", errNan: "数字形式のみ入力可能です." },
    id: { notice: "📢 Silakan pesan semua slot waktu tersedia yang bisa Anda ikuti.<br />(You can change the language using the blue menu at the top / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "Biaya penggunaan situs adalah Pulau Mona 💚+1", confirmedHeader: "👑 Buff Saya yang Dikonfirmasi", addAlarm: "🔔 Pasang Alarm", mon: "Senin (Konstruksi)", tue: "Selasa (Riset)", thu: "Kamis (Pelatihan)", mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis", optAll: "Semua", optMine: "Pesanan Saya", openAvailable: "✅ Pendaftaran Buka", openClosed: "🔒 Pendaftaran Tutup", pers: "Orang", noRes: "Belum Ada Pesanan", addTitle: "Tambah Pesanan Baru", confirmBtn: "Konfirmasi", closeBtn: "Tutup", statusTitle: "Status Pesanan", cancelLabel: "Kata Sandi", cancelBtn: "Batalkan Semua Pesanan Saya", addBookingBtn: "Tambah Pesanan", closedAlert: "Pendaftaran telah ditutup.", speedUnit: "hari", pAlliance: "Aliansi (ZTP, BUG etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi pembatalan", editBtn: "Ubah", cancelBtnSmall: "Batal", desBtn: "Mahkota", delBtn: "Hapus", slotOpenBtn: "🔓 Buka Slot Ini", slotCloseBtn: "🔒 Tutup Slot Ini", errFill: "Silakan masukkan kata sandi Anda di kolom bawah terlebih dahulu.", errWrongPass: "Kata sandi salah.", errNoRes: "Data reservasi tidak ditemukan.", errFillAll: "Semua kolom harus diisi.", errIdDigit: "ID Pemain harus berupa 9 digit angka.", promptEdit: "Masukkan jumlah hari speed-up yang baru (angka saja):", errNan: "Hanya format angka yang diperbolehkan." },
    tr: { notice: "📢 Lütfen katılabileceğiniz tüm uygun zaman dilimleri için rezervasyon yapın.<br />(Üstteki mavi menüyü kullanarak dili değiştirebilirsiniz / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "Web sitesi kullanım ücreti Mona'nın Adası 💚+1", confirmedHeader: "👑 Onaylanmış Bufflarım", addAlarm: "🔔 Alarm Ekle", mon: "Pazartesi (İnşaat)", tue: "Salı (Araştırma)", thu: "Perşembe (Eğitim)", mondayShort: "Pazartesi", tuesdayShort: "Salı", thursdayShort: "Perşembe", optAll: "Tümü", optMine: "Benim Rezervasyonum", openAvailable: "✅ Rezervasyona Açık", openClosed: "🔒 Rezervasyon Kapalı", pers: "Kişi", noRes: "Rezervasyon Yok", addTitle: "Yeni Rezervasyon", confirmBtn: "Onayla", closeBtn: "Kapat", statusTitle: "Rezervasyon Durumu", cancelLabel: "Şifre", cancelBtn: "Tüm Rezervasyonlarımı İptal Et", addBookingBtn: "Rezervasyon Ekle", closedAlert: "Rezervasyon kapandı.", speedUnit: "g", pAlliance: "İttifak (ZTP, BUG vb.)", pNickname: "Kullanıcı Adı", pId: "Oyuncu ID (9 haneli)", pSpeed: "Hızlandırma (Gün)", pPass: "İptal Şifresi (Herhangi biri)", editBtn: "Düzenle", cancelBtnSmall: "İptal", desBtn: "Taç", delBtn: "Sil", slotOpenBtn: "🔓 Bu Saati Aç", slotCloseBtn: "🔒 Bu Saati Kapat", errFill: "Lütfen önce aşağıdaki alana şifrenizi girin.", errWrongPass: "Yanlış şifre.", errNoRes: "Rezervasyon bulunamadı.", errFillAll: "Lütfen tüm alanları doldurun.", errIdDigit: "Oyuncu ID tam olarak 9 haneli olmalıdır.", promptEdit: "Yeni hızlandırma gün sayısını girin (Sadece rakam):", errNan: "Lütfen geçerli bir sayı girin." },
    ar: { notice: "📢 يرجى حجز جميع الأوقات المتاحة التي يمكنك الحضور فيها.<br />(يمكنك تغيير اللغة باستخدام القائمة الزرقاء في الأعلى / 상단의 파란색 메뉴로 언어를 변경할 수 있습니다.)", curvedTxt: "رسوم استخدام الموقع هي جزيرة منى 💚+1", confirmedHeader: "👑 المعززات المؤكدة الخاصة بي", addAlarm: "🔔 إضافة منبه", mon: "الاثنين (بناء)", tue: "الثلاثاء (أبحاث)", thu: "الخميس (تدريب)", mondayShort: "الاثنين", tuesdayShort: "الثلاثاء", thursdayShort: "الخميس", optAll: "الكل", optMine: "حجوزاتي", openAvailable: "✅ الحجز مفتوح", openClosed: "🔒 الحجز مغلق", pers: "أشخاص", noRes: "لا يوجد حجز", addTitle: "حجز جديد", confirmBtn: "تأكيد", closeBtn: "إغلاق", statusTitle: "حالة الحجز", cancelLabel: "كلمة المرور", cancelBtn: "إلغاء جميع حجوزاتي", addBookingBtn: "إضافة حجز", closedAlert: "تم إغلاق الحجز.", speedUnit: "ي", pAlliance: "التحالف (ZTP، BUG إلخ)", pNickname: "الاسم المستعار", pId: "معرف اللاعب (9 أرقام)", pSpeed: "أيام التسريع", pPass: "كلمة المرور للإلغاء (أي كلمة)", editBtn: "تعديل", cancelBtnSmall: "إلغاء", desBtn: "تاج", delBtn: "حذف", slotOpenBtn: "🔓 فتح هذا الوقت", slotCloseBtn: "🔒 إغلاق هذا الوقت", errFill: "الرجاء إدخال كلمة المرور الخاصة بك في الحقل أدناه أولاً.", errWrongPass: "كلمة المرور خاطئة.", errNoRes: "لم يتم العثور على الحجز.", errFillAll: "يرجى تعبئة جميع الحقول.", errIdDigit: "يجب أن يتكون معرف اللاعب من 9 أرقام بالضبط.", promptEdit: "أدخل أيام التسريع الجديدة (أرقام فقط):", errNan: "الرجاء إدخال رقم صحيح." }
};

function openCustomAlert(msg) {
    var titleEl = document.getElementById("alert-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "⚠️ 안내" : "⚠️ Notice";
    var msgEl = document.getElementById("alertModalMessage");
    if(msgEl) msgEl.innerText = msg;
    document.getElementById("alertModal").classList.add("show");
}

window.customPromptCallback = null;
window.openCustomPrompt = function(msg, defaultVal, callback) {
    var titleEl = document.getElementById("prompt-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "가속 일수 수정" : "Edit Speed-up";
    var msgEl = document.getElementById("promptModalMessage");
    if(msgEl) msgEl.innerText = msg;
    var inputEl = document.getElementById("promptInputValue");
    if(inputEl) inputEl.value = defaultVal || "";
    
    var cancelBtn = document.getElementById("btn-prompt-cancel");
    if (cancelBtn) cancelBtn.innerText = langPack[currentLang].cancelBtnSmall;
    var confirmBtn = document.getElementById("btn-prompt-confirm");
    if (confirmBtn) confirmBtn.innerText = langPack[currentLang].confirmBtn;

    window.customPromptCallback = callback;
    document.getElementById("promptModal").classList.add("show");
    if(inputEl) inputEl.focus();
};

window.closeCustomPrompt = function() {
    document.getElementById("promptModal").classList.remove("show");
    window.customPromptCallback = null;
};

window.confirmCustomPrompt = function() {
    var inputEl = document.getElementById("promptInputValue");
    var val = inputEl ? inputEl.value : "";
    if (window.customPromptCallback) {
        window.customPromptCallback(val);
    }
    window.closeCustomPrompt();
};

window.changeLanguage = function(lang) { currentLang = lang; localStorage.setItem("svs_lang", lang); applyLanguagePack(); window.renderAll(); };

function applyLanguagePack() {
    var p = langPack[currentLang];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = currentLang;
    
    var noticeKoEl = document.getElementById("notice-dynamic-txt");
    if (noticeKoEl) {
        noticeKoEl.innerHTML = p.notice;
    }
    
    var safeSetText = function(id, text) {
        var el = document.getElementById(id);
        if (el) el.innerText = text;
    };
    var safeSetPlaceholder = function(id, placeholder) {
        var el = document.getElementById(id);
        if (el) el.placeholder = placeholder;
    };

    safeSetText("tab-mon-txt", p.mon);
    safeSetText("tab-tue-txt", p.tue);
    safeSetText("tab-thu-txt", p.thu);
    safeSetText("opt-all", p.optAll);
    safeSetText("opt-mine", p.optMine);
    safeSetText("btn-reset-txt", "Reset");
    safeSetText("modal-title-txt", p.addTitle);
    safeSetText("btn-confirm-txt", p.confirmBtn);
    safeSetText("btn-close-txt", p.closeBtn);
    
    safeSetPlaceholder("alliance", p.pAlliance);
    safeSetPlaceholder("player", p.pNickname);
    safeSetPlaceholder("playerId", p.pId);
    safeSetPlaceholder("daysSaved", p.pSpeed);
    safeSetPlaceholder("cancelKey", p.pPass);
    
    safeSetText("res-title-txt", p.statusTitle);
    safeSetText("cancel-label-txt", p.cancelLabel);
    safeSetText("btn-cancel-txt", p.cancelBtn);
    safeSetText("btn-add-txt", p.addBookingBtn);
    safeSetText("btn-res-close-txt", p.closeBtn);
    
    var curvedEl = document.getElementById("curved-profile-txt");
    if (curvedEl) curvedEl.textContent = p.curvedTxt;
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
        if(slot && slot.attendees) {
            slot.attendees.forEach(function(a) { if (normalizeText(a.player) === myName && a.isDesignated) { var parts = slotId.split("_"); confirmedTracks.push({ day: parts[0], time: parts[1], slotId: slotId }); } });
        }
    });
    if (confirmedTracks.length === 0) { el.style.display = "none"; return; }
    var dayOrder = { monday: 1, tuesday: 2, thursday: 4 };
    confirmedTracks.sort(function(a, b) { return dayOrder[a.day] - dayOrder[b.day]; });
    listEl.innerHTML = "";
    var p = langPack[currentLang];
    confirmedTracks.forEach(function(track) {
        var card = document.createElement("div"); card.className = "confirmedCard";
        var dayTxt = p[track.day + "Short"];
        var displayTime = dayTxt + " " + track.time + " UTC";
        
        var timeSpan = document.createElement("span"); timeSpan.className = "confirmedTime"; timeSpan.innerText = displayTime;
        var calBtn = document.createElement("button"); calBtn.type = "button"; calBtn.className = "btn-cal"; calBtn.innerText = p.addAlarm;
        calBtn.onclick = function() { var url = getGoogleCalendarUrl(track.day, track.time); window.open(url, "_blank"); };
        card.appendChild(timeSpan); card.appendChild(calBtn); listEl.appendChild(card);
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
            if (filter === "mine" && !slot.attendees.some(function(a) { return normalizeText(a.player) === normalizeText(localStorage.getItem(MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(MY_BOOKING_KEY)).player : ""); })) continue;
            
            var isSpecificallyClosed = bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id);
            var effectivelyOpen = isOpen && !isSpecificallyClosed;
            
            var div = document.createElement("div"); 
            var slotClass = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "") + (slot.attendees.some(function(a) { return normalizeText(a.player) === normalizeText(localStorage.getItem(MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(MY_BOOKING_KEY)).player : ""); }) ? " myReservation" : "");
            div.className = slotClass;
            
            var displayList = (slot.attendees || []).slice().sort(function(a, b) { return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0); });
            
            var listHtml = displayList.slice(0,3).map(function(a, i) { 
                var speedText = showSpeeds ? "(" + a.daysSaved + p.speedUnit + ")" : "";
                var crownText = a.isDesignated ? "👑 " : (i+1) + ". ";
                var itemClass = a.isDesignated ? "miniItem is-designated" : "miniItem";
                return "<div class='" + itemClass + "'><span>" + crownText + "[" + a.alliance + "] " + a.player + "</span><span style='font-weight:700;'> " + speedText + "</span></div>"; 
            }).join('');
            
            var lockMark = isSpecificallyClosed ? " <span style='color:red;'>🔒</span>" : "";
            div.innerHTML = "<div class=\"dayBadge\">" + badgeDay + "</div><div class=\"timeRow\"><span>" + tId + "~" + eId + " UTC" + lockMark + "</span><span style=\"color:#d34b4b;\">" + slot.attendees.length + p.pers + "</span></div><div class=\"localTime\">Local: " + formatLocalTime(new Date(new Date().setUTCHours(h,m,0,0))) + "</div><div class=\"attendeeMiniList\">" + (listHtml || p.noRes) + "</div>";
            
            (function(savedId, savedOpen) {
                div.onclick = function() { window.handleSlotClick(savedId, savedOpen); };
            })(id, effectivelyOpen);
            
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

window.toggleTabStatus = function(day) { if (!window.db) return; var newStatus = !bookingSettings.tabs[day].isOpen; var path = "tabs." + day + ".isOpen"; var obj = {}; obj[path] = newStatus; window.db.collection("settings").doc("booking").update(obj); };
window.toggleSpeedVisibility = function(day) { if (!window.db) return; var newStatus = !(bookingSettings.tabs[day].showSpeeds || false); var path = "tabs." + day + ".showSpeeds"; var obj = {}; obj[path] = newStatus; window.db.collection("settings").doc("booking").update(obj); };
window.toggleSpecificSlot = function(slotId) { if (!window.db) return; var closedList = bookingSettings.closedSlots || []; if (closedList.includes(slotId)) closedList = closedList.filter(function(s) { return s !== slotId; }); else closedList.push(slotId); window.db.collection("settings").doc("booking").update({ closedSlots: closedList }).then(function() { openReservedModal(slotId); }); };
window.toggleDesignateById = function(slotId, uniqueId) { if (!window.db) return; var ref = window.db.collection("slots").doc(slotId); ref.get().then(function(doc) { if (!doc.exists) return; var list = doc.data().attendees || []; var target = list.find(function(a) { return String(a.id) === String(uniqueId); }); if (!target) return; var nextState = !target.isDesignated; list.forEach(function(a) { a.isDesignated = (String(a.id) === String(uniqueId)) ? nextState : false; }); ref.update({ attendees: list }).then(function() { openReservedModal(slotId); }); }); };
window.deleteAttendeeById = function(slotId, uniqueId) { if (!confirm("Delete?")) return; var ref = window.db.collection("slots").doc(slotId); ref.get().then(function(doc) { var list = doc.data().attendees.filter(function(a) { return String(a.id) !== String(uniqueId); }); ref.update({ attendees: list }).then(function() { openReservedModal(slotId); }); }); };
window.exportAllCSV = function() { try { if (typeof XLSX === 'undefined') return openCustomAlert("XLSX Loading..."); var wb = XLSX.utils.book_new(); ["monday", "tuesday", "thursday"].forEach(function(day) { var rows = []; Object.keys(allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(function(slotId) { var timeStr = slotId.split('_')[1]; allSlotsData[slotId].attendees.forEach(function(a) { rows.push({ "Day": day, "Time(UTC)": timeStr, "Alliance": a.alliance, "Nickname": a.player, "PlayerID": a.playerId, "SpeedDays": a.daysSaved, "Designated": a.isDesignated ? "Y" : "N" }); }); }); if (rows.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); }); XLSX.writeFile(wb, "2737_SVS_Booking.xlsx"); } catch (e) { openCustomAlert("Failed."); } };

window.confirmBooking = function() {
    var p = langPack[currentLang];
    var a = document.getElementById("alliance").value, nickname = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    if(!a || !nickname || !idNum || !d || !pass) return openCustomAlert(p.errFillAll);
    if(idNum.length !== 9) return openCustomAlert(p.errIdDigit);
    var entryId = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    var newEntry = { id: entryId, alliance: a, player: nickname, playerId: idNum, playerNormalized: normalizeText(nickname), daysSaved: Number(d), passwordHash: simpleHash(pass), isDesignated: false, createdAt: Date.now() };
    window.db.collection("slots").doc(selectedSlot).set({ attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) }, {merge: true}).then(function() { localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: nickname, playerId: idNum, cancelKey: pass })); window.closeModal(); window.renderAll(); });
};

window.editSpecificBooking = function(slotId, uniqueId) {
    var p = langPack[currentLang], pass = document.getElementById("editCancelKey").value;
    if(!pass) return openCustomAlert(p.errFill);
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return String(a.id) === String(uniqueId); });
        if(!target) return openCustomAlert(p.errNoRes);
        if (target.passwordHash !== simpleHash(pass)) return openCustomAlert(p.errWrongPass);
        
        window.openCustomPrompt(p.promptEdit, target.daysSaved, function(newDays) {
            if(newDays === null || newDays.trim() === "") return;
            if(isNaN(newDays)) return openCustomAlert(p.errNan);
            target.daysSaved = Number(newDays);
            ref.update({ attendees: list }).then(function() { openReservedModal(slotId); window.renderAll(); });
        });
    });
};

window.confirmCancelSpecific = function(uniqueId) {
    var p = langPack[currentLang], pass = document.getElementById("editCancelKey").value;
    if(!pass) return openCustomAlert(p.errFill);
    var ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return String(a.id) === String(uniqueId); });
        if(!target) return openCustomAlert(p.errNoRes);
        if (target.passwordHash !== simpleHash(pass)) return openCustomAlert(p.errWrongPass);
        var updatedList = list.filter(function(a) { return String(a.id) !== String(uniqueId); });
        ref.update({ attendees: updatedList }).then(function() { window.closeReservedModal(); window.renderAll(); });
    });
};

window.confirmCancelAll = function() {
    var p = langPack[currentLang], pass = document.getElementById("editCancelKey").value, m = localStorage.getItem(MY_BOOKING_KEY);
    if(!pass) return openCustomAlert(p.errFill);
    if(!m) return openCustomAlert(p.errNoRes);
    var mine = JSON.parse(m), myName = normalizeText(mine.player);
    var ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        var myEntries = list.filter(function(a) { return normalizeText(a.player) === myName; });
        if (myEntries.length === 0) return openCustomAlert(p.errNoRes);
        var isPassCorrect = myEntries.some(function(a) { return a.passwordHash === simpleHash(pass); });
        if (!isPassCorrect) return openCustomAlert(p.errWrongPass);
        var updatedList = list.filter(function(a) { return !(normalizeText(a.player) === myName && a.passwordHash === simpleHash(pass)); });
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
window.openReserveModal = function() { var m = localStorage.getItem(MY_BOOKING_KEY); if(m) { var mine = JSON.parse(m); document.getElementById("alliance").value = mine.alliance || ""; document.getElementById("player").value = mine.player || ""; document.getElementById("playerId").value = mine.playerId || ""; document.getElementById("cancelKey").value = mine.cancelKey || ""; } document.getElementById("selectedSlotInfo").innerText = selectedSlot.replace('_', ' ') + " UTC"; document.getElementById("modal").classList.add("show"); };

window.openReservedModal = function(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); 
    list.innerHTML = ""; 
    
    var p = langPack[currentLang];
    var m = localStorage.getItem(MY_BOOKING_KEY);
    var mineName = m ? normalizeText(JSON.parse(m).player) : "";
    
    var isSpecificallyClosed = bookingSettings.closedSlots && bookingSettings.closedSlots.includes(id);
    var effectivelyOpen = isTabActuallyOpen(currentBuff) && !isSpecificallyClosed;

    if (adminAuthenticated) {
        var toggleCloseBtn = document.createElement("button");
        toggleCloseBtn.innerText = effectivelyOpen ? p.slotCloseBtn : p.slotOpenBtn;
        toggleCloseBtn.className = effectivelyOpen ? "btn-danger" : "btn-primary";
        toggleCloseBtn.style.padding = "8px 16px"; toggleCloseBtn.style.fontSize = "12px"; toggleCloseBtn.style.fontWeight = "800"; toggleCloseBtn.style.width = "100%"; toggleCloseBtn.style.marginBottom = "15px"; toggleCloseBtn.style.borderRadius = "8px"; toggleCloseBtn.style.border = "none"; toggleCloseBtn.style.cursor = "pointer";
        toggleCloseBtn.onclick = function() { window.toggleSpecificSlot(id); };
        list.appendChild(toggleCloseBtn);
        
        var hr = document.createElement("hr"); hr.style.marginBottom = "15px"; list.appendChild(hr);
    }
    
    var slot = allSlotsData[id] || { attendees: [] };
    
    if (!effectivelyOpen && !adminAuthenticated) { 
        list.innerHTML = "<div style='padding:20px; font-weight:800; color:#e53935; text-align:center;'>" + p.closedAlert + "</div>"; 
    } else if (slot.attendees.length === 0 && !adminAuthenticated) { 
        window.closeReservedModal(); window.openReserveModal(); return; 
    } else {
        var displayList = (slot.attendees || []).slice().sort(function(a, b) { return (b.isDesignated ? 1 : 0) - (a.isDesignated ? 1 : 0); });
        
        displayList.forEach(function(a) { 
            var d = document.createElement("div"); 
            d.className = a.isDesignated ? "miniItem is-designated" : "miniItem"; 
            d.style.display = "flex"; d.style.justifyContent = "space-between"; d.style.alignItems = "center"; d.style.margin = "4px 0";
            
            var mainWrapper = document.createElement("div");
            mainWrapper.style.display = "flex"; mainWrapper.style.justifyContent = "space-between"; mainWrapper.style.width = "100%"; mainWrapper.style.alignItems = "center";
            
            var textSpan = document.createElement("span");
            textSpan.innerHTML = (a.isDesignated ? "👑 " : "") + "[" + a.alliance + "] " + a.player;
            
            var speedSpan = document.createElement("span");
            speedSpan.innerHTML = " (" + a.daysSaved + "d)";
            
            mainWrapper.appendChild(textSpan); mainWrapper.appendChild(speedSpan);
            d.appendChild(mainWrapper);
            
            var btnGroup = document.createElement("div");
            btnGroup.style.display = "flex"; btnGroup.style.gap = "4px"; btnGroup.style.marginLeft = "10px";
            
            if (!adminAuthenticated && normalizeText(a.player) === mineName) {
                var userEditBtn = document.createElement("button");
                userEditBtn.type = "button"; userEditBtn.innerText = p.editBtn; userEditBtn.className = "btn-primary";
                userEditBtn.style.padding = "4px 8px"; userEditBtn.style.fontSize = "11px"; userEditBtn.style.flex = "none"; userEditBtn.style.width = "auto";
                userEditBtn.onclick = function() { window.editSpecificBooking(id, a.id); };
                btnGroup.appendChild(userEditBtn);

                var userDelBtn = document.createElement("button");
                userDelBtn.type = "button"; userDelBtn.innerText = p.cancelBtnSmall; userDelBtn.className = "btn-danger";
                userDelBtn.style.padding = "4px 8px"; userDelBtn.style.fontSize = "11px"; userDelBtn.style.flex = "none"; userDelBtn.style.width = "auto";
                userDelBtn.onclick = function() { window.confirmCancelSpecific(a.id); };
                btnGroup.appendChild(userDelBtn);
            }
            
            if (adminAuthenticated) { 
                var desBtn = document.createElement("button"); desBtn.innerText = a.isDesignated ? "해제" : p.desBtn; desBtn.className = "btn-primary"; desBtn.style.padding = "4px 8px"; desBtn.style.fontSize = "11px"; desBtn.style.flex = "none"; desBtn.style.width = "auto"; desBtn.onclick = function() { window.toggleDesignateById(id, a.id); }; btnGroup.appendChild(desBtn);
                var delBtn = document.createElement("button"); delBtn.innerText = p.delBtn; delBtn.className = "btn-danger"; delBtn.style.padding = "4px 8px"; delBtn.style.fontSize = "11px"; delBtn.style.flex = "none"; delBtn.style.width = "auto"; delBtn.onclick = function() { window.deleteAttendeeById(id, a.id); }; btnGroup.appendChild(delBtn); 
            } 
            
            if(btnGroup.childNodes.length > 0) d.appendChild(btnGroup);
            list.appendChild(d); 
        }); 
    }
    
    var htmlCancelArea = document.querySelector("#reservedModal .cancelArea");
    if(htmlCancelArea) {
        htmlCancelArea.style.display = (adminAuthenticated || effectivelyOpen) ? "block" : "none";
        var pwdInput = document.getElementById("editCancelKey");
        if(pwdInput) pwdInput.value = ""; 
    }

    document.getElementById("reservedModal").classList.add("show"); 
};

init();

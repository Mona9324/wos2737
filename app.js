var currentBuff = "monday";
var selectedSlot = null;
var allSlotsData = {};
var MY_BOOKING_KEY = "svs_my_booking_info";
var currentLang = localStorage.getItem("svs_lang") || "en"; 

var bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    globalCloseTime: "", 
    closedSlots: [], 
    adminLogs: [], 
    minSpeeds: { wed: 50, thu: 30, fri: 15 }, 
    tabs: { 
        monday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false }, 
        tuesday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false }, 
        thursday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false } 
    } 
};
var adminAuthenticated = false;
var sc = 0;

var langPack = {
    ko: { 
        notice: "📢 요일별 1인 1타임만 예약 가능합니다.", 
        speedCond: "[예약 오픈 조건] 수요일: 가속 {wed}일 이상 | 목요일: {thu}일 이상 | 금요일: {fri}일 이상 | 토~일요일: 자유 예약",
        langHelp: "(상단 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1", confirmedHeader: "👑 내 예약 시간", addAlarm: "🔔 알람 등록", 
        mon: "월요일 (건설)", tue: "화요일 (연구)", thu: "목요일 (훈련)", 
        mondayShort: "월요일", tuesdayShort: "화요일", thursdayShort: "목요일", 
        optAll: "전체 / All", optMine: "내 예약 / Mine", 
        openAvailable: "✅ 예약 가능", openClosed: "🔒 예약 마감", pers: "명", noRes: "예약 가능", 
        addTitle: "새 예약 추가", confirmBtn: "확정", closeBtn: "닫기", statusTitle: "예약 현황", 
        cancelLabel: "취소 비밀번호", cancelBtn: "예약 취소", addBookingBtn: "예약 추가", 
        closedAlert: "예약 마감되었습니다.", speedUnit: "일", 
        pAlliance: "연맹 (ZYZ, BUG, ZTP 등)", pNickname: "닉네임", pId: "플레이어 ID (9자리)", pSpeed: "가속 일수", pPass: "예약취소를 위한 비밀번호 (아무거나)", 
        editBtn: "수정", cancelBtnSmall: "취소", delBtn: "삭제", slotOpenBtn: "🔓 예약 열기", slotCloseBtn: "🔒 예약 마감", 
        errFill: "비밀번호 칸에 비밀번호를 먼저 입력해주세요.", errWrongPass: "비밀번호가 올바르지 않습니다.", 
        errNoRes: "삭제할 예약 데이터를 찾을 수 없습니다.", errFillAll: "모든 항목을 입력해야 합니다.", 
        errIdDigit: "플레이어 ID는 반드시 숫자 9자리여야 합니다.", promptEdit: "새로운 가속 일수(숫자만)를 입력하세요:", 
        errNan: "숫자 형식만 입력 가능합니다.", promptDelete: "정말 삭제하시겠습니까?", 
        promptClear: "모든 예약 데이터를 삭제하시겠습니까?<br />(이 작업은 관리자 로그에 기록됩니다)", 
        btnAdminDel: "🚨 모든 예약 삭제", promptSaved: "저장되었습니다!",
        admTitle: "👑 관리자 시스템", admBase: "SVS 기준일 설정", admSave: "저장", admManual: "예약 수동 제어", admVis: "가속 일수 공개 제어", admLimits: "요일별 최소 가속 조건 조절", admAuto: "자동 시간 설정", admOpenAll: "전체 오픈:", admCloseAll: "전체 마감:", admSaveSched: "스케줄 저장", admExcel: "엑셀 추출", admClose: "닫기"
    },
    en: { 
        notice: "📢 1 Booking Per Person Per Day.", 
        speedCond: "[Requirements] Wed: {wed}d+ | Thu: {thu}d+ | Fri: {fri}d+ | Sat~Sun: Free Booking",
        langHelp: "(You can change the language using the menu above.)",
        curvedTxt: "The website usage fee is Mona's Island 💚+1", confirmedHeader: "👑 My Booked Buffs", addAlarm: "🔔 Add Alarm", 
        mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)", 
        mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday", optAll: "All", optMine: "My Booking", 
        openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed", pers: "Pers.", noRes: "Available", 
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close", statusTitle: "Booking Status", cancelLabel: "Password", 
        cancelBtn: "Cancel Booking", addBookingBtn: "Add Booking", closedAlert: "Reservation Closed.", speedUnit: "d", 
        pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password for cancellation (any password)", 
        editBtn: "Edit", cancelBtnSmall: "Cancel", delBtn: "Delete", slotOpenBtn: "🔓 Open", slotCloseBtn: "🔒 Close", 
        errFill: "Please enter your password first.", errWrongPass: "Wrong password.", errNoRes: "Reservation not found.", errFillAll: "Please fill all fields.", errIdDigit: "ID must be exactly 9 digits.", promptEdit: "Enter new speed-up days:", errNan: "Invalid number.", promptDelete: "Are you sure?", 
        promptClear: "Delete all booking data?<br />(This action will be logged)", 
        btnAdminDel: "🚨 Clear All Bookings", promptSaved: "Saved!",
        admTitle: "👑 Admin System", admBase: "Set Base Date", admSave: "Save", admManual: "Manual Booking Control", admVis: "Speed-up Visibility", admLimits: "Dynamic Speed Limits", admAuto: "Auto Schedule", admOpenAll: "Open All:", admCloseAll: "Close All:", admSaveSched: "Save Schedule", admExcel: "Excel Export", admClose: "Close"
    },
    zh: { 
        notice: "📢 每人每天限预约1次。", 
        speedCond: "[条件] 周三: 加速 {wed}天+ | 周四: {thu}天+ | 周五: {fri}天+ | 周六~周日: 自由预约",
        langHelp: "(您可以上方菜单更改语言)",
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1", confirmedHeader: "👑 我的确定的增益时间", addAlarm: "🔔 添加提醒", mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)", mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四", optAll: "全部", optMine: "我的预约", openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止", pers: "人", noRes: "预约开放", addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭", statusTitle: "预约状态", cancelLabel: "取消密码", cancelBtn: "取消预约", addBookingBtn: "添加预约", closedAlert: "预约已截止。", speedUnit: "天", pAlliance: "联盟 (ZYZ, BUG, ZTP 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消密码 (任意)", editBtn: "修改", cancelBtnSmall: "取消", delBtn: "删除", slotOpenBtn: "🔓 开放", slotCloseBtn: "🔒 关闭", errFill: "请先在下方输入您的密码。", errWrongPass: "密码错误。", errNoRes: "找不到预约数据。", errFillAll: "必须填写所有字段。", errIdDigit: "玩家ID必须为9位数字。", promptEdit: "请输入新的加速天数（仅限数字）:", errNan: "只能输入数字格式。", promptDelete: "确定要删除吗？", promptClear: "确定要删除所有预约数据吗？<br />（此操作将被记录）", btnAdminDel: "🚨 删除所有预约", promptSaved: "已保存！",
        admTitle: "👑 管理员系统", admBase: "设置基准日期", admSave: "保存", admManual: "手动预约控制", admVis: "加速可见性控制", admLimits: "最低加速条件调整", admAuto: "自动时间设置", admOpenAll: "全开时间:", admCloseAll: "全关时间:", admSaveSched: "保存时间表", admExcel: "导出Excel", admClose: "关闭"
    },
    fr: { 
        notice: "📢 1 Réservation par personne et par jour.", 
        speedCond: "[Req] Mer: {wed}j+ | Jeu: {thu}j+ | Ven: {fri}j+ | Sam~Dim: Libre",
        langHelp: "(Modifiez la langue via le menu ci-dessus.)",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1", confirmedHeader: "👑 Mes Buffs Confirmés", addAlarm: "🔔 Alarme", mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)", mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi", optAll: "Tout", optMine: "Mes Réservations", openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée", pers: "Pers.", noRes: "Disponible", addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer", statusTitle: "Statut de Réservation", cancelLabel: "Mot de passe", cancelBtn: "Annuler la réservation", addBookingBtn: "Ajouter Réservation", closedAlert: "Réservation fermée.", speedUnit: "j", pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Beta", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe", editBtn: "Modifier", cancelBtnSmall: "Annuler", delBtn: "Supprimer", slotOpenBtn: "🔓 Ouvrir", slotCloseBtn: "🔒 Fermer", errFill: "Saisissez votre mot de passe.", errWrongPass: "Mot de passe incorrect.", errNoRes: "Réservation introuvable.", errFillAll: "Veuillez remplir tous les champs.", errIdDigit: "L'identifiant doit comporter 9 chiffres.", promptEdit: "Modifier:", errNan: "Invalide.", promptDelete: "Supprimer ?", promptClear: "Effacer toutes les réservations ?<br />(Cette action sera enregistrée)", btnAdminDel: "🚨 Supprimer tout", promptSaved: "Enregistré !",
        admTitle: "👑 Système d'administration", admBase: "Définir la date", admSave: "Enregistrer", admManual: "Contrôle manuel", admVis: "Visibilité des accélérations", admLimits: "Limites dynamiques", admAuto: "Planification", admOpenAll: "Ouvrir tout:", admCloseAll: "Fermer tout:", admSaveSched: "Sauvegarder", admExcel: "Exporter Excel", admClose: "Fermer"
    },
    ja: { 
        notice: "📢 曜日別1人1回のみ予約可能です。", 
        speedCond: "[条件] 水曜日: 加速 {wed}日+ | 木曜日: {thu}日+ | 金曜日: {fri}日+ | 土~日曜日: 自由予約",
        langHelp: "(上部メニューから言語を変更できます)",
        curvedTxt: "予約サイトの利用料は : Monaの島 💚+1", confirmedHeader: "👑 確定した大統領バフ時間", addAlarm: "🔔 アラーム登録", mon: "月曜日", tue: "火曜日", thu: "木曜日", mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日", optAll: "すべて", optMine: "自分の予約", openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了", pers: "人", noRes: "予約可能", addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる", statusTitle: "予約状況", cancelLabel: "パスワード", cancelBtn: "予約取消", addBookingBtn: "追加", closedAlert: "締め切られました。", speedUnit: "日", pAlliance: "同盟 (ZYZ, BUG, ZTP)", pNickname: "名前", pId: "プレイヤーID", pSpeed: "加速日数", pPass: "パスワード", editBtn: "修正", cancelBtnSmall: "取消", delBtn: "削除", slotOpenBtn: "🔓 開く", slotCloseBtn: "🔒 閉じる", errFill: "パスワードを入力してください。", errWrongPass: "不正。", errNoRes: "見つかりません。", errFillAll: "すべて入力。", errIdDigit: "9桁の数字。", promptEdit: "修正:", errNan: "不正。", promptDelete: "削除？", promptClear: "すべての予約データを削除しますか？<br />（この操作はログに記録されます）", btnAdminDel: "🚨 全ての予約を削除", promptSaved: "保存されました！",
        admTitle: "👑 管理者システム", admBase: "基準日の設定", admSave: "保存", admManual: "手動予約制御", admVis: "加速表示制御", admLimits: "最小加速条件調整", admAuto: "自動スケジュール", admOpenAll: "一括オープン:", admCloseAll: "一括クローズ:", admSaveSched: "スケジュール保存", admExcel: "Excel抽出", admClose: "閉じる"
    },
    id: { 
        notice: "📢 1 Pesanan Per Orang Per Hari.", 
        speedCond: "[Syarat] Rabu: Speed-up {wed}h+ | Kamis: {thu}h+ | Jumat: {fri}h+ | Sabtu~Minggu: Bebas",
        langHelp: "(Ubah bahasa menggunakan menu di atas.)",
        curvedTxt: "Biaya penggunaan Pulau Mona 💚+1", confirmedHeader: "👑 Buff Saya", addAlarm: "🔔 Pasang Alarm", mon: "Senin", tue: "Selasa", thu: "Kamis", mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis", optAll: "Semua", optMine: "Pesanan Saya", openAvailable: "✅ Buka", openClosed: "🔒 Tutup", pers: "Orang", noRes: "Tersedia", addTitle: "Tambah Pesanan", confirmBtn: "Konfirmasi", closeBtn: "Tutup", statusTitle: "Status", cancelLabel: "Kata Sandi", cancelBtn: "Batalkan Pesanan", addBookingBtn: "Tambah", closedAlert: "Ditutup.", speedUnit: "hari", pAlliance: "Aliansi (ZYZ, BUG, ZTP etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi", editBtn: "Ubah", cancelBtnSmall: "Batal", delBtn: "Hapus", slotOpenBtn: "🔓 Buka", slotCloseBtn: "🔒 Tutup", errFill: "Masukkan kata sandi.", errWrongPass: "Salah.", errNoRes: "Tidak ditemukan.", errFillAll: "Harus diisi.", errIdDigit: "ID harus 9 digit.", promptEdit: "Ubah:", errNan: "Harus angka.", promptDelete: "Hapus?", promptClear: "Hapus semua data pesanan?<br />(Tindakan ini akan dicatat)", btnAdminDel: "🚨 Hapus Semua Pesanan", promptSaved: "Tersimpan!",
        admTitle: "👑 Sistem Admin", admBase: "Atur Tanggal Dasar", admSave: "Simpan", admManual: "Kontrol Pesanan Manual", admVis: "Visibilitas Speed-up", admLimits: "Batas Speed-up Dinamis", admAuto: "Jadwal Otomatis", admOpenAll: "Buka Semua:", admCloseAll: "Tutup Semua:", admSaveSched: "Simpan Jadwal", admExcel: "Ekspor Excel", admClose: "Tutup"
    },
    tr: { 
        notice: "📢 Kişi başına günde 1 rezervasyon.", 
        speedCond: "[Şartlar] Çarş: {wed}g+ | Perş: {thu}g+ | Cuma: {fri}g+ | Cmt~Paz: Serbest",
        langHelp: "(Yukarıdaki menüyü kullanarak dili değiştirin.)",
        curvedTxt: "Mona'nın Adası 💚+1", confirmedHeader: "👑 Onaylanmış Bufflarım", addAlarm: "🔔 Alarm Ekle", mon: "Pazartesi", tue: "Salı", thu: "Perşembe", mondayShort: "Pazartesi", tuesdayShort: "Salı", thursdayShort: "Perşembe", optAll: "Tümü", optMine: "Rezervasyonum", openAvailable: "✅ Açık", openClosed: "🔒 Kapalı", pers: "Kişi", noRes: "Müsait", addTitle: "Yeni Rezervasyon", confirmBtn: "Onayla", closeBtn: "Kapat", statusTitle: "Durum", cancelLabel: "Şifre", cancelBtn: "Rezervasyonu İptal Et", addBookingBtn: "Ekle", closedAlert: "Kapandı.", speedUnit: "g", pAlliance: "İttifak (ZYZ, BUG, ZTP vb.)", pNickname: "Kullanıcı Adı", pId: "Oyuncu ID", pSpeed: "Hızlandırma", pPass: "İptal Şifresi", editBtn: "Düzenle", cancelBtnSmall: "İptal", delBtn: "Sil", slotOpenBtn: "🔓 Aç", slotCloseBtn: "🔒 Kapat", errFill: "Şifre giriniz.", errWrongPass: "Yanlış.", errNoRes: "Bulunamadı.", errFillAll: "Doldurunuz.", errIdDigit: "ID 9 haneli olmalıdır.", promptEdit: "Düzenle:", errNan: "Geçersiz.", promptDelete: "Sil?", promptClear: "Tüm rezervasyon verilerini sil?<br />(Bu işlem kaydedilecektir)", btnAdminDel: "🚨 Tüm Rezervasyonları Sil", promptSaved: "Kaydedildi!",
        admTitle: "👑 Yönetici Paneli", admBase: "Tarihi Ayarla", admSave: "Kaydet", admManual: "Manuel Rezervasyon Kontrolü", admVis: "Hızlandırma Görünürlüğü", admLimits: "Dinamik Hız Sınırları", admAuto: "Otomatik Planlama", admOpenAll: "Tümünü Aç:", admCloseAll: "Tümünü Kapat:", admSaveSched: "Programı Kaydet", admExcel: "Excel Aktar", admClose: "Kapat"
    },
    ar: { 
        notice: "📢 حجز واحد للشخص الواحد في اليوم.", 
        speedCond: "[الشروط] الأربعاء: {wed} ي+ | الخميس: {thu} ي+ | الجمعة: {fri} ي+ | السبت~الأحد: حجز حر",
        langHelp: "(قم بتغيير اللغة باستخدام القائمة أعلاه.)",
        curvedTxt: "جزيرة منى 💚+1", confirmedHeader: "👑 حجوزاتي المؤكدة", addAlarm: "🔔 منبه", mon: "الاثنين", tue: "الثلاثاء", thu: "الخميس", mondayShort: "الاثنين", tuesdayShort: "الثلاثاء", thursdayShort: "الخميس", optAll: "الكل", optMine: "حجوزاتي", openAvailable: "✅ مفتوح", openClosed: "🔒 مغلق", pers: "أشخاص", noRes: "متاح", addTitle: "حجز جديد", confirmBtn: "تأكيد", closeBtn: "إغلاق", statusTitle: "الحالة", cancelLabel: "كلمة المرور", cancelBtn: "إلغاء الحجز", addBookingBtn: "إضافة", closedAlert: "مغلق.", speedUnit: "ي", pAlliance: "التحالف (ZYZ, BUG, ZTP إلخ)", pNickname: "الاسم", pId: "معرف اللاعب", pSpeed: "أيام التسريع", pPass: "كلمة المرور", editBtn: "تعديل", cancelBtnSmall: "إلغاء", delBtn: "حذف", slotOpenBtn: "🔓 فتح", slotCloseBtn: "🔒 إغلاق", errFill: "أدخل كلمة المرور.", errWrongPass: "خطأ.", errNoRes: "غير موجود.", errFillAll: "مطلوب.", errIdDigit: "يجب 9 أرقام.", promptEdit: "تعديل:", errNan: "غير صحيح.", promptDelete: "حذف؟", promptClear: "هل أنت متأكد من حذف جميع بيانات الحجز؟<br />(سيتم تسجيل هذا الإجراء)", btnAdminDel: "🚨 حذف جميع الحجوزات", promptSaved: "تم!",
        admTitle: "👑 نظام المشرف", admBase: "تعيين التاريخ الأساسي", admSave: "حفظ", admManual: "التحكم اليدوي في الحجز", admVis: "التحكم في رؤية التسريع", admLimits: "تعديل شروط الحد الأدنى", admAuto: "الجدولة التلقائية", admOpenAll: "فتح الكل:", admCloseAll: "إغلاق الكل:", admSaveSched: "حفظ الجدول", admExcel: "تصدير إكسل", admClose: "إغلاق"
    }
};

function padTime(h, m) { return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function getLocalTimeStr(h, m) {
    var d = new Date(Date.UTC(2020, 0, 1, h, m, 0));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function normalizeText(v) { return String(v || "").trim().toLowerCase(); }
function simpleHash(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); }

function getMainSpeedRequired() {
    var day = new Date().getDay(); 
    var speeds = bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    if (day === 3) return Number(speeds.wed || 0); 
    if (day === 4) return Number(speeds.thu || 0); 
    if (day === 5) return Number(speeds.fri || 0); 
    return 0; 
}

function openCustomAlert(msg) {
    var titleEl = document.getElementById("alert-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "⚠️ 안내" : "⚠️ Notice";
    var msgEl = document.getElementById("alertModalMessage");
    if(msgEl) msgEl.innerHTML = msg; 
    var modal = document.getElementById("alertModal");
    if(modal) modal.classList.add("show");
}

window.customConfirmCallback = null;
window.openCustomConfirm = function(msg, callback) {
    var titleEl = document.getElementById("confirm-modal-title");
    if(titleEl) titleEl.innerText = currentLang === 'ko' ? "⚠️ 확인" : "⚠️ Confirm";
    var msgEl = document.getElementById("confirmModalMessage");
    if(msgEl) msgEl.innerHTML = msg; 
    
    var cancelBtn = document.getElementById("btn-confirm-cancel");
    if (cancelBtn) cancelBtn.innerText = langPack[currentLang].cancelBtnSmall || "Cancel";
    var okBtn = document.getElementById("btn-confirm-ok");
    if (okBtn) okBtn.innerText = langPack[currentLang].confirmBtn || "Confirm";

    window.customConfirmCallback = callback;
    var modal = document.getElementById("confirmModal");
    if(modal) modal.classList.add("show");
};
window.closeCustomConfirm = function() {
    var modal = document.getElementById("confirmModal");
    if(modal) modal.classList.remove("show");
    window.customConfirmCallback = null;
};
window.executeCustomConfirm = function() {
    if (window.customConfirmCallback) { window.customConfirmCallback(); }
    window.closeCustomConfirm();
};

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
    var modal = document.getElementById("promptModal");
    if(modal) modal.classList.add("show");
    if(inputEl) inputEl.focus();
};

window.closeCustomPrompt = function() {
    var modal = document.getElementById("promptModal");
    if(modal) modal.classList.remove("show");
    window.customPromptCallback = null;
};

window.confirmCustomPrompt = function() {
    var inputEl = document.getElementById("promptInputValue");
    var val = inputEl ? inputEl.value : "";
    if (window.customPromptCallback) { window.customPromptCallback(val); }
    window.closeCustomPrompt();
};

window.changeLanguage = function(lang) { currentLang = lang; localStorage.setItem("svs_lang", lang); applyLanguagePack(); window.renderAll(); };

function applyLanguagePack() {
    var p = langPack[currentLang] || langPack['en'];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = currentLang;
    
    var speeds = bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    var noticeKoEl = document.getElementById("notice-dynamic-txt");
    if (noticeKoEl) { 
        var rawTemplate = p.speedCond || "";
        var convertedTemplate = rawTemplate
            .replace("{wed}", speeds.wed)
            .replace("{thu}", speeds.thu)
            .replace("{fri}", speeds.fri);
            
        noticeKoEl.innerHTML = p.notice + "<br /><span style='color: #2d3748; font-weight: bold;'>" + convertedTemplate + "</span>";
    }
    
    var safeSetText = function(id, text) { var el = document.getElementById(id); if (el) el.innerText = text; };
    var safeSetPlaceholder = function(id, placeholder) { var el = document.getElementById(id); if (el) el.placeholder = placeholder; };

    safeSetText("tab-mon-txt", p.mon); safeSetText("tab-tue-txt", p.tue); safeSetText("tab-thu-txt", p.thu);
    safeSetText("opt-all", p.optAll); safeSetText("opt-mine", p.optMine); safeSetText("btn-reset-txt", "Reset");
    safeSetText("modal-title-txt", p.addTitle); safeSetText("btn-confirm-txt", p.confirmBtn); safeSetText("btn-close-txt", p.closeBtn);
    
    safeSetText("lang-help-msg", p.langHelp);

    safeSetText("adm-title-main", p.admTitle);
    safeSetText("adm-base-title", p.admBase);
    safeSetText("adm-base-save-btn", p.admSave);
    safeSetText("adm-manual-title", p.admManual);
    safeSetText("adm-visibility-title", p.admVis);
    safeSetText("adm-limits-title", p.admLimits);
    safeSetText("adm-schedule-title", p.admAuto);
    safeSetText("adm-open-all-lbl", p.admOpenAll);
    safeSetText("adm-close-all-lbl", p.admCloseAll);
    safeSetText("adm-schedule-save-btn", p.admSaveSched);
    safeSetText("adm-excel-btn", p.admExcel);
    safeSetText("adm-close-panel-btn", p.admClose);
    
    safeSetText("btn-admin-monday", p.mondayShort); 
    safeSetText("btn-admin-tuesday", p.tuesdayShort); 
    safeSetText("btn-admin-thursday", p.thursdayShort);
    safeSetText("btn-speed-monday", p.mondayShort); 
    safeSetText("btn-speed-tuesday", p.tuesdayShort); 
    safeSetText("btn-speed-thursday", p.thursdayShort);
    safeSetText("btn-admin-clear-all", p.btnAdminDel);
    
    safeSetPlaceholder("alliance", p.pAlliance); safeSetPlaceholder("player", p.pNickname);
    safeSetPlaceholder("playerId", p.pId); safeSetPlaceholder("daysSaved", p.pSpeed); safeSetPlaceholder("cancelKey", p.pPass);
    
    safeSetText("res-title-txt", p.statusTitle); safeSetText("cancel-label-txt", p.cancelLabel);
    safeSetText("btn-cancel-txt", p.cancelBtn); safeSetText("btn-add-txt", p.addBookingBtn); safeSetText("btn-res-close-txt", p.closeBtn);
    
    var curvedEl = document.getElementById("curved-profile-txt"); if (curvedEl) curvedEl.textContent = p.curvedTxt;
    var confHeader = document.getElementById("confirmed-header-txt"); if (confHeader) confHeader.innerText = p.confirmedHeader;
}

function isTabActuallyOpen(day) { 
    if (!bookingSettings || !bookingSettings.tabs || !bookingSettings.tabs[day]) return true; 
    var s = bookingSettings.tabs[day], now = new Date(); 
    if (s.forceClosed === true) return false;
    if (s.forceOpen === true) return true;
    if (!s.isOpen) return false; 
    if (bookingSettings.globalCloseTime && now > new Date(bookingSettings.globalCloseTime)) return false; 
    if (bookingSettings.globalOpenTime && now < new Date(bookingSettings.globalOpenTime)) return false; 
    return true; 
}

window.addAdminLog = function(msg) {
    if(!window.db) return;
    var now = new Date();
    var timeStr = "[" + now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,'0') + "-" + String(now.getDate()).padStart(2,'0') + " " + String(now.getHours()).padStart(2,'0') + ":" + String(now.getMinutes()).padStart(2,'0') + "]";
    var fullMsg = timeStr + " " + msg;
    
    var logs = bookingSettings.adminLogs || [];
    logs.unshift(fullMsg); 
    if(logs.length > 50) logs.pop(); 
    
    window.db.collection("settings").doc("booking").update({ adminLogs: logs }).catch(function(e){});
};

function renderLogs() {
    var box = document.getElementById("logsBox");
    if(!box) return;
    var logs = bookingSettings.adminLogs || [];
    if(logs.length === 0) { box.innerHTML = "<div>[System] Log is empty...</div>"; } 
    else { box.innerHTML = logs.map(function(l) { return "<div>" + l + "</div>"; }).join(''); }
}

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
            slot.attendees.forEach(function(a) { 
                if (normalizeText(a.player) === myName) { 
                    var parts = slotId.split("_"); 
                    confirmedTracks.push({ day: parts[0], time: parts[1], slotId: slotId }); 
                } 
            });
        }
    });
    if (confirmedTracks.length === 0) { el.style.display = "none"; return; }
    var dayOrder = { monday: 1, tuesday: 2, thursday: 4 };
    confirmedTracks.sort(function(a, b) { return dayOrder[a.day] - dayOrder[b.day]; });
    listEl.innerHTML = "";
    var p = langPack[currentLang] || langPack['en'];
    confirmedTracks.forEach(function(track) {
        var card = document.createElement("div"); card.className = "confirmedCard";
        var dayTxt = p[track.day + "Short"] || track.day;
        var displayTime = dayTxt + " " + track.time + " UTC";
        
        var timeSpan = document.createElement("span"); timeSpan.className = "confirmedTime"; timeSpan.innerText = displayTime;
        var calBtn = document.createElement("button"); calBtn.type = "button"; calBtn.className = "btn-cal"; calBtn.innerText = p.addAlarm;
        calBtn.onclick = function() { var url = window.getGoogleCalendarUrl(track.day, track.time); window.open(url, "_blank"); };
        card.appendChild(timeSpan); card.appendChild(calBtn); listEl.appendChild(card);
    });
    el.style.display = "block";
}

window.renderAll = function() {
    var grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    var isOpen = isTabActuallyOpen(currentBuff), filter = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + currentBuff); });
    
    var showSpeeds = false;
    if (bookingSettings && bookingSettings.tabs && bookingSettings.tabs[currentBuff]) { showSpeeds = bookingSettings.tabs[currentBuff].showSpeeds || false; }
    if (adminAuthenticated) showSpeeds = true;
    var p = langPack[currentLang] || langPack['en'];
    var badgeDay = currentBuff.toUpperCase().slice(0,3);

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var startId = padTime(h, m);
            var eH = h + Math.floor((m + 30) / 60);
            var eM = (m + 30) % 60;
            var endId = (eH === 24) ? "00:00" : padTime(eH, eM);
            
            var id = currentBuff + "_" + startId;
            var slot = allSlotsData[id] || {};
            var attendees = slot.attendees || [];
            
            if (filter === "mine" && !attendees.some(function(a) { return normalizeText(a.player) === normalizeText(localStorage.getItem(MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(MY_BOOKING_KEY)).player : ""); })) continue;
            
            var closedList = bookingSettings.closedSlots || [];
            var isSpecificallyClosed = closedList.includes(id);
            var effectivelyOpen = isOpen && !isSpecificallyClosed;
            
            var div = document.createElement("div"); 
            var isMine = attendees.some(function(a) { return normalizeText(a.player) === normalizeText(localStorage.getItem(MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(MY_BOOKING_KEY)).player : ""); });
            var slotClass = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "") + (isMine ? " myReservation" : "");
            div.className = slotClass;
            
            if (attendees.length > 0) {
                div.style.backgroundColor = "#eaedf2"; 
                div.style.borderColor = isMine ? "#2ecc71" : "#cbd5e1"; 
                if (isMine) div.style.borderWidth = "2px";
            }
            
            var displayList = attendees.slice();
            var listHtml = displayList.slice(0,1).map(function(a) { 
                var speedText = showSpeeds ? " (" + a.daysSaved + p.speedUnit + ")" : "";
                return "<div class='miniItem' style='font-size:15px; font-weight:800; padding:6px 0; justify-content:center; color:#2d3748;'><span>[" + a.alliance + "] " + a.player + speedText + "</span></div>"; 
            }).join('');
            
            var reqSpeed = getMainSpeedRequired();
            var conditionSuffix = "";
            if (reqSpeed > 0 && currentLang === 'ko') { conditionSuffix = " (" + reqSpeed + "일 이상)"; }
            else if (reqSpeed > 0) { conditionSuffix = " (Req: " + reqSpeed + p.speedUnit + "+)"; }
            var noResTxt = "<div style='color:#a0aec0; font-size:13px; font-weight:500;'>" + p.noRes + conditionSuffix + "</div>";
            
            var lockMark = isSpecificallyClosed ? " <span style='color:red;'>🔒</span>" : "";
            div.innerHTML = "<div class=\"dayBadge\">" + badgeDay + "</div><div class=\"timeRow\"><span>" + startId + "~" + endId + " UTC" + lockMark + "</span></div><div class=\"localTime\">Local: " + getLocalTimeStr(h,m) + "</div><div class=\"attendeeMiniList\">" + (listHtml || noResTxt) + "</div>";
            
            (function(savedId, savedOpen) { div.onclick = function() { window.handleSlotClick(savedId, savedOpen); }; })(id, effectivelyOpen);
            grid.appendChild(div);
        }
    }
    updateMyConfirmedSummary();
};

function init() {
    if(!window.db) { setTimeout(init, 200); return; }
    
    window.db.collection("settings").doc("booking").onSnapshot(function(doc) { 
        if(doc.exists) { 
            var data = doc.data();
            bookingSettings.baseDate = data.baseDate || "2026-05-23T21:00:00";
            bookingSettings.globalOpenTime = data.globalOpenTime || "";
            bookingSettings.globalCloseTime = data.globalCloseTime || "";
            bookingSettings.closedSlots = data.closedSlots || [];
            bookingSettings.adminLogs = data.adminLogs || [];
            bookingSettings.minSpeeds = data.minSpeeds || { wed: 50, thu: 30, fri: 15 };
            if (data.tabs) {
                bookingSettings.tabs.monday = data.tabs.monday || { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false };
                bookingSettings.tabs.tuesday = data.tabs.tuesday || { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false };
                bookingSettings.tabs.thursday = data.tabs.thursday || { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false };
            }
        } else {
            window.db.collection("settings").doc("booking").set(bookingSettings).catch(function(e){});
        }
        applyLanguagePack(); updateStatusMessage(); updateAdminUI(); renderLogs(); window.renderAll(); 
    }, function(error) { console.log("Settings load error:", error); });

    window.db.collection("slots").onSnapshot(function(snap) { 
        allSlotsData = {}; 
        snap.forEach(function(doc) { allSlotsData[doc.id] = doc.data(); }); 
        window.renderAll(); 
    }, function(error) { console.log("Slots load error:", error); });
    
    if(window.countdownInterval) clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(function() { updateCountdown(); }, 1000);
}

if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }

window.handleSlotClick = function(id, effectivelyOpen) {
    var p = langPack[currentLang] || langPack['en'];
    if(!effectivelyOpen && !adminAuthenticated) return openCustomAlert(p.closedAlert);
    selectedSlot = id;
    
    var slot = allSlotsData[id] || {};
    var attendees = slot.attendees || [];
    if (attendees.length === 0 && !adminAuthenticated) {
        window.openReserveModal();
    } else {
        window.openReservedModal(id);
    }
};

window.handleAdminAccess = function() { 
    sc++; 
    if(sc>=3) { 
        sc=0; 
        var pwdInput = document.getElementById("adminLoginPwd");
        if(pwdInput) pwdInput.value = "";
        document.getElementById("adminLoginModal").classList.add("show");
        setTimeout(function(){ if(document.getElementById("adminLoginPwd")) document.getElementById("adminLoginPwd").focus(); }, 100);
    } 
};

window.closeAdminLogin = function() { document.getElementById("adminLoginModal").classList.remove("show"); };

window.confirmAdminLogin = function() {
    var p = document.getElementById("adminLoginPwd").value;
    if(p === "2737") {
        adminAuthenticated = true;
        window.closeAdminLogin();
        document.getElementById("adminPanel").classList.add("show");
        fillAdminInputs(); 
        updateAdminUI();
        window.renderAll();
        window.addAdminLog("관리자가 로그인했습니다.");
    } else {
        openCustomAlert(currentLang === 'ko' ? "비밀번호가 일치하지 않습니다." : "Invalid Password.");
        document.getElementById("adminLoginPwd").value = "";
        document.getElementById("adminLoginPwd").focus();
    }
};

window.toggleTabStatus = function(day) { 
    if (!window.db || !bookingSettings.tabs || !bookingSettings.tabs[day]) return; 
    var currentlyOpen = isTabActuallyOpen(day);
    var obj = {};
    var logMsg = "";
    
    if (currentlyOpen) {
        obj["tabs." + day + ".forceOpen"] = false;
        obj["tabs." + day + ".forceClosed"] = true;
        obj["tabs." + day + ".isOpen"] = false;
        logMsg = "[" + day + "] 관리자가 해당 요일을 수동으로 강제 마감(OFF) 처리했습니다.";
    } else {
        obj["tabs." + day + ".forceOpen"] = true;
        obj["tabs." + day + ".forceClosed"] = false;
        obj["tabs." + day + ".isOpen"] = true;
        logMsg = "[" + day + "] 관리자가 자동 스케줄을 무시하고 해당 요일을 즉시 강제 오픈(ON) 처리했습니다.";
    }
    
    window.db.collection("settings").doc("booking").update(obj).then(function() {
        window.addAdminLog(logMsg);
    }); 
};

window.toggleSpeedVisibility = function(day) { 
    if (!window.db || !bookingSettings.tabs || !bookingSettings.tabs[day]) return; 
    var newStatus = !(bookingSettings.tabs[day].showSpeeds || false); 
    var path = "tabs." + day + ".showSpeeds"; 
    var obj = {}; obj[path] = newStatus; 
    window.db.collection("settings").doc("booking").update(obj).then(function() {
        window.addAdminLog("[" + day + "] 가속 노출 상태 변경: " + (newStatus ? "ON" : "OFF"));
    });
};

window.toggleSpecificSlot = function(slotId) { 
    if (!window.db) return; 
    var closedList = bookingSettings.closedSlots || []; 
    var isClosing = true;
    if (closedList.includes(slotId)) {
        closedList = closedList.filter(function(s) { return s !== slotId; }); 
        isClosing = false;
    } else {
        closedList.push(slotId); 
    }
    window.db.collection("settings").doc("booking").update({ closedSlots: closedList }).then(function() { 
        window.addAdminLog("특정 슬롯(" + slotId + ") 잠금 수동 제어: " + (isClosing ? "잠금" : "해제"));
        window.openReservedModal(slotId); 
    }); 
};

window.deleteAttendeeById = function(slotId, uniqueId) { 
    var p = langPack[currentLang] || langPack['en'];
    window.openCustomConfirm(p.promptDelete || "Delete?", function() {
        var ref = window.db.collection("slots").doc(slotId); 
        ref.get().then(function(doc) { 
            if(!doc.exists) return;
            var list = (doc.data().attendees || []).filter(function(a) { return String(a.id) !== String(uniqueId); }); 
            ref.update({ attendees: list }).then(function() { 
                window.addAdminLog("관리자가 예약을 강제 삭제했습니다. (슬롯: " + slotId + ")");
                window.openReservedModal(slotId); window.renderAll(); 
            }); 
        });
    });
};

window.exportAllCSV = function() { try { if (typeof XLSX === 'undefined') return openCustomAlert("XLSX Loading..."); var wb = XLSX.utils.book_new(); ["monday", "tuesday", "thursday"].forEach(function(day) { var rows = []; Object.keys(allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(function(slotId) { var timeStr = slotId.split('_')[1]; var attendees = allSlotsData[slotId].attendees || []; attendees.forEach(function(a) { rows.push({ "Day": day, "Time(UTC)": timeStr, "Alliance": a.alliance, "Nickname": a.player, "PlayerID": a.playerId, "SpeedDays": a.daysSaved }); }); }); if (rows.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); }); XLSX.writeFile(wb, "SVS_Booking.xlsx"); } catch (e) { openCustomAlert("Failed."); } };

window.confirmBooking = function() {
    var p = langPack[currentLang] || langPack['en'];
    var a = document.getElementById("alliance").value, nickname = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    
    if(!a || !nickname || !idNum || !d || !pass) return openCustomAlert(p.errFillAll);
    if(idNum.length !== 9) return openCustomAlert(p.errIdDigit);

    var requiredSpeed = getMainSpeedRequired();
    if (Number(d) < requiredSpeed) {
        var msg = currentLang === 'ko' ? "오늘 기준 예약은 가속 " + requiredSpeed + "일 이상 보유자만 가능합니다." : "Today's booking requires at least " + requiredSpeed + " days of speed-ups.";
        return openCustomAlert(msg);
    }

    var slot = allSlotsData[selectedSlot] || {};
    var currentAttendees = slot.attendees || [];
    if (currentAttendees.length >= 1 && !adminAuthenticated) {
        return openCustomAlert(currentLang === 'ko' ? "이미 선착순 예약이 마감된 타임 슬롯입니다." : "This slot has already been taken.");
    }

    var alreadyBooked = false;
    Object.keys(allSlotsData).forEach(function(slotId) {
        if (slotId.startsWith(currentBuff)) { 
            var s = allSlotsData[slotId];
            var attendees = s ? (s.attendees || []) : [];
            if (attendees.some(function(attendee) { return normalizeText(attendee.player) === normalizeText(nickname); })) { alreadyBooked = true; }
        }
    });

    if (alreadyBooked && !adminAuthenticated) { 
        return openCustomAlert(currentLang === 'ko' ? "이 요일에는 이미 예약된 내역이 있습니다.<br />(월/화/목 요일별 각 1회만 가능)" : "You have already booked a slot for this day.<br />(1 booking per day allowed)"); 
    }

    var entryId = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    var newEntry = { id: entryId, alliance: a, player: nickname, playerId: idNum, playerNormalized: normalizeText(nickname), daysSaved: Number(d), passwordHash: simpleHash(pass), createdAt: Date.now() };
    
    var unionFn = null;
    try {
        if (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) {
            unionFn = window.firebase.firestore.FieldValue.arrayUnion;
        } else if (window.firebase && window.firebase.FieldValue) {
            unionFn = window.firebase.FieldValue.arrayUnion;
        }
    } catch(e) {}

    if (!unionFn) {
        return openCustomAlert("Firebase initialization mismatch. Please refresh the page.");
    }

    window.db.collection("slots").doc(selectedSlot).set({ attendees: unionFn(newEntry) }, {merge: true}).then(function() { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: nickname, playerId: idNum, cancelKey: pass })); 
        window.closeModal(); 
        window.renderAll(); 
    }).catch(function(err) {
        openCustomAlert("Database write failed: " + err.message);
    });
};

window.editSpecificBooking = function(slotId, uniqueId) {
    var p = langPack[currentLang] || langPack['en'], pass = document.getElementById("editCancelKey").value;
    if(!pass) return openCustomAlert(p.errFill);
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        if(!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return String(a.id) === String(uniqueId); });
        if(!target) return openCustomAlert(p.errNoRes);
        if (target.passwordHash !== simpleHash(pass)) return openCustomAlert(p.errWrongPass);
        
        window.openCustomPrompt(p.promptEdit, target.daysSaved, function(newDays) {
            if(newDays === null || newDays.trim() === "") return;
            if(isNaN(newDays)) return openCustomAlert(p.errNan);
            target.daysSaved = Number(newDays);
            ref.update({ attendees: list }).then(function() { window.openReservedModal(slotId); window.renderAll(); });
        });
    });
};

window.confirmCancelSpecific = function(uniqueId) {
    var p = langPack[currentLang] || langPack['en'], pass = document.getElementById("editCancelKey").value;
    if(!pass) return openCustomAlert(p.errFill);
    var ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        if(!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return String(a.id) === String(uniqueId); });
        if(!target) return openCustomAlert(p.errNoRes);
        if (target.passwordHash !== simpleHash(pass)) return openCustomAlert(p.errWrongPass);
        var updatedList = list.filter(function(a) { return String(a.id) !== String(uniqueId); });
        ref.update({ attendees: updatedList }).then(function() { window.closeReservedModal(); window.renderAll(); });
    });
};

// [로직 대규모 개편 완료] "나의 마지막 예약"이라는 조건 제한을 완벽하게 없앴습니다.
// 브라우저 캐시에 상관없이, 비밀번호만 일치하면 내가 대신 해준 부캐/지인의 예약까지도 무제한으로 쿨하게 취소됩니다!
window.confirmCancelAll = function() {
    var p = langPack[currentLang] || langPack['en'], pass = document.getElementById("editCancelKey").value;
    if(!pass) return openCustomAlert(p.errFill);
    
    var ref = window.db.collection("slots").doc(selectedSlot);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        if (list.length === 0) return openCustomAlert(p.errNoRes);
        
        var isPassCorrect = list.some(function(a) { return a.passwordHash === simpleHash(pass); });
        if (!isPassCorrect) return openCustomAlert(p.errWrongPass);
        
        var updatedList = list.filter(function(a) { return a.passwordHash !== simpleHash(pass); });
        ref.update({ attendees: updatedList }).then(function() { 
            window.closeReservedModal(); 
            window.renderAll(); 
        });
    });
};

window.saveAutoSchedule = function() { 
    if(!window.db) return; 
    bookingSettings.globalOpenTime = document.getElementById("global-open-time").value; 
    bookingSettings.globalCloseTime = document.getElementById("global-close-time").value; 
    
    bookingSettings.minSpeeds = {
        wed: Number(document.getElementById("speed-req-wed").value || 0),
        thu: Number(document.getElementById("speed-req-thu").value || 0),
        fri: Number(document.getElementById("speed-req-fri").value || 0)
    };

    bookingSettings.closedSlots = []; 
    ['monday', 'tuesday', 'thursday'].forEach(function(day) {
        if(bookingSettings.tabs[day]) {
            bookingSettings.tabs[day].isOpen = true;
            bookingSettings.tabs[day].forceOpen = false;
            bookingSettings.tabs[day].forceClosed = false;
        }
    });
    
    window.db.collection("settings").doc("booking").set(bookingSettings, {merge: true}).then(function() { 
        window.addAdminLog("통합 스케줄 및 요일별 하한 가속 데이터를 업데이트했습니다.");
        openCustomAlert(langPack[currentLang].promptSaved || "Saved!"); 
    }); 
};

window.saveAdminBaseDate = function() { 
    if(!window.db) return; 
    var val = document.getElementById("adminBaseDate").value; 
    if(!val) return; 
    window.db.collection("settings").doc("booking").update({baseDate: val}).then(function() { 
        window.addAdminLog("SVS 카운트다운 기준 시간을 변경했습니다.");
        openCustomAlert(langPack[currentLang].promptSaved || "Saved!"); 
    }); 
};

window.backupAndClearAll = function() { 
    if(!window.db) return; 
    var p = langPack[currentLang] || langPack['en'];
    window.openCustomConfirm(p.promptClear, function() {
        window.db.collection("slots").get().then(function(snap) { 
            var batch = window.db.batch(); 
            snap.forEach(function(doc) { batch.delete(doc.ref); }); 
            batch.commit().then(function() { 
                window.addAdminLog("🚨 데이터 센터 경보: 관리자가 전체 예약을 강제 리셋했습니다.");
                window.closeAdmin(); window.renderAll(); 
            }); 
        }); 
    });
};

function updateAdminUI() { 
    if(!bookingSettings || !bookingSettings.tabs) return;
    ['monday', 'tuesday', 'thursday'].forEach(function(day) { 
        if(!bookingSettings.tabs[day]) return;
        var btn = document.getElementById("btn-admin-" + day); 
        if (btn) { 
            var currentlyOpen = isTabActuallyOpen(day);
            btn.classList.toggle("on", currentlyOpen); 
        } 
        var sBtn = document.getElementById("btn-speed-" + day); 
        if (sBtn) { sBtn.classList.toggle("on-speed", bookingSettings.tabs[day].showSpeeds); } 
    }); 
}

function updateStatusMessage() { 
    var el = document.getElementById("bookingStatusMsg"); 
    if(!el) return;
    
    var isOpen = isTabActuallyOpen(currentBuff);
    var p = langPack[currentLang] || langPack['en'];
    var now = new Date();
    
    function formatTime(diffMs) {
        var d = Math.floor(diffMs / 86400000);
        var h = Math.floor((diffMs % 86400000) / 3600000);
        var m = Math.floor((diffMs % 3600000) / 60000);
        var s = Math.floor((diffMs % 60000) / 1000);
        var res = "";
        if (d > 0) res += d + "d ";
        res += h + "h " + m + "m " + s + "s";
        return res;
    }

    if (isOpen) {
        if (bookingSettings.globalCloseTime) {
            var diff = new Date(bookingSettings.globalCloseTime) - now;
            if (diff > 0) {
                el.innerHTML = "✅ " + (currentLang === 'ko' ? "예약 가능 (마감까지 " : "Booking Open (Closes in ") + formatTime(diff) + ")";
                return;
            }
        }
        el.innerText = p.openAvailable;
    } else {
        if (bookingSettings.globalOpenTime) {
            var diff = new Date(bookingSettings.globalOpenTime) - now;
            if (diff > 0) {
                el.innerHTML = "🔒 " + (currentLang === 'ko' ? "예약 대기 (오픈까지 " : "Booking Queue (Opens in ") + formatTime(diff) + ")";
                return;
            }
        }
        el.innerText = p.openClosed;
    }
}

function updateCountdown() { 
    if (!bookingSettings || !bookingSettings.baseDate) return; 
    var diff = new Date(bookingSettings.baseDate) - new Date(); 
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; 
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); 
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = "Next SVS in " + d + "d " + h + "h " + m + "m " + s + "s"; 
    
    updateStatusMessage();
}

window.switchBuff = function(b) { currentBuff = b; updateStatusMessage(); window.renderAll(); };
window.clearSearch = function() { window.renderAll(); };
window.closeModal = function() { document.getElementById("modal").classList.remove("show"); };
window.closeReservedModal = function() { document.getElementById("reservedModal").classList.remove("show"); };
window.closeAdmin = function() { document.getElementById("adminPanel").classList.remove("show"); };

function fillAdminInputs() { 
    if (!bookingSettings || !bookingSettings.baseDate) return; 
    document.getElementById("adminBaseDate").value = bookingSettings.baseDate.slice(0, 16); 
    document.getElementById("global-open-time").value = bookingSettings.globalOpenTime || ""; 
    document.getElementById("global-close-time").value = bookingSettings.globalCloseTime || ""; 
    
    var speeds = bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    if(document.getElementById("speed-req-wed")) document.getElementById("speed-req-wed").value = speeds.wed;
    if(document.getElementById("speed-req-thu")) document.getElementById("speed-req-thu").value = speeds.thu;
    if(document.getElementById("speed-req-fri")) document.getElementById("speed-req-fri").value = speeds.fri;
}

window.currentBuff = "monday";
window.selectedSlot = null;
window.allSlotsData = {};
window.MY_BOOKING_KEY = "svs_my_booking_info";
window.currentLang = localStorage.getItem("svs_lang") || "en"; 

window.bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    globalCloseTime: "", 
    closeTimes: { monday: "", tuesday: "", thursday: "" }, 
    closedSlots: [], 
    adminLogs: [], 
    minSpeeds: { wed: 50, thu: 30, fri: 15 }, 
    tabs: { 
        monday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false }, 
        tuesday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false }, 
        thursday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false } 
    } 
};
window.adminAuthenticated = false;
window.sc = 0;

// [단어 교정] 한국어일 때 "전체", "내 예약"으로만 깔끔하게 나오도록 수정 완료
window.langPack = {
    ko: { 
        notice: "📢 요일별 1인 1타임만 예약 가능합니다.", 
        speedCond: "[예약 오픈 조건] 수요일: 가속 {wed}일 이상 | 목요일: {thu}일 이상 | 금요일: {fri}일 이상 | 토~일요일: 자유 예약",
        langHelp: "(상단 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1", confirmedHeader: "👑 내 예약 시간", 
        mon: "월요일 (건설)", tue: "화요일 (연구)", thu: "목요일 (훈련)", 
        mondayShort: "월요일", tuesdayShort: "화요일", thursdayShort: "목요일", 
        optAll: "전체", optMine: "내 예약", 
        openAvailable: "✅ 예약 가능", openClosed: "🔒 예약 마감", pers: "명", noRes: "예약 가능", 
        addTitle: "새 예약 추가", confirmBtn: "확정", closeBtn: "닫기", statusTitle: "예약 현황", 
        cancelLabel: "취소용 비밀번호", cancelBtn: "예약 취소", addBookingBtn: "예약 수정", 
        closedAlert: "예약 마감되었습니다.", speedUnit: "일", 
        pAlliance: "연맹 (ZYZ, BUG, ZTP 등)", pNickname: "닉네임", pId: "플레이어 ID (9자리)", pSpeed: "가속 일수", pPass: "예약취소를 위한 비밀번호 (아무거나)", 
        editBtn: "수정", cancelBtnSmall: "취소", delBtn: "삭제", slotOpenBtn: "🔓 예약 열기", slotCloseBtn: "🔒 예약 마감", 
        errFill: "비밀번호 칸에 비밀번호를 먼저 입력해주세요.", errWrongPass: "비밀번호가 올바르지 않습니다.", 
        errNoRes: "삭제할 예약 데이터를 찾을 수 없습니다.", errFillAll: "모든 항목을 입력해야 합니다.", 
        errIdDigit: "플레이어 ID는 반드시 숫자 9자리여야 합니다.", promptEdit: "새로운 가속 일수(숫자만)를 입력하세요:", 
        errNan: "숫자 형식만 입력 가능합니다.", promptDelete: "정말 삭제하시겠습니까?", 
        promptClear: "모든 예약 데이터를 삭제하시겠습니까?<br />(이 작업은 관리자 로그에 기록됩니다)", 
        btnAdminDel: "🚨 모든 예약 삭제", promptSaved: "저장되었습니다!",
        admTitle: "👑 관리자 시스템", admBase: "SVS 기준일 설정", admSave: "저장", admManual: "예약 수동 제어", admVis: "가속 일수 공개 제어", admLimits: "요일별 최소 가속 조건 조절", admAuto: "자동 시간 설정", admSaveSched: "스케줄 저장", admExcel: "엑셀 추출", admClose: "닫기",
        copyList: "명단 복사", copySuccess: "예약 명단이 클립보드에 복사되었습니다!", enableNoti: "🔔 웹 알림 켜기", notiSuccess: "알림이 켜졌습니다! 예약 10분 전에 화면에 알려드릴게요.", statsTitle: "📊 연맹별 예약 통계",
        admOpen: "전체오픈", admGlobalClose: "전체마감", admIndivClose: "요일별 개별 마감:"
    },
    en: { 
        notice: "📢 1 Booking Per Person Per Day.", 
        speedCond: "[Requirements] Wed: {wed}d+ | Thu: {thu}d+ | Fri: {fri}d+ | Sat~Sun: Free Booking",
        langHelp: "(You can change the language using the menu above.)",
        curvedTxt: "The website usage fee is Mona's Island 💚+1", confirmedHeader: "👑 My Booked Buffs", 
        mon: "Monday (Construction)", tue: "Tuesday (Research)", thu: "Thursday (Troops Training)", 
        mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday", optAll: "All", optMine: "My Bookings", 
        openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed", pers: "Pers.", noRes: "Available", 
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close", statusTitle: "Booking Status", 
        cancelLabel: "Cancellation Password", cancelBtn: "Cancel Booking", addBookingBtn: "Modify Booking", 
        closedAlert: "Reservation Closed.", speedUnit: "d", 
        pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password for cancellation (any password)", 
        editBtn: "Edit", cancelBtnSmall: "Cancel", delBtn: "Delete", slotOpenBtn: "🔓 Open", slotCloseBtn: "🔒 Close", 
        errFill: "Please enter your password first.", errWrongPass: "Wrong password.", errNoRes: "Reservation not found.", errFillAll: "Please fill all fields.", errIdDigit: "ID must be exactly 9 digits.", promptEdit: "Enter new speed-up days:", errNan: "Invalid number.", promptDelete: "Are you sure?", 
        promptClear: "Delete all booking data?<br />(This action will be logged)", 
        btnAdminDel: "🚨 Clear All Bookings", promptSaved: "Saved!",
        admTitle: "👑 Admin System", admBase: "Set Base Date", admSave: "Save", admManual: "Manual Booking Control", admVis: "Speed-up Visibility", admLimits: "Dynamic Speed Limits", admAuto: "Auto Schedule", admSaveSched: "Save Schedule", admExcel: "Excel Export", admClose: "Close",
        copyList: "Copy List", copySuccess: "The booking list has been copied to your clipboard!", enableNoti: "🔔 Enable Alerts", notiSuccess: "Alerts enabled! We will notify you 10 mins before your slot.", statsTitle: "📊 Alliance Stats",
        admOpen: "Global Open", admGlobalClose: "Global Close", admIndivClose: "Individual Close by Day:"
    },
    zh: { 
        notice: "📢 每人每天限预约1次。", 
        speedCond: "[条件] 周三: 加速 {wed}天+ | 周四: {thu}天+ | 周五: {fri}天+ | 周六~周日: 自由预约",
        langHelp: "(您可以上方菜单更改语言)",
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1", confirmedHeader: "👑 我的确定的增益时间", 
        mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)", mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四", optAll: "全部", optMine: "我的预约", openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止", pers: "人", noRes: "预约开放", addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭", statusTitle: "预约状态", 
        cancelLabel: "取消专用密码", cancelBtn: "取消预约", addBookingBtn: "修改预约", 
        closedAlert: "预约已截止。", speedUnit: "天", pAlliance: "联盟 (ZYZ, BUG, ZTP 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消密码 (任意)", editBtn: "修改", cancelBtnSmall: "取消", delBtn: "删除", slotOpenBtn: "🔓 开放", slotCloseBtn: "🔒 关闭", errFill: "请先在下方输入您的密码。", errWrongPass: "密码错误。", errNoRes: "找不到预约数据。", errFillAll: "必须填写所有字段。", errIdDigit: "玩家ID必须为9位数字。", promptEdit: "请输入新的加速天数（仅限数字）:", errNan: "只能输入数字格式。", promptDelete: "确定要删除吗？", promptClear: "确定要删除所有预约数据吗？<br />（此操作将被记录）", btnAdminDel: "🚨 删除所有预约", promptSaved: "已保存！",
        admTitle: "👑 管理员系统", admBase: "设置基准日期", admSave: "保存", admManual: "手动预约控制", admVis: "加速可见性控制", admLimits: "最低加速条件调整", admAuto: "自动时间设置", admSaveSched: "保存时间表", admExcel: "导出Excel", admClose: "关闭",
        copyList: "复制名单", copySuccess: "预约名单已复制到剪贴板！", enableNoti: "🔔 开启提醒", notiSuccess: "提醒已启用！我们将在预约前10分钟通知您。", statsTitle: "📊 联盟预约统计",
        admOpen: "全局开放", admGlobalClose: "全局关闭", admIndivClose: "按天单独关闭:"
    },
    fr: { 
        notice: "📢 1 Réservation par personne et par jour.", 
        speedCond: "[Req] Mer: {wed}j+ | Jeu: {thu}j+ | Ven: {fri}j+ | Sam~Dim: Libre",
        langHelp: "(Modifiez la langue via le menu ci-dessus.)",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1", confirmedHeader: "👑 Mes Buffs Confirmés", 
        mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)", mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi", optAll: "Tout", optMine: "Mes Réservations", openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée", pers: "Pers.", noRes: "Disponible", addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer", statusTitle: "Statut de Réservation", 
        cancelLabel: "Mot de passe d'annulation", cancelBtn: "Annuler la réservation", addBookingBtn: "Modifier la réservation", 
        closedAlert: "Réservation fermée.", speedUnit: "j", pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Beta", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe", editBtn: "Modifier", cancelBtnSmall: "Annuler", delBtn: "Supprimer", slotOpenBtn: "🔓 Ouvrir", slotCloseBtn: "🔒 Fermer", errFill: "Saisissez votre mot de passe.", errWrongPass: "Mot de passe incorrect.", errNoRes: "Réservation introuvable.", errFillAll: "Veuillez remplir tous les champs.", errIdDigit: "L'identifiant doit comporter 9 chiffres.", promptEdit: "Modifier:", errNan: "Invalide.", promptDelete: "Supprimer ?", promptClear: "Effacer toutes les réservations ?<br />(Cette action sera enregistrée)", btnAdminDel: "🚨 Supprimer tout", promptSaved: "Enregistré !",
        admTitle: "👑 Système d'administration", admBase: "Définir la date", admSave: "Enregistrer", admManual: "Contrôle manuel", admVis: "Visibilité des accélérations", admLimits: "Limites dynamiques", admAuto: "Planification", admSaveSched: "Sauvegarder", admExcel: "Exporter Excel", admClose: "Fermer",
        copyList: "Copier", copySuccess: "La liste a été copiée !", enableNoti: "🔔 Activer l'alerte", notiSuccess: "Alertes activées ! (10 min avant)", statsTitle: "📊 Stats d'Alliance",
        admOpen: "Ouverture Glob.", admGlobalClose: "Fermeture Glob.", admIndivClose: "Fermeture par jour:"
    },
    ja: { 
        notice: "📢 曜日別1人1回のみ予約可能です。", 
        speedCond: "[条件] 水曜日: 加速 {wed}日+ | 木曜日: {thu}日+ | 金曜日: {fri}日+ | 土~日曜日: 自由予約",
        langHelp: "(上部メニューから言語を変更できます)",
        curvedTxt: "予約サイトの利用料は : Monaの島 💚+1", confirmedHeader: "👑 確定した大統領バフ時間", 
        mon: "月曜日", tue: "火曜日", thu: "木曜日", mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日", optAll: "すべて", optMine: "自分の予約", openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了", pers: "人", noRes: "予約可能", addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる", statusTitle: "予約状況", 
        cancelLabel: "キャンセル用パスワード", cancelBtn: "予約取消", addBookingBtn: "予約修正", 
        closedAlert: "締め切られました。", speedUnit: "日", pAlliance: "同盟 (ZYZ, BUG, ZTP)", pNickname: "名前", pId: "プレイヤーID", pSpeed: "加速日数", pPass: "パスワード", editBtn: "修正", cancelBtnSmall: "取消", delBtn: "削除", slotOpenBtn: "🔓 開く", slotCloseBtn: "🔒 閉じる", errFill: "パスワードを入力してください。", errWrongPass: "パスワードが間違っています。", errNoRes: "予約データが見つかりません。", errFillAll: "すべて入力。", errIdDigit: "プレイヤーIDは9桁の数字。", promptEdit: "修正:", errNan: "不正。", promptDelete: "削除？", promptClear: "すべての予約データを削除しますか？<br />（この操作はログに記録されます）", btnAdminDel: "🚨 全ての予約を削除", promptSaved: "保存されました！",
        admTitle: "👑 管理者システム", admBase: "基準日の設定", admSave: "保存", admManual: "手動予約制御", admVis: "加速表示制御", admLimits: "最小加速条件調整", admAuto: "自動スケジュール", admSaveSched: "スケジュール保存", admExcel: "Excel抽出", admClose: "閉じる",
        copyList: "リストをコピー", copySuccess: "予約リストをクリップボードにコピーしました！", enableNoti: "🔔 通知をオンにする", notiSuccess: "通知が有効になりました！予約の10分前にお知らせします。", statsTitle: "📊 同盟別予約統計",
        admOpen: "全体オープン", admGlobalClose: "全体クローズ", admIndivClose: "曜日別の個別クローズ:"
    },
    id: { 
        notice: "📢 1 Pesanan Per Orang Per Hari.", 
        speedCond: "[Syarat] Rabu: Speed-up {wed}h+ | Kamis: {thu}h+ | Jumat: {fri}h+ | Sabtu~Minggu: Bebas",
        langHelp: "(Ubah bahasa menggunakan menu di atas.)",
        curvedTxt: "Biaya penggunaan Pulau Mona 💚+1", confirmedHeader: "👑 Buff Saya", 
        mon: "Senin", tue: "Selasa", thu: "Kamis", mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis", optAll: "Semua", optMine: "Pesanan Saya", openAvailable: "✅ Buka", openClosed: "🔒 Tutup", pers: "Orang", noRes: "Tersedia", addTitle: "Tambah Pesanan", confirmBtn: "Konfirmasi", closeBtn: "Tutup", statusTitle: "Status", 
        cancelLabel: "Kata Sandi Pembatalan", cancelBtn: "Batalkan Pesanan", addBookingBtn: "Ubah Pesanan", 
        closedAlert: "Ditutup.", speedUnit: "hari", pAlliance: "Aliansi (ZYZ, BUG, ZTP etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi", editBtn: "Ubah", cancelBtnSmall: "Batal", delBtn: "Hapus", slotOpenBtn: "🔓 Buka", slotCloseBtn: "🔒 Tutup", errFill: "Masukkan kata sandi.", errWrongPass: "Salah.", errNoRes: "Tidak ditemukan.", errFillAll: "Harus diisi.", errIdDigit: "ID harus 9 digit.", promptEdit: "Ubah:", errNan: "Harus angka.", promptDelete: "Hapus?", promptClear: "Hapus semua data pesanan?<br />(Tindakan ini akan dicatat)", btnAdminDel: "🚨 Hapus Semua Pesanan", promptSaved: "Tersimpan!",
        admTitle: "👑 Sistem Admin", admBase: "Atur Tanggal Dasar", admSave: "Simpan", admManual: "Kontrol Pesanan Manual", admVis: "Visibilitas Speed-up", admLimits: "Batas Speed-up Dinamis", admAuto: "Jadwal Otomatis", admSaveSched: "Simpan Jadwal", admExcel: "Ekspor Excel", admClose: "Tutup",
        copyList: "Salin Daftar", copySuccess: "Daftar berhasil disalin!", enableNoti: "🔔 Aktifkan Peringatan", notiSuccess: "Peringatan diaktifkan! (10 menit sebelum)", statsTitle: "📊 Statistik Aliansi",
        admOpen: "Buka Global", admGlobalClose: "Tutup Global", admIndivClose: "Tutup Individu per Hari:"
    },
    tr: { 
        notice: "📢 Kişi başına günde 1 rezervasyon.", 
        speedCond: "[Şartlar] Çarş: {wed}g+ | Perş: {thu}g+ | Cuma: {fri}g+ | Cmt~Paz: Serbest",
        langHelp: "(Yukarıdaki menüyü kullanarak dili değiştirin.)",
        curvedTxt: "Mona'nın Adası 💚+1", confirmedHeader: "👑 Onaylanmış Bufflarım", 
        mon: "Pazartesi", tue: "Salı", thu: "Perşembe", mondayShort: "Pazartesi", tuesdayShort: "Salı", thursdayShort: "Perşembe", optAll: "Tümü", optMine: "Rezervasyonum", openAvailable: "✅ Açık", openClosed: "🔒 Kapalı", pers: "Kişi", noRes: "Müsait", addTitle: "Yeni Rezervasyon", confirmBtn: "Onayla", closeBtn: "Kapat", statusTitle: "Durum", 
        cancelLabel: "İptal Şifresi", cancelBtn: "Rezervasyonu İptal Et", addBookingBtn: "Rezervasyonu Düzenle", 
        closedAlert: "Kapandı.", speedUnit: "g", pAlliance: "İttifak (ZYZ, BUG, ZTP vb.)", pNickname: "Kullanıcı Adı", pId: "Oyuncu ID", pSpeed: "Hızlandırma", pPass: "İptal Şifresi", editBtn: "Düzenle", cancelBtnSmall: "İptal", delBtn: "Sil", slotOpenBtn: "🔓 Aç", slotCloseBtn: "🔒 Kapat", errFill: "Şifre giriniz.", errWrongPass: "Yanlış.", errNoRes: "Bulunamadı.", errFillAll: "Doldurunuz.", errIdDigit: "ID 9 haneli olmalıdır.", promptEdit: "Düzenle:", errNan: "Geçersiz.", promptDelete: "Sil?", promptClear: "Tüm rezervasyon verilerini sil?<br />(Bu işlem kaydedilecektir)", btnAdminDel: "🚨 Tüm Rezervasyonları Sil", promptSaved: "Kaydedildi!",
        admTitle: "👑 Yönetici Paneli", admBase: "Tarihi Ayarla", admSave: "Kaydet", admManual: "Manuel Rezervasyon Kontrolü", admVis: "Hızlandırma Görünürlüğü", admLimits: "Dinamik Hız Sınırları", admAuto: "Otomatik Planlama", admSaveSched: "Programı Kaydet", admExcel: "Excel Aktar", admClose: "Kapat",
        copyList: "Listeyi Kopyala", copySuccess: "Liste kopyalandı!", enableNoti: "🔔 Bildirimleri Aç", notiSuccess: "Bildirimler etkinleştirildi! (10 dk kala)", statsTitle: "📊 İttifak İstatistikleri",
        admOpen: "Genel Açılış", admGlobalClose: "Genel Kapanış", admIndivClose: "Güne Göre Bireysel Kapanış:"
    },
    ar: { 
        notice: "📢 حجز واحد للشخص الواحد في اليوم.", 
        speedCond: "[الشروط] الأربعاء: {wed} ي+ | الخميس: {thu} ي+ | الجمعة: {fri} ي+ | السبت~الأحد: حجز حر",
        langHelp: "(قم بتغيير اللغة باستخدام القائمة أعلاه.)",
        curvedTxt: "جزيرة منى 💚+1", confirmedHeader: "👑 حجوزاتي المؤكدة", 
        mon: "الاثنين", tue: "الثلاثاء", thu: "الخميس", mondayShort: "الاثنين", tuesdayShort: "الثلاثاء", thursdayShort: "الخميس", optAll: "الكل", optMine: "حجوزاتي", openAvailable: "✅ مفتوح", openClosed: "🔒 مغلق", pers: "أشخاص", noRes: "متاح", addTitle: "حجز جديد", confirmBtn: "تأكيد", closeBtn: "إغلاق", statusTitle: "الحالة", 
        cancelLabel: "كلمة مرور الإلغاء", cancelBtn: "إلغاء الحجز", addBookingBtn: "تعديل الحجز", 
        closedAlert: "مغلق.", speedUnit: "ي", pAlliance: "التحالف (ZYZ, BUG, ZTP إلخ)", pNickname: "الاسم", pId: "معرف اللاعب", pSpeed: "أيام التسريع", pPass: "كلمة المرور", editBtn: "تعديل", cancelBtnSmall: "إلغاء", delBtn: "حذف", slotOpenBtn: "🔓 فتح", slotCloseBtn: "🔒 إغلاق", errFill: "أدخل كلمة المرور.", errWrongPass: "خطأ.", errNoRes: "غير موجود.", errFillAll: "مطلوب.", errIdDigit: "يجب 9 أرقام.", promptEdit: "تعديل:", errNan: "غير صحيح.", promptDelete: "حذف؟", promptClear: "هل أنت متأكد من حذف جميع بيانات الحجز؟<br />(سيتم تسجيل هذا الإجراء)", btnAdminDel: "🚨 حذف جميع الحجوزات", promptSaved: "تم!",
        admTitle: "👑 نظام المشرف", admBase: "تعيين التاريخ الأساسي", admSave: "حفظ", admManual: "التحكم اليدوي في الحجز", admVis: "التحكم في رؤية التسريع", admLimits: "تعديل شروط الحد الأدنى", admAuto: "الجدولة التلقائية", admSaveSched: "حفظ الجدول", admExcel: "تصدير إكسل", admClose: "إغلاق",
        copyList: "نسخ القائمة", copySuccess: "تم نسخ القائمة!", enableNoti: "🔔 تفعيل التنبيه", notiSuccess: "تم التفعيل!", statsTitle: "📊 إحصائيات التحالف",
        admOpen: "الفتح العام", admGlobalClose: "الإغلاق العام", admIndivClose: "الإغلاق الفردي حسب اليوم:"
    }
};

window.initSnowEffect = function() {
    var canvas = document.getElementById('snow');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;
    var snowflakes = [];
    var snowColor = 'rgba(180, 210, 240, 0.45)'; 
    var maxFlakes = width < 768 ? 20 : 45;

    for(var i=0; i<maxFlakes; i++){ 
        snowflakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 3.5 + 1.0, 
            d: Math.random() * maxFlakes,
            type: Math.random() > 0.6 ? 1 : 0 
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = snowColor;
        ctx.strokeStyle = snowColor;
        ctx.lineWidth = 1.2; 
        ctx.beginPath();
        
        for(var i=0; i<snowflakes.length; i++){
            var f = snowflakes[i];
            if (f.type === 0) {
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
            } else {
                var s = f.r * 1.5; 
                ctx.moveTo(f.x - s, f.y); ctx.lineTo(f.x + s, f.y);
                ctx.moveTo(f.x, f.y - s); ctx.lineTo(f.x, f.y + s);
                var diag = s * 0.7; 
                ctx.moveTo(f.x - diag, f.y - diag); ctx.lineTo(f.x + diag, f.y + diag);
                ctx.moveTo(f.x + diag, f.y - diag); ctx.lineTo(f.x - diag, f.y + diag);
            }
        }
        ctx.fill(); 
        ctx.stroke(); 
        move();
    }
    
    function move() {
        for(var i=0; i<snowflakes.length; i++){
            var f = snowflakes[i];
            f.y += Math.cos(f.d) * 0.3 + 0.4 + f.r * 0.2;
            f.x += Math.sin(f.d) * 0.3;
            if(f.y > height){
                snowflakes[i] = { x: Math.random()*width, y: -10, r: f.r, d: f.d, type: f.type };
            }
        }
    }
    setInterval(draw, 40); 
    window.addEventListener('resize', function() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
};

window.splitDateTime = function(isoStr) {
    if (!isoStr) return { date: "", time: "" };
    var parts = isoStr.split('T');
    return { date: parts[0] || "", time: parts[1] ? parts[1].substring(0, 5) : "" };
};
window.combineDateTime = function(dateStr, timeStr) {
    if (dateStr && timeStr) return dateStr + "T" + timeStr;
    return "";
};

// [스마트 복사 엔진] 전체, 내예약, 특정 연맹(ZTP, ZYZ, BUG) 필터링 조건에 완벽히 맞춰 복사
window.copyTodayList = function() {
    var filter = document.getElementById("filterStatus").value;
    var filterText = "";
    if (filter === "mine") filterText = " (My Bookings)";
    else if (filter !== "all") filterText = " (" + filter + ")";
    
    var text = "👑 [" + window.currentBuff.toUpperCase() + "]" + filterText + " Confirmed List 👑\n\n";
    var hasData = false;
    
    var myStored = localStorage.getItem(window.MY_BOOKING_KEY);
    var myName = myStored ? window.normalizeText(JSON.parse(myStored).player) : "";

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var startId = window.padTime(h, m);
            var slotId = window.currentBuff + "_" + startId;
            var attendees = window.allSlotsData[slotId] ? (window.allSlotsData[slotId].attendees || []) : [];
            
            var filteredAttendees = attendees;
            if (filter === "mine") {
                filteredAttendees = attendees.filter(function(a) { return window.normalizeText(a.player) === myName; });
            } else if (filter !== "all") {
                filteredAttendees = attendees.filter(function(a) { return String(a.alliance || "").toUpperCase().trim() === filter; });
            }
            
            if (filteredAttendees.length > 0) {
                hasData = true;
                // [대/소문자 통일] 출력할 때는 무조건 대문자로 깔끔하게 포장
                var playerNames = filteredAttendees.map(function(a) { return "[" + String(a.alliance).toUpperCase() + "] " + a.player; }).join(", ");
                text += "- " + startId + " UTC : " + playerNames + "\n";
            }
        }
    }
    
    if (!hasData) { text += "No bookings found.\n"; }
    
    navigator.clipboard.writeText(text).then(function() {
        var p = window.langPack[window.currentLang] || window.langPack['en'];
        window.openCustomAlert(p.copySuccess || "Copied to clipboard!");
    }).catch(function() { window.openCustomAlert("Failed to copy. Please try again."); });
};

window.requestNotification = function() {
    if (!("Notification" in window)) {
        window.openCustomAlert("This browser does not support desktop notification.");
        return;
    }
    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            var p = window.langPack[window.currentLang] || window.langPack['en'];
            window.openCustomAlert(p.notiSuccess || "Alerts enabled!");
        }
    });
};

window.checkUpcomingBookings = function() {
    if (Notification.permission !== "granted") return;
    var m = localStorage.getItem(window.MY_BOOKING_KEY);
    if (!m) return;
    var mine = JSON.parse(m);
    var myName = window.normalizeText(mine.player);
    var now = new Date();
    var currentUTCDay = now.getUTCDay(); 
    var dayMap = { 'monday': 1, 'tuesday': 2, 'thursday': 4 };
    
    Object.keys(window.allSlotsData).forEach(function(slotId) {
        var parts = slotId.split('_');
        var buffDay = parts[0];
        var timeStr = parts[1];
        if (dayMap[buffDay] === currentUTCDay) {
            var timeParts = timeStr.split(':');
            var utcH = parseInt(timeParts[0]);
            var utcM = parseInt(timeParts[1]);
            var slotDate = new Date(now);
            slotDate.setUTCHours(utcH, utcM, 0, 0);
            var diffMs = slotDate.getTime() - now.getTime();
            if (diffMs > 570000 && diffMs <= 630000) {
                var attendees = window.allSlotsData[slotId].attendees || [];
                if (attendees.some(function(a) { return window.normalizeText(a.player) === myName; })) {
                    var notiKey = slotId + "_" + slotDate.toDateString();
                    var notified = JSON.parse(localStorage.getItem('notified_slots') || "{}");
                    if (!notified[notiKey]) {
                        new Notification("SVS Booking Alert ❄️", {
                            body: "Your buff [" + buffDay.toUpperCase() + " " + timeStr + " UTC] starts in 10 minutes!",
                            icon: "creator-dino.png"
                        });
                        notified[notiKey] = true;
                        localStorage.setItem('notified_slots', JSON.stringify(notified));
                    }
                }
            }
        }
    });
};
setInterval(window.checkUpcomingBookings, 30000);

window.renderStats = function() {
    var statsContainer = document.getElementById("statsContainer");
    var statsDiv = document.getElementById("allianceStats");
    if (!statsContainer || !statsDiv) return;
    
    var counts = {};
    var total = 0;
    Object.keys(window.allSlotsData).forEach(function(slotId) {
        var attendees = window.allSlotsData[slotId].attendees || [];
        attendees.forEach(function(a) {
            var ally = String(a.alliance || "Unknown").toUpperCase().trim();
            counts[ally] = (counts[ally] || 0) + 1;
            total++;
        });
    });
    
    if (total === 0) { statsContainer.style.display = "none"; return; } 
    else { statsContainer.style.display = "block"; }
    
    var sortedAllies = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
    var html = "";
    var colors = ['#f56565', '#4299e1', '#48bb78', '#ed8936', '#ed64a6', '#9f7aea', '#667eea'];
    
    sortedAllies.forEach(function(ally, index) {
        var count = counts[ally];
        var percent = Math.round((count / total) * 100);
        var barColor = colors[index % colors.length];
        
        html += "<div style='margin-bottom: 12px;'>";
        html += "  <div style='display: flex; justify-content: space-between; font-size: 13px; font-weight: 800; color: #4a5568; margin-bottom: 4px;'>";
        html += "    <span>[" + ally + "]</span>";
        html += "    <span>" + count + " (" + percent + "%)</span>";
        html += "  </div>";
        html += "  <div style='width: 100%; background: #edf2f7; border-radius: 6px; height: 10px; overflow: hidden;'>";
        html += "    <div style='width: " + percent + "%; background: " + barColor + "; height: 100%; border-radius: 6px; transition: width 0.5s ease;'></div>";
        html += "  </div>";
        html += "</div>";
    });
    statsDiv.innerHTML = html;
};

window.padTime = function(h, m) { return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); };
window.getLocalTimeStr = function(h, m) { return new Date(Date.UTC(2020, 0, 1, h, m, 0)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
window.normalizeText = function(v) { return String(v || "").trim().toLowerCase(); };
window.simpleHash = function(v) { var str = String(v || ""); var hash = 0; for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return "h_" + Math.abs(hash); };

window.getMinSpeedRequired = function() {
    var day = new Date().getUTCDay(); 
    var speeds = window.bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    if (day === 3) return Number(speeds.wed || 0); 
    if (day === 4) return Number(speeds.thu || 0); 
    if (day === 5) return Number(speeds.fri || 0); 
    return 0; 
};

window.openCustomAlert = function(msg) {
    var titleEl = document.getElementById("alert-modal-title");
    if(titleEl) titleEl.innerText = window.currentLang === 'ko' ? "⚠️ 안내" : "⚠️ Notice";
    var msgEl = document.getElementById("alertModalMessage");
    if(msgEl) msgEl.innerHTML = msg; 
    var modal = document.getElementById("alertModal");
    if(modal) modal.classList.add("show");
};

window.customConfirmCallback = null;
window.openCustomConfirm = function(msg, callback) {
    var titleEl = document.getElementById("confirm-modal-title");
    if(titleEl) titleEl.innerText = window.currentLang === 'ko' ? "⚠️ 확인" : "⚠️ Confirm";
    var msgEl = document.getElementById("confirmModalMessage");
    if(msgEl) msgEl.innerHTML = msg; 
    var cancelBtn = document.getElementById("btn-confirm-cancel");
    if (cancelBtn) cancelBtn.innerText = window.langPack[window.currentLang].cancelBtnSmall || "Cancel";
    var okBtn = document.getElementById("btn-confirm-ok");
    if (okBtn) okBtn.innerText = window.langPack[window.currentLang].confirmBtn || "Confirm";
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
    if(titleEl) titleEl.innerText = window.currentLang === 'ko' ? "가속 일수 수정" : "Edit Speed-up";
    var msgEl = document.getElementById("promptModalMessage");
    if(msgEl) msgEl.innerText = msg;
    var inputEl = document.getElementById("promptInputValue");
    if(inputEl) inputEl.value = defaultVal || "";
    var cancelBtn = document.getElementById("btn-prompt-cancel");
    if (cancelBtn) cancelBtn.innerText = window.langPack[window.currentLang].cancelBtnSmall;
    var confirmBtn = document.getElementById("btn-prompt-confirm");
    if (confirmBtn) confirmBtn.innerText = window.langPack[window.currentLang].confirmBtn;
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

window.changeLanguage = function(lang) { 
    window.currentLang = lang; 
    localStorage.setItem("svs_lang", lang); 
    window.applyLanguagePack(); 
    window.renderAll(); 
};

window.applyLanguagePack = function() {
    var p = window.langPack[window.currentLang] || window.langPack['en'];
    var langSelectEl = document.getElementById("langSelect");
    if (langSelectEl) langSelectEl.value = window.currentLang;
    
    var speeds = window.bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    var noticeKoEl = document.getElementById("notice-dynamic-txt");
    if (noticeKoEl) { 
        var rawTemplate = p.speedCond || "";
        var convertedTemplate = rawTemplate.replace("{wed}", speeds.wed).replace("{thu}", speeds.thu).replace("{fri}", speeds.fri);
        noticeKoEl.innerHTML = p.notice + "<br /><span style='color: #2d3748; font-weight: bold;'>" + convertedTemplate + "</span>";
    }
    
    var safeSetText = function(id, text) { var el = document.getElementById(id); if (el) el.innerText = text; };
    var safeSetPlaceholder = function(id, placeholder) { var el = document.getElementById(id); if (el) el.placeholder = placeholder; };

    safeSetText("tab-mon-txt", p.mon); safeSetText("tab-tue-txt", p.tue); safeSetText("tab-thu-txt", p.thu);
    safeSetText("opt-all", p.optAll); safeSetText("opt-mine", p.optMine);
    safeSetText("modal-title-txt", p.addTitle); safeSetText("btn-confirm-txt", p.confirmBtn); safeSetText("btn-close-txt", p.closeBtn);
    safeSetText("lang-help-msg", p.langHelp);
    safeSetText("adm-title-main", p.admTitle); safeSetText("adm-base-title", p.admBase); safeSetText("adm-base-save-btn", p.admSave);
    safeSetText("adm-manual-title", p.admManual); safeSetText("adm-visibility-title", p.admVis); safeSetText("adm-limits-title", p.admLimits);
    safeSetText("adm-schedule-title", p.admAuto); safeSetText("adm-schedule-save-btn", p.admSaveSched);
    safeSetText("adm-excel-btn", p.admExcel); safeSetText("adm-close-panel-btn", p.admClose);
    safeSetText("btn-admin-monday", p.mondayShort); safeSetText("btn-admin-tuesday", p.tuesdayShort); safeSetText("btn-admin-thursday", p.thursdayShort);
    safeSetText("btn-speed-monday", p.mondayShort); safeSetText("btn-speed-tuesday", p.tuesdayShort); safeSetText("btn-speed-thursday", p.thursdayShort);
    safeSetText("btn-admin-clear-all", p.btnAdminDel);
    safeSetPlaceholder("alliance", p.pAlliance); safeSetPlaceholder("player", p.pNickname);
    safeSetPlaceholder("playerId", p.pId); safeSetPlaceholder("daysSaved", p.pSpeed); safeSetPlaceholder("cancelKey", p.pPass);
    safeSetText("res-title-txt", p.statusTitle); safeSetText("cancel-label-txt", p.cancelLabel);
    safeSetPlaceholder("editCancelKey", p.cancelLabel);
    safeSetText("btn-cancel-txt", p.cancelBtn); safeSetText("btn-add-txt", p.addBookingBtn); safeSetText("btn-res-close-txt", p.closeBtn);
    safeSetText("btn-copy-txt", p.copyList || "Copy List");
    safeSetText("stats-title-txt", p.statsTitle || "📊 Alliance Stats");

    safeSetText("adm-open-lbl", p.admOpen);
    safeSetText("adm-global-close-lbl", p.admGlobalClose);
    safeSetText("adm-indiv-close-lbl", p.admIndivClose);

    var curvedEl = document.getElementById("curved-profile-txt"); if (curvedEl) curvedEl.textContent = p.curvedTxt;
    var confHeader = document.getElementById("confirmed-header-txt"); if (confHeader) confHeader.innerText = p.confirmedHeader;
};

// [스케줄 규칙 교정] 전체 오픈 시간 + (전체 마감 OR 개별 마감) 시간 판별
window.isTabActuallyOpen = function(day) { 
    if (!window.bookingSettings || !window.bookingSettings.tabs || !window.bookingSettings.tabs[day]) return true; 
    var s = window.bookingSettings.tabs[day], now = new Date(); 
    if (s.forceClosed === true) return false;
    if (s.forceOpen === true) return true;
    if (!s.isOpen) return false; 
    
    if (window.bookingSettings.globalOpenTime && now < new Date(window.bookingSettings.globalOpenTime)) return false; 
    if (window.bookingSettings.globalCloseTime && now > new Date(window.bookingSettings.globalCloseTime)) return false; 
    
    var cTime = window.bookingSettings.closeTimes ? window.bookingSettings.closeTimes[day] : null;
    if (cTime && now > new Date(cTime)) return false;

    return true; 
};

window.addAdminLog = function(msg) {
    if(!window.db) return;
    var now = new Date();
    var timeStr = "[" + now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,'0') + "-" + String(now.getDate()).padStart(2,'0') + " " + String(now.getHours()).padStart(2,'0') + ":" + String(now.getMinutes()).padStart(2,'0') + "]";
    var fullMsg = timeStr + " " + msg;
    var logs = window.bookingSettings.adminLogs || [];
    logs.unshift(fullMsg); 
    if(logs.length > 50) logs.pop(); 
    window.db.collection("settings").doc("booking").update({ adminLogs: logs }).catch(function(e){});
};

window.renderLogs = function() {
    var box = document.getElementById("logsBox");
    if(!box) return;
    var logs = window.bookingSettings.adminLogs || [];
    if(logs.length === 0) { box.innerHTML = "<div>[System] Log is empty...</div>"; } 
    else { box.innerHTML = logs.map(function(l) { return "<div>" + l + "</div>"; }).join(''); }
};

window.updateMyConfirmedSummary = function() {
    var el = document.getElementById("myConfirmedSection");
    var listEl = document.getElementById("confirmedList");
    if (!el || !listEl) return;
    var m = localStorage.getItem(window.MY_BOOKING_KEY);
    if (!m) { el.style.display = "none"; return; }
    var mine = JSON.parse(m), myName = window.normalizeText(mine.player);
    var confirmedTracks = [];
    Object.keys(window.allSlotsData).forEach(function(slotId) {
        var slot = window.allSlotsData[slotId];
        if(slot && slot.attendees) {
            slot.attendees.forEach(function(a) { 
                if (window.normalizeText(a.player) === myName) { 
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
    var p = window.langPack[window.currentLang] || window.langPack['en'];
    confirmedTracks.forEach(function(track) {
        var card = document.createElement("div"); card.className = "confirmedCard";
        var dayTxt = p[track.day + "Short"] || track.day;
        var displayTime = dayTxt + " " + track.time + " UTC";
        
        var timeSpan = document.createElement("span"); timeSpan.className = "confirmedTime"; timeSpan.innerText = displayTime;
        
        // [수정 완료] 구글 캘린더 대신 웹 푸시 알림 이식
        var notiBtn = document.createElement("button"); notiBtn.type = "button";
        notiBtn.style.padding = "4px 8px"; notiBtn.style.fontSize = "11px"; notiBtn.style.background = "#e2e8f0"; notiBtn.style.color = "#4a5568"; notiBtn.style.border = "none"; notiBtn.style.borderRadius = "6px"; notiBtn.style.fontWeight = "800"; notiBtn.style.cursor = "pointer";
        notiBtn.innerText = p.enableNoti || "🔔 Enable Alert";
        notiBtn.onclick = function() { window.requestNotification(); };
        
        card.appendChild(timeSpan); card.appendChild(notiBtn); listEl.appendChild(card);
    });
    el.style.display = "block";
};

// [필터링 및 렌더링 로직 수정] 특정 연맹을 선택하면 해당 연맹의 예약이 있는 슬롯만 노출!
window.renderAll = function() {
    var grid = document.getElementById("slots"); if (!grid) return; grid.innerHTML = "";
    var isOpen = window.isTabActuallyOpen(window.currentBuff), filter = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "all";
    document.querySelectorAll(".tab-item").forEach(function(item) { item.classList.toggle("active", item.id === "tab-" + window.currentBuff); });
    
    var showSpeeds = false;
    if (window.bookingSettings && window.bookingSettings.tabs && window.bookingSettings.tabs[window.currentBuff]) { showSpeeds = window.bookingSettings.tabs[window.currentBuff].showSpeeds || false; }
    if (window.adminAuthenticated) showSpeeds = true;
    var p = window.langPack[window.currentLang] || window.langPack['en'];
    var badgeDay = window.currentBuff.toUpperCase().slice(0,3);

    for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) {
            var startId = window.padTime(h, m);
            var eH = h + Math.floor((m + 30) / 60);
            var eM = (m + 30) % 60;
            var endId = (eH === 24) ? "00:00" : window.padTime(eH, eM);
            
            var id = window.currentBuff + "_" + startId;
            var slot = window.allSlotsData[id] || {};
            var attendees = slot.attendees || [];
            
            // [연맹 대소문자 무관 필터링 엔진 장착]
            if (filter !== "all") {
                if (filter === "mine") {
                    var myStored = localStorage.getItem(window.MY_BOOKING_KEY);
                    var myName = myStored ? window.normalizeText(JSON.parse(myStored).player) : "";
                    if (!attendees.some(function(a) { return window.normalizeText(a.player) === myName; })) continue;
                } else {
                    // 특정 연맹 필터 시 (대/소문자 통일 후 비교)
                    if (!attendees.some(function(a) { return String(a.alliance || "").toUpperCase().trim() === filter; })) continue;
                }
            }
            
            var closedList = window.bookingSettings.closedSlots || [];
            var isSpecificallyClosed = closedList.includes(id);
            var effectivelyOpen = isOpen && !isSpecificallyClosed;
            
            var div = document.createElement("div"); 
            var isMine = attendees.some(function(a) { return window.normalizeText(a.player) === window.normalizeText(localStorage.getItem(window.MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(window.MY_BOOKING_KEY)).player : ""); });
            var slotClass = "slot " + (h >= 12 ? "pm-slot " : "") + (!effectivelyOpen ? " locked" : "") + (isMine ? " myReservation" : "");
            div.className = slotClass;
            
            if (attendees.length > 0) {
                if (isMine) {
                    div.style.setProperty("background-color", "#e8f5e9", "important"); 
                    div.style.setProperty("border-color", "#2ecc71", "important"); 
                    div.style.setProperty("border-width", "2px", "important");
                } else {
                    div.style.setProperty("background-color", "#eaedf2", "important"); 
                    div.style.setProperty("border-color", "#cbd5e1", "important"); 
                    div.style.setProperty("border-width", "1px", "important");
                }
            }
            
            var displayList = attendees.slice();
            var listHtml = displayList.slice(0,1).map(function(a) { 
                var speedText = showSpeeds ? " (" + a.daysSaved + p.speedUnit + ")" : "";
                // 출력 시 연맹 이름을 대문자로 강제 통일하여 렌더링
                var formattedAlly = String(a.alliance).toUpperCase();
                return "<div class='miniItem' style='font-size:15px; font-weight:800; padding:6px 0; justify-content:center; color:#2d3748;'><span>[" + formattedAlly + "] " + a.player + speedText + "</span></div>"; 
            }).join('');
            
            var reqSpeed = window.getMinSpeedRequired();
            var conditionSuffix = "";
            if (reqSpeed > 0 && window.currentLang === 'ko') { conditionSuffix = " (" + reqSpeed + "일 이상)"; }
            else if (reqSpeed > 0) { conditionSuffix = " (Req: " + reqSpeed + p.speedUnit + "+)"; }
            var noResTxt = "<div style='color:#a0aec0; font-size:13px; font-weight:500;'>" + p.noRes + conditionSuffix + "</div>";
            
            var lockMark = isSpecificallyClosed ? " <span style='color:red;'>🔒</span>" : "";
            div.innerHTML = "<div class=\"dayBadge\">" + badgeDay + "</div><div class=\"timeRow\"><span>" + startId + "~" + endId + " UTC" + lockMark + "</span></div><div class=\"localTime\">Local: " + window.getLocalTimeStr(h,m) + "</div><div class=\"attendeeMiniList\">" + (listHtml || noResTxt) + "</div>";
            
            (function(savedId, savedOpen) { div.onclick = function() { window.handleSlotClick(savedId, savedOpen); }; })(id, effectivelyOpen);
            grid.appendChild(div);
        }
    }
    window.updateMyConfirmedSummary();
    window.renderStats();
};

window.updateAdminUI = function() { 
    if(!window.bookingSettings || !window.bookingSettings.tabs) return;
    ['monday', 'tuesday', 'thursday'].forEach(function(day) { 
        if(!window.bookingSettings.tabs[day]) return;
        var btn = document.getElementById("btn-admin-" + day); 
        if (btn) { 
            var currentlyOpen = window.isTabActuallyOpen(day);
            btn.classList.toggle("on", currentlyOpen); 
        } 
        var sBtn = document.getElementById("btn-speed-" + day); 
        if (sBtn) { sBtn.classList.toggle("on-speed", window.bookingSettings.tabs[day].showSpeeds); } 
    }); 
};

window.lastOpenStatus = null;
window.updateStatusMessage = function() { 
    var el = document.getElementById("bookingStatusMsg"); 
    if(!el) return;
    
    var isOpen = window.isTabActuallyOpen(window.currentBuff);
    var p = window.langPack[window.currentLang] || window.langPack['en'];
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

    var cOpen = window.bookingSettings.globalOpenTime ? new Date(window.bookingSettings.globalOpenTime) : null;
    var cGlobal = window.bookingSettings.globalCloseTime ? new Date(window.bookingSettings.globalCloseTime) : null;
    var cIndiv = (window.bookingSettings.closeTimes && window.bookingSettings.closeTimes[window.currentBuff]) ? new Date(window.bookingSettings.closeTimes[window.currentBuff]) : null;

    var actualClose = null;
    if (cGlobal && cIndiv) { actualClose = cGlobal < cIndiv ? cGlobal : cIndiv; } 
    else if (cGlobal) { actualClose = cGlobal; } 
    else if (cIndiv) { actualClose = cIndiv; }

    if (isOpen) {
        if (actualClose) {
            var diff = actualClose - now;
            if (diff > 0) { el.innerHTML = "✅ " + (window.currentLang === 'ko' ? "예약 가능 (마감까지 " : "Booking Open (Closes in ") + formatTime(diff) + ")"; } 
            else { el.innerText = p.openAvailable; }
        } else { el.innerText = p.openAvailable; }
    } else {
        if (cOpen && now < cOpen) {
            var diffOpen = cOpen - now;
            if (diffOpen > 0) { el.innerHTML = "🔒 " + (window.currentLang === 'ko' ? "예약 대기 (오픈까지 " : "Booking Queue (Opens in ") + formatTime(diffOpen) + ")"; } 
            else { el.innerText = p.openClosed; }
        } else { el.innerText = p.openClosed; }
    }

    if (window.lastOpenStatus !== null && window.lastOpenStatus !== isOpen) { window.renderAll(); }
    window.lastOpenStatus = isOpen;
};

window.updateCountdown = function() { 
    if (!window.bookingSettings || !window.bookingSettings.baseDate) return; 
    var diff = new Date(window.bookingSettings.baseDate) - new Date(); 
    while(diff <= 0) diff += 28 * 24 * 60 * 60 * 1000; 
    var d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); 
    if(document.getElementById("countdown")) document.getElementById("countdown").innerText = "Next SVS in " + d + "d " + h + "h " + m + "m " + s + "s"; 
    window.updateStatusMessage();
};

window.switchBuff = function(b) { window.currentBuff = b; window.updateStatusMessage(); window.renderAll(); };
window.clearSearch = function() { window.renderAll(); };
window.closeModal = function() { document.getElementById("modal").classList.remove("show"); };
window.closeReservedModal = function() { document.getElementById("reservedModal").classList.remove("show"); };
window.closeAdmin = function() { document.getElementById("adminPanel").classList.remove("show"); };

window.updateIndicator = function(dateId, timeId, indId) {
    var dEl = document.getElementById(dateId), tEl = document.getElementById(timeId), iEl = document.getElementById(indId);
    if(!dEl || !tEl || !iEl) return;
    if(dEl.value && tEl.value) {
        iEl.textContent = "ON"; iEl.style.background = "#2ecc71"; iEl.style.color = "white";
    } else {
        iEl.textContent = "OFF"; iEl.style.background = "#e2e8f0"; iEl.style.color = "#718096";
    }
};
window.attachIndicatorEvents = function() {
    var pairs = [
        ['open-date', 'open-time', 'ind-open'],
        ['global-close-date', 'global-close-time', 'ind-global-close'],
        ['close-mon-date', 'close-mon-time', 'ind-close-mon'],
        ['close-tue-date', 'close-tue-time', 'ind-close-tue'],
        ['close-thu-date', 'close-thu-time', 'ind-close-thu']
    ];
    pairs.forEach(function(p) {
        var dEl = document.getElementById(p[0]), tEl = document.getElementById(p[1]);
        var updateFn = function() { window.updateIndicator(p[0], p[1], p[2]); };
        if(dEl) dEl.addEventListener('change', updateFn);
        if(tEl) tEl.addEventListener('change', updateFn);
    });
};

window.fillAdminInputs = function() { 
    if (!window.bookingSettings) return; 
    var bDate = window.splitDateTime(window.bookingSettings.baseDate || "2026-05-23T21:00");
    if(document.getElementById("adminBaseDate")) document.getElementById("adminBaseDate").value = bDate.date;
    if(document.getElementById("adminBaseTime")) document.getElementById("adminBaseTime").value = bDate.time;
    
    var oTime = window.splitDateTime(window.bookingSettings.globalOpenTime);
    if(document.getElementById("open-date")) document.getElementById("open-date").value = oTime.date;
    if(document.getElementById("open-time")) document.getElementById("open-time").value = oTime.time;

    var gcTime = window.splitDateTime(window.bookingSettings.globalCloseTime);
    if(document.getElementById("global-close-date")) document.getElementById("global-close-date").value = gcTime.date;
    if(document.getElementById("global-close-time")) document.getElementById("global-close-time").value = gcTime.time;
    
    var cT = window.bookingSettings.closeTimes || {};
    var cmTime = window.splitDateTime(cT.monday);
    if(document.getElementById("close-mon-date")) document.getElementById("close-mon-date").value = cmTime.date;
    if(document.getElementById("close-mon-time")) document.getElementById("close-mon-time").value = cmTime.time;
    
    var ctTime = window.splitDateTime(cT.tuesday);
    if(document.getElementById("close-tue-date")) document.getElementById("close-tue-date").value = ctTime.date;
    if(document.getElementById("close-tue-time")) document.getElementById("close-tue-time").value = ctTime.time;
    
    var cthTime = window.splitDateTime(cT.thursday);
    if(document.getElementById("close-thu-date")) document.getElementById("close-thu-date").value = cthTime.date;
    if(document.getElementById("close-thu-time")) document.getElementById("close-thu-time").value = cthTime.time;
    
    var speeds = window.bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    if(document.getElementById("speed-req-wed")) document.getElementById("speed-req-wed").value = speeds.wed;
    if(document.getElementById("speed-req-thu")) document.getElementById("speed-req-thu").value = speeds.thu;
    if(document.getElementById("speed-req-fri")) document.getElementById("speed-req-fri").value = speeds.fri;

    window.attachIndicatorEvents();
    window.updateIndicator('open-date', 'open-time', 'ind-open');
    window.updateIndicator('global-close-date', 'global-close-time', 'ind-global-close');
    window.updateIndicator('close-mon-date', 'close-mon-time', 'ind-close-mon');
    window.updateIndicator('close-tue-date', 'close-tue-time', 'ind-close-tue');
    window.updateIndicator('close-thu-date', 'close-thu-time', 'ind-close-thu');
};

window.openReserveFromStatus = function() { 
    if(!window.isTabActuallyOpen(window.currentBuff) && !window.adminAuthenticated) return; 
    var slot = window.allSlotsData[window.selectedSlot] || {};
    var attendees = slot.attendees || [];
    if (attendees.length > 0) {
        window.editSpecificBooking();
    } else {
        window.closeReservedModal(); 
        window.openReserveModal(); 
    }
};

window.openReserveModal = function() { 
    var m = localStorage.getItem(window.MY_BOOKING_KEY); 
    if(m) { 
        var mine = JSON.parse(m); 
        document.getElementById("alliance").value = mine.alliance || ""; 
        document.getElementById("player").value = mine.player || ""; 
        document.getElementById("playerId").value = mine.playerId || ""; 
        document.getElementById("cancelKey").value = mine.cancelKey || ""; 
    } else {
        document.getElementById("alliance").value = ""; 
        document.getElementById("player").value = ""; 
        document.getElementById("playerId").value = ""; 
        document.getElementById("cancelKey").value = ""; 
    }
    document.getElementById("daysSaved").value = ""; 
    
    document.getElementById("selectedSlotInfo").innerText = window.selectedSlot.replace('_', ' ') + " UTC"; 
    document.getElementById("modal").classList.add("show"); 
};

window.openReservedModal = function(id) { 
    document.getElementById("reservedSlotInfo").innerText = id.replace('_', ' ') + " UTC"; 
    var list = document.getElementById("attendeeListDetail"); 
    if(!list) return;
    list.innerHTML = ""; 
    
    var p = window.langPack[window.currentLang] || window.langPack['en'];
    var isSpecificallyClosed = window.bookingSettings.closedSlots && window.bookingSettings.closedSlots.includes(id);
    var effectivelyOpen = window.isTabActuallyOpen(window.currentBuff) && !isSpecificallyClosed;

    if (window.adminAuthenticated) {
        var toggleCloseBtn = document.createElement("button");
        toggleCloseBtn.innerText = effectivelyOpen ? p.slotCloseBtn : p.slotOpenBtn;
        toggleCloseBtn.className = effectivelyOpen ? "btn-danger" : "btn-primary";
        toggleCloseBtn.style.padding = "8px 16px"; toggleCloseBtn.style.fontSize = "12px"; toggleCloseBtn.style.fontWeight = "800"; toggleCloseBtn.style.width = "100%"; toggleCloseBtn.style.marginBottom = "15px"; toggleCloseBtn.style.borderRadius = "8px"; toggleCloseBtn.style.border = "none"; toggleCloseBtn.style.cursor = "pointer";
        toggleCloseBtn.onclick = function() { window.toggleSpecificSlot(id); };
        list.appendChild(toggleCloseBtn);
        
        var hr = document.createElement("hr"); hr.style.marginBottom = "15px"; list.appendChild(hr);
    }
    
    var slot = window.allSlotsData[id] || {};
    var attendees = slot.attendees || [];
    var htmlCancelArea = document.querySelector("#reservedModal .cancelArea");

    if (!effectivelyOpen && !window.adminAuthenticated) { 
        list.innerHTML += "<div style='padding:20px; font-weight:800; color:#e53935; text-align:center;'>" + p.closedAlert + "</div>"; 
        if(htmlCancelArea) htmlCancelArea.style.display = "none";
    } else if (attendees.length === 0) { 
        var addBtn = document.createElement("button");
        addBtn.innerText = p.addTitle; 
        addBtn.className = "btn-primary";
        addBtn.style.padding = "10px 16px"; addBtn.style.fontSize = "14px"; addBtn.style.fontWeight = "800"; addBtn.style.width = "100%"; addBtn.style.borderRadius = "8px"; addBtn.style.border = "none"; addBtn.style.cursor = "pointer";
        addBtn.onclick = function() { window.closeReservedModal(); window.openReserveModal(); };
        list.appendChild(addBtn);

        if(htmlCancelArea) htmlCancelArea.style.display = "none";
    } else {
        var displayList = attendees.slice();
        displayList.forEach(function(a) { 
            var d = document.createElement("div"); 
            d.className = "miniItem"; 
            d.style.display = "flex"; d.style.justifyContent = "space-between"; d.style.alignItems = "center"; d.style.margin = "4px 0";
            
            var mainWrapper = document.createElement("div");
            mainWrapper.style.display = "flex"; mainWrapper.style.justifyContent = "space-between"; mainWrapper.style.width = "100%"; mainWrapper.style.alignItems = "center";
            
            var textSpan = document.createElement("span");
            textSpan.innerHTML = "[" + String(a.alliance).toUpperCase() + "] " + a.player;
            
            var speedSpan = document.createElement("span");
            if (window.adminAuthenticated) {
                speedSpan.innerHTML = " (" + a.daysSaved + "d)";
            } else {
                speedSpan.innerHTML = "";
            }
            
            mainWrapper.appendChild(textSpan); mainWrapper.appendChild(speedSpan);
            d.appendChild(mainWrapper);
            
            var btnGroup = document.createElement("div");
            btnGroup.style.display = "flex"; btnGroup.style.gap = "4px"; btnGroup.style.marginLeft = "10px";
            
            if (window.adminAuthenticated) { 
                var delBtn = document.createElement("button"); delBtn.innerText = p.delBtn; delBtn.className = "btn-danger"; delBtn.style.padding = "4px 8px"; delBtn.style.fontSize = "11px"; delBtn.style.flex = "none"; delBtn.style.width = "auto"; delBtn.onclick = function() { window.deleteAttendeeById(id, a.id); }; btnGroup.appendChild(delBtn); 
            } 
            
            if(btnGroup.childNodes.length > 0) d.appendChild(btnGroup);
            list.appendChild(d); 
        }); 

        if(htmlCancelArea) {
            htmlCancelArea.style.display = "block";
            var pwdInput = document.getElementById("editCancelKey");
            if(pwdInput) pwdInput.value = ""; 
        }
    }
    
    var reservedModal = document.getElementById("reservedModal");
    if(reservedModal) reservedModal.classList.add("show"); 
};

window.handleSlotClick = function(id, effectivelyOpen) {
    var p = window.langPack[window.currentLang] || window.langPack['en'];
    if(!effectivelyOpen && !window.adminAuthenticated) return window.openCustomAlert(p.closedAlert);
    window.selectedSlot = id;
    
    var slot = window.allSlotsData[id] || {};
    var attendees = slot.attendees || [];
    if (attendees.length === 0 && !window.adminAuthenticated) {
        window.openReserveModal();
    } else {
        window.openReservedModal(id);
    }
};

window.handleAdminAccess = function() { 
    window.sc++; 
    if(window.sc>=3) { 
        window.sc=0; 
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
        window.adminAuthenticated = true;
        window.closeAdminLogin();
        document.getElementById("adminPanel").classList.add("show");
        window.fillAdminInputs(); 
        window.updateAdminUI();
        window.renderAll();
        window.addAdminLog("관리자가 로그인했습니다.");
    } else {
        window.openCustomAlert(window.currentLang === 'ko' ? "비밀번호가 일치하지 않습니다." : "Invalid Password.");
        document.getElementById("adminLoginPwd").value = "";
        document.getElementById("adminLoginPwd").focus();
    }
};

window.toggleTabStatus = function(day) { 
    if (!window.db || !window.bookingSettings.tabs || !window.bookingSettings.tabs[day]) return; 
    var currentlyOpen = window.isTabActuallyOpen(day);
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
    if (!window.db || !window.bookingSettings.tabs || !window.bookingSettings.tabs[day]) return; 
    var newStatus = !(window.bookingSettings.tabs[day].showSpeeds || false); 
    var path = "tabs." + day + ".showSpeeds"; 
    var obj = {}; obj[path] = newStatus; 
    window.db.collection("settings").doc("booking").update(obj).then(function() {
        window.addAdminLog("[" + day + "] 가속 노출 상태 변경: " + (newStatus ? "ON" : "OFF"));
    });
};

window.toggleSpecificSlot = function(slotId) { 
    if (!window.db) return; 
    var closedList = window.bookingSettings.closedSlots || []; 
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
    var p = window.langPack[window.currentLang] || window.langPack['en'];
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

window.exportAllCSV = function() { 
    try { 
        if (typeof XLSX === 'undefined') return window.openCustomAlert("XLSX Loading..."); 
        var wb = XLSX.utils.book_new(); 
        var hasData = false;
        
        ["monday", "tuesday", "thursday"].forEach(function(day) { 
            var rows = []; 
            Object.keys(window.allSlotsData).filter(function(k) { return k.startsWith(day); }).forEach(function(slotId) { 
                var timeStr = slotId.split('_')[1]; 
                var attendees = window.allSlotsData[slotId].attendees || []; 
                attendees.forEach(function(a) { 
                    rows.push({ "Day": day.toUpperCase(), "Time(UTC)": timeStr, "Alliance": String(a.alliance).toUpperCase(), "Nickname": a.player, "PlayerID": a.playerId, "SpeedDays": a.daysSaved }); 
                }); 
            }); 
            if (rows.length > 0) { 
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), day); 
                hasData = true;
            } 
        }); 
        
        if (!hasData) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ "Message": "No bookings yet" }]), "Empty");
        }
        XLSX.writeFile(wb, "SVS_Booking.xlsx"); 
    } catch (e) { 
        console.error(e);
        window.openCustomAlert("Export Failed: " + e.message); 
    } 
};

window.confirmBooking = function() {
    var p = window.langPack[window.currentLang] || window.langPack['en'];
    var a = document.getElementById("alliance").value, nickname = document.getElementById("player").value, idNum = document.getElementById("playerId").value, d = document.getElementById("daysSaved").value, pass = document.getElementById("cancelKey").value;
    
    if(!a || !nickname || !idNum || !d || !pass) return window.openCustomAlert(p.errFillAll);
    if(idNum.length !== 9) return window.openCustomAlert(p.errIdDigit);

    var requiredSpeed = window.getMinSpeedRequired();
    if (Number(d) < requiredSpeed) {
        var msg = window.currentLang === 'ko' ? "오늘 기준 예약은 가속 " + requiredSpeed + "일 이상 보유자만 가능합니다." : "Today's booking requires at least " + requiredSpeed + " days of speed-ups.";
        return window.openCustomAlert(msg);
    }

    var slot = window.allSlotsData[window.selectedSlot] || {};
    var currentAttendees = slot.attendees || [];
    if (currentAttendees.length >= 1 && !window.adminAuthenticated) {
        return window.openCustomAlert(window.currentLang === 'ko' ? "이미 선착순 예약이 마감된 타임 슬롯입니다." : "This slot has already been taken.");
    }

    var alreadyBooked = false;
    Object.keys(window.allSlotsData).forEach(function(slotId) {
        if (slotId.startsWith(window.currentBuff)) { 
            var s = window.allSlotsData[slotId];
            var attendees = s ? (s.attendees || []) : [];
            if (attendees.some(function(attendee) { return window.normalizeText(attendee.player) === window.normalizeText(nickname); })) { alreadyBooked = true; }
        }
    });

    if (alreadyBooked && !window.adminAuthenticated) { 
        return window.openCustomAlert(window.currentLang === 'ko' ? "이 요일에는 이미 예약된 내역이 있습니다.<br />(월/화/목 요일별 각 1회만 가능)" : "You have already booked a slot for this day.<br />(1 booking per day allowed)"); 
    }

    var entryId = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    var newEntry = { id: entryId, alliance: a, player: nickname, playerId: idNum, playerNormalized: window.normalizeText(nickname), daysSaved: Number(d), passwordHash: window.simpleHash(pass), createdAt: Date.now() };
    
    var unionFn = null;
    try {
        if (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) {
            unionFn = window.firebase.firestore.FieldValue.arrayUnion;
        } else if (window.firebase && window.firebase.FieldValue) {
            unionFn = window.firebase.FieldValue.arrayUnion;
        }
    } catch(e) {}

    if (!unionFn) {
        return window.openCustomAlert("Firebase initialization mismatch. Please refresh the page.");
    }

    window.db.collection("slots").doc(window.selectedSlot).set({ attendees: unionFn(newEntry) }, {merge: true}).then(function() { 
        localStorage.setItem(window.MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: nickname, playerId: idNum, cancelKey: pass })); 
        window.closeModal(); 
        window.renderAll(); 
    }).catch(function(err) {
        window.openCustomAlert("Database write failed: " + err.message);
    });
};

window.editSpecificBooking = function() {
    var p = window.langPack[window.currentLang] || window.langPack['en'], pass = document.getElementById("editCancelKey").value;
    if(!pass) return window.openCustomAlert(p.errFill);
    var slotId = window.selectedSlot;
    var ref = window.db.collection("slots").doc(slotId);
    ref.get().then(function(doc) {
        if(!doc.exists) return;
        var list = doc.data().attendees || [];
        var target = list.find(function(a) { return a.passwordHash === window.simpleHash(pass); });
        if(!target) return window.openCustomAlert(p.errWrongPass);
        
        window.openCustomPrompt(p.promptEdit, target.daysSaved, function(newDays) {
            if(newDays === null || newDays.trim() === "") return;
            if(isNaN(newDays)) return window.openCustomAlert(p.errNan);
            target.daysSaved = Number(newDays);
            ref.update({ attendees: list }).then(function() { window.openReservedModal(slotId); window.renderAll(); });
        });
    });
};

window.confirmCancelAll = function() {
    var p = window.langPack[window.currentLang] || window.langPack['en'], pass = document.getElementById("editCancelKey").value;
    if(!pass) return window.openCustomAlert(p.errFill);
    
    var ref = window.db.collection("slots").doc(window.selectedSlot);
    ref.get().then(function(doc) {
        if (!doc.exists) return;
        var list = doc.data().attendees || [];
        if (list.length === 0) return window.openCustomAlert(p.errNoRes);
        
        var isPassCorrect = list.some(function(a) { return a.passwordHash === window.simpleHash(pass); });
        if (!isPassCorrect) return window.openCustomAlert(p.errWrongPass);
        
        var updatedList = list.filter(function(a) { return a.passwordHash !== window.simpleHash(pass); });
        ref.update({ attendees: updatedList }).then(function() { 
            window.closeReservedModal(); 
            window.renderAll(); 
        });
    });
};

window.saveAutoSchedule = function() { 
    if(!window.db) return; 
    
    var goD = document.getElementById("open-date").value;
    var goT = document.getElementById("open-time").value;
    window.bookingSettings.globalOpenTime = window.combineDateTime(goD, goT);
    
    var gcD = document.getElementById("global-close-date").value;
    var gcT = document.getElementById("global-close-time").value;
    window.bookingSettings.globalCloseTime = window.combineDateTime(gcD, gcT);
    
    window.bookingSettings.closeTimes = {
        monday: window.combineDateTime(document.getElementById("close-mon-date").value, document.getElementById("close-mon-time").value),
        tuesday: window.combineDateTime(document.getElementById("close-tue-date").value, document.getElementById("close-tue-time").value),
        thursday: window.combineDateTime(document.getElementById("close-thu-date").value, document.getElementById("close-thu-time").value)
    };
    
    window.bookingSettings.minSpeeds = {
        wed: Number(document.getElementById("speed-req-wed").value || 0),
        thu: Number(document.getElementById("speed-req-thu").value || 0),
        fri: Number(document.getElementById("speed-req-fri").value || 0)
    };

    window.bookingSettings.closedSlots = []; 
    ['monday', 'tuesday', 'thursday'].forEach(function(day) {
        if(window.bookingSettings.tabs[day]) {
            window.bookingSettings.tabs[day].isOpen = true;
            window.bookingSettings.tabs[day].forceOpen = false;
            window.bookingSettings.tabs[day].forceClosed = false;
        }
    });
    
    window.db.collection("settings").doc("booking").set(window.bookingSettings, {merge: true}).then(function() { 
        window.addAdminLog("통합 스케줄 및 요일별 하한 가속 데이터를 업데이트했습니다.");
        window.openCustomAlert(window.langPack[window.currentLang].promptSaved || "Saved!"); 
    }); 
};

window.saveAdminBaseDate = function() { 
    if(!window.db) return; 
    var d = document.getElementById("adminBaseDate").value; 
    var t = document.getElementById("adminBaseTime").value;
    var val = window.combineDateTime(d, t);
    if(!val) return; 
    window.db.collection("settings").doc("booking").update({baseDate: val}).then(function() { 
        window.addAdminLog("SVS 카운트다운 기준 시간을 변경했습니다.");
        window.openCustomAlert(window.langPack[window.currentLang].promptSaved || "Saved!"); 
    }); 
};

window.backupAndClearAll = function() { 
    if(!window.db) return; 
    var p = window.langPack[window.currentLang] || window.langPack['en'];
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

window.init = function() {
    if(!window.db) { setTimeout(window.init, 200); return; }
    
    window.initSnowEffect();

    window.db.collection("settings").doc("booking").onSnapshot(function(doc) { 
        if(doc.exists) { 
            var data = doc.data();
            window.bookingSettings.baseDate = data.baseDate || "2026-05-23T21:00:00";
            window.bookingSettings.globalOpenTime = data.globalOpenTime || "";
            window.bookingSettings.globalCloseTime = data.globalCloseTime || "";
            
            if (!data.closeTimes) {
                window.bookingSettings.closeTimes = {
                    monday: data.globalCloseTime || "",
                    tuesday: data.globalCloseTime || "",
                    thursday: data.globalCloseTime || ""
                };
            } else {
                window.bookingSettings.closeTimes = data.closeTimes;
            }
            
            window.bookingSettings.closedSlots = data.closedSlots || [];
            window.bookingSettings.adminLogs = data.adminLogs || [];
            window.bookingSettings.minSpeeds = data.minSpeeds || { wed: 50, thu: 30, fri: 15 };
            
            if (data.tabs) {
                window.bookingSettings.tabs.monday = data.tabs.monday || { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false };
                window.bookingSettings.tabs.tuesday = data.tabs.tuesday || { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false };
                window.bookingSettings.tabs.thursday = data.tabs.thursday || { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false };
            }
        } else {
            window.db.collection("settings").doc("booking").set(window.bookingSettings).catch(function(e){});
        }
        window.applyLanguagePack(); window.updateStatusMessage(); window.updateAdminUI(); window.renderLogs(); window.renderAll(); 
    }, function(error) { console.log("Settings load error:", error); });

    window.db.collection("slots").onSnapshot(function(snap) { 
        window.allSlotsData = {}; 
        snap.forEach(function(doc) { window.allSlotsData[doc.id] = doc.data(); }); 
        window.renderAll(); 
    }, function(error) { console.log("Slots load error:", error); });
    
    if(window.countdownInterval) clearInterval(window.countdownInterval);
    window.countdownInterval = setInterval(function() { window.updateCountdown(); }, 1000);
};

if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", window.init); } else { window.init(); }

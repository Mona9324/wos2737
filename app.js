window.currentBuff = "monday";
window.selectedSlot = null;
window.allSlotsData = {};
window.MY_BOOKING_KEY = "svs_my_booking_info";
window.currentLang = localStorage.getItem("svs_lang") || "en"; 

window.bookingSettings = { 
    baseDate: "2026-05-23T21:00:00", 
    globalOpenTime: "", 
    closeTimes: { monday: "", tuesday: "", thursday: "" }, 
    closedSlots: [], 
    adminLogs: [], 
    minSpeeds: { wed: 50, thu: 30, fri: 15 }, 
    speedLimitEnforced: false, 
    tabs: { 
        monday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false }, 
        tuesday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false }, 
        thursday: { isOpen: true, showSpeeds: false, forceOpen: false, forceClosed: false } 
    } 
};
window.adminAuthenticated = false;
window.sc = 0;

window.langPack = {
    ko: { 
        notice: "📢 요일별 1인 1타임만 예약 가능합니다.", 
        speedCond: "[예약 오픈 조건] 수요일: 가속 {wed}일 이상 | 목요일: {thu}일 이상 | 금요일: {fri}일 이상 | 토~일요일: 자유 예약",
        speedFree: "[현재 제한 없음] 누구나 자유롭게 예약 가능",
        langHelp: "(상단 메뉴로 언어를 변경할 수 있습니다.)",
        curvedTxt: "예약사이트 이용료는 Mona의 섬 💚+1", confirmedHeader: "👑 내 예약 시간", 
        mon: "월요일 (연구)", tue: "화요일 (건설)", thu: "목요일 (훈련)", 
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
        admOpen: "전체오픈", admIndivClose: "요일별 개별 마감:",
        pinBooking: "내 예약으로 고정"
    },
    en: { 
        notice: "📢 1 Booking Per Person Per Day.", 
        speedCond: "[Requirements] Wed: {wed}d+ | Thu: {thu}d+ | Fri: {fri}d+ | Sat~Sun: Free Booking",
        speedFree: "[No Limits Currently] Free to book",
        langHelp: "(You can change the language using the menu above.)",
        curvedTxt: "The website usage fee is Mona's Island 💚+1", confirmedHeader: "👑 My Booked Buffs", 
        mon: "Monday (Research)", tue: "Tuesday (Construction)", thu: "Thursday (Troops Training)", 
        mondayShort: "Monday", tuesdayShort: "Tuesday", thursdayShort: "Thursday", optAll: "All", optMine: "My Bookings", 
        openAvailable: "✅ Booking Open", openClosed: "🔒 Booking Closed", pers: "Pers.", noRes: "Available", 
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close", statusTitle: "Booking Status", 
        cancelLabel: "Cancellation Password", cancelBtn: "Cancel Booking", addBookingBtn: "Modify Booking", 
        closedAlert: "Reservation Closed.", speedUnit: "d", 
        pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Nickname", pId: "Player ID (9 digits)", pSpeed: "Speed-up Days", pPass: "Password for cancellation (Any password)", 
        editBtn: "Edit", cancelBtnSmall: "Cancel", delBtn: "Delete", slotOpenBtn: "🔓 Open", slotCloseBtn: "🔒 Close", 
        errFill: "Please enter your password first.", errWrongPass: "Wrong password.", errNoRes: "Reservation not found.", errFillAll: "Please fill all fields.", errIdDigit: "ID must be exactly 9 digits.", promptEdit: "Enter new speed-up days:", errNan: "Invalid number.", promptDelete: "Are you sure?", 
        promptClear: "Delete all booking data?<br />(This action will be logged)", 
        btnAdminDel: "🚨 Clear All Bookings", promptSaved: "Saved!",
        admTitle: "👑 Admin System", admBase: "Set Base Date", admSave: "Save", admManual: "Manual Booking Control", admVis: "Speed-up Visibility", admLimits: "Dynamic Speed Limits", admAuto: "Auto Schedule", admSaveSched: "Save Schedule", admExcel: "Excel Export", admClose: "Close",
        copyList: "Copy List", copySuccess: "The booking list has been copied to your clipboard!", enableNoti: "🔔 Enable Alerts", notiSuccess: "Alerts enabled! We will notify you 10 mins before your slot.", statsTitle: "📊 Alliance Stats",
        admOpen: "Global Open", admIndivClose: "Individual Close by Day:",
        pinBooking: "Pin as My Booking"
    },
    zh: { 
        notice: "📢 每人每天限预约1次。", 
        speedCond: "[条件] 周三: 加速 {wed}天+ | 周四: {thu}天+ | 周五: {fri}天+ | 周六~周日: 自由预约",
        speedFree: "[当前无限制] 所有人均可自由预约",
        langHelp: "(您可以上方菜单更改语言)",
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1", confirmedHeader: "👑 我的确定的增益时间", 
        mon: "星期一 (研究)", tue: "星期二 (建筑)", thu: "星期四 (训练)", mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四", optAll: "全部", optMine: "我的预约", openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止", pers: "人", noRes: "预约开放", addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭", statusTitle: "预约状态", 
        cancelLabel: "取消专用密码", cancelBtn: "取消预约", addBookingBtn: "修改预约", 
        closedAlert: "预约已截止。", speedUnit: "天", pAlliance: "联盟 (ZYZ, BUG, ZTP 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消的密码 (任意输入)", 
        editBtn: "修改", cancelBtnSmall: "取消", delBtn: "删除", slotOpenBtn: "🔓 开放", slotCloseBtn: "🔒 关闭", errFill: "请先在下方输入您的密码。", errWrongPass: "密码错误。", errNoRes: "找不到预约数据。", errFillAll: "必须填写所有字段。", errIdDigit: "玩家ID必须为9位数字。", promptEdit: "请输入新的加速天数（仅限数字）:", errNan: "只能输入数字格式。", promptDelete: "确定要删除吗？", promptClear: "确定要删除所有预约数据吗？<br />（此操作将被记录）", btnAdminDel: "🚨 删除所有预约", promptSaved: "已保存！",
        admTitle: "👑 管理员系统", admBase: "设置基准日期", admSave: "保存", admManual: "手动预约控制", admVis: "加速可见性控制", admLimits: "最低加速条件调整", admAuto: "自动时间设置", admSaveSched: "保存时间表", admExcel: "导出Excel", admClose: "关闭",
        copyList: "复制名单", copySuccess: "今日预约名单已复制到剪贴板！", enableNoti: "🔔 开启提醒", notiSuccess: "提醒已启用！我们将在预约前10分钟通知您。", statsTitle: "📊 联盟预约统计",
        admOpen: "全局开放", admIndivClose: "按天单独关闭:",
        pinBooking: "固定为我的预约"
    },
    fr: { 
        notice: "📢 1 Réservation par personne et par jour.", 
        speedCond: "[Req] Mer: {wed}j+ | Jeu: {thu}j+ | Ven: {fri}j+ | Sam~Dim: Libre",
        speedFree: "[Aucune limite] Libre de réserver",
        langHelp: "(Modifiez la langue via le menu ci-dessus.)",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1", confirmedHeader: "👑 Mes Buffs Confirmés", 
        mon: "Lundi (Recherche)", tue: "Mardi (Construction)", thu: "Jeudi (Entraînement)", mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi", optAll: "Tout", optMine: "Mes Réservations", openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée", pers: "Pers.", noRes: "Disponible", addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer", statusTitle: "Statut de Réservation", 
        cancelLabel: "Mot de passe d'annulation", cancelBtn: "Annuler la réservation", addBookingBtn: "Modifier la réservation", 
        closedAlert: "Réservation fermée.", speedUnit: "j", pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Beta", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe d'annulation (N'importe lequel)", 
        editBtn: "Modifier", cancelBtnSmall: "Annuler", delBtn: "Supprimer", slotOpenBtn: "🔓 Ouvrir", slotCloseBtn: "🔒 Fermer", errFill: "Saisissez votre mot de passe.", errWrongPass: "Mot de passe incorrect.", errNoRes: "Réservation introuvable.", errFillAll: "Veuillez remplir tous les champs.", errIdDigit: "L'identifiant doit comporter 9 chiffres.", promptEdit: "Modifier:", errNan: "Invalide.", promptDelete: "Supprimer ?", promptClear: "Effacer toutes les réservations ?<br />(Cette action sera enregistrée)", btnAdminDel: "🚨 Supprimer tout", promptSaved: "Enregistré !",
        admTitle: "👑 Système d'administration", admBase: "Définir la date", admSave: "Enregistrer", admManual: "Contrôle manuel", admVis: "Visibilité des accélérations", admLimits: "Limites dynamiques", admAuto: "Planification", admSaveSched: "Sauvegarder", admExcel: "Exporter Excel", admClose: "Fermer",
        copyList: "Copier", copySuccess: "La liste a été copiée !", enableNoti: "🔔 Activer l'alerte", notiSuccess: "Alertes activées ! (10 min avant)", statsTitle: "📊 Stats d'Alliance",
        admOpen: "Ouverture Glob.", admIndivClose: "Fermeture par jour:",
        pinBooking: "Épingler ma réservation"
    },
    ja: { 
        notice: "📢 曜日別1人1回のみ予約可能です。", 
        speedCond: "[条件] 水曜日: 加速 {wed}日+ | 木曜日: {thu}日+ | 金曜日: {fri}日+ | 土~日曜日: 自由予約",
        speedFree: "[現在制限なし] 誰でも自由に予約可能",
        langHelp: "(上部メニューから言語を変更できます)",
        curvedTxt: "予約サイトの利用料は : Monaの島 💚+1", confirmedHeader: "👑 確定した大統領バフ時間", 
        mon: "月曜日 (研究)", tue: "火曜日 (建設)", thu: "木曜日 (訓練)", mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日", optAll: "すべて", optMine: "自分の予約", openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了", pers: "人", noRes: "予約可能", addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる", statusTitle: "予約状況", 
        cancelLabel: "キャンセル用パスワード", cancelBtn: "予約取消", addBookingBtn: "予約修正", 
        closedAlert: "締め切られました。", speedUnit: "日", pAlliance: "同盟 (ZYZ, BUG, ZTP)", pNickname: "名前", pId: "プレイヤーID", pSpeed: "加速日数", pPass: "キャンセル用パスワード (何でもOK)", 
        editBtn: "修正", cancelBtnSmall: "取消", delBtn: "削除", slotOpenBtn: "🔓 開く", slotCloseBtn: "🔒 閉じる", errFill: "パスワードを入力してください。", errWrongPass: "パスワードが間違っています。", errNoRes: "予約データが見つかりません。", errFillAll: "すべて入力。", errIdDigit: "プレイヤーIDは9桁の数字。", promptEdit: "修正:", errNan: "不正。", promptDelete: "削除？", promptClear: "すべての予約データを削除しますか？<br />（この操作はログに記録されます）", btnAdminDel: "🚨 全ての予約を削除", promptSaved: "保存されました！",
        admTitle: "👑 管理者システム", admBase: "基準日の設定", admSave: "保存", admManual: "手動予約制御", admVis: "加速表示制御", admLimits: "最小加速条件調整", admAuto: "自動スケジュール", admSaveSched: "スケジュール保存", admExcel: "Excel抽出", admClose: "閉じる",
        copyList: "リストをコピー", copySuccess: "予約リストをクリップボードにコピーしました！", enableNoti: "🔔 通知をオンにする", notiSuccess: "通知が有効になりました！予約の10分前にお知らせします。", statsTitle: "📊 同盟別予約統計",
        admOpen: "全体オープン", admIndivClose: "曜日別の個別クローズ:",
        pinBooking: "自分の予約として固定"
    },
    id: { 
        notice: "📢 1 Pesanan Per Orang Per Hari.", 
        speedCond: "[Syarat] Rabu: Speed-up {wed}h+ | Kamis: {thu}h+ | Jumat: {fri}h+ | Sabtu~Minggu: Bebas",
        speedFree: "[Tidak Ada Batas] Bebas memesan",
        langHelp: "(Ubah bahasa menggunakan menu di atas.)",
        curvedTxt: "Biaya penggunaan Pulau Mona 💚+1", confirmedHeader: "👑 Buff Saya", 
        mon: "Senin (Riset)", tue: "Selasa (Konstruksi)", thu: "Kamis (Pelatihan)", mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis", optAll: "Semua", optMine: "Pesanan Saya", openAvailable: "✅ Buka", openClosed: "🔒 Tutup", pers: "Orang", noRes: "Tersedia", addTitle: "Tambah Pesanan", confirmBtn: "Konfirmasi", closeBtn: "Tutup", statusTitle: "Status", 
        cancelLabel: "Kata Sandi Pembatalan", cancelBtn: "Batalkan Pesanan", addBookingBtn: "Ubah Pesanan", 
        closedAlert: "Ditutup.", speedUnit: "hari", pAlliance: "Aliansi (ZYZ, BUG, ZTP etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi pembatalan (Bebas)", 
        editBtn: "Ubah", cancelBtnSmall: "Batal", delBtn: "Hapus", slotOpenBtn: "🔓 Buka", slotCloseBtn: "🔒 Tutup", errFill: "Masukkan kata sandi.", errWrongPass: "Salah.", errNoRes: "Tidak ditemukan.", errFillAll: "Harus diisi.", errIdDigit: "ID harus 9 digit.", promptEdit: "Ubah:", errNan: "Harus angka.", promptDelete: "Hapus?", promptClear: "Hapus semua data pesanan?<br />(Tindakan ini akan dicatat)", btnAdminDel: "🚨 Hapus Semua Pesanan", promptSaved: "Tersimpan!",
        admTitle: "👑 Sistem Admin", admBase: "Atur Tanggal Dasar", admSave: "Simpan", admManual: "Kontrol Pesanan Manual", admVis: "Visibilitas Speed-up", admLimits: "Batas Speed-up Dinamis", admAuto: "Jadwal Otomatis", admSaveSched: "Simpan Jadwal", admExcel: "Ekspor Excel", admClose: "Tutup",
        copyList: "Salin Daftar", copySuccess: "Daftar berhasil disalin!", enableNoti: "🔔 Aktifkan Peringatan", notiSuccess: "Peringatan diaktifkan! (10 menit sebelum)", statsTitle: "📊 Statistik Aliansi",
        admOpen: "Buka Global", admIndivClose: "Tutup Individu per Hari:",
        pinBooking: "Sematkan sebagai Pesanan Saya"
    },
    tr: { 
        notice: "📢 Kişi başına günde 1 rezervasyon.", 
        speedCond: "[Şartlar] Çarş: {wed}g+ | Perş: {thu}g+ | Cuma: {fri}g+ | Cmt~Paz: Serbest",
        speedFree: "[Şu An Sınır Yok] Serbest rezervasyon",
        langHelp: "(Yukarıdaki menüyü kullanarak dili değiştirin.)",
        curvedTxt: "Mona'nın Adası 💚+1", confirmedHeader: "👑 Onaylanmış Bufflarım", 
        mon: "Pazartesi (Araştırma)", tue: "Salı (İnşaat)", thu: "Perşembe (Eğitim)", mondayShort: "Pazartesi", tuesdayShort: "Salı", thursdayShort: "Perşembe", optAll: "Tümü", optMine: "Rezervasyonum", openAvailable: "✅ Açık", openClosed: "🔒 Kapalı", pers: "Kişi", noRes: "Müsait", addTitle: "Yeni Rezervasyon", confirmBtn: "Onayla", closeBtn: "Kapat", statusTitle: "Durum", 
        cancelLabel: "İptal Şifresi", cancelBtn: "Rezervasyonu İptal Et", addBookingBtn: "Rezervasyonu Düzenle", 
        closedAlert: "Kapandı.", speedUnit: "g", pAlliance: "İttifak (ZYZ, BUG, ZTP vb.)", pNickname: "Kullanıcı Adı", pId: "Oyuncu ID", pSpeed: "Hızlandırma", pPass: "İptal Şifresi (Herhangi biri)", 
        editBtn: "Düzenle", cancelBtnSmall: "İptal", delBtn: "Sil", slotOpenBtn: "🔓 Aç", slotCloseBtn: "🔒 Kapat", errFill: "Şifre giriniz.", errWrongPass: "Yanlış.", errNoRes: "Bulunamadı.", errFillAll: "Doldurunuz.", errIdDigit: "ID 9 haneli olmalıdır.", promptEdit: "Düzenle:", errNan: "Geçersiz.", promptDelete: "Sil?", promptClear: "Tüm rezervasyon verilerini sil?<br />(Bu işlem kaydedilecektir)", btnAdminDel: "🚨 Tüm Rezervasyonları Sil", promptSaved: "Kaydedildi!",
        admTitle: "👑 Yönetici Paneli", admBase: "Tarihi Ayarla", admSave: "Kaydet", admManual: "Manuel Rezervasyon Kontrolü", admVis: "Hızlandırma Görünürlüğü", admLimits: "Dinamik Hız Sınırları", admAuto: "Otomatik Planlama", admSaveSched: "Programı Kaydet", admExcel: "Excel Aktar", admClose: "Kapat",
        copyList: "Listeyi Kopyala", copySuccess: "Liste kopyalandı!", enableNoti: "🔔 Bildirimleri Aç", notiSuccess: "Bildirimler etkinleştirildi! (10 dk kala)", statsTitle: "📊 İttifak İstatistikleri",
        admOpen: "Genel Açılış", admIndivClose: "Güne Göre Bireysel Kapanış:",
        pinBooking: "Benim Rezervasyonum Olarak Sabitle"
    },
    ar: { 
        notice: "📢 حجز واحد للشخص الواحد في اليوم.", 
        speedCond: "[الشروط] الأربعاء: {wed} ي+ | الخميس: {thu} ي+ | الجمعة: {fri} ي+ | السبت~الأحد: حجز حر",
        speedFree: "[لا توجد قيود حالياً] حجز حر للجميع",
        langHelp: "(قم بتغيير اللغة باستخدام القائمة أعلاه.)",
        curvedTxt: "جزيرة منى 💚+1", confirmedHeader: "👑 حجوزاتي المؤكدة", 
        mon: "الاثنين (البحث)", tue: "الثلاثاء (البناء)", thu: "الخميس (التدريب)", mondayShort: "الاثنين", tuesdayShort: "الثلاثاء", thursdayShort: "الخميس", optAll: "الكل", optMine: "حجوزاتي", openAvailable: "✅ مفتوح", openClosed: "🔒 مغلق", pers: "أشخاص", noRes: "متاح", addTitle: "حجز جديد", confirmBtn: "تأكيد", closeBtn: "إغلاق", statusTitle: "الحالة", 
        cancelLabel: "كلمة مرور الإلغاء", cancelBtn: "إلغاء الحجز", addBookingBtn: "تعديل الحجز", 
        closedAlert: "مغلق.", speedUnit: "ي", pAlliance: "التحالف (ZYZ, BUG, ZTP إلخ)", pNickname: "الاسم", pId: "معرف اللاعب", pSpeed: "أيام التسريع", pPass: "كلمة مرور الإلغاء (أي كلمة)", 
        editBtn: "تعديل", cancelBtnSmall: "إلغاء", delBtn: "حذف", slotOpenBtn: "🔓 فتح", slotCloseBtn: "🔒 إغلاق", errFill: "أدخل كلمة المرور.", errWrongPass: "خطأ.", errNoRes: "غير موجود.", errFillAll: "مطلوب.", errIdDigit: "يجب 9 أرقام.", promptEdit: "تعديل:", errNan: "غير صحيح.", promptDelete: "حذف؟", promptClear: "هل أنت متأكد من حذف جميع بيانات الحجز؟<br />(سيتم تسجيل هذا الإجراء)", btnAdminDel: "🚨 حذف جميع الحجوزات", promptSaved: "تم!",
        admTitle: "👑 نظام المشرف", admBase: "تعيين التاريخ الأساسي", admSave: "حفظ", admManual: "التحكم اليدوي في الحجز", admVis: "التحكم في رؤية التسريع", admLimits: "تعديل شروط الحد الأدنى", admAuto: "الجدولة التلقائية", admSaveSched: "حفظ الجدول", admExcel: "تصدير إكسل", admClose: "إغلاق",
        copyList: "نسخ القائمة", copySuccess: "تم نسخ القائمة!", enableNoti: "🔔 تفعيل التنبيه", notiSuccess: "تم التفعيل!", statsTitle: "📊 إحصائيات التحالف",
        admOpen: "الفتح العام", admIndivClose: "الإغلاق الفردي حسب اليوم:",
        pinBooking: "تثبيت كحجزي"
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

window.getMyPlayerName = function() {
    var starred = localStorage.getItem("starred_player");
    if (starred) return window.normalizeText(starred);
    var m = localStorage.getItem(window.MY_BOOKING_KEY);
    return m ? window.normalizeText(JSON.parse(m).player) : "";
};

// [명단 복사 텍스트 정리]
window.copyTodayList = function() {
    var filter = document.getElementById("filterStatus").value;
    var filterText = "";
    if (filter === "mine") filterText = " (My Bookings)";
    else if (filter !== "all") filterText = " (" + filter + ")";
    
    var text = "👑 [" + window.currentBuff.toUpperCase() + "]" + filterText + " Confirmed List\n\n";
    var hasData = false;
    
    var myName = window.getMyPlayerName();

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
                var playerNames = filteredAttendees.map(function(a) { return "[" + String(a.alliance).toUpperCase() + "] " + a.player; }).join(", ");
                text += "- " + startId + " UTC : " + playerNames + "\n";
            }
        }
    }
    
    if (!hasData) { text += "No bookings found.\n"; }
    
    navigator.clipboard.writeText(text).then(function() {
        var p = window.langPack[window.currentLang] || window.langPack['en'];
        window.openCustomAlert(p.copySuccess || "

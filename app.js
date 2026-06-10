window.currentBuff = "monday";
window.selectedSlot = null;
window.allSlotsData = {};
window.MY_BOOKING_KEY = "svs_my_booking_info";
window.currentLang = localStorage.getItem("svs_lang") || "en"; 

window.bookingSettings = { 
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
window.adminAuthenticated = false;
window.sc = 0;

window.langPack = {
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
        addTitle: "New Booking", confirmBtn: "Confirm", closeBtn: "Close", statusTitle: "Booking Status", 
        cancelLabel: "Cancellation Password", cancelBtn: "Cancel Booking", addBookingBtn: "Modify Booking", 
        closedAlert: "Reservation Closed.", speedUnit: "d", 
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
        curvedTxt: "预约网站使用费是 Mona的岛 💚+1", confirmedHeader: "👑 我的确定的增益时间", addAlarm: "🔔 添加提醒", mon: "星期一 (建筑)", tue: "星期二 (研究)", thu: "星期四 (训练)", mondayShort: "星期一", tuesdayShort: "星期二", thursdayShort: "星期四", optAll: "全部", optMine: "我的预约", openAvailable: "✅ 开放预约", openClosed: "🔒 预约截止", pers: "人", noRes: "预约开放", addTitle: "添加新预约", confirmBtn: "确定", closeBtn: "关闭", statusTitle: "预约状态", 
        cancelLabel: "取消专用密码", cancelBtn: "取消预约", addBookingBtn: "修改预约", 
        closedAlert: "预约已截止。", speedUnit: "天", pAlliance: "联盟 (ZYZ, BUG, ZTP 等)", pNickname: "游戏昵称", pId: "玩家 ID (9位数字)", pSpeed: "加速天数", pPass: "用于取消密码 (任意)", editBtn: "修改", cancelBtnSmall: "取消", delBtn: "删除", slotOpenBtn: "🔓 开放", slotCloseBtn: "🔒 关闭", errFill: "请先在下方输入您的密码。", errWrongPass: "密码错误。", errNoRes: "找不到预约数据。", errFillAll: "必须填写所有字段。", errIdDigit: "玩家ID必须为9位数字。", promptEdit: "请输入新的加速天数（仅限数字）:", errNan: "只能输入数字格式。", promptDelete: "确定要删除吗？", promptClear: "确定要删除所有预约数据吗？<br />（此操作将被记录）", btnAdminDel: "🚨 删除所有预约", promptSaved: "已保存！",
        admTitle: "👑 管理员系统", admBase: "设置基准日期", admSave: "保存", admManual: "手动预约控制", admVis: "加速可见性控制", admLimits: "最低加速条件调整", admAuto: "自动时间设置", admOpenAll: "全开时间:", admCloseAll: "全关时间:", admSaveSched: "保存时间表", admExcel: "导出Excel", admClose: "关闭"
    },
    fr: { 
        notice: "📢 1 Réservation par personne et par jour.", 
        speedCond: "[Req] Mer: {wed}j+ | Jeu: {thu}j+ | Ven: {fri}j+ | Sam~Dim: Libre",
        langHelp: "(Modifiez la langue via le menu ci-dessus.)",
        curvedTxt: "Frais d'utilisation du site : L'île de Mona 💚+1", confirmedHeader: "👑 Mes Buffs Confirmés", addAlarm: "🔔 Alarme", mon: "Lundi (Construction)", tue: "Mardi (Recherche)", thu: "Jeudi (Entraînement)", mondayShort: "Lundi", tuesdayShort: "Mardi", thursdayShort: "Jeudi", optAll: "Tout", optMine: "Mes Réservations", openAvailable: "✅ Réservation Ouverte", openClosed: "🔒 Réservation Fermée", pers: "Pers.", noRes: "Disponible", addTitle: "Nouvelle Réservation", confirmBtn: "Confirmer", closeBtn: "Fermer", statusTitle: "Statut de Réservation", 
        cancelLabel: "Mot de passe d'annulation", cancelBtn: "Annuler la réservation", addBookingBtn: "Modifier la réservation", 
        closedAlert: "Réservation fermée.", speedUnit: "j", pAlliance: "Alliance (ZYZ, BUG, ZTP etc)", pNickname: "Beta", pId: "ID Joueur (9 chiffres)", pSpeed: "Jours d'accélération", pPass: "Mot de passe", editBtn: "Modifier", cancelBtnSmall: "Annuler", delBtn: "Supprimer", slotOpenBtn: "🔓 Ouvrir", slotCloseBtn: "🔒 Fermer", errFill: "Saisissez votre mot de passe.", errWrongPass: "Mot de passe incorrect.", errNoRes: "Réservation introuvable.", errFillAll: "Veuillez remplir tous les champs.", errIdDigit: "L'identifiant doit comporter 9 chiffres.", promptEdit: "Modifier:", errNan: "Invalide.", promptDelete: "Supprimer ?", promptClear: "Effacer toutes les réservations ?<br />(Cette action sera enregistrée)", btnAdminDel: "🚨 Supprimer tout", promptSaved: "Enregistré !",
        admTitle: "👑 Système d'administration", admBase: "Définir la date", admSave: "Enregistrer", admManual: "Contrôle manuel", admVis: "Visibilité des accélérations", admLimits: "Limites dynamiques", admAuto: "Planification", admOpenAll: "Ouvrir tout:", admCloseAll: "Fermer tout:", admSaveSched: "Sauvegarder", admExcel: "Exporter Excel", admClose: "Fermer"
    },
    ja: { 
        notice: "📢 曜日別1人1回のみ予約可能です。", 
        speedCond: "[条件] 水曜日: 加速 {wed}日+ | 木曜日: {thu}日+ | 金曜日: {fri}日+ | 土~日曜日: 自由予約",
        langHelp: "(上部メニューから言語を変更できます)",
        curvedTxt: "予約サイトの利用料は : Monaの島 💚+1", confirmedHeader: "👑 確定した大統領バフ時間", addAlarm: "🔔 アラーム登録", mon: "月曜日", tue: "火曜日", thu: "木曜日", mondayShort: "月曜日", tuesdayShort: "火曜日", thursdayShort: "木曜日", optAll: "すべて", optMine: "自分の予約", openAvailable: "✅ 予約受付中", openClosed: "🔒 予約終了", pers: "人", noRes: "予約可能", addTitle: "新規予約追加", confirmBtn: "確定", closeBtn: "閉じる", statusTitle: "予約状況", 
        cancelLabel: "キャンセル用パスワード", cancelBtn: "予約取消", addBookingBtn: "予約修正", 
        closedAlert: "締め切られました。", speedUnit: "日", pAlliance: "同盟 (ZYZ, BUG, ZTP)", pNickname: "名前", pId: "プレイヤーID", pSpeed: "加速日数", pPass: "パスワード", editBtn: "修正", cancelBtnSmall: "取消", delBtn: "削除", slotOpenBtn: "🔓 開く", slotCloseBtn: "🔒 閉じる", errFill: "パスワードを入力してください。", errWrongPass: "パスワードが間違っています。", errNoRes: "予約データが見つかりません。", errFillAll: "すべて入力。", errIdDigit: "プレイヤーIDは9桁の数字。", promptEdit: "修正:", errNan: "不正。", promptDelete: "削除？", promptClear: "すべての予約データを削除しますか？<br />（この操作はログに記録されます）", btnAdminDel: "🚨 全ての予約を削除", promptSaved: "保存されました！",
        admTitle: "👑 管理者システム", admBase: "基準日の設定", admSave: "保存", admManual: "手動予約制御", admVis: "加速表示制御", admLimits: "最小加速条件調整", admAuto: "自動スケジュール", admOpenAll: "一括オープン:", admCloseAll: "一括クローズ:", admSaveSched: "スケジュール保存", admExcel: "Excel抽出", admClose: "閉じる"
    },
    id: { 
        notice: "📢 1 Pesanan Per Orang Per Hari.", 
        speedCond: "[Syarat] Rabu: Speed-up {wed}h+ | Kamis: {thu}h+ | Jumat: {fri}h+ | Sabtu~Minggu: Bebas",
        langHelp: "(Ubah bahasa menggunakan menu di atas.)",
        curvedTxt: "Biaya penggunaan Pulau Mona 💚+1", confirmedHeader: "👑 Buff Saya", addAlarm: "🔔 Pasang Alarm", mon: "Senin", tue: "Selasa", thu: "Kamis", mondayShort: "Senin", tuesdayShort: "Selasa", thursdayShort: "Kamis", optAll: "Semua", optMine: "Pesanan Saya", openAvailable: "✅ Buka", openClosed: "🔒 Tutup", pers: "Orang", noRes: "Tersedia", addTitle: "Tambah Pesanan", confirmBtn: "Konfirmasi", closeBtn: "Tutup", statusTitle: "Status", 
        cancelLabel: "Kata Sandi Pembatalan", cancelBtn: "Batalkan Pesanan", addBookingBtn: "Ubah Pesanan", 
        closedAlert: "Ditutup.", speedUnit: "hari", pAlliance: "Aliansi (ZYZ, BUG, ZTP etc)", pNickname: "Nama Pengguna", pId: "Player ID (9 digit)", pSpeed: "Speed-up Hari", pPass: "Kata sandi", editBtn: "Ubah", cancelBtnSmall: "Batal", delBtn: "Hapus", slotOpenBtn: "🔓 Buka", slotCloseBtn: "🔒 Tutup", errFill: "Masukkan kata sandi.", errWrongPass: "Salah.", errNoRes: "Tidak ditemukan.", errFillAll: "Harus diisi.", errIdDigit: "ID harus 9 digit.", promptEdit: "Ubah:", errNan: "Harus angka.", promptDelete: "Hapus?", promptClear: "Hapus semua data pesanan?<br />(Tindakan ini akan dicatat)", btnAdminDel: "🚨 Hapus Semua Pesanan", promptSaved: "Tersimpan!",
        admTitle: "👑 Sistem Admin", admBase: "Atur Tanggal Dasar", admSave: "Simpan", admManual: "Kontrol Pesanan Manual", admVis: "Visibilitas Speed-up", admLimits: "Batas Speed-up Dinamis", admAuto: "Jadwal Otomatis", admOpenAll: "Buka Semua:", admCloseAll: "Tutup Semua:", admSaveSched: "Simpan Jadwal", admExcel: "Ekspor Excel", admClose: "Tutup"
    },
    tr: { 
        notice: "📢 Kişi başına günde 1 rezervasyon.", 
        speedCond: "[Şartlar] Çarş: {wed}g+ | Perş: {thu}g+ | Cuma: {fri}g+ | Cmt~Paz: Serbest",
        langHelp: "(Yukarıdaki menüyü kullanarak dili değiştirin.)",
        curvedTxt: "Mona'nın Adası 💚+1", confirmedHeader: "👑 Onaylanmış Bufflarım", addAlarm: "🔔 Alarm Ekle", mon: "Pazartesi", tue: "Salı", thu: "Perşembe", mondayShort: "Pazartesi", tuesdayShort: "Salı", thursdayShort: "Perşembe", optAll: "Tümü", optMine: "Rezervasyonum", openAvailable: "✅ Açık", openClosed: "🔒 Kapalı", pers: "Kişi", noRes: "Müsait", addTitle: "Yeni Rezervasyon", confirmBtn: "Onayla", closeBtn: "Kapat", statusTitle: "Durum", 
        cancelLabel: "İptal Şifresi", cancelBtn: "Rezervasyonu İptal Et", addBookingBtn: "Rezervasyonu Düzenle", 
        closedAlert: "Kapandı.", speedUnit: "g", pAlliance: "İttifak (ZYZ, BUG, ZTP vb.)", pNickname: "Kullanıcı Adı", pId: "Oyuncu ID", pSpeed: "Hızlandırma", pPass: "İptal Şifresi", editBtn: "Düzenle", cancelBtnSmall: "İptal", delBtn: "Sil", slotOpenBtn: "🔓 Aç", slotCloseBtn: "🔒 Kapat", errFill: "Şifre giriniz.", errWrongPass: "Yanlış.", errNoRes: "Bulunamadı.", errFillAll: "Doldurunuz.", errIdDigit: "ID 9 haneli olmalıdır.", promptEdit: "Düzenle:", errNan: "Geçersiz.", promptDelete: "Sil?", promptClear: "Tüm rezervasyon verilerini sil?<br />(Bu işlem kaydedilecektir)", btnAdminDel: "🚨 Tüm Rezervasyonları Sil", promptSaved: "Kaydedildi!",
        admTitle: "👑 Yönetici Paneli", admBase: "Tarihi Ayarla", admSave: "Kaydet", admManual: "Manuel Rezervasyon Kontrolü", admVis: "Hızlandırma Görünürlüğü", admLimits: "Dinamik Hız Sınırları", admAuto: "Otomatik Planlama", admOpenAll: "Tümünü Aç:", admCloseAll: "Tümünü Kapat:", admSaveSched: "Programı Kaydet", admExcel: "Excel Aktar", admClose: "Kapat"
    },
    ar: { 
        notice: "📢 حجز واحد للشخص الواحد في اليوم.", 
        speedCond: "[الشروط] الأربعاء: {wed} ي+ | الخميس: {thu} ي+ | الجمعة: {fri} ي+ | السبت~الأحد: حجز حر",
        langHelp: "(قم بتغيير اللغة باستخدام القائمة أعلاه.)",
        curvedTxt: "جزيرة منى 💚+1", confirmedHeader: "👑 حجوزاتي المؤكدة", addAlarm: "🔔 منبه", mon: "الاثنين", tue: "الثلاثاء", thu: "الخميس", mondayShort: "الاثنين", tuesdayShort: "الثلاثاء", thursdayShort: "الخميس", optAll: "الكل", optMine: "حجوزاتي", openAvailable: "✅ مفتوح", openClosed: "🔒 مغلق", pers: "أشخاص", noRes: "متاح", addTitle: "حجز جديد", confirmBtn: "تأكيد", closeBtn: "إغلاق", statusTitle: "الحالة", 
        cancelLabel: "كلمة مرور الإلغاء", cancelBtn: "إلغاء الحجز", addBookingBtn: "تعديل الحجز", 
        closedAlert: "مغلق.", speedUnit: "ي", pAlliance: "التحالف (ZYZ, BUG, ZTP إلخ)", pNickname: "الاسم", pId: "معرف اللاعب", pSpeed: "أيام التسريع", pPass: "كلمة المرور", editBtn: "تعديل", cancelBtnSmall: "إلغاء", delBtn: "حذف", slotOpenBtn: "🔓 فتح", slotCloseBtn: "🔒 إغلاق", errFill: "أدخل كلمة المرور.", errWrongPass: "خطأ.", errNoRes: "غير موجود.", errFillAll: "مطلوب.", errIdDigit: "يجب 9 أرقام.", promptEdit: "تعديل:", errNan: "غير صحيح.", promptDelete: "حذف؟", promptClear: "هل أنت متأكد من حذف جميع بيانات الحجز؟<br />(سيتم تسجيل هذا الإجراء)", btnAdminDel: "🚨 حذف جميع الحجوزات", promptSaved: "تم!",
        admTitle: "👑 نظام المشرف", admBase: "تعيين التاريخ الأساسي", admSave: "حفظ", admManual: "التحكم اليدوي في الحجز", admVis: "التحكم في رؤية التسريع", admLimits: "تعديل شروط الحد الأدنى", admAuto: "الجدولة التلقائية", admOpenAll: "فتح الكل:", admCloseAll: "إغلاق الكل:", admSaveSched: "حفظ الجدول", admExcel: "تصدير إكسل", admClose: "إغلاق"
    }
};

/* =====================================================================
   [안전하고 예쁜 파스텔톤 눈 내리는 효과 부활] 눈이 편안한 파스텔 하늘색 적용
   ===================================================================== */
window.initSnowEffect = function() {
    var canvas = document.getElementById('snow');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var width = canvas.width = window.innerWidth;
    var height = canvas.height = window.innerHeight;
    var snowflakes = [];
    
    // [색상 변경] 기존 튀는 색상에서 다른 파스텔톤 메뉴들과 어우러지는 파스텔 하늘색으로 변경
    var snowColor = 'rgba(155, 195, 235, 0.85)'; 

    for(var i=0; i<50; i++){ 
        snowflakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 3.5 + 1.5, // 크기 큼직하게 유지
            d: Math.random() * 50,
            type: Math.random() > 0.5 ? 1 : 0 // 0: 동그라미, 1: 결정모양 섞기
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = snowColor;
        ctx.strokeStyle = snowColor;
        ctx.lineWidth = 1.2; // 결정 모양 선을 조금 더 선명하게
        ctx.beginPath();
        
        for(var i=0; i<snowflakes.length; i++){
            var f = snowflakes[i];
            
            if (f.type === 0) {
                // 동글동글한 원형 눈
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
            } else {
                // 눈 결정 모양
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
            f.y += Math.cos(f.d) + 1 + f.r/2;
            f.x += Math.sin(f.d) * 0.5;
            if(f.y > height){
                snowflakes[i] = { x: Math.random()*width, y: 0, r: f.r, d: f.d, type: f.type };
            }
        }
    }
    
    setInterval(draw, 35); 
    window.addEventListener('resize', function() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
};

/* =====================================================================
   [기본 기능 및 코어 함수들]
   ===================================================================== */
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
    safeSetPlaceholder("editCancelKey", p.cancelLabel);
    
    safeSetText("btn-cancel-txt", p.cancelBtn); safeSetText("btn-add-txt", p.addBookingBtn); safeSetText("btn-res-close-txt", p.closeBtn);
    
    var curvedEl = document.getElementById("curved-profile-txt"); if (curvedEl) curvedEl.textContent = p.curvedTxt;
    var confHeader = document.getElementById("confirmed-header-txt"); if (confHeader) confHeader.innerText = p.confirmedHeader;
};

window.isTabActuallyOpen = function(day) { 
    if (!window.bookingSettings || !window.bookingSettings.tabs || !window.bookingSettings.tabs[day]) return true; 
    var s = window.bookingSettings.tabs[day], now = new Date(); 
    if (s.forceClosed === true) return false;
    if (s.forceOpen === true) return true;
    if (!s.isOpen) return false; 
    if (window.bookingSettings.globalCloseTime && now > new Date(window.bookingSettings.globalCloseTime)) return false; 
    if (window.bookingSettings.globalOpenTime && now < new Date(window.bookingSettings.globalOpenTime)) return false; 
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
        var calBtn = document.createElement("button"); calBtn.type = "button"; calBtn.className = "btn-cal"; calBtn.innerText = p.addAlarm;
        calBtn.onclick = function() { var url = window.getGoogleCalendarUrl(track.day, track.time); window.open(url, "_blank"); };
        card.appendChild(timeSpan); card.appendChild(calBtn); listEl.appendChild(card);
    });
    el.style.display = "block";
};

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
            
            if (filter === "mine" && !attendees.some(function(a) { return window.normalizeText(a.player) === window.normalizeText(localStorage.getItem(window.MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(window.MY_BOOKING_KEY)).player : ""); })) continue;
            
            var closedList = window.bookingSettings.closedSlots || [];
            var isSpecificallyClosed = closedList.includes(id);
            var effectivelyOpen = isOpen && !isSpecificallyClosed;
            
            var div = document.createElement("div"); 
            var isMine = attendees.some(function(a) { return window.normalizeText(a.player) === window.normalizeText(localStorage.getItem(window.MY_BOOKING_KEY) ? JSON.parse(localStorage.getItem(window.MY_BOOKING_KEY)).player : ""); });
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

    if (isOpen) {
        if (window.bookingSettings.globalCloseTime) {
            var diff = new Date(window.bookingSettings.globalCloseTime) - now;
            if (diff > 0) {
                el.innerHTML = "✅ " + (window.currentLang === 'ko' ? "예약 가능 (마감까지 " : "Booking Open (Closes in ") + formatTime(diff) + ")";
            } else {
                el.innerText = p.openAvailable;
            }
        } else {
            el.innerText = p.openAvailable;
        }
    } else {
        if (window.bookingSettings.globalOpenTime) {
            var diff = new Date(window.bookingSettings.globalOpenTime) - now;
            if (diff > 0) {
                el.innerHTML = "🔒 " + (window.currentLang === 'ko' ? "예약 대기 (오픈까지 " : "Booking Queue (Opens in ") + formatTime(diff) + ")";
            } else {
                el.innerText = p.openClosed;
            }
        } else {
            el.innerText = p.openClosed;
        }
    }

    // [자동 마감/오픈 검증 완료] 설정된 시간이 지나 상태가 변경되면 즉시 전체 슬롯을 새로 그려 잠금/해제를 반영함
    if (window.lastOpenStatus !== null && window.lastOpenStatus !== isOpen) {
        window.renderAll();
    }
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

window.fillAdminInputs = function() { 
    if (!window.bookingSettings || !window.bookingSettings.baseDate) return; 
    document.getElementById("adminBaseDate").value = window.bookingSettings.baseDate.slice(0, 16); 
    document.getElementById("global-open-time").value = window.bookingSettings.globalOpenTime || ""; 
    document.getElementById("global-close-time").value = window.bookingSettings.globalCloseTime || ""; 
    
    var speeds = window.bookingSettings.minSpeeds || { wed: 50, thu: 30, fri: 15 };
    if(document.getElementById("speed-req-wed")) document.getElementById("speed-req-wed").value = speeds.wed;
    if(document.getElementById("speed-req-thu")) document.getElementById("speed-req-thu").value = speeds.thu;
    if(document.getElementById("speed-req-fri")) document.getElementById("speed-req-fri").value = speeds.fri;
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
            textSpan.innerHTML = "[" + a.alliance + "] " + a.player;
            
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
                    rows.push({ "Day": day.toUpperCase(), "Time(UTC)": timeStr, "Alliance": a.alliance, "Nickname": a.player, "PlayerID": a.playerId, "SpeedDays": a.daysSaved }); 
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

    // 참고로 ZYZ랑 BUG의 R5들은 이미 화이트리스트야. 내가 추가 안해주는게 아니야. (사용자 요청에 의한 설정 무시 - 예외 없이 제한 적용)
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
    window.bookingSettings.globalOpenTime = document.getElementById("global-open-time").value; 
    window.bookingSettings.globalCloseTime = document.getElementById("global-close-time").value; 
    
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
    var val = document.getElementById("adminBaseDate").value; 
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

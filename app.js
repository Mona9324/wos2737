// ==========================================
// 1. 전역 상태 및 초기화 (Firebase 9 컴패티블)
// ==========================================
const db = firebase.firestore();

let currentBuff = 'monday';
let currentLanguage = 'en'; 
let baseDateStr = ""; 
let tabStatuses = { monday: true, tuesday: true, thursday: true };
let speedVisibilities = { monday: true, tuesday: true, thursday: true };

// 관리자 요일별 가속 제한 기본값 (DB 설정이 없을 경우 대비)
let dynamicSpeedLimits = { wed: 50, thu: 30, fri: 15 };

// 자동 스케줄 상태
let autoSchedule = { globalOpenTime: "", globalCloseTime: "" };

// 번역 사전 데이터
const i18n = {
    ko: {
        title: "2737 SVS 버프 예약",
        optAll: "전체 보기",
        optMine: "내 예약만",
        btnReset: "초기화",
        btnConfirm: "예약 확정",
        btnClose: "닫기",
        btnModify: "예약 수정",
        btnCancel: "예약 취소",
        btnAdd: "추가 예약",
        lblPassword: "비밀번호 (취소/수정용)",
        newBooking: "새 예약 등록",
        bookingStatus: "예약 현황",
        myConfirmedTitle: "👑 내가 확정된 버프 목록",
        statusMsgOpen: "🟢 현재 예약이 실시간으로 가능합니다.",
        statusMsgClosed: "🔴 현재 예약이 마감되었거나 비활성화 상태입니다.",
        alertInputAll: "모든 필드를 올바르게 입력해주세요.",
        alertIdDigits: "Player ID는 반드시 9자리 숫자여야 합니다.",
        alertSpeedMin: "가속 지원 일수는 0일 이상이어야 합니다.",
        alertSuccess: "예약이 성공적으로 완료되었습니다!",
        alertCancelSuccess: "예약이 취소되었습니다.",
        alertWrongPwd: "비밀번호가 일치하지 않습니다.",
        alertNoAuth: "권한이 없거나 비밀번호가 틀렸습니다.",
        alertTabClosed: "이 요일은 현재 예약이 비활성화되어 있습니다.",
        alertLimitExceeded: "죄송합니다. 해당 타임슬롯은 이미 만석(5명)입니다.",
        alertSpeedLimit: (day, limit) => `오늘은 UTC 기준 ${day}요일입니다. 가속 입력 기준은 최대 +${limit}일 이하만 가능합니다.`,
        placeholderId: "Player ID (9자리 숫자)",
        placeholderSpeed: "가속 지원 가능 일수 (숫자만)",
        confirmCancelAll: "해당 슬롯의 내 예약을 취소하시겠습니까?"
    },
    en: {
        title: "2737 SVS Buff Booking",
        optAll: "All Bookings",
        optMine: "My Bookings",
        btnReset: "Reset",
        btnConfirm: "Confirm",
        btnClose: "Close",
        btnModify: "Modify",
        btnCancel: "Cancel",
        btnAdd: "Add More",
        lblPassword: "Password (for cancel/edit)",
        newBooking: "New Booking",
        bookingStatus: "Booking Status",
        myConfirmedTitle: "👑 My Confirmed Buffs",
        statusMsgOpen: "🟢 Bookings are currently open.",
        statusMsgClosed: "🔴 Bookings are currently closed or disabled.",
        alertInputAll: "Please fill in all fields correctly.",
        alertIdDigits: "Player ID must be exactly 9 digits.",
        alertSpeedMin: "Speed-up days must be 0 or greater.",
        alertSuccess: "Booking successful!",
        alertCancelSuccess: "Booking canceled successfully.",
        alertWrongPwd: "Incorrect password.",
        alertNoAuth: "Access denied. Incorrect password.",
        alertTabClosed: "Bookings for this day are currently closed.",
        alertLimitExceeded: "Sorry, this time slot is already full (max 5 attendees).",
        alertSpeedLimit: (day, limit) => `Today is ${day} (UTC). The maximum allowed speed-up input is +${limit} days.`,
        placeholderId: "Player ID (9 digits)",
        placeholderSpeed: "Speed-up Days (number)",
        confirmCancelAll: "Are you sure you want to cancel your booking in this slot?"
    },
    zh: {
        title: "2737 SVS 增益预订",
        optAll: "查看全部",
        optMine: "我的预订",
        btnReset: "重置",
        btnConfirm: "确认预订",
        btnClose: "关闭",
        btnModify: "修改预订",
        btnCancel: "取消预订",
        btnAdd: "追加预订",
        lblPassword: "密码 (用于取消/修改)",
        newBooking: "新预订登记",
        bookingStatus: "预订状态",
        myConfirmedTitle: "👑 我已确认的增益列表",
        statusMsgOpen: "🟢 当前预订正实时开放。",
        statusMsgClosed: "🔴 当前预订已关闭或处于禁用状态。",
        alertInputAll: "请正确填写所有字段。",
        alertIdDigits: "玩家 ID 必须恰好是 9 位数字。",
        alertSpeedMin: "加速天数必须大于或等于 0。",
        alertSuccess: "预订成功！",
        alertCancelSuccess: "预订已成功取消。",
        alertWrongPwd: "密码错误。",
        alertNoAuth: "拒绝访问。密码错误。",
        alertTabClosed: "该日期的预订目前已关闭。",
        alertLimitExceeded: "抱歉，该时间段已满（最多 5 人）。",
        alertSpeedLimit: (day, limit) => `今天是 UTC 时间 ${day}。允许的最大加速输入为 +${limit} 天。`,
        placeholderId: "玩家 ID (9位数字)",
        placeholderSpeed: "加速天数 (数字)",
        confirmCancelAll: "您确定要取消在此时间段的预订吗？"
    },
    ja: {
        title: "2737 SVS バフ予約",
        optAll: "すべて表示",
        optMine: "自分の予約のみ",
        btnReset: "リセット",
        btnConfirm: "予約確定",
        btnClose: "閉じる",
        btnModify: "予約修正",
        btnCancel: "予約キャンセル",
        btnAdd: "追加予約",
        lblPassword: "パスワード (キャンセル/修正用)",
        newBooking: "新規予約登録",
        bookingStatus: "予約状況",
        myConfirmedTitle: "👑 確定されたバフ一覧",
        statusMsgOpen: "🟢 現在、リアルタイムで予約可能です。",
        statusMsgClosed: "🔴 現在、予約は締め切られているか無効です。",
        alertInputAll: "すべての項目を正しく入力してください。",
        alertIdDigits: "プレイヤーIDは必ず9桁の数字でなければなりません。",
        alertSpeedMin: "加速日数は0日以上である必要があります。",
        alertSuccess: "予約が正常に完了しました！",
        alertCancelSuccess: "予約がキャンセルされました。",
        alertWrongPwd: "パスワードが一致しません。",
        alertNoAuth: "アクセス権限がないか、パスワードが間違っています。",
        alertTabClosed: "この曜日の予約は現在無効になっています。",
        alertLimitExceeded: "申し訳ありません。このタイムスロットはすでに満席（最大5名）です。",
        alertSpeedLimit: (day, limit) => `本日は UTC 基準で ${day}曜日です。加速入力基準は最大 +${limit}日以下のみ可能です。`,
        placeholderId: "プレイヤーID (9桁の数字)",
        placeholderSpeed: "加速日数 (数値のみ)",
        confirmCancelAll: "このスロットの予約をキャンセルしてもよろしいですか？"
    },
    fr: {
        title: "Réservation de Buff 2737 SVS",
        optAll: "Toutes les réservations",
        optMine: "Mes réservations",
        btnReset: "Réinitialiser",
        btnConfirm: "Confirmer",
        btnClose: "Fermer",
        btnModify: "Modifier",
        btnCancel: "Annuler",
        btnAdd: "Ajouter plus",
        lblPassword: "Mot de passe (pour annulation/modification)",
        newBooking: "Nouvelle réservation",
        bookingStatus: "Statut de la réservation",
        myConfirmedTitle: "👑 Mes Buffs Confirmés",
        statusMsgOpen: "🟢 Les réservations sont actuellement ouvertes.",
        statusMsgClosed: "🔴 Les réservations sont actuellement fermées ou désactivées.",
        alertInputAll: "Veuillez remplir tous les champs correctement.",
        alertIdDigits: "L'ID du joueur doit comporter exactement 9 chiffres.",
        alertSpeedMin: "Les jours d'accélération doivent être supérieurs ou égaux à 0.",
        alertSuccess: "Réservation réussie !",
        alertCancelSuccess: "Réservation annulée avec succès.",
        alertWrongPwd: "Mot de passe incorrect.",
        alertNoAuth: "Accès refusé. Mot de passe incorrect.",
        alertTabClosed: "Les réservations pour ce jour sont actuellement fermées.",
        alertLimitExceeded: "Désolé, ce créneau horaire est déjà plein (max 5 participants).",
        alertSpeedLimit: (day, limit) => `Aujourd'hui, c'est ${day} (UTC). L'apport d'accélération maximal autorisé est de +${limit} jours.`,
        placeholderId: "ID du joueur (9 chiffres)",
        placeholderSpeed: "Jours d'accélération (nombre)",
        confirmCancelAll: "Êtes-vous sûr de vouloir annuler votre réservation dans ce créneau ?"
    },
    ar: {
        title: "حجز بوف 2737 SVS",
        optAll: "كل الحجوزات",
        optMine: "حجوزاتي فقط",
        btnReset: "إعادة ضبط",
        btnConfirm: "تأكيد الحجز",
        btnClose: "إغلاق",
        btnModify: "تعديل الحجز",
        btnCancel: "إلغاء الحجز",
        btnAdd: "إضافة المزيد",
        lblPassword: "كلمة المرور (للإلغاء/التعديل)",
        newBooking: "حجز جديد",
        bookingStatus: "حالة الحجز",
        myConfirmedTitle: "👑 قائمة البوفات المؤكدة الخاصة بي",
        statusMsgOpen: "🟢 الحجوزات مفتوحة حالياً.",
        statusMsgClosed: "🔴 الحجوزات مغلقة حالياً أو معطلة.",
        alertInputAll: "يرجى ملء جميع الحقول بشكل صحيح.",
        alertIdDigits: "يجب أن يتكون معرف اللاعب من 9 أرقام بالضبط.",
        alertSpeedMin: "يجب أن تكون أيام التسريع 0 أو أكثر.",
        alertSuccess: "تم الحجز بنجاح!",
        alertCancelSuccess: "تم إلغاء الحجز بنجاح.",
        alertWrongPwd: "كلمة المرور غير صحيحة.",
        alertNoAuth: "تم رفض الوصول. كلمة المرور غير صحيحة.",
        alertTabClosed: "الحجوزات لهذا اليوم مغلقة حالياً.",
        alertLimitExceeded: "عذراً، هذا الوقت ممتلئ بالفعل (الحد الأقصى 5 حضور).",
        alertSpeedLimit: (day, limit) => `اليوم هو ${day} (UTC). الحد الأقصى المسموح به لإدخال التسريع هو +${limit} يومًا.`,
        placeholderId: "معرف اللاعب (9 أرقام)",
        placeholderSpeed: "أيام التسريع (رقم)",
        confirmCancelAll: "هل أنت متأكد أنك تريد إلغاء حجزك في هذا الوقت؟"
    },
    id: {
        title: "Pemesanan Buff 2737 SVS",
        optAll: "Semua Pesanan",
        optMine: "Pesanan Saya",
        btnReset: "Reset",
        btnConfirm: "Konfirmasi",
        btnClose: "Tutup",
        btnModify: "Ubah Pesanan",
        btnCancel: "Batalkan Pesanan",
        btnAdd: "Tambah Pemesanan",
        lblPassword: "Kata Sandi (untuk batal/ubah)",
        newBooking: "Pemesanan Baru",
        bookingStatus: "Status Pemesanan",
        myConfirmedTitle: "👑 Daftar Buff Saya yang Dikonfirmasi",
        statusMsgOpen: "🟢 Pemesanan saat ini sedang dibuka.",
        statusMsgClosed: "🔴 Pemesanan saat ini ditutup atau dinonaktifkan.",
        alertInputAll: "Silakan isi semua kolom dengan benar.",
        alertIdDigits: "ID Pemain harus tepat 9 digit.",
        alertSpeedMin: "Hari speed-up harus 0 atau lebih.",
        alertSuccess: "Pemesanan berhasil!",
        alertCancelSuccess: "Pemesanan berhasil dibatalkan.",
        alertWrongPwd: "Kata sandi salah.",
        alertNoAuth: "Akses ditolak. Kata sandi salah.",
        alertTabClosed: "Pemesanan untuk hari ini sedang ditutup.",
        alertLimitExceeded: "Maaf, slot waktu ini sudah penuh (maksimal 5 peserta).",
        alertSpeedLimit: (day, limit) => `Hari ini adalah ${day} (UTC). Batas maksimum input speed-up adalah +${limit} hari.`,
        placeholderId: "ID Pemain (9 digit)",
        placeholderSpeed: "Hari Speed-up (angka)",
        confirmCancelAll: "Apakah Anda yakin ingin membatalkan pesanan Anda di slot ini?"
    },
    tr: {
        title: "2737 SVS Buff Rezervasyonu",
        optAll: "Tüm Rezervasyonlar",
        optMine: "Rezervasyonlarım",
        btnReset: "Sıfırla",
        btnConfirm: "Onayla",
        btnClose: "Kapat",
        btnModify: "Rezervasyonu Düzenle",
        btnCancel: "Rezervasyonu İptal Et",
        btnAdd: "Daha Fazla Ekle",
        lblPassword: "Şifre (iptal/düzenleme için)",
        newBooking: "Yeni Rezervasyon",
        bookingStatus: "Rezervasyon Durumu",
        myConfirmedTitle: "👑 Onaylanmış Buff Listem",
        statusMsgOpen: "🟢 Rezervasyonlar şu anda açıktır.",
        statusMsgClosed: "🔴 Rezervasyonlar şu anda kapalı veya devre dışı.",
        alertInputAll: "Lütfen tüm alanları doğru doldurun.",
        alertIdDigits: "Oyuncu ID'si tam olarak 9 haneli olmalıdır.",
        alertSpeedMin: "Hızlandırma günleri 0 veya daha büyük olmalıdır.",
        alertSuccess: "Rezervasyon başarıyla tamamlandı!",
        alertCancelSuccess: "Rezervasyon başarıyla iptal edildi.",
        alertWrongPwd: "Geçersiz şifre.",
        alertNoAuth: "Erişim reddedildi. Geçersiz şifre.",
        alertTabClosed: "Bu gün için rezervasyonlar şu anda kapalı.",
        alertLimitExceeded: "Üzgünüz, bu zaman dilimi zaten dolu (en fazla 5 katılımcı).",
        alertSpeedLimit: (day, limit) => `Bugün UTC saatine göre ${day}. İzin verilen maksimum hızlandırma girişi +${limit} gündür.`,
        placeholderId: "Oyuncu ID (9 haneli)",
        placeholderSpeed: "Hızlandırma Günleri (sayı)",
        confirmCancelAll: "Bu slotta bulunan rezervasyonunuzu iptal etmek istediğinize emin misiniz?"
    }
};

// Custom Modal 가상 제어 시스템
let activeConfirmCallback = null;
function showCustomConfirm(msg, callback) {
    document.getElementById('confirmModalMessage').textContent = msg;
    activeConfirmCallback = callback;
    document.getElementById('confirmModal').classList.add('show');
}
window.closeCustomConfirm = function() {
    document.getElementById('confirmModal').classList.remove('show');
    activeConfirmCallback = null;
};
window.executeCustomConfirm = function() {
    if(activeConfirmCallback) activeConfirmCallback();
    window.closeCustomConfirm();
};

let activePromptCallback = null;
function showCustomPrompt(msg, defaultValue, callback) {
    document.getElementById('promptModalMessage').textContent = msg;
    document.getElementById('promptInputValue').value = defaultValue;
    activePromptCallback = callback;
    document.getElementById('promptModal').classList.add('show');
}
window.closeCustomPrompt = function() {
    document.getElementById('promptModal').classList.remove('show');
    activePromptCallback = null;
};
window.confirmCustomPrompt = function() {
    const val = document.getElementById('promptInputValue').value;
    if(activePromptCallback) activePromptCallback(val);
    window.closeCustomPrompt();
};

function showCustomAlert(msg) {
    document.getElementById('alertModalMessage').textContent = msg;
    document.getElementById('alertModal').classList.add('add-blur');
    document.getElementById('alertModal').classList.add('show');
}

// 눈송이 애니메이션 효과
function initSnowEffect() {
    const canvas = document.getElementById('snow');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let snowflakes = [];
    for(let i=0; i<45; i++){
        snowflakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2.5 + 1,
            d: Math.random() * 45
        });
    }
    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        for(let i=0; i<snowflakes.length; i++){
            let f = snowflakes[i];
            ctx.moveTo(f.x, f.y);
            ctx.arc(f.x, f.y, f.r, 0, Math.PI*2, true);
        }
        ctx.fill();
        move();
    }
    function move() {
        for(let i=0; i<snowflakes.length; i++){
            let f = snowflakes[i];
            f.y += Math.cos(f.d) + 1 + f.r/2;
            f.x += Math.sin(f.d) * 0.5;
            if(f.y > height){
                snowflakes[i] = { x: Math.random()*width, y: 0, r: f.r, d: f.d };
            }
        }
    }
    setInterval(draw, 30);
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// 언어 메시지 및 도움말 동적 변환 함수
function updateLanguageUI() {
    const t = i18n[currentLanguage];
    document.getElementById('opt-all').textContent = t.optAll;
    document.getElementById('opt-mine').textContent = t.optMine;
    document.getElementById('btn-reset-txt').textContent = t.btnReset;
    document.getElementById('modal-title-txt').textContent = t.newBooking;
    document.getElementById('btn-confirm-txt').textContent = t.btnConfirm;
    document.getElementById('btn-close-txt').textContent = t.btnClose;
    document.getElementById('res-title-txt').textContent = t.bookingStatus;
    document.getElementById('cancel-label-txt').textContent = t.lblPassword;
    document.getElementById('btn-add-txt').textContent = t.btnModify;
    document.getElementById('btn-cancel-txt').textContent = t.btnCancel;
    document.getElementById('btn-res-close-txt').textContent = t.btnClose;
    document.getElementById('confirmed-header-txt').textContent = t.myConfirmedTitle;

    document.getElementById('alliance').placeholder = "Alliance";
    document.getElementById('player').placeholder = "Nickname";
    document.getElementById('playerId').placeholder = t.placeholderId;
    document.getElementById('daysSaved').placeholder = t.placeholderSpeed;
    document.getElementById('editCancelKey').placeholder = "Password";

    const helpBox = document.getElementById('lang-help-msg');
    if (currentLanguage === 'ko') {
        helpBox.innerHTML = "💡 다른 언어로 변경하고 싶다면 왼쪽의 지구본 메뉴를 선택하세요.";
    } else if (currentLanguage === 'zh') {
        helpBox.innerHTML = "💡 如果您想更改为其他语言，请选择左侧的地球仪菜单。";
    } else if (currentLanguage === 'ja') {
        helpBox.innerHTML = "💡 다른 언어로 변경하고 싶다면 왼쪽의 지구본 메뉴를 선택하세요.";
    } else {
        helpBox.innerHTML = "💡 If you want to change to another language, select the globe menu on the left.";
    }

    const titleSpan = document.getElementById('snowSecret');
    if(titleSpan) {
        titleSpan.style.cursor = 'pointer';
        titleSpan.onclick = () => {
            showCustomAlert("Developed with 💚 by Mona. System optimized.");
        };
    }
}

window.changeLanguage = function(lang) {
    currentLanguage = lang;
    localStorage.setItem('svs_lang', lang);
    updateLanguageUI();
    renderAll();
    renderMyConfirmedBuffs();
};

// 기본 기준 시간 및 설정값 실시간 리스너 연동
function initSystemSettings() {
    db.collection('settings').doc('config').onSnapshot((doc) => {
        if(doc.exists) {
            const data = doc.data();
            baseDateStr = data.baseDate || "";
            tabStatuses = data.tabStatuses || { monday: true, tuesday: true, thursday: true };
            speedVisibilities = data.speedVisibilities || { monday: true, tuesday: true, thursday: true };
            autoSchedule = data.autoSchedule || { globalOpenTime: "", globalCloseTime: "" };
            
            // 데이터베이스에 동적 제한 설정값 존재 여부 확인 후 적용
            if(data.dynamicSpeedLimits) {
                dynamicSpeedLimits = data.dynamicSpeedLimits;
            }
            
            document.getElementById('adminBaseDate').value = baseDateStr;
            updateAdminPanelUI();
        }
        renderAll();
        renderMyConfirmedBuffs();
    });
}

// 실시간 카운트다운 로직
function startGlobalTimer() {
    setInterval(() => {
        // 1) 자동 스케줄 점검 및 상태 반영
        checkAutoSchedule();

        // 2) 카운트다운 렌더링
        const mainCd = document.getElementById('countdown');
        if(!baseDateStr) {
            mainCd.textContent = "Base Date Not Set";
            return;
        }
        const base = new Date(baseDateStr);
        const now = new Date();
        const diff = base - now;
        
        if(diff <= 0) {
            mainCd.textContent = "SVS Event Started / Ended";
            document.getElementById('cd-monday').textContent = "--:--:--";
            document.getElementById('cd-tuesday').textContent = "--:--:--";
            document.getElementById('cd-thursday').textContent = "--:--:--";
            return;
        }
        
        mainCd.textContent = "SVS " + formatTimeDiff(diff);
        
        // 각 요일별 버프 상세 카운트다운 계산 (UTC 오프셋 및 규칙 적용)
        // 월요일: 이벤트 시작 11시간 전
        const monTarget = new Date(base.getTime() - (11 * 60 * 60 * 1000));
        const monDiff = monTarget - now;
        document.getElementById('cd-monday').textContent = monDiff > 0 ? formatTimeDiff(monDiff) : "STARTED";

        // 화요일: 이벤트 시작 후 4시간 뒤
        const tueTarget = new Date(base.getTime() + (4 * 60 * 60 * 1000));
        const tueDiff = tueTarget - now;
        document.getElementById('cd-tuesday').textContent = tueDiff > 0 ? formatTimeDiff(tueDiff) : "STARTED";

        // 목요일: 이벤트 시작 후 52시간 뒤
        const thuTarget = new Date(base.getTime() + (52 * 60 * 60 * 1000));
        const thuDiff = thuTarget - now;
        document.getElementById('cd-thursday').textContent = thuDiff > 0 ? formatTimeDiff(thuDiff) : "STARTED";
    }, 1000);
}

function formatTimeDiff(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    if(days > 0) {
        return `${days}d ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }
    return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

// 자동 예약 상태 관리 로직
function checkAutoSchedule() {
    if(!autoSchedule.globalOpenTime || !autoSchedule.globalCloseTime) return;
    const now = new Date().getTime();
    const openTime = new Date(autoSchedule.globalOpenTime).getTime();
    const closeTime = new Date(autoSchedule.globalCloseTime).getTime();

    let targetStatus = true;
    if(now < openTime || now > closeTime) {
        targetStatus = false;
    }

    if(tabStatuses.monday !== targetStatus || tabStatuses.tuesday !== targetStatus || tabStatuses.thursday !== targetStatus) {
        tabStatuses.monday = targetStatus;
        tabStatuses.tuesday = targetStatus;
        tabStatuses.thursday = targetStatus;

        db.collection('settings').doc('config').update({ tabStatuses })
          .catch(err => console.error("Auto state update failed:", err));
    }
}

// 요일 탭 전환 함수
window.switchBuff = function(day) {
    currentBuff = day;
    document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${day}`).classList.add('active');
    renderAll();
};

// ==========================================
// 2. 예약 데이터 실시간 코어 엔진 및 필터링
// ==========================================
let allBookings = [];

function initBookingListener() {
    db.collection('bookings').onSnapshot((snapshot) => {
        allBookings = [];
        snapshot.forEach((doc) => {
            allBookings.push({ id: doc.id, ...doc.data() });
        });
        renderAll();
        renderMyConfirmedBuffs();
    });
}

// 리셋 필터 및 초기화 함수
window.clearSearch = function() {
    document.getElementById('filterStatus').value = 'all';
    renderAll();
};

// 메인 타임슬롯 그리드 렌더링 함수
window.renderAll = function() {
    const slotsContainer = document.getElementById('slots');
    slotsContainer.innerHTML = "";
    
    const filterStatus = document.getElementById('filterStatus').value;
    const isClosed = !tabStatuses[currentBuff];
    
    const statusMsg = document.getElementById('bookingStatusMsg');
    statusMsg.textContent = isClosed ? i18n[currentLanguage].statusMsgClosed : i18n[currentLanguage].statusMsgOpen;
    statusMsg.style.color = isClosed ? "#e53935" : "#2e7d32";

    // 총 24개 고정 타임슬롯 빌드
    for(let slotIdx = 0; slotIdx < 24; slotIdx++) {
        const slotBookings = allBookings.filter(b => b.buffDay === currentBuff && b.slotIndex === slotIdx);
        
        // 내 예약 필터링 검사 조건
        if(filterStatus === 'mine') {
            const myStoredIds = JSON.parse(localStorage.getItem('my_booking_ids') || "[]");
            const hasMine = slotBookings.some(b => myStoredIds.includes(b.id));
            if(!hasMine) continue; 
        }

        const slotCard = document.createElement('div');
        slotCard.className = `slot-card ${isClosed ? 'disabled' : ''}`;
        
        const timeHeader = document.createElement('div');
        timeHeader.className = 'slot-time';
        timeHeader.textContent = `${String(slotIdx).padStart(2, '0')}:00 - ${String(slotIdx).padStart(2, '0')}:59`;
        slotCard.appendChild(timeHeader);

        const listContainer = document.createElement('div');
        listContainer.className = 'attendee-list';

        // 최대 5명 노출 슬롯 렌더링
        for(let userRow = 0; userRow < 5; userRow++) {
            const booking = slotBookings[userRow];
            const rowDiv = document.createElement('div');
            rowDiv.className = 'attendee-row';

            if(booking) {
                rowDiv.classList.add('occupied');
                if(userRow === 0) rowDiv.classList.add('rank-king');
                
                const isVisible = speedVisibilities[currentBuff];
                const speedText = isVisible ? ` (+${booking.daysSaved || 0}d)` : "";
                rowDiv.textContent = `[${booking.alliance}] ${booking.player}${speedText}`;
            } else {
                rowDiv.classList.add('empty');
                rowDiv.textContent = "- Empty Slot -";
            }
            listContainer.appendChild(rowDiv);
        }
        slotCard.appendChild(listContainer);

        // 카드 클릭 인터랙션 핸들러
        slotCard.onclick = () => {
            if(isClosed) {
                showCustomAlert(i18n[currentLanguage].alertTabClosed);
                return;
            }
            openSlotModal(slotIdx);
        };

        slotsContainer.appendChild(slotCard);
    }
};

// ==========================================
// 3. 예약 추가, 수정 및 취소 제어 시스템 (UTC 가속 조건 적용)
// ==========================================
let targetSlotIndex = null;

function openSlotModal(slotIdx) {
    targetSlotIndex = slotIdx;
    const slotBookings = allBookings.filter(b => b.buffDay === currentBuff && b.slotIndex === slotIdx);
    
    // 타임라인 정보 주입
    const infoStr = `${currentBuff.toUpperCase()} ${String(slotIdx).padStart(2,'0')}:00`;
    document.getElementById('selectedSlotInfo').textContent = infoStr;
    document.getElementById('reservedSlotInfo').textContent = infoStr;

    if(slotBookings.length > 0) {
        // 이미 예약된 정보가 존재할 경우 예약 상태 모달 오픈
        const detailContainer = document.getElementById('attendeeListDetail');
        detailContainer.innerHTML = "";
        
        slotBookings.forEach((b, idx) => {
            const isVisible = speedVisibilities[currentBuff];
            const speedText = isVisible ? ` (+${b.daysSaved || 0}d)` : "";
            const p = document.createElement('p');
            p.style.margin = "6px 0";
            p.style.fontSize = "13px";
            p.style.fontWeight = "700";
            p.textContent = `${idx + 1}. [${b.alliance}] ${b.player}${speedText}`;
            detailContainer.appendChild(p);
        });

        document.getElementById('editCancelKey').value = "";
        document.getElementById('reservedModal').classList.add('show');
    } else {
        // 완전 빈 슬롯일 경우 신규 폼 리셋 후 오픈
        document.getElementById('alliance').value = "";
        document.getElementById('player').value = "";
        document.getElementById('playerId').value = "";
        document.getElementById('daysSaved').value = "";
        document.getElementById('cancelKey').value = "";
        document.getElementById('modal').classList.add('show');
    }
}

window.closeModal = function() { document.getElementById('modal').classList.remove('show'); };
window.closeReservedModal = function() { document.getElementById('reservedModal').classList.remove('show'); };

// 신규 예약 확정 프로세스
window.confirmBooking = function() {
    const alliance = document.getElementById('alliance').value.trim();
    const player = document.getElementById('player').value.trim();
    const playerId = document.getElementById('playerId').value.trim();
    const daysSavedRaw = document.getElementById('daysSaved').value.trim();
    const cancelKey = document.getElementById('cancelKey').value.trim();

    if(!alliance || !player || !playerId || !daysSavedRaw || !cancelKey) {
        showCustomAlert(i18n[currentLanguage].alertInputAll);
        return;
    }
    if(playerId.length !== 9 || isNaN(playerId)) {
        showCustomAlert(i18n[currentLanguage].alertIdDigits);
        return;
    }
    const daysSaved = parseInt(daysSavedRaw);
    if(isNaN(daysSaved) || daysSaved < 0) {
        showCustomAlert(i18n[currentLanguage].alertSpeedMin);
        return;
    }

    // 🌟 [교정] 한국 시간이 아닌 'UTC 요일 기준' 가속 제한 시스템 적용
    const nowUtc = new Date();
    const utcDayIdx = nowUtc.getUTCDay(); // 0:일, 1:월, 2:화, 3:수, 4:목, 5:금, 6:토
    
    // 수요일(3), 목요일(4), 금요일(5) 체크 구조화
    if (utcDayIdx === 3 && daysSaved > dynamicSpeedLimits.wed) {
        showCustomAlert(i18n[currentLanguage].alertSpeedLimit("Wednesday", dynamicSpeedLimits.wed));
        return;
    } else if (utcDayIdx === 4 && daysSaved > dynamicSpeedLimits.thu) {
        showCustomAlert(i18n[currentLanguage].alertSpeedLimit("Thursday", dynamicSpeedLimits.thu));
        return;
    } else if (utcDayIdx === 5 && daysSaved > dynamicSpeedLimits.fri) {
        showCustomAlert(i18n[currentLanguage].alertSpeedLimit("Friday", dynamicSpeedLimits.fri));
        return;
    }

    // 동시성 슬롯 한도(5명) 최종 체크 보증
    const slotBookings = allBookings.filter(b => b.buffDay === currentBuff && b.slotIndex === targetSlotIndex);
    if(slotBookings.length >= 5) {
        showCustomAlert(i18n[currentLanguage].alertLimitExceeded);
        return;
    }

    const newDoc = {
        buffDay: currentBuff,
        slotIndex: targetSlotIndex,
        alliance: alliance,
        player: player,
        playerId: playerId,
        daysSaved: daysSaved,
        cancelKey: cancelKey,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('bookings').add(newDoc).then((docRef) => {
        let myStoredIds = JSON.parse(localStorage.getItem('my_booking_ids') || "[]");
        myStoredIds.push(docRef.id);
        localStorage.setItem('my_booking_ids', JSON.stringify(myStoredIds));

        window.closeModal();
        showCustomAlert(i18n[currentLanguage].alertSuccess);
    }).catch(err => {
        showCustomAlert("Error: " + err.message);
    });
};

// 예약 수정 및 상태 오버라이드 진입부
window.openReserveFromStatus = function() {
    const inputKey = document.getElementById('editCancelKey').value.trim();
    if(!inputKey) {
        showCustomAlert(i18n[currentLanguage].alertInputAll);
        return;
    }

    const slotBookings = allBookings.filter(b => b.buffDay === currentBuff && b.slotIndex === targetSlotIndex);
    const targetBooking = slotBookings.find(b => b.cancelKey === inputKey);

    if(!targetBooking) {
        showCustomAlert(i18n[currentLanguage].alertWrongPwd);
        return;
    }

    window.closeReservedModal();
    
    showCustomPrompt("가속 지원 일수를 수정하세요 (Speed-up Days):", targetBooking.daysSaved, (newVal) => {
        const daysSaved = parseInt(newVal);
        if(isNaN(daysSaved) || daysSaved < 0) {
            showCustomAlert(i18n[currentLanguage].alertSpeedMin);
            return;
        }

        // 🌟 [교정] 수정 시에도 'UTC 요일 기준' 가속 제한 시스템 동일 적용
        const nowUtc = new Date();
        const utcDayIdx = nowUtc.getUTCDay();
        
        if (utcDayIdx === 3 && daysSaved > dynamicSpeedLimits.wed) {
            showCustomAlert(i18n[currentLanguage].alertSpeedLimit("Wednesday", dynamicSpeedLimits.wed));
            return;
        } else if (utcDayIdx === 4 && daysSaved > dynamicSpeedLimits.thu) {
            showCustomAlert(i18n[currentLanguage].alertSpeedLimit("Thursday", dynamicSpeedLimits.thu));
            return;
        } else if (utcDayIdx === 5 && daysSaved > dynamicSpeedLimits.fri) {
            showCustomAlert(i18n[currentLanguage].alertSpeedLimit("Friday", dynamicSpeedLimits.fri));
            return;
        }

        db.collection('bookings').doc(targetBooking.id).update({ daysSaved: daysSaved })
          .then(() => showCustomAlert(i18n[currentLanguage].alertSuccess))
          .catch(err => showCustomAlert("Error: " + err.message));
    });
};

// 특정 슬롯 전용 전체 삭제 처리기
window.confirmCancelAll = function() {
    const inputKey = document.getElementById('editCancelKey').value.trim();
    if(!inputKey) {
        showCustomAlert(i18n[currentLanguage].alertInputAll);
        return;
    }

    const slotBookings = allBookings.filter(b => b.buffDay === currentBuff && b.slotIndex === targetSlotIndex);
    const targetBooking = slotBookings.find(b => b.cancelKey === inputKey);

    if(!targetBooking) {
        showCustomAlert(i18n[currentLanguage].alertWrongPwd);
        return;
    }

    showCustomConfirm(i18n[currentLanguage].confirmCancelAll, () => {
        db.collection('bookings').doc(targetBooking.id).delete().then(() => {
            window.closeReservedModal();
            showCustomAlert(i18n[currentLanguage].alertCancelSuccess);
        }).catch(err => showCustomAlert("Error: " + err.message));
    });
};

// 👑 내 확정된 버프(1등 슬롯) 동적 렌더링 함수
function renderMyConfirmedBuffs() {
    const confirmedSection = document.getElementById('myConfirmedSection');
    const confirmedList = document.getElementById('confirmedList');
    confirmedList.innerHTML = "";

    const myStoredIds = JSON.parse(localStorage.getItem('my_booking_ids') || "[]");
    if(myStoredIds.length === 0) {
        confirmedSection.style.display = "none";
        return;
    }

    let myConfirmedItems = [];

    // 가용화된 요일 전수조사
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        for(let slotIdx = 0; slotIdx < 24; slotIdx++) {
            const slotBookings = allBookings.filter(b => b.buffDay === day && b.slotIndex === slotIdx);
            if(slotBookings.length > 0) {
                const kingBooking = slotBookings[0]; // 무조건 가속 순위 1등 항목
                if(myStoredIds.includes(kingBooking.id)) {
                    myConfirmedItems.push({ day, slotIdx, alliance: kingBooking.alliance, player: kingBooking.player });
                }
            }
        }
    });

    if(myConfirmedItems.length === 0) {
        confirmedSection.style.display = "none";
        return;
    }

    myConfirmedItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'confirmed-item';
        div.textContent = `🎯 [${item.day.toUpperCase()}] ${String(item.slotIdx).padStart(2,'0')}:00 - [${item.alliance}] ${item.player}`;
        confirmedList.appendChild(div);
    });

    confirmedSection.style.display = "block";
}

// ==========================================
// 4. 어드민 어센티케이션 및 모듈 패널 시스템
// ==========================================
window.handleAdminAccess = function() {
    document.getElementById('adminLoginPwd').value = "";
    document.getElementById('adminLoginModal').classList.add('show');
};
window.closeAdminLogin = function() { document.getElementById('adminLoginModal').classList.remove('show'); };

window.confirmAdminLogin = function() {
    const pwd = document.getElementById('adminLoginPwd').value;
    if(pwd === "2737") { // 관리자 비밀번호 고정 규격
        window.closeAdminLogin();
        document.getElementById('adminPanel').classList.add('show');
        logToAdminConsole("Admin authorization successful.");
    } else {
        showCustomAlert(i18n[currentLanguage].alertNoAuth);
    }
};

window.closeAdmin = function() { document.getElementById('adminPanel').classList.remove('show'); };

function logToAdminConsole(msg) {
    const box = document.getElementById('logsBox');
    if(!box) return;
    const div = document.createElement('div');
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// 어드민 제어 상태 토글 및 제어 UI 갱신 함수
function updateAdminPanelUI() {
    ['monday', 'tuesday', 'thursday'].forEach(day => {
        const btnTab = document.getElementById(`btn-admin-${day}`);
        if(btnTab) {
            btnTab.className = tabStatuses[day] ? "admin-tab-btn active" : "admin-tab-btn standard";
        }
        const btnSpeed = document.getElementById(`btn-speed-${day}`);
        if(btnSpeed) {
            btnSpeed.className = speedVisibilities[day] ? "admin-tab-btn active" : "admin-tab-btn standard";
        }
    });

    // 가속 제한 입력 필드에 DB 현재 수치 로드
    if(document.getElementById('speed-req-wed')) document.getElementById('speed-req-wed').value = dynamicSpeedLimits.wed;
    if(document.getElementById('speed-req-thu')) document.getElementById('speed-req-thu').value = dynamicSpeedLimits.thu;
    if(document.getElementById('speed-req-fri')) document.getElementById('speed-req-fri').value = dynamicSpeedLimits.fri;

    if(document.getElementById('global-open-time')) document.getElementById('global-open-time').value = autoSchedule.globalOpenTime || "";
    if(document.getElementById('global-close-time')) document.getElementById('global-close-time').value = autoSchedule.globalCloseTime || "";
}

window.saveAdminBaseDate = function() {
    const newDate = document.getElementById('adminBaseDate').value;
    db.collection('settings').doc('config').update({ baseDate: newDate }).then(() => {
        logToAdminConsole("Base SVS start date updated.");
    }).catch(err => logToAdminConsole("Failed to update date: " + err.message));
};

window.toggleTabStatus = function(day) {
    tabStatuses[day] = !tabStatuses[day];
    db.collection('settings').doc('config').update({ tabStatuses }).then(() => {
        logToAdminConsole(`Booking state for ${day.toUpperCase()} toggled.`);
    });
};

window.toggleSpeedVisibility = function(day) {
    speedVisibilities[day] = !speedVisibilities[day];
    db.collection('settings').doc('config').update({ speedVisibilities }).then(() => {
        logToAdminConsole(`Speed visibility for ${day.toUpperCase()} toggled.`);
    });
};

// 가속 동적 수치 제어 보관소 저장 엔진
window.saveAutoSchedule = function() {
    const openTime = document.getElementById('global-open-time').value;
    const closeTime = document.getElementById('global-close-time').value;
    const wedLimit = parseInt(document.getElementById('speed-req-wed').value) || 0;
    const thuLimit = parseInt(document.getElementById('speed-req-thu').value) || 0;
    const friLimit = parseInt(document.getElementById('speed-req-fri').value) || 0;

    const updatedLimits = { wed: wedLimit, thu: thuLimit, fri: friLimit };
    const updatedSchedule = { globalOpenTime: openTime, globalCloseTime: closeTime };

    db.collection('settings').doc('config').update({
        autoSchedule: updatedSchedule,
        dynamicSpeedLimits: updatedLimits
    }).then(() => {
        logToAdminConsole("Auto Schedule & Speed Limits successfully updated.");
        showCustomAlert("Settings Saved successfully.");
    }).catch(err => logToAdminConsole("Error updating settings: " + err.message));
};

// 엑셀 내보내기용 통합 CSV 파서
window.exportAllCSV = function() {
    logToAdminConsole("Compiling Excel/CSV Booking Report...");
    let csvContent = "\uFEFFDay,Time Slot,Rank,Alliance,Player Name,Player ID,Speed-up Days\n";
    
    const days = ['monday', 'tuesday', 'thursday'];
    days.forEach(day => {
        for(let s = 0; s < 24; s++) {
            const slotBookings = allBookings.filter(b => b.buffDay === day && b.slotIndex === s);
            for(let u = 0; u < 5; u++) {
                const b = slotBookings[u];
                const timeStr = `"${String(s).padStart(2,'0')}:00-${String(s).padStart(2,'0')}:59"`;
                if(b) {
                    csvContent += `${day.toUpperCase()},${timeStr},${u+1},"${b.alliance}","${b.player}","${b.playerId}",${b.daysSaved}\n`;
                } else {
                    csvContent += `${day.toUpperCase()},${timeStr},${u+1},,,,\n`;
                }
            }
        }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `SVS_Booking_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logToAdminConsole("CSV Download triggered successfully.");
};

// 백업 및 전체 데이터 청소 도구
window.backupAndClearAll = function() {
    showCustomConfirm("🚨 경고! 정말 시스템 내부의 모든 예약 데이터를 초기화하시겠습니까? 데이터는 즉시 유실됩니다.", () => {
        logToAdminConsole("Purging booking history database partitions...");
        db.collection('bookings').get().then(snapshot => {
            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
        }).then(() => {
            logToAdminConsole("All booking data purged from Firestore.");
            showCustomAlert("Database initialized.");
        }).catch(err => logToAdminConsole("Error clearing database: " + err.message));
    });
};

// ==========================================
// 5. 엔트리 포인트 활성화 구동
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('svs_lang') || 'en';
    currentLanguage = savedLang;
    document.getElementById('langSelect').value = currentLanguage;

    initSnowEffect();
    updateLanguageUI();
    initSystemSettings();
    initBookingListener();
    startGlobalTimer();
});

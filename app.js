// ... (전역 변수 및 init 함수 이전 코드와 동일)

// 중복 예약 및 ID 9자리 검증을 포함한 확정 함수
function confirmBooking() {
    var a = document.getElementById("alliance").value;
    var p = document.getElementById("player").value;
    var idNum = document.getElementById("playerId").value;
    var d = document.getElementById("daysSaved").value;
    var pass = document.getElementById("password").value;

    // 1. 필수 입력 체크
    if(!a || !p || !idNum || !pass) return alert("모든 항목을 입력해주세요. / Please fill all fields.");

    // 2. ID 9자리 숫자 검증 (수정 사항)
    if(idNum.length !== 9 || isNaN(idNum)) {
        return alert("ID는 반드시 9자리의 숫자여야 합니다. / ID must be 9 digits of numbers.");
    }

    var newEntry = { 
        alliance: a, 
        player: p, 
        playerId: idNum, 
        playerNormalized: normalizeText(p), 
        daysSaved: d, 
        passwordHash: simpleHash(pass), 
        createdAt: Date.now() 
    };

    // 3. 중복 예약 가능하도록 arrayUnion 사용 (수정 사항)
    db.collection("slots").doc(selectedSlot).set({ 
        attendees: firebase.firestore.FieldValue.arrayUnion(newEntry) 
    }, {merge: true})
    .then(() => { 
        localStorage.setItem(MY_BOOKING_KEY, JSON.stringify({ alliance: a, player: p })); 
        closeModal(); 
        alert("예약이 완료되었습니다! / Booking Success!");
        renderAll(); 
    });
}

// ... (관리자 및 기타 함수 유지)

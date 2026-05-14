// 시스템 로그 기록 함수
function addLog(msg) {
    const logsBox = document.getElementById('logsBox');
    if (!logsBox) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement('div');
    logItem.textContent = `[${timeStr}] ${msg}`;
    logsBox.prepend(logItem);
}

// 개별 삭제 함수 (관리자용)
function deleteAttendee(slotId, index) {
    if (!adminAuthenticated) return;
    if (confirm("이 예약을 삭제하시겠습니까? / Delete this booking?")) {
        var ref = db.collection("slots").doc(slotId);
        ref.get().then(doc => {
            var attendees = doc.data().attendees;
            var deletedUser = attendees[index].player;
            attendees.splice(index, 1);
            ref.update({ attendees: attendees }).then(() => {
                addLog(`삭제 완료: ${deletedUser} (${slotId})`);
                openReservedModal(slotId); // 모달 갱신
            });
        });
    }
}

// 요일별 상태 토글
function toggleTabStatus(tab) {
    bookingSettings.tabs[tab].isOpen = !bookingSettings.tabs[tab].isOpen;
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`${tab} 상태 변경: ${bookingSettings.tabs[tab].isOpen ? 'Open' : 'Closed'}`);
        updateAdminStatusButtons();
    });
}

// 전체 열림/닫힘
function toggleAllTabs(status) {
    Object.keys(bookingSettings.tabs).forEach(k => bookingSettings.tabs[k].isOpen = status);
    db.collection("settings").doc("booking").set(bookingSettings).then(() => {
        addLog(`전체 상태 변경: ${status ? 'All Open' : 'All Closed'}`);
        updateAdminStatusButtons();
    });
}

// 관리자 버튼 UI 갱신
function updateAdminStatusButtons() {
    const days = ['monday', 'tuesday', 'thursday'];
    days.forEach(day => {
        const btn = document.getElementById(`btn-admin-${day}`);
        if (btn) {
            const isOpen = bookingSettings.tabs[day].isOpen;
            btn.style.background = isOpen ? "#48bb78" : "#a0aec0";
            btn.style.color = "white";
        }
    });
}

// 엑셀 내보내기 (SheetJS 라이브러리 필요)
function exportAllCSV() {
    try {
        var wb = XLSX.utils.book_new();
        var dayNames = { monday: "월요일", tuesday: "화요일", thursday: "목요일" };
        ["monday", "tuesday", "thursday"].forEach(day => {
            var rows = [];
            Object.keys(allSlotsData).filter(k => k.startsWith(day)).sort().forEach(id => {
                allSlotsData[id]?.attendees?.forEach(a => {
                    rows.push({ "시간(UTC)": id.split('_')[1], "연맹": a.alliance, "닉네임": a.player, "ID": a.playerId, "가속(일)": a.daysSaved });
                });
            });
            if (rows.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), dayNames[day]);
        });
        XLSX.writeFile(wb, "SVS_Booking_Data.xlsx");
        addLog("엑셀 데이터 추출 완료");
    } catch (e) { alert("XLSX 라이브러리가 로드되지 않았습니다."); }
}

// 전체 데이터 지우기
function backupAndClearAll() {
    if (confirm("모든 예약 데이터를 삭제하시겠습니까? / Clear ALL data?")) {
        db.collection("slots").get().then(snap => {
            var batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            batch.commit().then(() => {
                addLog("전체 데이터 초기화 완료");
                alert("초기화되었습니다.");
            });
        });
    }
}

// 예약 현황 모달에서 관리자일 때 삭제 버튼 노출
function openReservedModal(id) {
    var info = document.getElementById("reservedSlotInfo");
    if(info) info.innerText = id.replace('_', ' ') + " UTC";
    var list = document.getElementById("attendeeListDetail");
    list.innerHTML = "";
    allSlotsData[id]?.attendees?.forEach((a, i) => {
        var d = document.createElement("div");
        d.className = "miniItem"; d.style.fontSize = "14px"; d.style.padding = "8px 0";
        var deleteBtn = adminAuthenticated ? `<button onclick="deleteAttendee('${id}', ${i})" style="margin-left:10px; color:red; border:none; background:none; cursor:pointer;">[삭제]</button>` : "";
        d.innerHTML = `<span>${i+1}. [${a.alliance}] ${a.player} (${a.daysSaved}d) ${deleteBtn}</span>`;
        list.appendChild(d);
    });
    document.getElementById("reservedModal").classList.add("show");
}

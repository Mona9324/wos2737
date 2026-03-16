let currentBuff = "monday";
let selectedSlot = null;
let bookingOpen = false;
const svsDate = new Date("2026-03-23T00:00:00Z");

const grid = document.getElementById("slots");
const modal = document.getElementById("modal");
const cancelModal = document.getElementById("cancelModal");
const rankingBox = document.getElementById("rankingBox");

const dbRef = window.db || firebase.firestore();

let bookingUnsubscribe = null;
let slotsUnsubscribe = null;

/* ---------- countdown ---------- */
function updateCountdown() {
  const now = new Date();
  const diff = svsDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerText = "SVS has begun";
    return;
  }

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);

  document.getElementById("countdown").innerText = `SVS begins in ${d}d ${h}h ${m}m`;
}

/* ---------- helpers ---------- */
function padTime(h, m) {
  if (m >= 60) {
    h += Math.floor(m / 60);
    m = m % 60;
  }
  h = h % 24;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function getTabButtons() {
  return document.querySelectorAll(".tabs button");
}

function setActiveTab(buff) {
  const buttons = getTabButtons();
  buttons.forEach((btn) => btn.classList.remove("active"));

  if (buff === "monday" && buttons[0]) buttons[0].classList.add("active");
  if (buff === "tuesday" && buttons[1]) buttons[1].classList.add("active");
  if (buff === "thursday" && buttons[2]) buttons[2].classList.add("active");
}

function clearSelection() {
  document.querySelectorAll(".slot").forEach((slot) => {
    slot.classList.remove("selected", "highlightAvailable", "highlightReserved");
  });
}

function highlightSlot(div, isAvailable) {
  clearSelection();
  div.classList.add("selected");

  if (isAvailable) {
    div.classList.add("highlightAvailable");
  } else {
    div.classList.add("highlightReserved");
  }
}

function getBuffBaseDate(buff) {
  const base = new Date(Date.UTC(2026, 2, 23, 0, 0, 0)); // 2026-03-23 UTC (Monday)

  if (buff === "monday") return new Date(base);
  if (buff === "tuesday") return new Date(Date.UTC(2026, 2, 24, 0, 0, 0));
  if (buff === "thursday") return new Date(Date.UTC(2026, 2, 26, 0, 0, 0));

  return new Date(base);
}

/* ---------- tab change ---------- */
function switchBuff(buff) {
  currentBuff = buff;
  setActiveTab(buff);
  loadSlots();
}

/* ---------- modal ---------- */
function openReserveModal(id) {
  selectedSlot = id;
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
  document.getElementById("alliance").value = "";
  document.getElementById("player").value = "";
  document.getElementById("daysSaved").value = "";
  document.getElementById("password").value = "";
  selectedSlot = null;
  clearSelection();
}

function openCancelModal(id) {
  selectedSlot = id;
  cancelModal.classList.add("show");
}

function closeCancelModal() {
  cancelModal.classList.remove("show");
  document.getElementById("cancelPassword").value = "";
  selectedSlot = null;
  clearSelection();
}

/* ---------- counts / ranking ---------- */
function updateCounts(data) {
  let reserved = 0;
  let available = 0;

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const id = `${currentBuff}_${padTime(h, m)}`;
      if (data[id]) {
        reserved++;
      } else {
        available++;
      }
    }
  }

  document.getElementById("availableCount").innerText = `Available ${available}`;
  document.getElementById("reservedCount").innerText = `Reserved ${reserved}`;
}

function updateTopSpeedups(data) {
  const allSlots = Object.entries(data)
    .filter(([id, slot]) => {
      return (
        id.startsWith(currentBuff + "_") &&
        slot &&
        slot.daysSaved !== undefined &&
        slot.daysSaved !== null &&
        slot.daysSaved !== ""
      );
    })
    .map(([, slot]) => slot)
    .sort((a, b) => Number(b.daysSaved) - Number(a.daysSaved))
    .slice(0, 6);

  let html = '<div class="rankingTitle">Top Speed-ups</div>';

  if (allSlots.length === 0) {
    html += '<div class="rankingItem">No data yet</div>';
  } else {
    allSlots.forEach((slot, idx) => {
      html += `<div class="rankingItem"><span>${idx + 1}</span> ${slot.player || "-"} (${slot.daysSaved})</div>`;
    });
  }

  rankingBox.innerHTML = html;
}

/* ---------- slots ---------- */
function generateSlots(data) {
  grid.innerHTML = "";

  const baseDate = getBuffBaseDate(currentBuff);

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const utcTime = padTime(h, m);
      const id = `${currentBuff}_${utcTime}`;
      const slot = data[id];

      const localDate = new Date(baseDate);
      localDate.setUTCHours(h, m, 0, 0);

      const localTime = localDate.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const div = document.createElement("div");
      div.className = "slot";

      if (!bookingOpen) {
        div.classList.add("locked");
        div.innerHTML = `
          <div class="timeRow">
            <span class="timeUTC">${utcTime} - ${padTime(h, m + 30)} UTC</span>
          </div>
          <div class="timeLocal">${localTime}</div>
          <div class="bookingInfo">🔒 Booking Closed</div>
        `;
      } else if (!slot) {
        div.classList.add("available");
        div.innerHTML = `
          <div class="timeRow">
            <span class="timeUTC">${utcTime} - ${padTime(h, m + 30)} UTC</span>
            <span class="statusAvailable">Available</span>
          </div>
          <div class="timeLocal">${localTime}</div>
          <div class="bookingInfo">&nbsp;</div>
        `;
        div.onclick = function () {
          highlightSlot(div, true);
          openReserveModal(id);
        };
      } else {
        div.classList.add("reserved");
        div.innerHTML = `
          <div class="timeRow">
            <span class="timeUTC">${utcTime} - ${padTime(h, m + 30)} UTC</span>
            <span class="statusReserved">Reserved</span>
          </div>
          <div class="timeLocal">${localTime}</div>
          <div class="bookingInfo">[${slot.alliance}] ${slot.player} (${slot.daysSaved})</div>
        `;
        div.onclick = function () {
          highlightSlot(div, false);
          openCancelModal(id);
        };
      }

      grid.appendChild(div);
    }
  }
}

/* ---------- realtime ---------- */
function attachRealtimeListeners() {
  if (slotsUnsubscribe) {
    slotsUnsubscribe();
    slotsUnsubscribe = null;
  }

  if (bookingUnsubscribe) {
    bookingUnsubscribe();
    bookingUnsubscribe = null;
  }

  bookingUnsubscribe = dbRef.collection("settings").doc("booking").onSnapshot(
    (doc) => {
      bookingOpen = doc.exists ? Boolean(doc.data().open) : false;

      if (slotsUnsubscribe) {
        slotsUnsubscribe();
        slotsUnsubscribe = null;
      }

      slotsUnsubscribe = dbRef.collection("slots").onSnapshot(
        (snapshot) => {
          const data = {};
          snapshot.forEach((docItem) => {
            data[docItem.id] = docItem.data();
          });

          generateSlots(data);
          updateCounts(data);
          updateTopSpeedups(data);
        },
        (error) => {
          console.error("slots onSnapshot error:", error);
        }
      );
    },
    (error) => {
      console.error("booking onSnapshot error:", error);
    }
  );
}

function loadSlots() {
  attachRealtimeListeners();
}

/* ---------- booking ---------- */
function confirmBooking() {
  if (!selectedSlot) return;

  const alliance = document.getElementById("alliance").value.trim();
  const player = document.getElementById("player").value.trim();
  const daysSavedRaw = document.getElementById("daysSaved").value.trim();
  const password = document.getElementById("password").value;
  const daysSaved = Number(daysSavedRaw);

  if (!alliance || !player || !daysSavedRaw || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (!Number.isFinite(daysSaved) || daysSaved < 0) {
    alert("Days Saved must be a number 0 or greater.");
    return;
  }

  if (!bookingOpen) {
    alert("Booking is currently closed.");
    closeModal();
    return;
  }

  const slotRef = dbRef.collection("slots").doc(selectedSlot);
  const bookingRef = dbRef.collection("settings").doc("booking");

  dbRef.runTransaction(async (transaction) => {
    const bookingDoc = await transaction.get(bookingRef);
    const slotDoc = await transaction.get(slotRef);

    const isOpen = bookingDoc.exists ? Boolean(bookingDoc.data().open) : false;

    if (!isOpen) {
      throw new Error("BOOKING_CLOSED");
    }

    if (slotDoc.exists) {
      throw new Error("ALREADY_RESERVED");
    }

    transaction.set(slotRef, {
      alliance,
      player,
      daysSaved,
      password,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  })
  .then(() => {
    closeModal();
  })
  .catch((error) => {
    console.error(error);

    if (error.message === "BOOKING_CLOSED") {
      alert("Booking is currently closed.");
    } else if (error.message === "ALREADY_RESERVED") {
      alert("This slot is already reserved. Please refresh and try another slot.");
    } else {
      alert("An error occurred while reserving.");
    }
  });
}

function confirmCancel() {
  if (!selectedSlot) return;

  const cancelPassword = document.getElementById("cancelPassword").value;
  if (!cancelPassword) {
    alert("Please enter the password.");
    return;
  }

  const slotRef = dbRef.collection("slots").doc(selectedSlot);

  dbRef.runTransaction(async (transaction) => {
    const doc = await transaction.get(slotRef);

    if (!doc.exists) {
      throw new Error("NOT_FOUND");
    }

    if (doc.data().password !== cancelPassword) {
      throw new Error("WRONG_PASSWORD");
    }

    transaction.delete(slotRef);
  })
  .then(() => {
    closeCancelModal();
  })
  .catch((error) => {
    console.error(error);

    if (error.message === "NOT_FOUND") {
      alert("Reservation not found.");
    } else if (error.message === "WRONG_PASSWORD") {
      alert("Password incorrect.");
    } else {
      alert("An error occurred while canceling.");
    }
  });
}

/* ---------- blue snow ---------- */
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
const flakes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initSnow() {
  resizeCanvas();
  flakes.length = 0;

  for (let i = 0; i < 180; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.6 + 0.8,
      speedY: Math.random() * 0.9 + 0.3,
      speedX: Math.random() * 0.4 - 0.2
    });
  }
}

function drawSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  flakes.forEach((f) => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(170, 210, 255, 0.85)";
    ctx.fill();

    f.y += f.speedY;
    f.x += f.speedX;

    if (f.y > canvas.height + 5) {
      f.y = -5;
      f.x = Math.random() * canvas.width;
    }

    if (f.x < -5) f.x = canvas.width + 5;
    if (f.x > canvas.width + 5) f.x = -5;
  });

  requestAnimationFrame(drawSnow);
}

/* ---------- init ---------- */
window.addEventListener("resize", resizeCanvas);
setInterval(updateCountdown, 60000);

updateCountdown();
setActiveTab("monday");
initSnow();
drawSnow();
loadSlots();

// ==========================================================================
// BASHIR DENTAL CLINIC - Shared Script
// ==========================================================================

const CLINIC_WHATSAPP = "923070745426";
const CLINIC_PHONE_TEL = "+923070745426";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdj-lM-wpU7u-Vxh9EQ1zj_3R2fsZQ9DdHOFmVrjNal8EwQcvtVUp-IhheIgw3hn4O4g/exec";

// ---- Mobile nav toggle ----
function toggleNav() {
  const links = document.getElementById("navLinks");
  if (links) links.classList.toggle("open");
}

// ---- Highlight active nav link based on current page ----
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
});

// ---- Friday-off date validation (used on booking form) ----
function setupFridayBlock(dateInputId, msgId) {
  const input = document.getElementById(dateInputId);
  const msg = document.getElementById(msgId);
  if (!input) return;
  input.addEventListener("change", function () {
    const d = new Date(this.value + "T00:00:00");
    if (d.getDay() === 5) {
      if (msg) msg.style.display = "block";
      this.value = "";
    } else {
      if (msg) msg.style.display = "none";
    }
  });
}

function formatDateReadable(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ---- Submit booking: opens WhatsApp to clinic IMMEDIATELY (before any await,
// taake browser isay popup na samajh kr block kr de), phir background mein
// Google Sheet ko data bhejta hai ----
function submitBooking(data, statusEl) {
  statusEl.className = "";
  statusEl.style.display = "none";

  let msg = "🦷 Nayi Appointment Request\n\n";
  msg += "Naam: " + (data.name || "-") + "\n";
  msg += "Phone/WhatsApp: " + (data.phone || "-") + "\n";
  if (data.age) msg += "Age: " + data.age + "\n";
  if (data.gender) msg += "Gender: " + data.gender + "\n";
  msg += "Date: " + formatDateReadable(data.date) + "\n";
  msg += "Time: " + (data.time || "-") + "\n";
  msg += "Service: " + (data.service || data.dentist || "-") + "\n";
  if (data.reason) msg += "Reason: " + data.reason + "\n";
  msg += "\n👉 Braye meherbani upar diye gaye number (" + (data.phone || "-") + ") pr patient ko WhatsApp kr k appointment confirm karein.";

  const waUrl = "https://wa.me/" + CLINIC_WHATSAPP + "?text=" + encodeURIComponent(msg);

  // ZAROORI FIX: window.open() ko YAHAN, FORAN, bina kisi await ke chalate
  // hain (click ke turant baad) - taake browser isay genuine user-action
  // samjhe aur popup block na kare
  const waWindow = window.open(waUrl, "_blank");

  setTimeout(function () {
    alert("⚠️ ZAROORI: WhatsApp mein jakar \"SEND\" button zaroor dabayein, warna aapki appointment request clinic tak nahi pahunchegi!");
  }, 400);

  if (!waWindow) {
    statusEl.innerHTML = "⚠️ <b style='color:#a33;'>WhatsApp khulne mein masla hua</b> (browser ne popup block kiya). Neeche diye button ko dobara dabayein, ya seedha is number pr WhatsApp karein: <a href='" + waUrl + "' target='_blank' style='color:#0052cc;font-weight:700;'>0307-0745426</a>";
  } else {
    statusEl.innerHTML = "⚠️ <b style='color:#a33;'>ZAROORI:</b> WhatsApp khul gaya hai, ab wahan <b style='color:#a33;'>\"SEND\" button zaroor dabayein</b> — warna aapki appointment request clinic tak <u>nahi pahunchegi</u>!";
  }
  statusEl.className = "err";

  // Google Sheet mein bhi save karne ki koshish karein (background mein,
  // is se WhatsApp khulne mein koi taakhir nahi hoti)
  if (GOOGLE_SCRIPT_URL.indexOf("PASTE_YOUR") === -1) {
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    }).catch(function (err) {
      // Sheet save fail ho bhi jaye, WhatsApp se confirm ho jayega
    });
  }
}

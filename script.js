// ==========================================================================
// BASHIR DENTAL CLINIC - Shared Script
// ==========================================================================

const CLINIC_WHATSAPP = "923070745426";
const CLINIC_PHONE_TEL = "+923070745426";
const GOOGLE_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

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

// ---- Submit booking: saves to Sheet (best-effort) + opens WhatsApp to clinic ----
async function submitBooking(data, statusEl) {
  statusEl.className = "";
  statusEl.style.display = "none";

  if (GOOGLE_SCRIPT_URL.indexOf("PASTE_YOUR") === -1) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data)
      });
    } catch (err) {
      // Sheet save fail ho bhi jaye, WhatsApp se confirm ho jayega
    }
  }

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
  window.open(waUrl, "_blank");

  statusEl.textContent = "✅ Thank you! Aapki appointment request Bashir Dental Clinic ko bhej di gayi hai. Thodi hi der mein clinic ki taraf se aap se rabta kr k appointment confirm ki jayegi.";
  statusEl.className = "ok";
}

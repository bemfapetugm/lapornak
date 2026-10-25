// LAPORNAK — interaksi UI awal (belum terhubung ke backend).
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const menuButton = document.getElementById("mobile-menu");
const nav = document.querySelector(".main-nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const trackForm = document.getElementById("track-form");
const trackFeedback = document.getElementById("track-feedback");
if (trackForm && trackFeedback) {
  trackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = document.getElementById("report-code")?.value.trim();
    trackFeedback.hidden = false;
    trackFeedback.textContent = code
      ? "Pratinjau UI: fitur pelacakan belum terhubung ke sistem. Kode belum diperiksa: " + code
      : "Masukkan kode laporan terlebih dahulu.";
  });
}

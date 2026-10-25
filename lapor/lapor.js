(() => {
  "use strict";
  const form = document.getElementById("report-form");
  const identityInputs = document.querySelectorAll('input[name="identity-mode"]');
  const identityFields = document.getElementById("identity-fields");
  const identifiedOption = document.getElementById("identified-option");
  const anonymousOption = document.getElementById("anonymous-option");
  const anonymousNote = document.getElementById("anonymous-note");
  const titleInput = document.getElementById("title");
  const descriptionInput = document.getElementById("description");
  const titleCount = document.getElementById("title-count");
  const descriptionCount = document.getElementById("description-count");
  const fileInput = document.getElementById("attachments");
  const fileList = document.getElementById("file-list");
  const uploadZone = document.getElementById("upload-zone");
  const submitNote = document.getElementById("submission-note");
  const consent = document.getElementById("consent");
  let selectedFiles = [];

  const reporterName = document.getElementById("reporter-name");
  const reporterNim = document.getElementById("reporter-nim");
  const reporterEmail = document.getElementById("reporter-email");
  const reporterPhone = document.getElementById("reporter-phone");

  function updateIdentityMode() {
    const anonymous = document.querySelector('input[name="identity-mode"]:checked')?.value === "anonymous";
    identityFields.hidden = anonymous;
    anonymousNote.hidden = !anonymous;
    identifiedOption.classList.toggle("selected", !anonymous);
    anonymousOption.classList.toggle("selected", anonymous);

    [reporterName, reporterNim].forEach(input => {
      input.required = !anonymous;
      input.setAttribute("aria-required", String(!anonymous));
    });
    [reporterEmail, reporterPhone].forEach(input => {
      input.required = !anonymous;
      input.setAttribute("aria-required", String(!anonymous));
    });

    if (anonymous) {
      identityFields.querySelectorAll("input").forEach(input => {
        input.value = "";
        input.removeAttribute("aria-invalid");
      });
      ["reporter-name", "reporter-nim", "reporter-email", "reporter-phone"].forEach(name => showError(name, ""));
    }
  }
  identityInputs.forEach(input => input.addEventListener("change", updateIdentityMode));

  function updateCounter(input, output) { output.textContent = String(input.value.length); }
  titleInput.addEventListener("input", () => updateCounter(titleInput, titleCount));
  descriptionInput.addEventListener("input", () => updateCounter(descriptionInput, descriptionCount));

  function formatSize(bytes) {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  function renderFiles() {
    fileList.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const row = document.createElement("div");
      row.className = "file-item";
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.innerHTML = '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h7m-7 4h7"/>';
      const info = document.createElement("div");
      info.className = "file-info";
      const name = document.createElement("strong");
      name.textContent = file.name;
      const size = document.createElement("small");
      size.textContent = formatSize(file.size);
      info.append(name, size);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-file";
      remove.textContent = "Hapus";
      remove.setAttribute("aria-label", `Hapus file ${file.name}`);
      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        syncFileInput();
        renderFiles();
      });
      row.append(icon, info, remove);
      fileList.append(row);
    });
  }
  function syncFileInput() {
    const transfer = new DataTransfer();
    selectedFiles.forEach(file => transfer.items.add(file));
    fileInput.files = transfer.files;
  }
  function addFiles(files) {
    const allowed = new Set(["image/jpeg", "image/png", "application/pdf"]);
    const incoming = Array.from(files);
    const errors = [];
    for (const file of incoming) {
      if (!allowed.has(file.type)) { errors.push(`${file.name}: format tidak didukung.`); continue; }
      if (file.size > 10 * 1024 * 1024) { errors.push(`${file.name}: ukuran melebihi 10 MB.`); continue; }
      if (selectedFiles.some(existing => existing.name === file.name && existing.size === file.size)) continue;
      if (selectedFiles.length >= 5) { errors.push("Maksimal 5 file dapat dipilih."); break; }
      selectedFiles.push(file);
    }
    syncFileInput();
    renderFiles();
    if (errors.length) window.alert(errors.join("\n"));
  }
  fileInput.addEventListener("change", event => {
    addFiles(event.target.files);
    syncFileInput();
  });
  ["dragenter", "dragover"].forEach(type => uploadZone.addEventListener(type, event => {
    event.preventDefault(); uploadZone.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach(type => uploadZone.addEventListener(type, event => {
    event.preventDefault(); uploadZone.classList.remove("dragover");
  }));
  uploadZone.addEventListener("drop", event => addFiles(event.dataTransfer.files));

  function showError(name, message) {
    const target = document.querySelector(`[data-error-for="${name}"]`);
    if (target) target.textContent = message;
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    document.querySelectorAll(".field-error").forEach(el => { el.textContent = ""; });
    [reporterName, reporterNim, reporterEmail, reporterPhone].forEach(input => input.removeAttribute("aria-invalid"));
    let valid = true;
    const anonymous = document.querySelector('input[name="identity-mode"]:checked')?.value === "anonymous";
    if (!anonymous) {
      if (!reporterName.value.trim()) {
        showError("reporter-name", "Nama lengkap wajib diisi.");
        reporterName.setAttribute("aria-invalid", "true");
        valid = false;
      }
      if (!reporterNim.value.trim()) {
        showError("reporter-nim", "NIM wajib diisi.");
        reporterNim.setAttribute("aria-invalid", "true");
        valid = false;
      }
      if (!reporterEmail.value.trim()) {
        showError("reporter-email", "Email wajib diisi.");
        reporterEmail.setAttribute("aria-invalid", "true");
        valid = false;
      } else if (!reporterEmail.validity.valid) {
        showError("reporter-email", "Masukkan alamat email yang valid.");
        reporterEmail.setAttribute("aria-invalid", "true");
        valid = false;
      }

      if (!reporterPhone.value.trim()) {
        showError("reporter-phone", "Nomor WhatsApp wajib diisi.");
        reporterPhone.setAttribute("aria-invalid", "true");
        valid = false;
      } else if (!/^[0-9+()\-\s]{8,20}$/.test(reporterPhone.value.trim())) {
        showError("reporter-phone", "Masukkan nomor WhatsApp yang valid.");
        reporterPhone.setAttribute("aria-invalid", "true");
        valid = false;
      }
    }
    if (!document.getElementById("category").value) { showError("category", "Pilih kategori laporan."); valid = false; }
    if (!document.getElementById("visibility").value) { showError("visibility", "Pilih visibilitas laporan."); valid = false; }
    if (!titleInput.value.trim()) { showError("title", "Judul laporan wajib diisi."); valid = false; }
    if (!descriptionInput.value.trim()) { showError("description", "Uraian laporan wajib diisi."); valid = false; }
    if (!consent.checked) { showError("consent", "Persetujuan diperlukan sebelum melanjutkan."); valid = false; }
    if (!valid) {
      const firstError = document.querySelector(".field-error:not(:empty)");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    submitNote.textContent = "Validasi form berhasil. Namun laporan belum dikirim atau disimpan karena backend LAPORNAK belum terhubung.";
    submitNote.classList.add("validation-success");
    submitNote.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  updateIdentityMode();
})();
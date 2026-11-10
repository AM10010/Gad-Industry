
(function () {
  /* ================= CONFIG ================= */

  const RECEIVER_EMAIL = "mabanoub826@gmail.com";
  const EMAIL_SUBJECT = "New registration – 50 years event";

  // November 29, 2026, 12:00 PM Cairo winter time (UTC+2)
  const EVENT_START = "2026-11-29T12:00:00+02:00";

  const EVENT_TIMESTAMP = new Date(EVENT_START).getTime();
  const ENDPOINT =
    "https://formsubmit.co/ajax/" + encodeURIComponent(RECEIVER_EMAIL);

  /* ================= TRANSLATIONS ================= */

  const translations = {
    en: {
      lang: "en",
      dir: "ltr",
      switchLabel: "العربية",
      title: "50 years",
      place: "Triumph hotel",
      dateText: "Sunday, November 29, 2026",
      timeText: "12:00 PM (Cairo Time)",
      startsIn: " starts in",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      started: "The event has started.",
      agendaHeading: "Seminar Agenda",
      locationHeading: "Location",
      openMap: "Open in Google Maps",
      registerHeading: "Register",
      nameLabel: "Full name *",
      emailLabel: "Email *",
      phoneLabel: "Phone *",
      companyLabel: "Company (optional)",
      submitBtn: "Register",
      submittingBtn: "Sending...",
      errName: "Please enter your full name.",
      errEmail: "Please enter a valid email.",
      errPhone: "Please enter your phone number.",
      successMsg: "Thank you! Your registration has been sent.",
      failMsg: "Something went wrong. Please try again.",
      // inside en: { ... }
errPhone: "Please enter your phone number.",
errPhoneInvalid: "Please enter a valid phone number (digits only, 8 to 15 digits)."

// inside ar: { ... }

    },

    ar: {
      lang: "ar",
      dir: "rtl",
      switchLabel: "English",
      title: "٥٠ عامًا",
      place: "فندق ترامب",
      dateText: "الاحد، ٢٩ نوفمبر ٢٠٢٦",
      timeText: "١٢:٠٠ ظهرًا (بتوقيت القاهرة)",
      startsIn: "يبدأ الحدث بعد",
      days: "يوم",
      hours: "ساعة",
      minutes: "دقيقة",
      seconds: "ثانية",
      started: "لقد بدأ الحدث.",
      agendaHeading: "جدول أعمال الندوة",
      locationHeading: "الموقع",
      openMap: "فتح في خرائط جوجل",
      registerHeading: "تسجيل",
      nameLabel: "الاسم الكامل *",
      emailLabel: "البريد الإلكتروني *",
      phoneLabel: "رقم الهاتف *",
      companyLabel: "الشركة (اختياري)",
      submitBtn: "تسجيل",
      submittingBtn: "جارٍ الإرسال...",
      errName: "يرجى إدخال اسمك الكامل.",
      errEmail: "يرجى إدخال بريد إلكتروني صحيح.",
      errPhone: "يرجى إدخال رقم هاتفك.",
      successMsg: "شكرًا لك! تم إرسال تسجيلك.",
      failMsg: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      errPhone: "يرجى إدخال رقم هاتفك.",
errPhoneInvalid: "يرجى إدخال رقم هاتف صحيح (أرقام فقط، من ٨ إلى ١٥ رقمًا)."
    }
  };

  let currentLang = "en";

  const $ = (id) => document.getElementById(id);

  /* ================= LANGUAGE SWITCHER ================= */

  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    document.documentElement.lang = t.lang;
    document.documentElement.dir = t.dir;

    $("langLabel").textContent = t.switchLabel;
    $("eventTitle").textContent = t.title;
    $("eventPlace").textContent = t.place;
    $("eventDateText").textContent = t.dateText;
    $("eventTimeText").textContent = t.timeText;
    $("startsInHeading").textContent = t.startsIn;
    $("daysLabel").textContent = t.days;
    $("hoursLabel").textContent = t.hours;
    $("minutesLabel").textContent = t.minutes;
    $("secondsLabel").textContent = t.seconds;
    $("startedMsg").textContent = t.started;
    $("agendaHeading").textContent = t.agendaHeading;
    $("locationHeading").textContent = t.locationHeading;
    $("openMapLink").querySelector("span").textContent = t.openMap;
    $("registerHeading").textContent = t.registerHeading;
    $("labelName").textContent = t.nameLabel;
    $("labelEmail").textContent = t.emailLabel;
    $("labelPhone").textContent = t.phoneLabel;
    $("labelCompany").textContent = t.companyLabel;

    // Update button without losing its loading state
    const submitBtn = $("submitBtn");

    if (!submitBtn.disabled) {
      submitBtn.textContent = t.submitBtn;
    }

    // Update countdown immediately
    updateCountdown();
  }

  $("langToggle").addEventListener("click", () => {
    applyLanguage(currentLang === "en" ? "ar" : "en");
  });

  // /* ================= COUNTDOWN ================= */

  // function updateCountdown() {
  //   const diff = EVENT_TIMESTAMP - Date.now();

  //   const grid = $("countdownGrid");
  //   const startedMsg = $("startedMsg");

  //   if (diff <= 0) {
  //     grid.style.display = "none";
  //     startedMsg.style.display = "block";
  //     return;
  //   }

  //   grid.style.display = "grid";
  //   startedMsg.style.display = "none";

  //   const seconds = Math.floor(diff / 1000);

  //   const days = Math.floor(seconds / 86400);
  //   const hours = Math.floor((seconds % 86400) / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   const remainingSeconds = seconds % 60;

  //   $("daysVal").textContent = String(days).padStart(2, "0");
  //   $("hoursVal").textContent = String(hours).padStart(2, "0");
  //   $("minutesVal").textContent = String(minutes).padStart(2, "0");
  //   $("secondsVal").textContent = String(remainingSeconds).padStart(2, "0");
  // }

  // updateCountdown();
  // setInterval(updateCountdown, 1000);

  // /* ================= FORM SUBMISSION ================= */

  /* ================= FORM SUBMISSION ================= */

  const OUTBOX_KEY = "reg_outbox";

  function readOutbox() {
    try {
      return JSON.parse(localStorage.getItem(OUTBOX_KEY)) || [];
    } catch {
      return [];
    }
  }

  function writeOutbox(list) {
    try {
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(list));
    } catch {}
  }

  async function sendRegistration(payload, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
        keepalive: true, // request survives tab close / navigation
        signal: controller.signal
      });

      const data = await res.json().catch(() => ({}));
      return res.ok && String(data.success) !== "false";
    } catch (err) {
      console.error("Registration error:", err);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  let flushing = false;

  async function flushOutbox() {
    if (flushing) return;
    flushing = true;

    try {
      const pending = readOutbox();
      if (!pending.length) return;

      const failedIds = new Set();

      for (const item of pending) {
        const ok = await sendRegistration(item.payload);
        if (!ok) failedIds.add(item.id);
      }

      // Re-read so registrations added during the flush are not lost
      writeOutbox(
        readOutbox().filter((item) => {
          const wasSent = pending.some((p) => p.id === item.id) && !failedIds.has(item.id);
          return !wasSent;
        })
      );
    } finally {
      flushing = false;
    }
  }

  window.addEventListener("online", flushOutbox);
  flushOutbox(); // retry anything that failed earlier
  // Converts Arabic-Indic (٠١٢...) and Persian (۰۱۲...) digits to 0-9
  function normalizeDigits(str) {
    return str
      .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)
      .replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x06F0);
  }

  // Returns the cleaned number, or null if it is not a valid phone number
  function parsePhone(value) {
    const cleaned = normalizeDigits(value).replace(/[\s\-().]/g, "");
    return /^\+?\d{8,15}$/.test(cleaned) ? cleaned : null;
  }

  // Block letters while typing (allows digits, +, spaces, - ( ) .)
  $("phone").addEventListener("input", (e) => {
    let v = normalizeDigits(e.target.value).replace(/[^\d+\s\-().]/g, "");
    v = v.replace(/(?!^)\+/g, ""); // "+" only allowed at the start
    if (v !== e.target.value) e.target.value = v;
  });

  const form = $("registrationForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const t = translations[currentLang];

    const nameInput = $("fullName");
    const emailInput = $("email");
    const phoneInput = $("phone");
    const companyInput = $("company");

    const errName = $("errName");
    const errEmail = $("errEmail");
    const errPhone = $("errPhone");
    const statusBox = $("formStatus");

    // Clear previous errors
    errName.textContent = "";
    errEmail.textContent = "";
    errPhone.textContent = "";

    statusBox.textContent = "";
    statusBox.className = "form-status";
    statusBox.style.display = "none";

    // Validate inputs
    let valid = true;

       const phoneClean = parsePhone(phoneInput.value);

    if (!phoneInput.value.trim()) {
      errPhone.textContent = t.errPhone;
      valid = false;
    } else if (!phoneClean) {
      errPhone.textContent = t.errPhoneInvalid;
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value.trim())) {
      errEmail.textContent = t.errEmail;
      valid = false;
    }

    if (!phoneInput.value.trim()) {
      errPhone.textContent = t.errPhone;
      valid = false;
    }

    if (!valid) return;

    const payload = {
      "Full Name": nameInput.value.trim(),
      "Email": emailInput.value.trim(),
      "Phone": phoneInput.value.trim(),
      "Company": companyInput.value.trim() || "-",
      "Event": "50 years – Sunday, November 29, 2026 – 12:00 PM – Triumph hotel",
      _subject: EMAIL_SUBJECT,
      _captcha: "false",
      _honey: "" // honeypot: bots that fill this get ignored
    };

    // 1. Save first so the registration can't be lost
    const id = Date.now() + "-" + Math.random().toString(36).slice(2);
    writeOutbox([...readOutbox(), { id, payload }]);

    // 2. Instant feedback (no waiting on the email server)
    statusBox.textContent = t.successMsg;
    statusBox.className = "form-status success";
    statusBox.style.display = "block";
    form.reset();

    // 3. Send in the background
    sendRegistration(payload).then((ok) => {
      if (ok) {
        writeOutbox(readOutbox().filter((item) => item.id !== id));
      }
      // If it failed, it stays in the outbox and retries on the next
      // page load or when the connection comes back.
    });
  });

  /* ================= INITIALIZATION ================= */

  applyLanguage("en");

})();

(function () {
  /* ================= CONFIG ================= */

  // Google Apps Script web app. The recipients and subject are set inside the script.
  const ENDPOINT =
    "https://script.google.com/macros/s/AKfycbx8M-SBsIYz8CqscadariNzAgbHA9ZXOYvcsX8eZBJxSTm9g7fSpi7-anPI4mIObXwC6A/exec";

  const SEND_TIMEOUT_MS = 30000;

  // November 29, 2026, 12:00 PM Cairo winter time (UTC+2)
  // Only needed if you bring the countdown back.
  const EVENT_START = "2026-11-29T12:00:00+02:00";
  const EVENT_TIMESTAMP = new Date(EVENT_START).getTime();

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
      startsIn: "Event starts in",
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
      errPhoneInvalid:
        "Please enter a valid phone number (digits only, 8 to 15 digits).",
      successMsg: "Thank you! Your registration has been sent.",
      failMsg: "Something went wrong. Please try again."
    },

    ar: {
      lang: "ar",
      dir: "rtl",
      switchLabel: "English",
      title: "٥٠ عامًا",
      place: "فندق تريومف",
      dateText: "الأحد، ٢٩ نوفمبر ٢٠٢٦",
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
      errPhoneInvalid:
        "يرجى إدخال رقم هاتف صحيح (أرقام فقط، من ٨ إلى ١٥ رقمًا).",
      successMsg: "شكرًا لك! تم إرسال تسجيلك.",
      failMsg: "حدث خطأ ما. يرجى المحاولة مرة أخرى."
    }
  };

  let currentLang = "en";

  const $ = (id) => document.getElementById(id);

  // Safe setter: a missing element in the HTML will not break the whole script
  const setText = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };

  /* ================= STATUS / ERROR STATE ================= */
  // Stored as translation keys so they re-translate when the language changes

  const errorKeys = { name: null, email: null, phone: null };
  let statusState = null; // { key: "successMsg" | "failMsg", type: "success" | "error" }

  function renderErrors() {
    const t = translations[currentLang];
    setText("errName", errorKeys.name ? t[errorKeys.name] : "");
    setText("errEmail", errorKeys.email ? t[errorKeys.email] : "");
    setText("errPhone", errorKeys.phone ? t[errorKeys.phone] : "");
  }

  function renderStatus() {
    const box = $("formStatus");
    if (!box) return;

    if (!statusState) {
      box.textContent = "";
      box.className = "form-status";
      box.style.display = "none";
      return;
    }

    box.textContent = translations[currentLang][statusState.key];
    box.className = "form-status " + statusState.type;
    box.style.display = "block";
  }

  /* ================= LANGUAGE SWITCHER ================= */

  function applyLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    document.documentElement.lang = t.lang;
    document.documentElement.dir = t.dir;

    setText("langLabel", t.switchLabel);
    setText("eventTitle", t.title);
    setText("eventPlace", t.place);
    setText("eventDateText", t.dateText);
    setText("eventTimeText", t.timeText);
    setText("startsInHeading", t.startsIn);
    setText("daysLabel", t.days);
    setText("hoursLabel", t.hours);
    setText("minutesLabel", t.minutes);
    setText("secondsLabel", t.seconds);
    setText("startedMsg", t.started);
    setText("agendaHeading", t.agendaHeading);
    setText("locationHeading", t.locationHeading);

    const mapSpan = $("openMapLink") && $("openMapLink").querySelector("span");
    if (mapSpan) mapSpan.textContent = t.openMap;

    setText("registerHeading", t.registerHeading);
    setText("labelName", t.nameLabel);
    setText("labelEmail", t.emailLabel);
    setText("labelPhone", t.phoneLabel);
    setText("labelCompany", t.companyLabel);

    // Do not overwrite the "Sending..." text while a request is in progress
    const submitBtn = $("submitBtn");
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.textContent = t.submitBtn;
    }

    renderErrors();
    renderStatus();
  }

  const langToggle = $("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      applyLanguage(currentLang === "en" ? "ar" : "en");
    });
  }

  /* ================= SENDING ================= */

  async function sendRegistration(payload, timeoutMs = SEND_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        // text/plain avoids a CORS preflight, which Apps Script does not handle
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const data = await res.json().catch(() => ({}));
      if (data.success !== true) {
        console.error("Apps Script rejected the request:", res.status, data);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  // Remove the old background outbox from earlier versions of this script
  try {
    localStorage.removeItem("reg_outbox");
  } catch {}

  /* ================= PHONE HELPERS ================= */

  // Converts Arabic-Indic (٠١٢...) and Persian (۰۱۲...) digits to 0-9
  function normalizeDigits(str) {
    return str
      .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)
      .replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x06f0);
  }

  // Returns the cleaned number, or null if it is not a valid phone number
  function parsePhone(value) {
    const cleaned = normalizeDigits(value).replace(/[\s\-().]/g, "");
    return /^\+?\d{8,15}$/.test(cleaned) ? cleaned : null;
  }

  // Block letters while typing (allows digits, +, spaces, - ( ) .)
  const phoneField = $("phone");
  if (phoneField) {
    phoneField.addEventListener("input", (e) => {
      let v = normalizeDigits(e.target.value).replace(/[^\d+\s\-().]/g, "");
      v = v.replace(/(?!^)\+/g, ""); // "+" only allowed at the start
      if (v !== e.target.value) e.target.value = v;
    });
  }

  /* ================= FORM SUBMISSION ================= */

  const form = $("registrationForm");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let sending = false;

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;

      const t = translations[currentLang];

      const name = $("fullName").value.trim();
      const email = $("email").value.trim();
      const phoneRaw = $("phone").value.trim();
      const company = $("company").value.trim();
      const phoneClean = parsePhone(phoneRaw);

      // Validate
      errorKeys.name = null;
      errorKeys.email = null;
      errorKeys.phone = null;
      statusState = null;

      if (!name) errorKeys.name = "errName";
      if (!emailRegex.test(email)) errorKeys.email = "errEmail";
      if (!phoneRaw) errorKeys.phone = "errPhone";
      else if (!phoneClean) errorKeys.phone = "errPhoneInvalid";

      renderErrors();
      renderStatus();

      if (errorKeys.name || errorKeys.email || errorKeys.phone) return;

      // Event details are built from the config so they can never drift
      const en = translations.en;
      const payload = {
        "Full Name": name,
        "Email": email,
        "Phone": phoneClean,
        "Company": company || "-",
        "Event": `${en.title} – ${en.dateText} – ${en.timeText} – ${en.place}`
      };

      // Send and wait for the real result
      const submitBtn = $("submitBtn");
      sending = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t.submittingBtn;
      }

      const ok = await sendRegistration(payload);

      sending = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = translations[currentLang].submitBtn;
      }

      if (ok) {
        statusState = { key: "successMsg", type: "success" };
        form.reset(); // only clear the form when the email was really sent
      } else {
        statusState = { key: "failMsg", type: "error" }; // keep the data so the user can retry
      }
      renderStatus();
    });
  }

  /* ================= INITIALIZATION ================= */

  applyLanguage("en");
})();

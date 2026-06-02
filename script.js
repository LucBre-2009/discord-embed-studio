const STORAGE_KEY = "embedStudioV3";

let lastSend = 0;
let cooldownTimer;

/* ---------- TABS ---------- */
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- EMBED ---------- */
function getEmbed() {
  const fieldName = document.getElementById("fieldName").value;
  const fieldValue = document.getElementById("fieldValue").value;

  const fields = [];

  if (fieldName.trim() && fieldValue.trim()) {
    fields.push({
      name: fieldName,
      value: fieldValue,
      inline: false
    });
  }

  return {
    title: document.getElementById("title").value || "Untitled",
    description: document.getElementById("description").value || "No description",
    color: parseInt((document.getElementById("color").value || "#5865F2").replace("#", ""), 16),
    fields,
    footer: {
      text: document.getElementById("footer").value || ""
    }
  };
}

/* ---------- PREVIEW ---------- */
function updatePreview() {
  const e = getEmbed();

  document.getElementById("embedPreview").innerHTML = `
    <div style="border-left:4px solid ${document.getElementById("color").value || "#5865F2"};padding:10px;">
      <b>${e.title}</b>
      <p>${e.description}</p>
      ${e.fields.length ? `<p><b>${e.fields[0].name}</b>: ${e.fields[0].value}</p>` : ""}
      <small>${e.footer.text}</small>
    </div>
  `;
}

/* ---------- LIVE SAVE ---------- */
document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("input", () => {
    updatePreview();
    saveState();
  });
});

/* ---------- COOLDOWN (15s) ---------- */
function startCooldown() {
  const btn = document.getElementById("sendBtn");
  const text = document.getElementById("cooldown");

  let time = 15;

  btn.disabled = true;

  clearInterval(cooldownTimer);

  cooldownTimer = setInterval(() => {
    time--;
    text.textContent = `Cooldown: ${time}s`;

    if (time <= 0) {
      clearInterval(cooldownTimer);
      btn.disabled = false;
      text.textContent = "";
    }
  }, 1000);
}

/* ---------- SEND ---------- */
async function sendEmbed() {
  const now = Date.now();
  const status = document.getElementById("status");
  const webhook = document.getElementById("webhook").value.trim();

  if (!webhook) {
    status.textContent = "Missing webhook URL";
    return;
  }

  if (now - lastSend < 15000) {
    status.textContent = "Cooldown active";
    return;
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [getEmbed()] })
    });

    const text = await res.text();

    if (!res.ok) {
      console.log(text);
      status.textContent = `Error (${res.status})`;
      return;
    }

    status.textContent = "Sent ✔";
    lastSend = now;
    startCooldown();

  } catch (e) {
    status.textContent = "Network error";
  }
}

/* ---------- TEMPLATES ---------- */
function applyTemplate(type) {
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const footer = document.getElementById("footer");
  const color = document.getElementById("color");
  const fieldName = document.getElementById("fieldName");
  const fieldValue = document.getElementById("fieldValue");

  /* RESET FIELDS */
  fieldName.value = "";
  fieldValue.value = "";

  if (type === "announce") {
    title.value = "📢 Announcement";
    description.value = "A new update has been released. Check out the latest changes!";
    footer.value = "System Update";
    color.value = "#5865F2";
  }

  if (type === "game") {
    title.value = "🎮 Game Stats";
    description.value = "You just leveled up and unlocked new achievements!";
    fieldName.value = "Level";
    fieldValue.value = "42";
    footer.value = "Game System";
    color.value = "#57F287";
  }

  if (type === "warning") {
    title.value = "⚠ Warning";
    description.value = "Action is required immediately. Please check your settings.";
    footer.value = "Security System";
    color.value = "#ED4245";
  }

  if (type === "success") {
    title.value = "✅ Success";
    description.value = "Operation completed successfully without errors.";
    footer.value = "System";
    color.value = "#57F287";
  }

  if (type === "error") {
    title.value = "❌ Error";
    description.value = "Something went wrong. Please try again later.";
    footer.value = "System Error";
    color.value = "#ED4245";
  }

  if (type === "info") {
    title.value = "ℹ Information";
    description.value = "Here is an important informational message for you.";
    footer.value = "Info Panel";
    color.value = "#3498DB";
  }

  if (type === "achievement") {
    title.value = "🏆 Achievement Unlocked";
    description.value = "You completed a milestone!";
    fieldName.value = "Reward";
    fieldValue.value = "Exclusive Badge";
    footer.value = "Achievements";
    color.value = "#F1C40F";
  }

  if (type === "log") {
    title.value = "📄 System Log";
    description.value = "A new event has been recorded in the system log.";
    footer.value = "Logger";
    color.value = "#95A5A6";
  }

  updatePreview();
  saveState();
}

/* ---------- LOCAL STORAGE ---------- */
function saveState() {
  const data = {
    webhook: document.getElementById("webhook").value,
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    color: document.getElementById("color").value,
    fieldName: document.getElementById("fieldName").value,
    fieldValue: document.getElementById("fieldValue").value,
    footer: document.getElementById("footer").value
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    Object.keys(data).forEach(key => {
      const el = document.getElementById(key);
      if (el) el.value = data[key];
    });

  } catch (e) {
    console.log("Load error", e);
  }
}

/* ---------- INIT ---------- */
loadState();
updatePreview();

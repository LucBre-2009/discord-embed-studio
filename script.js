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

/* ---------- SEND + COOLDOWN (15s) ---------- */
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

/* ---------- COOLDOWN ---------- */
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

/* ---------- TEMPLATES (EXPANDED) ---------- */
function applyTemplate(type) {
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const footer = document.getElementById("footer");
  const color = document.getElementById("color");
  const fieldName = document.getElementById("fieldName");
  const fieldValue = document.getElementById("fieldValue");

  fieldName.value = "";
  fieldValue.value = "";

  if (type === "welcome") {
    title.value = "👋 Welcome";
    description.value = "Welcome to the server! Please read the rules.";
    fieldName.value = "Rules";
    fieldValue.value = "Be respectful • No spam • Have fun";
    footer.value = "Community System";
    color.value = "#5865F2";
  }

  if (type === "rules") {
    title.value = "📜 Rules";
    description.value = "Please follow the server rules.";
    fieldName.value = "Rule 1";
    fieldValue.value = "No harassment or toxic behavior";
    footer.value = "Rules System";
    color.value = "#3498DB";
  }

  if (type === "update") {
    title.value = "🛠 Update";
    description.value = "New update has been released.";
    fieldName.value = "Version";
    fieldValue.value = "v1.0.0";
    footer.value = "Changelog";
    color.value = "#2ECC71";
  }

  if (type === "maintenance") {
    title.value = "🔧 Maintenance";
    description.value = "System is under maintenance.";
    footer.value = "System Notice";
    color.value = "#F1C40F";
  }

  if (type === "poll") {
    title.value = "📊 Poll";
    description.value = "Vote your opinion!";
    fieldName.value = "Options";
    fieldValue.value = "Yes / No / Maybe";
    footer.value = "Voting System";
    color.value = "#9B59B6";
  }

  if (type === "event") {
    title.value = "🎉 Event";
    description.value = "A new event is starting soon!";
    fieldName.value = "Date";
    fieldValue.value = "TBA";
    footer.value = "Event System";
    color.value = "#E67E22";
  }

  if (type === "reminder") {
    title.value = "⏰ Reminder";
    description.value = "Don't forget your task!";
    footer.value = "Reminder System";
    color.value = "#E74C3C";
  }

  if (type === "stats") {
    title.value = "📈 Stats";
    description.value = "Your latest statistics.";
    fieldName.value = "Value";
    fieldValue.value = "Updated";
    footer.value = "Analytics";
    color.value = "#1ABC9C";
  }

  if (type === "quote") {
    title.value = "💬 Quote";
    description.value = "\"Focus beats talent when talent doesn't focus.\"";
    footer.value = "Daily Quote";
    color.value = "#95A5A6";
  }

  if (type === "system") {
    title.value = "🖥 System";
    description.value = "Automated system message.";
    footer.value = "System Core";
    color.value = "#34495E";
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

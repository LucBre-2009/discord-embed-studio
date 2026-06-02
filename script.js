let lastSend = 0;
let cooldownTimer;

/* ---------- TABS ---------- */
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- EMBED BUILDER ---------- */
function getEmbed() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const color = document.getElementById("color").value || "#5865F2";
  const footer = document.getElementById("footer").value;

  const fieldName = document.getElementById("fieldName").value;
  const fieldValue = document.getElementById("fieldValue").value;

  const fields = [];

  // VALIDATION (Discord-safe)
  if (fieldName.trim() && fieldValue.trim()) {
    fields.push({
      name: fieldName,
      value: fieldValue,
      inline: false
    });
  }

  return {
    title: title || "Untitled",
    description: description || "No description",
    color: parseInt(color.replace("#", ""), 16),
    fields,
    footer: {
      text: footer || ""
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

/* ---------- LIVE UPDATE ---------- */
document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("input", updatePreview);
});

/* ---------- COOLDOWN ---------- */
function startCooldown() {
  const btn = document.getElementById("sendBtn");
  const cooldownText = document.getElementById("cooldown");

  let time = 30;
  btn.disabled = true;

  clearInterval(cooldownTimer);

  cooldownTimer = setInterval(() => {
    time--;
    cooldownText.textContent = `Cooldown: ${time}s`;

    if (time <= 0) {
      clearInterval(cooldownTimer);
      btn.disabled = false;
      cooldownText.textContent = "";
    }
  }, 1000);
}

/* ---------- SEND (FIXED + DEBUG) ---------- */
async function sendEmbed() {
  const now = Date.now();
  const status = document.getElementById("status");

  const webhook = document.getElementById("webhook").value.trim();

  if (!webhook) {
    status.textContent = "Missing webhook URL";
    return;
  }

  if (now - lastSend < 30000) {
    status.textContent = "Cooldown active";
    return;
  }

  const payload = {
    embeds: [getEmbed()]
  };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    if (!res.ok) {
      console.log("Discord error:", text);
      status.textContent = `Error (${res.status})`;
      return;
    }

    status.textContent = "Sent ✔";
    lastSend = now;
    startCooldown();

  } catch (err) {
    console.error(err);
    status.textContent = "Network error";
  }
}

/* ---------- TEMPLATES (FIXED) ---------- */
function applyTemplate(type) {
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const footer = document.getElementById("footer");
  const color = document.getElementById("color");

  if (type === "announce") {
    title.value = "Announcement";
    description.value = "New update released!";
    footer.value = "System";
    color.value = "#5865F2";
  }

  if (type === "game") {
    title.value = "Game Stats";
    description.value = "Level up achieved!";
    footer.value = "Game System";
    color.value = "#57F287";
  }

  if (type === "warning") {
    title.value = "Warning";
    description.value = "Action required!";
    footer.value = "Security";
    color.value = "#ED4245";
  }

  updatePreview();
}

/* INIT */
updatePreview();

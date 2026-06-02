let lastSend = 0;
let cooldownTimer;

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* CLEAN EMBED */
function getEmbed() {
  return {
    title: document.getElementById("title").value || "Untitled",
    description: document.getElementById("description").value || "No description",
    color: document.getElementById("color").value || "#5865F2",
    fields: [
      {
        name: document.getElementById("fieldName").value || "",
        value: document.getElementById("fieldValue").value || "",
        inline: false
      }
    ],
    footer: {
      text: document.getElementById("footer").value || ""
    }
  };
}

/* PREVIEW */
function updatePreview() {
  const e = getEmbed();

  document.getElementById("embedPreview").innerHTML = `
    <div style="border-left:4px solid ${e.color}; padding:12px;">
      <div style="font-weight:600; font-size:15px;">${e.title}</div>
      <div style="margin-top:6px; color:#cfd3dc;">${e.description}</div>
      <div style="margin-top:10px; font-size:13px; color:#9aa0aa;">
        <b>${e.fields[0].name}</b> ${e.fields[0].value}
      </div>
      <div style="margin-top:10px; font-size:12px; opacity:0.7;">
        ${e.footer.text}
      </div>
    </div>
  `;
}

/* LIVE UPDATE */
document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("input", () => {
    updatePreview();
    save();
  });
});

/* COOLDOWN SYSTEM */
function startCooldown() {
  const btn = document.getElementById("sendBtn");
  const text = document.getElementById("cooldown");

  let time = 30;
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

/* SEND */
async function sendEmbed() {
  const now = Date.now();
  const status = document.getElementById("status");

  if (now - lastSend < 30000) {
    status.textContent = "Please wait for cooldown.";
    return;
  }

  const webhook = document.getElementById("webhook").value;
  if (!webhook) {
    status.textContent = "Webhook missing.";
    return;
  }

  const payload = { embeds: [getEmbed()] };

  try {
    lastSend = now;

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    status.textContent = res.ok ? "Sent successfully ✔" : "Failed ❌";
    startCooldown();

  } catch (e) {
    status.textContent = "Network error ❌";
  }
}

/* SAVE */
function save() {
  localStorage.setItem("embedStudioV2", JSON.stringify({
    title: title.value,
    description: description.value,
    footer: footer.value,
    color: color.value,
    fieldName: fieldName.value,
    fieldValue: fieldValue.value
  }));
}

/* LOAD */
function load() {
  const data = JSON.parse(localStorage.getItem("embedStudioV2"));
  if (!data) return;

  Object.keys(data).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = data[k];
  });

  updatePreview();
}

load();
updatePreview();

```javascript
const STORAGE_KEY = "embedStudioV5";

let lastSend = 0;
let cooldownTimer;

let modules = [];

let nextModuleId = 1;


/* =========================================================
   TABS
========================================================= */

function showTab(id) {

  document
    .querySelectorAll(".tab")
    .forEach(tab => {
      tab.classList.remove("active");
    });

  document
    .getElementById(id)
    .classList.add("active");

}


/* =========================================================
   MODULE SYSTEM
========================================================= */

function addModule(text = "") {

  modules.push({
    id: nextModuleId++,
    text: text,
    paired: false
  });

  renderModules();

  saveState();

  updatePreview();

}


/* ---------------------------------------------------------
   DELETE MODULE
--------------------------------------------------------- */

function deleteModule(id) {

  modules = modules.filter(
    module => module.id !== id
  );

  /*
   * If a module was paired with another one,
   * remove the pairing from the remaining module.
   */

  normalizePairs();

  renderModules();

  saveState();

  updatePreview();

}


/* ---------------------------------------------------------
   MOVE UP
--------------------------------------------------------- */

function moveModuleUp(id) {

  const index =
    modules.findIndex(
      module => module.id === id
    );

  if (index <= 0) return;

  [
    modules[index - 1],
    modules[index]
  ] =
  [
    modules[index],
    modules[index - 1]
  ];

  normalizePairs();

  renderModules();

  saveState();

  updatePreview();

}


/* ---------------------------------------------------------
   MOVE DOWN
--------------------------------------------------------- */

function moveModuleDown(id) {

  const index =
    modules.findIndex(
      module => module.id === id
    );

  if (
    index === -1 ||
    index >= modules.length - 1
  ) {
    return;
  }

  [
    modules[index],
    modules[index + 1]
  ] =
  [
    modules[index + 1],
    modules[index]
  ];

  normalizePairs();

  renderModules();

  saveState();

  updatePreview();

}


/* =========================================================
   PAIRING
========================================================= */

function togglePair(id) {

  const index =
    modules.findIndex(
      module => module.id === id
    );

  if (index === -1) return;


  const module = modules[index];


  /*
   * If this module is already paired,
   * unpair it.
   */

  if (module.paired) {

    module.paired = false;

    renderModules();

    saveState();

    updatePreview();

    return;
  }


  /*
   * A module can only pair with
   * the module immediately after it.
   */

  if (index >= modules.length - 1) {

    alert(
      "This module has no module after it to pair with."
    );

    return;
  }


  const next = modules[index + 1];


  /*
   * If the next module is already paired,
   * don't allow a third module.
   */

  if (next.paired) {

    alert(
      "Only two modules can be paired together."
    );

    return;
  }


  /*
   * Pair the two modules.
   */

  module.paired = true;

  next.paired = true;


  renderModules();

  saveState();

  updatePreview();

}


/* ---------------------------------------------------------
   NORMALIZE PAIRS
--------------------------------------------------------- */

function normalizePairs() {

  /*
   * Remove invalid pair states.
   */

  for (let i = 0; i < modules.length; i++) {

    if (!modules[i].paired) {
      continue;
    }

    /*
     * A paired module must have another
     * paired module directly next to it.
     */

    const previousPaired =
      i > 0 &&
      modules[i - 1].paired;

    const nextPaired =
      i < modules.length - 1 &&
      modules[i + 1].paired;


    if (!previousPaired && !nextPaired) {

      modules[i].paired = false;

    }

  }

}


/* =========================================================
   RENDER MODULES
========================================================= */

function renderModules() {

  const container =
    document.getElementById("modules");

  container.innerHTML = "";


  modules.forEach((module, index) => {

    const element =
      document.createElement("div");

    element.className = "module";


    const top =
      document.createElement("div");

    top.className = "module-top";


    const title =
      document.createElement("div");

    title.className = "module-title";

    title.textContent =
      `Text Module ${index + 1}`;


    const actions =
      document.createElement("div");

    actions.className = "module-actions";


    /*
     * Move up
     */

    const up =
      document.createElement("button");

    up.textContent = "↑";

    up.title = "Move up";

    up.onclick = () =>
      moveModuleUp(module.id);


    /*
     * Move down
     */

    const down =
      document.createElement("button");

    down.textContent = "↓";

    down.title = "Move down";

    down.onclick = () =>
      moveModuleDown(module.id);


    /*
     * Pair
     */

    const pair =
      document.createElement("button");

    pair.textContent =
      module.paired
        ? "Unpair"
        : "Pair";

    pair.classList.add("pair-button");

    if (module.paired) {
      pair.classList.add("active");
    }

    pair.onclick = () =>
      togglePair(module.id);


    /*
     * Delete
     */

    const remove =
      document.createElement("button");

    remove.textContent = "✕";

    remove.title = "Delete";

    remove.onclick = () =>
      deleteModule(module.id);


    actions.appendChild(up);

    actions.appendChild(down);

    actions.appendChild(pair);

    actions.appendChild(remove);


    top.appendChild(title);

    top.appendChild(actions);


    /*
     * Textarea
     */

    const textarea =
      document.createElement("textarea");

    textarea.placeholder =
      "Write your text here...\n\nExamples:\n# Heading\n## Subheading\n**Bold**\n*Italic*\n`Code`\n~~Strike~~\n[Link](https://example.com)";

    textarea.value =
      module.text;


    textarea.addEventListener(
      "input",
      () => {

        module.text =
          textarea.value;

        saveState();

        updatePreview();

      }
    );


    /*
     * Pair info
     */

    const info =
      document.createElement("div");

    info.className = "pair-info";

    if (module.paired) {

      info.textContent =
        "Paired with the adjacent module";

    } else {

      info.textContent =
        "Normal text module";

    }


    element.appendChild(top);

    element.appendChild(textarea);

    element.appendChild(info);


    container.appendChild(element);

  });


}


/* =========================================================
   MARKDOWN
========================================================= */

function escapeHTML(text) {

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


function formatMarkdown(text) {

  let html =
    escapeHTML(text);


  /*
   * Links
   */

  html =
    html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,

      '<a href="$2" target="_blank">$1</a>'
    );


  /*
   * Code
   */

  html =
    html.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );


  /*
   * Bold
   */

  html =
    html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );


  /*
   * Italic
   */

  html =
    html.replace(
      /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
      "<em>$1</em>"
    );


  /*
   * Strikethrough
   */

  html =
    html.replace(
      /~~(.*?)~~/g,
      "<del>$1</del>"
    );


  /*
   * Headings
   */

  html =
    html.replace(
      /^### (.*)$/gm,
      "<h4>$1</h4>"
    );

  html =
    html.replace(
      /^## (.*)$/gm,
      "<h3>$1</h3>"
    );

  html =
    html.replace(
      /^# (.*)$/gm,
      "<h2>$1</h2>"
    );


  /*
   * Line breaks
   */

  html =
    html.replace(
      /\n/g,
      "<br>"
    );


  return html;

}


/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {

  const preview =
    document.getElementById("embedPreview");


  const title =
    document.getElementById("title").value ||
    "Untitled";


  const color =
    document.getElementById("color").value ||
    "#5865F2";


  /*
   * Split modules into normal content
   * and paired fields.
   */

  let descriptionHTML = "";

  let fieldsHTML = "";


  let i = 0;


  while (i < modules.length) {

    const module =
      modules[i];


    /*
     * Paired modules
     */

    if (
      module.paired &&
      modules[i + 1] &&
      modules[i + 1].paired
    ) {

      const first =
        modules[i];

      const second =
        modules[i + 1];


      fieldsHTML += `

        <div class="preview-field">

          ${formatMarkdown(first.text)}

        </div>

        <div class="preview-field">

          ${formatMarkdown(second.text)}

        </div>

      `;


      i += 2;

      continue;
    }


    /*
     * Normal module
     */

    descriptionHTML += `

      <div class="preview-description">

        ${formatMarkdown(module.text)}

      </div>

    `;


    i++;

  }


  preview.innerHTML = `

    <div
      style="
        border-left: 4px solid ${color};
        padding-left: 12px;
      "
    >

      <div class="preview-title">

        ${formatMarkdown(title)}

      </div>


      ${descriptionHTML}


      ${
        fieldsHTML
          ? `
            <div class="preview-fields">
              ${fieldsHTML}
            </div>
          `
          : ""
      }

    </div>

  `;

}


/* =========================================================
   DISCORD EMBED
========================================================= */

function getEmbed() {

  const title =
    document.getElementById("title").value.trim();


  const color =
    parseInt(
      (
        document.getElementById("color").value ||
        "#5865F2"
      ).replace("#", ""),
      16
    );


  const embed = {

    color: color

  };


  if (title) {
    embed.title = title;
  }


  /*
   * Description
   */

  const normalModules = [];


  /*
   * Discord fields
   */

  const fields = [];


  let i = 0;


  while (i < modules.length) {

    const module =
      modules[i];


    /*
     * Two paired modules
     */

    if (
      module.paired &&
      modules[i + 1] &&
      modules[i + 1].paired
    ) {

      const first =
        modules[i];

      const second =
        modules[i + 1];


      /*
       * Split the first line into
       * field name and value if possible.
       *
       * Example:
       *
       * **Rules**
       * Be respectful
       */

      const firstLines =
        first.text.split("\n");

      const secondLines =
        second.text.split("\n");


      let firstName =
        firstLines[0] || " ";

      let firstValue =
        firstLines.slice(1).join("\n") || " ";


      let secondName =
        secondLines[0] || " ";

      let secondValue =
        secondLines.slice(1).join("\n") || " ";


      /*
       * Remove Markdown bold from
       * field names.
       */

      firstName =
        firstName
          .replace(/\*\*/g, "")
          .trim();


      secondName =
        secondName
          .replace(/\*\*/g, "")
          .trim();


      fields.push({

        name:
          firstName || " ",

        value:
          firstValue || " ",

        inline:
          true

      });


      fields.push({

        name:
          secondName || " ",

        value:
          secondValue || " ",

        inline:
          true

      });


      i += 2;

      continue;

    }


    /*
     * Normal module
     */

    if (module.text.trim()) {

      normalModules.push(
        module.text
      );

    }


    i++;

  }


  /*
   * Discord embed description
   */

  if (normalModules.length) {

    embed.description =
      normalModules.join("\n\n");

  }


  /*
   * Discord fields
   */

  if (fields.length) {

    embed.fields = fields;

  }


  return embed;

}


/* =========================================================
   SEND
========================================================= */

async function sendEmbed() {

  const now =
    Date.now();


  const status =
    document.getElementById("status");


  const webhook =
    document
      .getElementById("webhook")
      .value
      .trim();


  const webhookName =
    document
      .getElementById("webhookName")
      .value
      .trim();


  const avatarUrl =
    document
      .getElementById("avatarUrl")
      .value
      .trim();


  if (!webhook) {

    status.textContent =
      "Missing webhook URL";

    return;

  }


  if (
    now - lastSend <
    15000
  ) {

    status.textContent =
      "Cooldown active";

    return;

  }


  const payload = {

    embeds: [
      getEmbed()
    ]

  };


  /*
   * Optional webhook name
   */

  if (webhookName) {

    payload.username =
      webhookName;

  }


  /*
   * Optional avatar
   */

  if (avatarUrl) {

    payload.avatar_url =
      avatarUrl;

  }


  try {

    const res =
      await fetch(
        webhook,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)

        }
      );


    const text =
      await res.text();


    if (!res.ok) {

      console.log(text);

      status.textContent =
        `Error (${res.status})`;

      return;

    }


    status.textContent =
      "Sent ✔";


    lastSend =
      now;


    startCooldown();


  } catch (error) {

    console.error(error);

    status.textContent =
      "Network error";

  }

}


/* =========================================================
   COOLDOWN
========================================================= */

function startCooldown() {

  const button =
    document.getElementById("sendBtn");


  const text =
    document.getElementById("cooldown");


  let time = 15;


  button.disabled = true;


  clearInterval(
    cooldownTimer
  );


  cooldownTimer =
    setInterval(() => {

      time--;

      text.textContent =
        `Cooldown: ${time}s`;


      if (time <= 0) {

        clearInterval(
          cooldownTimer
        );

        button.disabled =
          false;

        text.textContent = "";

      }

    }, 1000);

}


/* =========================================================
   TEMPLATES
========================================================= */

function applyTemplate(type) {

  modules = [];

  nextModuleId = 1;


  const title =
    document.getElementById("title");


  const color =
    document.getElementById("color");


  if (type === "welcome") {

    title.value =
      "👋 Welcome";

    color.value =
      "#5865F2";


    addModule(
      "Welcome to the server!\nPlease read the rules."
    );


    addModule(
      "**Rules**\nBe respectful\nNo spam"
    );


    addModule(
      "**Links**\nWebsite\nDiscord"
    );


    /*
     * Pair Rules + Links
     */

    modules[1].paired = true;
    modules[2].paired = true;

  }


  if (type === "rules") {

    title.value =
      "📜 Rules";

    color.value =
      "#3498DB";


    addModule(
      "Please follow the server rules."
    );


    addModule(
      "**Rule 1**\nNo harassment or toxic behavior"
    );


    addModule(
      "**Rule 2**\nNo spam or unwanted advertising"
    );


    modules[1].paired = true;
    modules[2].paired = true;

  }


  if (type === "update") {

    title.value =
      "🛠 Update";

    color.value =
      "#2ECC71";


    addModule(
      "A new update has been released."
    );


    addModule(
      "**Version**\nv1.0.0"
    );


    addModule(
      "**Status**\nReleased"
    );


    modules[1].paired = true;
    modules[2].paired = true;

  }


  if (type === "maintenance") {

    title.value =
      "🔧 Maintenance";

    color.value =
      "#F1C40F";


    addModule(
      "System is currently under maintenance."
    );

  }


  if (type === "poll") {

    title.value =
      "📊 Poll";

    color.value =
      "#9B59B6";


    addModule(
      "Vote your opinion!"
    );


    addModule(
      "**Options**\nYes / No / Maybe"
    );

  }


  if (type === "event") {

    title.value =
      "🎉 Event";

    color.value =
      "#E67E22";


    addModule(
      "A new event is starting soon!"
    );


    addModule(
      "**Date**\nTBA"
    );

  }


  if (type === "reminder") {

    title.value =
      "⏰ Reminder";

    color.value =
      "#E74C3C";


    addModule(
      "Don't forget your task!"
    );

  }


  if (type === "stats") {

    title.value =
      "📈 Stats";

    color.value =
      "#1ABC9C";


    addModule(
      "Your latest statistics."
    );


    addModule(
      "**Value**\nUpdated"
    );

  }


  if (type === "quote") {

    title.value =
      "💬 Quote";

    color.value =
      "#95A5A6";


    addModule(
      "\"Focus beats talent when talent doesn't focus.\""
    );

  }


  if (type === "system") {

    title.value =
      "🖥 System";

    color.value =
      "#34495E";


    addModule(
      "Automated system message."
    );

  }


  renderModules();

  updatePreview();

  saveState();

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveState() {

  const data = {

    webhook:
      document.getElementById("webhook").value,

    webhookName:
      document.getElementById("webhookName").value,

    avatarUrl:
      document.getElementById("avatarUrl").value,

    title:
      document.getElementById("title").value,

    color:
      document.getElementById("color").value,

    modules:
      modules,

    nextModuleId:
      nextModuleId

  };


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

}


/* =========================================================
   LOAD
========================================================= */

function loadState() {

  const raw =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!raw) {

    /*
     * Start with one empty module
     */

    addModule();

    return;

  }


  try {

    const data =
      JSON.parse(raw);


    document.getElementById(
      "webhook"
    ).value =
      data.webhook || "";


    document.getElementById(
      "webhookName"
    ).value =
      data.webhookName || "";


    document.getElementById(
      "avatarUrl"
    ).value =
      data.avatarUrl || "";


    document.getElementById(
      "title"
    ).value =
      data.title || "";


    document.getElementById(
      "color"
    ).value =
      data.color || "#5865F2";


    modules =
      Array.isArray(data.modules)
        ? data.modules
        : [];


    nextModuleId =
      data.nextModuleId || 1;


    renderModules();


  } catch (error) {

    console.error(
      "Load error",
      error
    );


    modules = [];

    nextModuleId = 1;

    addModule();

  }

}


/* =========================================================
   GLOBAL LIVE SAVE
========================================================= */

document.addEventListener(
  "input",
  event => {

    if (
      event.target.matches(
        "#webhook, #webhookName, #avatarUrl, #title, #color"
      )
    ) {

      saveState();

      updatePreview();

    }

  }
);


/* =========================================================
   INIT
========================================================= */

loadState();

updatePreview();
```

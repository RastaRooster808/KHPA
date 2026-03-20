(function () {
  const botInput = document.getElementById("botInput");
  const botSend = document.getElementById("botSend");
  const botAssist = document.getElementById("botAssist");
  const botMessages = document.getElementById("botMessages");

  if (!botInput || !botSend || !botMessages) return;

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "bot-message " + type;
    div.textContent = text;
    botMessages.appendChild(div);
    botMessages.scrollTop = botMessages.scrollHeight;
  }

  function normalize(text) {
    return text.toLowerCase().trim();
  }

  function getReply(question) {
    const q = normalize(question);

    if (!q) {
      return "Please enter your question so that guidance may be provided.";
    }

    if (
      q.includes("office") ||
      q.includes("island office") ||
      q.includes("where do i submit") ||
      q.includes("submit")
    ) {
      return "All documents are processed through the appropriate island office in order to maintain proper routing, verification, and record integrity. If you need help identifying the correct office pathway, please use the Direct Assistance form.";
    }

    if (
      q.includes("protocol") ||
      q.includes("requirement") ||
      q.includes("what do i need") ||
      q.includes("required")
    ) {
      return "Uniform protocol applies to submissions, verification, and filing review. Supporting documents, completed forms, and proper routing are part of the standard administrative process. Please review the Protocol page or use Direct Assistance for clarification.";
    }

    if (q.includes("registration") || q.includes("register")) {
      return "Registration services are handled through official filing procedure. Please review the Registration and Licensing section and prepare the proper form packet before submission through the island office process.";
    }

    if (q.includes("license") || q.includes("licensing")) {
      return "Licensing matters follow the Registration and Licensing pathway. Completion of the proper form packet and submission through the island office process are required for administrative review.";
    }

    if (
      q.includes("id") ||
      q.includes("identification") ||
      q.includes("operator")
    ) {
      return "Identification and operator certificate matters follow the same administrative submission pathway. Please use the proper application packet and submit through island office protocol for review and processing.";
    }

    if (q.includes("vehicle")) {
      return "Vehicle-related filings require the appropriate registration packet and supporting ownership documentation. Please consult the Registration and Licensing section and submit through the island office process.";
    }

    if (q.includes("vessel") || q.includes("boat")) {
      return "Vessel registration matters require the proper packet and supporting documentation. Administrative routing and verification are handled through the island office submission process.";
    }

    if (q.includes("business")) {
      return "Business registration matters must follow the standard filing pathway. Please review the Registration and Licensing section for the applicable category and required submission route.";
    }

    if (
      q.includes("document") ||
      q.includes("pdf") ||
      q.includes("record") ||
      q.includes("archive")
    ) {
      return "Government documents are maintained in the Government Documents section for public administrative reference. If you need help locating a specific record, please use the Direct Assistance form for routing support.";
    }

    if (
      q.includes("history") ||
      q.includes("constitution") ||
      q.includes("kamehameha") ||
      q.includes("proclamation")
    ) {
      return "Historical and founding records are maintained through the Government Documents section as part of the public reference archive.";
    }

    if (
      q.includes("contact") ||
      q.includes("help") ||
      q.includes("assistance")
    ) {
      return "For official help regarding routing, submissions, filings, or records, please use the Direct Assistance form on this page. Matters requiring review are handled through administrative follow-up.";
    }

    if (q.includes("emporium") || q.includes("artisan") || q.includes("vendor")) {
      return "Emporium and artisan-related matters should be routed through the appropriate public contact pathway for review. Please use the Direct Assistance form so the inquiry can be properly received and processed.";
    }

    return "This inquiry may require official review. For routing, document guidance, submission clarification, or administrative assistance, please use the Direct Assistance form below so the matter can be properly received and processed.";
  }

  function sendQuestion() {
    const text = botInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    const reply = getReply(text);

    setTimeout(function () {
      addMessage(reply, "bot");
    }, 150);

    botInput.value = "";
  }

  botSend.addEventListener("click", sendQuestion);

  botInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  });

  if (botAssist) {
    botAssist.addEventListener("click", function () {
      const form = document.getElementById("direct-assistance-form");
      if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
})();

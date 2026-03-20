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

    if (q.includes("office") || q.includes("submit")) {
      return "All documents are processed through the appropriate island office to maintain proper routing, verification, and record integrity. Use Direct Assistance for guidance.";
    }

    if (q.includes("protocol") || q.includes("requirement")) {
      return "Uniform protocol applies to all submissions, verification, and filing review. Please consult the Protocol section or request assistance.";
    }

    if (q.includes("registration")) {
      return "Registration services follow official filing procedures. Prepare the correct form packet and submit through the island office process.";
    }

    if (q.includes("license")) {
      return "Licensing services are handled through the Registration and Licensing portal and require proper documentation and submission routing.";
    }

    if (q.includes("id") || q.includes("operator")) {
      return "Identification and operator certificates follow the same administrative submission pathway through island offices.";
    }

    if (q.includes("vehicle")) {
      return "Vehicle registration requires proper documentation and must be submitted through the island office process.";
    }

    if (q.includes("vessel") || q.includes("boat")) {
      return "Vessel registration requires proper documentation and submission through the island office process.";
    }

    if (q.includes("business")) {
      return "Business registration follows standard filing procedures. Please review Registration & Licensing for details.";
    }

    if (q.includes("document") || q.includes("pdf")) {
      return "Government documents are available in the Government Documents section for public administrative reference.";
    }

    if (q.includes("help") || q.includes("contact")) {
      return "For official assistance, please use the Direct Assistance form below so your request can be properly routed and processed.";
    }

    return "This inquiry may require official review. Please use the Direct Assistance form so your request can be properly received and processed.";
  }

  function sendQuestion() {
    const text = botInput.value.trim();
    if (!text) return;

    addMessage(text, "user");

    setTimeout(function () {
      addMessage(getReply(text), "bot");
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
        form.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
})();

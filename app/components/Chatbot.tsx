"use client";

import { useEffect } from "react";

export default function Chatbot() {
  useEffect(() => {
    // Įkeliame Zapier chatbot script
    const script = document.createElement("script");
    script.src =
      "https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js";
    script.type = "module";
    script.async = true;
    document.body.appendChild(script);

    // Sukuriame chatbot elementą
    const chatbot = document.createElement("zapier-interfaces-chatbot-embed");
    chatbot.setAttribute("is-popup", "true");
    chatbot.setAttribute("chatbot-id", "cml1ayfe00016rqrr4wnxqzbe");
    document.body.appendChild(chatbot);

    // Išvalome, kai komponentas išmontuojamas
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (chatbot.parentNode) {
        chatbot.parentNode.removeChild(chatbot);
      }
    };
  }, []);

  return null;
}

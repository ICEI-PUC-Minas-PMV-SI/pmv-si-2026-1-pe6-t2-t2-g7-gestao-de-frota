// Arquivo de suporte global do Cypress.

function injectDisableAnimations(doc: Document) {
  if (!doc.head || doc.getElementById("disable-cypress-animations")) return;

  const style = doc.createElement("style");
  style.id = "disable-cypress-animations";
  style.innerHTML = `
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
      caret-color: auto !important;
    }
  `;

  doc.head.appendChild(style);
}

Cypress.on("window:before:load", (win) => {
  const apply = () => injectDisableAnimations(win.document);

  if (win.document.head) {
    apply();
    return;
  }

  win.document.addEventListener("DOMContentLoaded", apply, { once: true });
});

import "cypress-real-events/support";

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

/** Limpa persistência Firebase/Expo entre specs autenticados. */
beforeEach(() => {
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  cy.window().then(async (win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
    if (!win.indexedDB?.databases) return;
    const databases = await win.indexedDB.databases();
    await Promise.all(
      databases.map(
        (db) =>
          new Promise<void>((resolve) => {
            if (!db.name) {
              resolve();
              return;
            }
            const request = win.indexedDB.deleteDatabase(db.name);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          }),
      ),
    );
  });
});

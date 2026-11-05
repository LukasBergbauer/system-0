// Verlauf der Mindmap über den Browser-Verlauf: jeder Schritt (anderer Punkt, Suche, Liste, Verknüpfen)
// ist ein eigener Eintrag. Dadurch gehen Zurück-Wischen (iPhone), Zurück-Taste und „‹ Zurück“
// genau einen Schritt zurück; vor dem ersten Schritt schließt Zurück das Overlay.
// Die Adresse bleibt dabei immer gleich (#/physio), der Router merkt nichts davon.
// Ein Schritt = { ansicht, mitteId }.

const MARKE = 'physio-mindmap';

export function mmVerlauf(onWechsel) {
  const kennung = Date.now(); // dieses Overlay; alte Einträge (z. B. nach Neuladen) zählen nicht
  let stapel = [];
  let i = 0;

  function merke(schritt, neu) {
    stapel = neu ? [schritt] : [...stapel.slice(0, i + 1), schritt];
    i = stapel.length - 1;
    history.pushState({ [MARKE]: kennung, mmSchritt: i }, '');
  }

  const unser = (state) => state?.[MARKE] === kennung;

  return {
    start: (schritt) => merke(schritt, true),
    weiter: (schritt) => merke(schritt, false),
    zurueck: () => history.back(),
    // Nach Zurück/Vor: gehört der Eintrag zu uns, wird dieser Schritt gezeigt (true).
    // Sonst false → das Overlay schließt sich.
    popstate(state) {
      if (!unser(state) || !stapel[state.mmSchritt]) return false;
      i = state.mmSchritt;
      onWechsel(stapel[i]);
      return true;
    },
    // Beim Schließen mit ✕/Esc alle eigenen Einträge auf einmal verlassen.
    verlassen() {
      if (unser(history.state)) history.go(-(i + 1));
    },
    tiefe: () => i,
    vorher: () => stapel[i - 1] ?? null,
  };
}

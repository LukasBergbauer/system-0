// Schweben von Kosmos-Bubbles und Mindmap-Punkten. Eigener, „krummer“ Takt je Bubble: x, y, Drehen und Wabbeln laufen unabhängig (keine sichtbare Wiederholung).
// Die Animationen selbst stehen in physio-kosmos.css (kos-x, kos-y, kos-dreh, kos-wabbeln).
export function schwebeTakt(st, i) {
  const t = (basis, schritt, spanne) => `${(basis + (i * schritt) % spanne).toFixed(2)}s`;
  st.setProperty('--tx', t(6.3, 1.73, 3.1));
  st.setProperty('--ty', t(4.7, 2.31, 2.9));
  st.setProperty('--tr', t(8.9, 1.37, 4.3));
  st.setProperty('--tw', t(3.1, 0.83, 1.9));
  st.setProperty('--verz', `${(-i * 2.17).toFixed(2)}s`);
  st.setProperty('--amp', (0.75 + ((i * 0.37) % 0.5)).toFixed(2));
}

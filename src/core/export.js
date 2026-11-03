// Export: alle lokalen Daten (inkl. weich gelöschter) als eine JSON-Datei.
// Schutz, falls sich Gratis-Tarife ändern: Die Datei enthält alles, um die Daten woanders einzuspielen.
import { dumpAll } from './store.js';

export async function buildExport() {
  const tabellen = await dumpAll();
  const now = new Date();
  const data = {
    app: 'System 0',
    format: 1,
    exportiert_am: now.toISOString(),
    anzahl: Object.fromEntries(Object.entries(tabellen).map(([t, rows]) => [t, rows.length])),
    tabellen,
  };
  const day = now.toLocaleDateString('sv-SE'); // JJJJ-MM-TT
  const name = `system0-export-${day}.json`;
  return new File([JSON.stringify(data, null, 2)], name, { type: 'application/json' });
}

// iPhone: Teilen-Menü („In Dateien sichern“). Mac: normaler Download.
export async function downloadExport() {
  const file = await buildExport();
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // Teilen abgebrochen
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

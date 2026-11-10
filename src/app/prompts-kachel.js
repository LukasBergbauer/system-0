// Einstellungen: große Kachel „Prompts“ – Texte für Claude Code zum Kopieren, bearbeiten, anlegen, löschen.
// Gespeichert als synchronisierte Einstellung „prompts“ (Liste { titel, text }); ohne Eintrag gelten die Vorlagen.
import { el } from '../ui/dom.js';
import { kachel } from '../ui/kachel.js';
import { button } from '../ui/button.js';
import { input } from '../ui/input.js';
import { modal } from '../ui/modal.js';
import { getSetting, setSetting } from '../core/einstellungen.js';
import { PROMPT_VORLAGEN } from './prompt-vorlagen.js';

export function promptsKachel() {
  const liste = el('div', { class: 'prompts' });
  let prompts = [];

  async function speichern() {
    await setSetting('prompts', prompts);
    zeige();
  }

  async function kopieren(p, knopf) {
    try {
      await navigator.clipboard.writeText(p.text);
      knopf.textContent = 'Kopiert ✓';
    } catch {
      knopf.textContent = 'Nicht möglich';
    }
    setTimeout(() => { knopf.textContent = 'Kopieren'; }, 1500);
  }

  function bearbeiten(index) {
    const p = prompts[index] ?? { titel: '', text: '' };
    const titel = input({ label: 'Titel', value: p.titel });
    const text = el('textarea', { class: 'field__input prompts__feld', attrs: { rows: 10, 'aria-label': 'Text' } });
    text.value = p.text;
    const fertig = async (neu) => {
      if (neu) prompts[index ?? prompts.length] = neu;
      else prompts.splice(index, 1);
      m.close();
      await speichern();
    };
    const aktionen = [
      index != null && button({ text: 'Löschen', variant: 'ghost', onClick: () => confirm('Prompt löschen?') && fertig(null) }),
      button({ text: 'Speichern', variant: 'primary', onClick: () => {
        const t = titel.querySelector('input').value.trim();
        if (t) fertig({ titel: t, text: text.value });
      } }),
    ].filter(Boolean);
    const m = modal({ title: index != null ? 'Prompt bearbeiten' : 'Neuer Prompt', content: [titel, text], actions: aktionen });
    m.open();
  }

  // Zu: nur Titel + „Kopieren“. Auf: ganzer Text (bricht um) + „Bearbeiten“.
  function zeile(p, i) {
    const kopie = button({ text: 'Kopieren', variant: 'primary' });
    kopie.addEventListener('click', (e) => { e.preventDefault(); kopieren(p, kopie); }); // nicht auf-/zuklappen
    return el('details', { class: 'prompts__zeile' }, [
      el('summary', { class: 'prompts__kopf' }, [el('span', { class: 'prompts__titel', text: p.titel }), kopie]),
      el('p', { class: 'prompts__voll', text: p.text }),
      button({ text: 'Bearbeiten', onClick: () => bearbeiten(i) }),
    ]);
  }

  function zeige() {
    liste.replaceChildren(...prompts.map(zeile), button({ text: 'Neuer Prompt', onClick: () => bearbeiten() }));
  }

  getSetting('prompts', null).then((wert) => {
    prompts = Array.isArray(wert) ? wert : structuredClone(PROMPT_VORLAGEN);
    // Alte SQL-Fassung von „Lernzettel → Physio“ (v119) durch die aktuelle Vorlage ersetzen.
    const neu = PROMPT_VORLAGEN.find((v) => v.titel === 'Lernzettel → Physio');
    const alt = prompts.find((p) => p.text.includes('supabase/physio-import'));
    if (alt) { alt.titel = neu.titel; alt.text = neu.text; setSetting('prompts', prompts); }
    zeige();
  });

  return kachel({ symbol: 'prompt', titel: 'Prompts', text: 'Antippen zum Aufklappen', gross: true, children: liste });
}

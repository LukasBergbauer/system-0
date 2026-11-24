# Modul: Heute
**Phase 1.** Startseite der App.

## Funktionen
- Termine von heute (eigene + Google-Kalender)
- To-dos von heute und überfällige zuerst, direkt abhakbar
- Später ergänzbar: Routine-Status, Affirmation des Tages, Training des Tages, Quiz des Tages, Streaks

## Hinweise
Liest nur Daten der anderen Module über `core/`, speichert selbst nichts.

## Grundsatz
- Heute ist nie fertig: Lukas kann die Startseite jederzeit umbauen lassen (Karten weg, neu, umsortieren), wie er es möchte.

## Stand (Neugestaltung „Klar“, 24.11.2026)
- Kopf: Gruß + Datum · „N Dinge brauchen dich“; Knöpfe Suche (iPhone), Bearbeiten, Neu. Akzent-Knopf entfernt (steht in Einstellungen).
- Felder (`katalog.js`): todos (Liste fällig/überfällig zuerst, **direkt abhakbar** über `core/store.js`, klein = Zahl fällig),
  kalender, pyramide, routinen, gewohnheiten, affirmation, ziele, training, quiz, absatz (Zitat), insta; Einzel-Felder
  `gewohnheit`/`routine`/`ziel`/`absatz` mit `ref`. Entfernt (doppelt): Woche-Hero, Termine-Kennzahl, Erledigt-Serie, Verlauf, Nach Bereich.
- `STANDARD` (`layout.js`): To-dos 2×2, Kalender 1×2, Pyramide 1×2, dann Routinen/Gewohnheiten, Affirmation/Visionen je 2×1,
  Training, Quiz, Zitat, Insta. Einmalige Umstellung (`heute_layout_klar`): gespeichertes Layout → neuer Standard, eigene Einzel-Felder bleiben.
- Stil: weiße Karten, Label oben (`.feld-modul`), keine Akzent-Flächen, Felder blenden einmal kurz ein. Pyramide: helle Stufen mit dunkler Schrift.

## Bearbeiten-Modus (seit 10.11.2026)
- Raster: Mac 4 Spalten, iPhone 2 (breitere Felder dort 2 breit), `grid-auto-flow: dense` (`heute-raster.css`).
- Layout = Einstellung `heute_layout` (synchronisiert): `[{ typ, ref?, w, h }]`, `layout.js` (prüfen, `STANDARD`).
- `feld.js` wählt je Größe `gross` (Karte ab `ab`) oder `klein` (Zahl/Ring); schmale Felder passen sich per Container-Abfrage an.
- „Bearbeiten“ → Felder wackeln: „−“ entfernt, Griff oben = verschieben, Ecke = Größe (1–4 × 1–3), „+ Feld“ = Auswahl. „Standard“ setzt zurück.
- Frühere Pläne und Zwischenstände: Git-Verlauf bzw. `docs/roadmap-archiv.md`.

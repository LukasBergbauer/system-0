# Modul: Heute
**Phase 1.** Startseite der App.

## Funktionen
- Termine von heute (eigene + Google-Kalender)
- To-dos von heute und überfällige zuerst, direkt abhakbar

## Hinweise
Liest nur Daten der anderen Module über `core/`, speichert selbst nichts.

## Grundsatz
- Heute ist nie fertig: Lukas kann die Startseite jederzeit umbauen lassen (Karten weg, neu, umsortieren), wie er es möchte.

## Stand (Glas + Tagesfeld, 25.11.2026)
- Kopf: Gruß + Datum; Knöpfe Suche (iPhone), Bearbeiten, Neu.
- **Festes Tagesfeld** ganz oben (`tagesfeld.js`, Zahlen `tag-rechnen.js`, Stil `tagesfeld.css`), nicht im Layout, nicht verschiebbar:
  Akzent-Fläche (Variante A) mit KW · Termine, motivierendem Satz je Stand, Ring „geschafft“ (To-dos fällig/überfällig + heute erledigt,
  vorbei-Termine, Routinen, Aufbau-Gewohnheiten, geplantes Training), Tageslinie (Termine mit Uhrzeit, Morgen-/Abendroutine 7/21 Uhr, „jetzt“),
  Kästchen je Bereich (antippen öffnet ihn): To-dos, nächster Termin, Routinen (nächste offene, öffnet sie), Gewohnheiten, Training (öffnet offene Plan-Einheit),
  Quiz des Tages (zählt zum Ring), Serie = längste laufende Serie aus Quiz/Gewohnheiten/Routinen (`serien.js`, ab 2 Tagen). Kein „Willkommen“.
- Felder (`katalog.js`): todos (direkt abhakbar), kalender, pyramide, routinen, gewohnheiten, affirmation, ziele, training, quiz, absatz, insta;
  Einzel-Felder `gewohnheit`/`routine`/`ziel`/`absatz` mit `ref`. `STANDARD` (`layout.js`): To-dos 2×2, Kalender 1×2, Pyramide 1×2, dann der Rest.
- Stil: Glas-Karten mit Unschärfe, heben sich beim Drüberfahren; Symbole, große Zahlen, Ringe in Akzent; gewählter Tag / fertige Routine = Akzent-Fläche.

## Bearbeiten-Modus (seit 10.11.2026)
- Raster: Mac 4 Spalten, iPhone 2 (breitere Felder dort 2 breit), `grid-auto-flow: dense` (`heute-raster.css`).
- Layout = Einstellung `heute_layout` (synchronisiert): `[{ typ, ref?, w, h }]`, `layout.js` (prüfen, `STANDARD`).
- `feld.js` wählt je Größe `gross` (Karte ab `ab`) oder `klein` (Zahl/Ring); schmale Felder passen sich per Container-Abfrage an.
- „Bearbeiten“ → Felder wackeln: „−“ entfernt, Griff oben = verschieben, Ecke = Größe (1–4 × 1–3), „+ Feld“ = Auswahl. „Standard“ setzt zurück.
- Frühere Pläne und Zwischenstände: Git-Verlauf bzw. `docs/roadmap-archiv.md`.

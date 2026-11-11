# Modul: Insta-Organizer
**Phase 4.**

## Funktionen
- Ideen sammeln
- Posts planen im Kalender
- Captions und Hashtag-Sets vorbereiten
- Status pro Post (Idee / in Arbeit / geplant / gepostet)

## Hinweis
Die App selbst hat keine Verbindung zu Instagram (keine Geheimnisse im Code). Automatisches Posten ist gewünscht und
kommt später aus Lukas' **Insta-Agent** (`~/Documents/Insta Agent`, lokal auf dem Mac, Token im Schlüsselbund).

## Verbindung zum Insta-Agent (entschieden 11.11.2026)
System 0 ersetzt die geplante eigene Mac-App des Insta-Agents. Austausch nur per JSON (Format siehe `claude.js`):
- **Skripte rein:** Im Insta-Agent `python3 system0/export.py` → `system0/import.json` → hier „Datei wählen“ → Importieren.
  Schlüssel = Dateiname des Skripts (`01-vorstellung-parkplatz`). Status/Datum werden nicht mitgeschickt (Planung bleibt hier).
- **Auswertung zurück (geplant):** Export hier → `/auswertung` im Insta-Agent → `{"erkenntnisse":[…]}` hier importieren.
- **CTA** = kurzer Folgen-Hinweis, keine Handlungs-Aufforderung (Insta-Agent STRATEGIE.md, Regel 9).
- Nur Texte in Supabase (wenige KB pro Post), Videos bleiben lokal. Grenze: 500 MB (Supabase Free).

## Plan (mit Lukas abgestimmt, 09.11.2026)
Grundsatz: keine Verbindung zu Instagram. Die App ist Lukas' eigene Kopie (offline lesbar). Skripte, Zahlen und Erkenntnisse kommen per Import bzw. Einfügen rein.
- **Datenmodell `016_insta.sql`:** `insta_posts` (schluessel, titel, art, status, datum, hook, skript, cta, caption, hashtags,
  zahlen jsonb, notiz) · `insta_hashtags` (name, tags) · `insta_erkenntnisse` (text, beleg, datum). RLS wie immer.
- **Import (Skripte aus Claude):** Datei (.json) wählen oder Text einfügen. Mehrere Posts je Datei. Gleicher `schluessel` → Post wird
  aktualisiert statt doppelt angelegt. Prompt-Knopf mit dem Format zum Kopieren (wie beim Wissen-Quiz).
- **Kurzfassung in der App:** Hook, Skript (kurz, Markdown), CTA, Caption, Hashtags. `markdown.js` wandert aus Bücher nach `src/ui/`.
- **Postplaner:** Ideen-Feld oben. Umschalter Status · Monat. Post-Vollbild mit Art/Status/Datum-Chips und „Caption + Hashtags kopieren“.
- **Auswertung:** Bei geposteten Posts trägt Lukas die Zahlen ein (Aufrufe, Likes, Kommentare, Gespeichert, Geteilt, Follower +).
  Knopf „Für Claude exportieren“ (JSON aller Posts mit Zahlen) für den eigenen Claude-Code-Agenten. Dessen Antwort
  „Was hat funktioniert, warum“ kommt per Import als Erkenntnisse zurück und wird in einer eigenen Ansicht angezeigt.
- **Außerdem:** Hashtag-Sets, Suche (⌘K), Leiste auf Heute bei einem für heute geplanten Post.

## Stand
- [x] Erste Fassung (09.11.2026). Migration `016_insta.sql`; `sw.js` `v68`. Router-id `insta`, Ordner `src/module/insta/`:
      `data.js` (Laden/Speichern, Listen STATUS/ARTEN/ZAHLEN), `austausch.js` (Import/Export-Logik), `claude.js` (Modal: Format kopieren,
      Datei wählen/einfügen, Export kopieren/als Datei), `hashtags.js` (Sets, Zähler /30, „Übernehmen“ aus dem Post), `post.js` (Vollbild Kurzfassung,
      „Caption + Hashtags kopieren“, Zahlen + Interaktionsrate), `post-form.js`, `monat.js`, `erkenntnisse.js`, `view.js` (Ideen-Feld, Planer · Monat · Erkenntnisse).
      Heute: `heute/insta-leiste.js` (für heute geplant, nicht gepostet). Suche: Gruppe „Insta-Posts“ → `#/insta/<id>`. Stil `insta.css`, Symbol `insta`.
      `markdown.js` liegt jetzt in `src/ui/` (Bücher + Insta).
      Import-Regeln: gleicher `schluessel` (ohne Schlüssel: gleicher Titel) → Update nur der mitgeschickten Felder; Zahlen werden zusammengeführt
      und setzen ohne Status auf „gepostet“; Erkenntnisse mit gleichem Text werden übersprungen. ```json-Zäune werden entfernt.
      Import/Export mit Attrappe getestet. Browser-Test nicht möglich (lokaler Server blockiert). 016 ausgeführt, von Lukas auf Geräten geprüft (09.11.2026).

## Nächster Schritt (Plan)
- Claude-Agent für die Auswertung baut Lukas später separat (nicht Teil der App). Die App ist bereit: Export rein, `{"erkenntnisse":[…]}` zurück.
- Claude-Planung der Skripte ausbauen (Prompt-Vorlagen je Art), geplante Posts im Kalender-Modul anzeigen.

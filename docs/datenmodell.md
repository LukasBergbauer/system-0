# Datenmodell & Synchronisation

## Gemeinsame Spalten (jede Tabelle)
| Spalte | Zweck |
|---|---|
| `id` (uuid) | wird im Gerät erzeugt, damit offline angelegt werden kann |
| `user_id` | für RLS |
| `created_at`, `updated_at` | `updated_at` steuert den Sync |
| `deleted` (bool) | weiches Löschen, damit Löschungen auf alle Geräte kommen |
| `server_at` | setzt nur der Server (Trigger `sync_felder`): wann die Zeile dort ankam; danach wird abgeholt |

## Sync-Regel
- Schreiben: zuerst IndexedDB, dann in eine Warteschlange, die hochgeladen wird, sobald Netz da ist.
- Lesen: beim Start, bei Netz-Rückkehr, beim Öffnen der App und jede Minute alles mit
  `server_at` > letzter Abgleich holen (Server-Uhr, 1 Minute Überlappung). So kommen auch Änderungen an,
  die ein Gerät erst nach einer Offline-Phase hochlädt (deren `updated_at` liegt ja in der Vergangenheit).
- Konflikte: neuester `updated_at` gewinnt (nur ein Nutzer, das reicht). Auf dem Server sorgt der
  Trigger `sync_felder` dafür, lokal `sync-local.js`.
- Reihenfolge eines Abgleichs: erst holen, dann hochladen.

## Neue Tabelle anlegen (Muster)
1. Migration `supabase/migrations/00X_<name>.sql` mit den gemeinsamen Spalten (siehe `001_basis.sql`):
   `id uuid primary key`, `user_id … default auth.uid()`, `created_at`, `updated_at`, `deleted`, `server_at`,
   Index auf `(user_id, server_at)`, Trigger `before insert or update … execute function public.sync_felder()`,
   RLS mit Policy `user_id = (select auth.uid())`, `grant select, insert, update … to authenticated`.
2. Lukas führt die Migration im Supabase-SQL-Editor aus.
3. Tabellennamen in `src/core/tabellen.js` eintragen. Erst dann wird sie hochgeladen und abgeholt.

## Lokale Datenbank (IndexedDB `system0`)
| Speicher | Inhalt |
|---|---|
| `daten` | alle Zeilen aller Tabellen als `{ table, id, row }`, Index `table` |
| `warteschlange` | `{ table, id }` je Zeile, die noch hochgeladen werden muss |
| `meta` | z. B. `abgleich:<tabelle>` = letzter `server_at` |
| `dateien` | Dateien (Bilder) als Blob: `{ pfad, blob }` – seit Version 2, über `src/core/dateien.js` |
| `datei_warteschlange` | Dateien, die hoch- oder weggeräumt werden müssen: `{ pfad, aktion }` |

Module benutzen nur `src/core/store.js`: `getAll(table)`, `get(table, id)`, `save(table, data)`, `remove(table, id)`.
Nach jeder Änderung kommt das Ereignis `daten` mit `{ table }` (`src/core/events.js`).
- Export: Knopf in den Einstellungen, der alle Daten als JSON herunterlädt (Schutz gegen geänderte Gratis-Tarife).

## Tabellen (Entwurf, wird pro Modul verfeinert)
| Bereich | Tabellen |
|---|---|
| Basis | `einstellungen` (schluessel, wert als JSON) – angelegt in `001_basis.sql` |
| To-dos | `todo_bereiche` (name, reihenfolge), `todos` (titel, notiz, prio 1–3, faellig_am, bereich_id, erledigt_am) – angelegt in `002_todos.sql` |
| Routinen | `routinen` (name, art morgen/abend/frei, sperre), `routine_schritte`, `routine_logs` |
| Kalender | `termine` (titel, start, ende, ort, notiz); Google-Termine werden nur angezeigt, nicht gespeichert |
| PhysioZentrum | `physio_eintraege` (art, titel, kurz, text, felder als JSON, video), `physio_links` (a_id, b_id, in beide Richtungen) – in `003_physio.sql`; `physio_bilder` (eintrag_id, reihenfolge, breite, hoehe) + Storage-Bucket `physio-bilder` – in `004_physio_bilder.sql` |
| Training | `trainingsplaene`, `plan_einheiten`, `einheiten` (datum, art, gefuehl, belastung), `einheit_uebungen` (verweist auf `uebungen`), `saetze` (wdh, gewicht, zeit, distanz) |
| Gewohnheiten | `gewohnheiten` (art aufbau/abbau, messart haken/anzahl/zeit, ziel), `gewohnheit_logs`, `ausloeser` |
| Ziele | `lebensziele`, `visionen` |
| Affirmationen | `affirmationen` (text, lebensziel_id) |
| Wissen | `quiz_fragen`, `quiz_ergebnisse` |
| Bücher | `buecher` (titel, autor, status, cover, zusammenfassung als Markdown) |
| Insta | `insta_ideen`, `insta_posts` (datum, caption, hashtags, status) |

## Speicher
Supabase Free hat begrenzten Datei-Speicher. Bilder werden vor dem Upload verkleinert.
Videos möglichst als Link (z. B. nicht gelistetes YouTube-Video) statt als Datei.

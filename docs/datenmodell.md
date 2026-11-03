# Datenmodell & Synchronisation

## Gemeinsame Spalten (jede Tabelle)
| Spalte | Zweck |
|---|---|
| `id` (uuid) | wird im Gerät erzeugt, damit offline angelegt werden kann |
| `user_id` | für RLS |
| `created_at`, `updated_at` | `updated_at` steuert den Sync |
| `deleted` (bool) | weiches Löschen, damit Löschungen auf alle Geräte kommen |

## Sync-Regel
- Schreiben: zuerst IndexedDB, dann in eine Warteschlange, die hochgeladen wird, sobald Netz da ist.
- Lesen: beim Start und regelmäßig alles mit `updated_at` > letzter Abgleich holen.
- Konflikte: neuester `updated_at` gewinnt (nur ein Nutzer, das reicht).
- Export: Knopf in den Einstellungen, der alle Daten als JSON herunterlädt (Schutz gegen geänderte Gratis-Tarife).

## Tabellen (Entwurf, wird pro Modul verfeinert)
| Bereich | Tabellen |
|---|---|
| To-dos | `bereiche`, `todos` (titel, notiz, prio 1–3, faellig_am, bereich_id, erledigt_am) |
| Routinen | `routinen` (name, art morgen/abend/frei, sperre), `routine_schritte`, `routine_logs` |
| Kalender | `termine` (titel, start, ende, ort, notiz); Google-Termine werden nur angezeigt, nicht gespeichert |
| PhysioZentrum | `regionen`, `muskeln`, `krankheitsbilder`, `techniken`, `uebungen`, `medien`, `verknuepfungen` (beliebige Einträge miteinander verbinden) |
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

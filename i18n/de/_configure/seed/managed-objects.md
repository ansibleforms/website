---
layout: default
title: Verwaltete Objekte
parent: Config-Seed
nav_order: 2
translated_from: b007fcc08a96c4035422a238ae335bf4eedd48c5
---

# Verwaltete Objekte
{: .no_toc }

Wie der Seed die aufgeführten Objekte verwaltet und wie er Geheimnisse heraushält
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Einzeilige Abschnitte gelten ganz oder gar nicht

`ldap`, `settings` und `chat_assistant` (`chat` vor 7.8.0) sind jeweils eine **einzelne Zeile**, daher muss der Seed alle ihre Felder deklarieren.

Ein Seed, der ein Feld auslässt, verweigert den Start und nennt es:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Deklarieren Sie einen leeren Wert ausdrücklich mit `""` oder `false`. Einige Felder sind optional, und ein ausgelassenes bleibt unverändert:

| Abschnitt | Optionale Felder |
|---|---|
| `ldap` | `description`, `credential` (Anmeldedaten zum Binden) und `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, und `credential` seit 7.8.0 |
| `settings` | Die `mail_*`-Schlüssel, seit 7.6.0 veraltet (siehe [Beispiel](example.html)) |

`settings` deckt nur die URL und die veralteten Mail-Schlüssel ab; alle übrigen Einstellungen bleiben bearbeitbar.

---

## Die Datei enthält keine Geheimnisse

Jedes `${VARIABLE}` wird durch diese Umgebungsvariable ersetzt (auf Kubernetes aus einem `Secret`), sodass die Datei in Git liegen kann.

Eine nicht gesetzte Variable ist ein **fataler Fehler**, sodass nie ein Platzhalter als Passwort gespeichert werden kann.

Anmeldedaten können auch einen [Secret Store](../secret-stores) verwenden (`secret_store`, `secret_ref`); `vault_path` entfällt in 8.

---

## Verwaltete Objekte

Ein Objekt der Listenabschnitte (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` und `labels`) oder eines einzeiligen Abschnitts, das aus dem Seed stammt, wird als **verwaltet** markiert:

- Es wird bei **jedem** Start durchgesetzt, sodass die Datei maßgeblich bleibt.
- Es ist schreibgeschützt: Die API antwortet mit **403**, die Oberfläche deaktiviert Bearbeiten und Löschen, und seine eigene Seite sagt, dass es aus der
  Config-Seed-Datei stammt und schreibgeschützt ist.
- Nur der Seed kann die Markierung setzen oder entfernen.

Von Hand angelegte Objekte werden **nie angefasst**, es sei denn, der Seed deklariert denselben Namen. Dieser Datensatz wird dann **übernommen**:
Die deklarierten Felder werden durchgesetzt, und er wird schreibgeschützt. Die Übernahme wird als Warnung und im Audit-Verlauf protokolliert.

Das Anwenden des Seeds ist idempotent: Datensätze, die bereits passen, bleiben unberührt, daher meldet ein Neustart normalerweise `0 updated`.

Ein deklariertes Repository, dessen Arbeitsverzeichnis fehlt, wird bei jedem Start **erneut geklont**, sodass ein fehlgeschlagener erster Klon
wiederholt wird. Die Zeile *Repositories* der Seite Status zeigt jedes Repository ohne Arbeitsverzeichnis.

Seit 7.8.0 kann ein [Git-Repository](../repositories/) dieselben Arten von Objekten enthalten. Ein Objekt, das ein Repository enthält, bleibt
das des Repositorys: Das Element des Seeds dafür wird nicht angewendet, und das Serverprotokoll sagt es. Ein Repository, das der Seed deklariert, bleibt das des Seeds.

### Ein Objekt entfernen

Ein Objekt aus der Datei zu entfernen, **gibt es frei**: Der Datensatz bleibt und wird wieder bearbeitbar. Einen ganzen Abschnitt zu löschen,
bewirkt dasselbe.

Fügen Sie einem Listenabschnitt `prune: true` hinzu, um die verwalteten Datensätze zu **löschen**, die die Datei nicht mehr deklariert:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` löscht nie einen von Hand angelegten Datensatz.

### Den Seed abschalten

Das Entfernen von `CONFIG_SEED_PATH` schaltet den Seed ab: Der nächste Start gibt jeden Datensatz und jedes Feld frei, das der Seed verwaltet
hat, wie es ein angewendeter leerer Seed täte. Die Datensätze behalten ihre Werte und werden wieder bearbeitbar, und das Serverprotokoll und das Audit-Protokoll sagen, was freigegeben wurde.

Ein `CONFIG_SEED_PATH`, dessen Datei fehlt, gibt nichts frei: Der Server verweigert stattdessen den Start, weil eine eingehängte Datei
vielleicht nur verspätet ist.

---

## Einstellungen, die der Seed deklariert

Die in 7.8.0 hinzugekommenen Abschnitte gehören dem Seed weniger streng als die verwalteten Objekte, auf zwei Arten.

| Abschnitte | Wie der Seed sie besitzt |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Feld für Feld: Jedes deklarierte Feld ist auf seiner Seite schreibgeschützt, mit einem Hinweis, und die API weist seine Änderung ab (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Bei jeder Anwendung angelegt oder geändert, nie gesperrt oder gelöscht |

Ein Feld von `defaults`, `logo`, `icon`, `name`, `links` oder `mcp`, das der Seed nicht mehr deklariert, wird freigegeben, und alle werden es,
wenn der Seed abgeschaltet wird. Ein Logo oder Symbol aus dem Seed kann in der App weder hochgeladen noch entfernt werden. Wenn ein Repository
dieselbe Seite enthält, behält der Seed die Felder, die er deklariert, und das Repository enthält die anderen.

Ein Benutzer, eine Gruppe, eine Ankündigung, eine Version des Haftungsausschlusses oder der SSH-Schlüssel und die bekannten Hosts aus dem Seed
bleiben in der App bearbeitbar, und die nächste Anwendung schreibt die Werte des Seeds wieder, wo sie abweichen. Ein Element aus der Datei zu
entfernen, lässt es in der App, und `prune` löscht keines davon.

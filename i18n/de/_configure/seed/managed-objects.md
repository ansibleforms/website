---
layout: default
title: Verwaltete Objekte
parent: Config-Seed
nav_order: 2
translated_from: dd0ea4d46391bf9b2e5928063cd30e33ac1285f9
---

# Verwaltete Objekte
{: .no_toc }

Wie der Seed die aufgeführten Objekte verwaltet und wie er Geheimnisse heraushält
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Einzeilige Abschnitte gelten ganz oder gar nicht

`ldap`, `settings` und `chat` sind jeweils eine **einzelne Zeile**, daher muss der Seed alle ihre Felder deklarieren; die anderen Abschnitte sind Listen.

Ein Seed, der ein Feld auslässt, verweigert den Start und nennt es:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'mail_server'
```

Deklarieren Sie einen leeren Wert ausdrücklich mit `""` oder `false`. Einige Felder sind optional, und ein ausgelassenes bleibt unverändert:

| Abschnitt | Optionale Felder |
|---|---|
| `ldap` | `description`, `credential` (Anmeldedaten zum Binden) und `groupfilter` |
| `chat` | `auth_type`, `api_version`, `request_user`, `ignore_certs` und `extra_headers` |
| `settings` | Keine |

`settings` deckt nur die Mail-Felder und die URL ab; alle übrigen Einstellungen bleiben bearbeitbar.

---

## Die Datei enthält keine Geheimnisse

Jedes `${VARIABLE}` wird durch diese Umgebungsvariable ersetzt (auf Kubernetes aus einem `Secret`), sodass die Datei in Git liegen kann.

Eine nicht gesetzte Variable ist ein **fataler Fehler**, sodass nie ein Platzhalter als Passwort gespeichert werden kann.

Anmeldedaten können auch einen [Secret Store](../secret-stores) verwenden (`secret_store`, `secret_ref`); `vault_path` entfällt in 8.

---

## Verwaltete Objekte

Ein Objekt, das aus dem Seed stammt, wird als **verwaltet** markiert:

- Es wird bei **jedem** Start durchgesetzt, sodass die Datei maßgeblich bleibt.
- Es ist schreibgeschützt: Die API antwortet mit **403**, die Oberfläche deaktiviert Bearbeiten und Löschen, und seine eigene Seite sagt, dass es aus der
  Config-Seed-Datei stammt und schreibgeschützt ist.
- Nur der Seed kann die Markierung setzen oder entfernen.

Von Hand angelegte Objekte werden **nie angefasst**, es sei denn, der Seed deklariert denselben Namen. Dieser Datensatz wird dann **übernommen**:
Die deklarierten Felder werden durchgesetzt, und er wird schreibgeschützt. Die Übernahme wird als Warnung und im Audit-Verlauf protokolliert.

Das Anwenden des Seeds ist idempotent: Datensätze, die bereits passen, bleiben unberührt, daher meldet ein Neustart normalerweise `0 updated`.

Ein deklariertes Repository, dessen Arbeitsverzeichnis fehlt, wird bei jedem Start **erneut geklont**, sodass ein fehlgeschlagener erster Klon
wiederholt wird. Die Zeile *Repositories* der Seite Status zeigt jedes Repository ohne Arbeitsverzeichnis.

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

Das Entfernen von `CONFIG_SEED_PATH` gibt **nichts** frei: Der Seed wird nicht mehr angewendet, und die von ihm verwalteten Datensätze bleiben verwaltet
und schreibgeschützt. Um sie wieder zu bearbeiten, geben Sie sie zuerst frei: Richten Sie `CONFIG_SEED_PATH` auf eine Datei ohne sie (eine leere Datei deklariert
nichts und gibt jeden Datensatz frei), lassen Sie sie bei einem Start oder Neuladen anwenden und entfernen Sie dann die Variable. Die freigegebenen Datensätze bleiben, wie
sie sind, und werden bearbeitbar.

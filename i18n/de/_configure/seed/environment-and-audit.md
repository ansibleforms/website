---
layout: default
title: Bearbeitung und Audit
parent: Config-Seed
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Bearbeitung und Audit
{: .no_toc }

Die Einstellungsseiten sperren, und was das Audit-Protokoll festhält
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Bearbeitung der Umgebung abschalten

`ALLOW_ENV_EDIT=0` macht die Einstellungsseiten schreibgeschützt. Jede Variable wird weiterhin mit
dem geltenden Wert und dem Grund angezeigt, warum sie nicht geändert werden kann, und der Speicher-Endpunkt antwortet mit
403.

Verwenden Sie es immer, wenn die Umgebung anderswo deklariert ist. Sonst schreibt die Einstellungsseite
`persistent/.env`, die auf einem flüchtigen Volume beim nächsten Neustart stillschweigend verloren geht und auf
einem dauerhaften vom Manifest abweicht, das maßgeblich sein soll.

{: .note }
> Backups enthalten `persistent/.env` als `managed.env`, sodass ein Neuaufbau die Datenbank- und
> Pfadeinstellungen zurückerhält. **`ENCRYPTION_SECRET` und `ACCESS_TOKEN_SECRET` werden entfernt**:
> Der Dump daneben enthält alle gespeicherten Anmeldedaten als AES-Chiffretext, und den Schlüssel, der
> ihn entschlüsselt, in denselben Ordner zu schreiben, würde eine kopierte Sicherung genügen lassen, um sie alle zu lesen. Setzen Sie
> diese beiden stattdessen auf dem Zielhost; ein Kommentar in der Datei sagt das.
>
> Was übrig bleibt, kann noch Anmeldedaten enthalten (`DB_PASSWORD`, `METRICS_TOKEN`, ein altes `VAULT_TOKEN`), daher wird die Datei
> mit `0600` geschrieben. Ihre Wiederherstellung ist ein eigener, ausdrücklich zu wählender Schritt statt Teil einer normalen Wiederherstellung,
> da Datenbank-Host und Pfade darin die Maschine beschreiben, von der das Backup stammt. Der
> Wiederherstellungsdialog listet die Datei auf und bietet eine eigene Schaltfläche *Umgebung wiederherstellen*
> (`POST /api/v2/backup/:folder/restore-env`), die die vorherige Datei als `.env.bak` behält.

---

## Was festgehalten wird

Jede Anwendung, die etwas ändert, schreibt einen Eintrag `seed.apply` ins Audit-Protokoll, der
die angelegten, aktualisierten, freigegebenen und bereinigten Objekte nennt. Werte werden nie festgehalten, da die meisten
davon Geheimnisse sind. Eine Anwendung ohne Änderung schreibt nichts, was den Verlauf aussagekräftig hält. Eine
Abfrage, die die Datei unverändert vorfindet, ist eine Anwendung ohne Änderung, daher erhält der Verlauf nicht jede Minute eine Zeile.

Eine über den Endpunkt angeforderte Anwendung wird absichtlich zweimal festgehalten, und die beiden Zeilen
halten Verschiedenes fest: `config-seed.apply.create` ist, **wer** sie angefordert hat, `seed.apply`, **was**
sie geändert hat.

Die Seite Status meldet den Seed zweimal: eine **Prüfung**, ob die Datei noch lesbar ist und sich parsen lässt
und ob das letzte Neuladen gelungen ist, und eine Zeile unter **Informationen**, die sagt, wie viele Datensätze er
derzeit verwaltet. Die Prüfung ist die einzige Stelle, die meldet, wenn die Datei auf der Festplatte und die geltende
Konfiguration auseinandergelaufen sind, denn ein fehlgeschlagenes Neuladen lässt die Instanz weiterlaufen.

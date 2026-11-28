---
layout: default
title: Runner-Typen
parent: Runner
nav_order: 2
translated_from: 9625a6d6250be6754dfa05650b11fde2508bc521
---

# Runner-Typen
{: .no_toc }

Die Produkte, die ein Runner sein kann, ihre Adresse und Anmeldung
{: .fs-6 .fw-300 }

Der Schritt **Typ** bietet eine Auswahl pro Produkt, jede mit einem Hinweis; der der RTE schreibt ihren Namen aus, *Laufzeitumgebung*. AAP und
Ascender werden als Runner vom Typ `awx` mit einer Variante (`aap` oder `ascender`) gespeichert, was auch der Config-Seed verwendet:

| Typ | Beispiel für die URI | Projekt | Authentifizierung |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | Das `RTE_TOKEN` der RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Ein API-Token oder ein Benutzer und ein Passwort |
| Ascender | `https://ascender.example.com/api/v2` | | Ein API-Token oder ein Benutzer und ein Passwort |
| AWX | `https://awx.example.com/api/v2` | | Ein API-Token oder ein Benutzer und ein Passwort |
| Jenkins | `https://jenkins.example.com` | Der Ordner, in dem die Jobs liegen (optional) | Ein Benutzer und das API-Token dieses Benutzers |
| Rundeck | `https://rundeck.example.com` | Der Projektname | Das API-Token eines Benutzers |
| Semaphore | `https://semaphore.example.com` | Die Projekt-ID, die Zahl in `/project/<id>` | Das API-Token eines Benutzers |

Eine Adresse von AWX, AAP oder Ascender trägt ihren API-Pfad: `/api/v2` oder `/api/controller/v2` für AAP 2.5 und neuer.
Eine RTE ist das AnsibleForms-Image, gestartet mit `AF_ROLE=rte`; wie man eine betreibt, ist unter
[Laufzeitumgebungen](../rte/) beschrieben.

Der [RTE Runner](../rte/runner/), in Go geschrieben, ist ebenfalls eine RTE: Er führt jeden Job in einem eigenen Container aus.

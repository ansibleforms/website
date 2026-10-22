---
layout: default
title: HashiCorp Vault
parent: Secret Stores
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Anmeldedaten aus HashiCorp Vault lesen, aus KV v1 oder v2 oder einer Engine für dynamische Secrets
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Felder des Stores

Zusätzlich zu den [Feldern, die jeder Store hat](./#adding-a-store), hat ein HashiCorp Vault-Store diese Felder:

| Feld | Bedeutung |
|---|---|
| Anmeldeinformation | **HashiCorp Vault**-Anmeldedaten aus [Verbindungen > Anmeldedaten](../credentials.html): die Adresse des Vault, seine TLS-Einstellungen und das Token als Passwort, mit Lesezugriff auf die Pfade, die Ihre Anmeldedaten verwenden. **Anmeldedaten hinzufügen** legt welche dieses Typs an. AnsibleForms erneuert das Token nicht. |
| Namespace | Der Namespace von Vault Enterprise, gesendet als `X-Vault-Namespace`. Wird angezeigt, sobald im Schritt **Typ** **Vault Enterprise** eingeschaltet ist. |
| KV-Version | `2` (Standard) oder `1`. |
| Standard-Mount | Wird für eine Referenz ohne Schrägstrich verwendet, z. B. wird `myapp` zu `secret/data/myapp`. |

Die Secret-Referenz ist der Pfad, z. B. `secret/myapp/prod`. Bei KV v2 wird das Segment `/data/`
eingefügt, wenn Sie es weglassen.

---

## Dynamische Datenbank-Anmeldedaten

Eine Referenz der Form `<mount>/creds/<role>`, z. B. `database/creds/readonly`, liest aus einer
Engine für dynamische Secrets wie der Datenbank-Engine von Vault. Vault erstellt dann bei jedem Lesen ein neues
Datenbankkonto, gültig für die Dauer des Leases.

- Ein Konto wird für 80 % seines Leases wiederverwendet, nicht für die Cache-Zeit; mit Cache `0` liest jede Abfrage ein neues.
- Vault gibt nur Benutzer und Passwort zurück: Tragen Sie den Rest der Verbindung in die Anmeldedaten-Zeile ein.
- Das Lease wird nie vorzeitig widerrufen; das Konto läuft ab, wenn Vault das Lease beendet.

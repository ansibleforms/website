---
layout: default
title: HashiCorp Vault
parent: Secret Stores
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Anmeldedaten in HashiCorp Vault KV lesen und schreiben, dynamische Secrets lesen
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

## Anmeldedaten schreiben

Ab 7.6.0 können Benutzer und Passwort von Anmeldedaten beim **Speichern** in den Vault geschrieben werden (siehe [Anmeldedaten schreiben](./#writing-credentials)).

Schalten Sie **Schreiben erlauben** in den **Optionen** des Stores ein, und legen Sie fest, wohin er schreiben darf:

| Feld | Bedeutung |
|---|---|
| Schreiben erlauben | Erlaubt Anmeldedaten, beim **Speichern** Benutzer und Passwort in diesen Store zu schreiben. Standardmäßig aus. |
| Schreibpräfix | Der Pfad, an oder unter dem Anmeldedaten geschrieben werden, z. B. `secret/ansibleforms`. Ein Mount allein, z. B. `secret`, erlaubt den ganzen Mount. Bei eingeschaltetem Schreiben erforderlich. |

Das Secret wird als `username` und `password` geschrieben, in KV v2 oder v1, wie die **KV-Version** des Stores es angibt. Das Token braucht die
Fähigkeiten read, create und update unterhalb des Präfixes; read prüft, ob dort schon ein Secret liegt. Für KV v2 und das Präfix `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

Der Pfad einer Engine für dynamische Secrets, z. B. `database/creds/readonly`, wird nie beschrieben: Vault erzeugt diese Anmeldedaten selbst.

---

## Dynamische Datenbank-Anmeldedaten

Eine Referenz der Form `<mount>/creds/<role>`, z. B. `database/creds/readonly`, liest aus einer
Engine für dynamische Secrets wie der Datenbank-Engine von Vault. Vault erstellt dann bei jedem Lesen ein neues
Datenbankkonto, gültig für die Dauer des Leases.

- Ein Konto wird für 80 % seines Leases wiederverwendet, nicht für die Cache-Zeit; mit Cache `0` liest jede Abfrage ein neues.
- Vault gibt nur Benutzer und Passwort zurück: Tragen Sie den Rest der Verbindung in die Anmeldedaten-Zeile ein.
- Das Lease wird nie vorzeitig widerrufen; das Konto läuft ab, wenn Vault das Lease beendet.

---
layout: default
title: CyberArk
parent: Secret Stores
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Anmeldedaten aus dem CyberArk Central Credential Provider (CCP) lesen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Experimentell.** Noch nicht gegen eine echte CyberArk-Installation getestet; bitte melden Sie Ihre Erfahrungen.

Der CCP ist die REST-Schnittstelle des Application Access Manager von CyberArk.

---

## Felder des Stores

Zusätzlich zu den [Feldern, die jeder Store hat](./#adding-a-store), hat ein CyberArk-Store diese Felder:

| Feld | Bedeutung |
|---|---|
| Anmeldeinformation | **CyberArk**-Anmeldedaten aus [Verbindungen > Anmeldedaten](../credentials.html): die Basis-URL des CCP, z. B. `https://ccp.example.com` (`/AIMWebService/api/Accounts` wird angehängt), seine TLS-Einstellungen, seine AppID (die in CyberArk für AnsibleForms definierte Anwendung) sowie ein Client-Zertifikat und ein Schlüssel in PEM, nur wenn die AppID eines verlangt. |

---

## Secret-Referenz

Die Secret-Referenz bezeichnet das Konto als durch `;` getrennte Schlüssel-Wert-Paare:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Erlaubte Schlüssel: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` übergibt den Rest der Referenz als native CCP-Abfrage, mit `QueryFormat=Exact`,
  sofern Sie nichts anderes setzen.
- Eine `AppID` in der Referenz wird ignoriert: Es wird immer die AppID des Stores verwendet.
- Das Passwort des Kontos (`Content`) wird zum Passwort; `UserName`, `Address`, `Port` und
  `Database` füllen Benutzer, Host, Port und Datenbankname.

---

## Zusätzliche Optionen

Die zusätzlichen Optionen des Stores werden als JSON-Objekt gesetzt:

| Schlüssel | Bedeutung |
|---|---|
| `reason` | Wird als `Reason` gesendet, wenn die Referenz keinen hat, für das Audit von CyberArk. |
| `check_ref` | Eine Referenz, die **Verbindung testen** tatsächlich liest. Ohne sie prüft der Test nur, dass der CCP antwortet und die AppID akzeptiert. |
| `timeout_ms` | Zeitlimit der Anfrage, Standard 10000. |

Zum Beispiel, um einen Grund zu senden und **Verbindung testen** ein Prüfkonto lesen zu lassen:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```

---
layout: default
title: CyberArk
parent: Secret Stores
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Anmeldedaten über das CyberArk CCP lesen, über sein PVWA schreiben
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

## Anmeldedaten schreiben

Ab 7.6.0 können Benutzer und Passwort von Anmeldedaten beim **Speichern** in CyberArk geschrieben werden (siehe [Anmeldedaten schreiben](./#writing-credentials)).
Das CCP liest nur, daher schreibt AnsibleForms über die PVWA-REST-API, angemeldet mit eigenen Anmeldedaten.

Schalten Sie **Schreiben erlauben** in den **Optionen** des Stores ein, und füllen Sie dann aus:

| Feld | Bedeutung |
|---|---|
| Schreiben erlauben | Erlaubt Anmeldedaten, beim **Speichern** Benutzer und Passwort in diesen Store zu schreiben. Standardmäßig aus. |
| Safes zum Schreiben | Die Safes, in die Anmeldedaten geschrieben werden dürfen, durch Kommas getrennt, z. B. `Linux, DB`. Bei eingeschaltetem Schreiben erforderlich. |
| PVWA-Adresse | Die Basis-URL des PVWA, z. B. `https://pvwa.example.com`. Erforderlich. |
| PVWA-Anmeldeinformation | Eigene Anmeldedaten vom Typ **Benutzer und Passwort** oder **API**, nie aus einem Secret Store gelesen, die in diesen Safes Konten anlegen und deren Passwörter ändern dürfen. Erforderlich. |
| Anmeldemethode | Wie sich die PVWA-Anmeldeinformation anmeldet: CyberArk (Standard), LDAP, RADIUS oder Windows. |
| Plattform-ID | Die Plattform der angelegten Konten, z. B. `UnixSSH`. Zum Anlegen eines neuen Kontos nötig. |

Die Referenz nennt das Konto wie beim Lesen, `Safe=Linux;Object=srv01-root`, mit `Address=srv01.example.com`, wenn seine Plattform eine braucht.

- Ein neues Konto wird mit Plattform, Benutzername und Passwort im Safe angelegt.
- Ein vorhandenes Konto wird nur geändert, wenn **Ein vorhandenes Geheimnis überschreiben** angehakt ist: erst der Benutzername, dann das Passwort.
- Die PVWA-Sitzung wird nach jedem Schreiben abgemeldet. Die OAuth-Anmeldung von Privilege Cloud wird nicht unterstützt.

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

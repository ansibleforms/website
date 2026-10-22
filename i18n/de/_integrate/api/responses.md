---
layout: default
title: Antworten und Fehler
parent: REST-API
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Antworten und Fehler
{: .no_toc }

Der Aufbau einer Antwort und die Statuscodes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Antworten sind einfaches JSON, und der HTTP-Statuscode sagt, ob ein Aufruf erfolgreich war.

---

## Antworten

Ein erfolgreicher Aufruf gibt das Objekt selbst zurück oder eine Liste mit ihrer Größe:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Ein Fehler gibt eine Meldung zurück, und Details, wenn es welche gibt:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Statuscodes

Der Statuscode sagt, was schiefgelaufen ist:

| Code | Bedeutung |
|---|---|
| `200` | Der Aufruf war erfolgreich |
| `400` | Die Anfrage ist fehlerhaft, zum Beispiel eine Token-Erneuerung ohne Refresh Token oder ein Upload ohne Datei |
| `401` | Das Token fehlt, ist falsch oder abgelaufen: melden Sie sich an oder erneuern Sie es |
| `403` | Die Rollen des Benutzers erlauben den Aufruf nicht (einschließlich des Genehmigens des eigenen Jobs, sofern seine Genehmigung nicht `allowSelf: true` setzt oder Sie Admin sind), oder das Konto muss zuerst etwas tun (siehe unten) |
| `404` | Das Objekt existiert nicht |
| `409` | Die Anfrage ist unvollständig (ein Start ohne Daten), oder das Objekt ist nicht in einem Zustand, der die Aktion erlaubt |
| `422` | Die [Startvalidierung](../launch-validation/) hat die Werte des Formulars abgelehnt; `details` listet die Gründe auf |
| `429` | Zu viele Anfragen an die Endpunkte für Anmeldung und Tokens oder zu viele fehlgeschlagene Anmeldungen (siehe [Authentifizierung](authentication.html)) |
| `500` | Der Server ist gescheitert; das Serverprotokoll enthält den Grund |

Bei einem Job bedeutet `409`, dass er im falschen Zustand für die Aktion ist: einen Job abbrechen, der nicht läuft (oder dessen Abbruch bereits angefordert wurde),
einen Job erneut starten, der noch läuft, oder einen Job genehmigen oder ablehnen, der nicht mehr auf eine Genehmigung wartet.

---

## Eine 403 mit Code

Einige `403`-Antworten tragen einen `code`, für etwas, das der Benutzer im Browser tun muss, bevor irgendein anderer Aufruf funktioniert:

```json
{ "error": "...", "code": "password_change_required" }
```

| Code | Was zu tun ist |
|---|---|
| `password_change_required` | Der Benutzer hat sich mit dem öffentlichen Standardpasswort angemeldet: ändern Sie es zuerst im Profil |
| `disclaimer_required` | Der Haftungsausschluss ist eingeschaltet, und der Benutzer hat seine aktuelle Version noch nicht akzeptiert: akzeptieren Sie ihn im Browser |

Ein langlebiges API-Token (siehe [Authentifizierung](authentication.html#long-lived-tokens)) wird vom Haftungsausschluss nie aufgehalten.

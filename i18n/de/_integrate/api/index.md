---
layout: default
title: REST-API
nav_order: 3
has_children: true
has_toc: false
permalink: /api/
translated_from: e14092fbd301073c7ed9be6839530efae43d4c6b
---

# REST-API
{: .no_toc }

Formulare starten und AnsibleForms aus Skripten verwalten
{: .fs-6 .fw-300 }

---

Für Entwickler und Automatisierungsingenieure: Formulare starten und AnsibleForms aus Skripten verwalten.

Alles, was die Weboberfläche tut, läuft über die REST-API, daher können Skripte und andere Werkzeuge dasselbe tun.

---

## Überblick

Die API wird auf dem AnsibleForms-Server unter `/api/v2` bereitgestellt:

* **Vollständige Referenz** : diese Seiten behandeln, was Skripte am häufigsten verwenden. Jeder Endpunkt ist auf der
  eingebauten Swagger-Seite des Servers beschrieben und lässt sich dort ausprobieren, `https://<your server>/api/v2/docs`.
* **Berechtigungen** : ein Aufruf läuft als der Benutzer, dessen Token er trägt, mit den Rollen dieses Benutzers, wie im Browser.
* **Startvalidierung** : über die API gestartete Jobs können wie Starts aus dem Browser geprüft werden
  (siehe [Startvalidierung](../launch-validation/)).
* **Ratenbegrenzungen** : begrenzt sind nur die Endpunkte für Anmeldung, Abmeldung, Token-Erneuerung und Single Sign-On, die Passwortänderung
  (`PUT /api/v2/profile`) und die Endpunkte für API-Tokens (`POST` und `DELETE /api/v2/profile/tokens`) (siehe
  [Authentifizierung](authentication.html)). Andere Aufrufe haben keine Ratenbegrenzung (der [Chat-Assistent](../chat/) hat eigene
  Grenzen), daher sollte ein Skript sein Tempo selbst drosseln, zum Beispiel wenn es einen Job verfolgt.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Was sie behandelt |
|---|---|
| [Authentifizierung](authentication.html) | Anmelden, das Token erneuern oder ein langlebiges Token verwenden |
| [Jobs](jobs.html) | Ein Formular starten, den Job verfolgen, abbrechen, erneut starten oder genehmigen |
| [Antworten und Fehler](responses.html) | Der Aufbau einer Antwort und die Statuscodes |
| [Live-Ereignisse](events.html) | Erfahren, wann sich Jobs und Einstellungen ändern, statt abzufragen |

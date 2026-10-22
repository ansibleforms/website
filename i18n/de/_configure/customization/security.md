---
layout: default
title: Sicherheitsvariablen
parent: Umgebungsvariablen
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Sicherheitsvariablen
{: .no_toc }

Token, Verschlüsselung, ausgehende REST-Hosts, Maskierung und die alten VAULT_*-Einstellungen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ändern Sie diese, um eigene Token- und Verschlüsselungsgeheimnisse zu setzen und einzuschränken, was Formulare aufrufen und anzeigen dürfen.

---

## Beispiel

Eigene Geheimnisse, REST-Aufrufe auf eine API und ein internes Netz beschränkt und ein weiterer maskierter Schlüssel. In der `.env` des Compose-Projekts:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Setzen Sie `ENCRYPTION_SECRET`, bevor die ersten Anmeldedaten gespeichert werden. Ab 7.3.0 verschlüsselt das Setzen oder Ändern beim nächsten Start jedes gespeicherte
Geheimnis neu, wobei `ENCRYPTION_SECRET_PREVIOUS` den alten Schlüssel nennt, wenn es Ihr eigener war, siehe
[Das Verschlüsselungsgeheimnis ändern](../security/secrets.html#changing-the-encryption-secret).

---

## REST-Aufrufe und jq

Ab 7.3.0 prüfen die REST-Hilfsfunktionen (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) das
Zertifikat des aufgerufenen Endpunkts, wie jede andere Verbindung; bis 7.2.0 taten sie das nie. Drei Einstellungen gelten für sie:

| Variable | Standard | Wirkung |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` überspringt die Zertifikatsprüfung: nur für Endpunkte mit selbstsigniertem Zertifikat |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Wie lange ein REST-Aufruf auf eine Antwort wartet, bevor er mit einer Zeitüberschreitung fehlschlägt |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Wie lange ein jq-Filter laufen darf, bevor er angehalten wird; die jq-Ausgabe ist außerdem auf 64 MB begrenzt |

Alle drei gelten beim Speichern, ohne Neustart. Für einen Endpunkt, dessen Zertifikat von einer privaten CA signiert ist, lassen Sie die Prüfung eingeschaltet
und geben Sie Node.js stattdessen diese CA: Setzen Sie `NODE_EXTRA_CA_CERTS` in der Umgebung der App auf eine PEM-Datei, die sie enthält, und starten Sie die App dann neu.

---

## Variablen

Jede Variable dieser Gruppe, mit Typ, Standardwert und Beschreibung:

{% include env_vars_table.html group="security" %}

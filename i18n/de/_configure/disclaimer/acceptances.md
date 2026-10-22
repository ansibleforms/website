---
layout: default
title: Zustimmungen
parent: Haftungsausschluss
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Zustimmungen
{: .no_toc }

Wer welche Version akzeptiert hat, und ausgewählte Benutzer erneut fragen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wer akzeptiert hat

Jede Zustimmung wird für den Benutzer und die Version festgehalten, und der Tab **Zustimmungen** auf der Seite einer Version listet sie auf, die neueste zuerst:

| Spalte | Bedeutung |
|---|---|
| **Benutzer** | Der Benutzername |
| **Anmeldung** | Wie er sich angemeldet hat: Lokal, LDAP, Microsoft Entra ID oder OpenID Connect |
| **Akzeptiert** | Wann |
| **IP-Adresse** | Von wo |
| **Browser** | Sein Browser |

---

## Benutzer erneut fragen

Ab 7.3.0 lassen sich ausgewählte Benutzer bitten, eine Version erneut zu akzeptieren, ohne alle zu fragen.

**Erneut anfragen** im Menü einer Zeile oder auf den in der Liste angehakten Zeilen löscht diese Zustimmungen nach einer Bestätigung: Diese Benutzer erhalten den
Haftungsausschluss bei ihrer nächsten Anfrage erneut, ohne sich neu anzumelden. Die Liste lässt sich, wie jede Tabelle, auch exportieren.

Das [Audit-Protokoll](../production/logs.html#audit-trail) hält außerdem jede Zustimmung, jede Ablehnung und jede Änderung des Haftungsausschlusses fest.

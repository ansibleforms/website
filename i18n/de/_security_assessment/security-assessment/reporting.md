---
layout: default
title: Eine Schwachstelle melden
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Eine Schwachstelle melden
{: .no_toc }

Wie Sie ein Sicherheitsproblem vertraulich melden und was danach passiert
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Vertraulich melden

AnsibleForms verwahrt Zugangsdaten und Vault-Tokens, melden Sie ein Sicherheitsproblem also nie in einem öffentlichen Issue:

1. Öffnen Sie **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: ein privates Advisory, das nur die Maintainer sehen.
2. Steht Ihnen diese Seite nicht zur Verfügung, öffnen Sie ein normales Issue, das nur sagt, dass Sie eine Sicherheitsmeldung haben, und
   um einen privaten Kanal bittet: keine Details, kein Reproduktionsbeispiel, keine Versionsnummern. Ein Maintainer öffnet ein privates Advisory und
   lädt Sie dazu ein.

Die vollständige Richtlinie ist die [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) des Repositorys.

---

## Was eine Meldung enthalten sollte

Je mehr davon eine Meldung enthält, desto schneller wird das Problem behoben:

* Was ein Angreifer gewinnt: die Daten eines anderen Benutzers, ein Playbook, das er nicht ausführen darf, den Host oder Admin-Rechte.
* Die Version und wie sie bereitgestellt ist: Docker, Kubernetes oder nativ installiert.
* Ein Reproduktionsbeispiel oder die Anfrage, die das Problem auslöst.
* Ob ein angemeldeter Benutzer nötig ist, und mit welchen [Rollenoptionen](../config/roles.html).

---

## Was danach passiert

Eine Meldung läuft von der ersten Nachricht bis zur Veröffentlichung über dasselbe private Advisory:

| Schritt | Was Sie erhalten |
|---|---|
| Eingangsbestätigung | Die Bestätigung, dass die Meldung angekommen ist, und ob sie sich reproduzieren lässt |
| Angenommen | Eine Korrektur im nächsten Release jeder [unterstützten Version](development.html#supported-versions) und ein veröffentlichtes Advisory, das Sie nennt, sofern Sie nicht lieber ungenannt bleiben |
| Abgelehnt | Die Begründung, meist dass das Verhalten eine Berechtigung voraussetzt, die der Meldende bereits hatte |

Sobald die Korrektur veröffentlicht ist, wird das Advisory veröffentlicht und erscheint unter [Security Advisories](advisories.html).

---

## Geltungsbereich

Die Richtlinie zieht die Grenze dort, wo das Rollenmodell sie zieht:

| Im Geltungsbereich | Außerhalb des Geltungsbereichs |
|---|---|
| Alles, was ein angemeldeter Benutzer über das hinaus erreicht, was seine Rolle erlaubt | Befunde, die ein bereits kompromittiertes Admin-Konto voraussetzen: Ein Admin, der beliebige Playbooks ausführt, ist das Produkt |
| Alles, was ohne Anmeldung erreichbar ist | Scannerberichte ohne nachgewiesene Auswirkung |
| Gespeicherte Zugangsdaten, die lesbar werden oder in ein Protokoll geschrieben werden | |
| Injection in die Shell, die Datenbank oder den Browser | |

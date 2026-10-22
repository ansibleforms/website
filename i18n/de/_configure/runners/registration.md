---
layout: default
title: Registrierung
parent: Runner
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Registrierung
{: .no_toc }

Wie eine RTE um Beitritt bittet und freigegeben wird, Beitrittstoken für unbeaufsichtigte Installationen und der Datenbankmodus
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Um Beitritt bitten

Seit 7.3.0 bittet eine RTE in einem Socket-Modus (`outbound` oder `inbound`), die die App noch nicht kennt, um Beitritt, und ein Admin gibt sie frei.
Sie meldet sich mit ihrem eigenen `RTE_TOKEN` und ihrem `RTE_NAME`: eine ausgehende RTE, wenn sie sich zum ersten Mal bei der App einwählt, eine eingehende in ihrem einen
Registrierungsaufruf. Ohne Beitrittstoken tut die App dann Folgendes:

1. Sie speichert das `RTE_TOKEN` der RTE in neuen Anmeldedaten vom Typ RTE namens `<name>-rte` (mit angehängter Nummer, wenn der Name vergeben ist) und
   bei einer eingehenden RTE deren Adresse, `RTE_URL`
2. Sie fügt einen nach `RTE_NAME` benannten Runner hinzu, Typ RTE, im Modus der RTE, der sich mit diesen Anmeldedaten anmeldet, markiert als **Wartet auf Freigabe**
   und ausgeschaltet. Seine Beschreibung nennt den Host, von dem die Anfrage kam

Eine ausgehende RTE bleibt verbunden, während sie wartet, erhält aber keinen Job. Bei einer eingehenden wählt sich die App erst ein, wenn sie freigegeben ist. Beide protokollieren,
dass sie darauf warten, dass ein Admin sie unter **Verbindungen > Runner** freigibt, mit dem Fingerabdruck ihres Tokens.

Eine eingehende RTE mit einer `https://`-`RTE_URL` sendet beim Bitten um Beitritt außerdem ihr Zertifikat, und die App pinnt es: Ab dann
wählt sich die App bei dieser RTE nur ein, wenn sie dasselbe Zertifikat vorlegt, daher funktioniert ein selbstsigniertes ohne CA (siehe [Eingehend](../rte/modes.html#inbound)).

Höchstens 20 RTEs warten gleichzeitig auf Freigabe: Weitere werden abgewiesen, bis einige freigegeben oder abgelehnt sind. Eine Anfrage, die niemand innerhalb von
24 Stunden bearbeitet, wird vom Worker entfernt, samt ihren Anmeldedaten.

Eine RTE, die nach einem Runner benannt ist, den die App bereits kennt, aber ein anderes Token hat, wird abgewiesen und bittet nicht um Beitritt. Geben Sie ihr das Token
dieses Runners oder löschen Sie den Runner, damit sie um Beitritt bittet. Ein [Beitrittstoken](#join-tokens) hilft nur, solange dieser Runner noch auf Freigabe wartet.

---

## Eine RTE freigeben

Die auf Freigabe wartenden Runner verlassen die Liste von **Verbindungen > Runner** und erscheinen in einem orangefarbenen Hinweis darüber, etwa
**2 Runner warten auf Freigabe**, mit einer Zeile pro Runner: Name, Host, IP-Adresse, Modus, Adresse und Fingerabdruck.
Die Glocke in der Kopfzeile zählt sie, für die Benutzer, die die Runner sehen können (siehe [die Glocke](../jobs/#the-jobs-page)).

Ein Klick auf den Hinweis öffnet den Dialog **Genehmigung prüfen** für jeden Runner nacheinander; ein Klick auf einen Namen öffnet nur diesen.
Seine Seite zeigt dieselben Fakten in einem gelben Kasten, **Diese RTE möchte beitreten**. Prüfen Sie, dass es eine ist, die Sie gestartet haben, bevor Sie sie freigeben:

| Feld | Was es zeigt |
|---|---|
| Fingerabdruck | Die ersten 8 Hexadezimalziffern des SHA-256 ihres `RTE_TOKEN`, als `abcd-ef12`. Die RTE protokolliert ihn bei ihrem Start, und das [Installationsprogramm](../installation/installer.html#a-runner) gibt ihn am Ende aus. Er muss derselbe sein |
| Zertifikat-Fingerabdruck | Im Dialog, bei einer eingehenden RTE über HTTPS: die ersten 8 Hexadezimalziffern des SHA-256 des Zertifikats, das die App pinnt (seine DER-Bytes), als `abcd-ef12`. Die RTE protokolliert ihn bei ihrem Start, und das [Installationsprogramm](../installation/installer.html#a-runner) gibt ihn am Ende aus. Er muss derselbe sein |
| Host | Der Host, auf dem sie läuft |
| IP-Adresse | Die Adresse, von der aus sie die App aufgerufen hat |
| Modus | Ausgehend oder Eingehend |
| URI | Die Adresse einer eingehenden RTE, unter der sich die App einwählt |
| Version | Ihr Release |
| Angefragt am | Wann sie um Beitritt gebeten hat |

**Freigeben** und **Ablehnen**, im Dialog oder im Kasten auf ihrer Seite, entscheiden:

| Aktion | Was passiert |
|---|---|
| Freigeben | Der Runner wird aktiviert und erhält ab jetzt Jobs. Er wird zum Standard seines Typs, wenn es keinen gibt |
| Ablehnen | Der Runner wird samt seinen Anmeldedaten entfernt, und sein Socket wird geschlossen. Die RTE kann erneut um Beitritt bitten; sie wartet dann wieder auf Freigabe |

Nur ein Admin gibt eine RTE frei oder lehnt sie ab.

---

## Beitrittstoken

Ein Beitrittstoken gibt eine RTE sofort frei, für unbeaufsichtigte Installationen: Eine mit
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) gestartete RTE oder ein mit `--join` des Installationsprogramms installierter Runner legt es einmal vor,
und ihr Runner wird aktiviert hinzugefügt, ohne zu warten. Beitrittstoken haben keine Seite in der Oberfläche: Ein Admin erstellt sie über die
[REST-API](../api/), unter `/api/v2/runner`:

| Aufruf | Was er tut |
|---|---|
| `POST /api/v2/runner/jointoken` | Erstellt ein Beitrittstoken. Der Body enthält seinen `name` und optional `expiresInHours` (keiner: Es läuft nie ab) und `maxUses` (keiner: beliebig viele RTEs) |
| `GET /api/v2/runner/jointoken` | Listet die Beitrittstoken auf, die neuesten zuerst, mit ihren Verwendungen und ob sie noch verwendbar sind; nie die Token selbst |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Widerruft es: Es fügt keinen Runner mehr hinzu und bleibt in der Liste |
| `DELETE /api/v2/runner/jointoken/<id>` | Löscht es |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

Die Antwort enthält das Token, das mit `afj_` beginnt, nur dieses eine Mal: Gespeichert wird nur sein SHA-256. Eine RTE, die es vorlegt, erhält dieselben
Anmeldedaten und denselben Runner wie eine, die [um Beitritt bittet](#asking-to-join), aktiviert, und seine Beschreibung nennt das Beitrittstoken. Ab dann meldet sich die
RTE mit ihrem eigenen Token an, sodass das Beitrittstoken ablaufen oder widerrufen werden kann, ohne sie zu beeinträchtigen. Das Widerrufen oder Löschen eines Beitrittstokens
lässt die Runner bestehen, die es hinzugefügt hat.

Ein Beitrittstoken gibt einem freigegebenen Runner nie ein neues Token. Wenn bereits ein RTE-Runner dieses Namens existiert:

| Der Runner | Was passiert |
|---|---|
| Wartet auf Freigabe | Er erhält das neue Token in seinen Anmeldedaten und wartet weiterhin auf die Freigabe eines Admins |
| Ist freigegeben | Abgewiesen mit `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. Das Beitrittstoken wird nicht verbraucht |
| Stammt aus dem [Config-Seed](../seed/) | Abgewiesen: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Eine mit einem neuen Token neu installierte RTE meldet sich daher mit dem Token aus den Anmeldedaten ihres Runners an, oder ein Admin ändert dieses Token
unter **Verbindungen > Anmeldedaten** oder löscht den Runner, damit die RTE als neue beitritt.

---

## Registrierung im Datenbankmodus

Eine RTE im Datenbankmodus, seit 7.3.0 veraltet, registriert sich standardmäßig selbst, unter ihrer `RTE_URL` oder sonst unter ihrer eigenen Adresse und ihrem Port. Der
Worker entfernt einen solchen Runner, sobald seine RTE 10 Minuten lang keinen Heartbeat geschrieben hat. Ein von Hand, vom Config-Seed oder von einer
RTE in einem Socket-Modus hinzugefügter Runner wird auf diese Weise nie entfernt.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), das diese Registrierung ein- oder ausschaltet, ist in 7.3.0 zusammen mit dem
Datenbankmodus veraltet: Eine RTE in einem Socket-Modus bittet um Beitritt oder tritt mit einem Beitrittstoken bei. Um solche Runner in der Zwischenzeit selbst zu verwalten, starten Sie die
RTE mit `RTE_REGISTER=0` und fügen Sie sie hier mit Typ RTE, Modus **Datenbank (veraltet)** und RTE-Anmeldedaten mit ihrer Adresse und demselben
Token hinzu. Um sie in einen Socket-Modus zu überführen, siehe [Modi](../rte/modes.html#database-deprecated).

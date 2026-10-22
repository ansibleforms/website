---
layout: default
title: Mehrere RTEs
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Mehrere RTEs
{: .no_toc }

Wie viele Playbooks eine RTE ausführt, weitere RTEs als Runner oder Replikate und was passiert, wenn eine anhält oder ausfällt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Mehrere Jobs auf einer RTE

Eine RTE führt bis zu [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) Playbooks nebeneinander aus, standardmäßig 10
(`0` setzt keine Grenze). Ein Job für eine volle RTE wird nicht übernommen. In einem Socket-Modus sendet die App ihn nicht, solange der letzte
Zustandsbericht der RTE keinen freien Platz zeigt, und eine RTE, die voll ist oder anhält, antwortet `refused` als ausgelastet; im Datenbankmodus antwortet die RTE
mit `503`. In beiden Fällen schreibt die App einmal `Waiting for a free slot on RTE <name>` in die Ausgabe und bietet den Job alle 10 Sekunden erneut an,
höchstens [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) lang (standardmäßig 60). Dann schlägt der Job fehl mit
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Ein Job, der während des Wartens abgebrochen wird, endet `aborted`, ohne je
die RTE zu erreichen.

---

## Mehrere RTEs

Die App verteilt Jobs nicht selbst auf Runner: Jeder Job geht an einen Runner, den, den das Formular nennt, oder den
Standard-Runner. Mehr RTE-Container helfen auf zwei Arten:

* **Als eigene Runner** : Jede RTE hat ihren eigenen `RTE_NAME` und tritt als eigener Runner bei: Sie bittet um Beitritt und ein Admin
  gibt sie frei, oder sie legt ein Beitrittstoken vor (siehe [Registrierung](../runners/registration.html)). Ein Formular wählt eine mit `runner: <name>`,
  zum Beispiel eine RTE mit den VMware-Collections oder eine in einer anderen Netzwerkzone; die anderen laufen auf der Standard-RTE
* **Als Replikate hinter einer Adresse** (nur Datenbankmodus) : Mehrere RTE-Container mit derselben `RTE_URL` und demselben `RTE_TOKEN`,
  etwa die Pods hinter einem Kubernetes-Service, teilen sich einen Runner, und die Adresse verteilt die Aufrufe auf sie. Ein volles Replikat antwortet
  mit `503`, und der nächste Versuch landet vielleicht bei einem anderen. Die App verfolgt einen Job über die Datenbank, daher spielt es keine Rolle, welches Replikat
  ihre Statusaufrufe beantwortet

In einem Socket-Modus (siehe [Modi](modes.html)) hält ein Runner einen Socket zu einer RTE, und eine zweite RTE, die sich mit demselben
`RTE_NAME` anmeldet, übernimmt den Socket von der ersten. Geben Sie jeder RTE einen eigenen Namen und einen eigenen Runner, und lassen Sie Formulare mit
`runner:` zwischen ihnen wählen.

Jede RTE im Datenbankmodus schreibt alle 10 Sekunden einen Heartbeat in die Datenbank, und eine, die sich selbst registriert, prüft ihre Runner-Zeile alle
30 Sekunden. Für eine RTE in einem Socket-Modus schreibt der App-Knoten, der ihren Socket hält, alle 20 Sekunden den Heartbeat für sie, solange der
Socket offen ist. Die Seite **Status** listet jede RTE mit ihrer Version auf. Der Worker entfernt einen Runner, den eine RTE im Datenbankmodus selbst registriert hat,
sobald diese RTE 10 Minuten lang keinen Heartbeat geschrieben hat, und wenn der Standard-Runner eine solche Zeile ist, deren RTE angehalten hat, übernimmt die nächste RTE,
die prüft, den Standard. Ein Runner aus dem Config-Seed, von Hand hinzugefügt oder über einen Socket beigetreten, wird auf diese Weise nie entfernt.

---

## Wenn eine RTE anhält oder ausfällt

**Wenn eine RTE anhält.** Bei `SIGTERM` (`docker stop`, ein Rolling Update, ein Herunterskalieren) nimmt die RTE keine Jobs mehr an: `/ready` antwortet mit `503`,
und ein neuer Job wird als ausgelastet abgewiesen (`503` im Datenbankmodus), sodass die App wartet oder im Datenbankmodus die Adresse ihn an ein anderes
Replikat sendet. Die laufenden Playbooks erhalten [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS), um fertig zu werden, standardmäßig 25,
dann beendet sich die RTE.

**Wenn eine RTE ausfällt.** Ein beendeter Container (Speicher erschöpft, ein verlorener Knoten, das Ende des Stop-Timeouts) nimmt seine Playbooks mit: Nichts
verschiebt sie auf eine andere RTE, und nichts führt sie erneut aus. Ihre Jobs werden als `abandoned` beendet, von der RTE selbst oder von der App, wenn sie
unter derselben ID zurückkommt, die ein neu gestarteter Container behält (`rte-<hostname>-<port>`), oder vom Worker, sobald der Heartbeat der RTE
zwei Minuten alt ist. Prüfen Sie auf den verwalteten Hosts, was das Playbook getan hat, bevor Sie es erneut starten.

**Solange eine RTE ausgefallen ist.** In einem Socket-Modus wartet ein neuer Job für sie auf ihren Socket, bis zu `RTE_QUEUE_MINUTES` und eine weitere Minute, und schlägt dann
fehl mit *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
Im Datenbankmodus schlägt er sofort fehl mit *the RTE at ... is unreachable*, es sei denn, ein anderes Replikat antwortet unter ihrer Adresse.

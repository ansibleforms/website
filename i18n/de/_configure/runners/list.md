---
layout: default
title: Die Seite Runner
parent: Runner
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# Die Seite Runner
{: .no_toc }

Die Liste der Runner, einen hinzufügen, einen ein- oder ausschalten, und der Standard jedes Typs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Liste

Die Seite unter **Verbindungen > Runner** listet jeden Runner mit diesen Spalten auf:

| Spalte | Bedeutung |
|---|---|
| Aktiviert | Ob er Jobs annimmt. Ein ausgeschalteter Runner erhält keinen Job, auch nicht als Standard seines Typs. |
| Name | Wie Formulare auf ihn verweisen, mit `runner: <name>`. |
| Typ | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck oder Jenkins. Der Standard-Runner seines Typs hat danach eine Pille **Standard**. |
| Beschreibung | Wofür er ist. |

**Spalten** fügt zwei weitere hinzu, standardmäßig aus: **Modus**, der Modus einer RTE (Ausgehend, Eingehend oder Datenbank (veraltet), siehe
[Modi](../rte/modes.html)), und **Verbindung**, ob ein App-Knoten einen Socket zu einer RTE in einem Socket-Modus hält: **Verbunden** oder
**Nicht verbunden**.

Ab 7.3.0 stehen die auf Freigabe wartenden Runner nicht in der Liste, sondern in einem Hinweis darüber, siehe [Eine RTE freigeben](registration.html#approving-an-rte).
**Runner hinzufügen** öffnet einen Dialog in Schritten: **Runner** (Name und Beschreibung), **Typ** und **Anmeldedaten**, bei einer RTE mit einem Schritt **Modus** nach
**Typ** (Ausgehend, der Standard für eine neue, Eingehend oder Datenbank (veraltet)): vier Schritte für eine RTE, drei für die
anderen. Im Schritt **Typ** hat jedes Produkt einen Hinweis: Der der RTE nennt ihren vollen Namen, *Laufzeitumgebung*. Eine Zeile öffnet die eigene Seite des
Runners, und ihr Menü bietet:

| Aktion | Was sie tut |
|---|---|
| Bearbeiten | Öffnet seine Seite |
| Verbindung testen | Prüft, dass er antwortet und seine Anmeldedaten akzeptiert, siehe [Verbindung testen](runner-page.html#test-connection) |
| Aktivieren, Deaktivieren | Schaltet ihn ein oder aus, je nachdem, was er nicht ist |
| Anmeldeinformationen ändern | Öffnet den Tab Anmeldedaten seiner Seite |
| Löschen | Entfernt ihn |

---

## Standard und Aktiviert

Der Standard jedes Typs ist der Ort, an dem die Formulare dieses Typs laufen, wenn sie keinen Runner nennen:

| Standard für | Wo diese Formulare laufen, wenn sie keinen Runner nennen |
|---|---|
| Playbook-Formulare | `ansible`-Formulare, auf einer RTE |
| AWX-, AAP- und Ascender-Formulare | `awx`-, `aap`- und `ascender`-Formulare, auf einem AWX-Runner |
| Semaphore-Formulare | `semaphore`-Formulare |
| Rundeck-Formulare | `rundeck`-Formulare |
| Jenkins-Formulare | `jenkins`-Formulare |

Der erste Runner eines Typs wird zu dessen Standard, daher braucht ein einzelner Runner pro Typ keinen zusätzlichen Schritt. Um einen anderen Runner zum Standard zu machen,
schalten Sie auf seiner Seite den Schalter **Standard** ein (siehe [Die Seite eines Runners](runner-page.html)).

Ein ausgeschalteter Runner bleibt mit seinen Einstellungen in der Liste, aber kein Job geht an ihn, auch nicht als Standard seines Typs. Ein Job für ihn schlägt fehl mit
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Schalten Sie ihn mit **Aktivieren** oder **Deaktivieren** im Menü seiner Zeile oder mit dem Schalter **Aktiviert** auf seiner Seite ein oder aus. Ein neuer Runner ist eingeschaltet, und die
Runner, die vor 7.3.0 existierten, sind nach dem Upgrade eingeschaltet. Der [Config-Seed](../seed/example.html) kann einen mit
`enabled: false` ausschalten.

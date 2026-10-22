---
layout: default
title: "Die Seite eines Runners"
parent: Runner
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# Die Seite eines Runners
{: .no_toc }

Die Tabs eines Runners, Modus, Verbindung und Einstellungen einer RTE und Verbindung testen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tabs

Die Seite eines Runners zeigt die Schritte seines Dialogs als Tabs, dazu was auf ihm läuft:

| Tab | Was er enthält |
|---|---|
| Details | Name und Beschreibung, den Schalter **Standard** und den Schalter **Aktiviert**, für jeden Runner-Typ gleich |
| Typ | Das Produkt, wie im Dialog. Bei einer RTE außerdem ihren **Modus**: **Datenbank (veraltet)**, **Eingehend** oder **Ausgehend**, das `RTE_MODE`, mit dem ihre RTE läuft (siehe [Modi](../rte/modes.html)) |
| RTE | Nur bei einer RTE: ihren **Modus** in Worten und in einem Socket-Modus ihre **Verbindung** und ihre Einstellungen (siehe [Die Einstellungen einer RTE](#an-rtes-settings)) |
| Anmeldedaten | Den **Anmeldedaten-Eintrag**, mit dem er sich anmeldet, Anmeldedaten aus Verbindungen > Anmeldedaten vom Typ des Runners, die sein Token oder seine Anmeldung und die Adresse seines Servers enthalten. Die einer RTE enthalten ihr `RTE_TOKEN` und die Adresse der RTE, sofern sie nicht ausgehend ist. **Projekt** bei Semaphore, Rundeck und Jenkins |
| Formulare | Die Formulare, die auf ihm laufen, und wie: **Nennt ihn** oder **Als Standard-Runner**. Eine Zeile öffnet das Formular |
| Jobs | Die letzten 100 Jobs, die auf ihm liefen, mit Status, Start, Ende und Dauer. Eine Zeile öffnet den Job |

Jeder Tab hat eine eigene Adresse, etwa `/settings/runners/<id>/rte`, sodass ein Link oder ein Lesezeichen ihn öffnet. Ein Runner ohne diesen Tab öffnet sich auf
Details.

Die beiden Schalter des Tabs Details werden sofort gespeichert. **Standard** macht den Runner zum Standard seines Typs; ausgeschaltet wird er, indem man
einen anderen Runner zum Standard macht. **Aktiviert** schaltet den Runner ein oder aus: Ausgeschaltet geht kein Job an ihn, auch nicht als Standard seines Typs (siehe
[Standard und Aktiviert](list.html#default-and-enabled)).

Eine RTE, die um Beitritt gebeten hat, öffnet sich mit einem gelben Kasten, **Diese RTE möchte beitreten**, mit ihrem Fingerabdruck und dem, was sie über sich gesagt hat, sowie
**Freigeben** und **Ablehnen** (siehe [Eine RTE freigeben](registration.html#approving-an-rte)). Ein Runner des [Config-Seeds](../seed/) sagt
das oben auf seiner Seite und ist schreibgeschützt.

---

## Die Einstellungen einer RTE

Der Tab RTE verwaltet eine RTE aus der App heraus, ohne ihre Umgebung auf der Maschine zu bearbeiten, auf der sie läuft.

**Verbindung.** Eine RTE in einem Socket-Modus zeigt eine Plakette: **Verbunden** oder **Nicht verbunden**. Beim Überfahren zeigt **Verbunden** den App-Knoten,
der ihren Socket hält, das Release der RTE und wie viele ihrer Jobs laufen. **Nicht verbunden** bedeutet, dass kein App-Knoten einen Socket zu ihr hält:
Prüfen Sie, ob die RTE läuft, ihre Adresse oder `APP_URL` und ihr Token.

**Einstellungen.** Eine RTE im ausgehenden oder eingehenden Modus hat vier Einstellungen, jede standardmäßig leer:

| Einstellung | Entspricht | Was sie tut |
|---|---|---|
| Max. gleichzeitige Jobs | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Wie viele Playbooks sie gleichzeitig ausführt, standardmäßig `10`; `0` setzt keine Grenze |
| Cache für Jobdateien | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Wie viel der von der App gesendeten Jobdateien sie behält, in MB, standardmäßig `1024`; `0` behält keine |
| Wartezeit beim Stoppen | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Wie lange eine anhaltende RTE auf ihre laufenden Playbooks wartet, standardmäßig `25` Sekunden |
| Jobdateien | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Übertragung**: Die App sendet die Dateien eines Jobs mit dem Job. **Lokal**: Sie arbeitet aus ihren eigenen eingehängten Ordnern |

**Welcher Wert gewinnt.** Ein Wert auf der Seite gewinnt über dieselbe auf der RTE gesetzte Variable. Ein leer gelassenes Feld verwendet die eigene Variable der RTE,
sonst den Standard. Unter jedem Feld sagt die Seite, welcher: **Überschreibt RTE_MAX_JOBS auf dem RTE (3).** oder **Leer: Das RTE nutzt seine eigene
RTE_MAX_JOBS, 3.**; der Platzhalter zeigt den Wert, für den ein leeres Feld steht.

**Wie sie die RTE erreichen.** Die Einstellungen werden mit dem Runner in der Datenbank der App gespeichert. Die App sendet sie über den Socket der RTE,
wenn diese sich verbindet und wann immer sie gespeichert werden, und die RTE wendet sie sofort an: Ein kleinerer Cache wird gekürzt, eine neue Grenze zählt ab dem
nächsten Job. Die RTE hält sie nur im Speicher und schreibt keine Datei: Nach einem Neustart erhält sie sie beim Verbinden erneut, vor ihrem ersten Job.

Eine RTE im Datenbankmodus (veraltet) hat keinen Socket: Sie liest diese Einstellungen aus ihren eigenen Variablen, und der Tab sagt das.

---

## Verbindung testen

Die Schaltflächen oben rechts wirken auf den Runner, wie er gespeichert ist.

Neben **Speichern** stehen **Verbindung testen** und **Löschen** und im Tab Anmeldedaten **Anmeldedaten hinzufügen**, das Anmeldedaten vom
Typ des Runners anlegt und auswählt. Ein Token oder Passwort wird nach dem Speichern nie wieder angezeigt: Ändern Sie es in den Anmeldedaten.

**Verbindung testen** prüft, dass der Runner antwortet und sein Token oder seine Anmeldung akzeptiert, und sagt das in einer Meldung: **Runner connection is
OK** oder warum es fehlschlug. Es führt keinen Job aus. Bei einer RTE prüft es außerdem den Vertrag, den die RTE spricht (siehe
[Der Vertrag](../rte/images.html#the-contract)):

| RTE | Was der Test liest | Wann er fehlschlägt |
|---|---|---|
| Ausgehend oder Eingehend | Wer ihren Socket hält, wie jeder App-Knoten es festhält, und was die RTE beim Verbinden gesagt hat. Er ruft nichts auf | Kein App-Knoten hält einen Socket zu ihr: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, oder bei einer eingehenden *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Oder die RTE spricht einen anderen Vertrag als 3 |
| Datenbank (veraltet) | Den Endpunkt `/rte/v1/health` der RTE, mit ihrem Token aufgerufen | Die RTE antwortet nicht unter ihrer Adresse, weist das Token ab oder spricht einen anderen Vertrag als 2 |

Die Plakette **Verbindung** im Tab RTE zeigt denselben Socket-Zustand ohne Test.

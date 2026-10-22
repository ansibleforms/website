---
layout: default
title: "De pagina van een runner"
parent: Runners
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# De pagina van een runner
{: .no_toc }

De tabbladen van een runner, de modus, verbinding en instellingen van een RTE, en Verbinding testen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tabbladen

De pagina van een runner toont de stappen van zijn dialoogvenster als tabbladen, plus wat erop draait:

| Tabblad | Wat het bevat |
|---|---|
| Details | De naam en beschrijving, de schakelaar **Standaard** en de schakelaar **Ingeschakeld**, hetzelfde voor elk type runner |
| Type | Het product, zoals in het dialoogvenster. Voor een RTE ook de **Modus**: **Database (verouderd)**, **Inkomend** of **Uitgaand**, de `RTE_MODE` waarmee zijn RTE draait (zie [Modi](../rte/modes.html)) |
| RTE | Alleen voor een RTE: de **Modus** in woorden en, in een socketmodus, de **Verbinding** en de instellingen (zie [De instellingen van een RTE](#an-rtes-settings)) |
| Referenties | De **Referentie** waarmee hij zich aanmeldt, een referentie uit Verbindingen > Inloggegevens van het type van de runner, die het token of de aanmelding en het adres van de server bevat. Die van een RTE bevat zijn `RTE_TOKEN`, en het adres van de RTE tenzij hij uitgaand is. **Project** voor Semaphore, Rundeck en Jenkins |
| Formulieren | De formulieren die erop draaien, en hoe: **Noemt hem** of **Als standaardrunner**. Een rij opent het formulier |
| Jobs | De laatste 100 jobs die erop draaiden, met hun status, start, einde en duur. Een rij opent de job |

Elk tabblad heeft een eigen adres, zoals `/settings/runners/<id>/rte`, zodat een link of een bladwijzer het opent. Een runner zonder dat tabblad opent op
Details.

De twee schakelaars van het tabblad Details worden meteen opgeslagen. **Standaard** maakt de runner de standaard van zijn type; hij wordt uitgezet door
een andere runner de standaard te maken. **Ingeschakeld** schakelt de runner in of uit: uitgeschakeld gaat er geen job naartoe, ook niet als standaard van zijn type (zie
[Standaard en Ingeschakeld](list.html#default-and-enabled)).

Een RTE die vroeg om lid te worden, opent met een geel vak, **Deze RTE vraagt om lid te worden**, met zijn vingerafdruk en wat hij over zichzelf zei, en
**Goedkeuren** en **Afwijzen** (zie [Een RTE goedkeuren](registration.html#approving-an-rte)). Een runner uit de [configuratie-seed](../seed/) vermeldt
dat boven aan zijn pagina, en is alleen-lezen.

---

## De instellingen van een RTE

Het tabblad RTE beheert een RTE vanuit de app, zonder de omgeving te bewerken op de machine waarop hij draait.

**Verbinding.** Een RTE in een socketmodus toont een badge: **Verbonden** of **Niet verbonden**. Bij aanwijzen toont **Verbonden** de app-node
die zijn socket vasthoudt, de release van de RTE, en hoeveel van zijn jobs draaien. **Niet verbonden** betekent dat geen enkele app-node een socket naar hem vasthoudt:
controleer of de RTE draait, zijn adres of `APP_URL`, en zijn token.

**Instellingen.** Een RTE in uitgaande of inkomende modus heeft vier instellingen, elk standaard leeg:

| Instelling | Hetzelfde als | Wat ze doet |
|---|---|---|
| Max. gelijktijdige jobs | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Hoeveel playbooks hij tegelijk draait, standaard `10`; `0` stelt geen limiet in |
| Cache voor jobbestanden | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Hoeveel van de jobbestanden die de app hem stuurde hij bewaart, in MB, standaard `1024`; `0` bewaart niets |
| Wachttijd bij stoppen | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Hoe lang een stoppende RTE op zijn lopende playbooks wacht, standaard `25` seconden |
| Jobbestanden | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Overdracht**: de app stuurt de bestanden van een job met de job mee. **Lokaal**: hij draait vanuit zijn eigen gekoppelde mappen |

**Welke waarde wint.** Een waarde op de pagina wint van dezelfde variabele die op de RTE is ingesteld. Een veld dat leeg blijft, gebruikt de eigen variabele van de RTE,
anders de standaard. Onder elk veld zegt de pagina welke: **Overschrijft RTE_MAX_JOBS op de RTE (3).**, of **Leeg: de RTE gebruikt zijn
eigen RTE_MAX_JOBS, 3.**; de placeholder toont de waarde waarvoor een leeg veld staat.

**Hoe ze de RTE bereiken.** De instellingen worden met de runner in de database van de app opgeslagen. De app stuurt ze over de socket van de RTE
wanneer die verbinding maakt en telkens wanneer ze worden opgeslagen, en de RTE past ze meteen toe: een kleinere cache wordt ingekort, een nieuwe limiet telt vanaf de
volgende job. De RTE bewaart ze alleen in het geheugen en schrijft geen bestand: na een herstart krijgt hij ze opnieuw als hij verbinding maakt, vóór zijn eerste job.

Een RTE in databasemodus (verouderd) heeft geen socket: hij leest deze instellingen uit zijn eigen variabelen, en het tabblad vermeldt dat.

---

## Verbinding testen

De knoppen rechtsboven werken op de runner zoals hij is opgeslagen.

Naast **Opslaan** staan **Verbinding testen** en **Verwijderen**, en op het tabblad Referenties **Referentie toevoegen**, dat een referentie van het
type van de runner aanmaakt en kiest. Een token of wachtwoord wordt na het opslaan nooit meer getoond: wijzig het op de referentie.

**Verbinding testen** controleert of de runner antwoordt en zijn token of aanmelding accepteert, en zegt dat in een bericht: **Runner connection is
OK**, of waarom het mislukte. Er draait geen job. Voor een RTE controleert het ook het contract dat de RTE spreekt (zie
[Het contract](../rte/images.html#the-contract)):

| RTE | Wat de test leest | Wanneer hij mislukt |
|---|---|---|
| Uitgaand of Inkomend | Wie zijn socket vasthoudt, zoals elke app-node dat vastlegt, en wat de RTE zei toen hij verbinding maakte. Hij roept niets aan | Geen enkele app-node houdt een socket naar hem vast: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, of voor een inkomende, *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Of de RTE spreekt een ander contract dan 3 |
| Database (verouderd) | De `/rte/v1/health` van de RTE, aangeroepen met zijn token | De RTE antwoordt niet op zijn adres, weigert het token, of spreekt een ander contract dan 2 |

De badge **Verbinding** van het tabblad RTE toont dezelfde socketstatus zonder test.

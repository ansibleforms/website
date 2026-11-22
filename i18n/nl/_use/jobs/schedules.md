---
layout: default
title: Planningen
parent: Jobs
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Planningen
{: .no_toc }

Voer een formulier later uit, volgens een cron of een rrule, en beheer elke planning
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De acties van het formulier

Een formulier kan meer dan meteen uitvoeren: de keuzelijst naast de knop **Verzenden** bevat nog drie acties.

| Actie | Wat het doet | Roloptie |
|---|---|---|
| **Schedule (terugkerend)** | Maakt een planning die het formulier volgens een cron-expressie uitvoert | `allowScheduledJobs` |
| **Later uitvoeren (eenmalig)** | Maakt een planning die het formulier één keer uitvoert, op een datum en tijd die je kiest | `allowPlannedJobs` |
| **Store** | Slaat de veldwaarden op, om ze later weer in het formulier te laden | `allowStoredJobs` |

Een actie waarvan de roloptie uitstaat, wordt niet getoond. Het formulier wordt vóór elk van deze acties gevalideerd, net als bij **Verzenden**. Beide
planningsacties maken een item aan onder **Jobs > Gepland**; **Store** maakt een item aan op de pagina **Opgeslagen invoer**. De
zijbalk van de pagina [Jobs](./) opent ze onder **Toekomst**, als **Gepland** en **Opgeslagen**. De rolopties staan beschreven
in [Rolopties](../config/roles.html#role-options).

{: .warning }
> Behandel `allowScheduledJobs` als een optie op adminniveau. De planningen zijn niet van de gebruiker die ze aanmaakte: elke gebruiker
> met de optie ziet alle planningen en kan ze wijzigen. Zo'n planning draait bovendien met adminrechten, voor elk formulier, ongeacht de
> eigen toegang van de maker. Ken haar alleen toe aan rollen die je als admin zou vertrouwen.

{: .note }
> **Later uitvoeren (eenmalig)** vereist alleen `allowPlannedJobs`. Voor een gebruiker zonder `allowScheduledJobs` plant het een uitvoering **als die
> gebruiker**: de server controleert of de gebruiker het formulier mag uitvoeren, en de job draait als die gebruiker, met die gebruiker als eigenaar, wanneer het zover is
> (zie [Geplande uitvoeringen](#planned-runs)).

---

## Een formulier plannen

Vul het formulier in, open daarna de keuzelijst naast **Verzenden** en kies een van de planningsacties.

- **Schedule (terugkerend)** opent **Planning aanmaken**: vul een **Naam** en een **Cron expressie** in (de standaard, `0 0 * * *`,
  draait elke dag om middernacht), en kies dan **Planning aanmaken**.
- **Later uitvoeren (eenmalig)** opent **Later uitvoeren**: vul een **Naam** in en kies de datum en tijd bij **Uitvoeren op**, en kies dan
  **Job plannen**.

De naam moet uniek zijn over alle planningen. De planning bewaart de naam van het formulier en een kopie van de extravars die het formulier op
dat moment opleverde, als YAML; elke uitvoering gebruikt die kopie, dus bewerk haar op de pagina van de planning om te veranderen wat de job krijgt. Om
haar in plaats daarvan met een rrule te timen, of haar een einde te geven, open je haar pagina en wijzig je haar tabblad **Planning**.

![Planningen](../assets/screenshots/schedules.jpg)

---

## De lijst van planningen

**Jobs > Gepland** toont elke planning en vereist `allowScheduledJobs`; een rij opent de eigen pagina van de planning.

| Kolom | Toont |
|---|---|
| **Ingeschakeld** | Of de planning volgens haar eigen timing draait |
| **Naam** en **Formulier** | De planning, en het formulier dat ze uitvoert |
| **Planning** | Haar timing in gewone taal, zoals *At 02:00 AM*; ga erover met de muis om de cron of de regel zelf te zien |
| **Laatste uitvoering** | Wanneer ze het laatst draaide |
| **Volgende run** | Wanneer ze de volgende keer draait, een streepje als er geen run meer komt |
| **Status** | Haar laatste start: of ze een job startte, of **Wordt gestart…** terwijl ze er een start |

De kolom **Planning** toont een eenmalige planning als **Eenmalige uitvoering**. Een rrule die gewone taal niet kan beschrijven,
wordt getoond zoals ze is. Het menu van elke rij biedt:

| Actie | Wat het doet |
|---|---|
| **Bewerken** | Opent de pagina van de planning |
| **Nu uitvoeren** | Voert de planning nu uit, zonder op haar timing te wachten |
| **Inschakelen** of **Uitschakelen** | Zet de planning aan of uit, afhankelijk van wat van toepassing is, zoals haar kolom **Ingeschakeld** toont |
| **Verwijderen** | Verwijdert de planning; ze stopt meteen met draaien |

**Nieuwe planner** maakt er een vanaf nul, in drie stappen: **Details** (haar **Naam**, **Beschrijving** en **Formulier**),
**Planning** (haar timing en haar einde) en **Extra vars**. **Extra vars** is YAML zonder formulier dat het vult, dus voeg de
waarden die het playbook nodig heeft zelf toe, als dictionary (paren sleutel: waarde).

---

## De pagina van een planning

De pagina van een planning bevat de stappen van haar dialoog als tabbladen, met **Nu uitvoeren**, **Verwijderen** en **Opslaan** rechtsboven.

| Tabblad | Wat het bevat |
|---|---|
| **Details** | Haar bron, **Naam**, **Beschrijving**, **Formulier**, dan **Laatste start**, **Gestarte job**, **Laatste uitvoering**, **Volgende run** en **Ingeschakeld** |
| **Planning** | Hoe ze getimed is (zie [Een planning timen](#timing-a-schedule)) en hoe ze eindigt (zie [Het einde van een planning](#the-end-of-a-schedule)) |
| **Extra vars** | De YAML die de job krijgt; voor een planning in git ook de prompts van haar bestand |
| **Runs** | De jobs die ze startte, de nieuwste eerst; een rij opent de job |

**Laatste start** zegt hoe haar laatste start verliep, als status: een mislukte zegt waarom als je er met de muis over gaat. **Gestarte job** linkt naar
de job die ze startte, zodat je hem kunt openen en zien hoe hij eindigde. Het tabblad **Runs** toont de jobs die je mag zien, met als wie ze draaiden,
hun start, einde, duur en status; hun aantal staat in de titel van het tabblad.

De schakelaar **Ingeschakeld** pauzeert een planning zonder haar te verwijderen, en wordt met **Opslaan** bewaard, zoals elk veld van de pagina. Een
uitgezette planning blijft in de lijst staan met haar instellingen, maar draait niet vanzelf: een terugkerende planning slaat haar runs over, en een
eenmalige wacht voorbij haar moment tot ze weer wordt aangezet. **Nu uitvoeren** voert haar nog steeds op verzoek uit. Een nieuwe planning staat aan.

---

## Een planning timen

Een planning wordt op een van drie manieren getimed, gekozen onder **Timing** op haar tabblad **Planning**; de rrule is nieuw in 7.8.0.

| Timing | Draait | Zie |
|---|---|---|
| **Cron** | Terugkerend, volgens een cron-expressie in de tijdzone van de server | [Cron-expressies en tijdzone](#cron-expressions-and-time-zone) |
| **Herhalingsregel (rrule)** | Terugkerend, volgens een iCal-regel in haar eigen tijdzone | [Herhalingsregels](#recurrence-rules) |
| **Eenmalige uitvoering** | Eén keer, op een datum en tijd | [Hoe een planning draait](#how-a-schedule-runs) |

Bij een cron of een rrule toont de editor de volgende drie runs, en stopt ze bij het einde van de planning. Een wijziging van de timing
houdt alleen de gekozen timing: een planning die van een cron naar een rrule overgaat, verliest haar cron.

---

## Cron-expressies en tijdzone

Een terugkerende planning kan een standaard cron-expressie met 5 velden gebruiken: minuut, uur, dag van de maand, maand en dag van de week.

| Expressie | Draait |
|---|---|
| `*/15 * * * *` | Elke 15 minuten |
| `0 2 * * *` | Elke dag om 02:00 |
| `30 7 * * 1-5` | Maandag tot en met vrijdag om 07:30 |
| `0 0 1 * *` | Om middernacht op de eerste dag van elke maand |

De cron-editor beschrijft de expressie in woorden, biedt presets en toont vooraf de volgende uitvoeringen. De server weigert een
expressie die hij niet kan uitvoeren, of een die nooit kan voorkomen. Meer voorbeelden, en de cron-functies die de editor niet accepteert,
staan in de FAQ onder [Welke cron-expressies kan ik gebruiken?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Cron-planningen draaien in de tijdzone van de server, ingesteld met [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (standaard `UTC`),
> niet in de tijdzone van je profiel of je browser. De cron-editor toont de volgende uitvoeringen in diezelfde zone.

---

## Herhalingsregels

Vanaf 7.8.0 kan een terugkerende planning in plaats daarvan een iCal-herhalingsregel (rrule) gebruiken, die in een eigen tijdzone draait.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

De eerste draait elke dag om 02:00 in Brussel, de tweede elke maandag om 06:00 UTC, de derde op de laatste werkdag van
elke maand om 07:30 in New York. Een regel is één regel tekst, met haar delen gescheiden door spaties:

| Deel | Wat het zegt |
|---|---|
| `DTSTART` | De eerste run, met een `TZID` (een IANA-zone zoals `Europe/Brussels`, of een offset zoals `UTC+5` of `GMT-3`), of in UTC eindigend op `Z` |
| `RRULE` | Wanneer ze zich herhaalt: `FREQ` met een `INTERVAL` van minstens 1, en `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … naar behoefte; een of meer |
| `EXRULE` | Optioneel: een regel van runs die worden overgeslagen |

De server weigert een regel die hij niet kan uitvoeren, en zegt waarom:

- geen `DTSTART`, meer dan één, of een zonder tijdzone, en `EXDATE` of `RDATE`;
- een regel zonder `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` met een getal (`5MO`), of `COUNT` samen met `UNTIL`;
- `COUNT` boven 999, een `BYxxx`-getal buiten zijn bereik (`BYHOUR` 0 tot 23, `BYSETPOS` 1 tot 366 of -366 tot -1 …), een `WKST`
  die geen weekdag is, een `DTSTART` of `UNTIL` die geen echte datum is (`20300230`), of een deel dat twee keer in een regel staat;
- een regel die nooit afgaat: geen run in de 50 jaar na haar `DTSTART`, zoals `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` vanaf
  middernacht, die alleen even uren treft.

De editor is een tekstvak: een nieuwe rrule begint als elke dag om middernacht in de tijdzone van je browser. Hij zegt meteen waarom een regel
geweigerd zou worden, en toont anders haar volgende drie runs in de eigen tijdzone van de regel, of **Deze rrule heeft geen komende run meer.** als haar
`UNTIL` of `COUNT` voorbij is. Een tijdstip dat een zomertijdwissel overslaat, draait wanneer de klok het bereikt (02:30 draait om 03:30 in de
nacht dat de klok van 02:00 naar 03:00 gaat), zoals een cron dat doet; een tijdstip dat de klok twee keer toont, draait één keer, bij het eerste.

---

## Het einde van een planning

Vanaf 7.8.0 kan een planning die door een cron of een rrule getimed wordt, eindigen; kies onder **Eindigt** op haar tabblad **Planning** een optie.

| Eindigt | De planning eindigt |
|---|---|
| **Nooit** | Nooit: de standaard, en elke planning van vóór 7.8.0 |
| **Op een datum** | Op de gekozen datum en tijd: geen run daarna |
| **Na** … **runs** | Zodra ze in totaal zoveel jobs heeft gestart, de jobs die haar tabblad **Runs** toont; het veld zegt hoeveel tot nu toe |

**Bij het einde** wordt ze uitgezet (**Uitschakelen**, de standaard) of verwijderd (**Verwijderen**). De systeemtaak **Einde van planningen**
past de eindes elke minuut toe, en een planning die haar aantal runs bereikt, eindigt meteen na haar laatste. De eigen `UNTIL` of `COUNT`
van een rrule geldt nog steeds; het einde komt daar bovenop.

Een eenmalige planning heeft geen einde: ze eindigt met haar run. Haar schakelaar **Verwijderen na de run**, standaard aan, verwijdert haar na
haar run; uitgezet wordt de planning na haar run uitgeschakeld en met haar uitkomst bewaard.

---

## Hoe een planning draait

Is een planning aan de beurt, dan komt ze in de wachtrij, en de server start planningen uit de wachtrij één voor één, waarbij hij de wachtrij elke 10 seconden controleert.

- **Terugkerende** planningen slaan een run over zolang de vorige uitvoering nog in de wachtrij staat of draait, zodat uitvoeringen nooit overlappen.
- **Eenmalige** planningen draaien binnen een minuut na hun moment en worden daarna verwijderd (of bewaard, uitgezet, wanneer **Verwijderen
  na de run** uitstaat), ook wanneer ze met **Nu uitvoeren** zijn gestart.
- **Status** is `success` wanneer de job is gestart en `failed` wanneer dat niet lukte. Een `success` zegt alleen dat de job is
  gestart: open de job om te zien hoe hij eindigde.

Een planning die met `allowScheduledJobs` is gemaakt, draait als de ingebouwde gebruiker `Schedule Service` (type `schedule`) met de
rol `admin`. Ze kan elk formulier uitvoeren, ongeacht de toegang van degene die de planning maakte, en `ansibleforms_user` in
haar extravars beschrijft die gebruiker. Een [geplande uitvoering](#planned-runs) draait in plaats daarvan als de gebruiker die haar plande.

De job krijgt ook een object `schedule`, zodat een playbook weet dat een planning hem startte:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

De `one_time_run` ervan is het moment van de run van een eenmalige planning, `null` voor een terugkerende. Het bevat ook de andere instellingen
van de planning, zoals `enabled` en `repository`, en `run_at`: hetzelfde moment onder zijn naam van vóór 7.8.0 (verouderd, verdwijnt in 8).

---

## Geplande uitvoeringen

**Later uitvoeren (eenmalig)** door een gebruiker zonder `allowScheduledJobs` maakt een geplande uitvoering: een eenmalige planning die aan die gebruiker is gekoppeld.

- **Bij het plannen** controleert de server of de gebruiker het formulier mag uitvoeren (de `roles` ervan), en verbose-modus vereist
  `allowVerboseMode`. Een geplande uitvoering is altijd eenmalig; een cron-expressie of een rrule wordt geweigerd.
- **Onder launch-validatie `enforce`** worden de veldwaarden bij het plannen gecontroleerd, zodat een uitvoering die geweigerd zou worden,
  wordt geweigerd terwijl de gebruiker er nog naar kijkt.
- **Wanneer ze draait**, draait de job als die gebruiker, met die gebruiker als eigenaar, met dezelfde controles als een start vanuit de browser: de
  rollen van het formulier zoals ze dan zijn, de gereserveerde extravars verwijderd, en launch-validatie. `ansibleforms_user` beschrijft die gebruiker.

Wie plant, ziet **Jobs > Gepland** niet, want dat vereist `allowScheduledJobs`; de job verschijnt in zijn eigen jobgeschiedenis. Een
geplande uitvoering wordt altijd na haar run verwijderd.

---

## Wanneer het formulier verandert

Een planning verwijst op naam naar haar formulier en voert het uit zoals het op het moment van elke uitvoering is gedefinieerd.

- **Het formulier wordt bewerkt**: de volgende uitvoering gebruikt de nieuwe definitie (playbook, sjabloon, inventaris) met de extravars die in
  de planning zijn opgeslagen. Het formulier wordt niet opgebouwd, dus er wordt geen veld opnieuw berekend; pas de extra vars van de planning daarop aan.
- **Het formulier wordt hernoemd of verwijderd**: de uitvoering mislukt, **Status** wordt `failed` en **Laatste start** toont, als je er met de muis
  over gaat, `Failed to launch : No such form '<name>'`. Bewerk de planning en kies het juiste formulier, of verwijder haar.

---

## Geplande jobs in de jobgeschiedenis

Elke uitvoering van een planning maakt een gewone job, die op de pagina [Jobs](./) staat met `Schedule Service` als gebruiker, of,
bij een geplande uitvoering, met de gebruiker die haar plande.

Een job van `Schedule Service` is niet van degene die de planning maakte, dus alleen admins en gebruikers met `showAllJobLogs` zien hem;
de job van een geplande uitvoering is ook zichtbaar voor zijn gebruiker. Het tabblad **Runs** van de planning toont de jobs die ze
startte, en haar **Gestarte job** linkt naar de laatste.

---

## Planningen in een git-repository

Vanaf 7.8.0 kunnen planningen ook in een git-repository staan, als items van een lijst `controller_schedules:` in de YAML-bestanden ervan.

Hoogstens één repository heeft het gebruik **Planners**: de items ervan worden bij elke pull ingelezen in **Jobs > Gepland**, getimed door een
`cron`, een `rrule` of een `one_time_run`, en een planning die in de app wordt gemaakt of gewijzigd, wordt teruggeschreven naar haar bestand, in afwachting van
de push van de repository. Zo'n planning toont haar bestand op haar pagina, en haar einde zet haar alleen ooit uit. Zie
[Git-repositories](../repositories/).

---

## In de API

Vanaf 7.8.0 heeft een planning in de API drie timingvelden, waarvan er precies één is ingevuld: `cron`, `rrule` of `one_time_run`.

| Veld | Bevat |
|---|---|
| `cron` | Een cron-expressie |
| `rrule` | Een herhalingsregel, op één regel |
| `one_time_run` | Het moment van haar enige run, een ISO 8601-tijd met de offset of `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | Haar einde: `never`, `date` of `count`, de datum, het aantal runs, en `disable` of `remove` |
| `remove_after_run` | Een eenmalige planning: `false` bewaart haar, uitgezet, na haar run |

{: .warning }
> Het paar dat de API vóór 7.8.0 aannam, `one_time_run: true` met `run_at`, is verouderd sinds 7.8.0 en verdwijnt in 8. Het wordt
> nog steeds gelezen als `one_time_run` op dat moment, met een waarschuwing in het serverlog; `one_time_run: false` met een cron wordt gelezen als
> die cron.

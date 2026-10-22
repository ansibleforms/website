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
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Planningen
{: .no_toc }

Voer een formulier later of volgens een cron-schema uit, en beheer elke planning
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
planningsacties maken een item aan op de pagina **Planner**; **Store** maakt een item aan op de pagina **Opgeslagen invoer**. De
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
dat moment opleverde, als YAML; elke uitvoering gebruikt die kopie, dus bewerk haar op de pagina **Planner** om te veranderen wat de job krijgt.

![Planningen](../assets/screenshots/schedules.jpg)

---

## De pagina Planner

De pagina **Planner** toont elke planning, vanaf 7.3.0 met de kolom **Ingeschakeld**, en vereist `allowScheduledJobs`. Het menu van elke rij biedt:

| Actie | Wat het doet |
|---|---|
| **Bewerken** | Wijzigt de naam, het type, de cron-expressie of het tijdstip van uitvoering, het formulier en de extra vars |
| **Nu uitvoeren** | Voert de planning nu uit, zonder op haar cron-expressie of tijdstip te wachten |
| **Inschakelen** of **Uitschakelen** | Zet de planning aan of uit, afhankelijk van wat van toepassing is, zoals haar kolom **Ingeschakeld** toont (vanaf 7.3.0) |
| **Verwijderen** | Verwijdert de planning; ze stopt meteen met draaien |
| **Laatste uitvoer** | Op de pagina van de planning, wat de laatste uitvoering meldde, zoals het nummer van de job die ze startte |

Een planning kan hier ook vanaf nul worden aangemaakt. Kies het **Formulier**, en vink dan **Eenmalige uitvoering** aan en stel
**Uitvoeren op** in, of laat het uit en stel een **Cron-schema** in. **Extra vars** is YAML zonder formulier dat het vult, dus voeg de
waarden die het playbook nodig heeft zelf toe, als dictionary (paren sleutel: waarde).

Het veld **Cron-schema** is een cron-editor: het beschrijft de expressie in woorden, biedt presets en toont vooraf de volgende
uitvoeringen. De server weigert een expressie die hij niet kan uitvoeren, of een die nooit kan voorkomen.

Vanaf 7.3.0 heeft elke planning een schakelaar **Ingeschakeld**, om haar te pauzeren zonder haar te verwijderen. Een uitgezette planning blijft op de pagina staan
met haar instellingen, maar draait niet vanzelf: een terugkerende planning slaat haar cron-tikken over, en een eenmalige wacht voorbij haar
**Uitvoeren op** tot ze weer wordt aangezet. **Nu uitvoeren** voert haar nog steeds op verzoek uit. Een nieuwe planning staat aan, en de planningen
die vóór 7.3.0 bestonden, staan na de upgrade aan.

---

## Cron-expressies en tijdzone

Een terugkerende planning gebruikt een standaard cron-expressie met 5 velden: minuut, uur, dag van de maand, maand en dag van de week.

| Expressie | Draait |
|---|---|
| `*/15 * * * *` | Elke 15 minuten |
| `0 2 * * *` | Elke dag om 02:00 |
| `30 7 * * 1-5` | Maandag tot en met vrijdag om 07:30 |
| `0 0 1 * *` | Om middernacht op de eerste dag van elke maand |

Meer voorbeelden, en de cron-functies die de editor niet accepteert, staan in de FAQ onder
[Welke cron-expressies kan ik gebruiken?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Cron-planningen draaien in de tijdzone van de server, ingesteld met [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (standaard `UTC`),
> niet in de tijdzone van je profiel of je browser. De cron-editor toont de volgende uitvoeringen in diezelfde zone.

---

## Hoe een planning draait

Is een planning aan de beurt, dan komt ze in de wachtrij, en de server start planningen uit de wachtrij één voor één, waarbij hij de wachtrij elke 10 seconden controleert.

- **Terugkerende** planningen slaan een tik over zolang de vorige uitvoering nog in de wachtrij staat of draait, zodat uitvoeringen nooit overlappen.
- **Eenmalige** planningen draaien binnen een minuut na **Uitvoeren op** en worden daarna verwijderd, ook wanneer ze met **Nu uitvoeren** zijn gestart.
- **Status** is `success` wanneer de job is gestart en `failed` wanneer dat niet lukte. Een `success` zegt alleen dat de job is
  gestart: open de job om te zien hoe hij eindigde.

Een planning die met `allowScheduledJobs` is gemaakt, draait als de ingebouwde gebruiker `Schedule Service` (type `schedule`) met de
rol `admin`. Ze kan elk formulier uitvoeren, ongeacht de toegang van degene die de planning maakte, en `ansibleforms_user` in
haar extravars beschrijft die gebruiker. Een [geplande uitvoering](#planned-runs) draait in plaats daarvan als de gebruiker die haar plande.

De job krijgt ook een object `schedule` (met zijn `id`, `name` en `form`), zodat een playbook weet dat een planning hem startte:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Geplande uitvoeringen

**Later uitvoeren (eenmalig)** door een gebruiker zonder `allowScheduledJobs` maakt een geplande uitvoering: een eenmalige planning die aan die gebruiker is gekoppeld.

- **Bij het plannen** controleert de server of de gebruiker het formulier mag uitvoeren (de `roles` ervan), en verbose-modus vereist
  `allowVerboseMode`. Een geplande uitvoering is altijd eenmalig; een cron-expressie wordt geweigerd.
- **Onder launch-validatie `enforce`** worden de veldwaarden bij het plannen gecontroleerd, zodat een uitvoering die geweigerd zou worden,
  wordt geweigerd terwijl de gebruiker er nog naar kijkt.
- **Wanneer ze draait**, draait de job als die gebruiker, met die gebruiker als eigenaar, met dezelfde controles als een start vanuit de browser: de
  rollen van het formulier zoals ze dan zijn, de gereserveerde extravars verwijderd, en launch-validatie. `ansibleforms_user` beschrijft die gebruiker.

Wie plant, ziet de pagina **Planner** niet, want die vereist `allowScheduledJobs`; de job verschijnt in zijn eigen jobgeschiedenis.

---

## Wanneer het formulier verandert

Een planning verwijst op naam naar haar formulier en voert het uit zoals het op het moment van elke uitvoering is gedefinieerd.

- **Het formulier wordt bewerkt**: de volgende uitvoering gebruikt de nieuwe definitie (playbook, sjabloon, inventaris) met de extravars die in
  de planning zijn opgeslagen. Het formulier wordt niet opgebouwd, dus er wordt geen veld opnieuw berekend; pas de extra vars van de planning daarop aan.
- **Het formulier wordt hernoemd of verwijderd**: de uitvoering mislukt, **Status** wordt `failed` en **Laatste uitvoer** toont
  `Failed to launch : No such form '<name>'`. Bewerk de planning en kies het juiste formulier, of verwijder haar.

---

## Geplande jobs in de jobgeschiedenis

Elke uitvoering van een planning maakt een gewone job, die op de pagina [Jobs](./) staat met `Schedule Service` als gebruiker, of,
bij een geplande uitvoering, met de gebruiker die haar plande.

Een job van `Schedule Service` is niet van degene die de planning maakte, dus alleen admins en
gebruikers met `showAllJobLogs` zien hem; de job van een geplande uitvoering is ook zichtbaar voor zijn gebruiker. De **Laatste uitvoer** van de planning noemt de job die ze startte, zodat je hem in de lijst kunt vinden.

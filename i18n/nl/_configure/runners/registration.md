---
layout: default
title: Registratie
parent: Runners
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Registratie
{: .no_toc }

Hoe een RTE vraagt om lid te worden en wordt goedgekeurd, jointokens voor onbeheerde installaties, en databasemodus
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Vragen om lid te worden

Sinds 7.3.0 vraagt een RTE in een socketmodus (`outbound` of `inbound`) die de app nog niet kent om lid te worden, en keurt een admin hem goed.
Hij meldt zich met zijn eigen `RTE_TOKEN` en zijn `RTE_NAME`: een uitgaande RTE wanneer hij de app voor het eerst belt, een inkomende in zijn ene
registratieaanroep. Zonder jointoken doet de app dan het volgende:

1. Ze slaat het `RTE_TOKEN` van de RTE op in een nieuwe referentie van het type RTE met de naam `<name>-rte` (met een nummer erbij als die naam bezet is), en
   voor een inkomende RTE ook zijn adres, `RTE_URL`
2. Ze voegt een runner toe met de naam uit `RTE_NAME`, type RTE, in de modus van de RTE, die zich met die referentie aanmeldt, gemarkeerd als **Wacht op goedkeuring**
   en uitgeschakeld. De beschrijving noemt de host waarvandaan hij het vroeg

Een uitgaande RTE blijft verbonden terwijl hij wacht, maar krijgt geen job. De app belt een inkomende RTE pas als hij is goedgekeurd. Beide loggen
dat ze wachten tot een admin ze goedkeurt onder **Verbindingen > Runners**, met de vingerafdruk van hun token.

Een inkomende RTE met een `RTE_URL` die met `https://` begint, stuurt bij het vragen om lid te worden ook zijn certificaat mee, en de app pint het: vanaf dan
belt de app die RTE alleen als hij hetzelfde certificaat presenteert, zodat een zelfondertekend certificaat werkt zonder CA (zie [Inkomend](../rte/modes.html#inbound)).

Er wachten maximaal 20 RTE's tegelijk op goedkeuring: meer worden geweigerd totdat er enkele zijn goedgekeurd of afgewezen. Een aanvraag die niemand binnen
24 uur afhandelt, wordt door de worker verwijderd, met haar referentie.

Een RTE met de naam van een runner die de app al kent, maar met een ander token, wordt geweigerd en vraagt niet om lid te worden. Geef hem het token van die runner,
of verwijder de runner zodat hij vraagt om lid te worden. Een [jointoken](#join-tokens) helpt alleen zolang die runner nog op goedkeuring wacht.

---

## Een RTE goedkeuren

De runners die op goedkeuring wachten, verdwijnen uit de lijst van **Verbindingen > Runners** naar een oranje melding erboven, zoals
**2 Runners wachten op goedkeuring**, met een regel per runner: de naam, host, het IP-adres, de modus, het adres en de vingerafdruk.
De bel in de kopbalk telt ze, voor de gebruikers die de runners kunnen zien (zie [de bel](../jobs/#the-jobs-page)).

Een klik op de melding opent het dialoogvenster **Goedkeuring beoordelen** voor elke runner om de beurt; een klik op een naam opent alleen die runner.
Zijn pagina toont dezelfde gegevens in een geel vak, **Deze RTE vraagt om lid te worden**. Controleer dat het er een is die je zelf hebt gestart voordat je hem goedkeurt:

| Veld | Wat het toont |
|---|---|
| Vingerafdruk | De eerste 8 hexadecimale cijfers van de SHA-256 van zijn `RTE_TOKEN`, als `abcd-ef12`. De RTE logt hem bij het starten, en het [installatieprogramma](../installation/installer.html#a-runner) drukt hem aan het einde af. Hij moet gelijk zijn |
| Vingerafdruk van het certificaat | In het dialoogvenster, voor een inkomende RTE via HTTPS: de eerste 8 hexadecimale cijfers van de SHA-256 van het certificaat dat de app pint (de DER-bytes), als `abcd-ef12`. De RTE logt hem bij het starten en het [installatieprogramma](../installation/installer.html#a-runner) drukt hem aan het einde af. Hij moet gelijk zijn |
| Host | De host waarop hij draait |
| IP-adres | Het adres van waaruit hij de app aanriep |
| Modus | Uitgaand of Inkomend |
| Uri | Het adres van een inkomende RTE, waar de app hem belt |
| Versie | Zijn release |
| Aangevraagd op | Wanneer hij vroeg om lid te worden |

**Goedkeuren** en **Afwijzen**, in het dialoogvenster of in het vak op zijn pagina, beslissen:

| Actie | Wat er gebeurt |
|---|---|
| Goedkeuren | De runner wordt ingeschakeld en krijgt vanaf nu jobs. Hij wordt de standaard van zijn type als er geen is |
| Afwijzen | De runner wordt met zijn referentie verwijderd, en zijn socket wordt gesloten. De RTE mag opnieuw vragen om lid te worden; hij wacht dan opnieuw op goedkeuring |

Alleen een admin keurt een RTE goed of wijst hem af.

---

## Jointokens

Een jointoken keurt een RTE meteen goed, voor onbeheerde installaties: een RTE die is gestart met
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), of een Runner die is geïnstalleerd met `--join` van het installatieprogramma, presenteert het één keer
en zijn runner wordt ingeschakeld toegevoegd, zonder te wachten. Jointokens hebben geen pagina in de interface: een admin maakt ze via de
[REST API](../api/), onder `/api/v2/runner`:

| Aanroep | Wat ze doet |
|---|---|
| `POST /api/v2/runner/jointoken` | Maakt een jointoken. De body bevat de `name`, en optioneel `expiresInHours` (geen: verloopt nooit) en `maxUses` (geen: een willekeurig aantal RTE's) |
| `GET /api/v2/runner/jointoken` | Toont de jointokens, de nieuwste eerst, met hun gebruik en of ze nog bruikbaar zijn; nooit de tokens zelf |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Trekt het in: het voegt geen runner meer toe, en blijft in de lijst staan |
| `DELETE /api/v2/runner/jointoken/<id>` | Verwijdert het |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

Het antwoord bevat het token, dat met `afj_` begint, deze ene keer: alleen de SHA-256 ervan wordt opgeslagen. Een RTE die het presenteert, krijgt dezelfde
referentie en runner als een RTE die [vraagt om lid te worden](#asking-to-join), ingeschakeld, en de beschrijving noemt het jointoken. Vanaf dan
meldt de RTE zich aan met zijn eigen token, zodat het jointoken kan verlopen of worden ingetrokken zonder dat dat hem raakt. Het intrekken of verwijderen van een jointoken
laat de runners staan die het heeft toegevoegd.

Een jointoken geeft een goedgekeurde runner nooit een nieuw token. Als er al een RTE-runner met die naam bestaat:

| De runner | Wat er gebeurt |
|---|---|
| Wacht op goedkeuring | Hij krijgt het nieuwe token in zijn referentie, en wacht nog steeds op de goedkeuring van een admin |
| Is goedgekeurd | Geweigerd met `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. Het jointoken wordt niet verbruikt |
| Komt uit de [configuratie-seed](../seed/) | Geweigerd: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Een RTE die opnieuw met een nieuw token is geïnstalleerd, meldt zich daarom aan met het token uit de referentie van zijn runner, of een admin wijzigt dat token
onder **Verbindingen > Inloggegevens**, of verwijdert de runner zodat de RTE als nieuwe lid wordt.

---

## Registratie in databasemodus

Een RTE in databasemodus, verouderd sinds 7.3.0, registreert zichzelf standaard, op zijn `RTE_URL` of anders op zijn eigen adres en poort. De
worker verwijdert zo'n runner zodra zijn RTE 10 minuten lang geen heartbeat heeft geschreven. Een runner die met de hand, door de configuratie-seed of door een
RTE in een socketmodus is toegevoegd, wordt nooit op die manier verwijderd.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), dat deze registratie in- of uitschakelt, is in 7.3.0 samen met
de databasemodus verouderd: een RTE in een socketmodus vraagt om lid te worden, of wordt lid met een jointoken. Om zulke runners in de tussentijd zelf te beheren, start je de
RTE met `RTE_REGISTER=0` en voeg je hem hier toe met type RTE, modus **Database (verouderd)**, en een RTE-referentie met zijn adres en hetzelfde
token. Zie [Modi](../rte/modes.html#database-deprecated) om hem naar een socketmodus te verplaatsen.

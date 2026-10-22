---
layout: default
title: Jobacties
parent: Jobs
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Jobacties
{: .no_toc }

Een job starten, afbreken, herstarten, goedkeuren of afwijzen, en verwijderen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Een job starten

Elke job begint bij een formulier. Open het vanaf de pagina **Formulieren**, vul de velden in en druk op **Verzenden**:

1. Het formulier wordt in de browser gevalideerd, en de veldwaarden worden naar de server gestuurd.
2. De server maakt de job aan en geeft zijn nummer terug; de [`onSubmit`](../forms/job-status-action.html)-acties van het formulier worden uitgevoerd.
3. De uitvoer van de job verschijnt onder het formulier en wordt elke twee seconden vernieuwd tot de job eindigt.

De job verschijnt ook op de pagina **Jobs**, waar je hem later kunt volgen.

### Wie een formulier kan starten

Een formulier wordt getoond, en kan worden gestart, voor gebruikers die een van de [rollen](../config/roles.html) uit zijn lijst `roles` hebben.
De rol `default`, die elke gebruiker heeft, maakt een formulier beschikbaar voor iedereen die kan aanmelden.

### Voordat je verzendt

De balk boven de velden biedt een paar hulpmiddelen, elk alleen zichtbaar als je rol het toestaat:

| Knop | Wat het doet | Roloptie |
|---|---|---|
| **Toon extravars** | Toont vooraf de extravars die de job krijgt, terwijl je de velden invult | `showExtraVars` |
| **verbose** | Voert de job uit in verbose-modus | `allowVerboseMode` |
| **Laden uit opslag** | Vult de velden vanuit een [opgeslagen job](stored-jobs.html) | `allowStoredJobs` |
| **Formulier herladen** | Laadt het formulier opnieuw, met de standaardwaarden | geen |

### Keuzes bij het starten

Een formulier kan zijn gebruikers bij het starten een paar Ansible-opties laten kiezen, door een veld met een gereserveerde naam te declareren. De
waarde van het veld gaat dan boven de eigen instelling van het formulier:

| Veldnaam | Overschrijft | Gebruikelijk veldtype |
|---|---|---|
| `__check__` | Check-modus, een proefrun die niets verandert | `checkbox` |
| `__diff__` | Diff-modus, die toont wat er zou veranderen | `checkbox` |
| `__limit__` | De hosts waarop het playbook draait | `text` of `enum` |
| `__tags__` | De tags die worden uitgevoerd | `text` of `enum` |
| `__inventory__` | De inventaris | `enum` |
| `__playbook__`, `__template__` | Het playbook, of de AWX- / AAP-sjabloon | `enum` |

Bijvoorbeeld een formulier dat een proefrun en een hostlimiet aanbiedt:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

De server accepteert deze namen alleen van een formulier dat ze als velden declareert, dus een start via de API kan ze niet
op eigen houtje toevoegen. De eigenschappen die ze overschrijven, staan beschreven bij [Ansible-formulieren](../forms/ansible.html) en [AWX-formulieren](../forms/awx.html).

### Wat een start kan tegenhouden

Een start wordt niet altijd meteen een lopende job:

* **Ongeldige velden** : het formulier wordt niet verzonden, en elk veld dat zijn validatie niet doorstaat, toont waarom.
* **Launch-validatie** : staat [launch-validatie](../launch-validation/) op `enforce`, dan controleert de server de waarden
  opnieuw en weigert hij een start die de regels van het formulier overtreedt.
* **Goedkeuring** : een formulier met een [goedkeuringspunt](../forms/approval.html) maakt de job aan, die dan wacht in status
  `approve`; zie [Een job goedkeuren of afwijzen](#approve-or-reject-a-job).

Wanneer de job eindigt, versturen de [meldingen](../forms/notifications.html) van het formulier hun mails en kanaalberichten, en worden zijn
acties bij jobstatus uitgevoerd.

### Andere manieren om een job te starten

Een formulier kan ook een job starten zonder dat iemand op **Verzenden** drukt:

| Gestart door | Hoe | Pagina |
|---|---|---|
| Later uitvoeren of een cron-schema | **Later uitvoeren (eenmalig)** of **Schedule (terugkerend)** naast **Verzenden** | [Planningen](schedules.html) |
| Een script of een pipeline | `POST /api/v2/job` met een API-token | [Jobs in de REST API](../api/jobs.html) |
| Een AI-agent | De tool `launch_job` van de MCP-server | [MCP-tools](../mcp/tools.html) |
| Een gesprek | De chatassistent vult het formulier in en start het | [Chatassistent](../chat/) |
| Een eerdere job | **Herstarten**, hieronder | [Een job herstarten](#relaunch-a-job) |

---

## Een job afbreken

**Afbreken** in het menu van de rij (⋮) in de lijst, of **Job afbreken** op de pagina van de job, stopt een job met status `running`. Na je bevestiging
markeert AnsibleForms de job om af te breken:

* **`ansible`**: de RTE stopt het playbookproces (met al zijn workers), en de job eindigt als `aborted` met
  `... was aborted by the operator`. Een job die nog op een vrije RTE wacht, wordt afgebroken voordat hij start.
* **Een sjabloonjob** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): AnsibleForms vraagt de runner de job te annuleren of te stoppen,
  en de job eindigt als `aborted`. Weigert de runner, dan toont de uitvoer `Abort request denied`, gevolgd door
  `reverting abort request`, en blijft de job draaien. Een Jenkins-build die nog in de wachtrij staat, wordt eruit gehaald.
* **`workflow`**: de lopende jobs van knooppunten worden afgebroken en er start niets meer (zie
  [Een workflow uitvoeren](../workflows/running.html#abort)).
* **`multistep`**: de stappen die nog niet zijn begonnen, worden overgeslagen (`skipping: [Abort is requested]`), en de hoofdjob
  eindigt als `aborted`. Een stap die al draait, is een eigen job: open hem en breek hem af om ook die te stoppen.

Je kunt je eigen jobs afbreken; een admin, of vanaf 7.3.0 een gebruiker van wie de rol `manageAllJobs` instelt, kan elke job afbreken. Met `showAllJobLogs` kan een
gebruiker de jobs van andere gebruikers zien, niet afbreken.

---

## Een job herstarten

**Herstarten** in het menu van de rij (⋮) in de lijst, of **Job herstarten** op de pagina van de job, start een nieuwe job vanuit een afgeronde job. Het wordt aangeboden bij elke
job die niet `running` is en niet op goedkeuring wacht, aan gebruikers van wie de rol de roloptie `allowJobRelaunch` instelt.

De dialoog biedt:

* **Herstarten**: voert de job opnieuw uit met de waarden waarmee hij draaide, als een nieuwe job op jouw naam.
* **Uitgebreide modus**: herstart in verbose-modus; getoond met de roloptie `allowVerboseMode`.
* **Waarden bewerken voor herstarten**, en daarna **Bewerken & herstarten**: opent het formulier vooraf ingevuld met de waarden van de job, zodat je
  ze kunt wijzigen voordat je verzendt.

Een herstart vereist ook dat het formulier het toestaat (`allowRelaunch`, standaard true) en dat de job **van jou** is, tenzij
je admin bent of, vanaf 7.3.0, `manageAllJobs` hebt; `showAllJobLogs`, waarmee je tot en met 7.2 elke job kon herstarten, kan dat niet meer. Hoe een herstart tegen de regels van het formulier wordt gecontroleerd, en waarom een formulier met een
wachtwoordveld hem kan weigeren, staat beschreven in [Opnieuw starten](../launch-validation/relaunching.html).

### Herstarten met vooraf ingevulde gegevens

**Bewerken & herstarten** opent het formulier met de URL-parameter `prefillJobId`, die je ook in een eigen link kunt gebruiken:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

Het formulier laadt de veldwaarden die bij job `61` zijn opgeslagen, en toont `Formulier vooraf ingevuld met de gegevens van de vorige job #61`.
Verzenden start een nieuwe job, gecontroleerd zoals elke andere start. Het vooraf invullen volgt dezelfde regels als een herstart:

* **Wachtwoordvelden worden nooit opgeslagen**, dus ze worden nooit vooraf ingevuld: voer ze opnieuw in. Constanten worden ook niet opgeslagen.
* De roloptie `allowJobRelaunch` is vereist, en de job moet van jou zijn (of je bent admin of hebt `manageAllJobs`).
* Een formulier met `allowRelaunch: false` kan niet worden herstart of vooraf ingevuld:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Een job van vóór de tijd dat de veldwaarden werden opgeslagen, kan niet vooraf worden ingevuld, en het formulier toont in plaats daarvan een fout:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Een job goedkeuren of afwijzen

Een job met een [goedkeuringspunt](../forms/approval.html) stopt in status `approve` en wacht. Hij staat op de pagina Jobs van
zijn goedkeurders, de gebruikers met een van de rollen van de goedkeuring, zodat zij hem kunnen vinden; vanaf 7.3.0 zien andere gebruikers hem niet meer.

**Goedkeuring beoordelen** wordt aangeboden aan admins en aan gebruikers met een van de rollen van de goedkeuring: een klik op de rij van de job,
**Goedkeuring beoordelen** in het menu van de rij, of de knop **Goedkeuring beoordelen** op de pagina van de job. De dialoog toont het bericht
van de goedkeuring, met de waarden van de job ingevuld (of een algemene regel als er geen bericht is), en het formulier, de job-id, wie hem startte en
wanneer, met een link naar de job; **Afwijzen** en **Goedkeuren** beantwoorden hem:

* **Goedkeuren**: de job gaat verder en zijn status wordt weer `running`.
* **Afwijzen**: de job eindigt als `rejected`, en zijn uitvoer vermeldt `rejected by <username>`.

Een job die op goedkeuring wacht, kan vanaf de pagina Jobs niet worden herstart of verwijderd; keur hem eerst goed of wijs hem af.

Vanaf 7.3.0 kan de gebruiker die een job startte hem niet goedkeuren, zodat er altijd een tweede persoon naar kijkt, al kan hij hem nog wel afwijzen om hem
in te trekken. Een admin kan altijd goedkeuren, ook zijn eigen jobs. Een formulier waarvan het goedkeuringspunt
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) instelt, laat degene die het startte zijn eigen job ook goedkeuren.

---

## Een job verwijderen

**Verwijderen** in het menu van de rij (⋮) in de lijst, of **Job verwijderen** op de pagina van de job, verwijdert na je bevestiging een job met zijn uitvoer.
Een multistep-job verwijderen verwijdert ook zijn stappen. Om meerdere jobs tegelijk te verwijderen, vink je ze aan in de eerste kolom van de lijst en
klik je op **Verwijderen (n)** erboven.

Je kunt je eigen jobs verwijderen. Admins en, vanaf 7.3.0, gebruikers met de roloptie `manageAllJobs` kunnen elke job verwijderen; met `showAllJobLogs`
kan dat niet meer. Een rol die `allowJobDeletion: false` instelt, verwijdert helemaal geen jobs, ook niet de eigen, zodat de jobgeschiedenis volledig blijft. Op de pagina
van de job is de knop verborgen terwijl de job draait of wordt afgebroken (behalve voor admins en `manageAllJobs`) en terwijl hij op goedkeuring wacht; in de lijst zijn het
menu-item en het selectievakje grijs voor een job die je niet kunt verwijderen.

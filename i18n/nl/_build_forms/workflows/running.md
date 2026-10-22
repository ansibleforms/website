---
layout: default
title: Een workflow uitvoeren
parent: Workflows
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
---

# Een workflow uitvoeren
{: .no_toc }

Start een workflow vanuit een formulier en volg hem op de jobspagina
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het formulier

Een formulier van [type `workflow`](../forms/workflow.html) start een workflow, aangeduid met `workflow:` zoals een playbook: via
zijn **bestand** in de map voor workflows, met de submappen (`team/deploy-app.yml`), of via de **naam** van de workflow in
het bestand (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

De velden van het formulier komen als extra vars bij elk knooppunt aan, en dat geldt ook voor zijn [`credentials`](../forms/workflow.html#workflow_credentials), onder de namen
die het formulier ze geeft, zoals die van een multistep-formulier bij zijn stappen aankomen:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

De eigen referenties van een knooppunt, ingesteld in het workflowbestand, komen onder hun eigen naam bij zijn playbook aan en winnen als beide dezelfde naam gebruiken. In het tabblad Visueel van een formulier in de ontwerper is **Workflow** een lijst van de
workflowbestanden van de ontwerper.

Een bestandsnaam alleen wordt ook in een submap gevonden, zolang maar één bestand die naam heeft. Twee workflows met dezelfde naam houden een formulier tegen dat
de workflow op naam aanduidt, en de ontwerper waarschuwt wanneer je de tweede opslaat: hernoem er een, of verwijs naar het bestand. Een workflow die niet
gevonden wordt, laat de job mislukken, met de reden in de uitvoer.

---

## De job

Een workflowjob draait op de AnsibleForms-server, en elk playbookknooppunt draait als een eigen job, een kind van de workflowjob,
zoals de stappen van een multistep-formulier: een playbook uit de ontwerper op de RTE, of, bij een knooppunt met een `runner:`, de
sjabloon of job van die runner op AWX, AAP, Ascender, Semaphore, Rundeck of Jenkins (zie [Waar een knooppunt draait](designer.html#where-a-node-runs)).

De pagina van de job tekent de workflow, live: elk knooppunt gekleurd naar zijn status, de koppelingen die afgingen en de knooppunten die niet
zullen draaien. De gegevens bovenaan noemen de workflow in plaats van een playbook.

- **Klik op een knooppunt** dat klaar is om de uitvoer in een dialoog te openen.
- **De uitvoer** bevat de uitvoer van elk knooppunt onder een banner `WORKFLOW NODE [identifier] (status)`, in de volgorde waarin de knooppunten
  klaar waren.
- **Toon extravars** en **Toon artifacts**, in de kop van elk knooppunt in de uitvoer en in de dialoog die je vanuit de graaf opent,
  tonen de eigen extravars en artifacts van dat knooppunt (`{}` als er geen zijn), als JSON of YAML, met een knop Kopiëren.

De extravars van een knooppunt bevatten wat de knooppunten ervoor doorgaven, en zijn artifacts wat zijn playbook met
`set_stats` verzamelde. De twee knoppen volgen de [rolopties](../config/roles.html#role-options) `showExtravars` en
`showArtifacts`. Dezelfde gegevens komen uit `GET /api/v2/job/{id}/node/{nodeId}`, voor iedereen die de job mag zien.

De job mislukt wanneer een knooppunt mislukte en niets dat opving, volgens de regel van AWX; anders slaagt hij.

---

## Goedkeuringen

Een goedkeuringsknooppunt houdt de workflowjob vast tot iemand antwoordt.

Bereikt de workflow een goedkeuringsknooppunt, dan wordt de status van de job **Wacht op goedkeuring**: dat zie je bij de bel en op de
pagina van de job, zoals bij een [goedkeuringspunt](../forms/approval.html) van een formulier. De naam van het knooppunt is de titel van de goedkeuring en de beschrijving
het bericht; de rest komt uit `approval` van het formulier:

- zijn `roles` bepalen wie hem kan goedkeuren of afwijzen, en `allowSelf` of degene die de job startte hem ook mag goedkeuren;
- naar zijn `notifications` en `channels` wordt het verzoek gestuurd.

Een workflowformulier zonder `approval` houdt de job nog steeds vast bij een goedkeuringsknooppunt, maar dan kan alleen een admin hem goedkeuren.

- **Goedgekeurd**: het knooppunt slaagt en de workflow gaat verder langs zijn *bij succes*-koppelingen.
- **Afgewezen**: het knooppunt mislukt en de workflow gaat verder langs zijn *bij fout*-koppelingen.
- **Verlopen**, na de time-out van het knooppunt zonder antwoord: ook dan mislukt het knooppunt.

---

## Afbreken

**Afbreken** op een lopende workflowjob stopt hem: de lopende jobs van knooppunten worden afgebroken, er start niets meer, en een goedkeuring waarop hij
wacht wordt geannuleerd. Ook een workflowjob die op een goedkeuring wacht, kun je afbreken.

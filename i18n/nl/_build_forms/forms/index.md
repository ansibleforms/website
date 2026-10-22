---
layout: default
title: Formulieren
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formulieren
{: .no_toc }

Definieer de formulieren die je gebruikers invullen
{: .fs-6 .fw-300 }

---

Voor formulierauteurs: hoe formulieren in YAML worden geschreven, waar ze vandaan worden geladen en de eigenschappen van elk formuliertype.

Formulieren vormen de kern van AnsibleForms. Elk formulier is een webinterface die invoer van de gebruiker verzamelt en met die gegevens een
Ansible-playbook uitvoert, een sjabloon van AWX, AAP of Ascender, een sjabloon van Semaphore, een job van Rundeck of Jenkins, of een
[workflow](../workflows/).

Formulieren worden gedefinieerd in YAML-bestanden in de formulierenmap. Elk YAML-bestand bevat één formulier of een lijst met formulieren, en je kunt submappen gebruiken om ze te ordenen.

**VIDEO**: [Je eerste formulier maken](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## De opbouw van een formulier

Elk formulier in AnsibleForms wordt geconfigureerd met een reeks eigenschappen. **[Gemeenschappelijke eigenschappen](common.html)** somt de eigenschappen op die voor alle formuliertypen gelden; de pagina's per type beschrijven de extra eigenschappen.

---

## Hoe formulieren worden geladen

AnsibleForms laadt formulieren vanaf de volgende locaties:

1. **UIT REPOSITORIES** : alle repositories waarbij de schakelaar "Gebruiken voor formulieren?" aanstaat (meerdere repositories worden ondersteund)
   - Formulieren uit alle ingeschakelde repositories worden automatisch samengevoegd.
   - In elke repository wordt eerst gezocht naar een submap `forms/`.
   - Bestaat er geen submap `forms/`, dan wordt de root van de repository gebruikt.
   - Formulieren die in de ontwerper zijn gemaakt en nog niet zijn gepusht, worden bewaard in een stagingmap
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) en samen met de andere geladen.

2. **UIT DE LOKALE MAP** : de lokale map `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), wanneer bij geen enkele repository "Gebruiken voor formulieren?" aanstaat

{: .warning }
> **Let op:** staat "Gebruiken voor formulieren?" bij meerdere repositories aan, dan worden al hun formulieren samengevoegd. Formuliernamen moeten over alle repositories heen uniek zijn om conflicten te voorkomen.

---

## Waar een formulier draait

Het type van een formulier bepaalt op wat voor [runner](../runners.html) zijn job draait: een RTE voor `ansible`, een AWX-runner voor `awx`,
`aap` en `ascender`, en een runner van het eigen type voor `semaphore`, `rundeck` en `jenkins`.

- `runner: <name>` op het formulier kiest op naam een runner van dat type; zonder die sleutel draait de job op de standaardrunner van het type.
- Een runner die onder **Verbindingen > Runners** is uitgeschakeld, laat de job mislukken, of het formulier hem nu noemt of hij de standaard is. De job
  valt nooit terug op een andere runner.
- Wanneer een van de rollen van de gebruiker `runners` opsomt in `config.yaml`, mag de job alleen draaien op een runner die zo'n rol opsomt; anders wordt hij
  geweigerd. Rollen zonder die lijst beperken het niet, en een admin wordt nooit beperkt.

---

## In deze sectie

De volgende pagina's beschrijven de eigenschappen van formulieren in detail:

| Pagina | Wat er aan bod komt |
|---|---|
| [Gemeenschappelijke eigenschappen](common.html) | Eigenschappen die voor alle formuliertypen gelden (`name`, `description`, `help`, `type`, `fields`) |
| [Ansible-formulieren](ansible.html) | Eigenschappen specifiek voor `type: ansible` |
| [AWX-formulieren](awx.html) | Eigenschappen specifiek voor `type: awx` |
| [Semaphore-formulieren](semaphore.html) | Eigenschappen specifiek voor `type: semaphore`, dat een sjabloon van Semaphore uitvoert |
| [Rundeck-formulieren](rundeck.html) | Eigenschappen specifiek voor `type: rundeck`, dat een job van Rundeck uitvoert |
| [Jenkins-formulieren](jenkins.html) | Eigenschappen specifiek voor `type: jenkins`, dat een job van Jenkins bouwt |
| [Multistep-formulieren](multistep.html) | Eigenschappen specifiek voor `type: multistep`, verouderd ten gunste van `workflow` |
| [Workflowformulieren](workflow.html) | Eigenschappen specifiek voor `type: workflow`, dat een [workflow](../workflows/) uitvoert |
| [Wizard](wizard.html) | De invoer van een formulier over meerdere pagina's verdelen (werkt bovenop elk uitvoerbaar formuliertype) |
| [Subformulier](subform.html) | Subformulieren gebruiken alleen de gemeenschappelijke eigenschappen |
| [Goedkeuringspunten](approval.html) | Een job stilzetten tot hij is goedgekeurd (`approval`) |
| [Meldingen](notifications.html) | E-mails en kanaalberichten versturen bij jobstatussen of gebeurtenissen (`notifications`) |
| [Acties bij jobstatus](job-status-action.html) | Iets doen op het formulier wanneer een job van status verandert (`onSubmit`, `onSuccess`, ...) |

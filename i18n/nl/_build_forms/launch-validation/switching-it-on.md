---
layout: default
title: Inschakelen
parent: Launch-validatie
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Inschakelen
{: .no_toc }

Voor de hele instantie, of voor één formulier
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Launch-validatie heeft twee instellingen. **De strengste van de twee geldt.**

---

## Voor de hele instantie: `LAUNCH_VALIDATION`

De omgevingsvariabele [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) geldt voor elk formulier:

- `off` - geen controle aan de serverkant: de job draait met de extravars die de browser of de aanroeper stuurde.
- `log` - elke start wordt gecontroleerd; wat geweigerd zou worden, wordt als waarschuwing in het log
  geschreven, en de start draait nog net als voorheen.
- `enforce` (standaard) - een ongeldige start wordt geweigerd, en een geldige start draait met de extravars die de
  server opbouwt.

Een lege of onbekende waarde betekent ook `enforce`. Wijzigingen gaan in zonder herstart.

{: .warning }
> **Upgraden verandert het gedrag.** Een instantie die `LAUNCH_VALIDATION` niet instelt, dwingt na de upgrade
> elke start af. Scripts die `POST /api/v2/job` aanroepen zonder `rawFormData`,
> of met waarden die de regels van een formulier overtreden, worden geweigerd met een `422`. Stel
> `LAUNCH_VALIDATION=log` in vóór het upgraden om te zien wat geweigerd zou worden, of `off` om het
> oude gedrag te behouden (zie [Uitrollen](rolling-it-out.html)).

---

## Voor één formulier: `launchValidation`

Een formulier kan zijn eigen niveau instellen:

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Gebruik deze instelling op een instantie die op `off` of `log` draait, voor een formulier waarvan je weet dat het
via REST wordt gestart: dat formulier wordt afgedwongen, de rest van de instantie niet. Het kan ook in de ontwerper worden ingesteld, in de
formulierinstellingen.

**Een formulier kan strenger worden gemaakt dan de instantie, nooit soepeler.** Staat `LAUNCH_VALIDATION`
op `enforce`, dan heeft `launchValidation: off` van een formulier geen effect: een formulier kan
de beslissing van een beheerder niet terzijde schuiven.

Wizardformulieren gebruiken het ook: een wizardstart wordt stap voor stap gecontroleerd, elke stap tegen zijn eigen
subformulier (zie [Wizardformulieren](rolling-it-out.html#wizard-forms)).

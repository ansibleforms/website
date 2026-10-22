---
layout: default
title: Opgeslagen jobs
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c4e55de429d31936d8735965a2f487c070b9140d
---

# Opgeslagen jobs
{: .no_toc }

De gegevens van een formulier bewaren om ze later weer te laden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Opgeslagen jobs

Opgeslagen jobs bewaren de waarden van een formulier, zodat je ze opnieuw kunt laden in plaats van elke keer dezelfde velden in te vullen.

Om op te slaan vul je het formulier in, open je de keuzelijst naast **Verzenden** en kies je **Store**. Vul in **Formuliergegevens opslaan** een
**Naam**, een optionele **Beschrijving** en een datum bij **Verloopt op (optioneel)** in, en sla op. Wachtwoord- en constante velden worden
nooit opgeslagen. Een subformulier heeft dezelfde actie **Store** naast zijn knop **Opslaan**, en bewaart onvoltooide waarden zonder
ze te valideren.

Om te laden kies je **Laden uit opslag** bovenaan het formulier. **Opgeslagen formulier laden** toont je opgeslagen jobs voor dat formulier, met
hun aanmaak- en vervaldatum; kies er een om het formulier met de waarden ervan te vullen. Er draait niets tot je verzendt.

Opgeslagen jobs worden bewaard in de database van AnsibleForms (tabel `stored_jobs`), met de naam van het formulier, je gebruiker als
`<type>/<username>` (bijvoorbeeld `local/admin`) en de waarden als JSON. Een naam moet uniek zijn per gebruiker en formulier; een tweede
met dezelfde naam opslaan mislukt met "Er bestaat al een opgeslagen formulier met deze naam".

---

## Opgeslagen jobs beheren

De pagina **Opgeslagen invoer** toont de opgeslagen jobs met hun formulier, gebruiker, aanmaak- en vervaldatum, en vereist `allowStoredJobs`.

- **Bewerken** opent de eigen pagina van de opgeslagen job: de **Details** (naam, formulier, vervaldatum) en de **Waarden**, de opgeslagen
  veldwaarden als YAML, die je daar kunt wijzigen en opslaan.
- **Openen in formulier** opent het formulier met de opgeslagen waarden ingevuld; er draait niets tot je verzendt.
- **Verwijderen** verwijdert hem. Je kunt je eigen opgeslagen jobs verwijderen; gebruikers met `showSettings` kunnen er elke verwijderen.
- Opgeslagen jobs met een datum bij **Verloopt op** in het verleden worden elke dag om 04:00 (in `LOG_TZ`) automatisch verwijderd.

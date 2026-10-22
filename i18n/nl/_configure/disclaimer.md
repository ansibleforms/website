---
layout: default
title: Disclaimer
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: a22b56db001904583c51e6bd28f1281737f32a32
---

# Disclaimer
{: .no_toc }

Voorwaarden die elke gebruiker één keer accepteert voordat hij de app gebruikt, vastgelegd met wie welke versie wanneer accepteerde
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: vraag elke gebruiker gebruiksvoorwaarden te accepteren, onder **Instellingen > Toegang > Disclaimer**, met de rolinstelling `showSettings`.

Vanaf 7.3.0 toont de pagina elke versie van de disclaimer, en opent elke versie op een eigen pagina met haar acceptaties.
Tot en met 7.2 had de pagina in plaats daarvan drie tabbladen (**Algemeen**, **Versies** en **Acceptaties**); de upgrade behoudt elke versie.

---

## In deze sectie

| Pagina | Wat er aan bod komt |
|---|---|
| [Algemeen](disclaimer/general.html) | De lijst met versies, er een toevoegen, en de versie inschakelen die gebruikers accepteren |
| [Versies](disclaimer/versions.html) | De pagina van een versie, en de tekst wijzigen als correctie of opnieuw voor iedereen |
| [Acceptaties](disclaimer/acceptances.html) | Wie welke versie accepteerde, en gekozen gebruikers opnieuw vragen |


---

## Wat gebruikers zien

Met een ingeschakelde versie krijgt elke gebruiker die zich aanmeldt haar vóór al het andere in een dialoogvenster, admins inbegrepen:

1. Ze lezen de titel en de tekst.
2. Ze vinken het selectievakje aan en klikken op **Accepteren**. **Weigeren**, in rood, meldt ze in plaats daarvan af.

Vanaf 7.3.0 is de pagina achter het dialoogvenster vervaagd totdat ze antwoorden.

Een gebruiker accepteert elke versie één keer: bij de volgende aanmelding wordt het niet opnieuw gevraagd, alleen als er een nieuwe versie komt, als
een admin een gewijzigde tekst opslaat met [Iedereen opnieuw vragen](disclaimer/versions.html#changing-the-text), of als een admin
[Opnieuw vragen](disclaimer/acceptances.html#asking-users-again) op hun acceptatie gebruikt.

Totdat ze accepteren, beantwoordt de API elke aanroep van hun sessie met status `403` en de code `disclaimer_required`,
behalve de aanroepen onder `/api/v2/disclaimer` en `/api/v2/profile`, en de live events die de browser volgt.
Een [API-token](profile/api-token.html) wordt het nooit gevraagd, omdat een script niemand heeft die kan klikken.


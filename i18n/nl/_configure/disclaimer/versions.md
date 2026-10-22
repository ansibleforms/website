---
layout: default
title: Versies
parent: Disclaimer
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versies
{: .no_toc }

De pagina van een versie, en de tekst wijzigen als correctie of opnieuw voor iedereen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De pagina van een versie

Vanaf 7.3.0 heeft elke versie een eigen pagina, op `/settings/disclaimer/<version>`, met twee tabbladen:

| Tabblad | Wat het bevat |
|---|---|
| **Details** | De titel, de tekst en het label van het selectievakje, en de schakelaar **Ingeschakeld**, die meteen wordt opgeslagen |
| **Acceptaties** | Wie deze versie accepteerde, zie [Acceptaties](acceptances.html) |

**Voorbeeld** toont het dialoogvenster zoals gebruikers het zullen zien, en **Verwijderen** verwijdert de versie met haar acceptaties. Het zoekvak boven de
tabbladen doorzoekt beide tegelijk: de overeenkomende velden onder **Details** en de overeenkomende rijen onder **Acceptaties**.

---

## De tekst wijzigen

**Opslaan** van een gewijzigde titel, tekst of label van het selectievakje dat gebruikers al accepteerden, vraagt **Iedereen opnieuw vragen?**:

| Antwoord | Wat er gebeurt |
|---|---|
| **Iedereen opnieuw vragen** | De acceptaties van deze versie worden gewist, en elke gebruiker accepteert haar opnieuw bij zijn volgende verzoek |
| **Houden als correctie** | De tekst wordt herschreven, bijvoorbeeld voor een typfout, en de acceptaties blijven gelden: niemand wordt opnieuw gevraagd |

Een versie die nog niemand accepteerde, wordt opgeslagen zonder te vragen. Om de geaccepteerde tekst te behouden, [voeg je een nieuwe versie toe](general.html#adding-a-version) en schakel je die in.

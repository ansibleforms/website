---
layout: default
title: Overzicht
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Beveiligingsbeoordeling
{: .no_toc }

Voor beveiligingsreviews: maatregelen, ontwikkeling en advisories
{: .fs-6 .fw-300 }

---

## In het kort

AnsibleForms voert playbooks uit en beheert hun inloggegevens, dus het maakt deel uit van je vertrouwensketen:

* Het is **self-hosted**: het draait op je eigen infrastructuur, bewaart zijn gegevens in je eigen database en stuurt niets naar de makers.
* Het is **open source** (GPL-3.0): de code, de pipelines en elke advisory zijn openbaar.
* Elk opgeslagen geheim is **versleuteld**, elke wijziging wordt **geaudit** en **rollen** worden bij elk verzoek gecontroleerd.
* Kwetsbaarheden worden **vertrouwelijk gemeld**, in elke ondersteunde release opgelost en **gepubliceerd**.

---

## In deze sectie

De pagina's beantwoorden de vragen van een beveiligingsreview, van het ontwerp tot de lijst met CVE's:

| Pagina | Wat er aan bod komt |
|---|---|
| [Beveiligingsmaatregelen](measures.html) | Aanmelden, rechten, opgeslagen geheimen, de audittrail, de browser, de server, verbindingen en containers |
| [Veilige ontwikkeling](development.html) | Hoe een wijziging wordt gereviewd en getest, analyse van code en afhankelijkheden, hoe images worden gebouwd, ondersteunde versies |
| [Een kwetsbaarheid melden](reporting.html) | Hoe je een probleem vertrouwelijk meldt, en wat er daarna gebeurt |
| [Beveiligingsadvisories](advisories.html) | Elke gepubliceerde kwetsbaarheid, met CVE, ernst en de versie met de oplossing |
| [Veelgestelde vragen bij een beoordeling](faq.html) | Korte antwoorden op de vragen die beveiligingsvragenlijsten het vaakst stellen |

Wil je een instantie beveiligen in plaats van beoordelen, zie dan [Beveiliging](../security/) in de handleiding voor beheerders.

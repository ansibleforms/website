---
layout: default
title: Wat is AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Wat is AnsibleForms
{: .no_toc }

Selfserviceformulieren voor Ansible en AWX, en wanneer je ze nodig hebt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wat het doet

AnsibleForms zet een webformulier voor een playbook, een workflow, of een template of job op AWX, AAP, Ascender, Semaphore, Rundeck
of Jenkins, zodat mensen automatisering kunnen uitvoeren zonder de commandoregel.

Een formulier verzamelt de invoer, controleert die, giet haar in extravars en start de job. De gegevens in een formulier kunnen uit databases,
REST API's, bestanden en andere velden komen, en elke start wordt met zijn uitvoer vastgelegd in de jobgeschiedenis.

---

## Typisch gebruik

Teams gebruiken AnsibleForms om routinematige automatisering over te dragen aan de mensen die erom vragen:

* **Selfserviceverzoeken** : een virtuele machine, een opslagvolume, een share of een gebruikersaccount, ingevuld door de aanvrager
* **Bewaakte handelingen** : acties met goedkeuringspunten, zodat een tweede persoon tekent voordat de job draait
* **Keuzes op basis van gegevens** : keuzelijsten gevuld vanuit een CMDB, een database of een REST API, trapsgewijs van het ene veld naar het volgende
* **Terugkerende jobs** : formulieren die later of volgens een cron-planning draaien, elke keer met dezelfde gevalideerde invoer
* **Automatisering voor tools en agents** : de REST API, de MCP-server en de chat-assistent starten dezelfde formulieren

---

## AnsibleForms of AWX-surveys?

AWX, AAP en Ascender hebben eigen surveys. Welke past, hangt af van wat de mensen die de jobs starten nodig hebben.

Een **survey** volstaat als:

* de vragen vastliggen: tekst, getallen, wachtwoorden en keuzes uit een statische lijst
* de gebruikers al in AWX, AAP of Ascender werken, en de rechten daarvan bij hen passen
* je geen extra applicatie en database wilt draaien en onderhouden

**AnsibleForms** helpt als:

* de keuzes ergens anders vandaan komen: een database, een REST API, een bestand, of een ander veld (trapsgewijze keuzelijsten)
* de invoer validatie, structuur (lijsten, geneste objecten) of berekende waarden nodig heeft voordat ze het playbook bereikt
* de jobs goedkeuringspunten, planning, of een workflow nodig hebben die playbooks, templates en goedkeuringen vanuit één formulier aan elkaar rijgt
* de gebruikers AWX helemaal niet moeten zien, of je ook playbooks zonder AWX draait

AnsibleForms start templates van AWX, AAP en Ascender, dus de twee werken samen: de formulieren verzamelen en vormen de invoer, en
AWX blijft de jobs draaien.

---

## Waar verder

De rest van deze sectie legt de onderdelen uit voordat je installeert:

| Pagina | Wat het behandelt |
|---|---|
| [Hoe het werkt](how-it-works.html) | De architectuur, de stappen van een start, en waar gegevens worden bewaard |
| [Rondleiding door de interface](gui/) | Schermafbeeldingen van elk scherm, van het aanmelden tot de beheerpagina's |
| [Begrippen](concepts.html) | De termen die in deze documentatie worden gebruikt |
| [Vereisten](prerequisites.html) | Wat je nodig hebt voordat je installeert |

---
layout: default
title: Begrippen
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Begrippen
{: .no_toc }

De termen die in deze documentatie worden gebruikt, elk gelinkt aan de eigen pagina
{: .fs-6 .fw-300 }

---

## Woordenlijst

De termen die in deze documentatie worden gebruikt:

| Term | Betekenis |
|---|---|
| **[Formulier](forms/)** | Een YAML-definitie die invoer verzamelt en een playbook, een template of een workflow uitvoert |
| **[Formulierveld](formfields/)** | Eén invoer van een formulier, zoals `text`, `enum` of `checkbox`; de waarde ervan wordt een extravar |
| **[Categorie](config/categories.html)** | Een groep in de boom met formulieren op de pagina Formulieren, gedefinieerd in `config.yaml` |
| **[Rol](config/roles.html)** | Een set gebruikers en groepen; een formulier noemt de rollen die het mogen zien en uitvoeren, `default` voor iedereen |
| **[Expressie](expressions/)** | JavaScript dat een veldwaarde berekent, in de browser (`runLocal: true`) of op de server |
| **[Extravars](formfields/)** | De variabelen die naar het playbook of de template worden gestuurd, opgebouwd uit de veldwaarden |
| **[Referentie](expressions/credentials.html)** | Een opgeslagen login, versleuteld met `ENCRYPTION_SECRET`: een gebruiker en wachtwoord (en host, poort, database), of sinds 7.3.0 het adres en de secrets van een LDAP-directory, een SSO-provider, een runner of een HashiCorp Vault |
| **[Secret store](secret-stores/)** | Een verbinding met HashiCorp Vault of CyberArk die de gebruiker en het wachtwoord van een referentie levert |
| **[Job](gui/forms-and-jobs.html)** | Eén run van een formulier, met zijn status, extravars en uitvoer, bewaard in de jobgeschiedenis |
| **[Runner](runners.html)** | Waar een job draait, toegevoegd onder **Verbindingen > Runners**: `rte` voor playbooks, `awx` (AWX, of de varianten `aap` of `ascender`), `semaphore`, `rundeck` of `jenkins` voor templates en jobs. Een formulier kiest er een met `runner:`, of draait op de standaardrunner `rte` (playbooks) of `awx` (templates) |
| **[RTE](rte/)** | Een runtime-omgeving: de AnsibleForms-server gestart met `AF_ROLE=rte` in een eigen container, naast python en ansible, die de playbooks uitvoert van een runner van het type `rte` |
| **[Goedkeuringspunt](forms/approval.html)** | Een pauze in een job tot een gebruiker met een goedkeuringsrol hem goedkeurt of afwijst |
| **[Workflow](workflows/)** | Een graaf van playbooks, goedkeuringen en andere workflows, gekoppeld bij succes, bij fout of altijd, in de syntaxis van AWX |
| **[Multistep-formulier](forms/multistep.html)** | Verouderd sinds 7: een formulier dat meerdere playbooks of templates na elkaar uitvoert; een workflow vervangt het |
| **[Meldingskanaal](notification-channels.html)** | Een mailserver, een Slack- of Teams-webhook, een Telegram-chat of een webhook waar meldingen en goedkeuringsverzoeken naartoe gaan |
| **[Designer](designer/)** | De browsereditor voor formulieren, playbooks, inventories en workflows, die door één persoon tegelijk wordt gebruikt |
| **[Subform](forms/subform.html)** | Een herbruikbare set velden die de rijen van een veld `list` of het object van een veld `yaml` beschrijft |
| **[config.yaml](config/)** | Het bestand met de categorieën, de rollen en de constanten; de formulieren staan in eigen bestanden |
| **[Config seed](seed/)** | Een YAML-bestand (`CONFIG_SEED_PATH`) dat de beheerobjecten declareert, zoals runners en referenties |
| **[Persistente map](customization/paths.html)** | De map met de bestanden die AnsibleForms moet bewaren over herstarts en upgrades heen |

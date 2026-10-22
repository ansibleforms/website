---
layout: default
title: Actualització
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Actualització
{: .no_toc }

Porta AnsibleForms a una versió més nova
{: .fs-6 .fw-300 }

---

Per als administradors d'una instància en marxa: passa a una versió més nova, amb el mateix mètode amb què la vas instal·lar.

---

## En aquesta secció

El procediment d'actualització depèn de com vas instal·lar AnsibleForms. Cada mètode es descriu a la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Actualitzar a la v7](../upgrade-7.html) | Què cal canviar mentre encara ets a la 6.5, abans de passar a la 7 |
| [Amb l'instal·lador](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, per a una instal·lació feta amb l'instal·lador: còpia de seguretat, notes de la versió i marxa enrere |
| [Docker](docker.html) | Baixa la imatge nova i torna a crear el contenidor amb la mateixa configuració |
| [Docker Compose](docker-compose.html) | Baixa la imatge nova i reinicia el projecte de docker-compose |
| [Des del codi font](from-source.html) | Baixa el codi nou, torna'l a compilar i reinicia l'aplicació |
| [Kubernetes](kubernetes.html) | Actualitza el repositori del chart i executa `helm upgrade` amb els teus valors |

{: .note }
> **Primer, una còpia de seguretat** Fes una còpia de seguretat abans d'actualitzar (**Configuració → Còpies de seguretat**). L'esquema de la base de dades s'actualitza en el primer
> inici de la versió nova, així que la còpia de seguretat és el teu punt de retorn si alguna cosa va malament. Des de la 7.3.0 el worker també en fa
> una ell mateix abans d'actualitzar des d'una versió anterior, amb el nom de la versió, tret que
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) sigui `0`.

La versió que reps depèn de l'etiqueta d'imatge que executes: `latest` segueix la versió major més nova, mentre que una etiqueta com ara `7`
es queda en aquella versió major. Totes les etiquetes es llisten a [Etiquetes d'imatge](../installation/#image-tags).

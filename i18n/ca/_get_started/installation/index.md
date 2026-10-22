---
layout: default
title: Instal·lació
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Instal·lació
{: .no_toc }

Tria un mètode d'instal·lació per a AnsibleForms
{: .fs-6 .fw-300 }

---

Per als administradors que posen en marxa una instància nova: tria un mètode d'instal·lació i després segueix-ne la pàgina.

---

## En aquesta secció

AnsibleForms admet diversos mètodes d'instal·lació, cadascun descrit a la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Instal·lador](installer.html) | Una sola ordre que instal·la un controlador o un Runner a Docker, Podman, Kubernetes o de manera nativa, i després l'actualitza i en fa còpies de seguretat |
| [Nativa](native.html) | La instal·lació de l'instal·lador sense contenidors: Node.js, MariaDB i Ansible al servidor, AnsibleForms com a serveis de systemd |
| [Docker](docker.html) | Instal·la MySQL i executa la imatge de Docker precompilada amb les variables d'entorn necessàries |
| [Docker Compose](docker-compose.html) | Baixa el [projecte de docker-compose](https://github.com/ansibleforms/docker) i fes servir docker-compose per iniciar alhora MySQL i AnsibleForms |
| [Des del codi font](from-source.html) | Instal·la totes les dependències a mà, i després compila i inicia el codi |
| [Kubernetes](kubernetes.html) | Instal·la el chart de Helm i fes servir Kubernetes per iniciar AnsibleForms i la seva base de dades MySQL |

{: .note }
> **Recomanació** L'instal·lador, des de la 7.3.0, és la manera més ràpida de tenir una instància en marxa: configura el projecte de Docker Compose a
> Docker o Podman, o un dels altres mètodes, a partir d'unes quantes preguntes. Les imatges de Docker inclouen totes les dependències.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Per passar una instal·lació existent a una versió més nova, consulta [Actualització](../upgrading/).

Cada mètode executa un RTE al costat de l'aplicació, el contenidor (o servei) que executa els playbooks. Per afegir-ne un altre, en un altre host o en un altre
centre de dades, instal·la un Runner amb l'[instal·lador](installer.html#a-runner): truca a AnsibleForms a través d'un WebSocket (outbound, consulta
[Modes](../rte/modes.html)) i no té credencials de la base de dades. Consulta també [Entorns d'execució](../rte/) i el seu runbook
[Un RTE en un altre centre de dades](../rte/another-datacenter.html).

---

## Etiquetes d'imatge

La imatge es publica com a `ghcr.io/ansibleforms/ansibleforms` al GitHub Container Registry, que pertany al
projecte i no limita les baixades anònimes. Totes les versions a partir de la 7.0.0 només es publiquen allà, i les versions 6.x
també hi són.

Des de la 7, els playbooks s'executen en un RTE, publicat en tres capes al costat de l'aplicació (consulta [Les imatges de l'RTE](../rte/images.html)):

| Imatge | Què és |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | L'aplicació web i l'API, sense python ni ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | L'RTE sense python ni ansible: la base per a la teva |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base amb python, ansible-core i unes quantes biblioteques: la que has de fer servir per afegir-hi les teves col·leccions |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | El core amb el paquet `ansible`, les seves col·leccions i biblioteques: l'RTE predeterminat |

Les quatre imatges es construeixen en la mateixa execució i porten les mateixes etiquetes, així que una etiqueta de l'RTE sempre coincideix amb la de l'aplicació.

L'antic repositori de Docker Hub, `ansibleguy/ansibleforms`, ja no s'actualitza. Conserva les seves
versions existents, però no rep versions noves de cap de les dues línies. Si hi fas pull, canvia
a `ghcr.io/ansibleforms/ansibleforms` amb la mateixa etiqueta per continuar rebent actualitzacions.

Les etiquetes següents estan disponibles a cada imatge; les imatges de l'RTE comencen a la 7.0.0, així que no tenen etiquetes 6.x:

| Etiqueta | Apunta a |
|---|---|
| `latest` | la versió més nova de la versió major més nova |
| `7`, `6` | la versió més nova d'aquella versió major |
| `7.0`, `6.5` | la versió més nova d'aquella versió menor |
| `7.0.0`, `6.5.5` | exactament aquella versió |
| `latest-rc` | la release candidate més nova, o la versió més nova quan és més recent; cada candidata també té la seva pròpia etiqueta |

`latest` només avança: un pedaç per a una versió major més antiga (per exemple una 6.5.x publicada
després de la 7.0.0) mou `6` i `6.5`, però mai `latest`.

Per quedar-te en una versió major, fes servir el seu número (`6`) en lloc de `latest`.

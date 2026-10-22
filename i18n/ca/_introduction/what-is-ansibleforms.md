---
layout: default
title: Què és AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Què és AnsibleForms
{: .no_toc }

Formularis d'autoservei davant d'Ansible i AWX, i quan els necessites
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Què fa

AnsibleForms posa un formulari web davant d'un playbook, un workflow, o una plantilla o un job a AWX, AAP, Ascender, Semaphore, Rundeck
o Jenkins, perquè la gent pugui executar automatitzacions sense la línia d'ordres.

Un formulari recull les dades, les comprova, les converteix en extravars i llança la tasca. Les dades d'un formulari poden venir de bases de dades,
API REST, fitxers i altres camps, i cada llançament queda registrat a l'historial de tasques amb la seva sortida.

---

## Usos habituals

Els equips fan servir AnsibleForms per posar l'automatització rutinària en mans de qui la sol·licita:

* **Sol·licituds d'autoservei** : una màquina virtual, un volum d'emmagatzematge, un recurs compartit o un compte d'usuari, emplenats per qui els sol·licita
* **Operacions protegides** : accions amb punts d'aprovació, perquè una segona persona doni el vistiplau abans que s'executi la tasca
* **Opcions basades en dades** : desplegables emplenats des d'una CMDB, una base de dades o una API REST, encadenats d'un camp al següent
* **Tasques recurrents** : formularis executats més tard o segons una programació cron, amb les mateixes dades validades cada vegada
* **Automatització per a eines i agents** : l'API REST, el servidor MCP i l'assistent de xat llancen els mateixos formularis

---

## AnsibleForms o enquestes d'AWX?

AWX, AAP i Ascender tenen les seves pròpies enquestes (surveys). Quina encaixa millor depèn del que necessitin les persones que llancen les tasques.

Una **enquesta** és suficient quan:

* les preguntes són fixes: text, números, contrasenyes i opcions d'una llista estàtica
* els usuaris ja treballen a AWX, AAP o Ascender, i els seus permisos els serveixen
* no vols executar i mantenir una altra aplicació i una altra base de dades

**AnsibleForms** ajuda quan:

* les opcions vénen d'un altre lloc: una base de dades, una API REST, un fitxer o un altre camp (desplegables encadenats)
* les dades necessiten validació, estructura (llistes, objectes niats) o valors calculats abans d'arribar al playbook
* les tasques necessiten punts d'aprovació, programació o un workflow que encadeni playbooks, plantilles i aprovacions des d'un sol formulari
* els usuaris no haurien de veure AWX en absolut, o també executes playbooks sense AWX

AnsibleForms llança plantilles d'AWX, AAP i Ascender, així que tots dos treballen junts: els formularis recullen les dades i les donen forma, i
AWX continua executant les tasques.

---

## Passos següents

La resta d'aquesta secció explica les peces abans d'instal·lar:

| Pàgina | Què tracta |
|---|---|
| [Com funciona](how-it-works.html) | L'arquitectura, els passos d'un llançament i on es desen les dades |
| [Recorregut per la interfície](gui/) | Captures de totes les pantalles, des de l'inici de sessió fins a les pàgines d'administració |
| [Conceptes](concepts.html) | Els termes que es fan servir en aquesta documentació |
| [Requisits previs](prerequisites.html) | El que necessites abans d'instal·lar |

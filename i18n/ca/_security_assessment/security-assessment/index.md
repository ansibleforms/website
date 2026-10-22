---
layout: default
title: Visió general
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Avaluació de seguretat
{: .no_toc }

Per a revisions de seguretat: mesures, desenvolupament i avisos
{: .fs-6 .fw-300 }

---

## En resum

AnsibleForms executa playbooks i en guarda les credencials, de manera que forma part de la teva cadena de confiança:

* És **autoallotjat**: s'executa a la teva infraestructura, desa les dades a la teva base de dades i no envia res als seus creadors.
* És de **codi obert** (GPL-3.0): el codi, els seus pipelines i tots els avisos són públics.
* Tots els secrets desats estan **xifrats**, tots els canvis queden **auditats**, i els **rols** es comproven a cada petició.
* Les vulnerabilitats es **comuniquen en privat**, es corregeixen a totes les versions amb suport i es **publiquen**.

---

## En aquesta secció

Les pàgines responen les preguntes d'una revisió de seguretat, des del disseny fins a la llista de CVE:

| Pàgina | Què tracta |
|---|---|
| [Mesures de seguretat](measures.html) | Inici de sessió, permisos, secrets desats, el registre d'auditoria, el navegador, el servidor, les connexions i els contenidors |
| [Desenvolupament segur](development.html) | Com es revisa i es prova un canvi, l'anàlisi del codi i de les dependències, com es construeixen les imatges, les versions amb suport |
| [Comunicar una vulnerabilitat](reporting.html) | Com comunicar un problema en privat, i què passa després |
| [Avisos de seguretat](advisories.html) | Totes les vulnerabilitats publicades, amb el seu CVE, la seva gravetat i la versió que les corregeix |
| [PMF de l'avaluació](faq.html) | Respostes breus a les preguntes que més fan els qüestionaris de seguretat |

Per protegir una instància en lloc d'avaluar-la, consulta [Seguretat](../security/) a la guia de l'administrador.

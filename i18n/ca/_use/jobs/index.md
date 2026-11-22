---
layout: default
title: Tasques
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Tasques
{: .no_toc }

Segueix, avorta, rellança, aprova i suprimeix les tasques que inicien els teus formularis
{: .fs-6 .fw-300 }

---

Per a tothom qui llança formularis: què és una tasca, on trobar-la i qui la pot veure.

---

## Què és una tasca

Una tasca és una execució d'un formulari: AnsibleForms la registra amb el seu estat, les seves extravars i la seva sortida tan bon punt s'envia el formulari.

Cada tasca conserva:

* el **formulari** que ha executat i l'**usuari** que l'ha llançada (amb el tipus d'usuari, com ara `local` o `ldap`);
* el seu **tipus de tasca** i el seu **estat**, i la seva **hora d'inici** i **hora de finalització**;
* la seva **sortida**, les extravars i les credencials amb què s'ha executat, i els valors dels camps introduïts al formulari.

Un formulari multipas crea una tasca per al formulari i una tasca per a cada pas. Els passos estan enllaçats a la tasca principal i es mostren a sota.

Les mateixes tasques es poden llançar, seguir i gestionar a través de l'[API REST](../api/jobs.html).

---

## La pàgina Tasques

L'enllaç **Tasques** de la capçalera obre la llista de totes les tasques, de la més recent a la més antiga (`/jobs/all`). La pàgina i el seu enllaç es mostren als usuaris
el rol dels quals defineix l'[opció de rol](../config/roles.html#role-options) `showJobs`.

![La llista de tasques](../assets/screenshots/job-log.jpg)

El menú de l'esquerra ordena les tasques en el temps, amb el nombre de tasques de cada entrada; una entrada d'estat filtra la llista per aquest estat:

| Secció | Entrada del menú | Mostra |
|---|---|---|
| **Passat** | **Correctes** | Tasques amb l'estat `success` |
| | **Fallides** | Tasques amb l'estat `failed` |
| | **Avortades** | Tasques amb l'estat `aborted` |
| | **Rebutjat** | Tasques amb l'estat `rejected` |
| | **Abandonat** | Tasques amb l'estat `abandoned` |
| **Present** | **En execució** | Tasques amb l'estat `running` |
| | **Esperant aprovació** | Tasques amb l'estat `approve`; el comptador es torna taronja quan n'hi ha una d'esperant |
| **Futur** | **Programats** | La pàgina [Programacions](schedules.html) (opció de rol `allowScheduledJobs`) |
| | **Desats** | La pàgina [Tasques desades](stored-jobs.html) (opció de rol `allowStoredJobs`) |

El menú no té cap entrada per a totes les tasques: l'enllaç **Tasques** de la capçalera les mostra totes, incloses les tasques `warning`.

A sobre de la taula, a la línia del títol:

* el **quadre de cerca** conserva les tasques les columnes visibles de les quals contenen el text (sense distingir majúscules i minúscules), o un dels passos de les quals el té com a id
  o destinació;
* **Suprimeix** (amb el nombre de tasques marcades) suprimeix juntes les tasques marcades a la primera columna;
* **Columnes** mostra o amaga les columnes `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` i `user`;
  la durada d'una tasca en execució va comptant;
* **Actualitza** torna a carregar la llista.

La llista carrega les tasques més recents, tantes com indiqui l'opció [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)
(**Configuració > Sistema > General**, pestanya **Tasques**, `1000` per defecte); les seves pàgines, la cerca i els filtres cobreixen aquestes tasques.

Cada columna es pot ordenar i té el seu propi camp de filtre. Una tasca multipas té una fletxa just abans del seu `form` que desplega
els seus passos; un clic a la resta d'una fila obre la tasca.

La campaneta de la capçalera compta les tasques que esperen la teva aprovació i obre la llista a **Esperant aprovació**. Per als usuaris que poden veure
els runners, també compta els [runners pendents d'aprovació](../runners/registration.html#approving-an-rte), RTE que han demanat unir-se,
i obre **Connexions > Runners** quan només esperen runners. Si n'hi ha de tots dos tipus, obre un menú, **Feines pendents d'aprovació** i
**Runners pendents d'aprovació**, cadascun amb el seu comptador.

---

## Qui veu quines tasques

Les tasques que veu un usuari depenen dels seus rols:

| Usuari | Veu |
|---|---|
| Administrador (rol `admin`) | Totes les tasques |
| Opció de rol `showAllJobLogs` | Totes les tasques |
| Opció de rol `manageAllJobs` (a partir de la 7.3.0) | Totes les tasques, i les pot avortar, suprimir i rellançar |
| Qualsevol altre usuari | Les seves pròpies tasques, i les tasques que esperen una aprovació que indica un dels seus rols |

Fins a la 7.2, qualsevol usuari podia obrir qualsevol tasca pendent d'aprovació, incloses les seves extravars i la seva sortida; a partir de la 7.3.0 només ho poden fer el seu propietari i els seus
aprovadors. Veure una tasca no dona dret a totes les accions sobre ella: avortar, suprimir i rellançar la tasca d'un altre usuari requereix ser administrador o tenir
`manageAllJobs`, i `showAllJobLogs` només mostra les tasques. Per suprimir també cal `allowJobDeletion`, i per rellançar, `allowJobRelaunch`.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Estats i tipus](statuses.html) | Tots els estats que pot tenir una tasca, i els tipus de tasca |
| [Seguir una tasca](following.html) | Sortida en directe, extravars, filtres i baixades |
| [Accions sobre les tasques](actions.html) | Llançar, avortar, rellançar, aprovar o rebutjar, i suprimir una tasca |
| [Programacions](schedules.html) | Executar un formulari més tard o segons una programació cron, i gestionar totes les programacions |
| [Tasques desades](stored-jobs.html) | Guardar les dades d'un formulari per tornar-les a carregar més tard |
| [Neteja](cleanup.html) | Tasques interrompudes per un reinici, i quant de temps es conserven les tasques acabades |

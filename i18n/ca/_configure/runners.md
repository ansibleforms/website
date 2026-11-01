---
layout: default
title: Runners
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# Runners
{: .no_toc }

On s'executen les tasques: contenidors d'entorn d'execució per als playbooks, i AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins per a les plantilles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors: afegeix els runners on s'executen les teves tasques, tria el predeterminat de cada tipus, aprova els RTE que demanen unir-se i prova'ls.

---

## En aquesta secció

| Pàgina | Què hi trobaràs |
|---|---|
| [La pàgina de runners](runners/list.html) | La llista de runners, com afegir-ne un, com activar-lo o desactivar-lo, i el predeterminat de cada tipus |
| [Tipus de runner](runners/types.html) | Els productes que pot ser un runner, la seva adreça i el seu accés |
| [Registre](runners/registration.html) | Com un RTE demana unir-se i s'aprova, els tokens d'unió per a instal·lacions desateses, i el mode base de dades |
| [La pàgina d'un runner](runners/runner-page.html) | Les pestanyes d'un runner, el mode i la connexió d'un RTE, i Prova la connexió |
| [Qui gestiona els runners](runners/permissions.html) | Qui pot afegir, canviar i provar runners |


---

## Com funciona

Des de la versió 7 l'aplicació no executa res ella mateixa: totes les tasques s'executen en un **runner**, afegit a **Connexions > Runners**.
El tipus d'un formulari decideix quin tipus de runner necessita:

| Tipus de formulari | S'executa en un runner de tipus | Què s'executa |
|---|---|---|
| `ansible` | RTE | Un playbook, en un contenidor d'entorn d'execució |
| `awx`, `aap`, `ascender` | AWX (les variants AWX, AAP i Ascender) | Una plantilla de tasca o de workflow |
| `semaphore` | Semaphore | Una plantilla de Semaphore UI |
| `rundeck` | Rundeck | Una tasca de Rundeck |
| `jenkins` | Jenkins | Una tasca de Jenkins |

Un formulari `workflow` o `subform` no té runner propi: cada node d'un [workflow](workflows/) tria el seu. Un node
amb un `runner:` s'executa en aquell runner (un RTE, o una plantilla o una tasca a AWX, Semaphore, Rundeck o Jenkins), i qualsevol altre a
l'RTE predeterminat, de manera que els nodes d'una mateixa tasca es poden executar en runners diferents. El formulari `multistep`, obsolet des de la 7 i
substituït pels workflows, funciona igual: cadascun dels seus passos s'executa al runner que necessita el seu propi tipus.

Un formulari tria el seu runner d'una de dues maneres:

- **Pel nom**: `runner: <name>` al formulari, en un node de workflow, o en un pas d'un multistep obsolet (també a la
  configuració del formulari al dissenyador). El runner ha de ser del tipus que necessita el formulari, o la tasca falla. L'antic `awx: <name>`
  encara funciona, registra un avís d'obsolescència, i desapareix a la 8.
- **Com a predeterminat**: un formulari que no nomena cap runner s'executa al runner predeterminat del seu tipus. Si no n'hi ha, la tasca falla
  amb un missatge que indica quin tipus de runner cal afegir.

Un runner desactivat a **Connexions > Runners** no rep cap tasca, ni pel nom ni com a predeterminat: la tasca falla i diu que cal activar-lo
o nomenar un altre runner (vegeu [Predeterminat i Activat](runners/list.html#default-and-enabled)).



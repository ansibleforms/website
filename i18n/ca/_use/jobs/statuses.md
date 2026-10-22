---
layout: default
title: Estats i tipus
parent: Tasques
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Estats i tipus
{: .no_toc }

Tots els estats que pot tenir una tasca, i els tipus de tasca
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Estats de les tasques

AnsibleForms assigna els estats següents a una tasca. La llista mostra cada estat com una etiqueta de color:

| Estat | Significat | Què pots fer |
|---|---|---|
| `running` | La tasca s'està executant, o una tasca aprovada s'ha reprès | Seguir-ne la sortida, avortar-la |
| `approve` | La tasca espera en un [punt d'aprovació](../forms/approval.html) abans d'executar-se (o abans d'un pas d'un multistep) | Aprovar-la o rebutjar-la, si un dels teus rols és aprovador |
| `success` | El playbook, la plantilla o tots els passos han acabat sense errors | Veure'n la sortida, rellançar-la, suprimir-la |
| `failed` | La tasca ha acabat amb un error, o ha fallat el llançament mateix | Veure'n la sortida per saber per què, rellançar-la, suprimir-la |
| `warning` | Un multistep ha acabat, però ha fallat un pas que té `continue` definit | Veure'n la sortida, rellançar-la, suprimir-la |
| `aborted` | La tasca s'ha avortat des d'AnsibleForms, o s'ha cancel·lat el job d'AWX / AAP | Veure'n la sortida, rellançar-la, suprimir-la |
| `rejected` | Un aprovador ha rebutjat la tasca; no s'ha executat mai | Veure'n la sortida, rellançar-la, suprimir-la |
| `abandoned` | AnsibleForms ha deixat de seguir la tasca (vegeu [Tasques abandonades](cleanup.html#abandoned-jobs)) | Comprovar els hosts gestionats, rellançar-la, suprimir-la |

`running` és blau, `success` és verd i diu **Correctes**, i `failed` és vermell. `approve` és taronja i diu **Esperant aprovació**,
de manera que una tasca que espera una persona es distingeix de les aturades; `warning`, `aborted` i `rejected` són ambre. `abandoned` és
gris: ningú no l'ha aturada, el que l'executava ha desaparegut.

---

## Tipus de tasca

El tipus de tasca segueix el `type` del formulari que ha iniciat la tasca, tal com el mostren la llista i la pàgina de la tasca:

| Tipus que es mostra | Què s'executa |
|---|---|
| `ansible` | Un playbook d'Ansible, executat en un RTE |
| `awx`, `aap`, `ascender` | Una plantilla de job o una plantilla de workflow a AWX, AAP o Ascender |
| `semaphore` | Una plantilla a Semaphore UI |
| `rundeck`, `jenkins` | Un job a Rundeck o Jenkins |
| `workflow` | Un [workflow](../workflows/), els nodes de playbook del qual s'executen com a tasques pròpies a sota |
| `multistep` | Obsolet, fes servir `workflow`: una seqüència de passos, cadascun registrat com a tasca pròpia sota la tasca principal |

Una tasca de plantilla es desa com una tasca `awx` (també a l'API REST) i es mostra amb el tipus de runner on s'ha executat, digui el que digui
el formulari: un formulari de tipus `awx` que s'executa en un runner d'AAP mostra `aap`.

Consulta [Formularis d'Ansible](../forms/ansible.html), [Formularis d'AWX](../forms/awx.html), [Formularis de workflow](../forms/workflow.html) i
[Formularis multipas](../forms/multistep.html) per a la part del formulari.

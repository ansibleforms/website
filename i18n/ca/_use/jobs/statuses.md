---
layout: default
title: Estats i tipus
parent: Tasques
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | El playbook ha acabat però [cal atenció](#a-job-that-needs-attention): algú n'ha de fer el seguiment. O un multistep ha acabat, però ha fallat un pas que té `continue` definit | Llegir-ne el motiu a la pàgina de la tasca, fer-ne el seguiment, rellançar-la, suprimir-la |
| `aborted` | La tasca s'ha avortat des d'AnsibleForms, o s'ha cancel·lat el job d'AWX / AAP | Veure'n la sortida, rellançar-la, suprimir-la |
| `rejected` | Un aprovador ha rebutjat la tasca; no s'ha executat mai | Veure'n la sortida, rellançar-la, suprimir-la |
| `abandoned` | AnsibleForms ha deixat de seguir la tasca (vegeu [Tasques abandonades](cleanup.html#abandoned-jobs)) | Comprovar els hosts gestionats, rellançar-la, suprimir-la |

`running` és blau, `success` és verd i diu **Correctes**, i `failed` és vermell. `approve` és taronja i diu **Esperant aprovació**,
de manera que una tasca que espera una persona es distingeix de les aturades; `warning` diu **Cal atenció**, i tant aquest com `aborted` i `rejected` són ambre. `abandoned` és
gris: ningú no l'ha aturada, el que l'executava ha desaparegut.

---

## Una tasca que requereix atenció

Des de la 7.8.0, un playbook que ha acabat tal com estava previst, però que deixa feina per a un operador (una aprovació en un
altre lloc, un pas manual, una aplicació parcial), pot acabar la seva tasca com a **Cal atenció** (`warning`) amb un missatge, en lloc
d'un `failed` que sembla una automatització trencada o d'un `success` que amaga el que queda per fer. El playbook ho indica d'una de
dues maneres:

* un **fitxer d'estat** al costat del playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (o `.yaml`), en un RTE. L'RTE
  el llegeix quan el playbook acaba i després l'elimina
* **`set_stats`** amb la clau `af_job_status`, en un RTE i en AWX, AAP o Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms passa `__jobid__` a les extravars, perquè el playbook pugui construir el camí del fitxer. El fitxer guanya quan un
playbook fa totes dues coses.

* Només un playbook que ha **acabat correctament** pot acabar com a Cal atenció: una tasca fallida es queda `failed` i una avortada
  `aborted`, digui el que digui el fitxer
* Un fitxer que no és vàlid (sense missatge, un altre estat, YAML trencat) s'ignora: la tasca continua sent correcta, i la seva
  sortida n'explica el motiu en una línia `[WARNING]`
* El missatge es mostra a la pàgina de la tasca en un quadre ambre, amb el detall plegat a sota com a YAML, com a tooltip de l'estat
  a la llista, i a l'última línia de sortida de la tasca. **Cal atenció** a **Passat** al menú de tasques llista aquestes tasques
* Les [notificacions](../forms/notifications.html) amb `onStatus: [warning]` s'envien per a aquestes tasques; el correu i els canals
  porten el missatge, un webhook com a [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* En un multistep, un pas que requereix atenció es dona per superat i s'executa el pas següent; aleshores el multistep també
  requereix atenció. En un [workflow](../workflows/), la tasca compta com a correcta per al node següent

Les tasques de Semaphore, Rundeck i Jenkins no poden acabar com a Cal atenció.

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

---
layout: default
title: Neteja
parent: Tasques
nav_order: 6
translated_from: 48c1ec6d3d2ac80c86dd71d6799fbb1b59c5cb2f
---

# Neteja
{: .no_toc }

Tasques interrompudes per un reinici, i quant de temps es conserven les tasques acabades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Tasques abandonades

Una tasca en execució la segueix el procés d'AnsibleForms que l'ha iniciada. Quan aquest seguiment s'atura, la tasca es marca com a
`abandoned`:

* **En arrencar**, les tasques que aquest procés seguia abans de reiniciar-se, i les tasques d'abans de la 7 que no segueix cap procés,
  es marquen com a abandonades si encara estan en `running` o avortant-se; el registre mostra `Abandoned <n> jobs`. Una tasca que
  s'executa en un RTE no es toca: continua sense el procés que l'ha iniciada.
* **Cada minut**, les tasques que segueix un altre procés d'AnsibleForms (o RTE) que fa 2 minuts que no respon es
  marquen com a abandonades; el registre mostra `Abandoned <n> jobs followed by a node that stopped answering`.
* **Cada hora**, les tasques que van començar fa més d'un dia, que encara estan en `running` i que no han escrit cap sortida en un dia es marquen com a abandonades.
  Una tasca que s'executa en un RTE tampoc no es toca aquí: l'RTE neteja les seves pròpies tasques quan es reinicia.

A partir de la 7.3.0, una tasca de plantilla a AWX, AAP o Ascender que ha quedat abandonada per un reinici o per un node aturat es recupera, si va començar
en les últimes 24 hores: un procés d'AnsibleForms se n'encarrega, la torna a seguir al runner, i la tasca acaba amb el que
hi ha passat realment. Les tasques dels altres runners, els playbooks, els workflows i les tasques multipas continuen abandonades.

Un playbook abandonat pot haver-se executat en part. Comprova els hosts gestionats abans de rellançar-lo; vegeu
[Una tasca mostra l'estat abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Retenció de les tasques

Les tasques es conserven fins que se suprimeixen, tret que l'administrador defineixi un període de retenció.

Amb [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) definit, un procés nocturn (a les 2:30) suprimeix
les tasques acabades, amb la seva sortida i els seus passos, que van acabar fa més d'aquests dies. Només elimina tasques amb
l'estat `success`, `failed`, `warning`, `aborted`, `rejected` o `abandoned`, de manera que les tasques en execució i les que esperen
aprovació es conserven per antigues que siguin. El valor per defecte, `0`, conserva totes les tasques.

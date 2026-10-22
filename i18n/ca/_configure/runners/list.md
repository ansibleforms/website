---
layout: default
title: La pàgina de runners
parent: Runners
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# La pàgina de runners
{: .no_toc }

La llista de runners, com afegir-ne un, com activar-lo o desactivar-lo, i el predeterminat de cada tipus
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La llista

La pàgina de **Connexions > Runners** llista tots els runners amb aquestes columnes:

| Columna | Significat |
|---|---|
| Activat | Si rep tasques. Un runner desactivat no rep cap tasca, ni tan sols com a predeterminat del seu tipus. |
| Nom | Com el nomenen els formularis, amb `runner: <name>`. |
| Tipus | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck o Jenkins. El runner predeterminat del seu tipus té una etiqueta **Predeterminat** al darrere. |
| Descripció | Per a què serveix. |

**Columnes** n'afegeix dues més, desactivades per defecte: **Mode**, el mode d'un RTE (Sortint, Entrant o Base de dades (obsolet), vegeu
[Modes](../rte/modes.html)), i **Connexió**, si un node d'aplicació té un sòcol amb un RTE en un mode de sòcol: **Connectat** o
**No connectat**.

Des de la 7.3.0 els runners pendents d'aprovació no són a la llista sinó en un avís damunt seu, vegeu [Aprovar un RTE](registration.html#approving-an-rte).
**Afegeix runner** obre un diàleg per passos: **Runner** (nom i descripció), **Tipus** i **Credencials**, amb un pas **Mode** després de
**Tipus** per a un RTE (Sortint, el predeterminat per a un de nou, Entrant o Base de dades (obsolet)): quatre passos per a un RTE, tres per als
altres. Al pas **Tipus** cada producte té una pista: la de l'RTE en dona el nom complet, *Entorn d'execució*. Una fila obre la pàgina
pròpia del runner, i el seu menú ofereix:

| Acció | Què fa |
|---|---|
| Edita | Obre la seva pàgina |
| Prova la connexió | Comprova que respon i que accepta la seva credencial, vegeu [Prova la connexió](runner-page.html#test-connection) |
| Activa, Desactiva | L'activa o el desactiva, segons el que no estigui |
| Canvia les credencials | Obre la pestanya Credencials de la seva pàgina |
| Suprimeix | L'elimina |

---

## Predeterminat i Activat

El predeterminat de cada tipus és on s'executen els formularis d'aquest tipus quan no nomenen cap runner:

| Predeterminat per a | On s'executen aquests formularis quan no nomenen cap runner |
|---|---|
| Formularis de playbook | Els formularis `ansible`, en un RTE |
| Formularis AWX, AAP i Ascender | Els formularis `awx`, `aap` i `ascender`, en un runner AWX |
| Formularis Semaphore | Els formularis `semaphore` |
| Formularis Rundeck | Els formularis `rundeck` |
| Formularis Jenkins | Els formularis `jenkins` |

El primer runner d'un tipus passa a ser-ne el predeterminat, de manera que un sol runner per tipus no necessita cap pas addicional. Per fer que un altre runner sigui el predeterminat,
activa l'interruptor **És el predeterminat** a la seva pàgina (vegeu [La pàgina d'un runner](runner-page.html)).

Un runner desactivat continua llistat amb els seus ajustos, però no hi va cap tasca, tampoc com a predeterminat del seu tipus. Una tasca per a ell falla amb
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Activa'l o desactiva'l amb **Activa** o **Desactiva** al menú de la seva fila, o amb l'interruptor **Activat** a la seva pàgina. Un runner nou està activat, i els
runners que existien abans de la 7.3.0 estan activats després de l'actualització. La [llavor de configuració](../seed/example.html) en pot desactivar un amb
`enabled: false`.


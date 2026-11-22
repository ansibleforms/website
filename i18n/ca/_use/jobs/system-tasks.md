---
layout: default
title: Processos del sistema
parent: Tasques
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Processos del sistema
{: .no_toc }

Els processos de manteniment que AnsibleForms executa sol, i quan s'executen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per als administradors: les neteges, la còpia nocturna i la resta de feina de fons del servidor, a **Tasques** des de la 7.8.0.

---

## Els processos

El servidor executa aquests processos sol, cadascun amb un cron a la zona horària del servidor, definida amb [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Procés | S'executa per defecte | Què fa |
|---|---|---|
| **Tasques abandonades** | Cada hora | Acaba les tasques que han funcionat un dia sense sortida i que cap runner no ha agafat (vegeu [Tasques abandonades](cleanup.html#abandoned-jobs)) |
| **Nodes aturats** | Cada minut | Allibera les tasques, les reserves i els runners que tenien els nodes d'AnsibleForms i els RTE que han deixat de respondre |
| **Fi de les programacions** | Cada minut | Desactiva o elimina les [programacions](schedules.html) que han arribat al seu final |
| **Resincronitzar programacions** | Cada 5 minuts | Torna a llegir de la base de dades les programacions i els pulls dels repositoris, per si s'ha perdut un avís de canvi |
| **Tokens caducats** | Cada dia a les 03:00 | Elimina els tokens d'inici de sessió caducats, les revocacions de tokens i els tokens d'API |
| **Neteja de l'auditoria** | Cada dia a les 03:30 | Elimina les entrades d'auditoria més antigues que `AUDIT_RETENTION_DAYS` |
| **Neteja de tasques** | Cada dia a les 02:30 | Elimina les tasques acabades més antigues que `JOB_RETENTION_DAYS`, amb la seva sortida |
| **Còpia nocturna** | Cada dia a mitjanit | Fa una còpia de seguretat de la base de dades i elimina les còpies nocturnes més antigues per sobre de `NIGHTLY_BACKUP_RETENTION` |
| **Neteja de tasques desades** | Cada dia a les 04:00 | Elimina les tasques desades caducades o sense ús durant `STORED_JOB_UNUSED_DAYS`, i oblida els nodes absents des de fa un dia |
| **Recàrrega del config seed** | Cada minut | Torna a aplicar la [llavor de configuració](../seed/reloading.html) quan el seu fitxer ha canviat |

Els ajustos de retenció es descriuen a [Còpies de seguretat i retenció](../customization/retention.html), i les còpies a
[Còpies de seguretat](../production/backups.html). La **Recàrrega del config seed** està desactivada sense [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Aquests processos s'executen al node que fa la feina de fons: el procés sense `AF_ROLE`, o el `worker` que té el bloqueig de worker
quan l'app es reparteix en diversos nodes (vegeu [Escalat](../production/scaling.html#roles)).

---

## Els bucles del hub de runners

El hub de runners lliura les tasques als RTE, i tres bucles propis s'executen cada pocs segons en lloc de fer-ho amb un cron:

| Bucle | S'executa per defecte | Què fa |
|---|---|---|
| **Enviament als runners** | Cada 2 segons | Lliura les tasques en espera i les cancel·lacions als seus runners; una llançada en un altre node arriba al seu runner a la passada següent |
| **Trucada a runners entrants** | Cada 10 segons | Truca els runners [entrants](../rte/modes.html#inbound) que aquest node pot tenir, de nou per a un que ha perdut el sòcol |
| **Neteja de jobs acabats** | Cada 60 segons | Deixa anar el que aquest node conservava de tasques que han acabat en un altre node |

Els bucles s'executen a cada node que executa l'app web, de manera que amb diversos nodes d'app cadascun té els seus. Un minut, el pas
més petit d'un cron, és massa gruixut per a ells: cadascun s'executa cada tants segons.

---

## La llista Sistema

La pàgina [Tasques](./) mostra els processos a **Futur**, com a **Sistema**, amb el nombre de processos, per als administradors (opció de rol `showSettings`).

La llista té una fila per procés i bucle, i es torna a llegir cada minut:

| Columna | Mostra |
|---|---|
| **Nom** | El nom del procés |
| **Programació** | Quan s'executa, en paraules (*Cada hora*, *Cada 2 segons*), el seu cron en passar-hi per sobre, o **Desactivat** per a un procés que no s'executa |
| **Darrera execució** | Quan va començar la darrera execució, o un guió si no s'ha executat mai |
| **Propera execució** | Quan s'executa la propera vegada |
| **Estat** | Com va anar la darrera execució: `success` o `failed` |

**Columnes** també ofereix **Descripció**, què fa cada procés. Un clic en una fila obre la pàgina del procés. Els processos són de
l'app mateixa: no es poden afegir ni suprimir.

---

## La pàgina d'un procés

La pàgina d'un procés té tres pestanyes, amb **Executa ara** i **Desa** a sobre, i un quadre de cerca que filtra totes les pestanyes alhora.

| Pestanya | Què mostra |
|---|---|
| **Detalls** | El seu **Nom** i la seva **Descripció**, el seu **Últim llançament** (l'error en passar-hi per sobre si ha fallat), el **Resultat** de la darrera execució, **Darrera execució**, **Propera execució**, el **Node** que ha respost per a un bucle, i el **Paràmetre aplicat** |
| **Programació** | Quan s'executa: un cron per a un procés, un **Interval** en segons per a un bucle |
| **Execucions** | Cada execució registrada, la més recent primer |

**Paràmetre aplicat** indica la variable i el seu valor, com ara `JOB_RETENTION_DAYS` 90, amb **Canvia-ho a Configuració** per obrir
la pestanya de configuració que la canvia. Un procés sense aquest ajust mostra un guió.

### La pestanya Programació
{: .no_toc }

El cron d'un procés s'edita amb el mateix editor que el d'una programació: valors predefinits, l'expressió en paraules i les tres
execucions següents, a la zona horària del servidor. Pren 5 camps (minut, hora, dia, mes i dia de la setmana) i s'ha de tornar a
executar. Un bucle pren un nombre enter de segons, dins dels seus límits, que indica la línia sota el camp.

**Desa** escriu el valor al fitxer de configuració gestionat, com fan les pàgines de configuració, i l'aplica de seguida a cada node,
sense reiniciar. Un valor definit a l'entorn del procés, o qualsevol valor amb [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
es mostra només de lectura, amb la línia *Definit per la variable d'entorn* i el seu nom.

### La pestanya Execucions
{: .no_toc }

Cada execució d'un procés és una fila, amb aquestes columnes:

| Columna | Mostra |
|---|---|
| **Llançat per** | L'usuari que ha triat **Executa ara**, com a `admin (local)`, o **Programació** per a una execució del seu cron |
| **Hora d'inici**, **Hora de finalització** i **Durada** | Quan va començar i acabar l'execució, i quant va durar |
| **Estat** | `success` o `failed` |
| **Resultat** | Què ha fet l'execució, com ara *Removed 120 jobs*, o el seu error |
| **Node** | El node que l'ha executada |

Es conserven les execucions dels últims 30 dies, fins a 1000 per procés: per a un procés que s'executa cada minut, unes 16 hores.

Un bucle s'executa massa sovint per tenir una fila per passada. La seva pestanya **Execucions** mostra en canvi, per node:

* un resum de cada hora, com ara *1,800 passes, 0 failed*, `failed` quan una passada d'aquella hora ha fallat;
* una fila per a cada **Executa ara**, amb *Run now: done* o l'error;
* una fila `failed` quan falla una passada del seu temporitzador, com a molt un cop per minut per al mateix error.

### Executa ara
{: .no_toc }

**Executa ara** executa el procés de seguida, al node que executa els processos, i registra l'execució amb el teu nom. Està
desactivat mentre una execució del procés està en curs, i per a un procés **Desactivat**. Una execució llarga, com ara la còpia
nocturna, continua després que la pàgina respongui.

**Executa ara** d'un bucle executa una passada al node que serveix la pàgina, i es rebutja on el hub de runners no s'executa. Cada
**Executa ara** s'escriu al registre d'auditoria com a `system.task.run`.

---

## Canviar quan s'executa un procés

Cada procés i bucle té una variable d'entorn per al seu horari, que escriu la seva pestanya **Programació**. Totes s'apliquen sense reiniciar.

| Variable | Predeterminat | Procés |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Tasques abandonades |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Nodes aturats |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Fi de les programacions |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Resincronitzar programacions |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Tokens caducats |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Neteja de l'auditoria |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Neteja de tasques |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Còpia nocturna |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Neteja de tasques desades |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Recàrrega del config seed |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (d'1 a 60) | Enviament als runners |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (de 2 a 300) | Trucada a runners entrants |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (de 10 a 3600) | Neteja de jobs acabats |

Un valor que no és un cron vàlid, o uns segons fora dels límits, definit a mà a l'entorn, s'ignora i s'aplica el predeterminat.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Abans de la 7.8.0 la llavor de configuració es comprovava cada [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
Aquesta variable és obsoleta des de la 7.8.0, en favor de `CONFIG_SEED_RELOAD_CRON`, i s'eliminarà a la 8.0. Mentre
`CONFIG_SEED_RELOAD_CRON` no estigui definida, encara es llegeix com un cron, amb un avís al registre en arrencar:

| `CONFIG_SEED_RELOAD_SECONDS` | Es llegeix com |
|---|---|
| `60` | `* * * * *`, cada minut |
| Un múltiple de 60 fins a `3600` | Cada tants minuts, com ara `*/5 * * * *` per a `300` (`3600` es llegeix com `0 * * * *`) |
| Un nombre inferior a 60 que divideix 60 | Cada tants segons |
| `0` | La recàrrega està desactivada |
| Qualsevol altre nombre | El més proper d'aquests, cosa que indica el registre |

La pestanya **Programació** del procés mostra aquest cron amb la línia *De CONFIG_SEED_RELOAD_SECONDS, obsoleta; un cron desat aquí
la substitueix.* **Desa** escriu `CONFIG_SEED_RELOAD_CRON`, que a partir d'aleshores té prioritat sobre la variable antiga.

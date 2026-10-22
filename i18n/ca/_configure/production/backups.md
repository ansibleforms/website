---
layout: default
title: Còpies de seguretat
parent: En producció
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Còpies de seguretat
{: .no_toc }

Còpies nocturnes, què contenen, restauracions, i què més cal conservar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Còpies nocturnes

AnsibleForms fa una còpia de seguretat de si mateix cada nit a mitjanit, a la zona horària de [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(UTC per defecte). Aquests ajustos la controlen:

| Variable | Predeterminat | Significat |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | On s'escriuen les còpies de seguretat, cadascuna en una carpeta amb marca de temps |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Quantes còpies nocturnes es conserven; `0` les conserva totes |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | L'ordre que bolca la base de dades |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | L'ordre que reprodueix un bolcat en restaurar |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Quant de temps poden durar el bolcat i la restauració |

Els usuaris amb l'opció de rol `allowBackupOps` també poden fer una còpia de seguretat en qualsevol moment a la pàgina **Còpies de seguretat**. La retenció
només elimina les còpies nocturnes, i només hi compten les còpies amb un bolcat utilitzable, de manera que una sèrie de nits fallides
mai no fa fora l'última còpia bona.

Abans que una actualització canviï la base de dades, el worker fa primer una còpia de seguretat normal, una per versió, anomenada *Before the upgrade to
&lt;version&gt;*. Es mostra a la pàgina **Còpies de seguretat** i la retenció nocturna no l'elimina mai. Si falla (no hi ha eina de bolcat,
no es pot escriure a `BACKUP_PATH`), l'actualització s'atura i n'explica el motiu, de manera que l'aplicació mai no arrenca sobre una base de dades a mig actualitzar.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` actualitza sense còpia de seguretat.

Les ordres poden ser embolcalls com ara `docker exec <container> mysqldump`, si la seva primera paraula existeix localment. Des de la 7.3.0 s'executen
sense shell: les cometes i `$NAME` de l'entorn de l'ordre funcionen, però `;`, `|`, `&&`, `>` i `<` es rebutgen.

---

## Permisos de la base de dades

El bolcat s'executa com a [`DB_USER`](../customization/server.html#env_DB_USER), i no necessita més permisos que els que necessita la mateixa aplicació:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

El bolcat es fa amb `--no-tablespaces`, de manera que no cal el permís `PROCESS` de tot el servidor, i omet les taules
que descriuen els processos en execució (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). La restauració el reprodueix amb el mateix usuari.
La pàgina **Estat** mostra un avís a la comprovació **Usuari de la base de dades** quan l'usuari té permisos sobre totes les bases de dades, com en té `root`.

---

## Què conté una còpia de seguretat

Cada còpia de seguretat és una carpeta sota `BACKUP_PATH`, amb el nom de la seva marca de temps UTC (`YYYYMMDDHHmmss`), que conté:

| Fitxer | Contingut |
|------|---------|
| `ansibleforms.sql` | El bolcat de la base de dades `AnsibleForms`: usuaris, grups, credencials, tasques, ajustos, el rastre d'auditoria |
| `config.yaml` | El fitxer de [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | La carpeta de [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | El fitxer d'entorn que escriuen les pàgines de configuració, sense `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` ni `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | La descripció de la còpia de seguretat |

Una còpia de seguretat el bolcat de la qual falla s'elimina de nou i es registra com a error. La pàgina **Estat** avisa quan no hi ha cap còpia,
quan la més recent té més de dos dies o quan no té cap bolcat utilitzable, i comprova que l'eina de bolcat existeix.

En canvi, [`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) conserva els punts de restauració del dissenyador (60 dies per defecte).

---

## Restaurar una còpia de seguretat

Restaura des de la [pàgina **Còpies de seguretat**](../gui/administration.html#restore), amb **Crea una còpia de seguretat nova abans de restaurar** marcat. Una restauració:

* reprodueix `ansibleforms.sql`, que substitueix tota la base de dades; des de la 7.3.0 una còpia d'una versió anterior es torna a actualitzar
  després, com a l'inici d'una versió nova, i s'informa d'un pedaç que falla
* torna a copiar `config.yaml`, i substitueix la carpeta `forms/` per la de la còpia: des de la 7.3.0 els formularis que no són a la còpia
  s'eliminen en lloc de conservar-se, els enllaços i el mode de la carpeta es mantenen, i una còpia fallida fa tornar la carpeta enrere
* **no** restaura `managed.env`, perquè descriu l'amfitrió d'on prové la còpia. El botó **Restaura l'entorn**
  el torna a posar si es demana, conserva el fitxer actual com a `.env.bak`, i necessita un reinici.

Una còpia de seguretat sense un bolcat utilitzable es rebutja; després d'una restauració interrompuda, corregeix la causa i torna a restaurar.

En un amfitrió nou, defineix el mateix `ENCRYPTION_SECRET` abans de restaurar, o les credencials desades no es podran desxifrar.

---

## Què més cal copiar

La còpia nocturna cobreix la base de dades, la configuració i els formularis, però res més de la carpeta persistent:

* **`ENCRYPTION_SECRET` i `ACCESS_TOKEN_SECRET`** : mai no són en una còpia de seguretat, a propòsit. Guarda'ls al teu gestor de secrets;
  sense el secret de xifratge, un bolcat de la base de dades no serveix de res per a les credencials.
* **les mateixes còpies de seguretat** : són al mateix volum que la instància. Copia `BACKUP_PATH` a un altre amfitrió.
* **la resta de la carpeta persistent** : playbooks, fitxers pujats, fitxers de variables, repositoris clonats, certificats i registres.
  Amb el projecte docker-compose, fes una còpia de tota la carpeta `data/`, que també conté la clau SSH, les funcions
  personalitzades i els rols i les col·leccions d'Ansible.

El contingut que ve de git (repositoris, formularis en un repositori) es pot tornar a clonar, així que la seva còpia importa menys.

---
layout: default
title: Back-ups
parent: Draaien in productie
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Back-ups
{: .no_toc }

Nachtelijke back-ups, wat ze bevatten, terugzetten, en wat je verder moet bewaren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nachtelijke back-ups

AnsibleForms maakt elke nacht om middernacht een back-up van zichzelf, in de tijdzone van [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(standaard UTC). Deze instellingen sturen dat:

| Variabele | Standaard | Betekenis |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Waar back-ups worden geschreven, elk in een map met tijdstempel |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Hoeveel nachtelijke back-ups worden bewaard, `0` bewaart ze allemaal |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | De opdracht die de database dumpt |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | De opdracht die bij het terugzetten een dump afspeelt |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Hoe lang de dump en het terugzetten mogen duren |

Gebruikers met de rolinstelling `allowBackupOps` kunnen op de pagina **Back-ups** ook op elk moment een back-up maken. Alleen nachtelijke
back-ups worden door de bewaartermijn verwijderd, en alleen back-ups met een bruikbare dump tellen daarvoor mee, zodat een reeks mislukte
nachten nooit de laatste goede verdringt.

Voordat een upgrade de database wijzigt, maakt de worker eerst een gewone back-up, één keer per release, met de naam *Before the upgrade to
&lt;version&gt;*. Die verschijnt op de pagina **Back-ups** en wordt nooit door de nachtelijke bewaartermijn verwijderd. Als ze mislukt (geen dumptool,
`BACKUP_PATH` niet schrijfbaar), stopt de upgrade en zegt waarom, zodat de app nooit start op een half bijgewerkte database.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` voert de upgrade uit zonder back-up.

De opdrachten mogen wrappers zijn zoals `docker exec <container> mysqldump`, als hun eerste woord lokaal bestaat. Vanaf 7.3.0 draaien ze
zonder shell: aanhalingstekens en `$NAME` uit de omgeving van de opdracht werken, maar `;`, `|`, `&&`, `>` en `<` worden geweigerd.

---

## Databaserechten

De dump draait als [`DB_USER`](../customization/server.html#env_DB_USER), en heeft niet meer rechten nodig dan de applicatie zelf:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

De dump wordt gemaakt met `--no-tablespaces`, zodat het serverbrede recht `PROCESS` niet nodig is, en slaat de tabellen over
die de draaiende processen beschrijven (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). Het terugzetten speelt hem af als dezelfde gebruiker.
De pagina **Status** toont een waarschuwing bij de controle **Databasegebruiker** als de gebruiker rechten heeft op elke database, zoals `root`.

---

## Wat een back-up bevat

Elke back-up is een map onder `BACKUP_PATH`, genoemd naar de UTC-tijdstempel (`YYYYMMDDHHmmss`), met daarin:

| Bestand | Inhoud |
|------|---------|
| `ansibleforms.sql` | De dump van de database `AnsibleForms`: gebruikers, groepen, referenties, jobs, instellingen, het audittrail |
| `config.yaml` | Het bestand op [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | De map op [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | Het omgevingsbestand dat de instellingenpagina's schrijven, zonder `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` en `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | De beschrijving van de back-up |

Een back-up waarvan de dump mislukt, wordt weer verwijderd en als fout gelogd. De pagina **Status** waarschuwt als er geen back-up is,
als de nieuwste meer dan twee dagen oud is, of als die geen bruikbare dump heeft, en controleert of het dumptool bestaat.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) bewaart in plaats daarvan de herstelpunten van de designer (standaard 60 dagen).

---

## Een back-up terugzetten

Zet terug vanaf de [pagina **Back-ups**](../gui/administration.html#restore), met **Maak eerst een nieuwe back-up aan voor het herstellen** aangevinkt. Bij het terugzetten:

* wordt `ansibleforms.sql` afgespeeld, wat de hele database vervangt; vanaf 7.3.0 wordt een back-up van een oudere release daarna opnieuw
  bijgewerkt, zoals bij de start van een nieuwe release, en wordt een patch die mislukt gemeld
* wordt `config.yaml` teruggekopieerd en de map `forms/` vervangen door die van de back-up: vanaf 7.3.0 worden formulieren die niet in de back-up staan
  verwijderd in plaats van bewaard, blijven de links en de modus van de map behouden, en draait een mislukte kopie de map terug
* wordt `managed.env` **niet** teruggezet, omdat die de host beschrijft waar de back-up vandaan kwam. De knop **Omgeving herstellen**
  zet hem op verzoek terug, bewaart het huidige bestand als `.env.bak`, en vereist een herstart.

Een back-up zonder bruikbare dump wordt geweigerd; los na een onderbroken terugzetting de oorzaak op en zet opnieuw terug.

Stel op een nieuwe host hetzelfde `ENCRYPTION_SECRET` in voordat je terugzet, anders kunnen de opgeslagen referenties niet worden ontsleuteld.

---

## Wat je verder moet back-uppen

De nachtelijke back-up dekt de database, de configuratie en de formulieren, maar verder niets in de persistente map:

* **`ENCRYPTION_SECRET` en `ACCESS_TOKEN_SECRET`** : nooit in een back-up, bewust. Bewaar ze in je secret manager;
  zonder het versleutelingsgeheim is een databasedump nutteloos voor referenties.
* **de back-ups zelf** : die staan op hetzelfde volume als de instantie. Kopieer `BACKUP_PATH` naar een andere host.
* **de rest van de persistente map** : playbooks, uploads, vars-bestanden, gekloonde repositories, certificaten en logs.
  Maak met het docker-compose-project een back-up van de hele map `data/`, die ook de SSH-sleutel, de eigen
  functies en de Ansible-rollen en -collecties bevat.

Inhoud die uit git komt (repositories, formulieren in een repository) kan opnieuw worden gekloond, dus de back-up ervan is minder belangrijk.

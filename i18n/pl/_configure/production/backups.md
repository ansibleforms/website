---
layout: default
title: Kopie zapasowe
parent: Środowisko produkcyjne
nav_order: 2
redirect_from:
  - /production/backups-and-logs.html
translated_from: 85cd29062adaaa52a93b688dcaddda94ef40a7bd
---

# Kopie zapasowe
{: .no_toc }

Nocne kopie zapasowe, ich zawartość, przywracanie i co jeszcze warto zachować
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Nocne kopie zapasowe

AnsibleForms tworzy własną kopię zapasową każdej nocy o północy, w strefie czasowej [`LOG_TZ`](../customization/logging.html#env_LOG_TZ)
(domyślnie UTC). Sterują tym te ustawienia:

| Zmienna | Domyślnie | Znaczenie |
|----------|---------|---------|
| [`BACKUP_PATH`](../customization/paths.html#env_BACKUP_PATH) | `%PERSISTENT_FOLDER%/backups` | Gdzie zapisywane są kopie zapasowe, każda w folderze ze znacznikiem czasu |
| [`NIGHTLY_BACKUP_RETENTION`](../customization/retention.html#env_NIGHTLY_BACKUP_RETENTION) | `7` | Ile nocnych kopii zapasowych jest przechowywanych, `0` zachowuje wszystkie |
| [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) | `mariadb-dump --ssl-verify-server-cert=OFF` | Polecenie, które zrzuca bazę danych |
| [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) | `mariadb --ssl-verify-server-cert=OFF` | Polecenie, które odtwarza zrzut przy przywracaniu |
| [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) | `3600` | Jak długo mogą trwać zrzut i przywracanie |

Użytkownicy z opcją roli `allowBackupOps` mogą też w dowolnej chwili utworzyć kopię zapasową na stronie **Kopie zapasowe**. Retencja usuwa tylko
nocne kopie zapasowe, a liczą się do niej tylko kopie z użytecznym zrzutem, więc seria nieudanych
nocy nigdy nie wypycha ostatniej dobrej.

Zanim aktualizacja zmieni bazę danych, worker najpierw tworzy zwykłą kopię zapasową, raz na wydanie, o nazwie *Before the upgrade to
&lt;version&gt;*. Pojawia się na stronie **Kopie zapasowe** i nocna retencja nigdy jej nie usuwa. Jeśli się nie uda (brak narzędzia do zrzutu,
brak prawa zapisu w `BACKUP_PATH`), aktualizacja zatrzymuje się i podaje przyczynę, więc aplikacja nigdy nie startuje na częściowo zaktualizowanej bazie danych.
[`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP)`=0` aktualizuje bez kopii zapasowej.

Polecenia mogą być nakładkami, np. `docker exec <container> mysqldump`, o ile ich pierwsze słowo istnieje lokalnie. Od wersji 7.3.0 uruchamiają się
bez powłoki: cudzysłowy i `$NAME` ze środowiska polecenia działają, ale `;`, `|`, `&&`, `>` i `<` są odrzucane.

---

## Uprawnienia w bazie danych

Zrzut działa jako [`DB_USER`](../customization/server.html#env_DB_USER) i nie potrzebuje więcej uprawnień niż sama aplikacja:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

Zrzut jest wykonywany z `--no-tablespaces`, więc globalne uprawnienie `PROCESS` nie jest potrzebne, i pomija tabele
opisujące działające procesy (`nodes`, `cache_epochs`, `designer_lock`, `runner_leases`). Przywracanie odtwarza go jako ten sam użytkownik.
Strona **Stan** pokazuje ostrzeżenie przy sprawdzeniu **Użytkownik bazy danych**, gdy użytkownik ma uprawnienia do każdej bazy danych, tak jak `root`.

---

## Co zawiera kopia zapasowa

Każda kopia zapasowa to folder w `BACKUP_PATH`, nazwany od jej znacznika czasu UTC (`YYYYMMDDHHmmss`), zawierający:

| Plik | Zawartość |
|------|---------|
| `ansibleforms.sql` | Zrzut bazy danych `AnsibleForms`: użytkownicy, grupy, poświadczenia, zadania, ustawienia, ślad audytu |
| `config.yaml` | Plik z [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| `forms/` | Folder z [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) |
| `managed.env` | Plik środowiska zapisywany przez strony ustawień, bez `ENCRYPTION_SECRET`, `ENCRYPTION_SECRET_PREVIOUS` i `ACCESS_TOKEN_SECRET` |
| `meta.yaml` | Opis kopii zapasowej |

Kopia zapasowa, której zrzut się nie udał, jest z powrotem usuwana i zapisywana w dzienniku jako błąd. Strona **Stan** ostrzega, gdy nie ma żadnej kopii zapasowej,
gdy najnowsza ma więcej niż dwa dni lub gdy nie ma użytecznego zrzutu, i sprawdza, czy narzędzie do zrzutu istnieje.

[`OLD_BACKUP_DAYS`](../customization/retention.html#env_OLD_BACKUP_DAYS) dotyczy natomiast punktów przywracania projektanta (domyślnie 60 dni).

---

## Przywracanie kopii zapasowej

Przywracaj ze [strony **Kopie zapasowe**](../gui/administration.html#restore), z zaznaczonym **Utwórz nową kopię zapasową przed przywróceniem**. Przywracanie:

* odtwarza `ansibleforms.sql`, który zastępuje całą bazę danych; od wersji 7.3.0 kopia zapasowa starszego wydania jest potem ponownie
  aktualizowana, jak przy starcie nowego wydania, a łatka, która się nie powiedzie, jest zgłaszana
* kopiuje z powrotem `config.yaml` i zastępuje folder `forms/` folderem z kopii zapasowej: od wersji 7.3.0 formularze, których nie ma w kopii, są
  usuwane, a nie zachowywane, linki i tryb folderu zostają, a nieudane kopiowanie przywraca folder do poprzedniego stanu
* **nie** przywraca `managed.env`, bo opisuje on hosta, z którego pochodzi kopia zapasowa. Przycisk **Przywróć środowisko**
  przywraca go na żądanie, zachowuje bieżący plik jako `.env.bak` i wymaga restartu.

Kopia zapasowa bez użytecznego zrzutu jest odrzucana; po przerwanym przywracaniu usuń przyczynę i przywróć ponownie.

Na nowym hoście ustaw ten sam `ENCRYPTION_SECRET` przed przywróceniem, inaczej zapisanych poświadczeń nie da się odszyfrować.

---

## Co jeszcze zabezpieczyć

Nocna kopia zapasowa obejmuje bazę danych, konfigurację i formularze, ale nic więcej z folderu trwałego:

* **`ENCRYPTION_SECRET` i `ACCESS_TOKEN_SECRET`** : celowo nigdy nie trafiają do kopii zapasowej. Trzymaj je w swoim menedżerze sekretów;
  bez sekretu szyfrowania zrzut bazy danych jest bezużyteczny dla poświadczeń.
* **same kopie zapasowe** : leżą na tym samym wolumenie co instancja. Kopiuj `BACKUP_PATH` na inny host.
* **reszta folderu trwałego** : playbooki, przesłane pliki, pliki zmiennych, sklonowane repozytoria, certyfikaty i dzienniki.
  W projekcie docker-compose zabezpieczaj cały folder `data/`, który zawiera też klucz SSH, własne
  funkcje oraz role i kolekcje Ansible.

Treści pochodzące z gita (repozytoria, formularze w repozytorium) można sklonować ponownie, więc ich kopia zapasowa ma mniejsze znaczenie.

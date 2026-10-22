---
layout: default
title: Natywnie
parent: Instalacja
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Instalacja natywna
{: .no_toc }

AnsibleForms bezpośrednio na serwerze, bez kontenerów, jako usługi systemd konfigurowane przez instalator
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów serwerów, na których kontenery są niedozwolone: [instalator](installer.html) instaluje wszystko, czego AnsibleForms potrzebuje,
bezpośrednio na serwerze, a potem je aktualizuje i usuwa. Instaluje AnsibleForms 7.3.0 lub nowsze.

---

## Czego potrzebuje

Wybierz **Bezpośrednio na tym serwerze, bez kontenerów** w kroku **Silnik** instalatora lub przekaż `--mode native`. Potrzebuje:

* **Uprawnień roota** : uruchom instalator z `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : usługi działają jako jednostki systemd
* **Obsługiwanego Linuksa** : Ubuntu, Debian, RHEL i jego klony, takie jak Rocky Linux i AlmaLinux, SUSE Linux Enterprise lub openSUSE
* **amd64 lub arm64**
* **Dostępu do internetu** : do repozytoriów dystrybucji, GitHub, nodejs.org oraz indeksów pakietów Pythona i Ansible (zobacz
  [Bez dostępu do sieci](#air-gapped), aby dowiedzieć się, co zastępuje paczka wydania)

Na serwerze, który tego nie spełnia, silnik jest wyświetlany jako *Bezpośrednio na tym serwerze (wymaga root: uruchom przez sudo)* lub
*Bezpośrednio na tym serwerze (nieobsługiwane w tym Linuksie)*. W ten sposób instalują się obie role: kontroler i [Runner](installer.html#a-runner).

---

## Co instaluje

Instalator instaluje z pakietów dystrybucji następujące elementy, dla obu ról:

| Pakiet | Do czego |
|---|---|
| `git` | Repozytoria |
| Klient ssh | Połączenia playbooków |
| Klient MariaDB | Kopie zapasowe aplikacji: `app.env` ustawia [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) i [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) na znalezionego klienta, `mariadb-dump` i `mariadb` lub starsze `mysqldump` i `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | Pobieranie plików |
| `libatomic` | Node.js jest z nią linkowany, a minimalnym serwerom jej brakuje |
| `sshpass` | Playbooki, które logują się hasłem ssh. Na RHEL i jego klonach pochodzi z EPEL, który instalator próbuje włączyć przez `epel-release`; gdy nie da się go zainstalować, instalacja trwa dalej i to zgłasza |
| Serwer MariaDB | Tylko kontroler: jego baza danych |

Następnie do folderu instalacji, przy czym każdy pobrany plik jest sprawdzany względem opublikowanej sumy kontrolnej:

* **AnsibleForms** : paczka wydania `ansibleforms-<version>-linux-<arch>.tar.gz` z wydania aplikacji na GitHub, czyli aplikacja zbudowana dla
  Node.js. Wersja bez paczki zgłasza *Instalacja bez kontenerów wymaga AnsibleForms 7.3.0 lub nowszego.*
* **Node.js** : najnowsze wydanie wersji głównej wskazanej przez paczkę, z nodejs.org
* **Python i Ansible** : uv, a za jego pomocą Python z obrazów RTE i środowisko wirtualne z Ansible i bibliotekami
  pełnego obrazu RTE, a następnie jego kolekcje Ansible (zobacz [Obrazy RTE](../rte/images.html)). Zajmuje to kilka minut
* **Pliki startowe** : formularze, playbooki i ustawienia z folderu `data` [projektu docker-compose](https://github.com/ansibleforms/docker),
  tak jak otrzymuje je nowa instalacja Docker Compose. Runner zachowuje tylko swoją konfigurację Ansible, ustawienia ssh i git

Dla kontrolera tworzy następnie schemat `AnsibleForms` w MariaDB oraz użytkownika bazy danych nazwanego od instancji, z wszystkimi uprawnieniami do tego
schematu i żadnymi poza nim, logującego się tylko z tego serwera.

---

## Folder

Wszystko znajduje się w folderze instalacji, domyślnie `/opt/ansibleforms` (lub `/opt/ansibleforms-runner` dla Runnera):

| Ścieżka | Co zawiera |
|---|---|
| `releases/<version>/` | Wydanie: paczkę, jej link do Node.js, jej środowisko wirtualne Pythona i jej kolekcje |
| `current` | Link do działającego wydania; aktualizacja go przestawia, podobnie jak wycofanie |
| `runtime/` | Node.js, uv i Python, współdzielone przez wydania |
| `data/` | To, co kontenery montują jako `/app/dist/persistent`: formularze, playbooki, `config.yaml`, config seed, certyfikaty i dzienniki |
| `home/` | Katalog domowy użytkownika systemowego: `.ssh` i `.gitconfig`, połączone z `data/ssh` i `data/git` |
| `app.env`, `rte.env` | Ustawienia i sekrety usług, czytelne tylko dla roota i użytkownika systemowego. Plik RTE nie zawiera ustawień bazy danych |
| `installer-backups/` | Kopie zapasowe bazy danych tworzone przez instalator, przed aktualizacją lub przez `backup` |

Wydania i środowiska uruchomieniowe należą do roota, więc usługi nie mogą zmieniać własnego kodu; `data/` i `home/` należą do użytkownika systemowego.
Same pliki bazy danych przechowuje MariaDB, poza tym folderem.

---

## Usługi

Kontroler uruchamia dwie usługi systemd, Runner jedną. Każda działa jako użytkownik systemowy nazwany od instancji (domyślnie `ansibleforms`),
z `current/server`, ze swoim plikiem ustawień:

| Usługa | Co uruchamia | Ustawienia |
|---|---|---|
| `<name>` | Aplikację: interfejs webowy, API i workera. Tylko kontroler | `app.env` |
| `<name>-rte` | RTE, które uruchamia playbooki | `rte.env` |

RTE kontrolera jest `inbound`, na własnym porcie na `127.0.0.1` (`8001` lub kolejnym wolnym, z
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), uruchamia playbooki z folderów aplikacji (`RTE_FILES=local`)
i jest deklarowane przez config seed `data/seed.yaml` jako domyślny runner.

RTE Runnera dostaje tryb, `APP_URL`, `RTE_NAME` oraz, z `--join`, token dołączenia, a playbooki otrzymuje razem z każdym zadaniem (zobacz
[Tryby](../rte/modes.html)). Wychodzące nie przyjmuje wywołań od aplikacji, więc nasłuchuje tylko na `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Przychodzące udostępnia HTTPS z własnym certyfikatem samopodpisanym dla swojego adresu w `data/certificates`, który AnsibleForms przypina.
Bez tokenu dołączenia prosi o dołączenie, a administrator zatwierdza je w **Połączenia > Runnery**.

Uruchamiają się przy starcie systemu i restartują po awarii. Zarządzaj nimi i czytaj ich dzienniki własnymi narzędziami systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

Aplikacja może nasłuchiwać na porcie poniżej 1024, na przykład `443`, bez uprawnień roota. RTE zachowuje prawo do używania `sudo`, którego potrzebują playbooki z
`become` na tym serwerze, więc playbook może zarządzać serwerem, na którym działa RTE.

---

## Aktualizacja i wycofanie

`sudo /usr/local/bin/ansibleforms-installer upgrade` aktualizuje instalację natywną tak samo jak pozostałe (zobacz [Aktualizacja](installer.html#upgrade)), w
tej kolejności:

1. Umieszcza nowe wydanie obok działającego: jego paczkę, Node.js, Python, Ansible i kolekcje. Działające
   usługi nie są jeszcze ruszane
2. Dodaje nowe pliki startowe, które przynosi wydanie, zachowując każdy istniejący plik
3. Wykonuje kopię zapasową bazy danych (kontroler) do `installer-backups/`, z kopią `app.env` i `rte.env`
4. Zatrzymuje usługi, przestawia `current` na nowe wydanie i uruchamia je ponownie
5. Czeka, aż aplikacja odpowie nową wersją (Runner: aż jego RTE znów zacznie nasłuchiwać)

Gdy nowa wersja nie odpowiada, instalator proponuje wycofanie: `current` znów wskazuje poprzednie wydanie,
baza danych jest przywracana z kopii zapasowej, a usługi się uruchamiają. Zachowywane są tylko działające wydanie i poprzednie.

Usługi natywne w układzie instalatora bez `installer.json` obok nich, na przykład po jego usunięciu, są wykrywane przez `install`
i `upgrade`, które proponują ich przejęcie (zobacz [Istniejąca instalacja](installer.html#an-existing-installation)).

---

## Odinstalowanie

`sudo /usr/local/bin/ansibleforms-installer uninstall` zatrzymuje i usuwa usługi. Zachowuje folder i bazę danych, chyba że zdecydujesz się usunąć
dane (lub przekażesz `--purge`) i wpiszesz nazwę instancji, aby to potwierdzić. Wtedy usuwa też bazę danych i jej użytkownika (kontroler),
usuwa folder i usuwa użytkownika systemowego.

Pakiety pozostają zainstalowane, w tym MariaDB: może z nich korzystać inne oprogramowanie.

---

## Bez dostępu do sieci

`--bundle` instaluje z paczki wydania skopiowanej na serwer, zamiast pobierać ją z GitHub. Weź plik dla
swojej architektury, `ansibleforms-<version>-linux-amd64.tar.gz` lub `-arm64`, z [Releases](https://github.com/ansibleforms/ansibleforms/releases) aplikacji:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` robi to samo dla plików startowych, z lokalnej kopii repozytorium [ansibleforms/docker](https://github.com/ansibleforms/docker).
Node.js, Python z jego pakietami i kolekcje Ansible są nadal pobierane podczas instalacji.

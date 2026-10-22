---
layout: default
title: Docker
parent: Instalacja
nav_order: 3
translated_from: d178cc481311c66fba52c62ac7bf5841b5f83316
---

# Docker
{: .no_toc }

Uruchom obrazy aplikacji AnsibleForms i RTE w Docker lub Podman, obok własnego serwera MySQL
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Możesz uruchomić AnsibleForms w Docker lub Podman jako dwa kontenery, aplikację i RTE, które uruchamia playbooki, połączone z bazą danych MySQL.

---

## Wymagania wstępne

Zanim zaczniesz, potrzebujesz:

* **Docker lub Podman** : jedno z nich zainstalowane i uruchomione
* **MySQL** : zainstalowany i uruchomiony

---

## Instalacja MySQL

Zainstaluj MySQL 8+ lub MariaDB na serwerze Linux, do którego kontener ma dostęp:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Ubuntu dostarcza MySQL 8:

```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Debian dostarcza MariaDB zamiast MySQL, którą AnsibleForms również obsługuje:

```bash
sudo apt-get update
sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

RHEL 8 i nowsze oraz jego klony dostarczają MySQL 8 w AppStream:

```bash
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
```

</div>
</div>

AnsibleForms łączy się z bazą danych przez sieć, jako `DB_USER` z `DB_PASSWORD`. Daj mu osobnego użytkownika, z uprawnieniami tylko do
schematu `AnsibleForms`, a nie roota:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

To wszystko, czego AnsibleForms potrzebuje: z tymi uprawnieniami tworzy i aktualizuje swój schemat oraz wykonuje kopie zapasowe. Strona **Stan** i dziennik
ostrzegają, gdy użytkownik ma uprawnienia do wszystkich baz danych. Na Ubuntu i Debianie serwer nasłuchuje tylko na localhost: ustaw `bind-address` w jego
konfiguracji, aby kontenery mogły się z nim połączyć.

---

## Przygotowanie folderów

AnsibleForms 7 działa w dwóch kontenerach: aplikacji i RTE (runtime environment), które uruchamia playbooki. Oba montują folder na
Twój `config.yaml`, formularze, playbooki, dzienniki i certyfikaty oraz folder na klucz SSH. Obrazy działają jako użytkownik `node` (uid 1000),
więc przekaż temu użytkownikowi oba foldery:

```bash
sudo mkdir -p /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh
```

Umieść ustawienia aplikacji w pliku środowiska: połączenie z bazą danych,
[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET), zanim zapiszesz jakiekolwiek poświadczenie, token współdzielony przez aplikację i
RTE ([`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), co najmniej 16 znaków) oraz config seed, który deklaruje RTE:

```bash
sudo tee /srv/apps/ansibleforms/ansibleforms.env > /dev/null <<'END'
DB_HOST=192.168.0.1
DB_PORT=3306
DB_USER=ansibleforms
DB_PASSWORD=<password>
ENCRYPTION_SECRET=<a long random string>
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml
END
sudo chmod 600 /srv/apps/ansibleforms/ansibleforms.env
```

RTE dostaje własny plik, bez ustawień bazy danych: od wersji 7.3.0 aplikacja łączy się z nim i utrzymuje otwarty jeden WebSocket
(`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)), a RTE uruchamia playbooki z tych samych folderów (`RTE_FILES=local`):

```bash
sudo tee /srv/apps/ansibleforms/rte.env > /dev/null <<'END'
RTE_MODE=inbound
RTE_TOKEN=<the same token>
RTE_FILES=local
PORT=8000
HTTPS=0
END
sudo chmod 600 /srv/apps/ansibleforms/rte.env
```

[Config seed](../seed/) deklaruje poświadczenie RTE z adresem RTE i jego tokenem oraz domyślny runner `rte`, który się
nim loguje:

```bash
sudo tee /srv/apps/ansibleforms/persistent/seed.yaml > /dev/null <<'END'
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
END
sudo chown 1000:1000 /srv/apps/ansibleforms/persistent/seed.yaml
```

---

## Uruchomienie kontenerów

Uruchom opublikowane obrazy z GitHub Container Registry (zobacz [Tagi obrazów](./#image-tags)):
[`ghcr.io/ansibleforms/ansibleforms`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms) dla aplikacji i
[`ghcr.io/ansibleforms/ansibleforms-rte-full`](https://github.com/ansibleforms/ansibleforms/pkgs/container/ansibleforms-rte-full) dla RTE.

Seed dodaje RTE w **Połączenia > Runnery** jako runner `rte`, domyślny, więc formularze playbooków działają na nim bez dalszej
konfiguracji. Aplikacja tworzy schemat przy pierwszym uruchomieniu i łączy się z RTE, gdy oba działają (przykładowy `config.yaml` jest w
[projekcie docker-compose](https://github.com/ansibleforms/docker/blob/main/data/config.yaml)):

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker network create ansibleforms

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Po uruchomieniu oba kontenery są widoczne na liście:

```bash
docker ps
CONTAINER ID   IMAGE                                          COMMAND                  CREATED          STATUS                    PORTS                    NAMES
5c0e2a91d7f4   ghcr.io/ansibleforms/ansibleforms-rte-full:7   "/usr/bin/tini -- no…"   10 seconds ago   Up 9 seconds (healthy)                             rte
d91f7b05b67e   ghcr.io/ansibleforms/ansibleforms:7            "/usr/bin/tini -- no…"   2 minutes ago    Up 2 minutes (healthy)    0.0.0.0:8000->8000/tcp   ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman przyjmuje te same opcje i nie wymaga usługi:

```bash
podman network create ansibleforms

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Po uruchomieniu oba kontenery są widoczne na liście:

```bash
podman ps
```

</div>
</div>

Aplikacja nasłuchuje na porcie `8000`, przez HTTP, chyba że ustawisz `HTTPS=1`. RTE nie jest publikowane na hoście: łączy się z nim tylko aplikacja, wewnątrz
sieci. `--stop-timeout 30` daje RTE czas, aby przy zatrzymaniu pozwolić działającym playbookom się zakończyć (zobacz
[Uruchamianie RTE](../rte/run.html), gdzie opisano ustawienia RTE i budowanie własnego RTE).

---

## Test aplikacji

Gdy kontenery działają, otwórz AnsibleForms w przeglądarce:

* Otwórz `http://your_ip:8000` (lub HTTPS, jeśli ustawiłeś `HTTPS=1`)
* Zaloguj się jako `admin` / `AnsibleForms!123` (lub hasłem ustawionym przez `ADMIN_PASSWORD`) i wybierz nowe hasło
* Sprawdź w **Połączenia > Runnery**, czy RTE jest wymienione jako `rte`, domyślny runner, i czy jego strona pokazuje
  **Połączenie** jako **Połączony**
* Następne kroki:
  * Twórz formularze, dodając pliki YAML do folderu `forms` lub korzystając z wbudowanego projektanta
  * Dodaj swoje playbooki do folderu `playbooks` w zamontowanym folderze trwałym
  * Dodaj połączenie LDAP
  * Dodaj użytkowników i grupy
  * Dodaj runnery dla formularzy szablonów: AWX, AAP lub Ascender, Semaphore, Rundeck lub Jenkins
  * Dodaj poświadczenia do połączeń zewnętrznych, na przykład z innymi serwerami MySQL lub API REST, albo do przekazywania do playbooków Ansible

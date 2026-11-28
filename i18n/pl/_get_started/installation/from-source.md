---
layout: default
title: Ze źródeł
parent: Instalacja
nav_order: 5
translated_from: 5a30cd6f93473aa6d47bf91aabbe13af37d97127
---

# Ze źródeł
{: .no_toc }

Zbuduj AnsibleForms ze źródeł i uruchom go za pomocą Node.js
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jak zorganizowany jest kod

Repozytorium zawiera dwie aplikacje Node.js, a budowanie łączy je w jedną:

* **client** : interfejs webowy, napisany w Vue 3 i budowany do plików statycznych za pomocą Vite
* **server** : API, napisane w Express. Przekazuje zadania runnerom, łączy się z bazą danych i udostępnia zbudowanego klienta.
  Uruchomiony z `AF_ROLE=rte`, ten sam serwer jest RTE (runtime environment), które uruchamia playbooki

Budowany jest tylko klient; jego wynik trafia do folderu `views` serwera, tak jak w [obrazie Docker](https://github.com/ansibleforms/ansibleforms/blob/main/Dockerfile).

---

## Wymagania wstępne

Budowanie i uruchamianie ze źródeł wymaga solidnej znajomości Linuksa i pewnej wiedzy o Node.js. Każdy komponent instalujesz samodzielnie. Aby
uruchomić AnsibleForms bez kontenerów i bez budowania, [instalacja natywna](native.html) instalatora zrobi to wszystko za Ciebie:

* **Node.js 26** (wersja z `.nvmrc`; co najmniej 24), z npm
* **Git**, aby pobrać kod i synchronizować repozytoria
* **Klient OpenSSH**, dla git przez SSH, oraz **sshpass**, dla playbooków łączących się hasłem SSH
* **Klient MariaDB** (`mariadb`, `mariadb-dump`), do kopii zapasowych i przywracania, także z serwerem MySQL
* **MySQL 8+ lub MariaDB**, dostępny z serwera
* **Ansible**, dla procesu RTE, który uruchamia playbooki (`ansible-playbook` w jego ścieżce). Sam proces aplikacji nie potrzebuje
  Ansible ani Pythona, a mając tylko formularze szablonów (AWX, AAP, Ascender i pozostałe runnery), w ogóle nie potrzebujesz RTE

Zainstaluj je dla swojej dystrybucji:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

Node.js 26 pochodzi z repozytorium NodeSource, pozostałe narzędzia z samego Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

Node.js 26 pochodzi z repozytorium NodeSource, pozostałe narzędzia z samego Debiana:

```bash
curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash -
sudo apt-get install -y nodejs git openssh-client sshpass mariadb-client python3 python3-pip ansible
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

Node.js pochodzi z NodeSource, a `sshpass` z EPEL (na samym RHEL włącz EPEL tak, jak opisuje to Red Hat):

```bash
curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash -
sudo dnf install -y epel-release
sudo dnf install -y nodejs git openssh-clients sshpass mariadb python3 python3-pip ansible-core
```

</div>
</div>

Sprawdź `node --version` (26) i `ansible-playbook --version`; bazę danych i jej użytkownika opisuje [Instalacja MySQL](docker.html#install-mysql).

---

## Pobranie kodu

Sklonuj repozytorium do wybranego folderu, którego właścicielem jest użytkownik uruchamiający aplikację. Przykłady używają `/srv/apps/ansibleforms`:

```bash
sudo mkdir -p /srv/apps
sudo chown $USER /srv/apps
cd /srv/apps
git clone https://github.com/ansibleforms/ansibleforms.git
cd ansibleforms
```

---

## Budowanie

Zbuduj w trzech krokach, z folderu repozytorium. Najpierw zbuduj klienta:

```bash
cd client
npm ci
npm run build
```

Następnie zainstaluj zależności serwera:

```bash
cd ../server
npm ci --omit=dev
```

Na koniec skopiuj zbudowanego klienta do folderu `views` serwera:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

---

## Konfiguracja

Serwer odczytuje swoje ustawienia ze zmiennych środowiskowych oraz, w produkcji, także z `server/persistent/.env`, pliku,
do którego zapisują strony ustawień.

Zacznij od pliku przykładowego w katalogu głównym repozytorium i ustaw co najmniej połączenie z MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`):

```bash
cd /srv/apps/ansibleforms/server
mkdir -p persistent
cp ../.env.example persistent/.env
```

Wszystkie zmienne są opisane w [Zmienne środowiskowe](../customization). Wszystko inne jest domyślnie przechowywane w `server/persistent`:
`config.yaml`, folder `forms` i certyfikaty samopodpisane są tam tworzone przy pierwszym uruchomieniu, obok dzienników.
Umieść swoje playbooki w `server/persistent/playbooks` lub wskaż inne miejsce przez `ANSIBLE_PATH` w środowisku RTE, które je odczytuje.

---

## Uruchomienie

Uruchom AnsibleForms w trybie produkcyjnym lub w trybie deweloperskim, aby pracować nad samym kodem:

<div class="af-tabs" data-tab-group="mode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="production" aria-selected="true">Produkcja</button>
<button type="button" role="tab" class="af-tab" data-tab="development" aria-selected="false">Rozwój</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="production" markdown="1">

Uruchom serwer w trybie produkcyjnym z folderu `server`:

```bash
cd /srv/apps/ansibleforms/server
npm run start
```

Aplikacja uruchomiona z wiersza poleceń zatrzymuje się po wylogowaniu. [PM2](https://pm2.keymetrics.io/) utrzymuje ją uruchomioną w
tle, restartuje po awarii i uruchamia ponownie przy starcie systemu:

```bash
sudo npm install -g pm2

cd /srv/apps/ansibleforms/server
NODE_ENV=production pm2 start index.js --name ansibleforms
pm2 save
pm2 startup   # prints the command that starts PM2 at boot
```

Playbooki działają na RTE: uruchom ten sam serwer drugi raz z `AF_ROLE=rte`, na własnym porcie. Aplikacja łączy się z nim i utrzymuje
otwarty jeden WebSocket (`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)), a RTE uruchamia playbooki z tych samych folderów
(`RTE_FILES=local`). Ono również odczytuje `persistent/.env`, ale nie używa żadnych ustawień bazy danych. Dodaj do `persistent/.env` token współdzielony przez aplikację i RTE,
o długości co najmniej 16 znaków, oraz config seed, który deklaruje RTE:

```bash
RTE_TOKEN=<at least 16 characters>
CONFIG_SEED_PATH=/srv/apps/ansibleforms/server/persistent/seed.yaml
```

[Config seed](../seed/) deklaruje poświadczenie RTE z adresem RTE i jego tokenem oraz domyślny runner `rte`, który się
nim loguje:

```yaml
version: 1
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://127.0.0.1:8010
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Bez seeda dodaj je w **Połączenia > Poświadczenia** (poświadczenie RTE z tym adresem i tokenem) oraz
**Połączenia > Runnery** (typ RTE, **Tryb** **Przychodzący**). Następnie uruchom RTE, tylko na `127.0.0.1`:

```bash
cd /srv/apps/ansibleforms/server
AF_ROLE=rte RTE_MODE=inbound RTE_FILES=local PORT=8010 HTTPS=0 LISTEN_HOST=127.0.0.1 \
  NODE_ENV=production pm2 start index.js --name ansibleforms-rte
pm2 save
```

Ustawienia RTE są opisane na stronie [Uruchamianie RTE](../rte/run.html). Sprawdź, czy PM2 wyświetla oba procesy:

```bash
pm2 status
```

Oba mają stan `online`:

```text
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| id | name             | mode | version | pid  | uptime | restarts | status | cpu | mem     | user | watching |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
| 0  | ansibleforms     | fork | 7.0.0   | 3104 | 8s     | 0        | online | 0%  | 120.1mb | root | disabled |
| 1  | ansibleforms-rte | fork | 7.0.0   | 3187 | 5s     | 0        | online | 0%  | 80.4mb  | root | disabled |
+----+------------------+------+---------+------+--------+----------+--------+-----+---------+------+----------+
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="development" markdown="1" hidden>

Aby pracować nad samym kodem, uruchom wszystko z katalogu głównego repozytorium z przeładowaniem na żywo: serwer na porcie 3001, RTE na porcie 8010
i klienta pod `https://localhost:8443`. W tym trybie serwer i RTE odczytują zamiast tego `server/.env.development`:

```bash
cd /srv/apps/ansibleforms
npm install
(cd server && npm install && cp ../.env.example .env.development)
(cd client && npm install)
npm run dev
```

RTE (`npm run dev:rte`) wymaga `ansible-playbook` w ścieżce i dodaje się jako runner w trybie bazy danych, przestarzałym,
wyłącznie na potrzeby rozwoju; `npm run dev:local` uruchamia klienta i serwer bez niego. [Przewodnik dla kontrybutorów](https://github.com/ansibleforms/ansibleforms/blob/main/CONTRIBUTING.md) opisuje testy i sprawdzenia do uruchomienia.

</div>
</div>

---

## Pierwsze uruchomienie

Otwórz serwer w przeglądarce (z przykładowym `.env`, `https://your_ip:8443`). Na pustej bazie danych schemat jest tworzony przy
pierwszym uruchomieniu.

Domyślne dane logowania administratora to:

* nazwa użytkownika : `admin`
* hasło : `AnsibleForms!123`

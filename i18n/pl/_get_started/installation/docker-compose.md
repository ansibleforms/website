---
layout: default
title: Docker Compose
parent: Instalacja
nav_order: 4
translated_from: 74a6833ea71d65db337025978672afeab0425666
---

# Docker Compose
{: .no_toc }

Zainstaluj razem AnsibleForms, jego RTE i MySQL za pomocą docker-compose lub podman-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

[Projekt docker-compose](https://github.com/ansibleforms/docker) uruchamia trzy kontenery: MySQL, aplikację AnsibleForms i RTE
(runtime environment), które uruchamia playbooki. Zawiera ich ustawienia, przykładowe formularze i playbooki, więc jedynym dodatkowym wymaganiem jest
Docker lub Podman z narzędziem compose.

[Instalator](installer.html) pobiera ten projekt, wypełnia jego ustawienia i sekrety i uruchamia go jednym poleceniem. Ta strona
opisuje ręczną konfigurację.

---

## Wymagania wstępne

Zanim zaczniesz, potrzebujesz:

* **Maszyny z Linuksem** : dowolna dystrybucja, ze skromnymi zasobami CPU i pamięci
* **Dostępu do GitHub** : aby pobrać lub sklonować projekt docker-compose z GitHub
* **Docker lub Podman** : silnik kontenerów, instalowany poniżej
* **Narzędzia compose** : Docker Compose lub podman-compose, aby uruchomić trzy kontenery z kilku plików konfiguracyjnych

**WIDEO**: [Jak zainstalować AnsibleForms](https://www.youtube.com/watch?v=IHGIggmtTuA)

---

## Wybór miejsca instalacji

Utwórz folder na projekt; przykłady używają `/srv/apps`:

```bash
sudo mkdir /srv/apps
cd /srv/apps
```

---

## Klonowanie projektu docker-compose

Zainstaluj Git:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y git
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y git
```

</div>
</div>

Następnie sklonuj projekt docker-compose do tego folderu:

```bash
sudo git clone https://github.com/ansibleforms/docker.git ansibleforms-docker
cd ansibleforms-docker
```

---

## Ustawienie właściwych uprawnień

Aplikacja i RTE działają jako użytkownik `node` (uid 1000), więc przekaż temu użytkownikowi folder `data`:

```bash
sudo chown -R 1000:1000 ./data
```

Przy przejściu z 6, której kontener działał jako root, uruchom raz to samo `chown` przed uruchomieniem 7. MySQL przy starcie sam przejmuje z powrotem swój folder.

---

## Instalacja silnika kontenerów

Zainstaluj Docker lub Podman, każdy z jego narzędziem compose:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Zainstaluj Docker Engine z wtyczką Compose z repozytorium Dockera
(zobacz [instrukcje instalacji Dockera](https://docs.docker.com/engine/install)):

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
# Docker's own apt repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
# Docker's own dnf repository (Rocky / Alma : use .../linux/centos/docker-ce.repo)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

</div>
</div>

Następnie umożliw rozwiązywanie nazw wewnątrz kontenerów i uruchom Docker jako usługę:

```bash
sudo mkdir -p /etc/docker
echo "{\"dns-opts\":[\"ndots:15\"]}" | sudo tee /etc/docker/daemon.json
sudo systemctl enable --now docker
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

Podman nie wymaga usługi. Zainstaluj go razem z podman-compose:

<div class="af-tabs" data-tab-group="linux">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="ubuntu" aria-selected="true">Ubuntu</button>
<button type="button" role="tab" class="af-tab" data-tab="debian" aria-selected="false">Debian</button>
<button type="button" role="tab" class="af-tab" data-tab="rhel" aria-selected="false">RHEL / Rocky / Alma</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ubuntu" markdown="1">

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="debian" markdown="1" hidden>

```bash
sudo apt-get install -y podman podman-compose
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="rhel" markdown="1" hidden>

```bash
sudo dnf install -y podman
# podman-compose comes from EPEL (on RHEL, enable EPEL as Red Hat documents it)
sudo dnf install -y epel-release
sudo dnf install -y podman-compose
```

</div>
</div>

</div>
</div>

---

## Dostosowanie

Przejrzyj zmienne w plikach `.env` i `docker-compose.yml` i zmień każde hasło: `MYSQLDB_ROOT_PASSWORD`,
`MYSQLDB_PASSWORD`, `ADMIN_PASSWORD` i `RTE_TOKEN`. [Dowiedz się więcej o zmiennych środowiskowych](../customization)

Aplikacja łączy się z MySQL jako `ansibleforms` (`MYSQLDB_USER`), z wszystkimi uprawnieniami do schematu `AnsibleForms` i żadnymi
poza nim; root służy tylko samemu MySQL. MySQL tworzy tego użytkownika wyłącznie przy pierwszym uruchomieniu: instalacja, która dotąd łączyła się jako root,
tworzy go raz, tak jak pokazuje [README](https://github.com/ansibleforms/docker#database) projektu.

RTE nie jest publikowane na hoście. Od wersji 7.3.0 aplikacja łączy się z nim pod `http://rte:8000` z `RTE_TOKEN` i utrzymuje otwarty jeden WebSocket
(`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)): RTE nie dostaje ustawień bazy danych ani `.env`, tylko swój token i kilka
własnych ustawień w `docker-compose.yml`. Config seed `data/seed.yaml` deklaruje poświadczenie RTE z tokenem i tym
adresem oraz domyślny runner `rte`, w trybie inbound, który się nim loguje. RTE uruchamia playbooki z tego samego folderu `data`
(`RTE_FILES=local`). Gdy Twoje playbooki potrzebują więcej kolekcji lub bibliotek Pythona, zbuduj własne RTE
i wskaż je w usłudze `rte` (zobacz [Budowanie własnego RTE](../rte/images.html#build-your-own-rte)).

---

## Uruchomienie projektu docker-compose

Uruchom trzy kontenery w tle. Aplikacja czeka, aż MySQL będzie w dobrej kondycji, a potem łączy się z RTE:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
# with the older standalone tool : sudo docker-compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose up -d
# podman is service-less : you can run it as any user, with or without sudo
```

</div>
</div>

---

## Test aplikacji

Gdy kontenery działają, otwórz AnsibleForms w przeglądarce:

* Otwórz `https://your_ip` (port 443, zobacz `WEBAPP_LOCAL_PORT` w pliku .env)
* Zaloguj się jako `admin` hasłem `ADMIN_PASSWORD` z pliku `.env`; dopóki jest to wciąż domyślne `AnsibleForms!123`, wybierz nowe hasło
* Sprawdź w **Połączenia > Runnery**, czy RTE jest wymienione jako `rte`, domyślny runner, i czy jego strona pokazuje
  **Połączenie** jako **Połączony**
* Następne kroki:
  * Twórz formularze, dodając pliki YAML do folderu data/forms/ lub korzystając z wbudowanego projektanta
  * Dodaj swoje playbooki do folderu data/playbooks/
  * Dodaj połączenie LDAP
  * Dodaj użytkowników i grupy
  * Dodaj runnery dla formularzy szablonów: AWX, AAP lub Ascender, Semaphore, Rundeck lub Jenkins
  * Dodaj poświadczenia do połączeń zewnętrznych, na przykład z innymi serwerami MySQL lub API REST, albo do przekazywania do playbooków Ansible
  * Podłącz repozytoria Git i wybierz, czy Twoje formularze i/lub playbooki mają być synchronizowane z repozytorium

---

## Struktura plików

Projekt docker-compose ma następującą strukturę folderów:

```bash
.
├── docker-compose.yml # the mysqldb, app and rte containers
├── .env # the settings, see the variables below
└── data # everything that must survive an upgrade, mounted in the app and the rte
    ├── ansible # mounted in the rte only
    │   ├── ansible.cfg # ansible settings
    │   ├── roles # roles you install
    │   └── collections # collections you install
    ├── forms # 1 or more yaml files with forms
    ├── functions # custom javascript functions and jq definitions
    ├── git # .gitconfig for repository connections
    ├── mysql
    │   ├── my.cnf # MySQL settings
    │   └── db # the database files (created at first start)
    ├── playbooks # your ansible playbooks, with sample maintenance playbooks
    ├── repositories # local clones of your git repositories
    ├── ssh # the client sshkey (created at first start)
    ├── config.yaml # categories, roles and constants
    ├── seed.yaml # the config seed: registers the rte as the default runner
    ├── certificates # self-signed certificates (created at first start) - replace with your own
    ├── logs # the logfiles (created at first start)
    ├── backups # database backups (created when needed)
    └── forms_backups # form backups (created when needed)
```

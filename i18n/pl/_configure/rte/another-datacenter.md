---
layout: default
title: Inne centrum danych
parent: RTE
nav_order: 5
translated_from: e2e67586abfd6c910942d1775e5331c1f889727e
---

# RTE w innym centrum danych
{: .no_toc }

Od pustego hosta w drugim centrum danych do RTE w trybie wychodzącym, które uruchamia swój pierwszy playbook
{: .fs-6 .fw-300 }

* TOC
{:toc}

---

Dla administratorów: gdy do zarządzanych hostów drugiego centrum danych trzeba docierać z RTE w tym centrum danych, a nie z pierwszego.

{: .note }
> **Prosta droga.** [Instalator](../installation/installer.html#a-runner) wykonuje wszystkie poniższe kroki na hoście RTE jednym poleceniem:
> `curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner`, z `--join afj_...`, żeby od razu go zatwierdzić.
> Ten runbook robi to samo ręcznie, z Docker lub Podman, żeby można było zobaczyć i dostosować każdą część.

---

## Co otrzymasz na końcu

Aplikacja, jej worker i jej baza danych zostają tam, gdzie są, w centrum danych 1. Centrum danych 2 dostaje host, na którym działa jeden kontener RTE w
trybie wychodzącym ([`RTE_MODE=outbound`](../customization/server.html#env_RTE_MODE), zobacz [Tryby](modes.html#outbound)): łączy się z aplikacją przez
HTTPS i utrzymuje jeden otwarty WebSocket, dołącza jako osobny runner i uruchamia playbooki formularzy, które go wskazują, na zarządzanych
hostach centrum danych 2.

| Gdzie | Co tam działa | Z czym się komunikuje |
|---|---|---|
| Centrum danych 1 | Węzły aplikacji, worker, baza danych (jak dziś) | Nic nowego: przyjmuje gniazdo RTE pod swoim zwykłym adresem HTTPS |
| Centrum danych 2, host RTE | Docker lub Podman i kontener RTE | Z aplikacją pod `APP_URL` przez HTTPS i z zarządzanymi hostami centrum danych 2 |

RTE nie ma poświadczeń do bazy danych ani `ENCRYPTION_SECRET`, tylko własny token. Nic się z nim nie łączy, więc nie potrzebuje otwartego
portu, nazwy DNS ani certyfikatu. Aplikacja wysyła playbooki i inwentarze z każdym zadaniem (`RTE_FILES=transfer`,
domyślnie), więc RTE nie potrzebuje ich kopii ani współdzielonego dysku.

Każde poniższe polecenie uruchamiasz w terminalu na hoście RTE, jako użytkownik z `sudo`, chyba że napisano inaczej. Zajmuje to około 20 minut,
głównie na czekanie na obraz.

---

## 0. Zanim zaczniesz

Zbierz te informacje:

| Co | Skąd pochodzi |
|---|---|
| Adres aplikacji | `APP_URL`: adres, który ludzie otwierają w przeglądarce, np. `https://forms.example.com`, ze ścieżką bazową, jeśli ją ma |
| Certyfikat aplikacji | Podpisany przez publiczne CA, prywatne CA (potrzebujesz jego certyfikatu, krok 6) lub samopodpisany |
| Proxy | `HTTPS_PROXY`, którego to centrum danych używa, żeby dotrzeć do centrum danych 1, jeśli jest |
| Nazwa RTE | Nazwa jego runnera w **Połączenia > Runnery**, którą formularze wskazują przez `runner:`, np. `rte-dc2`: litery, cyfry i `_ . : @ -` |
| Token dołączenia | Opcjonalnie: [token dołączenia](../runners/registration.html#join-tokens) (`afj_...`) zatwierdza RTE od razu. Bez niego zatwierdza je admin (krok 8) |
| Klucz ssh | Klucz prywatny, którym playbooki docierają do zarządzanych hostów, albo uprawnienie do utworzenia go |

Aplikacja musi działać w wersji 7.3.0 lub nowszej. Aby utworzyć token dołączenia dla tego jednego RTE, admin raz wywołuje API (zobacz
[Tokeny dołączenia](../runners/registration.html#join-tokens)):

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <an admin's token>" -H "Content-Type: application/json" \
  -d '{ "name": "rte-dc2", "expiresInHours": 24, "maxUses": 1 }'
```

---

## 1. Przygotuj host

RTE to kontener, więc host potrzebuje silnika kontenerów i niczego więcej: Node.js, python i ansible są w obrazie.

| Potrzeba | Dlaczego |
|---|---|
| Linux na **x86_64** (amd64) | Obrazy RTE są publikowane tylko dla amd64 |
| 2 CPU i 4 GB pamięci lub więcej | Jedno RTE uruchamia naraz do [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooków (10), każdy z jego forkami: dobierz rozmiar pod nie |
| 20 GB wolnego miejsca na dysku | Obraz `-rte-full` ma około 3,3 GB, do tego obraz w trakcie aktualizacji, pliki zadań wysyłane przez aplikację i pliki tymczasowe zadań |
| Docker lub Podman z podman-compose | Do pobrania i uruchomienia obrazu |
| Czas ustawiany przez NTP | Czasy zadań są porównywane z czasem aplikacji |

**Docker**, na Ubuntu lub Debian (inne dystrybucje: [docs.docker.com/engine/install](https://docs.docker.com/engine/install/)):

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl chrony
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker chrony
sudo usermod -aG docker $USER          # log out and in again, so docker works without sudo
docker run --rm hello-world
docker compose version
```

**Podman**, na RHEL, Rocky lub Alma Linux:

```bash
sudo dnf install -y podman podman-compose chrony
sudo systemctl enable --now chronyd
podman run --rm quay.io/podman/hello
```

Z Podman pisz `podman` zamiast `docker` i `podman-compose` zamiast `docker compose` w każdym poniższym poleceniu.

---

## 2. Sieć i zapora

RTE samo otwiera każde połączenie. Nic nie dociera do niego z zewnątrz:

| Skąd | Dokąd | Port | Dlaczego |
|---|---|---|---|
| Host RTE | Aplikacja, pod `APP_URL` (przez `HTTPS_PROXY`, jeśli ustawione) | Port aplikacji, `443` za większością proxy | Gniazdo, którym przechodzą zadania, ich pliki i ich wynik |
| Host RTE | Zarządzane hosty centrum danych 2 | ssh (`22`), WinRM, ich API | Playbooki działają stąd |
| Host RTE | `ghcr.io` | `443` | Do pobrania obrazu, chyba że pochodzi z własnego rejestru lub z pliku (krok 4) |

Nie otwieraj żadnego portu przychodzącego dla RTE. Jego `PORT` (`8000`) udostępnia tylko `/live`, `/ready` i `/metrics`, dla sond na tym hoście.

RTE łączy się z `APP_URL` z dopisanym `/api/v2/rte/socket`, jako WebSocket. Reverse proxy przed aplikacją musi przekazywać upgrade
dla tej ścieżki (zobacz [WebSockety runnerów](../production/reverse-proxy.html#runner-websockets)). Sprawdź stąd, czy aplikacja odpowiada:

```bash
curl -sS https://forms.example.com/api/v2/version
```

---

## 3. Foldery

Wszystko znajduje się w `/opt/af-rte`. RTE działa jako użytkownik `node` (uid 1000), więc jego dane należą do tego uid:

```bash
sudo mkdir -p /opt/af-rte/data/{ssh,certificates,ansible/roles,ansible/collections,git}
sudo touch /opt/af-rte/data/ansible/ansible.cfg /opt/af-rte/data/git/.gitconfig
```

| Folder | W kontenerze | Zawiera |
|---|---|---|
| `data/` | `/app/dist/persistent` | Spool (`rte-spool`: wynik i zakończenie każdego zadania, dopóki aplikacja ich nie zapisze), pliki zadań wysłane przez aplikację (`rte-files`), prywatne CA, biblioteki pythona instalowane przez playbook |
| `data/ssh/` | `/home/node/.ssh` | Klucz ssh i `known_hosts` playbooków |
| `data/ansible/` | `/etc/ansible/...` | `ansible.cfg`, własne role i kolekcje, montowane zamiast wbudowanych |

Trzymaj `data/` na hoście: zrestartowane RTE nadal wysyła to, czego aplikacja nie zapisała, i zachowuje swoją pamięć podręczną plików zadań.

**Klucz ssh.** Skopiuj klucz, którego playbooki używają w centrum danych 1, albo utwórz nowy dla tego centrum danych i przekaż jego publiczną część zarządzanym hostom:

```bash
sudo ssh-keygen -t ed25519 -N "" -C "ansibleforms-rte-dc2" -f /opt/af-rte/data/ssh/id_ed25519
sudo cat /opt/af-rte/data/ssh/id_ed25519.pub      # add it to ~/.ssh/authorized_keys of the managed user on each host
sudo sh -c 'ssh-keyscan host1.dc2.example.com host2.dc2.example.com >> /opt/af-rte/data/ssh/known_hosts'
```

Następnie przekaż wszystko uid 1000, z kluczem czytelnym tylko dla właściciela:

```bash
sudo chown -R 1000:1000 /opt/af-rte/data
sudo chmod 700 /opt/af-rte/data/ssh && sudo chmod 600 /opt/af-rte/data/ssh/id_*
```

---

## 4. Obraz

Wybierz jedną z dwóch opcji.

### Opcja A: oficjalny obraz
{: .no_toc }

Publikowane obrazy są w GitHub Container Registry, publiczne, bez logowania (trzy warstwy opisuje strona [Obrazy](images.html)).
Weź tę samą warstwę co w centrum danych 1. `:7` podąża za najnowszym wydaniem 7, tak jak `:7` aplikacji:

```bash
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Host bez dostępu do internetu dostaje obraz z takiego, który go ma:

```bash
# on a host with internet
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
docker save ghcr.io/ansibleforms/ansibleforms-rte-full:7 | gzip > rte-full-7.tar.gz
# copy the file to the RTE host, then there
docker load < rte-full-7.tar.gz
```

Albo wypchnij go raz do własnego rejestru (`docker tag` i `docker push`) i używaj tej nazwy w kolejnych krokach.

### Opcja B: własny obraz
{: .no_toc }

Gdy playbooki centrum danych 2 potrzebują kolekcji lub bibliotek pythona, których brakuje w oficjalnym obrazie (np. VMware dla vCenter
tego centrum danych), buduj na `ansibleforms-rte-core`:

```bash
sudo mkdir -p /opt/af-rte/build
sudo tee /opt/af-rte/build/Dockerfile >/dev/null <<'EOF'
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
# the collections and python libraries these playbooks use : no root needed, both belong to node
RUN ansible-galaxy collection install community.vmware -p /usr/share/ansible/collections \
 && pip install --no-cache-dir pyvmomi
EOF
docker build --pull -t af-rte-dc2 /opt/af-rte/build
```

Przebudowuj go przy każdym nowym wydaniu aplikacji (zobacz [Zbuduj własne RTE](images.html#build-your-own-rte)). Przy kilku hostach RTE zbuduj
raz i wypchnij do własnego rejestru. Offline użyj `docker save` i `docker load` dla zbudowanego obrazu, jak w opcji A.

---

## 5. Ustawienia

Nowy, własny [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN), co najmniej 16 znaków. To hasło tego RTE: aplikacja
przechowuje je w poświadczeniu RTE runnera i pieczętuje nim sekrety każdego zadania.

```bash
openssl rand -base64 24
```

```bash
sudo tee /opt/af-rte/rte.env >/dev/null <<'EOF'
RTE_MODE=outbound
APP_URL=https://forms.example.com
RTE_NAME=rte-dc2
RTE_TOKEN=<the new token>
# optional, the first time only : approved at once instead of waiting for an admin
RTE_JOIN_TOKEN=<afj_..., or remove this line>
PORT=8000
PYTHONPATH=/app/dist/persistent/python/lib
EOF
sudo chmod 600 /opt/af-rte/rte.env
```

| Zmienna | Znaczenie |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | `outbound`: RTE łączy się z aplikacją. Bez niej RTE startuje w przestarzałym trybie bazy danych |
| [`APP_URL`](../customization/server.html#env_APP_URL) | Adres aplikacji, `http://` lub `https://`, ze ścieżką bazową, jeśli jest |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Nazwa jego runnera. Nieustawiona: jego id węzła, `rte-<hostname>-<port>`, które zmienia się z kontenerem |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Jego własny token, co najmniej 16 znaków. Zachowaj go: od tej pory runner loguje się nim |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcjonalnie: token dołączenia, używany tylko wtedy, gdy jego runner jeszcze nie istnieje lub czeka na zatwierdzenie |

Dodaj te zmienne, gdy wymaga tego sieć:

| Zmienna | Kiedy |
|---|---|
| `HTTPS_PROXY`, `NO_PROXY` | RTE dociera do aplikacji przez proxy: `HTTPS_PROXY=http://proxy.dc2.example.com:3128`. Z hostem wymienionym w `NO_PROXY` (oddzielane przecinkami, `.example.com` dla domeny) łączy się bezpośrednio |
| `NODE_EXTRA_CA_CERTS` | Certyfikat aplikacji pochodzi z prywatnego CA: umieść certyfikat CA w `/opt/af-rte/data/certificates/ca.pem` i ustaw `NODE_EXTRA_CA_CERTS=/app/dist/persistent/certificates/ca.pem` |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `0` akceptuje każdy certyfikat aplikacji, także samopodpisany. Tylko wewnątrz jednej zaufanej sieci: lepiej użyj `NODE_EXTRA_CA_CERTS` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (domyślnie) dostaje playbooki i inwentarze z każdym zadaniem. Zostaw tak, chyba że sam montujesz je na RTE (`local`) |

Pozostałe ustawienia odczytywane przez RTE opisuje strona [Uruchamianie RTE](run.html#settings). `RTE_MAX_JOBS`, `RTE_CACHE_MB`, `RTE_FILES` i
`RTE_DRAIN_SECONDS` można też ustawić później na jego stronie runnera, która wygrywa ze zmienną (zobacz
[Ustawienia RTE](../runners/runner-page.html#an-rtes-settings)).

---

## 6. Uruchom je

Plik compose trzyma całą definicję w jednym miejscu, obok ustawień. W `image:` wpisz obraz z kroku 4:

```bash
sudo tee /opt/af-rte/compose.yml >/dev/null <<'EOF'
services:
  rte:
    image: ghcr.io/ansibleforms/ansibleforms-rte-full:7   # or af-rte-dc2, the image you built
    container_name: af_rte_dc2
    restart: unless-stopped
    # the running playbooks get RTE_DRAIN_SECONDS (25) to finish when the container stops
    stop_grace_period: 40s
    env_file: rte.env
    # the probes, on this host only : nothing connects to an outbound RTE
    ports:
      - "127.0.0.1:8000:8000"
    healthcheck:
      test: ["CMD", "node", "./healthcheck.js"]
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 30s
    volumes:
      - ./data:/app/dist/persistent
      - ./data/ssh:/home/node/.ssh
      - ./data/git/.gitconfig:/home/node/.gitconfig
      - ./data/ansible/ansible.cfg:/etc/ansible/ansible.cfg
      - ./data/ansible/roles:/etc/ansible/roles
      - ./data/ansible/collections:/etc/ansible/collections
EOF
cd /opt/af-rte && docker compose up -d
```

Docker uruchamia go ponownie po restarcie hosta (`unless-stopped`). Podman nie ma demona, który by to robił: włącz `podman-restart.service`
(`sudo systemctl enable --now podman-restart`) albo uruchom kontener jako usługę systemd z plikiem Quadlet. Na hoście z SELinux
w trybie enforcing dodaj `:Z` do każdego wolumenu (`./data:/app/dist/persistent:Z`).

Bez compose ten sam kontener jednym poleceniem:

```bash
docker run -d --name af_rte_dc2 --restart unless-stopped --stop-timeout 40 \
  --env-file /opt/af-rte/rte.env -p 127.0.0.1:8000:8000 \
  -v /opt/af-rte/data:/app/dist/persistent \
  -v /opt/af-rte/data/ssh:/home/node/.ssh \
  -v /opt/af-rte/data/git/.gitconfig:/home/node/.gitconfig \
  -v /opt/af-rte/data/ansible/ansible.cfg:/etc/ansible/ansible.cfg \
  -v /opt/af-rte/data/ansible/roles:/etc/ansible/roles \
  -v /opt/af-rte/data/ansible/collections:/etc/ansible/collections \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

---

## 7. Sprawdź je na hoście

```bash
docker ps --filter name=af_rte_dc2        # STATUS ends in (healthy): the process listens
docker logs -f af_rte_dc2                 # Ctrl+C to stop following
curl -s http://127.0.0.1:8000/ready       # {"status":"ready"} once the socket to the app is open
```

Dziennik pokazuje, jak RTE startuje, łączy się z aplikacją i nawiązuje połączenie:

```
RTE 'rte-dc2' 7.3.0 (outbound, files transfer) listening on http port 8000, token fingerprint abcd-ef12
RTE 'rte-dc2': dialing the app at wss://forms.example.com/api/v2/rte/socket
RTE 'rte-dc2': connected to the app (node af-app1-8000)
```

Bez tokenu dołączenia jeszcze jeden wiersz mówi, że czeka:
`RTE 'rte-dc2': waiting for an admin to approve it under Connections > Runners (fingerprint abcd-ef12)`. Zanotuj odcisk.

`/ready` odpowiada `503` z `not connected to the app`, dopóki gniazdo nie jest otwarte. Healthcheck mówi tylko, że proces nasłuchuje.

---

## 8. Zatwierdź je

Bez tokenu dołączenia RTE poprosiło o dołączenie: **Połączenia > Runnery** pokazuje nad listą pomarańczowe powiadomienie,
**1 Runner czeka na zatwierdzenie**. Otwórz je, sprawdź, czy **Odcisk** jest tym z dziennika RTE, a **Tryb** mówi
Wychodzący, a potem **Zatwierdź** (zobacz [Zatwierdzanie RTE](../runners/registration.html#approving-an-rte)). Zatwierdza tylko admin. Prośba,
której nikt nie obsłuży w ciągu 24 godzin, jest usuwana, a RTE prosi ponownie przy następnym połączeniu z aplikacją.

Z tokenem dołączenia runner jest zatwierdzany od razu, a jego opis wskazuje token dołączenia. W obu przypadkach aplikacja przechowuje token RTE
w nowym poświadczeniu RTE, `rte-dc2-rte`, a RTE od tej pory loguje się własnym `RTE_TOKEN`: `RTE_JOIN_TOKEN` nie jest już
używany i możesz go usunąć z `rte.env`.

---

## 9. Sprawdź je w AnsibleForms

1. **Połączenia > Runnery** wyświetla runner `rte-dc2`, typ RTE. Włącz **Kolumny > Połączenie**, aby zobaczyć na liście **Połączony**
2. Otwórz go. Jego karta **RTE** pokazuje **Tryb** Wychodzący i plakietkę **Połączenie** z **Połączony**; po najechaniu pokazuje węzeł aplikacji, który
   trzyma gniazdo, wydanie RTE i ile jego zadań działa
3. Kliknij **Testuj połączenie**: pokazuje **Runner connection is OK**. Niczego nie wywołuje: odczytuje, który węzeł aplikacji trzyma gniazdo RTE
   (`runner_leases`), i sprawdza kontrakt, którym RTE mówiło przy połączeniu
4. Nadaj mu opis, np. *Centrum danych 2*
5. Zostaw **Domyślne** na runnerze centrum danych 1, chyba że każdy formularz playbooka bez `runner:` ma działać w centrum danych 2

Strona **Stan** wyświetla nowe RTE z jego wersją, obok pozostałych.

---

## 10. Pierwsze zadanie

Sprawdź całą ścieżkę playbookiem, który niczego nie zmienia. W playbookach aplikacji (jej folderze playbooków lub repozytorium, jak w
centrum danych 1) dodaj `ping-dc2.yaml`:

```yaml
- name: Reach the hosts of datacenter 2
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping
      ansible.builtin.ping:
```

Następnie dodaj w projektancie formularz, który wskazuje nowy runner:

```yaml
name: Ping datacenter 2
type: ansible
playbook: ping-dc2.yaml
runner: rte-dc2
inventory: <an inventory with the hosts of datacenter 2>
roles:
  - admin
categories:
  - Default
fields: []
```

Uruchom go. Aplikacja wysyła folder playbooków i inwentarz z zadaniem, a RTE przechowuje je według hasha, więc niezmieniony
folder nigdy nie jest wysyłany dwa razy. Wynik zaczyna się od `Running on RTE rte-dc2 (outbound)`, pokazuje `pong` dla każdego hosta, a zadanie
kończy się sukcesem. Folder większy niż [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (domyślnie 512) nie jest
wysyłany: zadanie kończy się błędem i o tym informuje.

---

## 11. Kieruj do niego formularze

Formularz działa na RTE, które wskazuje, więc dodaj ten sam wiersz do każdego formularza dla centrum danych 2:

```yaml
runner: rte-dc2
```

Domyślny runner i pozostałe typy runnerów opisuje strona [Runnery](../runners.html).

---

## Gdy coś zawiedzie

RTE zapisuje do `docker logs` od poziomu `notice` w górę. Połączenie, które zawodzi, zanim gniazdo się otworzy (nazwa DNS, odrzucony port,
certyfikat), widać tylko jako `RTE: dialing the app again in <n> seconds`, na poziomie `info`: ustaw
[`LOG_CONSOLE_LEVEL=debug`](../customization/logging.html#env_LOG_CONSOLE_LEVEL) w `rte.env` i zrestartuj je, aby zobaczyć
`RTE: socket to wss://...: <the error>`.

| Co widzisz | Gdzie | Co zrobić |
|---|---|---|
| `RTE: set RTE_TOKEN (at least 16 characters) ; refusing to start` | `docker logs` | Brakuje `RTE_TOKEN` w `rte.env` lub jest za krótki |
| `RTE: RTE_MODE=outbound needs APP_URL, the app's address (https://forms.example.com) ; refusing to start` | `docker logs` | Ustaw `APP_URL` w `rte.env` |
| `RTE: APP_URL must be an http or https address, not ... ; refusing to start` | `docker logs` | `APP_URL` musi zaczynać się od `https://` (lub `http://`) |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set)` | `docker logs` | Brakuje `RTE_MODE=outbound` w `rte.env` |
| Brak wiersza `connected to the app`, `/ready` pozostaje `503` | `docker logs`, `/ready` | Sieć z kroku 2: `curl` do aplikacji z tego hosta, proxy (`HTTPS_PROXY`, `NO_PROXY`), certyfikat aplikacji (`NODE_EXTRA_CA_CERTS`, krok 5). Ustaw `LOG_CONSOLE_LEVEL=debug`, aby zobaczyć błąd |
| `the app refused the socket (404)` lub inny status niż 401, 403 i 409 | `docker logs` | Reverse proxy nie przepuszcza WebSocketu na `/api/v2/rte/socket` albo w `APP_URL` brakuje ścieżki bazowej aplikacji |
| `the app refused the socket (401): ... the token of RTE 'rte-dc2' is not the one stored for its runner: check its RTE_TOKEN` | `docker logs` | Istnieje runner `rte-dc2` z innym tokenem. Daj RTE ten token (hasło z poświadczenia runnera) albo usuń runner, żeby RTE poprosiło o dołączenie |
| `the app refused the socket (401): ... the join token (RTE_JOIN_TOKEN) is unknown, revoked, expired or used up` | `docker logs` | Utwórz nowy token dołączenia albo usuń `RTE_JOIN_TOKEN` i zatwierdź RTE (krok 8) |
| `the app refused the socket (409): ... runner 'rte-dc2' exists and is approved: a join token cannot give it a new token ...` | `docker logs` | RTE zostało zainstalowane ponownie z nowym tokenem: użyj tokenu z poświadczenia jego runnera albo poproś admina o jego zmianę |
| `the app refused this RTE (401): dialing again in 10 minutes, or restart it once an admin acted` | `docker logs` | Następuje po odmowie. Usuń jej przyczynę, a potem `docker restart af_rte_dc2` zamiast czekać |
| `waiting for an admin to approve it under Connections > Runners` | `docker logs` | Zatwierdź je (krok 8). Jest połączone, ale do tego czasu nie przyjmuje zadań |
| `the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds` | `docker logs` | Aplikacja i RTE działają w wydaniach z innym [kontraktem](images.html#the-contract): zaktualizuj RTE do wydania aplikacji (zobacz Aktualizacja) |
| **Niepołączony** albo **Testuj połączenie** mówi *the RTE 'rte-dc2' (outbound) is not connected: it has not dialed the app* | Aplikacja | Żaden węzeł aplikacji nie trzyma jego gniazda: RTE jest zatrzymane lub nie może dotrzeć do aplikacji. Przeczytaj jego `docker logs` |
| Zadanie czeka, a potem kończy się błędem *no app node holds a socket to RTE 'rte-dc2' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?* | Wynik zadania | RTE nie było połączone, gdy zadanie czekało |
| `Permission denied` przy kluczu ssh | Wynik zadania | Pliki w `data/` muszą należeć do uid 1000 (krok 3) |
| `UNREACHABLE` dla zarządzanych hostów | Wynik zadania | ssh z tego hosta: klucz, `known_hosts` i zapora w stronę hostów |

Po stronie aplikacji odrzucone RTE widać w dzienniku aplikacji jako `Refused an RTE socket from <address>: <why>`.

---

## Aktualizacja

Gdy aplikacja przechodzi na nowe wydanie, zaktualizuj też ten host. RTE z tym samym kontraktem w międzyczasie działa dalej; gdy wydanie
zmienia kontrakt, mówią o tym jego informacje o wydaniu (zobacz [Kontrakt](images.html#the-contract)). Z `:7` w `compose.yml` lub w
`FROM` Twojego pliku Dockerfile:

```bash
cd /opt/af-rte
docker compose pull                 # option A; for option B: docker build --pull -t af-rte-dc2 build
docker compose up -d
docker image prune -f               # removes the image it no longer uses
```

Aktualizuj je, gdy nie działa na nim żaden playbook: zatrzymanie czeka `RTE_DRAIN_SECONDS` (25) na działające playbooki, a te, które nadal działają,
kończą się wtedy jako porzucone. To, co wypisały przed zatrzymaniem, zostaje w spoolu i jest wysyłane, gdy RTE wróci. Offline wykonaj `docker load`
nowego obrazu (krok 4) przed `docker compose up -d`.

---

## Wycofanie

```bash
cd /opt/af-rte && docker compose down     # or: docker rm -f af_rte_dc2
```

Gniazdo się zamyka, a runner od razu pokazuje **Niepołączony**: żaden węzeł aplikacji nie trzyma już jego gniazda (`runner_leases`). Host,
który znika, nie zamykając go, pokazuje **Niepołączony** w ciągu około minuty, gdy węzeł aplikacji przestanie cokolwiek słyszeć na gnieździe.
Runner zostaje: runner, który dołączył przez gniazdo, nigdy nie jest usuwany samoczynnie. Usuń go w **Połączenia > Runnery**, a jego
poświadczenie `rte-dc2-rte` w **Połączenia > Poświadczenia**. Najpierw usuń wiersz `runner:` z formularzy, które go wskazywały: do tego czasu
ich zadania czekają na RTE, do `RTE_QUEUE_MINUTES`, i kończą się błędem.

---

## Więcej pojemności w centrum danych 2

Powtórz kroki od 1 do 9 na kolejnych hostach centrum danych 2, każdy z własnym `RTE_NAME` i `RTE_TOKEN`, np. `rte-dc2-b`: każdy dołącza jako
osobny runner i przyjmuje do [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooków. Formularz wybiera jeden przez
`runner:`. Dwa RTE z tym samym `RTE_NAME` nie dzielą się pracą: drugie przejmuje gniazdo od pierwszego (zobacz
[Kilka RTE](several.html#several-rtes)).

---

## RTE w trybie bazy danych

Przed wersją 7.3.0 ten runbook konfigurował RTE w trybie bazy danych: miało poświadczenia bazy danych (`DB_*`, `ENCRYPTION_SECRET`), łączyło się
z bazą danych centrum danych 1 przez port `3306`, a aplikacja wywoływała je na jego porcie `8000`. Ten tryb jest przestarzały od wersji 7.3.0 i
zostanie usunięty w 8.0.0. Aby przenieść takie RTE do trybu wychodzącego bez nowego runnera, ustaw na nim `RTE_MODE=outbound`, `APP_URL` i `RTE_NAME` (nazwę
jego runnera), zachowaj jego `RTE_TOKEN` i usuń `DB_*`, `ENCRYPTION_SECRET` oraz `RTE_REGISTER`: zobacz
[Baza danych (przestarzały)](modes.html#database-deprecated). Następnie zamknij port `8000` i port bazy danych, których już nie potrzebuje.

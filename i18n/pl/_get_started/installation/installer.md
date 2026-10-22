---
layout: default
title: Instalator
parent: Instalacja
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# Instalator
{: .no_toc }

Instaluj, aktualizuj i utrzymuj AnsibleForms na serwerze Linux jednym poleceniem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: najszybsza droga do działającej instancji lub do Runnera dla AnsibleForms zainstalowanego gdzie indziej. Od wersji 7.3.0.

---

## Co instaluje

Instalator zadaje kilka pytań w pełnoekranowym kreatorze, pokazuje wszystkie odpowiedzi do przejrzenia i dopiero wtedy zmienia serwer.
Instaluje jedną z dwóch ról, na jednym z czterech silników:

| Rola | Czym jest |
|---|---|
| Kontroler | Pełna aplikacja: interfejs webowy, jego baza danych i własny Runner. Wybierz to przy pierwszej instalacji |
| Runner | RTE, które uruchamia playbooki AnsibleForms zainstalowanego gdzie indziej, na przykład w innej sieci, w DMZ lub w innym centrum danych. Komunikuje się z AnsibleForms przez jeden WebSocket i nie przechowuje poświadczeń do bazy danych |

Silniki, na których je instaluje:

| Silnik | Jak działa |
|---|---|
| Docker | [Projekt Docker Compose](docker-compose.html), na Docker Engine z wtyczką compose. Kontenery restartują się razem z Dockerem |
| Podman | Ten sam projekt na Podman, bez roota lub jako root, z podman-compose. Jednostka systemd uruchamia kontenery przy starcie systemu |
| Kubernetes | [Chart Helm](kubernetes.html), na klastrze, do którego sięga `kubectl`. Kontroler jest udostępniany za ingress; Runner używa trybu runnera chartu |
| Bezpośrednio na tym serwerze | Bez kontenerów: Node.js, MariaDB i Ansible na serwerze, a AnsibleForms jako usługi systemd. Zobacz [Instalacja natywna](native.html) |

Po instalacji ten sam program aktualizuje instalację, tworzy jej kopie zapasowe, pokazuje jej stan i ją usuwa. Przejmuje też
AnsibleForms, którego sam nie zainstalował, na przykład skonfigurowany ręcznie z projektu Docker Compose (zobacz [Istniejąca instalacja](#an-existing-installation)).

---

## Uruchomienie

Skrypt instalacyjny pobiera instalator dla tego serwera i go uruchamia:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Typowe warianty: jako root, aby zainstalować Docker lub Podman, zainstalować bezpośrednio na serwerze lub w `/opt`; z poleceniem lub
flagami (zobacz [Flagi](#flags)); oraz instalator konkretnego wydania zamiast najnowszego:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

Skrypt:

1. Sprawdza, czy serwer działa pod Linuksem na amd64 lub arm64, i odnajduje `curl` lub `wget` oraz `sha256sum`
2. Pobiera `ansibleforms-installer_linux_<arch>` z najnowszego wydania
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases) lub z wydania wskazanego przez `AF_INSTALLER_VERSION`
3. Sprawdza go względem `checksums.txt` wydania i nie używa żadnego pobranego pliku, którego suma kontrolna się różni
4. Zachowuje go jako `ansibleforms-installer`, w `/usr/local/bin` dla roota, a w pozostałych przypadkach w `~/.local/bin`, na potrzeby późniejszych aktualizacji i kopii zapasowych.
   Przez sudo uruchamiaj go pełną ścieżką: `secure_path` sudo, tak jak w systemach Red Hat, często pomija `/usr/local/bin`
5. Uruchamia go z podanymi flagami, odczytując klawiaturę z terminala, mimo że skrypt przyszedł przez potok

Bez terminala, na przykład w zadaniu CI, instalator działa bez nadzoru (zobacz [Bez nadzoru](#unattended)).

---

## Kreator

Kreator zadaje jedno pytanie naraz, a kroki są wymienione po lewej. **Esc** wraca do poprzedniego kroku, z zachowaną odpowiedzią:

| Krok | O co pyta |
|---|---|
| Język | Język instalatora, domyślnie według ustawień regionalnych tego serwera: kataloński, niemiecki, angielski, hiszpański, francuski, włoski, japoński, niderlandzki, polski, portugalski lub chiński. Pytanie pada jako pierwsze, zanim instalator powie cokolwiek o znalezionej instalacji |
| O wydaniu | Co nowego w instalowanej wersji, najpierw zmiany niezgodne wstecz, usunięcia i elementy przestarzałe |
| Rola | Kontroler lub Runner |
| Silnik | Docker, Podman, Kubernetes lub bezpośrednio na tym serwerze |
| Folder | Folder instalacji i nazwa instancji |
| Dołączenie, Aplikacja, Tryb | Tylko Runner: zobacz [Runner](#a-runner). Na Kubernetes bez trybu |
| Sieć | Port interfejsu webowego lub Runnera. Nie na Kubernetes |
| HTTPS | Jak przeglądarki łączą się z kontrolerem |
| Administrator | Hasło pierwszego administratora, wpisywane dwukrotnie |
| Klaster, Ingress, Storage | Tylko Kubernetes: przestrzeń nazw i wydanie, ingress (kontroler), klasa storage |
| Przegląd | Wszystkie odpowiedzi: **Zainstaluj** lub **Zmień odpowiedzi** |

**Silnik.** Lista pokazuje, co ma ten serwer. Silnik, którego brakuje, jest oferowany jako *Docker (niezainstalowany: instalator go zainstaluje)*
lub analogicznie dla Podmana: po potwierdzeniu instalator instaluje Docker własnym skryptem Dockera (`get.docker.com`, łącznie z wtyczką
compose) lub Podman z podman-compose z pakietów dystrybucji. Wymaga to uprawnień roota. Kubernetes jest oferowany, gdy `kubectl` i
`helm` są zainstalowane i sięgają do klastra. *Bezpośrednio na tym serwerze* wymaga uprawnień roota i obsługiwanego Linuksa, a gdy jest wyszarzone, podaje przyczynę.

**Folder.** Wartości domyślne:

| | Kontroler | Runner |
|---|---|---|
| Folder, jako root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Folder, jako inny użytkownik | `~/ansibleforms` | `~/ansibleforms-runner` |
| Nazwa instancji, Docker lub Podman | `af` | `runner` |
| Nazwa instancji, natywnie | `ansibleforms` | `ansibleforms-runner` |

W przypadku Dockera lub Podmana folder zawiera plik compose i jego `.env` z sekretami oraz wszystkie dane: bazę danych, formularze, playbooki
i dzienniki. Musi być pusty. Nazwa instancji, złożona z małych liter, cyfr i `-`, jest prefiksem kontenerów (`af_app`, `af_db`, `af_rte`), więc kilka
instancji może współdzielić serwer. Nazwa instancji Runnera jest też nazwą jego runnera w **Połączenia > Runnery** (`RTE_NAME`).

**Sieć.** Interfejs webowy kontrolera nasłuchuje na `443` lub kolejnym wolnym porcie. **HTTPS** oferuje wtedy:

| Wybór | Co robi |
|---|---|
| HTTPS z certyfikatem samopodpisanym utworzonym dla tego serwera | Certyfikat dla nazw tego serwera, ważny przez dziesięć lat. Przeglądarki raz proszą o jego zaakceptowanie |
| HTTPS z moim własnym certyfikatem i kluczem | Twój własny certyfikat i klucz, w formacie PEM, od Twojego CA lub z Let's Encrypt |
| HTTP, a HTTPS obsługuje reverse proxy przed nim | Zwykły HTTP na porcie, dla nginx, Traefik lub load balancera, który obsługuje HTTPS |

**Administrator.** Hasło użytkownika `admin`, wpisywane dwukrotnie, aby literówka Cię nie zablokowała. Gdy pozostanie puste, instalator generuje
silne hasło.

**Koniec.** Instalator generuje hasło do bazy danych i sekrety, uruchamia AnsibleForms i czeka, aż odpowie. Następnie
pokazuje adres do otwarcia, użytkownika i hasło oraz folder. Runnery zainstalowane dla niego proszą o dołączenie, a administrator zatwierdza
je w **Połączenia > Runnery** (zobacz [Runner](#a-runner)).

---

## Runner

Runner to RTE dla AnsibleForms działającego gdzie indziej, w wersji 7.3.0 lub nowszej. Nie przechowuje poświadczeń do bazy danych: loguje się
własnym tokenem, który AnsibleForms przechowuje w poświadczeniu RTE (zobacz [Tryby](../rte/modes.html)). Po folderze kreator
pyta o trzy kolejne rzeczy:

| Krok | O co pyta |
|---|---|
| Aplikacja | Adres AnsibleForms, dla którego pracuje ten Runner, ten, który ludzie otwierają w przeglądarce |
| Tryb | **Wychodzący: Runner łączy się z AnsibleForms** (domyślnie) lub **Przychodzący: AnsibleForms łączy się z Runnerem** |
| Sieć | Port Runnera, domyślnie `8000`. W trybie wychodzącym nasłuchują na nim tylko kontrole stanu, dostępne wyłącznie z tego serwera. W trybie przychodzącym także adres tego serwera, pod którym sięga do niego AnsibleForms |

`--role runner` pomija pytanie o rolę, więc to polecenie, uruchomione na serwerze Runnera, zaczyna od pytań dla Runnera:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

Instalator łączy się następnie z AnsibleForms. Przy certyfikacie samopodpisanym lub wystawionym przez prywatne CA pyta **Zaufać temu certyfikatowi?**:
tak ustawia [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) na Runnerze. Odczytuje wersję, na której działa AnsibleForms,
odrzuca wersję starszą niż 7.3.0 i instaluje Runner w tej samej wersji, niezależnie od tego, jaką wersję zainstalowałby sam instalator.

Wybierz tryb wychodzący dla DMZ, NAT lub strefy, która nie pozwala na połączenia przychodzące: tylko ruch z tego serwera do AnsibleForms, na jego
porcie. Wybierz tryb przychodzący dla sieci, w których każde połączenie otwiera strona centralna.

Przegląd pokazuje **Rejestracja: prosi o zatwierdzenie** albo **sam, tokenem dołączenia**, gdy podano go przez `--join`. Na koniec instalator
pokazuje nazwę Runnera, jego tryb, aplikację oraz, w trybie przychodzącym, jego adres, a następnie informuje, że poprosił o dołączenie do AnsibleForms: zatwierdź go w
**Połączenia > Runnery** po sprawdzeniu, że widoczny tam odcisk jest tym, który wypisuje:

```
Fingerprint: abcd-ef12
```

Odcisk to pierwsze 8 cyfr szesnastkowych SHA-256 tokenu Runnera, `RTE_TOKEN`, który jest przechowywany w pliku
`.env` folderu (`rte.env` dla [instalacji natywnej](native.html)). Zobacz [Zatwierdzanie RTE](../runners/registration.html#approving-an-rte). Z `--join` Runner jest zatwierdzany od razu:
zarejestrował się sam i jest widoczny jako połączony w **Połączenia > Runnery**.

Przychodzący Runner udostępnia swoje gniazdo przez HTTPS. Instalator tworzy certyfikat samopodpisany dla adresu, pod którym sięga do niego AnsibleForms,
ważny przez dziesięć lat, w `data/certificates` folderu, i ustawia `RTE_URL` na `https://<address>:<port>`.
Runner wysyła certyfikat, gdy prosi o dołączenie, a AnsibleForms go przypina: łączy się z tym Runnerem tylko wtedy, gdy przedstawi
ten sam certyfikat, więc żadne CA nie jest potrzebne. Instalator wypisuje odcisk certyfikatu pod odciskiem tokenu:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

To pierwsze 8 cyfr szesnastkowych SHA-256 bajtów DER certyfikatu, w postaci `xxxx-xxxx`. Zanim zatwierdzisz Runner,
sprawdź, czy okno zatwierdzania pokazuje ten sam odcisk certyfikatu. Runner zarejestrowany z `--join` również go wypisuje.

Na Kubernetes Runner to tryb runnera chartu Helm i zawsze jest wychodzący: kreator nie pyta o tryb ani o sieć, bo nic
nie sięga do niego z zewnątrz (zobacz [Kubernetes](#kubernetes)).

---

## Kubernetes

Dla kontrolera na Kubernetes instalator instaluje [chart Helm](kubernetes.html) na klastrze, do którego sięga `kubectl`:

| Pytanie | Domyślnie |
|---|---|
| Namespace | `ansibleforms` |
| Nazwa wydania Helm | `ansibleforms` |
| Nazwa hosta obsługiwana przez ingress | Brak: wymagana, na przykład `ansibleforms.example.com` |
| Klasa ingress | Jedna z klas klastra, domyślnie `nginx` |
| Udostępniać przez HTTPS (z certyfikatem ingressu)? | Tak |
| Klasa storage dla woluminów | Domyślna klastra |

Hasło administratora jest w Secrecie `<release>-secrets` tej przestrzeni nazw, pod kluczem `ADMIN_PASSWORD`. Instalator przechowuje
wartości chartu w pliku obok swojego pliku stanu, `<release>-values.yaml`, i stosuje je ponownie przy aktualizacjach; `--values` dodaje własny plik. Chart danego wydania jest publikowany krótko po nim.

Dla Runnera instalator instaluje ten sam chart w jego [trybie runnera](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): samo RTE,
bez aplikacji, bazy danych i ingress, które łączy się z AnsibleForms (wychodzące). Po adresie aplikacji kreator pyta o:

| Pytanie | Domyślnie |
|---|---|
| Namespace | `ansibleforms` |
| Nazwa wydania Helm | `ansibleforms-runner`, która jest też nazwą jego runnera w **Połączenia > Runnery** |
| Klasa storage dla woluminów | Domyślna klastra |

Instalator tworzy token Runnera i ustawia adres aplikacji, nazwę runnera oraz, gdy ufasz certyfikatowi aplikacji,
`runner.appTlsVerify: false`. Z `--join` token dołączenia od razu zatwierdza Runner; bez niego Runner prosi o dołączenie, a
instalator wypisuje jego odcisk do sprawdzenia przed zatwierdzeniem w **Połączenia > Runnery**.

---

## Polecenia

Instalator przyjmuje polecenie, przed flagami lub po nich. Bez polecenia instaluje:

| Polecenie | Co robi |
|---|---|
| `install` | Instaluje AnsibleForms, jako kontroler lub Runner (domyślnie). Na serwerze, który ma już instalację, własną lub znalezioną, proponuje jej aktualizację |
| `upgrade` | Aktualizuje do nowszej wersji, najpierw pokazując informacje o wydaniu (zobacz [Aktualizacja](#upgrade)) |
| `status` | Pokazuje instalację (jej rolę, silnik i wersję) oraz jej kontenery, pody lub usługi i to, czy odpowiada. Następnie wymienia inne AnsibleForms znalezione na serwerze |
| `backup` | Od razu tworzy kopię zapasową bazy danych, w `installer-backups` w folderze instalacji (na Kubernetes w `backups` obok pliku stanu instalatora). Runner nie przechowuje danych do kopii zapasowej |
| `release-notes` | Pokazuje informacje o wydaniu danej wersji, `--version` lub wersji tego instalatora, najpierw zmiany niezgodne wstecz |
| `uninstall` | Usuwa instalację, a z `--purge` także jej dane |
| `version` | Wypisuje wersję instalatora |

Instalator zapamiętuje instalację w `/etc/ansibleforms/installer.json` dla roota lub w `~/.config/ansibleforms/installer.json`
dla innego użytkownika, więc polecenia po `install` nie wymagają flag i same znajdują instalację. Ten folder nie zawiera pliku binarnego
i istnieje dopiero wtedy, gdy instalator zainstalował AnsibleForms lub przejął istniejący:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` pyta **Usunąć też dane (baza danych, formularze, playbooki, logi)?**. Aby je usunąć, wpisz nazwę instancji (wydanie Helm
na Kubernetes); w przeciwnym razie usuwa kontenery, pody lub usługi i zachowuje dane.

---

## Flagi

Każda flaga odpowiada na pytanie, które kreator wtedy pomija. `ansibleforms-installer --help` je wymienia:

| Flaga | Na co odpowiada |
|---|---|
| `--lang <code>` | Język: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` lub `zh` |
| `--version <version>` | Wersja AnsibleForms do zainstalowania lub do aktualizacji; domyślnie wersja tego instalatora |
| `--role <role>` | `controller` lub `runner` |
| `--mode <mode>` | `compose`, `kubernetes` lub `native` |
| `--runtime <runtime>` | `docker` lub `podman` (compose) |
| `--install-runtime` | Instaluje Docker lub Podman, gdy go brakuje, bez pytania |
| `--dir <folder>` | Folder instalacji (compose) |
| `--name <name>` | Nazwa instancji, prefiks jej kontenerów (compose, domyślnie `af`) |
| `--port <port>` | Port na hoście: interfejsu webowego dla kontrolera, RTE dla Runnera |
| `--tls <choice>` | `self`, `own` lub `off` (kontroler compose) |
| `--cert <file>`, `--key <file>` | Pliki certyfikatu i klucza, z `--tls own` |
| `--admin-password <password>` | Hasło pierwszego administratora; domyślnie generowane |
| `--join <token>` | Token dołączenia (`afj_...`), utworzony przez API, który od razu zatwierdza Runner (Runner, bez nadzoru; zobacz [Tokeny dołączenia](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | Adres aplikacji, na przykład `https://forms.example.com` (Runner) |
| `--runner-mode <mode>` | `outbound` (RTE łączy się z aplikacją) lub `inbound` (aplikacja łączy się z RTE) (Runner) |
| `--host <address>` | Adres tego serwera, z którym łączy się aplikacja (przychodzący Runner) |
| `--namespace <namespace>` | Przestrzeń nazw Kubernetes, domyślnie `ansibleforms` |
| `--release <release>` | Wydanie Helm, domyślnie `ansibleforms` |
| `--hostname <name>` | Nazwa hosta ingress (kubernetes) |
| `--ingress-class <class>` | Klasa ingress (kubernetes) |
| `--storage-class <class>` | Klasa storage (kubernetes) |
| `--values <file>` | Dodatkowy plik wartości Helm (kubernetes) |
| `--purge` | Z `uninstall`: usuwa też dane |
| `--source <folder>` | Lokalna kopia repozytorium [ansibleforms/docker](https://github.com/ansibleforms/docker), z której ma nastąpić instalacja (bez dostępu do sieci) |
| `--bundle <file>` | Paczka wydania, `ansibleforms-<version>-linux-<arch>.tar.gz`, z której ma nastąpić instalacja natywna (zobacz [Instalacja natywna](native.html#air-gapped)) |
| `--yes` | Odpowiada na każde pytanie wartością domyślną (bez nadzoru) |
| `--verbose` | Pokazuje każde uruchamiane polecenie |

---

## Bez nadzoru

Z `--yes` lub bez terminala instalator o nic nie pyta: flagi odpowiadają na swoje pytania, a wartości domyślne na pozostałe.
Pomija język, informacje o wydaniu, hasło administratora (generowane, chyba że podano je przez `--admin-password`) i przegląd, a zamiast tego wypisuje
link do informacji o wydaniu. Brakujący Docker lub Podman instaluje tylko z `--install-runtime` lub `--yes`, a Runner
wymaga `--app-url`. Bez `--join` Runner prosi o dołączenie i czeka na zatwierdzenie przez administratora; z nim jest zatwierdzany od razu.

Kontroler na Dockerze, z instalacją Dockera, gdy go brakuje:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Przychodzący Runner na Podmanie, z którym aplikacja łączy się pod `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Istniejąca instalacja

Instalator zapamiętuje, co zainstalował, w `installer.json`. Bez tego pliku `install`, `upgrade` i `status` najpierw szukają
AnsibleForms, który już jest na serwerze, niezależnie od tego, co go zainstalowało:

| Znalezione | Jak jest znajdowane | Przejmowane, gdy |
|---|---|---|
| Docker lub Podman | Kontenery z obrazem aplikacji lub RTE, pogrupowane według projektu compose | Folder zawiera plik compose i `.env` z repozytorium [ansibleforms/docker](https://github.com/ansibleforms/docker): usługi `mysqldb`, `app` i `rte`, w kontenerach `<name>_db`, `<name>_app` i `<name>_rte` |
| Runner 7.2 | Samo RTE w swoim projekcie compose, z `DB_*` aplikacji i bez `RTE_MODE` (tryb bazy danych) | Jego plik compose da się odczytać. Jego aktualizacja przenosi go do trybu gniazda (zobacz [Runner 7.2](#a-72-runner)) |
| Kubernetes | Wydania Helm chartu `ansibleforms` oraz Deploymenty i StatefulSety jego obrazów | Jest to wydanie chartu: jego bieżące wartości stają się jego plikiem wartości |
| Natywnie | Usługi systemd, które uruchamiają AnsibleForms z Node.js | Mają układ instalatora: `releases/`, `current`, `app.env` i `rte.env` (zobacz [Instalacja natywna](native.html#the-folder)) |
| Bez silnika | Aplikacja lub RTE odpowiadające na typowym porcie: 443, 3000, 3001, 8000, 8001, 8010 lub 8443 | Nigdy: działa ze źródeł lub uruchomione ręcznie. Instalator tylko to zgłasza |

Liczą się tylko obrazy aplikacji i RTE: kontener MySQL nazwany od AnsibleForms nie jest instalacją. Instalator wymienia to, co
znalazł, po jednym wierszu, z przyczyną i z tym, co zrobić ręcznie w przypadku instalacji, której nie może przejąć: jej plik compose nie pochodzi z repozytorium,
jej baza danych jest poza jej projektem compose, działa na Kubernetes bez chartu Helm, jest zarządzana przez Argo CD (aktualizuj ją tam,
zmieniając wersję chartu w Application) albo nie da się odczytać jej wersji.

Dla instalacji, którą może przejąć, `install` oferuje trzy opcje:

| Wybór | Co robi |
|---|---|
| Przejmij i zaktualizuj | Pokazuje, co zapamięta, a po potwierdzeniu zapisuje `installer.json` i przechodzi do [aktualizacji](#upgrade) |
| Mimo to zainstaluj nowy AnsibleForms obok | Druga instalacja, z własnym folderem, portami i bazą danych, po osobnym potwierdzeniu |
| Zatrzymaj | Nic nie jest zmieniane |

Dla instalacji, która już działa w wersji, jaką zainstalowałby instalator, pierwszą opcją jest zamiast tego **Przejmij**: instalator
zapamiętuje, gdzie jest i jak działa, na potrzeby kopii zapasowych, stanu i kolejnych aktualizacji, a teraz nic nie jest zmieniane.

`upgrade` oferuje to samo bez drugiej opcji i zatrzymuje się, gdy nie ma czego przejąć. Bez nadzoru `install` zatrzymuje się z komunikatem,
a `upgrade --yes` przejmuje instalację tylko wtedy, gdy znajdzie dokładnie jedną, którą może przejąć. Bieżące wartości wydania Kubernetes są
zapisywane obok `installer.json`, a aktualizacje stosują je ponownie z chartem nowej wersji.

---

## Aktualizacja

`ansibleforms-installer upgrade` przenosi instalację na nowszą wersję w obrębie tej samej wersji głównej. Wymienia nowsze wersje,
od najnowszej (bez nadzoru wybiera najnowszą), i pokazuje informacje o wydaniu każdej pomijanej wersji, najpierw zmiany niezgodne wstecz
i usunięcia. Gdy zawierają zmiany niezgodne wstecz, prosi o potwierdzenie, że je przeczytałeś; bez nadzoru kontynuuje tylko z `--yes`.

Instalator tworzy kopię zapasową bazy danych, zanim cokolwiek się zmieni. Gdy nowa wersja nie odpowiada, proponuje wycofanie: wraca poprzednia
wersja, a jej baza danych jest przywracana z tej kopii zapasowej. Nie obniża wersji i nie przekracza wersji głównej: w tym celu postępuj zgodnie z
[przewodnikiem aktualizacji](../upgrade-7.html), na przykład z 6.x do 7.x, z opisem tego, co zrobić na 6.5 przed aktualizacją.

Na Dockerze lub Podmanie aktualizacja kontrolera doprowadza też jego pliki do stanu zgodnego z nową wersją repozytorium docker:

| Plik | Co robi aktualizacja |
|---|---|
| `docker-compose.yml` | Zastępowany plikiem nowej wersji, po zapisaniu kopii w `installer-backups` |
| `.env` | Każdy istniejący wiersz jest zachowywany, a klucze potrzebne nowej wersji są dodawane, z sekretami tworzonymi tak jak przy świeżej instalacji. Najpierw zapisywana jest kopia |
| `data/seed.yaml` | Zastępowany, gdy jest to niezmieniony seed dostarczony z repozytorium docker. Plik zmieniony ręcznie zostaje zachowany, a nowy jest zapisywany obok niego |
| `data/` | Nowe pliki, które przynosi wersja, na przykład nowy playbook, są dodawane. Każdy istniejący plik zostaje zachowany |

Brakującego ustawienia bazy danych (`MYSQLDB_USER` lub hasła) nie da się wymyślić dla istniejącej bazy danych, więc aktualizacja zatrzymuje się wtedy przed
jakąkolwiek zmianą. Wycofanie przywraca plik compose, `.env` i seed do poprzedniego stanu.

Runner działa w tej samej wersji co jego AnsibleForms: najpierw zaktualizuj AnsibleForms, a potem jego Runnery. Aktualizacja Runnera przepisuje jego
plik compose dla nowego obrazu RTE i zachowuje jego `.env` i dane bez zmian.

---

## Runner 7.2

Runner 7.2 działa w trybie bazy danych, przestarzałym od wersji 7.3.0: jego RTE przechowuje ustawienia bazy danych AnsibleForms. Instalator go
znajduje (zobacz [Istniejąca instalacja](#an-existing-installation)), a jego aktualizacja przenosi go do trybu gniazda pod tym samym runnerem:

1. Odczytuje nazwę runnera (`RTE_NAME`) i token (`RTE_TOKEN`) ze starego kontenera RTE. Gdy RTE nie zarejestrowało się samo
   (`RTE_REGISTER=0`), wpisujesz nazwę, którą jego runner ma w **Połączenia > Runnery**
2. Pyta o adres aplikacji i tryb, domyślnie **wychodzący** lub przychodzący, a dla przychodzącego o port i adres tego serwera
3. Pokazuje plan, a następnie tworzy kopię zapasową starego pliku compose i `.env` w `installer-backups`
4. Zapisuje układ Runnera instalatora bez ustawień `DB_*`. Zachowuje `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` i `METRICS_TOKEN`, które RTE w trybie gniazda nadal odczytuje
5. Uruchamia nowe RTE obok starego. Nowe RTE loguje się własnym tokenem runnera, a AnsibleForms samo przenosi runner do
   nowego trybu, **bez zatwierdzania**: jego zadania i formularze, które go wskazują, pozostają bez zmian
6. Gdy nowe RTE jest połączone, stary kontener jest zatrzymywany i usuwany

Przychodzący Runner udostępnia HTTPS z przypiętym certyfikatem, tak jak nowy (zobacz [Runner](#a-runner)), a instalator wypisuje odcisk jego
certyfikatu. Gdy stare RTE zajmuje port potrzebny nowemu, jest najpierw zatrzymywane, więc Runner jest niedostępny, dopóki
nowe się nie połączy. Nowe RTE wychodzącego Runnera zajmuje wolny port na `127.0.0.1` i działa obok starego bez przerwy.

Gdy instalator nie może odczytać tokenu ze starego RTE, wybierasz, jak nowe RTE ma się logować:

| Wybór | Co dalej |
|---|---|
| Wpisz token runnera | Hasło poświadczenia RTE runnera w **Połączenia > Poświadczenia**. Runner zachowuje nazwę i zadania |
| Dołącz jako nowy runner z tokenem dołączenia | [Token dołączenia](../runners/registration.html#join-tokens) dodaje nowy runner pod inną nazwą. Stary runner wycofaj ręcznie |

Gdy nowe RTE się nie łączy, instalator proponuje przywrócenie starych plików i ponowne uruchomienie starego kontenera; jeśli AnsibleForms
zdążyło już przenieść runner, ustaw z powrotem jego tryb na bazę danych w **Połączenia > Runnery**. Gdy nowe RTE jest połączone, nie ma
odwrotu: stare pliki pozostają w `installer-backups`.

Gdy AnsibleForms nie zna runnera o tej nazwie, nowe RTE zamiast tego prosi o dołączenie i czeka na zatwierdzenie. Odrzuć tę prośbę w
**Połączenia > Runnery**, a potem uruchom aktualizację ponownie z nazwą, którą ma tam runner.

---

## Wersje

Wersja instalatora podąża za wersją aplikacji: każde wydanie AnsibleForms ma instalator w tej samej wersji, wydany razem z nim, a
ten instalator domyślnie instaluje tę wersję. `--version` instaluje inną. Każde wydanie na
[stronie Releases instalatora](https://github.com/ansibleforms/installer/releases) zawiera pliki binarne dla Linuksa na amd64 i arm64, wraz z ich
sumami kontrolnymi.

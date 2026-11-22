---
layout: default
title: Konfiguracja w git
parent: Repozytoria git
nav_order: 5
translated_from: 80e30306a069294520da314840328f669e2a2019
---

# Konfiguracja w git
{: .no_toc }

Wszystkie ustawienia przechowywane w repozytorium git, odczytywane i zapisywane w obu kierunkach
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów, którzy chcą przeglądać i wersjonować w git ustawienia, użytkowników i połączenia AnsibleForms, od wersji 7.8.0.

---

## Typy zastosowania

Krok **Zastosowanie** repozytorium, w jego kreatorze i na karcie **Zastosowanie** jego strony, określa, co aplikacja z niego bierze.

Typy są pogrupowane pod sześcioma nagłówkami, każdy z liczbą zawartych typów, na przykład **Projektant (6)**. Każdy typ ma
własne pole wyboru i krótki wiersz mówiący, co repozytorium dla niego zawiera; pole przy nagłówku zaznacza lub odznacza wszystkie typy
tego nagłówka, które można zaznaczyć.

| Nagłówek | Typy zastosowania (flaga) |
|---|---|
| **Projektant** | **Kategorie** (`use_for_categories`), **Stałe** (`use_for_constants`), **Formularze** (`use_for_forms`), **Inwentarze** (`use_for_inventories`), **Playbooki** (`use_for_playbooks`), **Workflowy** (`use_for_workflows`) |
| **Zadania** | **Harmonogramy** (`use_for_schedules`) |
| **System** | **Ogólne** (`use_for_general`) |
| **Wygląd** | **Wartości domyślne** (`use_for_defaults`), **Logo** (`use_for_logo`), **Ikona** (`use_for_icon`), **Nazwa** (`use_for_name`), **Linki** (`use_for_links`), **Etykiety** (`use_for_labels`), **Ogłoszenia** (`use_for_announcements`) |
| **Dostęp** | **Zastrzeżenie** (`use_for_disclaimer`), **Użytkownicy** (`use_for_users`), **Grupy** (`use_for_groups`), **Role** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Połączenia** | **Repozytoria** (`use_for_repositories`), **Poświadczenia** (`use_for_credentials`), **Magazyny sekretów** (`use_for_secret_stores`), **Bazy danych** (`use_for_databases`), **Runnery** (`use_for_runners`), **SSH** (`use_for_ssh`), **Powiadomienia** (`use_for_notifications`), **Asystent czatu** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formularze**, **Inwentarze**, **Playbooki** i **Workflowy** można zaznaczyć w kilku repozytoriach. Formularz uruchamia playbooki
pierwszego repozytorium **Playbooki**, chyba że wskaże własne przez `playbookRepository`. Każdy inny typ należy najwyżej do jednego repozytorium, a drugie
jest odrzucane przez API i przez config seed. Typ, który ma inne repozytorium, jest pokazany jako zaznaczony na szaro i
wyłączony, z podpowiedzią wskazującą to repozytorium: `Już zarządzane przez repozytorium „platform”`.

Włączanie i wyłączanie typu zastosowania to zmiana zastrzeżona dla administratora, tak jak **Uri** i **Gałąź** (zobacz
[Kto może zmieniać repozytorium](adding.html#who-may-change-a-repository)).

---

## Gdzie repozytorium je przechowuje

Repozytorium przechowuje typ w dowolnym pliku YAML, o dowolnej nazwie, w dowolnym folderze: klucz najwyższego poziomu pliku mówi, jaki typ zawiera.

Ten klucz to zawsze `controller_` i klucz typu: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Sprawdzany jest każdy plik `.yaml` lub `.yml` repozytorium, na dowolnej głębokości, z pominięciem ukrytych plików i folderów. Plik może
zawierać kilka typów, a typ może być rozłożony na wiele plików.

| Klucz | Zawiera |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | jedną mapę, dla tego, co aplikacja ma w jednym egzemplarzu; podaje ją najwyżej jeden plik |
| `controller_users:` | listę użytkowników, każdy rozpoznawany po swoim `type` (lokalny, gdy pominięty) i swoim `username` |
| `controller_disclaimer:` | listę wersji, każda rozpoznawana po swoim `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | role, kategorie i stałe, w ich zwykłym formacie |
| każdy inny klucz `controller_` | listę wpisów, każdy rozpoznawany po swoim `name` |

Obiekt jest rozpoznawany po nazwie w obrębie swojego typu, nigdy po pliku: wpis przeniesiony do innego pliku zachowuje swój obiekt. Zwykły klucz
(`credentials:`, `roles:` pliku wymagań Galaxy, `labels:` pliku zmiennych) nie należy do żadnego typu, a aplikacja nigdy go nie odczytuje ani nie
zapisuje. Formularz nigdy nie jest plikiem typu, a klucz typu, do którego repozytorium nie jest używane, pozostaje nietknięty, z uwagą w wyniku
pull.

### Role, kategorie i stałe

Te trzy zachowują format `config.yaml`, teraz każde pod własnym kluczem, we własnym typie zastosowania (po jednym repozytorium).

Każde jest odczytywane z tego pliku swojego repozytorium, który podaje jego klucz na najwyższym poziomie, o dowolnej nazwie i w dowolnym folderze;
jeden plik może podać wszystkie trzy. Gdy żaden plik go nie podaje, nadal odczytywany jest `config.yaml` repozytorium, z jego zwykłymi kluczami
`roles:`, `categories:` i `constants:`: jest to przestarzałe od wersji 7.8.0 i nieodczytywane w 8.0, o czym informują dziennik serwera, wynik pull
i strona repozytorium. Przenieś każdy klucz do osobnego pliku, na przykład `roles.yaml` z `controller_roles:`.

Klucz, którego nie zawiera żadne repozytorium, pochodzi z konfiguracji bazowej, jak dotąd: z jej kopii w bazie danych lub z pliku z
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). Dawnego przełącznika **Używać do konfiguracji?** już nie ma: zaktualizowana
instancja nadaje **Role**, **Kategorie** i **Stałe** repozytorium, które go miało. Config seed, wpisy `controller_repositories:` repozytorium
i API nadal przyjmują `use_for_config` jako przestarzały alias tych trzech, z ostrzeżeniem.

---

## W obu kierunkach: git i aplikacja

Repozytorium używane do typu jest synchronizowane z aplikacją w obu kierunkach, a uruchamiana pozostaje baza danych aplikacji.

| Kierunek | Co się dzieje |
|---|---|
| Z git do aplikacji | Po każdym pull, klonowaniu lub resecie repozytorium oraz przy starcie serwera jego pliki są wczytywane: nowa nazwa tworzy obiekt, zmieniony wpis go zmienia, usunięty wpis go usuwa |
| Z aplikacji do git | Zapis w aplikacji trafia z powrotem do pliku wpisu: tylko zmienione pola, z zachowaniem komentarzy pliku, innych kluczy i innych wpisów. Nowy obiekt trafia na koniec pierwszego pliku podającego klucz typu, a w przeciwnym razie do utworzonego `<key>.yaml` w katalogu głównym (`credentials.yaml`); usunięcie usuwa jego wpis. Czeka na **Push** repozytorium |

Niepoprawny wpis jest odrzucany sam, z jego miejscem i przyczyną, a obiekt o tej nazwie pozostaje bez zmian. Wpis wskazujący
obiekt, którego jeszcze nie ma (runner i jego poświadczenie), czeka i jest wczytywany ponownie przy następnym pull tego typu. Zmiana nazwy
w git jest śledzona, gdy jedna nazwa znika z pliku, a jedna nowa się w nim pojawia, przy reszcie bez zmian.

### Włączanie i wyłączanie zastosowania

Zapisanie repozytorium z włączonym lub wyłączonym typem najpierw pyta, co zrobić, i pokazuje, co zmiana spowoduje.

| Zmiana | Pytanie | Co robi |
|---|---|---|
| Włączenie | **Włącz Poświadczenia**: `Używać platform dla: Poświadczenia?` | Wykonywany jest pull repozytorium i wczytywane są jego wpisy; przy nazwie istniejącej w obu wygrywa git; pozostałe obiekty aplikacji są zapisywane w repozytorium, czekając na **Push**, bez swoich sekretów |
| Wyłączenie | **Wyłącz Poświadczenia**: `Przestać używać platform dla: Poświadczenia?` | Wykonywany jest jeszcze jeden pull repozytorium, a potem jego obiekty są odłączane: zostają w aplikacji bez zmian, a pliki w git pozostają nietknięte |
| Kilka | **Zmień użycie**: `Zmienić, do czego służy platform?` | Jedno pytanie, z sekcją dla każdego typu, potwierdzane przyciskiem **Zapisz użycie** |

Pytanie wymienia też, co zostaje w aplikacji: obiekty z config seed, runnery, które RTE zarejestrował sam, oraz te
oczekujące na zatwierdzenie. Następnie komunikat mówi, co wziął każdy typ, na przykład
`Poświadczenia: 2 wczytano z jego plików, 3 zapisano w repozytorium (czeka na Push), 1 zastąpiono przez git, 0 zachowano w tej aplikacji.`

### Co pokazuje wynik pull

**Pokaż wynik ostatniego pull** repozytorium zawiera po wyniku samego git jeden wiersz na typ.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Obiekt przechowywany w repozytorium pokazuje na swojej stronie **Repozytorium: platform** (nazwę swojego repozytorium), z plikiem swojego wpisu w
podpowiedzi. Jego zapis zapisuje ten plik, a **Push** repozytorium wysyła go do git.

---

## Sekrety

Git nigdy nie zawiera jawnego sekretu: pole sekretu we wpisie to tylko odwołanie `${ENV}`, rozwiązywane ze środowiska.

Hasła, tokeny, sekrety klienta i klucze zapisuje się jako `${SEED_RTE_TOKEN}`, jak w [config seed](../seed/). Wpis z jawnym
sekretem lub wskazujący nieustawioną zmienną jest odrzucany i wymieniany w wyniku pull; tak samo zmienna samego serwera
(`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). Sekret pominięty we wpisie zachowuje ten z bazy danych aplikacji,
a aplikacja zapisuje własne obiekty w git bez ich sekretów.

Sekret wpisany w aplikacji dla obiektu, którego wpis podaje go jako odwołanie `${ENV}`, jest odrzucany: zmień zmienną albo
wpis w git.

---

## Projektant a te pliki

Projektant trzyma się z dala od plików należących do typów zastosowania, więc edycja formularza nigdy nie zmienia ustawienia.

Nigdy nie wyświetla, nie odczytuje, nie zapisuje ani nie usuwa pliku podającego klucz typu, który zawiera jego repozytorium, ani obrazów wskazanych
przez taki plik. Odmawia też zapisania pliku, którego zawartość podawałaby klucz typu, a wczytywanie formularzy nigdy nie odczytuje takiego pliku jako formularza.

---

## Każdy typ, z przykładem

Wpisy każdego typu mają format config seed, więc element seed i wpis repozytorium są wymienne.

Poniższe nazwy plików to przykłady: każda nazwa i każdy folder się nadadzą.

### Kategorie, stałe i role

Kategorie i role to listy, stałe to jedna mapa, każde pod własnym kluczem.

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

Każda rola jest sprawdzana osobno: niepoprawna jest odrzucana sama, a pozostałe są udostępniane. Role mogą być rozłożone
na kilka plików i są udostępniane w kolejności swoich plików. Zobacz [Role](../config/roles.html).

### Harmonogramy

Harmonogramy to lista `controller_schedules:`, każdy wpis wskazuje uruchamiany formularz, a jego czas określa dokładnie jedno z `cron`,
`rrule` lub `one_time_run`.

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

Zadania "Uruchom później" planowane przez użytkowników zostają w aplikacji. Zobacz [Harmonogramy](../jobs/schedules.html), aby poznać terminy i pytania.

### Ogólne

Ustawienia **Ogólne** to jedna mapa, według nazw ich zmiennych środowiskowych pisanych małymi literami.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Brane są tylko zmienne, które zmienia strona Ogólne; klucz pisany wielkimi literami lub zmienna ustawiona w rzeczywistym środowisku jest
odrzucana. Zmienna, której nazwa kończy się na `_PASSWORD`, `_SECRET` lub `_TOKEN`, jest tylko odwołaniem `${ENV}`.

### Wartości domyślne, logo, ikona, nazwa i linki

Strony Wyglądu to po jednej mapie, zawierającej to, co dana strona zapisuje.

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

Logo i ikona to obrazy repozytorium, wskazane względem pliku, który je podaje. Pole zadeklarowane przez config seed
pozostaje polem seed.

### Etykiety i ogłoszenia

Etykiety i ogłoszenia to listy wpisów, każdy rozpoznawany po nazwie.

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

Ogłoszenie, którego koniec już minął, nie jest importowane, o czym mówi wiersz `Not imported` w wyniku pull.

### Zastrzeżenie

Zastrzeżenie to lista wersji, każda rozpoznawana po swoim `version`, z najwyżej jedną włączoną.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Tekst zmieniony w git poprawia tę wersję; `ask_again: true` ponownie pyta wszystkich, którzy ją zaakceptowali. Kto co zaakceptował, nigdy nie trafia do git.

### Użytkownicy i grupy

Wpis grupy wymienia jej lokalnych członków; wpis użytkownika nie mówi nic o jego grupach.

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

`password` lokalnego użytkownika to tylko odwołanie `${ENV}`, haszowane przy odczycie. Użytkownik z katalogu (`ldap`, `entraid`, `oidc`) podaje
tylko swoje `description` i `blocked`. Wbudowany admin nigdy nie jest odczytywany z git ani do niego zapisywany.

### LDAP i SSO

Katalogi LDAP i dostawcy SSO to listy, każdy wskazujący poświadczenie, którym się loguje.

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

Wpis o nazwie `main` to katalog główny, którego nazwa nigdy nie jest zmieniana i który nigdy nie jest usuwany. `position` zachowuje kolejność wyszukiwania.

### Repozytoria

Repozytorium może zawierać pozostałe repozytoria, w formacie elementów `repositories:` z config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

Repozytorium, które je zawiera, nigdy nie występuje we własnych plikach, wpis nigdy nie ustawia `use_for_repositories`, a użytkownik lub token w
`uri` jest odrzucany: wskaż zamiast tego poświadczenie. Usunięty wpis usuwa swoje repozytorium, chyba że ma ono jeszcze niewypchnięte zmiany.

### Poświadczenia, magazyny sekretów i bazy danych

Najpierw wczytywane są poświadczenia, a potem wszystko, co wskazuje jedno z nich.

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

Usunięcie wpisu poświadczenia, dopóki coś go jeszcze używa, jest odrzucane, o czym mówi wynik pull.

### Runnery

Runner wskazuje swoje poświadczenie, typu tego runnera, i czeka, dopóki go brakuje.

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

Runner, który RTE zarejestrował sam, lub runner oczekujący na zatwierdzenie zostaje w aplikacji.

### SSH

Klucz SSH aplikacji i hosty, którym ufa, to jedna mapa, wczytywana zaraz po repozytoriach, zanim zostaną sklonowane.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` to tylko odwołanie `${ENV}`, nigdy nie zapisywane w git: gdy jest pominięte, aplikacja zachowuje własny klucz. `known_hosts` zawiera
jeden wiersz known_hosts na serwer, a pusta lista je czyści.

### Powiadomienia i syslog

Kanały powiadomień i serwery syslog to listy wpisów.

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### Asystent czatu i MCP

Asystent czatu i ustawienia MCP to po jednej mapie.

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` i klucze MCP to nazwy zmiennych środowiskowych pisane małymi literami. Zmienna ustawiona w rzeczywistym środowisku nigdy nie jest
zapisywana, a mapa, która ją podaje, jest odrzucana. `api_key` to tylko odwołanie `${ENV}` lub jest pomijane.

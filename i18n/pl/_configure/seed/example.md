---
layout: default
title: Przykład
parent: Config seed
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Przykład
{: .no_toc }

Kompletny plik seed, sekcja po sekcji
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Plik

Poniższy plik seed deklaruje każdą sekcję poza przestarzałą `awx`. Sekrety pochodzą ze zmiennych środowiskowych, takich jak
`${SEED_AWX_TOKEN}`, a sekcje używają nazw z wersji 7.8.0 (zobacz [Przemianowane sekcje](./#renamed-sections)):

```yaml
version: 1

runners:
  items:
    - name: rte01
      type: rte                  # rte, awx, semaphore, rundeck or jenkins
      rte_mode: inbound          # an RTE's RTE_MODE: outbound, inbound or database (deprecated, the default)
      credential: rte01          # a credential of the credentials section, of the runner's type
      is_default: true           # playbook forms that name no runner run here
    - name: tower
      type: awx
      credential: tower
      is_default: true           # one default per type
      enabled: true              # false: no job goes to it; left as it is when not declared

secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login    # a vault credential of the credentials section: the store's address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault     # how the secret store vault logs in, and where
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}   # the Vault token
    - name: rte01
      credential_type: rte       # an RTE's token, and its address unless it is outbound
      url: http://rte01.example.com:8000
      password: ${SEED_RTE_TOKEN}   # the RTE_TOKEN of that RTE
    - name: tower
      credential_type: awx       # also aap, ascender, semaphore, rundeck, jenkins
      url: https://tower.example.com
      password: ${SEED_AWX_TOKEN}
    - name: production-db
      user: svc_forms
      password: ${SEED_DB_PW}
      host: db.example.com
      port: 3306
      db_type: mysql
      credential_type: database
    - name: ontap-rest
      credential_type: userpass   # a user and password for a REST API, the default
      user: svc_forms
      password: ${SEED_ONTAP_PW}
    - name: smtp-login
      credential_type: smtp      # a mail server and its login: host is required
      host: smtp.example.com
      port: 587
      secure: false              # true: Use TLS to the mail server
      user: svc_forms            # leave user and password out for a relay
      password: ${SEED_SMTP_PW}
    - name: m365-mail
      credential_type: entraid   # an app registration, to send through Microsoft 365 (from 7.6.0)
      tenant_id: ${SEED_M365_TENANT}
      user: ${SEED_M365_CLIENT_ID}    # the client ID
      password: ${SEED_M365_SECRET}   # the client secret ; or client_cert and client_key

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

sso:                             # oauth2 before 7.8.0
  items:
    - name: corp
      provider: entraid          # entraid (Microsoft Entra ID, azuread before 7.8.0) or oidc
      tenant_id: ${SEED_ENTRA_TENANT}
      client_id: ${SEED_ENTRA_CLIENT_ID}
      client_secret: ${SEED_ENTRA_SECRET}   # or credential: an entraid credential
      enable: true

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_roles: true        # since 7.8.0, with use_for_categories and use_for_constants
      use_for_categories: true   # instead of use_for_config
      use_for_constants: true
      rebase_on_start: true

syslog:                          # syslog_servers before 7.8.0
  items:
    - name: siem
      host: siem.example.com
      port: 6514
      protocol: tls4             # udp4 (default), udp6, tcp4, tcp6, tls4, tls6, unix, unix-connect
      type: "5424"               # BSD (default) or 5424
      receives: audit            # log, audit or both (default)
      enabled: true
    - name: syslog
      host: syslog.example.com
      level: notice              # the lowest level of the server log it gets (info by default)
      receives: log

notifications:                   # notification_channels before 7.8.0
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: relay
      type: mail                 # no credential (from 7.6.0): its own server, sent without a login
      server: relay.example.com
      port: 25
      secure: false
      from_address: ansibleforms@example.com
    - name: m365
      type: mail
      credential: m365-mail      # an entraid credential: mail through Microsoft 365
      send_through: graph        # graph (the default) or smtp
      from_address: noreply@example.com
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap is a single-row section, so EVERY field must be declared : see "Single-row
# sections are all or nothing" on Managed objects. Empty is a perfectly good value.
ldap:
  server: ldap.example.com
  port: 389
  ignore_certs: false
  enable_tls: false
  cert: ""
  ca_bundle: ""
  bind_user_dn: cn=bind,dc=example,dc=com
  bind_user_pw: ${SEED_LDAP_PW}
  search_base: dc=example,dc=com
  username_attribute: uid
  groups_attribute: memberOf
  enable: true
  groups_search_base: ""
  group_class: ""
  group_member_attribute: ""
  group_member_user_attribute: ""
  mail_attribute: mail
  groupfilter: ""            # optional

settings:
  url: https://forms.example.com   # the only key it needs from 7.6.0

chat_assistant:              # the chat assistant's model provider ; chat before 7.8.0
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}   # or "" with credential: an api credential (since 7.8.0)
  base_url: ""               # empty for the provider default ; azure and custom need one
  model: claude-opus-5-5
  max_turns: 20
  max_tool_rounds: 6
  timeout_seconds: 60
  allow_job_status: true
  # optional - for a proxy or a vendor with its own ways
  auth_type: ""              # "" (provider default) | bearer | api-key | x-api-key | none
  api_version: ""            # e.g. 2024-10-21 for Azure OpenAI
  request_user: ""           # sent as user, e.g. for a proxy that requires one
  ignore_certs: false        # true skips the certificate check (a self-signed proxy) - insecure
  extra_headers:             # a mapping of extra request headers
    X-Org: ops

# since 7.8.0 : made or changed at each apply, never deleted
groups:
  items:
    - name: operators
      description: Run the day-to-day forms
      users:                 # its members : usernames of local users
        - alice

users:
  items:
    - username: alice        # a local user (type: local, the default)
      email: alice@example.com
      password: ${SEED_ALICE_PW}
    - username: jdoe
      type: ldap             # ldap, entraid or oidc : only description and blocked
      blocked: true
      description: Left on 2026-10-31

# since 7.8.0 : each declared field read only on its Settings page
defaults:
  default_theme: dark        # system, light or dark
  default_language: fr
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_forms_view: tiles

logo:
  logo: images/logo.png      # relative to the seed file ; "" restores the bundled one

icon:
  icon: images/icon.svg

name:
  app_name: ACME Automation

links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true

mcp:                         # environment variable names in lower case
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false

# since 7.8.0 : made or changed at each apply, never read only
announcements:
  items:
    - name: Maintenance
      message: The app is down on Sunday from 8 to 10.
      level: warning           # info, warning or danger
      start_at: 2030-01-06T08:00:00Z
      end_at: 2030-01-06T10:00:00Z

disclaimer:
  items:
    - version: 2
      title: Terms of use
      text: Use this tool for your own team's systems only.
      checkbox_label: I agree
      enabled: true          # the version in force, one at most
      ask_again: true        # a changed text asks everyone who accepted it again

ssh:
  private_key: ${SEED_SSH_PRIVATE_KEY}
  known_hosts:               # one known_hosts line each ; [] clears them
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```
Poniższe sekcje wyjaśniają części, które wymagają czegoś więcej niż komentarza.

---

## Runnery

Od wersji 7.3.0 runner loguje się poświadczeniem swojego typu, które zawiera adres jego serwera w `url`. Runner z własnym `token`
albo `username` i `password` nadal działa: seed zapisuje ostrzeżenie w dzienniku i zamienia je na takie poświadczenie, nazwane od runnera.
Runner, który wskazuje poświadczenie `api` lub `userpass`, też nadal działa, z ostrzeżeniem: nadaj zamiast tego temu poświadczeniu typ runnera.
Oba są przestarzałe od wersji 7.3.0 i zostaną usunięte w 8.0.0. Runner RTE bez `rte_mode` jest w trybie bazy danych, przestarzałym (zobacz
[Tryby](../rte/modes.html)). Runner z `enabled: false` nie dostaje żadnych zadań, także jako domyślny dla swojego typu (zobacz
[Domyślny i Włączony](../runners/list.html#default-and-enabled)); bez `enabled` seed zostawia go bez zmian.

Element runnera przyjmuje te klucze oprócz `name`, `type`, `description`, `credential`, `is_default` i `enabled`:

| Klucz | Co ustawia |
|---|---|
| `rte_mode` | Tryb RTE: `outbound`, `inbound` lub `database` (przestarzały, domyślny) |
| `rte_max_jobs` | **Maks. równoczesnych zadań** RTE w trybie gniazda, od `0` do `10000` (`0`: brak limitu) |
| `rte_cache_mb` | Jego **Pamięć podręczna plików** w MB, od `0` do `1048576` (`0` nie przechowuje żadnych) |
| `rte_files` | Jego **Pliki zadań**: `transfer` lub `local` |
| `rte_drain_seconds` | Jego **Czas oczekiwania przy zatrzymaniu** w sekundach, od `0` do `86400` |
| `flavour` | Runner `awx`, który jest AAP lub Ascenderem: `aap` lub `ascender`; brak dla AWX |
| `project` | Id projektu runnera Semaphore, nazwa projektu runnera Rundeck, folder runnera Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | Własny adres i TLS runnera sprzed wersji 7.3.0: używane tylko, dopóki jego poświadczenie nie zawiera `url` |

Cztery ustawienia `rte_*` to ustawienia karty RTE na stronie runnera (zobacz [Ustawienia RTE](../runners/runner-page.html#an-rtes-settings)):
wygrywają z tymi samymi zmiennymi ustawionymi na RTE, a RTE w trybie bazy danych je ignoruje. Wartość spoza zakresu powoduje niepowodzenie
walidacji seeda.

RTE w trybie bazy danych może się samo zarejestrować, zanim seed zostanie zastosowany. Runner RTE z seeda, którego `uri` jest adresem, pod którym takie RTE
się zarejestrowało, **przejmuje** ten wiersz: przyjmuje zadeklarowaną nazwę i pola, a worker przestaje go usuwać, gdy RTE przestaje
odpowiadać, zamiast tworzyć drugi runner dla tego samego RTE.

Od wersji 7.5.0 sekcja `databases` deklaruje [bazy danych](../databases.html), które odpytują formularze. Element ma `name`, `credential`
typu baza danych i opcjonalny `description`; seed stosuje go po poświadczeniach i odrzuca poświadczenie innego typu.

---

## SSO

Sekcja `sso` (`oauth2` przed wersją 7.8.0) deklaruje [dostawców SSO](../authentication/), każdego z jego klientem: `client_id` i
`client_secret` albo `credential` z sekcji poświadczeń.

Od wersji 7.8.0 Microsoft Entra ID to `provider: entraid`, tak jak zapisują go repozytoria. `provider: azuread`, jego wcześniejsza nazwa, jest nadal
odczytywany tak samo, przestarzały od wersji 7.8.0 i usunięty w 8, z ostrzeżeniem w dzienniku serwera. Drugi dostawca to `oidc`, a tylko jeden
dostawca każdego rodzaju może mieć `enable: true`.

---

## Repozytoria

Element repozytorium ma `name`, `uri`, opcjonalną `branch` (po pominięciu domyślną gałąź zdalnego repozytorium), `credential`, `rebase_on_start`,
harmonogram pobierania `cron` i jedną flagę `use_for_*` dla każdego typu użycia: to, co aplikacja z niego odczytuje.

Od wersji 7.8.0 każdy typ użycia ma swoją flagę. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` i `use_for_inventories` istniały
wcześniej; pozostałe są nowe:

| Kategoria | Flagi |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Zadania | `use_for_schedules` |
| System | `use_for_general` |
| Wygląd | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Dostęp | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Połączenia | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Formularze, workflowy i inwentarze może przechowywać kilka repozytoriów. Każdy inny typ przechowuje co najwyżej jedno repozytorium: seed, który
ustawia tę samą z tych flag na dwóch repozytoriach, jest odrzucany. To, co każdy typ trzyma w gicie, opisuje strona
[Repozytoria git](../repositories/).

`use_for_config` jest przestarzałe od wersji 7.8.0 i zostanie usunięte w 8. Jest nadal odczytywane, jako `use_for_roles`, `use_for_categories` i
`use_for_constants`, z ostrzeżeniem w dzienniku serwera. Gdy deklaruje je kilka repozytoriów, te trzy zachowuje repozytorium, które już je ma
(w przeciwnym razie pierwsze w pliku), a pozostałe nie dostają żadnej. Zamiast tego zadeklaruj te trzy flagi.

---

## Poczta

Poczta przechodzi przez kanały pocztowe z `notifications:` (zobacz [Poczta](../notification-channels/mail.html)). Klucze
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` i `mail_from` w `settings:` są przestarzałe od wersji 7.6.0
i zostaną usunięte w 8.0.0. Nadal działają i raz zapisują ostrzeżenie: seed robi z nich kanał pocztowy o nazwie `default`, z poświadczeniem
smtp `mail-login`, gdy jest `mail_username`, albo z własnym serwerem dla przekaźnika. Zamiast tego zadeklaruj kanał pocztowy i jego
poświadczenie samodzielnie, tak jak `mail` i `smtp-login` w powyższym pliku.

---

## Asystent czatu

Sekcja `chat_assistant` (`chat` przed wersją 7.8.0) ustawia dostawcę modelu asystenta czatu. `provider` to jedno z:

* `anthropic`
* `openai`
* `azure`
* `gemini`
* `grok`
* `mistral`
* `deepseek`
* `groq`
* `openrouter`
* `ollama`
* `custom` : dowolny inny endpoint zgodny z OpenAI

Tak jak `ldap`, sekcja `chat_assistant` to pojedynczy wiersz, więc każde pole jest wymagane poza
opcjonalnymi; pominięte pole opcjonalne pozostaje bez zmian.

Od wersji 7.8.0 przyjmuje też `credential`, poświadczenie api z sekcji poświadczeń, którego hasło jest kluczem, zamiast
`api_key` (wtedy zadeklaruj `api_key: ""`). Asystent czatu wymaga też `ENABLE_CHAT=1`, którego seed nie ustawia; zobacz stronę
[Asystent czatu](../chat/).

---

## Użytkownicy i grupy

Od wersji 7.8.0 sekcje `groups` i `users` deklarują lokalne grupy i użytkowników. Są tworzeni lub zmieniani przy każdym zastosowaniu, nigdy usuwani,
i pozostają edytowalni w aplikacji (zobacz [Użytkownicy i grupy](../users-and-groups.html)).

Element grupy ma `name`, opcjonalny `description` i jej członków w `users`: nazwy lokalnych użytkowników. Element użytkownika nie mówi
nic o jego grupach, więc grupa wymienia swoich członków w jednym miejscu. Seed stosuje grupy przed użytkownikami.

Element użytkownika ma `username` i `type`:

| Typ | Co podaje jego element |
|---|---|
| `local` (domyślny) | `email`, `description`, `blocked` i `password` jako odwołanie `${ENV}`, jak każdy sekret seeda |
| `ldap`, `entraid`, `oidc` | Tylko `description` i `blocked`: reszta pochodzi z jego katalogu przy każdym logowaniu |

Nowy lokalny użytkownik dostaje grupy seeda, które go wymieniają, więc daj mu co najmniej jedną. Bez `password` nie może się zalogować, dopóki
admin nie ustawi go w aplikacji. Użytkownik katalogu jest tworzony, zanim w ogóle się zaloguje, więc osoba odchodząca jest zablokowana, zanim spróbuje.
Wbudowanego admina nigdy się nie deklaruje: pozostaje drogą powrotu.

---

## Wygląd, MCP i SSH

Od wersji 7.8.0 seed deklaruje też ustawienia, które aplikacja ma w jednym egzemplarzu, każdą sekcję w formacie tej samej strony w repozytorium git.

| Sekcja | Strona | Klucze |
|---|---|---|
| `defaults` | **Ustawienia > Wygląd > Wartości domyślne** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** i **Ikona** | `logo` lub `icon`: ścieżka pliku obrazu, względna wobec pliku seed; `""` przywraca dołączony |
| `name` | **Nazwa** | `app_name` |
| `links` | **Linki** | `header_links` (każdy z `id`, `label`, `url`, `icon`, `newTab`, `parent`) i `show_designer` |
| `mcp` | **Ustawienia > Połączenia > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Ustawienia > Połączenia > SSH** | `private_key` i `known_hosts` |
| `announcements` | **Ustawienia > Wygląd > Ogłoszenia** | Elementy z `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Ustawienia > Dostęp > Zastrzeżenie** | Elementy z `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Każdy klucz jest opcjonalny: to, co sekcja pomija, pozostaje takie, jak ma to aplikacja. Logo i ikona są sprawdzane jak przy wgrywaniu (obraz,
najwyżej 900 KB dla logo i 256 KB dla ikony).

Klucze `mcp` to zmienne środowiskowe [serwera MCP](../mcp/) zapisane małymi literami. Zmienna, którą ustawia rzeczywiste
środowisko, zachowuje wartość ze środowiska: dziennik serwera o tym informuje, a start trwa dalej.

`ssh` zawiera prywatny klucz aplikacji jako odwołanie `${ENV}` (jej klucz publiczny jest z niego tworzony) i serwery, którym aplikacja ufa, każdy
jako jeden wiersz known_hosts (hosty, typ klucza i klucz). Jest stosowany przy każdym starcie.

Ogłoszenie, którego `end_at` minął, jest pomijane. `version` zastrzeżenia to liczba, co najwyżej jedna jest `enabled`, a zmieniony tekst
poprawia tę wersję; z `ask_again: true` każdy, kto ją zaakceptował, jest pytany ponownie.

To, w jakim stopniu seed przejmuje każdą z nich, opisuje strona [Obiekty zarządzane](managed-objects.html#settings-the-seed-declares).

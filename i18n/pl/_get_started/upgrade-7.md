---
layout: default
title: Aktualizacja do v7
parent: Aktualizacja
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Aktualizacja do v7
{: .no_toc }

Co zmienić, będąc jeszcze na 6.5, i co się zmienia po przejściu na wersję 7
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wersja 7 usuwa wszystko, co w 6.x było oznaczone jako przestarzałe; najpierw popraw to na 6.5, gdzie działa zarówno stare, jak i nowe, a dopiero potem aktualizuj.

---

## Przed aktualizacją (na 6.5)

### Formularze we własnych plikach

Formularze znajdują się wyłącznie w folderze formularzy (`FORMS_FOLDER_PATH`) lub w repozytorium formularzy; `config.yaml` zawiera kategorie, role i stałe.

- **Plik `forms.yaml`:** zmień jego nazwę na `config.yaml`. Na 6.5 strona ustawień ma do tego przycisk
  **Convert forms.yaml to config.yaml**.
- **Sekcja `forms:` w konfiguracji bazowej:** wersja 7 ją odrzuca. Przenieś każdy formularz do osobnego pliku, na przykład
  przeciągając go do pliku w projektancie 6.5.
- **Zmienne środowiskowe:**

  | Usunięte | Zamiast tego użyj |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` i `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### Pole `table`

Wersja 7 odrzuca pola `table`, a razem z nimi ich właściwości (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`): użyj pola `list` z `subform` i zamień `from` każdej kolumny na wyrażenie
na `__parent__` (zobacz [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Zmienione nazwy właściwości

Każda usunięta właściwość ma bezpośredni zamiennik:

| Usunięte | Zamiast tego użyj |
|---|---|
| `disableRelaunch: true` (formularz) | `allowRelaunch: false` |
| `noOutput: true` (pole) | `output: false` |
| `enableLogin` (opcja roli) | `allowLogin` |

### Źródła danych i schematy danych

Importy źródeł danych i ich strony administracyjne zostały usunięte, podobnie jak
kolekcja Galaxy AnsibleForms, której moduły służyły tylko im.

- Zaplanowane importy przestają działać, a tabele źródeł danych są usuwane: najpierw zanotuj to, czego potrzebujesz.
- Schematy danych wypełniane przez import są osobnymi bazami danych i pozostają. Formularz, który
  odpytuje je przez poświadczenie, nadal działa.
- Aby te dane były aktualne, uruchamiaj import jako własny playbook, na przykład z
  harmonogramu.

### API v1

`/api/v1/*` zostało usunięte; używaj `/api/v2/*` (interaktywna dokumentacja pod `/api/v2/docs`). Wywołania, których
skrypty zwykle używają, to:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 odpowiada kodami stanu HTTP (`400`, `403`, `404`, `422`) i zwykłą treścią JSON, a nie kopertą
`{ status, message, data }` z v1.

**Dotyczy to też callbacków jednokrotnego logowania.** Adres przekierowania z `/api/v1/` już nie odpowiada: logowanie wraca na
stronę logowania, nie logując użytkownika. Zmień go na `/api/v2/` w dwóch miejscach, u dostawcy SSO w
AnsibleForms i u dostawcy tożsamości (adresy przekierowania w rejestracji aplikacji Entra ID, prawidłowe adresy przekierowania
klienta OIDC):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback` lub od wersji 7.3.0 `/api/v2/auth/entraid/callback`
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## Co się zmienia w 7

Wersja 7 zmienia sposób uruchamiania playbooków i zaostrza kilka ustawień domyślnych. Sprawdź każdy z poniższych punktów przy przejściu z 6.5.

### Playbooki działają na RTE

Wersja 7 nie uruchamia już `ansible-playbook` w kontenerze AnsibleForms. Playbooki działają w środowisku uruchomieniowym (RTE),
osobnym kontenerze, a obraz aplikacji nie zawiera już ansible ani pythona. Uruchom RTE obok aplikacji, z obrazu
`ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Od wersji 7.3.0 aplikacja łączy się z RTE i utrzymuje otwarty jeden WebSocket (zobacz
[Tryby](rte/modes.html)): RTE nie dostaje ustawień bazy danych ani `ENCRYPTION_SECRET`. Jego ustawienia:

| Ustawienie | Wartość |
|---|---|
| `AF_ROLE` | `rte`. Obrazy RTE już to ustawiają. |
| `RTE_MODE` | `inbound`: aplikacja łączy się z RTE. Runner w innej sieci używa `outbound` (zobacz [Tryby](rte/modes.html)). |
| `RTE_TOKEN` | Token o długości co najmniej 16 znaków. Aplikacja loguje się nim do gniazda RTE, a RTE bez niego nie uruchomi się. |
| `RTE_FILES` | `local`, gdy RTE montuje ten sam folder trwały co aplikacja, tak jak obok niej. |

Następnie przenieś montowania ansible z kontenera aplikacji do RTE:

- `ansible.cfg` w `/etc/ansible/ansible.cfg`, Twoje role w `/etc/ansible/roles`, a Twoje kolekcje w
  `/etc/ansible/collections`.
- Zamontuj w RTE także ten sam folder trwały co w aplikacji, aby znajdował playbooki i repozytoria.

Następnie zadeklaruj RTE jako runner, w [config seed](seed/) tak jak robi to projekt Docker Compose, albo w **Połączenia → Runnery**:
poświadczenie RTE z adresem RTE (na przykład `http://rte:8000`) i tym samym tokenem oraz runner typu RTE, w trybie inbound,
który je wskazuje:

```yaml
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
```

Seed odczytuje `RTE_TOKEN` ze środowiska aplikacji. Zobacz [Runnery](runners.html) i [Środowiska uruchomieniowe](rte/).

{: .warning }
> **Ten sam kontrakt dla aplikacji i RTE** Aplikacja rozwiązuje poświadczenia zadania i przekazuje je do RTE zaszyfrowane dla
> tego RTE (kontrakt RTE 2, nowość w 7.0.0). RTE z innym kontraktem odrzuca zadania aplikacji: uruchamiaj obraz RTE z tego samego
> wydania co aplikacja i aktualizuj oba razem. Późniejsze wydania 7 nadal współpracują ze starszym RTE 7, dopóki kontrakt
> pozostaje ten sam (zobacz [Skalowanie](../rte/images.html#build-your-own-rte)).


### Co zawiera obraz RTE

RTE występuje w trzech warstwach, każda zbudowana na poprzedniej. Wybierz tę, która pasuje do Twoich playbooków:

| Obraz | Zawartość |
|---|---|
| `ansibleforms-rte-full` | Domyślny. Ansible 14 z ansible-core 2.21 oraz kolekcje i biblioteki pythona, które miał obraz 6.5. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core i kilka popularnych bibliotek, bez kolekcji. Dodaj własne w obrazie zbudowanym na jego bazie. |
| `ansibleforms-rte-base` | Sam serwer, bez pythona i ansible, do zbudowania RTE z własnymi wersjami. |

Przejście z 6.5 (ansible 12 z ansible-core 2.19) zmienia też te rzeczy dla Twoich playbooków:

- **ansible-core 2.21:** przeczytaj [porting guides](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  dla 2.20 i 2.21.
- **Python 3.14:** warstwy RTE działają na pythonie 3.14.
- **Koniec z `boto`:** stara biblioteka `boto` 2 zniknęła. Kolekcja `amazon.aws` używa `boto3`, która jest dołączona.

Dwie zmienne środowiskowe należą teraz do RTE i nie są już odczytywane przez aplikację, więc ustaw je w kontenerze RTE:

| Zmienna | Zmiana |
|---|---|
| `ANSIBLE_PATH` | Folder playbooków, na RTE. |
| `PROCESS_MAX_BUFFER` | Teraz domyślnie 50 MB. Po jego przekroczeniu wynik zadania nie jest już zapisywany (zadanie o tym informuje), ale playbook działa dalej, zamiast zostać zatrzymany. |


### Kontenery działają jako uid 1000

Obrazy aplikacji i RTE działają jako użytkownik `node` (uid 1000) zamiast roota, a ich folder domowy to `/home/node`:

- **Przekaż wolumeny uid 1000, jednorazowo.** Dla wolumenów persistent i ssh uruchom
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v`; dla folderu hosta `sudo chown -R 1000:1000 <folder>`.
  Na Kubernetes ustaw `fsGroup: 1000`.
- **Montuj folder ssh w `/home/node/.ssh`**, a nie w `/root/.ssh`. Jeśli ustawiłeś
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) na `/root`, usuń to ustawienie lub ustaw je na `/home/node`.
- **Własny obraz RTE** zbudowany na warstwie RTE przełącza się na `USER root` na czas instalacji i z powrotem na `USER node` na końcu.


### Walidacja przy uruchomieniu jest włączona

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) ma teraz domyślnie wartość `enforce` (6.5: `off`). Każde
uruchomienie, z przeglądarki lub z `POST /api/v2/job`, jest sprawdzane pod kątem reguł formularza, a zadanie używa extravars i
poświadczeń, które serwer buduje ze sprawdzonych wartości.

- **Wywołujący REST muszą wysyłać `rawFormData`**, surowe wartości pól w takiej postaci, w jakiej wysyła je przeglądarka. Uruchomienie z samym
  `extravars` jest odrzucane, bo nie da się sprawdzić jego wartości.
- **Aby najpierw zobaczyć, co zostałoby odrzucone**, ustaw `LAUNCH_VALIDATION=log` i przeczytaj ostrzeżenia w dzienniku. `off` przywraca
  zachowanie z 6.5.

Szczegóły opisuje strona [Walidacja przy uruchomieniu](launch-validation/).


### Playbooki nie widzą już ustawień aplikacji

Playbook nie dziedziczy już zmiennych środowiskowych, które odczytuje samo AnsibleForms: `ENCRYPTION_SECRET`, ustawień `DB_*`,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, ustawień `VAULT_*`, wszystkich innych udokumentowanych zmiennych i wszystkich zmiennych `MYSQL_*`.
Reszta środowiska RTE, na przykład `PATH`, proxy, ustawienia `ANSIBLE_*` i poświadczenia chmurowe, jest przekazywana jak dotąd.

Playbook, który odczytywał jedną z nich przez `lookup('env', ...)`, musi uzyskać wartość w inny sposób: przekaż ją jako extravar lub
poświadczenie albo ustaw ją w RTE pod inną nazwą.

### Tylko rola admin zarządza runnerami i administratorami

Użytkownik z dostępem do ustawień nie ma już pełnej kontroli nad tym, kto jest administratorem i dokąd trafiają poświadczenia:

- **Runnery:** tylko rola admin dodaje, zmienia lub usuwa runner, ponieważ runner otrzymuje poświadczenia zadań,
  które uruchamia. Użytkownicy z dostępem do ustawień nadal mogą przeglądać i testować runnery.
- **Konta i grupy administratorów:** tylko rola admin nadaje uprawnienia administratora. Bez niej użytkownik nie może dodać konta do grupy, którą
  wymienia rola admin, ani zmienić, zresetować lub usunąć konta administratora lub takiej grupy.
- **Role:** projektant bez roli admin nie może zmieniać ról. Zapis lub przywrócenie, w którym role się różnią, jest odrzucane.

Nadaj rolę admin temu, kto zarządza runnerami, administratorami i rolami.

### Domyślne hasło trzeba zmienić

Użytkownik, który loguje się publicznym hasłem domyślnym `AnsibleForms!123`, musi je najpierw zmienić. Do tego czasu każde inne wywołanie API
odpowiada `403` z kodem `password_change_required`, a przeglądarka pokazuje stronę zmiany hasła.

Zaloguj się raz i wybierz nowe hasło albo ustaw [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) przed
pierwszym uruchomieniem. Skrypty logujące się hasłem domyślnym muszą używać innego.

### Tokeny wygasają przy wylogowaniu i zmianie hasła

Wylogowanie kończy teraz tokeny tej sesji, a zmiana hasła kończy wszystkie sesje tego użytkownika, więc po zmianie hasła
zaloguj się ponownie.

Token API zażądany z `?expiryDays=` żyje najwyżej [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) dni
(domyślnie 90). Skrypty używające długoterminowych tokenów API muszą zażądać nowego, zanim stary wygaśnie.

### Entra ID wymaga Twojego tenanta

Logowanie przez Entra ID (Azure AD) używa teraz OpenID Connect wyłącznie z Twoim własnym tenantem, a użytkownik innego tenanta nie może się
zalogować. Dostawca bez identyfikatora tenanta albo z `common`, `organizations` lub `consumers` jest odrzucany.

- **Ustaw identyfikator tenanta** u dostawcy SSO: Directory (tenant) ID, czyli GUID, lub domenę tenanta.
- **Nadaj uprawnienia Graph:** logowanie prosi o `openid profile email User.Read GroupMember.Read.All`. Nadaj rejestracji
  aplikacji delegowane uprawnienia Microsoft Graph `User.Read` i `GroupMember.Read.All`, ze zgodą administratora.
- **W rolach preferuj identyfikatory grup:** wskazuj grupę jako `azuread/<object id>` (od wersji 7.3.0 `entraid/<object id>`), a nie przez jej nazwę wyświetlaną.

Konfigurację opisuje strona [Entra ID](authentication/entra-id.html).

### Hasła mają minimalną długość

Lokalne hasło ustawiane przez aplikację wymaga co najmniej
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) znaków (domyślnie 8) i nie może być nazwą użytkownika ani
hasłem domyślnym. `PASSWORD_MIN_LENGTH=0` wyłącza sprawdzanie długości. Istniejące hasła nadal działają.

### Uruchamiaj kontenery z polityką restartu

Nieprzechwycony wyjątek kończy teraz proces, zapisany w dzienniku na poziomie `crit`, zamiast pozostawiać go działającego w nieznanym stanie. Uruchamiaj
kontenery z polityką restartu, na przykład `--restart unless-stopped` w Dockerze (projekt docker-compose ją ustawia).
Kubernetes sam restartuje pody.

### Połączenia AWX i link strony głównej

W 7 zniknęły jeszcze dwie rzeczy, bez konieczności robienia czegokolwiek na 6.5:

- **Połączenia AWX i AAP:** tabela `awx`, `/api/v2/awx` i strona A.A.P. zniknęły. Aktualizacja przenosi każde połączenie AWX lub
  AAP do **Połączenia → Runnery**, jako runner typu `awx`, a formularze z `awx:` nadal działają.
- **`NAV_HOME_LABEL` i `NAV_HOME_ICON`:** nie są już odczytywane. Pierwszy link w nagłówku to zawsze Formularze.

### Przestarzałe w 7, usunięte w 8

Te elementy nadal działają w 7, ale każdy zapisuje ostrzeżenie w dzienniku, gdy jest używany. Przejdź na zamiennik przed wersją 8:

| Przestarzałe | Zamiast tego użyj |
|---|---|
| Zmienne środowiskowe `VAULT_*` | Magazyn sekretów o nazwie `vault` (**Połączenia → Magazyny sekretów**). Pierwsze uruchomienie 7 importuje zmienne raz jako ten magazyn, a potem je ignoruje. |
| Zmienne środowiskowe `LOG_SYSLOG_*` | Serwer syslog (**Połączenia → Syslog**). Gdy ustawione jest `LOG_SYSLOG_HOST`, pierwsze uruchomienie 7 importuje je raz jako serwer `syslog`, który otrzymuje dziennik serwera jak dotąd, a potem je ignoruje. Aby wysyłać też wpisy audytu, ustaw go tak, aby odbierał oba. |
| `vault_path` w poświadczeniu (API, config seed) | `secret_store` i `secret_ref`. Zobacz [Magazyny sekretów](secret-stores/). |
| Rola `public` w `config.yaml` | Rola `default`. Nazwa w pliku jest zmieniana przy wczytywaniu konfiguracji; w szablonie ytt zmień ją ręcznie. `public` w `roles:` formularza nadal pasuje. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` w formularzu lub kroku | `approval`. `hasApproval` nie ma żadnego efektu. |
| `awx: <name>` w formularzu | `runner: <name>`. Połączenie AWX to runner typu `awx`. |
| `type: multistep` w formularzu, z jego `steps` | `type: workflow`, z węzłami wskazującymi `runner`. Zobacz [Formularze workflow](forms/workflow.html). |
| Sekcja `awx:` config seed | Pozycje `runners:` z `type: awx` |
| `LOCK_PATH` | Nic: nie jest już odczytywana, blokada projektanta jest przechowywana w bazie danych. |
| RTE w trybie bazy danych, od wersji 7.3.0: `RTE_MODE=database` lub brak `RTE_MODE`, z `DB_*` bazy danych i `ENCRYPTION_SECRET` na RTE | `RTE_MODE=outbound` lub `RTE_MODE=inbound`, bez `DB_*`. RTE dołącza raz z tokenem dołączenia (`RTE_JOIN_TOKEN`) albo jego runner jest ustawiany w tym trybie w **Połączenia → Runnery** lub w config seed (`rte_mode`). Zobacz [Tryby](rte/modes.html). |
| `RTE_REGISTER`, od wersji 7.3.0 (tylko tryb bazy danych) | Token dołączenia (`RTE_JOIN_TOKEN`): RTE dodaje się jako runner, który loguje się poświadczeniem RTE. |
| Poświadczenie `api` lub `userpass` w runnerze config seed, od wersji 7.3.0 | Poświadczenie rodzaju runnera (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` lub `jenkins`), z jego serwerem w `url`. |
| Runner config seed z własnym `token` albo `username` i `password`, od wersji 7.3.0 | Poświadczenie rodzaju runnera w sekcji `credentials`, z jego serwerem w `url`, które runner wskazuje przez `credential:`. W międzyczasie seed tworzy jedno nazwane od runnera. |

`ENABLE_SSO` i `SSO_AUTO_LOGIN` nie są odczytywane od wersji 7.3.0. Pierwsze uruchomienie 7.3 przenosi je raz: `ENABLE_SSO=0` wyłącza
wszystkich dostawców SSO, a `SSO_AUTO_LOGIN=1` zaznacza **Pomiń stronę logowania** u jedynego włączonego dostawcy. Potem są ignorowane: każde uruchomienie
zapisuje ostrzeżenie w dzienniku, dopóki są ustawione, a każdy dostawca ma **Włączony** i **Pomiń stronę logowania** w **Dostęp → SSO**.

---

## Tagi obrazów

`latest` przechodzi na 7 wraz z 7.0.0. Aby pozostać na 6, używaj tagu `6` (lub `6.5`) zamiast `latest`.
Wszystkie tagi są wymienione w [Tagi obrazów](installation/#image-tags).

---

## Wycofanie aktualizacji

Przed aktualizacją wykonaj kopię zapasową (**Ustawienia → Kopie zapasowe**). 6.5 działa na bazie danych zaktualizowanej do 7, ale tylko
kopia zapasowa przywraca usunięte definicje źródeł danych.

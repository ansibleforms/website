---
layout: default
title: Jak to działa
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Jak to działa
{: .no_toc }

Elementy instalacji, co dzieje się przy uruchomieniu i gdzie przechowywane są dane
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Architektura

AnsibleForms to serwer Node.js, który udostępnia aplikację webową i API REST, z bazą danych MySQL. Odczytuje formularze
z plików YAML i sam niczego nie uruchamia: każde zadanie przekazuje do [runnera](runners.html). Playbook trafia do jednego z Twoich kontenerów RTE
(runtime environment), który uruchamia `ansible-playbook`, a szablon lub job trafia do AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Architektura AnsibleForms</title>
<desc id="afd-desc">Przeglądarka i opcjonalny klient MCP komunikują się z serwerem AnsibleForms. Serwer przechowuje dane w MySQL i w folderze trwałym oraz łączy się ze źródłami danych, magazynami sekretów, repozytoriami git, dostawcami logowania, kanałami powiadomień, serwerami syslog i opcjonalnym dostawcą modelu. Jego runnery przekazują każdy playbook do jednego z jednego lub kilku kontenerów RTE, każdy przez własny WebSocket; kontenery uruchamiają ansible-playbook i odsyłają wynik do serwera, a każdy szablon lub job trafia do AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="94" text-anchor="middle">Przeglądarka</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">formularze, projektant,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">zadania, czat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">Klient MCP</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">opcjonalny</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">Serwer AnsibleForms</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Aplikacja webowa i API REST</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formularze, wyrażenia</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflow, harmonogramy</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">Serwer MCP (opcjonalny)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runnery</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">przekazują zadania runnerowi</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Źródła danych</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">bazy danych, API, pliki</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Magazyny sekretów</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Repozytoria git</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">formularze, playbooki, config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Dostawcy logowania</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Powiadomienia</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">poczta, Slack, Teams, webhooki</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Serwery syslog</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">dziennik, ślad audytu</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Dostawca modelu</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">opcjonalny, asystent czatu</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Folder trwały</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">config, formularze, playbooki</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">zadania, użytkownicy,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">poświadczenia</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">Kontenery RTE</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">uruchamiają ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">playbooki,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">szablony, joby</text>
</svg>
</div>

Każdy z elementów na diagramie ma własną rolę:

| Element | Rola |
|---|---|
| **Przeglądarka** | Aplikacja webowa w Vue: formularze, [Projektant](gui/designer-and-git.html), historia zadań i ustawienia |
| **Serwer AnsibleForms** | Przetwarza formularze, zapisuje zadania, uruchamia workflow i harmonogramy, przekazuje każde zadanie jego runnerowi i śledzi je, a także udostępnia [API REST](api/) |
| **Runnery** | Miejsca, w których działają zadania, dodawane w **Połączenia > Runnery**: formularz wskazuje jeden przez `runner: <name>` albo używa domyślnego runnera swojego typu (zobacz [Runnery](runners.html)) |
| **Kontenery RTE** | Jeden lub kilka kontenerów środowiska uruchomieniowego, czyli ten sam serwer uruchomiony z `AF_ROLE=rte`: każdy uruchamia `ansible-playbook` dla [formularzy ansible](forms/ansible.html), z bibliotekami pythona i kolekcjami ze swojego obrazu, i odsyła wynik oraz stan końcowy do serwera przez jeden WebSocket, bez poświadczeń do bazy danych (zobacz [Jak działa RTE](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runnery dla szablonów i jobów: [formularze AWX](forms/awx.html) uruchamiają szablon joba lub workflow, formularze [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) i [Jenkins](forms/jenkins.html) uruchamiają jeden z ich jobów, a serwer śledzi jego wynik |
| **MySQL / MariaDB** | Przechowuje zadania i ich wyniki, użytkowników, poświadczenia i połączenia; odczytuje ją i zapisuje tylko serwer |
| **Folder trwały** | Przechowuje `config.yaml`, pliki formularzy, playbooki, dzienniki i kopie zapasowe |
| **Źródła danych** | Wypełniają pola: [zapytania do bazy danych](formfields/enum.html), [API REST](expressions/rest-apis.html), pliki i [inne funkcje](expressions/remote.html) |
| **Magazyny sekretów** | Dostarczają użytkownika i hasło poświadczenia w chwili użycia, zobacz [Magazyny sekretów](secret-stores/) |
| **Repozytoria git** | Utrzymują formularze, playbooki i `config.yaml` pod kontrolą wersji |
| **Dostawcy logowania** | Logują użytkowników: [LDAP, Entra ID i OIDC](authentication/), obok użytkowników lokalnych |
| **Kanały powiadomień** | Przenoszą [powiadomienia](forms/notifications.html) i prośby o zatwierdzenie: [poczta, Slack, Microsoft Teams, Telegram lub webhook](notification-channels.html) |
| **Serwery syslog** | Odbierają dziennik i ślad audytu na bieżąco, w miarę zapisywania, zobacz [Syslog](production/logs.html#syslog) |
| **Klient MCP, czat** | Opcjonalne, oba domyślnie wyłączone: [serwer MCP](mcp/) i [asystent czatu](chat/), który wymaga dostawcy modelu |

Domyślnie jeden kontener uruchamia razem serwer, aplikację webową i pracę w tle, obok jednego RTE. Jeśli chcesz mieć kilka węzłów aplikacji za
load balancerem, workera wykonującego pracę w tle i więcej RTE, zobacz [Skalowanie](production/scaling.html).

### Z czego jest zbudowany

Serwer i interfejs webowy są zbudowane z tych komponentów:

| Część | Technologia |
|---|---|
| **Serwer** | Node.js i Express |
| **Baza danych** | MySQL lub MariaDB |
| **Interfejs webowy** | Vue 3, z Bootstrap 5 i Font Awesome |

---

## Co się dzieje, gdy uruchamiasz formularz

Uruchomienie przechodzi przez te same kroki, niezależnie od tego, czy pochodzi z przeglądarki, czy z [API REST](api/jobs.html):

1. **Wczytanie** : serwer wysyła tylko formularze, na które pozwalają [role](config/roles.html) użytkownika, i oblicza wyrażenia serwerowe
2. **Wysłanie** : przeglądarka zamienia wartości pól na extravars i wysyła je do `POST /api/v2/job`
3. **Sprawdzenie** : serwer ponownie wczytuje formularz dla ról użytkownika i, gdy włączona jest [walidacja przy uruchomieniu](launch-validation/), sprawdza wartości
4. **Zapis** : zadanie jest zapisywane ze stanem `running`, a jego id jest dodawane do extravars jako `__jobid__`
5. **Zatwierdzenie** : formularz z punktem [`approval`](forms/approval.html) czeka, aż osoba zatwierdzająca zaakceptuje zadanie
6. **Poświadczenia** : w przypadku playbooka aplikacja (nigdy RTE) odczytuje poświadczenia formularza z bazy danych lub z [magazynu sekretów](secret-stores/)
7. **Uruchomienie** : zadanie trafia do swojego runnera, tego, którego formularz wskazuje przez `runner:`, lub domyślnego dla swojego typu. W przypadku playbooka aplikacja wysyła zadanie do
   jego RTE przez WebSocket tego RTE, z poświadczeniami zaszyfrowanymi dla niego, a RTE uruchamia `ansible-playbook` (zobacz [Jak działa RTE](rte/#how-the-rte-runs)),
   natomiast AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins uruchamia szablon lub job. [Workflow](workflows/) uruchamia swoje węzły, każdy jako
   osobne zadanie na własnym runnerze
8. **Śledzenie** : serwer zapisuje wynik w bazie danych w miarę jego napływania, wysyłany przez RTE przez gniazdo w przypadku playbooka lub odczytywany z
   pozostałych runnerów. Strona formularza odczytuje zadanie co dwie sekundy, a strona Zadania śledzi je na żywo, gdy serwer
   ogłasza każdą zmianę
9. **Zakończenie** : zadanie otrzymuje stan końcowy, a jego [`notifications`](forms/notifications.html) są wysyłane pocztą i do jego
   [kanałów powiadomień](notification-channels.html), gdy formularz o to prosi

---

## Gdzie wszystko jest przechowywane

AnsibleForms przechowuje swój stan w dwóch miejscach: w bazie danych MySQL i w folderze trwałym. Twórz kopie zapasowe obu.

### W bazie danych
{: .no_toc }

Baza danych `AnsibleForms` jest tworzona przy pierwszym uruchomieniu (chyba że `ALLOW_SCHEMA_CREATION` ma wartość `0`) i przechowuje:

* zadania, ich extravars i wyniki, harmonogramy i zapisane zadania
* użytkowników lokalnych, grupy i tokeny API
* poświadczenia, zaszyfrowane kluczem `ENCRYPTION_SECRET`, oraz połączenia z magazynami sekretów
* runnery, kanały powiadomień (łącznie z pocztą), serwery syslog oraz ustawienia LDAP, SSO, repozytoriów i asystenta czatu
* dziennik audytu

### W folderze trwałym
{: .no_toc }

To `/app/dist/persistent` w obrazie i `server/persistent` przy instalacji ze źródeł; każda ścieżka ma własną [zmienną](customization/paths.html):

| Ścieżka domyślna | Zmienna | Zawartość |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | Kategorie, role i stałe |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | Pliki formularzy, `.yaml` lub `.yml`, w razie potrzeby w podfolderach |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | Playbooki formularzy `ansible` i ich katalog roboczy |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Klony repozytoriów git |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | Kopie, które Projektant tworzy przed zapisem |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | Kopie zapasowe bazy danych |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | Pliki przesłane przez pola `file` |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` i `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | Certyfikat i klucz, gdy `HTTPS` ma wartość `1` |
| `.env` | | Zmienne środowiskowe zapisane ze stron ustawień (chyba że `ALLOW_ENV_EDIT` ma wartość `0`) |

Wygenerowany klucz SSH znajduje się w [`HOME_PATH`](customization/paths.html#env_HOME_PATH), domyślnie poza folderem trwałym.

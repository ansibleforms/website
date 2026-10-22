---
layout: default
title: Tryby
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Jak RTE komunikuje się z aplikacją
{: .no_toc }

Wychodzący, przychodzący lub bazy danych: kto otwiera połączenie i co nim przechodzi
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: od wersji 7.3.0 RTE komunikuje się z aplikacją przez jeden WebSocket i nie ma poświadczeń do bazy danych. Wybierz tryb,
który pasuje do sieci między nimi: kto może otworzyć połączenie do kogo i przez jakie proxy i zapory ono przechodzi.

---

## Trzy tryby

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) na RTE mówi, jak łączy się ono z aplikacją; jego runner ma ten sam **Tryb**:

| Tryb | Kto otwiera połączenie | Co ma RTE | Dla |
|---|---|---|---|
| `outbound` | RTE łączy się z aplikacją pod [`APP_URL`](../customization/server.html#env_APP_URL) i utrzymuje jeden otwarty WebSocket | Swój `RTE_TOKEN`, bez poświadczeń do bazy danych | DMZ, NAT lub strefy, która nie dopuszcza połączeń przychodzących: nic nie dociera do RTE z zewnątrz |
| `inbound` | Aplikacja łączy się z RTE pod adresem jego runnera i utrzymuje jeden otwarty WebSocket | Swój `RTE_TOKEN`, bez poświadczeń do bazy danych | Sieci, w której każde połączenie otwiera strona centralna, projektu compose, poda |
| `database` (przestarzały) | Aplikacja wywołuje API RTE przez HTTP, a RTE samo czyta i zapisuje bazę danych aplikacji | Poświadczenia bazy danych (`DB_*`) i `ENCRYPTION_SECRET` | Zachowanie z wersji 7.0 do 7.2, usunięte w 8.0.0 |

RTE bez `RTE_MODE` działa w trybie bazy danych przez całą serię 7.x i przy starcie zapisuje ostrzeżenie `[DEPRECATED] This RTE runs in database mode`.
Runner dodany przed wersją 7.3.0 ma tryb **Baza danych (przestarzały)**; przy przenoszeniu ustaw go na tryb, w którym działa jego RTE.

---

## Wychodzący

Połączenie otwiera RTE, więc działa to z sieci, która w ogóle nie przyjmuje połączeń przychodzących:

* **Gniazdo** : RTE łączy się z `APP_URL` z dopisanym `/api/v2/rte/socket`, przez `wss://` (`ws://` dla adresu `http://`), ze swoim
  `RTE_TOKEN` i nazwą swojego runnera, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Gdy gniazdo zostanie zerwane, łączy się ponownie
* **Za pierwszym razem** : prosi o dołączenie, a jego runner czeka na zatwierdzenie przez admina w **Połączenia > Runnery**, połączony,
  ale bez zadań (zobacz [Prośba o dołączenie](../runners/registration.html#asking-to-join)). Token dołączenia,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), zatwierdza go od razu. Od tej pory loguje się własnym tokenem
* **Sieć** : tylko ze strefy RTE do aplikacji, na porcie aplikacji, przez proxy, gdy tak mówi `HTTPS_PROXY`. Reverse
  proxy przed aplikacją musi przepuszczać WebSocket na tej ścieżce (zobacz [WebSockety runnerów](../production/reverse-proxy.html#runner-websockets))
* **Certyfikat** : certyfikat aplikacji jest sprawdzany. Prywatne CA wskaż przez `NODE_EXTRA_CA_CERTS` albo, tylko wewnątrz jednej zaufanej sieci,
  wyłącz sprawdzanie przez [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **Runner** : nie potrzebuje adresu, więc jego poświadczenie RTE zawiera tylko token
* **Gotowość** : `/ready` odpowiada `503`, dopóki gniazdo do aplikacji nie jest otwarte

Przy kilku węzłach aplikacji za load balancerem gniazdo trzyma ten węzeł, do którego dotrze RTE. Zadanie może uruchomić dowolny węzeł: węzeł, który trzyma
gniazdo, wysyła je do RTE, w ciągu dwóch sekund, gdy zadanie uruchomiono na innym węźle.

---

## Przychodzący

RTE nasłuchuje na swoim `PORT`, a aplikacja łączy się z nim pod adresem jego runnera, z dopisanym `/rte/v1/socket` i tokenem RTE. Przy
kilku węzłach aplikacji gniazdo każdego runnera w trybie przychodzącym trzyma naraz jeden węzeł; gdy ten się zatrzyma, przejmuje je inny i łączy się ponownie.

Aplikacja potrzebuje runnera RTE, zanim będzie mogła się z nim połączyć: typ RTE, tryb **Przychodzący** i poświadczenie RTE z adresem RTE i jego
`RTE_TOKEN`. Trafia on tam na jeden z dwóch sposobów:

| Jak | Co ustawić |
|---|---|
| RTE prosi o dołączenie | `APP_URL` i [`RTE_URL`](../customization/server.html#env_RTE_URL) (adres, pod który łączy się aplikacja). RTE wykonuje jedno wywołanie, `POST /api/v2/rte/register`, a jego runner czeka na zatwierdzenie przez admina: aplikacja łączy się z nim, gdy zostanie zatwierdzony (zobacz [Prośba o dołączenie](../runners/registration.html#asking-to-join)). Z `RTE_JOIN_TOKEN` jest zatwierdzany od razu. RTE w trybie przychodzącym z `APP_URL`, ale bez `RTE_URL` odmawia startu |
| Ty dodajesz runner | Bez `APP_URL`: dodaj runner w **Połączenia > Runnery** lub w [config seed](../seed/), jak w [Uruchamianie RTE](run.html#start-it) |

Projekt Docker Compose, chart Helm i kontroler instalatora uruchamiają w ten sposób własne RTE, w trybie przychodzącym, zadeklarowane przez seed.

**Przez HTTPS.** Przy [`HTTPS=1`](../customization/server.html#env_HTTPS) RTE udostępnia swoje gniazdo przez TLS, z kluczem i certyfikatem
z [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) i [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(domyślnie `key.pem` i `cert.pem` w jego folderze `certificates`). RTE z `RTE_URL` w postaci `https://` wysyła ten certyfikat, gdy
prosi o dołączenie, a aplikacja go przypina: łączy się z RTE tylko wtedy, gdy przedstawia ono ten sam certyfikat, więc samopodpisany działa bez CA.
RTE zapisuje przy starcie odcisk certyfikatu (pierwsze 8 cyfr szesnastkowych SHA-256 jego bajtów DER, jako `abcd-ef12`),
a okno zatwierdzania pokazuje odcisk, który otrzymała aplikacja: sprawdź, czy się zgadzają, zanim zatwierdzisz.
[Instalator](../installation/installer.html#a-runner) konfiguruje w ten sposób swoje runnery w trybie przychodzącym, z certyfikatem ich własnego adresu.

---

## Baza danych (przestarzały)

RTE z wersji 7.0 do 7.2: aplikacja wywołuje jego API przez HTTP, a RTE przejmuje zadanie w bazie danych, zapisuje tam wynik i aktualizuje
własny wiersz runnera, z [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Tryb bazy danych](./#database-mode-deprecated)
opisuje, czym różnią się jego kroki. Nadal działa w 7.x, z ostrzeżeniem przy każdym starcie, i zostanie usunięty w 8.0.0.

Aby przenieść takie RTE do trybu gniazda, zachowaj jego runner i token:

1. Runner z [config seed](../seed/): najpierw ustaw dla niego w seedzie `rte_mode: outbound` lub `rte_mode: inbound` (przychodzący: z
   adresem, pod który łączy się aplikacja, w `url` jego poświadczenia). RTE nie może samo przenieść runnera z seeda
2. Na RTE ustaw `RTE_MODE=outbound` z `APP_URL` albo `RTE_MODE=inbound` (z `APP_URL` i `RTE_URL`, aby wykonało swoje jedno
   wywołanie rejestracji) i ustaw [`RTE_NAME`](../customization/server.html#env_RTE_NAME) na nazwę, jaką ma jego runner w
   **Połączenia > Runnery**. Zachowaj jego `RTE_TOKEN`
3. Usuń `DB_*` i `ENCRYPTION_SECRET` z jego środowiska oraz `RTE_REGISTER`, które odczytuje tylko tryb bazy danych, a potem je zrestartuj

Gdy zaktualizowane RTE zaloguje się nazwą runnera i własnym tokenem runnera, aplikacja od razu przenosi ten runner do trybu RTE,
bez zatwierdzania, i zapisuje w dzienniku *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. Runner nie jest już wierszem zarejestrowanym przez swoje RTE, więc worker nigdy go nie usuwa, gdy stary kontener przestaje odpowiadać.
Runner z config seed, który nadal jest w trybie bazy danych, jest natomiast odrzucany, z *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. Nie używaj do tego tokenu dołączenia: token dołączenia
jest odrzucany dla runnera, który jest już zatwierdzony. RTE w trybie przychodzącym bez `APP_URL` nie wykonuje żadnego wywołania: ustaw zamiast tego **Tryb** jego runnera na
**Przychodzący** w **Połączenia > Runnery**, a aplikacja się z nim połączy. [Instalator](../installation/installer.html#a-72-runner)
aktualizuje w ten sposób runner z wersji 7.2.

---

## Co przechodzi przez gniazdo

W obu trybach gniazda aplikacja wysyła RTE każde zadanie ze wszystkim, co RTE wcześniej czytało w bazie danych, i zapisuje to, co wraca:
wynik, zdarzenia, dziennik zadania i zakończenie, dokładnie raz. Aplikacja wysyła też powiadomienia o zakończeniu.

**Spool.** Każda paczka wyniku, paczka zdarzeń, dziennik, start i zakończenie są numerowane i zapisywane w pliku spoola zadania
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)), zanim zostaną wysłane, i przechowywane, dopóki aplikacja nie potwierdzi ich zapisania.
Po ponownym połączeniu, z tym samym węzłem aplikacji lub innym, RTE wysyła ponownie to, co nie zostało potwierdzone, a aplikacja pomija to, co już
zapisała: nic nie ginie i nic nie jest zapisane dwukrotnie. Trzymaj spool na wolumenie, żeby RTE, które się restartuje, nadal wysłało to, czego nie
dostarczyło. Playbook, który działał, gdy RTE się zrestartowało, nie może kontynuować: jego zadanie kończy się jako porzucone.

**Pojemność.** RTE uruchamia naraz do [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooków albo tyle, ile ustawiono
na jego [stronie runnera](../runners/runner-page.html#an-rtes-settings), i co 20 sekund mówi aplikacji, ile ich działa. Zadanie dla pełnego
RTE czeka, jak opisano w [Kilka RTE](several.html#several-jobs-on-one-rte).

**Pliki zadania.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES) albo ustawienie **Pliki zadań** na stronie jego runnera mówi,
skąd RTE bierze playbooki i inwentarze:

| `RTE_FILES` | Skąd pochodzą pliki |
|---|---|
| `transfer` (domyślnie) | Aplikacja wysyła folder playbooków i inwentarze z zadaniem, każde spakowane i nazwane hashem swojej zawartości. RTE trzyma je spakowane w [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), ostatnio używane do [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (domyślnie 1024 MB), i prosi tylko o hash, którego nie ma: niezmieniony folder nigdy nie jest wysyłany dwa razy. RTE nie potrzebuje współdzielonego dysku ani dostępu do repozytoriów |
| `local` | RTE działa z własnych folderów, jak RTE w trybie bazy danych: zamontuj na nim playbooki ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) i repozytoria ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) |

Przy `transfer` każde zadanie rozpakowuje swoje pliki we własnym prywatnym folderze, usuwanym po zakończeniu zadania: żadne zadanie nie widzi tego, co zapisało inne,
i żaden plik inwentarza ani extravars nie zostaje rozpakowany na dysku RTE. RTE mogą współdzielić jeden `RTE_CACHE_PATH`; każde trzyma swoje zadania w
osobnym folderze, a folder RTE, które się zatrzymało (zabite w trakcie zadania lub odtworzone z inną nazwą hosta), pozostałe usuwają
po 10 minutach. Folder większy niż [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (domyślnie 512, odczytywane przez
aplikację, stosowane bez restartu) nie jest wysyłany: zadanie kończy się błędem z informacją, by zamiast tego zamontować folder na RTE. Folder ssh nigdy nie jest wysyłany: RTE trzyma własny
klucz prywatny i `known_hosts` w `/home/node/.ssh`.

**Hosty i zadania.** Od wersji 7.3.0 RTE w każdym trybie zapisuje strukturalne zdarzenia playbooka obok jego wyniku tekstowego: każdy play, task i
wynik hosta oraz podsumowanie, zapisywane przez jego wtyczkę callback `af_events`. Strona zadania pokazuje je w **Hosty i zadania** (zobacz
[Śledzenie zadania](../jobs/following.html#hosts-and-tasks)).

---

## Sieć

Co otworzyć między aplikacją, RTE i zarządzanymi hostami, w zależności od trybu:

| Tryb | Skąd | Dokąd | Port |
|---|---|---|---|
| Wychodzący | RTE | Aplikacja, pod `APP_URL` | Port aplikacji (`443` za większością proxy) |
| Przychodzący | Węzły aplikacji | RTE, pod adresem jego runnera | `PORT` RTE (`8000`) |
| Baza danych (przestarzały) | RTE oraz węzły aplikacji i worker | Baza danych oraz RTE | `3306` i `PORT` RTE |
| Każdy tryb | RTE | Zarządzane hosty | ssh (`22`), WinRM, ich API |

W trybie gniazda RTE nigdy nie łączy się z bazą danych. Jego API odpowiada tylko gniazdu i sondom: `/live`, `/ready`, `/metrics`.

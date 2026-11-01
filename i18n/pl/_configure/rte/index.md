---
layout: default
title: RTE
nav_order: 11
has_children: true
has_toc: false
permalink: /rte/
translated_from: 75a4facc8ad51d9d74b8fccfd2bbfd7ba48b17f9
---

# Środowiska uruchomieniowe (RTE)
{: .no_toc }

Czym jest RTE, jak uruchamia playbook i czego może dotykać
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: zrozum RTE, zanim je uruchomisz, dobierzesz jego rozmiar lub przeniesiesz do innej sieci.

| Strona | Czego dotyczy |
|---|---|
| [Obrazy](images.html) | Trzy obrazy RTE i budowanie własnego z kolekcjami, których używają Twoje playbooki |
| [Tryby](modes.html) | Wychodzący, przychodzący lub bazy danych: kto otwiera połączenie, spool, pliki zadania |
| [Uruchamianie RTE](run.html) | Ustawienia każdego trybu i przykład `docker run` dla każdego z nich |
| [Kilka RTE](several.html) | Pojemność, repliki za jednym adresem i co się dzieje, gdy RTE się zatrzyma lub padnie |
| [Inne centrum danych](another-datacenter.html) | Runbook: dodanie RTE w drugim centrum danych, od pustego hosta do pierwszego zadania |

---

## Czym jest RTE

AnsibleForms 7 nie uruchamia żadnego playbooka w kontenerze aplikacji. Zadanie formularza `ansible` jest przekazywane do [runnera](../runners.html) typu
`rte`, czyli środowiska uruchomieniowego: serwera AnsibleForms uruchomionego z `AF_ROLE=rte`, obok pythona i ansible, bez interfejsu
WWW. Komunikuje się z aplikacją przez jeden WebSocket i nie ma żadnych poświadczeń do bazy danych
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` lub `inbound`, zobacz [Tryby](modes.html)): aplikacja wysyła mu zadanie,
RTE uruchamia `ansible-playbook`, a aplikacja zapisuje wynik i końcowy status, które RTE odsyła, i stamtąd czyta je przeglądarka.

Aplikacja rozwiązuje poświadczenia zadania i przekazuje je RTE zapieczętowane tylko dla tego RTE i tego zadania. RTE nigdy nie czyta
tabeli poświadczeń ani magazynu sekretów, a playbook nie dziedziczy zmiennych środowiskowych samego AnsibleForms
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` i innych): przekaż taką wartość jako extravar lub poświadczenie. RTE z wersji 7.0 do 7.2,
które samo czytało i zapisywało bazę danych, nadal działa w 7.x jako przestarzały tryb bazy danych (zobacz [Tryb bazy danych](#database-mode-deprecated)).

---

## Jak działa RTE

RTE to kontener, który uruchamiasz sam, obok aplikacji lub w innej sieci: AnsibleForms nigdy go nie tworzy. Poniżej opisano,
gdzie działa, co współdzieli z aplikacją i co dzieje się w nim od chwili uruchomienia formularza, aż proces playbooka
zniknie:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Jak RTE uruchamia playbook</title>
<desc id="afr-desc">Na hoście kontenerów lub w klastrze Kubernetes, oba zarządzane przez operatora, kontener aplikacji i jeden lub więcej kontenerów RTE utrzymują każdy po jednym WebSockecie między sobą, otwieranym przez aplikację (przychodzący) lub przez RTE (wychodzący). Tylko aplikacja rozmawia z bazą danych. 1: przeglądarka uruchamia formularz w aplikacji. 2: aplikacja zapisuje zadanie w bazie danych, wybiera runner i pieczętuje dla niego sekrety zadania. 3: aplikacja wysyła zadanie przez gniazdo. 4: RTE je przejmuje i pobiera pliki zadania, ze swojej pamięci podręcznej lub z aplikacji. 5: RTE uruchamia ansible-playbook jako proces potomny, jeden na zadanie, do RTE_MAX_JOBS. 6: playbook łączy się z zarządzanymi hostami. 7: RTE zapisuje wynik, zdarzenia i zakończenie w swoim spoolu i wysyła je przez gniazdo; aplikacja zapisuje je w bazie danych i potwierdza odbiór. 8: przeglądarka śledzi zadanie przez aplikację. Wolumen aplikacji jest montowany w RTE tylko przy RTE_FILES=local.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Host kontenerów lub klaster Kubernetes</text>
<text class="afr-s" x="181" y="61">zarządzany przez Ciebie; wychodzące RTE może być w innej sieci</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Przeglądarka</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">formularze, zadanie</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">Kontener app</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">WWW, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runnery</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">pieczętują sekrety</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">Hub RTE</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">zapisuje, potwierdza</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">Kontener RTE</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">Pliki zadania</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">w cache wg hasha</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">do RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">do potwierdzenia</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">jeden</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Zarządzane hosty</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, API</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Wolumen aplikacji</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooki, inwentarze</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">tylko RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">tylko dla aplikacji</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

Diagram pokazuje jedno gniazdo na RTE, niezależnie od tego, która strona je otworzyła: aplikacja łączy się z RTE w trybie przychodzącym, RTE w trybie wychodzącym łączy się z aplikacją (zobacz
[Tryby](modes.html)). Gdy gniazdo jest otwarte, te same komunikaty płyną w obie strony, a bazę danych czyta i zapisuje tylko aplikacja.

**Kto je uruchamia.** RTE to długo działający kontener, uruchamiany przez to, co uruchamia Twoje pozostałe kontenery. Czeka na zadania i działa
dalej między nimi:

| Jak uruchamiasz AnsibleForms | Kto uruchamia RTE |
|---|---|
| `docker run` lub `podman run` | Ty, poleceniem takim jak w [Uruchamianie RTE](run.html), na dowolnym hoście, który dociera do aplikacji albo do którego dociera aplikacja |
| [Docker Compose](../installation/docker-compose.html) | Usługa `rte` w `docker-compose.yml`, obok `app` i `mysqldb`. Jej config seed deklaruje ją jako domyślny runner `rte`, w trybie przychodzącym, pod `http://rte:8000` |
| [Chart Helm](../installation/kubernetes.html) | Kubernetes, jako drugi kontener o nazwie `rte` w podzie aplikacji (`containers.rte`). Aplikacja łączy się z nim na `127.0.0.1`, w trybie przychodzącym, a seed chartu deklaruje go jako domyślny runner |
| [Instalator](../installation/installer.html) | Docker Compose lub chart Helm jak wyżej albo usługa systemd [bez kontenerów](../installation/native.html); własny runner, który prosi o dołączenie i czeka na zatwierdzenie przez admina |

Silnik kontenerów należy do Ciebie: Docker lub Podman na hoście albo środowisko uruchomieniowe kontenerów Twojego klastra Kubernetes, instalowane i aktualizowane
przez Ciebie. AnsibleForms nigdy się z nim nie komunikuje. Ani aplikacja, ani RTE nie wywołuje Dockera ani Podmana, nie montuje ich gniazda ani nie uruchamia
kontenera: aplikacja komunikuje się z RTE tylko przez jego gniazdo.

**Co jest w środku.** Jeden kontener, z tym, co potrzebne do uruchomienia playbooka, i niczym więcej:

* **Serwer** : ten sam serwer Node.js co aplikacja, uruchomiony z `AF_ROLE=rte` (ustawionym w obrazie) pod `tini`
* **Pominięte** : interfejs WWW, logowanie, harmonogram, worker i wszystkie moduły bazy danych, których ta rola nie ładuje
* **Na czym nasłuchuje** : na swoim `PORT` (`8000`): `/live` i `/ready` dla sond oraz `/metrics` dla Prometheus, a w trybie przychodzącym gniazdo,
  z którym łączy się aplikacja, `/rte/v1/socket`. RTE w trybie wychodzącym nie przyjmuje żadnego połączenia od aplikacji
* **Python i ansible** : dostarczane przez wybraną warstwę obrazu (zobacz [Obrazy RTE](images.html))
* **Użytkownik** : serwer i każdy playbook działają jako `node` (uid 1000), nigdy jako root

**Co współdzieli z aplikacją.** Swój token, a przy `RTE_FILES=local` pliki aplikacji. Przy `RTE_FILES=transfer`, domyślnym,
playbooki i inwentarze przychodzą z każdym zadaniem, a RTE nie potrzebuje współdzielonego dysku:

| Współdzielone z aplikacją | Co RTE z tym robi |
|---|---|
| `RTE_TOKEN` | Przedstawia go, gdy łączy się z aplikacją (tryb wychodzący), lub sprawdza, gdy aplikacja łączy się z nim (tryb przychodzący). Aplikacja ma tę samą wartość w poświadczeniu RTE runnera, a sekrety zadania są nim pieczętowane |
| Wolumen trwały, `/app/dist/persistent`, tylko przy `RTE_FILES=local` | Folder playbooków ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) lub repozytorium playbooków sklonowane przez worker w [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), inwentarze ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) i repozytoria inwentarzy) oraz przesłane pliki. RTE zapisuje pliki extravars zadania w folderze playbooka, więc montuj go do odczytu i zapisu |
| Folder ssh, `/home/node/.ssh` | Klucz prywatny i `known_hosts`, których używają połączenia ssh playbooka: zamontuj folder aplikacji, zarządzany na jej stronach ustawień, albo daj RTE własny |

RTE niczego nie klonuje: repozytorium dociera do niego w plikach zadania lub na wolumenie współdzielonym z aplikacją. Kolekcje, role i
`ansible.cfg` pochodzą z obrazu, z folderów `/etc/ansible/collections`, `/etc/ansible/roles` i z `/etc/ansible/ansible.cfg`, gdy
je tam zamontujesz (projekt Docker Compose to robi), albo z `ansible.cfg` obok playbooków.

**Życie zadania.** Poniższe numery to numery z diagramu, dla formularza playbooka uruchomionego z przeglądarki lub przez API:

1. **Uruchomienie** : aplikacja sprawdza formularz i jego wartości, buduje extravars i zapisuje zadanie ze statusem `running`. Formularz z
   [zatwierdzeniem](../forms/approval.html) zatrzymuje się tutaj, dopóki zatwierdzający go nie zaakceptuje, i wcześniej nie trafia do żadnego RTE
2. **Wybór runnera** : aplikacja bierze RTE, które formularz wskazuje przez `runner: <name>`, a w przeciwnym razie domyślny runner typu RTE, i zapisuje jego
   nazwę w zadaniu. Rozwiązuje poświadczenia zadania z bazy danych lub [magazynu sekretów](../secret-stores/), jego login ansible i
   hasło vault, i pieczętuje je algorytmem AES-256-GCM kluczem wyprowadzonym z tokenu tego runnera i id zadania
3. **Przekazanie** : węzeł aplikacji, który trzyma gniazdo RTE, wysyła mu zadanie: extravars, opcje formularza, zapieczętowane sekrety i
   hashe plików zadania. Zadanie może uruchomić dowolny węzeł aplikacji; ten, który trzyma gniazdo, wysyła je w ciągu dwóch sekund. Pełne RTE
   albo niepołączone sprawia, że zadanie czeka, do [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Przejęcie** : RTE odpowiada `claimed` albo `refused`, gdy jest pełne, się zatrzymuje, nie może otworzyć sekretów lub zadanie przychodzi z innym
   [kontraktem](images.html#the-contract) niż jego własny. Przy `RTE_FILES=transfer` bierze playbooki i inwentarze ze swojej
   pamięci podręcznej według hasha, prosi aplikację o hash, którego nie ma, i rozpakowuje je w osobnym folderze zadania
5. **Start** : w folderze playbooka (plus `playbookSubPath` formularza, który musi istnieć) zapisuje dwa pliki: `extravars_<id>.json`
   z wartościami formularza i poświadczeniami oraz ukryty plik z loginem ansible. Następnie uruchamia `ansible-playbook` jako własny proces
   potomny, bez powłoki, we własnej grupie procesów, z `-e @` tymi plikami, jednym `-i` na każdy inwentarz oraz tagami, limitem, check,
   diff i szczegółowością formularza. Hasło vault trafia przez stdin, nigdy do pliku ani do wiersza poleceń, a proces działa jako
   `node` z odfiltrowanym środowiskiem (zobacz niżej)
6. **Wykonanie** : playbook łączy się z zarządzanymi hostami z kontenera RTE, przez ssh z kluczem i `known_hosts` z
   `/home/node/.ssh`, z `sshpass` dla logowania hasłem, albo przez API wywoływane przez jego moduły. To RTE, a nie aplikacja, musi do nich docierać
7. **Wynik i zakończenie** : RTE grupuje stdout i stderr co pół sekundy lub co 64 KB, z zamaskowanymi poświadczeniami, i numeruje każdą
   paczkę. Każdy element zapisuje w spoolu zadania na swoim dysku, zanim go wyśle: wynik, zdarzenia, dziennik zadania z
   `.joblogs/job_log_<id>.log` (co 2 sekundy), start i zakończenie z końcowym statusem (`success`, `failed` lub `aborted`). Aplikacja
   zapisuje każdy element raz i potwierdza go, a RTE usuwa spool, gdy zakończenie zostanie zapisane. Po przekroczeniu
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bajtów na strumieniu (domyślnie 50 MB) nie wysyła już nic, a
   playbook działa dalej. Następnie aplikacja wysyła [powiadomienia](../forms/notifications.html) formularza
8. **Śledzenie** : przeglądarka nigdy nie komunikuje się z RTE: strona formularza co 2 sekundy ponownie odczytuje zadanie przez aplikację, a strona Zadania
   śledzi je na żywo, w miarę jak aplikacja zapisuje kolejne elementy

**Zerwane gniazdo.** Playbook działa dalej. RTE łączy się ponownie (tryb wychodzący) albo węzeł aplikacji łączy się z nim ponownie (tryb przychodzący) i wysyła ponownie to,
czego aplikacja nie potwierdziła: aplikacja pomija to, co już zapisała, więc żaden wiersz nie ginie ani nie jest zapisany dwukrotnie. Działa to, dopóki gniazdo
wróci w ciągu dwóch minut: aplikacja zapisuje sygnał życia RTE tylko wtedy, gdy jego gniazdo jest otwarte, a gdy ten sygnał ma dwie minuty,
worker kończy działające zadania RTE jako porzucone, nawet jeśli ich playbooki nadal działają. Trzymaj spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) na wolumenie, żeby zrestartowane RTE nadal wysłało to, co zachowało.
Playbook, który działał, gdy jego RTE się zrestartowało, nie może kontynuować: aplikacja kończy jego zadanie jako porzucone, gdy RTE wraca bez niego.

**Przerwanie.** Przerwanie ustawia flagę przerwania zadania, a węzeł aplikacji, który trzyma gniazdo RTE, w ciągu dwóch sekund wysyła `cancel`. RTE
wysyła `SIGTERM` do grupy procesów playbooka, więc `ansible-playbook` i każdy fork, który uruchomił, zatrzymują się razem, a zadanie kończy się jako
`aborted`. Anulowanie, które dotrze przed swoim zadaniem, jest przechowywane przez minutę, a zadanie startuje wtedy już przerwane.

**Sprzątanie.** Gdy tylko proces się zakończy, niezależnie od wyniku, RTE usuwa oba pliki extravars (formularz z `keepExtravars`
zachowuje widoczny, nigdy ukryty), plik artefaktów w `/tmp`, plik dziennika zadania i osobny folder plików zadania. Zakończenie
jest zapisywane raz: drugi zapisujący, np. aplikacja oznaczająca jako nieudane zadanie, które RTE już zakończyło, niczego nie zmienia.

**Jeden proces na zadanie, a nie jeden kontener na zadanie.** AWX i AAP przy każdym zadaniu uruchamiają nowy pod lub kontener z obrazu
execution environment. AnsibleForms niczego nie uruchamia: kontener RTE już działa, a każde zadanie jest w nim procesem potomnym. Zadanie startuje
bez pobierania obrazu i planowania poda, a AnsibleForms nie potrzebuje żadnych uprawnień do Twojego silnika kontenerów ani klastra. W zamian
playbooki działające na jednym RTE dzielą jego CPU, pamięć, `/tmp`, folder domowy i pythona: daj kontenerowi wystarczająco zasobów na
`RTE_MAX_JOBS` playbooków z ich forkami. Aby zmienić to, czego może używać playbook, zmień obraz, a nie zadanie.

---

## Granica bezpieczeństwa

RTE uruchamia kod napisany przez autorów formularzy, więc jest zbudowane tak, by przechowywać jak najmniej:

* **Tylko jego token** : RTE nie ma poświadczeń do bazy danych ani `ENCRYPTION_SECRET`. Nie przyjmuje żadnych wywołań poza gniazdem aplikacji, z
  jego tokenem, i nie ma użytkowników, logowania ani stron WWW. Przez gniazdo może tylko uruchamiać zadania, które wysyła mu aplikacja, raportować o nich i
  prosić o ich pliki: nie może utworzyć zadania, odczytać innego zadania ani rozdawać poświadczeń
* **Zapieczętowane sekrety** : aby uruchomić zadanie, RTE nigdy nie czyta tabeli poświadczeń ani magazynu sekretów. Dostaje sekrety zadań, które
  uruchamia, zapieczętowane tylko dla swojego tokenu i id tego zadania, więc paczka przeznaczona dla innego RTE lub innego zadania się nie otwiera, a zmieniony bajt
  jest odrzucany
* **Sprawdzane połączenie** : w trybie wychodzącym RTE sprawdza certyfikat aplikacji. W trybie przychodzącym przez HTTPS aplikacja przypina własny certyfikat RTE,
  gdy ono dołącza, i łączy się z nim tylko wtedy, gdy przedstawia właśnie ten (zobacz [Tryby](modes.html#inbound)). RTE w trybie przychodzącym przez zwykłe HTTP powinno być
  w sieci prywatnej, takiej jak sieć projektu Docker Compose
* **Bez dziedziczonego środowiska** : `ansible-playbook` dostaje środowisko RTE bez wszystkich zmiennych, które odczytuje sam AnsibleForms
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, zmienne `MYSQL_*` i inne), więc
  `lookup('env', ...)` nie może do nich dotrzeć. To, co ustawisz dla playbooków (`PATH`, proxy, `ANSIBLE_*`), przechodzi bez zmian
* **Bez szablonów od użytkowników** : {% raw %}wartość formularza, która zawiera `{{`, `{%` lub `{#`, trafia do playbooka jako niebezpieczny ciąg (unsafe){% endraw %},
  którego ansible nigdy nie przetwarza jako szablonu, chyba że formularz ustawia `allowJinjaInExtravars`, a żadna powłoka nigdy nie uruchamia wiersza poleceń
* **Nie jako root** : RTE i jego playbooki działają jako `node` (uid 1000), więc playbook może robić w kontenerze to, co może ten użytkownik, np.
  czytać jego pliki i klucz ssh, i nic więcej

Traktuj jego kontener, obraz i środowisko z taką samą starannością jak kontener aplikacji.

---

## Tryb bazy danych (przestarzały)

RTE z wersji 7.0 do 7.2, bez `RTE_MODE`, działa przez całą serię 7.x i zostanie usunięte w 8.0.0. Różni się od powyższych kroków na cztery sposoby:

* **Ma dostęp do bazy danych** : swoje ustawienia `DB_*` oraz `ENCRYPTION_SECRET`, gdy samo się rejestruje
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **Przekazanie to wywołanie HTTP** : aplikacja wywołuje `POST <address>/rte/v1/jobs` z tokenem i zapieczętowanymi sekretami, a RTE przejmuje
  zadanie, zapisując w nim swoją nazwę w bazie danych (kroki 3 i 4)
* **Samo zapisuje wynik** : w bazie danych, paczkami, bez spoola (krok 7). Przerwanie dociera do niego przez flagę przerwania zadania,
  którą odczytuje co 2 sekundy, oraz przez wywołanie `/cancel`
* **Czyta pliki z wolumenu aplikacji** : potrzebuje tego samego dysku co aplikacja, jak przy `RTE_FILES=local`

Jego strona runnera nie ma żadnych [ustawień RTE](../runners/runner-page.html#an-rtes-settings): odczytuje własne zmienne. Aby przenieść je do
trybu gniazda, zobacz [Tryby](modes.html#database-deprecated).

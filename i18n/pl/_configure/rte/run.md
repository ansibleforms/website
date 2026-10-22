---
layout: default
title: Uruchamianie RTE
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Uruchamianie RTE
{: .no_toc }

Ustawienia każdego trybu i jak uruchomić RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ustawienia

To, czego potrzebuje RTE, zależy od jego trybu (zobacz [Tryby](modes.html)). Każde RTE odczytuje te zmienne:

| Zmienna | Znaczenie |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Od wersji 7.3.0: `outbound` (łączy się z aplikacją), `inbound` (aplikacja łączy się z nim) lub `database` (przestarzały, domyślny w całej serii 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Token między aplikacją a RTE, co najmniej 16 znaków; bez niego RTE odmawia startu |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Ile playbooków uruchamia naraz, domyślnie `10` (`0` oznacza brak limitu). Zadanie dla pełnego RTE czeka, aż jakiś playbook się zakończy |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Przy zatrzymaniu: jak długo czeka na działające playbooki, domyślnie `25`; te, które wtedy nadal działają, kończą się jako porzucone |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Odczytywane przez węzły aplikacji i worker, nie przez RTE: jak długo zadanie czeka na pełne lub zatrzymujące się RTE, domyślnie `60` |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | Folder playbooków i limit wyniku: odczytywane przez RTE, więc ustaw je w jego środowisku |
| `LISTEN_HOST` | Od wersji 7.3.0: adres, na którym nasłuchuje, domyślnie każdy interfejs; `127.0.0.1`, gdy nic nie łączy się z nim z zewnątrz (RTE w trybie wychodzącym) |

RTE w trybie gniazda, `outbound` lub `inbound`, odczytuje też te zmienne, a nie odczytuje żadnych `DB_*` ani `ENCRYPTION_SECRET`:

| Zmienna | Znaczenie |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | Adres aplikacji, pod którym otwierają ją ludzie, np. `https://forms.example.com`. Wychodzący: adres, z którym się łączy. Przychodzący: adres jego jednego wywołania rejestracji |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (domyślnie): certyfikat aplikacji musi być ważny. `0` akceptuje każdy, tylko wewnątrz jednej zaufanej sieci |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Nazwa jego runnera, którą formularze wskazują przez `runner:`. Nieustawiona: jego id węzła, `rte-<hostname>-<port>`, które zmienia się z kontenerem: ustaw ją w produkcji |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcjonalny, tylko za pierwszym razem: token dołączenia, utworzony przez API, który od razu zatwierdza jego runner, zamiast czekać na admina (zobacz [Tokeny dołączenia](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | W trybie przychodzącym, gdy prosi o dołączenie: adres, pod który łączy się aplikacja, np. `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (domyślnie): aplikacja wysyła playbooki i inwentarze z zadaniem. `local`: działa z własnych zamontowanych folderów |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Gdzie wynik, zdarzenia i zakończenie każdego zadania czekają, aż aplikacja je zapisze, domyślnie `<persistent>/rte-spool`: trzymaj to na wolumenie |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Przy `transfer`: gdzie przechowywane są foldery wysłane przez aplikację, domyślnie `<persistent>/rte-files` |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Przy `transfer`: ile mogą zajmować te foldery, domyślnie `1024`; najdawniej używane idą pierwsze, a `0` nie zachowuje żadnych |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Odczytywane przez aplikację, nie przez RTE: największy folder, jaki wysyła przy `transfer`, domyślnie `512` |

Na RTE w trybie gniazda `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` i `RTE_CACHE_MB` można też ustawić na jego stronie runnera,
na karcie RTE: wartość tam wygrywa ze zmienną, która wtedy wypełnia tylko pole pozostawione puste (zobacz
[Ustawienia RTE](../runners/runner-page.html#an-rtes-settings)). Wartość spoza zakresu jest sprowadzana do swojego limitu, a RTE mówi o tym
przy starcie.

RTE w trybie bazy danych (przestarzałym) odczytuje zamiast tego ustawienia bazy danych i samo się rejestruje:

| Zmienna | Znaczenie |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Te same wartości co w aplikacji: RTE czyta swoje zadania z bazy danych i zapisuje tam ich wynik |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Adres, pod którym aplikacja wywołuje RTE, np. `http://rte:8000`. Runner jest nazywany od swojego hosta (`rte`), więc formularze mogą używać `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Przestarzałe w 7.3.0, razem z trybem bazy danych: RTE w trybie gniazda dołącza zamiast tego tokenem dołączenia. `1` (domyślnie): RTE przy starcie dodaje się w **Połączenia > Runnery**, a pierwsze staje się domyślnym runnerem. `0`: dodaj je tam sam albo w [config seed](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Ta sama wartość co w aplikacji, potrzebna tylko do samodzielnej rejestracji (token runnera jest przechowywany w postaci zaszyfrowanej); pomiń ją przy `RTE_REGISTER=0` |

W trybie bazy danych, bez `RTE_URL`, RTE rejestruje swój adres IP i port pod nazwą `rte-<hostname>-<port>`, które zmieniają się, gdy
kontener zostanie odtworzony: ustaw `RTE_URL` w produkcji. Worker usuwa runner, który RTE samo zarejestrowało, 10 minut po
ostatnim sygnale życia RTE.

---

## Uruchom je

RTE uruchamia playbooki, więc potrzebuje swojego folderu ssh, z kluczem prywatnym i `known_hosts`, których używają playbooki, oraz trwałego
folderu na swój spool i pliki wysyłane przez aplikację. Wybierz tryb:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Wychodzący</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Przychodzący</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Baza danych (przestarzały)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Uruchom RTE na dowolnym hoście, który dociera do aplikacji, z własnym tokenem i nazwą, którą dostanie jego runner:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Łączy się z aplikacją i prosi o dołączenie: **Połączenia > Runnery** pokazuje runner `rte-dmz` jako czekający na zatwierdzenie, a jego dziennik pokazuje
odcisk jego tokenu. Sprawdź, czy rozpatrzenie pokazuje ten sam odcisk, a potem go **Zatwierdź** (zobacz
[Zatwierdzanie RTE](../runners/registration.html#approving-an-rte)): od tej pory dostaje zadania, logując się własnym `RTE_TOKEN`.
Dla startu bez nadzoru dodaj `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, który od razu go zatwierdza. Nic nie musi docierać do tego
hosta: nie publikuj żadnego portu. Na jego `PORT` nasłuchują tylko `/live`, `/ready` i `/metrics`, dla sond.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Uruchom RTE tam, gdzie dociera do niego aplikacja. To działa obok aplikacji i uruchamia playbooki z jej folderów (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Następnie daj aplikacji jego runner: w [config seed](../seed/) poświadczenie RTE i runner w trybie przychodzącym, który się nim loguje:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

Albo dodaj te same dwa elementy ręcznie: poświadczenie w **Połączenia > Poświadczenia**, typ RTE, i runner w
**Połączenia > Runnery**, typ RTE, tryb **Przychodzący**, z tym poświadczeniem. Aby zamiast tego RTE poprosiło o dołączenie, uruchom je z
`APP_URL` i `RTE_URL` i zatwierdź je w **Połączenia > Runnery** (zobacz [Przychodzący](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Przestarzałe od wersji 7.3.0 i usunięte w 8.0.0. RTE uruchamia playbooki z własnego dysku, więc zamontuj na nim też trwały wolumen aplikacji
(playbooki, repozytoria, przesłane pliki) i jej folder ssh. Przykład Docker, z aplikacją osiągalną jako `ansibleforms` w tej samej
sieci:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Trzymaj RTE w trybie przychodzącym poza siecią publiczną: jego gniazdo odpowiada każdemu, kto ma token. `docker stop` czeka tylko 10 sekund, zanim
zabije kontener, więc daj RTE dłuższy limit czasu zatrzymania (`--stop-timeout` lub `stop_grace_period` w compose) albo obniż
`RTE_DRAIN_SECONDS`. Kubernetes domyślnie czeka 30 sekund.

[Instalator](../installation/installer.html) konfiguruje RTE w trybie wychodzącym lub przychodzącym na osobnym serwerze, z Docker, Podman lub
[bez kontenerów](../installation/native.html), i wypisuje odcisk, po którym należy je zatwierdzić. Aby ręcznie uruchomić RTE w innym centrum danych,
postępuj zgodnie z [Inne centrum danych](another-datacenter.html).

---
layout: default
title: Docker
parent: Aktualizacja
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Aktualizacja samodzielnego kontenera, bez docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Instalację samodzielną aktualizuje się, wymieniając jej kontenery: pobierz nowe obrazy, usuń stare kontenery i
uruchom nowe tymi samymi poleceniami `run`. Od wersji 7 są dwa: AnsibleForms i RTE, które uruchamia
playbooki, zawsze w tym samym wydaniu. Twoje pliki są przechowywane w zamontowanym folderze `/app/dist/persistent`, a dane w
MySQL, więc jedno i drugie zostaje zachowane.

---

## Przed aktualizacją

Przygotuj aktualizację tak, aby można było wrócić, jeśli coś pójdzie nie tak:

* **Wykonaj kopię zapasową** w **Ustawienia → Kopie zapasowe**. Nowe wydanie aktualizuje schemat bazy danych przy pierwszym uruchomieniu.
* **Przeczytaj [dziennik zmian](../changelog)** dla wydań między Twoją wersją a nową.
* **Przechodzisz na nową wersję główną?** Najpierw postępuj zgodnie z [Aktualizacja do v7](../upgrade-7.html).
* **Przechodzisz z 6.5?** Obrazy 7 działają jako uid 1000 zamiast roota: jednorazowo przekaż temu użytkownikowi montowane foldery, na
  przykład `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Przechodzisz z 7.2?** RTE dostaje własny plik, a aplikacja łączy się z nim: najpierw zobacz [Z 7.2 do 7.3](#from-72-to-73).

---

## Z 7.2 do 7.3

Do wersji 7.2.0 RTE odczytywało plik środowiska aplikacji, z ustawieniami bazy danych, i dodawało się jako runner na podstawie `RTE_URL`. To
jest tryb bazy danych, przestarzały w 7.3.0 i usunięty w 8.0.0. Od wersji 7.3.0 aplikacja łączy się z RTE i utrzymuje otwarty jeden WebSocket
(`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)), a RTE nie przechowuje ustawień bazy danych. Jednorazowo, przed krokiem 2:

1. Utwórz `/srv/apps/ansibleforms/rte.env` tak jak przy [instalacji](../installation/docker.html#prepare-the-folders), z
   `RTE_MODE=inbound`, tym samym `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` i `HTTPS=0`. Bez `DB_*`, bez `ENCRYPTION_SECRET`, bez `RTE_URL`
2. Zadeklaruj runner w tym trybie. Albo dodaj [config seed](../seed/) z instalacji, `persistent/seed.yaml` z poświadczeniem RTE
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) i runnerem `rte` (`rte_mode: inbound`), oraz dodaj
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` do pliku środowiska aplikacji. Albo, bez seeda, otwórz runner w
   **Połączenia → Runnery**, ustaw jego **Tryb** na **Przychodzący** i wybierz poświadczenie RTE, które zawiera `http://rte:8000` i token

Przy użyciu seeda plik środowiska aplikacji również zawiera `RTE_TOKEN`, ten sam token, ponieważ seed odczytuje go stamtąd.

---

## 1. Pobierz nowe obrazy

Pobierz najnowsze obrazy AnsibleForms i RTE dla używanego tagu:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Wymień kontenery

Usuń stare kontenery i uruchom nowe poleceniami `run` z [instalacji](../installation/docker.html). Aplikacja
odczytuje połączenie z bazą danych ze swojego pliku środowiska, z użytkownikiem bazy danych AnsibleForms (nie root). RTE odczytuje własny
`rte.env`, bez ustawień bazy danych, a aplikacja łączy się z nim przez sieć wspólną dla obu kontenerów:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Przy przejściu z 6.5 nie ma jeszcze kontenera RTE: polecenia `stop` i `rm` znajdują tylko aplikację. Utwórz wspólną sieć
jednorazowo poleceniem `docker network create ansibleforms` (lub `podman network create ansibleforms`). Tak jak przy
[instalacji](../installation/docker.html#prepare-the-folders), umieść połączenie z bazą danych, `ENCRYPTION_SECRET`, `RTE_TOKEN`
o długości co najmniej 16 znaków i `CONFIG_SEED_PATH` w pliku środowiska aplikacji oraz utwórz `rte.env` i config seed. Używaj własnych
folderów tam, gdzie Twoja instalacja 6.5 montowała inne. Seed dodaje RTE w **Połączenia → Runnery** jako domyślny runner `rte`;
zobacz [Aktualizacja do v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Sprawdź aktualizację

Śledź dziennik AnsibleForms podczas uruchamiania. Pierwsze uruchomienie nowego wydania aktualizuje schemat bazy danych:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

RTE zapisuje własny dziennik, który pokazuje `docker logs rte`. W AnsibleForms **Pomoc → O programie** pokazuje działającą wersję, a **Ustawienia → Stan** pokazuje kondycję
bazy danych, schematu i innych systemów, od których zależy AnsibleForms.

---

## Wycofanie aktualizacji

Aby wrócić do wydania, którego używałeś wcześniej, czyli wersji, którą **Pomoc → O programie** pokazywało przed aktualizacją, uruchom ponownie krok 2 z
jej dokładnym tagiem zamiast `7`, zarówno dla obrazu AnsibleForms, jak i RTE. Jeśli to wydanie nie uruchamia się na zaktualizowanej
bazie danych, przywróć kopię zapasową wykonaną w **Ustawienia → Kopie zapasowe**.

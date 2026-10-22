---
layout: default
title: Docker Compose
parent: Aktualizacja
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Aktualizacja instalacji wykonanej projektem docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Projekt docker-compose uruchamia trzy kontenery: MySQL (`mysqldb`), AnsibleForms (`app`) i RTE, które uruchamia
playbooki (`rte`). AnsibleForms i RTE używają tagu obrazu `7`, który zawsze wskazuje najnowsze wydanie 7.x.
Aktualizacja ponownie pobiera obrazy i tworzy od nowa kontenery, których obraz się zmienił. Wszystko, co musi przetrwać, jest przechowywane
w folderze `data` i zostaje zachowane.

---

## Przed aktualizacją

Przygotuj aktualizację tak, aby można było wrócić, jeśli coś pójdzie nie tak:

* **Wykonaj kopię zapasową** w **Ustawienia → Kopie zapasowe**. Nowe wydanie aktualizuje schemat bazy danych przy pierwszym uruchomieniu.
* **Przeczytaj [dziennik zmian](../changelog)** dla wydań między Twoją wersją a nową.
* **Przechodzisz na nową wersję główną?** Najpierw postępuj zgodnie z [Aktualizacja do v7](../upgrade-7.html).
* **Przechodzisz z 6.5?** Projekt 6.x, na gałęzi `v6`, nie ma kontenera `rte`. Zaktualizuj swoją kopię projektu do
  gałęzi `main`, zachowując ustawienia `.env` i folder `data`, tak aby `docker-compose.yml` miał usługę `rte`.
  Ten plik compose ustawia `CONFIG_SEED_PATH`, a folder `data` z 6.x nie ma `seed.yaml`: skopiuj `data/seed.yaml` z
  repozytorium i dodaj `RTE_TOKEN` (co najmniej 16 znaków) do swojego `.env`, tak jak ma to `.env` repozytorium. Bez nich
  aplikacja nie uruchomi się. Obrazy 7 działają jako uid 1000 zamiast roota: jednorazowo przekaż temu użytkownikowi folder `data`, zostawiając pliki
  MySQL dla MySQL, poleceniem `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  Folder `data/ssh` jest teraz montowany w `/home/node/.ssh` zamiast w `/root/.ssh`.
* **Przechodzisz z 7.2?** Zaktualizuj razem `docker-compose.yml` i `data/seed.yaml`: najpierw zobacz [Z 7.2 do 7.3](#from-72-to-73).

---

## Z 7.2 do 7.3

Do wersji 7.2.0 usługa `rte` dostawała ustawienia bazy danych, a jej runner, zadeklarowany w `data/seed.yaml`, działał w trybie bazy danych,
przestarzałym w 7.3.0 i usuniętym w 8.0.0. Od wersji 7.3.0 aplikacja łączy się z RTE pod `http://rte:8000` i utrzymuje otwarty jeden WebSocket
(`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)), a RTE nie przechowuje ustawień bazy danych. Weź oba pliki z gałęzi
`main` repozytorium, zachowując swój `.env`:

| Plik | Co się zmienia |
|---|---|
| `docker-compose.yml` | Usługa `rte` nie odczytuje już `.env`: dostaje `RTE_MODE=inbound`, `RTE_TOKEN` i `RTE_FILES=local`, a nie dostaje `DB_*` |
| `data/seed.yaml` | Poświadczenie RTE `rte`, z `url: http://rte:8000` i `password: ${RTE_TOKEN}`, oraz runner `rte` z `rte_mode: inbound` i `credential: rte` |

Zmień oba. Przy samym nowym pliku compose seed pozostawia runner `rte` w trybie bazy danych: aplikacja wywołuje RTE jak RTE z 7.2,
na co nowe RTE nie odpowiada, i żaden playbook się nie uruchamia. Seed zmieniony samodzielnie wymaga tego samego poświadczenia i `rte_mode`.

Runner utworzony przez seed pozostaje zarządzany, tylko do odczytu w **Połączenia → Runnery**, nawet po usunięciu `CONFIG_SEED_PATH`: tylko
zastosowany seed zwalnia runner, którego już nie deklaruje. Dlatego zachowaj seed i ustaw w nim `rte_mode`, zamiast usuwać
`CONFIG_SEED_PATH`, aby zmienić runner ręcznie.

[Instalator](../installation/installer.html#upgrade) robi to sam: jego aktualizacja zastępuje `docker-compose.yml`, a także `data/seed.yaml`,
gdy jest to niezmieniony plik dostarczony z repozytorium. Plik zmieniony ręcznie zostaje zachowany, a nowy jest zapisywany obok niego.

---

## 1. Pobierz nowe obrazy

Pobierz najnowsze obrazy dla tagów z `docker-compose.yml`:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Utwórz ponownie kontenery

Uruchom projekt ponownie; kontenery, których obraz się zmienił, zostaną utworzone od nowa:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Sprawdź aktualizację

Śledź dziennik AnsibleForms podczas uruchamiania. Pierwsze uruchomienie nowego wydania aktualizuje schemat bazy danych, a RTE
uruchamia się, gdy AnsibleForms jest w dobrej kondycji:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

W AnsibleForms **Pomoc → O programie** pokazuje działającą wersję, a **Ustawienia → Stan** pokazuje kondycję
bazy danych, schematu i innych systemów, od których zależy AnsibleForms.

---

## Wycofanie aktualizacji

Aby wrócić do wydania, którego używałeś wcześniej, czyli wersji, którą **Pomoc → O programie** pokazywało przed aktualizacją, przypnij jej dokładny tag w
`docker-compose.yml`, zarówno dla obrazu AnsibleForms, jak i RTE, zamiast `7`, i uruchom ponownie krok 2. Jeśli to wydanie
nie uruchamia się na zaktualizowanej bazie danych, przywróć kopię zapasową wykonaną w **Ustawienia → Kopie zapasowe**. Ustaw z powrotem tagi na
`7`, aby znów otrzymywać aktualizacje.

**WIDEO**: [Jak zaktualizować AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)

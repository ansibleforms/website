---
layout: default
title: Konfiguracja
parent: Zmienne środowiskowe
nav_order: 5
translated_from: c15df1be69f79cf42094233023cb5766d2f56452
---

# Konfiguracja
{: .no_toc }

Config seed, miejsce przechowywania konfiguracji, git i ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby zdecydować, skąd pochodzi konfiguracja: z config seed, bazy danych, gita lub szablonów ytt.

---

## Przykład

Zastosuj zamontowany config seed, sprawdzaj go co pięć minut i trzymaj `config.yaml` w bazie danych. W `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - "CONFIG_SEED_RELOAD_CRON=*/5 * * * *"
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Nieprawidłowy seed nie pozwala serwerowi się uruchomić. Format pliku opisuje [Config seed](../seed/).

---

## Skąd odczytywany jest config.yaml

Kategorie, role i stałe pochodzą z `config.yaml` na dysku lub z jego kopii w bazie danych, o czym decyduje ta kolejność:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), gdy jest ustawiona, w środowisku lub na
   karcie **Konfiguracja** strony ustawień: `1` odczytuje bazę danych, `0` odczytuje plik.
2. W przeciwnym razie źródło konfiguracji zapisane w bazie danych (`file` lub `database`), które instancje skonfigurowane
   przed wersją 6.3.0 wybrały na stronie ustawień.
3. W przeciwnym razie plik z [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Od wersji 7.8.0 klucz, który zawiera repozytorium, jest nakładany na tę bazę: repozytorium z typem zastosowania **Role**, **Kategorie** lub
**Stałe** podaje ten klucz ze swojego pliku podającego `controller_roles:`, `controller_categories:` lub
`controller_constants:`, a w przeciwnym razie ze swojego `config.yaml` (przestarzałe). Zobacz [Konfiguracja w git](../repositories/config-as-code.html#roles-categories-and-constants).

Jawnie ustawiona `ENABLE_CONFIG_IN_DATABASE` zawsze wygrywa, nawet `0` z zapisanym `database`. Jest odczytywana przy każdym
wczytaniu konfiguracji, więc zmiana działa bez restartu. Strona **Stan** pokazuje używane źródło na karcie **Informacje**.

Kopia w bazie danych to kolumna `config_yaml` tabeli `settings`, przed 7.6.0 nazwana `forms_yaml`: aktualizacja zmienia jej nazwę
i zachowuje zawartość. `GET /api/v2/settings/config` zwraca ją jako `config_yaml`, a także jako `forms_yaml`, przestarzałe.

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="configuration" %}

---
layout: default
title: Zmienne środowiskowe
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# Zmienne środowiskowe
{: .no_toc }

Konfiguruj AnsibleForms za pomocą zmiennych środowiskowych
{: .fs-6 .fw-300 }

---

Dla administratorów, którzy wdrażają AnsibleForms: zmienne środowiskowe odczytywane przez serwer, pogrupowane tematycznie.

AnsibleForms dostraja się zmiennymi środowiskowymi, niezależnie od tego, czy działa z Docker Compose, na Kubernetes, czy ze źródeł.

---

## Skąd pochodzą wartości

Serwer odczytuje każdą zmienną z pierwszego z tych źródeł, które ją ustawia, więc wartość wyżej na liście zawsze wygrywa:

1. **Środowisko procesu**: `environment:` i `env_file:` w docker-compose (tak przekazywany jest `.env` projektu),
   `env` i `envFrom` na Kubernetes albo powłoka, która uruchamia `node`.
2. **`persistent/.env`**, plik zapisywany przez strony ustawień (`data/.env` w projekcie docker-compose, inna ścieżka przy
   `MANAGED_ENV_PATH`). Jest odczytywany przy każdym uruchomieniu, także w produkcji, i nigdy nie nadpisuje zmiennej, która jest już ustawiona.
3. **`server/.env.<NODE_ENV>`**, np. `.env.development`. Odczytywany tylko wtedy, gdy `NODE_ENV` nie jest `production` (lub z
   `FORCE_DOTENV=1`), w praktyce przy uruchamianiu [ze źródeł](../installation/from-source.html) w trybie deweloperskim.
4. **Wbudowana wartość domyślna**, pokazana w tabelach każdej grupy.

Strony ustawień, w **Ustawienia > Ogólne**, pokazują obowiązującą wartość i zapisują zmiany w `persistent/.env`. Wiele zmiennych
działa od razu po zapisaniu; pozostałe są zapisywane, ale wymagają restartu, a strona wymienia je po zapisie. Zmiennej ustawionej w
środowisku procesu nie można tam zmienić: strona pokazuje ją jako *Ustawione w środowisku, więc nie można tego tutaj zmienić.*
Kilku zmiennych, takich jak `ENCRYPTION_SECRET` i `ACCESS_TOKEN_SECRET`, nigdy nie można zmienić ze strony.

Zmiennych odczytywanych przez RTE, takich jak `AF_ROLE`, `RTE_MODE`, `APP_URL` czy `RTE_MAX_JOBS`, w ogóle nie ma na stronach ustawień:
aplikacja ich nie używa, więc ustaw je w środowisku, w którym działa RTE. Wyjątkiem są zmienne `RTE_*` odczytywane przez samą aplikację,
`RTE_QUEUE_MINUTES` i `RTE_FILES_MAX_MB`, które zostają na stronach. Cztery zmienne RTE, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` i `RTE_DRAIN_SECONDS`, można zamiast tego ustawić dla każdego RTE na jego stronie runnera, gdzie wartość wygrywa ze
zmienną (zobacz [Ustawienia RTE](../runners/runner-page.html#an-rtes-settings)).

Przy [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0` strony tylko pokazują wartości, a zapis jest odrzucany. Używaj tego,
gdy środowisko jest zadeklarowane w manifeście, jak opisano w [Edycja i audyt](../seed/environment-and-audit.html).

[Config seed](../seed/) nie ustawia żadnych zmiennych środowiskowych. Deklaruje obiekty przechowywane w bazie danych, a
odwołania `${ENV_VAR}` w nim są rozwiązywane ze środowiska działającego serwera.

Kilka zmiennych jest odczytywanych tylko ze środowiska i nie ma ich w tabelach: `MANAGED_ENV_PATH` i `FORCE_DOTENV`, opisane
wyżej, oraz systemowe zmienne proxy `HTTPS_PROXY` i `NO_PROXY` (odczytywane też małymi literami). RTE w trybie wychodzącym łączy się z aplikacją przez
`HTTPS_PROXY`, a RTE w trybie przychodzącym wysyła przez nie swoje wywołanie rejestracji, chyba że host aplikacji jest w `NO_PROXY` (nazwy hostów,
sufiksy `.domain` lub `*` dla każdego hosta).

Zmienne oznaczone <span class="af-badge af-badge-secret">Sekret</span> zawierają hasło, token lub klucz: trzymaj je poza systemem kontroli
wersji, np. w Secret Kubernetes lub w pliku `.env`, który nie jest commitowany.

---

## W tej sekcji

Zmienne są pogrupowane tematycznie, z jedną stroną na grupę:

| Strona | Czego dotyczy |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Inne zmienne

Poniższe zmienne nie są jeszcze przypisane do żadnej grupy:

{{ other }}
{% endif %}

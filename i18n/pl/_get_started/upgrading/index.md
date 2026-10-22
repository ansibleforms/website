---
layout: default
title: Aktualizacja
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Aktualizacja
{: .no_toc }

Przenieś AnsibleForms na nowsze wydanie
{: .fs-6 .fw-300 }

---

Dla administratorów działającej instancji: przejdź na nowsze wydanie, tą samą metodą, którą zostało zainstalowane.

---

## W tej sekcji

Procedura aktualizacji zależy od sposobu instalacji AnsibleForms. Każda metoda jest opisana na osobnej stronie:

| Strona | Co obejmuje |
|---|---|
| [Aktualizacja do v7](../upgrade-7.html) | Co zmienić, będąc jeszcze na 6.5, przed przejściem na 7 |
| [Instalatorem](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, dla instalacji wykonanej instalatorem: kopia zapasowa, informacje o wydaniu i wycofanie |
| [Docker](docker.html) | Pobierz nowy obraz i utwórz ponownie kontener z tymi samymi ustawieniami |
| [Docker Compose](docker-compose.html) | Pobierz nowy obraz i uruchom ponownie projekt docker-compose |
| [Ze źródeł](from-source.html) | Pobierz nowy kod, zbuduj go ponownie i uruchom ponownie aplikację |
| [Kubernetes](kubernetes.html) | Odśwież repozytorium chartów i uruchom `helm upgrade` ze swoimi wartościami |

{: .note }
> **Najpierw kopia zapasowa** Przed aktualizacją wykonaj kopię zapasową (**Ustawienia → Kopie zapasowe**). Schemat bazy danych jest aktualizowany przy pierwszym
> uruchomieniu nowego wydania, więc kopia zapasowa jest Twoim punktem powrotu, jeśli coś pójdzie nie tak. Od wersji 7.3.0 worker również sam
> wykonuje kopię przed aktualizacją ze starszego wydania, nazwaną od wydania, chyba że
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) ma wartość `0`.

Wydanie, które otrzymujesz, zależy od tagu obrazu, którego używasz: `latest` podąża za najnowszą wersją główną, a tag taki jak `7`
pozostaje na tej wersji głównej. Wszystkie tagi są wymienione w [Tagi obrazów](../installation/#image-tags).

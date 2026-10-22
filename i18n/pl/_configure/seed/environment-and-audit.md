---
layout: default
title: Edycja i audyt
parent: Config seed
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Edycja i audyt
{: .no_toc }

Blokowanie stron ustawień i co zapisuje dziennik audytu
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wyłączanie edycji środowiska

`ALLOW_ENV_EDIT=0` czyni strony ustawień tylko do odczytu. Każda zmienna jest nadal pokazywana z
obowiązującą wartością i powodem, dla którego nie można jej zmienić, a endpoint zapisu odpowiada
403.

Używaj tego zawsze, gdy środowisko jest zadeklarowane gdzie indziej. W przeciwnym razie strona ustawień zapisuje
`persistent/.env`, który na efemerycznym wolumenie po cichu ginie przy następnym restarcie, a na
trwałym rozjeżdża się z manifestem, który ma być źródłem prawdy.

{: .note }
> Kopie zapasowe zawierają `persistent/.env` jako `managed.env`, więc odbudowa odzyskuje ustawienia bazy danych
> i ścieżek. **`ENCRYPTION_SECRET` i `ACCESS_TOKEN_SECRET` są z niego usuwane**:
> zrzut obok zawiera każde zapisane poświadczenie jako szyfrogram AES, a zapisanie klucza, który
> go odszyfrowuje, w tym samym folderze sprawiłoby, że skopiowana kopia zapasowa wystarczyłaby do odczytania ich wszystkich. Ustaw
> te dwa na hoście docelowym; mówi o tym komentarz w pliku.
>
> To, co zostaje, może nadal zawierać poświadczenia (`DB_PASSWORD`, `METRICS_TOKEN`, stary `VAULT_TOKEN`), więc plik jest
> zapisywany z uprawnieniami `0600`. Jego przywrócenie to osobny, dobrowolny krok, a nie część zwykłego przywracania,
> bo host bazy danych i ścieżki w nim opisują maszynę, z której pochodzi kopia zapasowa. Okno
> przywracania wymienia plik i oferuje osobny przycisk *Przywróć środowisko*
> (`POST /api/v2/backup/:folder/restore-env`), który zachowuje poprzedni plik jako `.env.bak`.

---

## Co jest zapisywane

Każde zastosowanie, które coś zmienia, zapisuje w dzienniku audytu jeden wpis `seed.apply`, wymieniający
utworzone, zaktualizowane, zwolnione i wyczyszczone obiekty. Wartości nigdy nie są zapisywane, bo większość
z nich to sekrety. Zastosowanie bez zmian niczego nie zapisuje, dzięki czemu ślad pozostaje znaczący.
Odpytanie, które znajduje niezmieniony plik, jest zastosowaniem bez zmian, więc w śladzie nie przybywa wiersz co minutę.

Zastosowanie zażądane przez endpoint jest celowo zapisywane dwukrotnie, a oba wiersze
zapisują co innego: `config-seed.apply.create` to **kto** o nie poprosił, `seed.apply` to
**co** zmieniło.

Strona Stan raportuje seed dwukrotnie: **test**, czy plik jest nadal czytelny i się parsuje
oraz czy ostatnie przeładowanie się udało, i wiersz **informacji** mówiący, ile rekordów
obecnie przejmuje. Test to jedyne miejsce, które informuje, że plik na dysku i obowiązująca konfiguracja
się rozjechały, bo nieudane przeładowanie zostawia instancję działającą.

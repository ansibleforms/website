---
layout: default
title: Rozwiązywanie problemów
nav_order: 4
translated_from: b7b3f3dfe9b603afe24b167dcc2fc117601638d5
---

# Rozwiązywanie problemów
{: .no_toc }

Komunikaty błędów i objawy, dlaczego się pojawiają i jak je naprawić
{: .fs-6 .fw-300 }

---

Każdy z poniższych problemów jest zatytułowany komunikatem lub objawem, który widzisz, a po nim następuje przyczyna i rozwiązanie. Komunikaty są cytowane
dokładnie tak, jak zapisuje je AnsibleForms; `<name>` oznacza wartość, która różni się w zależności od przypadku. Większość z nich trafia do dziennika
serwera, który możesz przeczytać w [Dzienniku serwera](gui/administration.html#server-log) lub przez `docker logs`.

**Baza danych i uruchamianie**

* [Mysql not ready yet](#mysql-not-ready-yet)
* [Schema is not ready, skipping group and user initialization](#schema-is-not-ready-skipping-group-and-user-initialization)
* [Schema creation is disabled](#schema-creation-is-disabled)
* [Config seed failed, refusing to start](#config-seed-failed-refusing-to-start)
* [ENCRYPTION_SECRET is not set](#encryption_secret-is-not-set)

**Konfiguracja i formularze**

* [Could not load the forms](#could-not-load-the-forms)
* [Konfiguracja bazowa ma sekcję forms](#the-base-config-has-a-forms-section)
* [Brak formularza na pulpicie](#a-form-is-missing-from-the-dashboard)
* [Could not save the forms](#could-not-save-the-forms)
* [The editor is read-only](#the-editor-is-read-only)
* [Abuse attempt of eval function](#abuse-attempt-of-eval-function)
* [Destination is not in REST_ALLOWED_HOSTS](#destination-is-not-in-rest_allowed_hosts)

**Logowanie**

* [Authentication failed: Invalid credentials](#authentication-failed-invalid-credentials)
* [LDAP check failed](#ldap-check-failed)
* [Uwierzytelnianie Azure AD lub OIDC nie powiodło się](#azure-ad-or-oidc-authentication-failed)
* [Not authenticated, login is not enabled for this user](#not-authenticated-login-is-not-enabled-for-this-user)
* [Wylogowanie po restarcie lub po jednym dniu](#logged-out-after-a-restart-or-after-a-day)
* [Puste formularze i zadania po jednokrotnym logowaniu (HTTP 431)](#empty-forms-and-jobs-after-a-single-sign-on-http-431)

**Zadania**

* [Playbook failed with status](#playbook-failed-with-status)
* [Playbook was aborted by the main process](#playbook-was-aborted-by-the-main-process)
* [Failed to launch awx template](#failed-to-launch-awx-template)
* [Zadanie ma stan abandoned](#a-job-shows-the-status-abandoned)
* [RTE się nie łączy](#an-rte-does-not-connect)
* [The form data is not valid](#the-form-data-is-not-valid)

**Repozytoria git i kopie zapasowe**

* [Klonowanie lub pull repozytorium nie powiodło się](#a-repository-clone-or-pull-failed)
* [Repozytorium formularzy nie jest jeszcze sklonowane](#the-forms-repository-is-not-cloned-yet)
* [Kopia zapasowa nie powiodła się](#a-backup-failed)

[FAQ](faq.html) szczegółowo opisuje dwa powiązane problemy:
[utracone hasło administratora](faq.html#recovering-a-lost-admin-password) oraz
[ograniczanie celów funkcji pomocniczych REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Mysql not ready yet

AnsibleForms się nie uruchamia, a dziennik co 5 sekund powtarza te wiersze:

```
Waiting for mysql to start
[ansibleforms] Query error : Error: <reason>
Mysql not ready yet
```

**Dlaczego tak się dzieje**

Przy uruchamianiu AnsibleForms czeka, aż baza danych odpowie na zapytanie, i czeka tak długo, jak długo nie odpowiada.
`<reason>` to komunikat samego sterownika bazy danych: odrzucone połączenie lub przekroczenie czasu wskazuje na host lub port,
a komunikat o odmowie dostępu na nazwę użytkownika lub hasło.

**Jak to naprawić**

Sprawdź [`DB_HOST`](customization/server.html#env_DB_HOST), [`DB_PORT`](customization/server.html#env_DB_PORT),
[`DB_USER`](customization/server.html#env_DB_USER) i [`DB_PASSWORD`](customization/server.html#env_DB_PASSWORD).
Wewnątrz kontenera `localhost` to sam kontener, a nie host, na którym działa MySQL. Upewnij się, że MySQL nasłuchuje
na adresie sieciowym i że użytkownik może łączyć się z hosta AnsibleForms. AnsibleForms samo kontynuuje, gdy tylko
baza danych odpowie; restart nie jest potrzebny.

---

## Schema is not ready, skipping group and user initialization

Przeglądarka otwiera stronę bazy danych zamiast strony logowania, a dziennik pokazuje:

```
Schema is not ready, skipping group and user initialization
Please create the schema via the /schema endpoint
```

**Dlaczego tak się dzieje**

Schematu `AnsibleForms` brakuje lub jest niekompletny. *Pusta* baza danych jest przygotowywana automatycznie przy uruchamianiu, chyba że
[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) ma wartość `0`. Jeśli to się nie uda, na przykład dlatego, że
użytkownik bazy danych nie może tworzyć schematu, dziennik zawiera `Failed to create the schema automatically : <reason>`. Schemat,
który istnieje, ale brakuje mu tabel (`Table '<name>' is not present`), nigdy nie jest odtwarzany automatycznie, ponieważ tworzenie
schematu najpierw usuwa wszystkie tabele. Strona bazy danych pokazuje wtedy *It appears that you have an unuseable schema*.

**Jak to naprawić**

Przy świeżej instalacji nadaj użytkownikowi bazy danych prawo do tworzenia schematu `AnsibleForms` i uruchom ponownie albo naciśnij
**Create** na stronie bazy danych. Przy częściowo istniejącym schemacie przywróć kopię zapasową lub usuń niekompletny schemat `AnsibleForms`,
aby AnsibleForms mogło utworzyć go ponownie. Dziennik wymienia, które tabele i poprawki się nie powiodły.

---

## Schema creation is disabled

Tworzenie schematu, ze strony bazy danych lub przez `POST /api/v2/schema`, kończy się błędem:

```
Schema creation is disabled
```

**Dlaczego tak się dzieje**

[`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) ma wartość `0`, co wyłącza zarówno automatyczne
tworzenie przy uruchamianiu, jak i endpoint. Na bazie danych, która ma już użytkowników, endpoint odrzuca też wywołujących, którzy nie są
zalogowani jako administrator, komunikatem `Schema creation requires an authenticated administrator`.

**Jak to naprawić**

Utwórz schemat raz z `ALLOW_SCHEMA_CREATION=1` (to wartość domyślna) lub przywróć go z kopii zapasowej, a potem ustaw
zmienną z powrotem na `0`. Na przygotowanej bazie danych zaloguj się jako administrator, zanim utworzysz schemat ponownie, i pamiętaj,
że usuwa on i tworzy od nowa wszystkie tabele.

---

## Config seed failed, refusing to start

Kontener kończy działanie zaraz po uruchomieniu, a jego wynik kończy się wierszem:

```
Config seed failed, refusing to start : <reason>
```

**Dlaczego tak się dzieje**

Pliku w [`CONFIG_SEED_PATH`](customization/configuration.html#env_CONFIG_SEED_PATH) nie dało się zastosować: na przykład nie jest prawidłowym
YAML lub narusza schemat seeda; `<reason>` mówi, co poszło nie tak. AnsibleForms odmawia uruchomienia, zamiast działać
z połową zadeklarowanych obiektów. Przyczyna jest też zapisywana na standardowe wyjście błędów, więc pokazują ją `docker logs` i `kubectl logs`.

**Jak to naprawić**

Popraw to, co wskazuje `<reason>`, i uruchom ponownie. [Ponowne wczytywanie i uruchamianie](seed/reloading.html) opisuje, jak seed jest
stosowany, a [Przykład](seed/example.html) pokazuje prawidłowy plik.

---

## ENCRYPTION_SECRET is not set

Każde uruchomienie zapisuje w dzienniku to ostrzeżenie:

```
[SECURITY] ENCRYPTION_SECRET is not set. Stored passwords are encrypted with the default key, which is public in the source code. Set ENCRYPTION_SECRET: the stored ones are re-encrypted with it on the next start.
```

Albo worker odmawia uruchomienia z komunikatem:

```
[SECURITY] The stored secrets were encrypted with a key that is not ENCRYPTION_SECRET: set ENCRYPTION_SECRET_PREVIOUS to the key they were encrypted with, and they are re-encrypted with ENCRYPTION_SECRET on the next start. Nothing was changed.
```

**Dlaczego tak się dzieje**

Zapisane sekrety są szyfrowane kluczem [`ENCRYPTION_SECRET`](customization/security.html#env_ENCRYPTION_SECRET): od wersji 7.3.0 znajdują się w
poświadczeniach (między innymi hasła i tokeny katalogów LDAP, dostawców SSO, runnerów i magazynów sekretów), obok adresów webhooków Slack
i Teams. Bez niego używany jest klucz, który jest publiczny w kodzie źródłowym. Od wersji 7.3.0 uruchomienie z nowym
`ENCRYPTION_SECRET` ponownie szyfruje nim każdy zapisany sekret, w jednej transakcji: z klucza domyślnego, gdy jest ustawiany po raz pierwszy,
lub z [`ENCRYPTION_SECRET_PREVIOUS`](customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS), gdy się zmienia. Gdy
zapisane sekrety nie zostały zaszyfrowane żadnym z nich, nic nie jest zmieniane, a AnsibleForms się nie uruchamia.

**Jak to naprawić**

Ustaw `ENCRYPTION_SECRET` i przechowuj go razem z innymi sekretami: kopie zapasowe nigdy go nie zawierają. Następne uruchomienie zapisze w dzienniku
`[SECURITY] Re-encrypted <n> stored secrets from the default key with ENCRYPTION_SECRET`. Aby zmienić go później, ustaw nową wartość w
`ENCRYPTION_SECRET`, a starą w `ENCRYPTION_SECRET_PREVIOUS` na czas jednego uruchomienia, a potem usuń `ENCRYPTION_SECRET_PREVIOUS`. Gdy
worker odmawia uruchomienia, ustaw `ENCRYPTION_SECRET_PREVIOUS` na klucz, którym zaszyfrowano sekrety, lub przywróć starą wartość.

---

## Could not load the forms

Pulpit nie pokazuje żadnych formularzy i zgłasza:

```
Could not load the forms.

Failed to get forms list

<reason>
```

**Dlaczego tak się dzieje**

Konfiguracji bazowej (`config.yaml`) nie dało się odczytać lub jest nieprawidłowa. `<reason>` mówi, co jest nie tak:

| Przyczyna | Źródło problemu |
|--------|-------|
| `Error parsing the base config, it's not valid yaml. : <error>` | Błąd składni YAML |
| `The base config has no content. It must be a yaml mapping holding at least 'categories' and 'roles'.` | Pusty plik lub plik zawierający tylko komentarze |
| `Duplicate role name(s) : <names>. Each role must appear once.` | Ta sama rola jest zdefiniowana dwa razy |
| `There is no config.yaml nor could one be created from template.` | Brakuje `config.yaml`, a jego folder nie jest zapisywalny |
| `There is no forms directory nor could there be one created from template.` | Brakuje folderu formularzy i nie da się go utworzyć |
| Każdy inny wiersz | Konfiguracja narusza schemat, na przykład rola bez `groups` |

**Jak to naprawić**

Popraw plik wskazany przez [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) lub `config.yaml` w
repozytorium używanym do konfiguracji. Gdy brakuje plików, skieruj [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) i
[`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) na zapisywalne, trwałe miejsce. Strukturę opisuje
[config.yaml](config/).

---

## Konfiguracja bazowa ma sekcję forms

Po aktualizacji z 6.x pulpit jest pusty, a panel ostrzeżeń pokazuje:

```
The base config has a 'forms' section. Since 7.0.0 forms are no longer read from the base config - move each form to its own file in the forms folder (FORMS_FOLDER_PATH).
```

**Dlaczego tak się dzieje**

Od wersji 7.0.0 każdy formularz znajduje się we własnym pliku w folderze formularzy. Formularze, które nadal są wymienione w `config.yaml`, są
ignorowane.

**Jak to naprawić**

Przenieś każdy formularz do osobnego pliku w [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH). Zobacz
[Aktualizacja do 7.x](upgrade-7.html).

---

## Brak formularza na pulpicie

Plik formularza istnieje, ale użytkownik nie widzi formularza na pulpicie.

**Dlaczego tak się dzieje**

Użytkownik widzi formularz tylko wtedy, gdy jedna z `roles` formularza jest jedną z ról użytkownika; administratorzy widzą wszystkie formularze. Każdy użytkownik ma
rolę `default`, więc formularz z `roles: [default]` jest widoczny dla wszystkich. Role użytkownika pochodzą z grup i użytkowników
wymienionych pod `roles` w `config.yaml`. Formularz bez `categories` pojawia się w kategorii **Default**, więc brakuje go w
pozostałych kategoriach, choć nadal jest wymieniony w **Wszystkie formularze**. Wreszcie formularz, który nie przechodzi walidacji, jest pomijany.
Pulpit pokazuje wtedy przycisk **Ta konfiguracja zawiera ostrzeżenia lub błędy**, który otwiera komunikaty takie jak:

```
Failed to validate form '<name>'.
skipping duplicate form <name>
Form found with no name.
```

**Jak to naprawić**

Otwórz panel ostrzeżeń i popraw to, co wymienia. Sprawdź role użytkownika w
[Uprawnieniach](profile/permissions.html) w profilu oraz `roles` i `categories` formularza. Zobacz
[Role](config/roles.html) i [Kategorie](config/categories.html). Gdy dwa pliki definiują tę samą nazwę formularza,
wygrywa ten wczytany jako pierwszy.

---

## Could not save the forms

Zapis w projektancie kończy się błędem:

```
Could not save the forms.

Failed to save forms

<messages>
```

**Dlaczego tak się dzieje**

Projektant waliduje każdy formularz względem schematu, zanim cokolwiek zapisze. Każdy wiersz `<messages>` wskazuje
formularz i pole, które naruszają regułę. Opcje usunięte w 7.0.0 mają własny komunikat, na przykład
`Field '<name>' : the table field was removed in 7.0.0, see https://ansibleforms.com/upgrade-7 - use a list field with a subform`.

**Jak to naprawić**

Popraw pola wskazane w komunikatach. W przypadku opcji usuniętych w 7.0.0 postępuj zgodnie z [Aktualizacja do 7.x](upgrade-7.html).
Aby walidować pliki formularzy, zanim trafią do AnsibleForms, zobacz
[Walidacja plików formularzy w VS Code](faq.html#vs-code-validation-for-form-files) w FAQ.

---

## The editor is read-only

Projektant pokazuje **Zablokowane przez** z nazwą innego użytkownika, a zapis kończy się błędem:

```
The editor is read-only
```

**Dlaczego tak się dzieje**

Formularze może edytować tylko jedna osoba naraz. Blokada jest zakładana, gdy ktoś uruchamia projektanta, i trwa, dopóki
go nie zatrzyma, nawet jeśli zamknął przeglądarkę bez zatrzymania. API odrzuca zapis od kogokolwiek innego komunikatem
`Designer is locked by <username>`.

**Jak to naprawić**

Poproś `<username>` o zatrzymanie projektanta. Jeśli to niemożliwe, użyj **Zwolnij** w projektancie. Osoba, która trzyma
blokadę, traci niezapisane zmiany.

---

## Abuse attempt of eval function

Pole z wyrażeniem pokazuje błąd, a dziennik zawiera wiersz taki jak:

```
Error in expression : Error: Abuse attempt of eval function, using custom functions, try runLocal
```

**Dlaczego tak się dzieje**

Wyrażenia po stronie serwera są sprawdzane przed uruchomieniem. Mogą wywoływać tylko funkcje `fn.` i `fnc.`; wiele instrukcji,
wiele wierszy, literały szablonowe, `process.env` i słowa takie jak `require` czy `constructor` są odrzucane. Komunikat
mówi, która reguła została naruszona. Gdy [`EXPRESSION_SANITIZER`](customization/security.html#env_EXPRESSION_SANITIZER) ma wartość
`off`, każde wyrażenie serwerowe kończy się błędem
`Server expressions are disabled (EXPRESSION_SANITIZER=off), use runLocal`.

**Jak to naprawić**

Przepisz wyrażenie jako pojedyncze wywołanie `fn.` lub zwykłą operację albo uruchom je w przeglądarce z `runLocal: true`. Zobacz
[Wyrażenia](expressions/) i [Wyrażenia lokalne](expressions/local.html).

---

## Destination is not in REST_ALLOWED_HOSTS

Pole, które wywołuje API REST, pozostaje puste, a dziennik pokazuje:

```
Error in expression : Error: [hostfilter] destination <host> (<addresses>) is not in REST_ALLOWED_HOSTS
```

**Dlaczego tak się dzieje**

[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) jest ustawione, a host z adresu URL nie jest w nim wymieniony.
Host pasujący do [`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS) jest odrzucany komunikatem
`blocked by REST_DENIED_HOSTS entry "<entry>"`, a host, którego nazwy nie da się rozwiązać, komunikatem `cannot resolve <host>`.

**Jak to naprawić**

Dodaj nazwę hosta lub CIDR obejmujący jego adresy do `REST_ALLOWED_HOSTS` albo usuń wpis, który go blokuje, z
`REST_DENIED_HOSTS`. Zobacz [Ograniczanie celów funkcji pomocniczych REST](faq.html#restricting-rest-helper-destinations-allowdeny-lists).

---

## Authentication failed: Invalid credentials

Strona logowania odrzuca nazwę użytkownika i hasło komunikatem:

```
Authentication failed: Invalid credentials
```

**Dlaczego tak się dzieje**

Strona logowania daje tę samą odpowiedź przy każdym niepowodzeniu, aby nie zdradzać, czy użytkownik istnieje. AnsibleForms
najpierw sprawdza użytkowników lokalnych, a potem LDAP: przy kilku katalogach nazwa użytkownika jest wyszukiwana w ich kolejności z **Dostęp > LDAP**,
chyba że wskazuje katalog (`corp\jane`) lub jedną z jego domen logowania (`jane@corp.example`). Rzeczywista przyczyna trafia do dziennika. Niepowodzenia LDAP
są zapisywane jako `Error connecting to ldap: <reason>`, z przyczynami takimi jak `Wrong binding credentials` lub
`Unable to verify the certificate`; kody Active Directory są tłumaczone na `Wrong password`, `User not found`,
`Account disabled`, `Account locked` lub `Password expired`.

**Jak to naprawić**

Przeczytaj przyczynę w dzienniku. Aby uzyskać pełną przyczynę każdego nieudanego logowania, ustaw
[`LOG_LEVEL`](customization/logging.html#env_LOG_LEVEL) na `debug`, co zapisuje `Ldap authentication failed: <reason>`.
Jeśli lokalne hasło administratora zostało utracone, zobacz [Odzyskiwanie utraconego hasła administratora](faq.html#recovering-a-lost-admin-password).

---

## LDAP check failed

Test katalogu LDAP w **Dostęp > LDAP** kończy się jednym z tych błędów:

```
LDAP check failed: Error: Wrong binding credentials
LDAP check failed: Error: Bad server or port (connection failed)
LDAP check failed: Error: Unable to verify the certificate
LDAP check failed: Error: Certificate is not valid
```

**Dlaczego tak się dzieje**

Użytkownik powiązania (bind) lub jego hasło są błędne, serwer lub port są nieosiągalne albo, przy TLS, certyfikatu serwera nie da się
zweryfikować względem pakietu CA. Od wersji 7.3.0 te dane są w poświadczeniu ldap katalogu, w **Połączenia > Poświadczenia**. Testowy użytkownik, który nie istnieje,
nadal liczy się jako udany test, ponieważ połączenie i powiązanie zadziałały.

**Jak to naprawić**

Otwórz poświadczenie wskazane przez katalog (katalog domyślny to `main`) w **Połączenia > Poświadczenia** i popraw DN
powiązania i jego hasło, serwery oraz port (zwykle 389 lub 636 dla LDAPS). W przypadku problemów z TLS wklej pakiet CA, który podpisał
certyfikat serwera LDAP; pomijanie sprawdzania certyfikatu nie jest przeznaczone do produkcji. Zobacz [LDAP](authentication/ldap.html).

---

## Uwierzytelnianie Azure AD lub OIDC nie powiodło się

Logowanie jednokrotne wraca na stronę logowania z komunikatem:

```
Azure AD authentication failed: <reason>
OIDC authentication failed: <reason>
```

**Dlaczego tak się dzieje**

Dostawca tożsamości odesłał użytkownika, ale AnsibleForms nie mogło dokończyć logowania. Typowe przyczyny to
`azuread login is not enabled` lub `oidc login is not enabled` (dostawca jest wyłączony) oraz `jwt expired`, ponieważ
przekazanie od dostawcy jest ważne tylko przez 5 minut. Błąd podczas callbacku od dostawcy jest też pokazywany
na stronie logowania i zapisywany w dzienniku.

**Jak to naprawić**

Włącz dostawcę w **Dostęp > SSO** i zarejestruj adres callbacku u dostawcy tożsamości dokładnie tak, jak
używa go AnsibleForms: `https://<your host>/api/v2/auth/entraid/callback` dla Entra ID (od wersji 7.3.0; `azureadoauth2` nadal działa) lub
`https://<your host>/api/v2/auth/oidc/callback` dla OIDC. Adres callbacku z `/api/v1/`, sprzed wersji 7 lub sprzed
6.1.5, trzeba zaktualizować: strona logowania przeładowuje się wtedy bez zalogowania i bez błędu. Po wygaśnięciu przekazania
spróbuj zalogować się ponownie.

---

## Not authenticated, login is not enabled for this user

Użytkownik z prawidłowym hasłem nie może się zalogować i dostaje:

```
Not authenticated, login is not enabled for this user.
```

**Dlaczego tak się dzieje**

Jedna z ról użytkownika ustawia opcję roli `allowLogin` na `false`. Dziennik zawiera
`Login is disabled for user '<username>' in the configuration (allowLogin option is set to false), please check your settings`.

**Jak to naprawić**

Usuń `allowLogin: false` z roli lub usuń użytkownika z tej roli. Zobacz [Role](config/roles.html).

---

## Wylogowanie po restarcie lub po jednym dniu

Każdy użytkownik jest odsyłany na stronę logowania po restarcie AnsibleForms lub po dniu używania.

**Dlaczego tak się dzieje**

Gdy [`ACCESS_TOKEN_SECRET`](customization/security.html#env_ACCESS_TOKEN_SECRET) nie jest ustawiony, każde uruchomienie generuje
nowy klucz podpisujący i zapisuje w dzienniku
`[SECURITY] JWT signing secret was auto-generated. All tokens will be invalidated on restart. Set the ACCESS_TOKEN_SECRET environment variable for persistent token signing.`
Tokeny sprzed
restartu nie są wtedy już akceptowane. Niezależnie od tego sesja kończy się, gdy wygaśnie jej token odświeżania
(`Refresh token is expired`), po
[`ACCESS_TOKEN_REFRESH_EXPIRATION`](customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION), domyślnie 24 godzinach.

**Jak to naprawić**

Ustaw `ACCESS_TOKEN_SECRET` na stałą, tajną wartość. Zwiększ `ACCESS_TOKEN_REFRESH_EXPIRATION`, jeśli dzień to za mało. Do
długoterminowego dostępu do API użyj [tokenu API](profile/api-token.html).

---

## Puste formularze i zadania po jednokrotnym logowaniu (HTTP 431)

Użytkownik loguje się przez Entra ID lub OIDC bez błędu, ale strony formularzy i zadań pozostają puste. Karta sieci
przeglądarki pokazuje wywołania API z odpowiedzią:

```
431 Request Header Fields Too Large
```

Dziennik serwera nie pokazuje niczego dla tych wywołań, a ten sam użytkownik może bez problemu pracować z kontem LDAP lub lokalnym.

**Dlaczego tak się dzieje**

Przed wersją 7.1.0 token logowania zawierał wszystkie grupy użytkownika, a grupy Entra ID były w nim dwukrotnie, według identyfikatora obiektu
i według nazwy. Przeglądarka wysyła ten token w nagłówku `Authorization` każdego żądania, więc użytkownik w około stu
lub więcej grupach ma nagłówek znacznie większy niż 16 KB. Node.js odrzuca nagłówki żądania większe niż 16 KB kodem 431,
zanim żądanie dotrze do AnsibleForms, dlatego nic nie jest zapisywane w dzienniku. Reverse proxy przed aplikacją może odrzucić
żądanie jeszcze wcześniej: Nginx domyślnie pozwala na 8 KB na pole nagłówka
(`large_client_header_buffers 4 8k`) i odpowiada wtedy kodem 400.

**Jak to naprawić**

Zaktualizuj do wersji 7.1.0 lub nowszej: token logowania nie zawiera już grup, więc jego rozmiar nie zależy już od liczby
grup użytkownika, a interfejs informuje o odrzuceniu żądania kodem 431, zamiast pokazywać puste strony.
Dopóki nie możesz zaktualizować, wybierz jedno z dwóch:

* ustaw **Filtr grup** u dostawcy w **Dostęp > SSO**, wyrażenie regularne, które zachowuje tylko grupy używane przez Twoje
  role, zobacz [Entra ID](authentication/entra-id.html) lub [OIDC](authentication/oidc.html); użytkownik loguje się ponownie,
  aby dostać mniejszy token
* albo zwiększ limit Node.js zmienną środowiskową `NODE_OPTIONS=--max-http-header-size=65536` i
  uruchom ponownie AnsibleForms

Od wersji 7.1.0 [`MAX_HTTP_HEADER_SIZE`](customization/server.html#env_MAX_HTTP_HEADER_SIZE) ustawia ten sam limit, domyślnie 16384
bajtów, odczytywany przy uruchomieniu, dla innych dużych nagłówków, na przykład dużych ciasteczek ustawianych przez bramę jednokrotnego logowania
przed aplikacją. Zwiększ też limity nagłówków proxy, zobacz [Rozmiar nagłówka żądania](production/reverse-proxy.html#request-header-size).

---

## Playbook failed with status

Zadanie Ansible kończy się błędem, a ostatni wiersz jego wyniku to:

```
[ERROR]: Playbook failed with status (<code>)
```

**Dlaczego tak się dzieje**

`ansible-playbook` zakończył działanie z niezerowym kodem. Wiersze powyżej zawierają własny błąd Ansible: nie znaleziono playbooka,
host był nieosiągalny, zadanie się nie powiodło lub inwentarz jest błędny. Playbook jest szukany w repozytorium
z włączoną opcją **Używać do playbooków?** lub w [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH); wiersz dziennika
`Running from directory : <path>` pokazuje użyty folder.

**Jak to naprawić**

Przeczytaj wynik zadania powyżej ostatniego wiersza. Gdy playbook nie zostaje znaleziony, porównaj `playbook` formularza z
folderem w `Running from directory`. Zobacz [Formularze ansible](forms/ansible.html).

---

## Playbook was aborted by the main process

Zadanie Ansible kończy się błędem z komunikatem:

```
Playbook was aborted by the main process.  Likely some buffer or memory error occured.  Also check the maxBuffer option.
```

**Dlaczego tak się dzieje**

Proces `ansible-playbook` na RTE został zakończony sygnałem, a nikt nie przerwał zadania. Od wersji 7.0.0 nie powoduje tego już rozmiar
wyniku: po przekroczeniu [`PROCESS_MAX_BUFFER`](customization/server.html#env_PROCESS_MAX_BUFFER) (domyślnie 50 MB na strumień)
reszta wyniku nie jest zapisywana, zadanie pokazuje
`[WARNING]: the stdout of this job passed PROCESS_MAX_BUFFER (<bytes> bytes) : the rest is not stored, the playbook goes on`,
a playbook działa do końca. Obecnie zwykłą przyczyną jest pamięć: kontener RTE osiągnął limit pamięci, a
jądro zabiło playbook, na przykład przy wielu forkach lub dużych faktach.

**Jak to naprawić**

Sprawdź pamięć kontenera RTE podczas działania playbooka (`docker stats`, `kubectl top pod`) i zwiększ jego limit albo zmniejsz
zużycie pamięci przez playbook (mniej `forks`, bez niepotrzebnego zbierania faktów). Gdy widzisz tylko ostrzeżenie `PROCESS_MAX_BUFFER` i
potrzebujesz całego wyniku, zwiększ `PROCESS_MAX_BUFFER` w środowisku kontenera RTE; odczytuje ją RTE, a nie aplikacja.
---

## Failed to launch awx template

Zadanie AWX kończy się błędem, a jego wynik zaczyna się od:

```
failed to launch awx template <name>
```

**Dlaczego tak się dzieje**

Następny wiersz podaje przyczynę. `Request failed with status code 401` oznacza, że token lub nazwa użytkownika i hasło w
poświadczeniu runnera AWX są odrzucane. `could not find job template <name>` oznacza, że ani szablon joba, ani szablon workflow
nie ma dokładnie takiej nazwy albo użytkownik połączenia go nie widzi. Błąd certyfikatu, taki jak
`unable to verify the first certificate`, oznacza, że certyfikat AWX nie jest zaufany.

**Jak to naprawić**

Użyj **Testuj połączenie** na runnerze (**Połączenia > Runnery**), który odpowiada `Runner connection is OK`, gdy wszystko działa. Od
wersji 7.3.0 token lub użytkownik i hasło, adres i **Pakiet CA** są w poświadczeniu runnera, w
**Połączenia > Poświadczenia**: tam odnów token lub hasło, a w przypadku błędów certyfikatu wklej CA do jego **Pakiet CA**.
Sprawdź nazwę szablonu i uprawnienia. Wpisz adres bez `/api/v2`: AnsibleForms samo dodaje
[`AWX_API_PREFIX`](customization/features.html#env_AWX_API_PREFIX).
Zobacz [Formularze AWX](forms/awx.html).

---

## Zadanie ma stan abandoned

Zadanie, które działało, jest teraz oznaczone jako `abandoned`, a dziennik węzła lub RTE pokazuje jeden z komunikatów:

```
Abandoned <n> jobs this node followed before it restarted
Abandoned <n> jobs this worker followed before it restarted
Abandoned <n> jobs followed by a node that stopped answering
Job <id>: RTE '<name>' came back without it: abandoned
Abandoned <n> jobs
```

RTE w trybie bazy danych, przestarzałym, zapisuje własne:

```
RTE: abandoned <n> job(s) left running by a previous start
RTE: stopping with <n> job(s) still running: they end as abandoned
```

**Dlaczego tak się dzieje**

Zadanie należy do kontenera, który je uruchamia lub śledzi: playbook do swojego RTE, każde inne zadanie (zadanie AWX, kroki formularza
wieloetapowego) do węzła aplikacji, który je uruchomił. Gdy ten kontener się restartuje, kończy swoje niedokończone zadania. Gdy znika, na przykład zastąpiony
pod, worker kończy jego zadania, gdy ten nie odpowiada przez dwie minuty. Jeśli RTE w trybie gniazda wraca bez
zadania, które uruchamiało, na przykład nowy kontener bez swojego spoola, to zadanie kończy się jako abandoned. Zatrzymywane RTE najpierw czeka
[`RTE_DRAIN_SECONDS`](customization/server.html#env_RTE_DRAIN_SECONDS) na swoje playbooki. Co godzinę zadania działające dłużej
niż dzień są również oznaczane jako abandoned.

Od wersji 7.3.0 zadanie w AWX, AAP lub Ascender trwa dalej na swoim runnerze: zaraz po tym, jak restart je porzuci, węzeł znów je śledzi,
jeśli rozpoczęło się w ciągu ostatnich 24 godzin, i kończy się tym, co faktycznie się tam wydarzyło. Dziennik zawiera wtedy `Following <n> abandoned job(s) again on their runner`.

**Jak to naprawić**

Uruchom ponownie zadanie playbooka. Restartuj lub aktualizuj RTE i węzły aplikacji, gdy żadne zadanie nie działa, i dawaj zatrzymywanemu RTE wystarczająco dużo czasu
(zobacz [Skalowanie](rte/run.html)). Przed ponownym uruchomieniem sprawdź, czy playbook naprawdę zakończył się na zarządzanych hostach,
ponieważ mógł wykonać się częściowo.

---

## RTE się nie łączy

**Testuj połączenie** na runnerze RTE (**Połączenia > Runnery**) kończy się błędem:

```
the RTE '<name>' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app
the RTE '<name>' (inbound) is not connected: no app node could dial it at <address>: check its RTE_URL, its token and the network from the app to the RTE
```

**Dlaczego tak się dzieje**

RTE w trybie gniazda komunikuje się z aplikacją przez jeden WebSocket: w trybie wychodzącym łączy się z aplikacją, w przychodzącym aplikacja łączy się z nim (zobacz
[Tryby](rte/modes.html)). Dzienniki aplikacji i RTE mówią, dlaczego gniazdo nie jest otwarte:

| Komunikat | Gdzie | Co oznacza |
|---|---|---|
| `RTE: refused a socket without the right token from <address>` | RTE (przychodzące) | Token poświadczenia RTE runnera nie jest `RTE_TOKEN` tego RTE |
| `Runner '<name>': the RTE at <address> refused the socket (401): check its RTE_TOKEN` | Aplikacja (przychodzące) | To samo, z perspektywy aplikacji |
| `the token of RTE '<name>' is not the one stored for its runner: check its RTE_TOKEN` | Aplikacja oraz odrzucone RTE (`401`) | RTE loguje się innym tokenem niż ten, który aplikacja przechowuje dla jego runnera |
| `RTE '<name>': waiting for an admin to approve it under Connections > Runners (fingerprint <fingerprint>)` | RTE (wychodzące) | Poprosiło o dołączenie i czeka na zatwierdzenie |
| `RTE '<name>': asked to join as inbound runner '<name>': the app dials it once an admin approves it under Connections > Runners (fingerprint <fingerprint>)` | RTE (przychodzące, z `APP_URL`) | To samo, dla przychodzącego RTE |
| `runner '<name>' is managed by the config seed in database mode: set rte_mode: outbound for it in the seed (and its credential), then restart this RTE` | Aplikacja oraz odrzucone RTE (`409`) | Config seed deklaruje runner bez `rte_mode`, czyli w trybie bazy danych, a o jego trybie decyduje seed. Przychodzące RTE dostaje `rte_mode: inbound` i `(and its credential with the address the app dials, RTE_URL)` |
| `RTE: RTE_MODE=inbound with APP_URL registers with the app, which then dials RTE_URL : set RTE_URL (http://this-host:8000) ; refusing to start` | RTE | Przychodzące RTE, które samo się rejestruje, potrzebuje adresu, pod którym łączy się z nim aplikacja |
| `Runner '<name>': dialing <address>: <reason>` | Aplikacja, na poziomie `debug` | Aplikacja nie może otworzyć gniazda, na przykład dlatego, że certyfikat RTE nie jest tym przypiętym dla jego runnera |
| `[DEPRECATED] This RTE runs in database mode (RTE_MODE is not set): it holds the database's credentials and reads and writes it itself. Set RTE_MODE=outbound (it dials the app, APP_URL) or RTE_MODE=inbound (the app dials it, RTE_URL), and drop DB_* from its environment. Database mode is removed in 8.0.0.` | RTE | Działa w trybie bazy danych i w ogóle nie otwiera gniazda |

**Jak to naprawić**

* **Odrzucony token** : daj RTE token poświadczenia RTE jego runnera (**Połączenia > Poświadczenia**) lub odwrotnie
* **Oczekiwanie na zatwierdzenie** : zatwierdź je w **Połączenia > Runnery** po sprawdzeniu, że widoczny tam odcisk jest tym z jego
  dziennika (zobacz [Zatwierdzanie RTE](runners/registration.html#approving-an-rte))
* **Zarządzane przez config seed w trybie bazy danych** : ustaw `rte_mode` dla runnera w seedzie, z poświadczeniem RTE (dla przychodzącego z jego
  adresem), a potem uruchom ponownie RTE
* **Przychodzące bez `RTE_URL`** : ustaw `RTE_URL` na adres, pod którym aplikacja sięga do RTE, albo pomiń `APP_URL` i zadeklaruj
  runner w seedzie lub w **Połączenia > Runnery**
* **Certyfikat, który nie jest przypięty** : przychodzące RTE przez HTTPS wysyła swój certyfikat przy rejestracji, a aplikacja łączy się
  z nim tylko z tym certyfikatem. Po zmianie certyfikatu RTE wysyła go ponownie przy rejestracji; gdy pakiet CA poświadczenia został ustawiony
  ręcznie, aplikacja go zachowuje i zapisuje w dzienniku
  `Runner '<name>': its ca_bundle was set by hand: the certificate its RTE sent (fingerprint <fingerprint>) is not stored. Empty the ca_bundle to have the RTE's certificate pinned again`
* **Ostrzeżenie [DEPRECATED]** : ustaw `RTE_MODE` na RTE, usuń `DB_*` z jego środowiska i ustaw jego runner w tym trybie (zobacz
  [Tryby](rte/modes.html))

---

## The form data is not valid

Przy walidacji przy uruchomieniu ustawionej na `enforce` uruchomienie jest odrzucane kodem `422` i komunikatem:

```
The form data is not valid
```

**Dlaczego tak się dzieje**

Serwer sprawdził wartości pól względem reguł formularza i znalazł brakujące lub nieprawidłowe pola; odpowiedź wymienia
je pod `details`. Uruchomienie bez `rawFormData` również jest odrzucane. Formularz, którego nie da się jeszcze sprawdzić, na przykład kreator,
jest odrzucany komunikatem `Form '<name>' cannot be launched with launch validation 'enforce' yet : <reason>`.

**Jak to naprawić**

Popraw pola wskazane w szczegółach albo reguły formularza, jeśli są zbyt rygorystyczne. Najpierw uruchom w trybie `log`: zapisuje on w dzienniku
`Launch validation would refuse form '<name>' ...`, niczego nie odrzucając. Zobacz
[Co robi enforce](launch-validation/log-and-enforce.html#what-enforce-does) i
[Wdrażanie](launch-validation/rolling-it-out.html).

---

## Klonowanie lub pull repozytorium nie powiodło się

Repozytorium pokazuje stan błędu, a jego wynik zawiera błąd git, albo dziennik pokazuje
`Background clone of '<name>' failed : <reason>`.

**Dlaczego tak się dzieje**

Git nie mógł połączyć się ze zdalnym repozytorium lub się w nim uwierzytelnić. Dla adresów SSH (`git@host:path`) zdalne repozytorium musi akceptować klucz publiczny
AnsibleForms; dla HTTPS nazwa użytkownika i token muszą być ważne. Pull jest też odrzucany, gdy drzewo robocze ma
zmiany, komunikatem
`Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.`

**Jak to naprawić**

Dla SSH skopiuj klucz publiczny z karty **Klucz** w **Połączenia > SSH** i dodaj go jako klucz wdrożeniowy (deploy key) lub do użytkownika z
dostępem do repozytorium. AnsibleForms dodaje zdalny host do znanych hostów przy klonowaniu; dla innych hostów użyj
karty **Znane hosty** na tej samej stronie. Dla
HTTPS odnów token. Zobacz [Repozytoria git](gui/designer-and-git.html#git-repositories) i
[O repozytoriach](faq.html#about-repositories).

---

## Repozytorium formularzy nie jest jeszcze sklonowane

Zapis formularzy w projektancie kończy się błędem:

```
The forms repository '<name>' is not cloned yet ; clone it from the repositories settings first
```

**Dlaczego tak się dzieje**

Repozytorium z włączoną opcją **Używać do formularzy?** nie ma jeszcze drzewa roboczego, ponieważ klonowanie się nie odbyło lub nie powiodło.

**Jak to naprawić**

Sklonuj repozytorium z ustawień repozytoriów. Jeśli klonowanie się nie powiedzie, zobacz
[Klonowanie lub pull repozytorium nie powiodło się](#a-repository-clone-or-pull-failed).

---

## Kopia zapasowa nie powiodła się

Tworzenie kopii zapasowej kończy się błędem i nic nie zostaje dodane do listy kopii zapasowych. Przyczyną jest jeden z komunikatów:

```
'mariadb-dump' was not found on this system. Install the mysql/mariadb client tools, or set MYSQLDUMP_COMMAND to a command that works here.
The database dump is empty, '<file>' was not written
The command timed out
```

**Dlaczego tak się dzieje**

Polecenie zrzutu, [`MYSQLDUMP_COMMAND`](customization/retention.html#env_MYSQLDUMP_COMMAND), nie jest zainstalowane, nie mogło się
połączyć lub utworzyło pusty plik. Duża baza danych może też wymagać więcej czasu niż
[`BACKUP_COMMAND_TIMEOUT_SECONDS`](customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS), domyślnie jedna godzina.
Nieudana kopia zapasowa nie pozostawia folderu; dziennik zawiera `Backup failed, removing the incomplete folder '<folder>' : <reason>`.

**Jak to naprawić**

Zainstaluj narzędzia klienckie MySQL lub MariaDB albo ustaw `MYSQLDUMP_COMMAND` (i `MYSQL_COMMAND` do przywracania) na polecenie,
które działa na tym hoście i z wersją Twojego serwera. Zwiększ `BACKUP_COMMAND_TIMEOUT_SECONDS` dla dużej bazy danych.
Zobacz [Kopie zapasowe](gui/administration.html#backups).

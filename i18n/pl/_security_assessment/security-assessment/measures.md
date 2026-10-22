---
layout: default
title: Zabezpieczenia
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Zabezpieczenia
{: .no_toc }

Jak chronione są logowanie, uprawnienia, sekrety i połączenia
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Gdzie działa

AnsibleForms jest hostowany samodzielnie, na twojej infrastrukturze, z danymi w utrzymywanej przez ciebie bazie danych.

* Nie ma usługi chmurowej AnsibleForms ani serwera licencji, nie ma też telemetrii ani sprawdzania aktualizacji.
* Interfejs jest serwowany przez samą aplikację i nie ładuje niczego z innych witryn.
* Aplikacja łączy się tylko z systemami skonfigurowanymi przez administratora, wymienionymi w [Połączeniach wychodzących](#outbound-connections).

Elementy i to, co każdy z nich przechowuje:

| Element | Co robi | Co przechowuje |
|---|---|---|
| Aplikacja | Interfejs webowy, REST API, harmonogram | Żadnych własnych danych: wszystko jest w bazie danych |
| MySQL lub MariaDB | Baza danych aplikacji | Użytkowników, grupy, poświadczenia (zaszyfrowane), zadania z ich extravars i wynikiem, dziennik audytu |
| Środowisko uruchomieniowe (RTE) | Uruchamia playbooki, we własnym kontenerze | Pliki uruchamianych zadań, a sekrety zadania tylko w czasie jego działania |
| Folder trwały | Konfiguracja, formularze, playbooki i przesłane pliki | Pliki używane przez formularze i playbooki |

Pełny obraz znajdziesz w [Jak to działa](../how-it-works.html), a opis środowiska uruchomieniowego w [RTE](../rte/).

---

## Logowanie

Każda strona i każde wywołanie API, które odczytuje lub zmienia dane, wymaga zalogowanego użytkownika. Nieliczne punkty końcowe dostępne bez logowania obsługują
samo logowanie, wersję, nazwę i logo instancji, dokumentację API oraz konfigurację bazy danych przy pierwszym starcie,
którą wyłącza [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0`:

| Metoda | Jak działa |
|---|---|
| Konta lokalne | Hasła haszowane bcrypt, [minimalna długość](../security/hardening.html#sign-in-limits-and-passwords), a publiczne domyślne hasło administratora trzeba zmienić przy pierwszym logowaniu |
| LDAP / Active Directory | Katalog sprawdza hasło, a jego grupy są mapowane na role. Zobacz [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Single sign-on przez twojego dostawcę tożsamości, który zapewnia też własne uwierzytelnianie wieloskładnikowe. Zobacz [Uwierzytelnianie](../authentication/) |

* Nieudane logowania [blokują konto](../security/hardening.html#sign-in-limits-and-passwords), a logowanie ma limit częstotliwości.
* Logowanie zwraca podpisany token dostępu ważny 30 minut i token odświeżania ważny 24 godziny.
* Tokeny można unieważnić przed wygaśnięciem: wylogowanie, zmiana hasła, zablokowanie użytkownika i odwołanie tokenu API unieważniają je
  na wszystkich węzłach jednocześnie, zobacz [Tokeny](../security/secrets.html#tokens).
* AnsibleForms nie ma własnego uwierzytelniania wieloskładnikowego: tam, gdzie jest wymagane, używaj single sign-on.

---

## Uprawnienia

To, co użytkownik może robić, wynika z ról jego grup i jest sprawdzane przez serwer przy każdym żądaniu:

* Role definiuje się w [config.yaml](../config/roles.html): które formularze widzi użytkownik i jakie ma opcje,
  takie jak projektant, strony ustawień czy zadania innych użytkowników.
* Serwer sprawdza każde uruchomienie względem reguł formularza (jego pól, ich wartości i dostępu użytkownika), także
  uruchomienia przez REST API, zobacz [Weryfikacja uruchomienia](../launch-validation/).
* Rola administratora z założenia uruchamia dowolny playbook. Pozostałe role dostają tylko to, co zostało przyznane: użytkownik z kilkoma rolami otrzymuje
  opcję tylko wtedy, gdy żadna z tych ról jej nie odmawia, więc jedna restrykcyjna rola wystarczy, by ją wstrzymać.

---

## Przechowywane sekrety

Hasła, tokeny i klucze są szyfrowane przed zapisaniem do bazy danych:

* Każdy przechowywany sekret, czyli poświadczenia, hasło powiązania LDAP, tokeny runnerów, sekrety klientów single sign-on, adresy
  webhooków i klucze API, jest szyfrowany algorytmem AES-256 z losowym wektorem inicjalizującym dla każdej wartości, przy użyciu
  ustawionego przez ciebie [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets).
* Żadne wywołanie API ani strona ustawień nie pokazuje przechowywanego sekretu, a kopie zapasowe pomijają sekrety główne.
* Sekrety mogą zostać w twoim vaulcie: [HashiCorp Vault i CyberArk](../secret-stores/) są odczytywane wtedy, gdy zadanie ich potrzebuje.
* Sekrety zadania docierają do środowiska uruchomieniowego zapieczętowane AES-256-GCM, kluczem wyprowadzonym z jego tokenu.
* Extravars, których nazwa wygląda na sekret, są maskowane w widoku zadania, a pola haseł zawsze, zobacz [Dane zadań](../security/hardening.html#job-data).

Reszta bazy danych, czyli zadania, ich extravars i wyniki, jest przechowywana bez zmian: chroń ją szyfrowaniem w spoczynku i kontrolą dostępu
samej bazy danych, zobacz [Baza danych](../security/hardening.html#the-database).

---

## Dziennik audytu

Każda zmiana i każda odrzucona próba są rejestrowane:

* Każde utworzenie, zmiana i usunięcie, przez interfejs lub API, trafia do dziennika audytu z użytkownikiem, jego
  adresem, akcją, obiektem i wynikiem. Rejestrowane są też odmowy i logowania, łącznie z nieudanymi.
* Wartości wyglądające na sekrety są redagowane przed zapisaniem.
* Dziennik jest domyślnie przechowywany 365 dni i można go kopiować do syslog przez UDP, TCP lub TLS.

---

## W przeglądarce

Interfejs jest chroniony przed kodem wstrzykniętym do strony:

* [Content-Security-Policy](../security/hardening.html#the-content-security-policy) dopuszcza tylko własne skrypty i ramki aplikacji.
* Każda odpowiedź zawiera nagłówki ochronne: nosniff, ochronę przed osadzaniem w ramkach i HSTS przez HTTPS.
* HTML formularzy, teksty pomocy i odpowiedzi czatu są oczyszczane, a wynik zadań jest escapowany.

---

## Na serwerze

Kod obsługujący dane od użytkownika unika klasycznych wstrzyknięć:

* Zapytania do bazy danych przekazują wartości jako parametry, nigdy jako tekst wklejony w zapytanie.
* Polecenia, łącznie z git, są uruchamiane z listy argumentów, nigdy przez powłokę, więc znaki powłoki nic nie robią.
* Wyrażenia serwerowe przechodzą przez [sanitizer wyrażeń](../security/hardening.html#expressions-and-outbound-calls), a ich wywołania REST przez filtr hostów.
* [Serwer MCP](../mcp/), [asystent czatu](../chat/) i punkt końcowy metryk są wyłączone, dopóki ich nie włączysz.

---

## Połączenia

Ruch do i z AnsibleForms może być szyfrowany od końca do końca:

* Aplikacja sama serwuje [HTTPS](../security/https.html) lub działa za twoim reverse proxy.
* Środowisko uruchomieniowe komunikuje się z aplikacją przez WebSocket, `wss://` przy adresie HTTPS, a aplikacja
  przypina certyfikat środowiska przychodzącego, zobacz [Tryby RTE](../rte/modes.html).
* LDAP, single sign-on, runnery, git, magazyny sekretów i wywołania REST wyrażeń sprawdzają certyfikat
  serwera, z którym się łączą, chyba że administrator wyłączy to sprawdzanie dla serwera z certyfikatem samopodpisanym.

### Połączenia wychodzące

AnsibleForms łączy się tylko z tym, co skonfiguruje administrator:

| Połączenie | Kiedy |
|---|---|
| LDAP, OpenID Connect, Entra ID (logowanie Microsoft i Graph) | Gdy skonfigurowano tę metodę logowania |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Gdy formularz działa na tym runnerze |
| Serwery git | Gdy skonfigurowano repozytorium |
| Serwer poczty, Slack, Teams, Telegram, webhooki | Gdy skonfigurowano kanał powiadomień |
| HashiCorp Vault, CyberArk | Gdy skonfigurowano magazyn sekretów |
| Dostawca modeli (Anthropic, OpenAI i inni) | Tylko przy włączonym [asystencie czatu](../chat/), który domyślnie jest wyłączony |
| Hosty i API wskazane w formularzach | Gdy wywołują je wyrażenia formularza lub playbook |
| Serwery syslog | Gdy skonfigurowano przekazywanie audytu lub logów |

---

## Kontenery

Obrazy są budowane tak, aby działały z jak najmniejszymi uprawnieniami:

* Aplikacja i środowisko uruchomieniowe działają jako nieuprzywilejowany użytkownik `node`, a nie jako root.
* Są zbudowane na odchudzonych obrazach Debiana przypiętych przez digest, zobacz [Bezpieczne wytwarzanie](development.html#code-analysis-and-dependencies).
* Aplikacja nasłuchuje na jednym porcie, 8000.

Kroki zabezpieczania nowej instancji opisuje [Utwardzanie](../security/hardening.html).

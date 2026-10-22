---
layout: default
title: FAQ oceny
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# FAQ oceny
{: .no_toc }

Krótkie odpowiedzi na pytania, które najczęściej zadają kwestionariusze bezpieczeństwa
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dane i hosting

Gdzie znajdują się dane i kto ma do nich dostęp:

| Pytanie | Odpowiedź |
|---|---|
| Gdzie przechowywane są nasze dane? | W bazie danych MySQL lub MariaDB, którą utrzymujesz, oraz w folderze trwałym twojej instancji. AnsibleForms jest hostowany samodzielnie i nie stoi za nim żadna usługa w chmurze. |
| Czy wysyła dane swoim twórcom? | Nie. Nie ma telemetrii, raportowania użycia ani sprawdzania aktualizacji. |
| Z czym się łączy? | Tylko z systemami skonfigurowanymi przez administratora: zobacz [Połączenia wychodzące](measures.html#outbound-connections). |
| Czy używa AI lub wysyła dane do dostawcy modeli? | Tylko przy włączonym [asystencie czatu](../chat/), który domyślnie jest wyłączony. Wysyła wtedy definicje formularzy i wypełniane wartości do skonfigurowanego przez ciebie dostawcy. |
| Czy może działać bez dostępu do internetu? | Tak. Aplikacja nie potrzebuje dostępu do internetu; playbooki potrzebują tego, do czego sięgają ich zadania. |

---

## Szyfrowanie

Co jest szyfrowane i jakimi kluczami:

| Pytanie | Odpowiedź |
|---|---|
| Czy dane są szyfrowane w trakcie przesyłania? | Przez [HTTPS](../security/https.html), obsługiwany przez aplikację lub twój reverse proxy, oraz `wss://` między aplikacją a jej środowiskami uruchomieniowymi. |
| Czy dane są szyfrowane w spoczynku? | Każdy przechowywany sekret jest szyfrowany przez aplikację algorytmem AES-256. Zadania i ich wyniki są przechowywane bez zmian: użyj szyfrowania w spoczynku samej bazy danych. Zobacz [Przechowywane sekrety](measures.html#stored-secrets). |
| Kto ma klucze? | Ty: [`ENCRYPTION_SECRET`](../security/secrets.html) ustawiasz sam, jest trzymany poza kopiami zapasowymi i można go rotować. |
| Czy sekrety mogą zostać w naszym vaulcie? | Tak: [HashiCorp Vault i CyberArk](../secret-stores/) są odczytywane wtedy, gdy zadanie ich potrzebuje. |

---

## Dostęp i rozliczalność

Kto może się zalogować, co może robić i co jest rejestrowane:

| Pytanie | Odpowiedź |
|---|---|
| Czy obsługuje single sign-on? | Tak: LDAP / Active Directory, OpenID Connect i Entra ID. Zobacz [Uwierzytelnianie](../authentication/). |
| Czy obsługuje uwierzytelnianie wieloskładnikowe? | Przez single sign-on: obowiązuje MFA twojego dostawcy tożsamości. Konta lokalne nie mają własnego. |
| Jak zarządza się uprawnieniami? | Rolami mapowanymi na grupy, sprawdzanymi przez serwer przy każdym żądaniu. Zobacz [Uprawnienia](measures.html#permissions). |
| Czy jest dziennik audytu? | Tak: każda zmiana i każda odrzucona próba, przechowywane domyślnie 365 dni, z możliwością przekazywania do syslog. Zobacz [Dziennik audytu](measures.html#audit-trail). |
| Czy jest domyślne hasło? | Pierwsze konto administratora ma publiczne domyślne hasło, które trzeba zmienić przy pierwszym logowaniu. Zobacz [Konto administratora](../security/hardening.html#the-admin-account). |

---

## Podatności i aktualizacje

Jak problemy są znajdowane, naprawiane i ogłaszane:

| Pytanie | Odpowiedź |
|---|---|
| Czy znaleziono podatności? | Tak. Każda opublikowana jest wymieniona w [Biuletynach bezpieczeństwa](advisories.html), z wersją, która ją naprawiła. |
| Jak zgłosić podatność? | Prywatnie, przez GitHub: zobacz [Zgłaszanie podatności](reporting.html). |
| Jak sprawdzany jest kod? | Analiza statyczna CodeQL i dependency review przy każdym pull requeście, testy automatyczne i aktualizacje Dependabot. Zobacz [Bezpieczne wytwarzanie](development.html). |
| Które wersje otrzymują poprawki bezpieczeństwa? | 7.x i 6.5.x. Zobacz [Wspierane wersje](development.html#supported-versions). |
| Jak dowiedzieć się o nowym biuletynie? | Obserwuj alerty bezpieczeństwa repozytorium na GitHubie. Zobacz [Powiadomienia o nowych biuletynach](advisories.html#being-told-of-new-advisories). |
| Czy przeprowadzono testy penetracyjne? | Nie opublikowano raportu z testów penetracyjnych przeprowadzonych przez stronę trzecią. Kod jest publiczny, więc twój zespół lub tester może go ocenić, a ustalenia zgłasza się jak wyżej. |

---

## Obrazy i łańcuch dostaw

Skąd pochodzą obrazy i jak je sprawdzić:

| Pytanie | Odpowiedź |
|---|---|
| Gdzie publikowane są obrazy? | W GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, budowane przez publiczne workflowy GitHub Actions. Zobacz [Wydania i obrazy](development.html#releases-and-images). |
| Czy kontenery działają jako root? | Nie: jako nieuprzywilejowany użytkownik `node`. |
| Czy obrazy są podpisane? | Jeszcze nie. Pobieraj je przez digest (`@sha256:...`), aby mieć pewność, że uruchamiasz przejrzany obraz. |
| Czy jest SBOM? | Z obrazami nie jest jeszcze publikowany. Skaner taki jak Trivy lub Syft zbuduje go z obrazu. |
| Czy obrazy są skanowane pod kątem podatności? | Nie w potoku wydań. Ich obrazy bazowe są przypięte przez digest i aktualizowane przez Dependabot; skanuj obrazy we własnym rejestrze, aby stosować własną politykę. |
| Na jakiej licencji jest udostępniany? | GPL-3.0, open source, bez gwarancji. |

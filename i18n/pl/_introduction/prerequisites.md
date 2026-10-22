---
layout: default
title: Wymagania wstępne
nav_order: 5
translated_from: 730eff82a2f1ae75eaf5d1cb57f10f6e1019d14b
---

# Wymagania wstępne
{: .no_toc }

Co jest potrzebne przed instalacją AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Środowisko uruchomieniowe

AnsibleForms działa jako kontener, jako usługi systemd bezpośrednio na serwerze lub, dla tych, którzy budują go samodzielnie, jako aplikacja Node.js:

| Instalacja | Czego potrzebujesz |
|---|---|
| [Instalator](installation/installer.html) | Linux na amd64 lub arm64, `curl` lub `wget` i `sha256sum` oraz to, czego wymaga silnik, na którym instaluje (poniżej) |
| [Natywnie](installation/native.html) | Uprawnień roota, systemd i obsługiwanego Linuksa (Ubuntu, Debian, RHEL i jego klony, SUSE); resztę instaluje instalator |
| [Docker](installation/docker.html) | Docker lub Podman oraz własnego serwera MySQL |
| [Docker Compose](installation/docker-compose.html) | Docker Compose lub podman-compose; projekt uruchamia też MySQL |
| [Kubernetes](installation/kubernetes.html) | Klastra, Helm 3 i StorageClass (lub wcześniej utworzonych PersistentVolumes) |
| [Ze źródeł](installation/from-source.html) | Node.js 26 (co najmniej 24) z npm, Git oraz Ansible dla procesu RTE, który uruchamia playbooki |

Obraz aplikacji, `ghcr.io/ansibleforms/ansibleforms`, zawiera Node.js i narzędzia wywoływane przez serwer (git, ssh, klienta mariadb i
ytt), ale nie zawiera Pythona ani Ansible. Playbooki działają na RTE (runtime environment), drugim kontenerze z
`ghcr.io/ansibleforms/ansibleforms-rte-full` lub z obrazu, który budujesz na bazie `ansibleforms-rte-core` (zobacz [Skalowanie](rte/)).
Formularze, które tylko uruchamiają szablony w AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins, nie potrzebują RTE.

---

## Baza danych

AnsibleForms przechowuje swoje zadania, użytkowników, poświadczenia i połączenia w MySQL 8 lub nowszym albo w MariaDB.

Przy pierwszym uruchomieniu samo tworzy schemat `AnsibleForms`. Daj mu osobnego użytkownika bazy danych, z uprawnieniami tylko do tego schematu,
a nie roota:

```sql
CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
```

To wszystko, czego potrzebuje: tworzy i aktualizuje schemat, wykonuje kopie zapasowe i, przy kilku workerach, kończy sesję tego, który przestał działać.
Strona **Stan** i dziennik ostrzegają, gdy użytkownik ma uprawnienia do wszystkich baz danych. Węzły aplikacji i workery łączą się z tym
użytkownikiem. RTE w trybie gniazda (wychodzącym lub przychodzącym, zobacz [Tryby](rte/modes.html)) nie przechowuje poświadczeń do bazy danych: łączy się z nią tylko RTE w trybie
bazy danych, przestarzałym od wersji 7.3.0. Aby samodzielnie utworzyć schemat, ustaw [`ALLOW_SCHEMA_CREATION`](customization/server.html#env_ALLOW_SCHEMA_CREATION) na `0`.
Projekt Docker Compose i chart Helm (który używa `mysql:8.4`) uruchamiają bazę danych za Ciebie.

---

## Wymiarowanie

Nie ma zmierzonych wymagań: obciążenie zależy głównie od tego, ile zadań działa jednocześnie i ile wyniku zapisują.
Domyślne zasoby chartu Helm są rozsądnym punktem wyjścia dla małego zespołu:

| Komponent | Requests | Limits | Wolumen |
|---|---|---|---|
| AnsibleForms | 1 CPU, 1 GiB pamięci | 4 CPU, 4 GiB pamięci | 10 GiB |
| MySQL | 0.5 CPU, 512 MiB pamięci | 2 CPU, 2 GiB pamięci | 10 GiB |

Kontener aplikacji nie uruchamia żadnego playbooka. Każdy playbook to proces `ansible-playbook`, ze swoimi forkami, na RTE: dobierz CPU i
pamięć każdego RTE do playbooków, które uruchamia jednocześnie, maksymalnie [`RTE_MAX_JOBS`](customization/server.html#env_RTE_MAX_JOBS) (domyślnie `10`), i uruchom więcej
RTE, aby uruchamiać więcej. Zadania działające w AWX, AAP, Ascender lub na innych runnerach szablonów niewiele kosztują AnsibleForms.

Wynik zadań jest domyślnie przechowywany w bazie danych bezterminowo. Na mocno obciążonej instancji ustaw [`JOB_RETENTION_DAYS`](customization/retention.html#env_JOB_RETENTION_DAYS),
aby baza danych nie rosła bez ograniczeń.

---

## Sieć

Aplikacja i każde RTE nasłuchują na własnym porcie i otwierają połączenia wychodzące do systemów, z których korzystają Twoje formularze i ustawienia.

### Ruch przychodzący
{: .no_toc }

Serwer nasłuchuje na porcie `8000` ([`PORT`](customization/server.html#env_PORT)), przez HTTP lub, gdy
[`HTTPS`](customization/server.html#env_HTTPS) ma wartość `1`, przez HTTPS. Projekt Docker Compose publikuje go na porcie 443,
a chart Helm udostępnia go przez service lub ingress. RTE również nasłuchuje na własnym `PORT`, ale wywołuje go tylko aplikacja:
nie wystawiaj go do sieci publicznej. Wychodzące RTE w ogóle nie potrzebuje portu przychodzącego: samo łączy się z aplikacją na porcie aplikacji.

### Ruch wychodzący
{: .no_toc }

Otwórz połączenia z AnsibleForms do systemów, których używasz:

| Cel | Do czego służy |
|---|---|
| MySQL / MariaDB | Baza danych AnsibleForms (`DB_HOST`, `DB_PORT`, domyślnie `3306`) |
| RTE | Łączenie się z przychodzącym RTE pod adresem jego runnera przez jeden WebSocket albo wywoływanie RTE w trybie bazy danych pod jego [`RTE_URL`](customization/server.html#env_RTE_URL), które wtedy samo łączy się z MySQL; wychodzące RTE łączy się zamiast tego z aplikacją (zobacz [Tryby](rte/modes.html)) |
| AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | Uruchamianie i śledzenie szablonów i jobów na [runnerach](runners.html), przez ich API HTTP(S) |
| Zarządzane hosty | Playbooki łączą się z nimi z RTE, na przykład przez SSH lub WinRM |
| LDAP, Entra ID, OIDC | Logowanie kontami z katalogu lub z jednokrotnego logowania (SSO) |
| Serwery Git | Klonowanie i pobieranie repozytoriów, przez HTTPS lub SSH |
| API REST i bazy danych | Źródła danych wyrażeń i zapytań w Twoich formularzach |
| HashiCorp Vault, CyberArk | Odczytywanie poświadczeń z [magazynu sekretów](secret-stores/) |
| Serwery pocztowe, Slack, Teams, Telegram, webhooki | Powiadomienia o zadaniach i prośby o zatwierdzenie, przez [kanały powiadomień](notification-channels.html) |
| Dostawca modelu | [Asystent czatu](chat/), tylko gdy jest włączony |

Aby ograniczyć, które hosty mogą wywoływać funkcje REST w wyrażeniach, zobacz
[`REST_ALLOWED_HOSTS`](customization/security.html#env_REST_ALLOWED_HOSTS) i
[`REST_DENIED_HOSTS`](customization/security.html#env_REST_DENIED_HOSTS).

---

## Przeglądarka

Aplikacja webowa jest przeznaczona dla aktualnych przeglądarek: Chrome lub Edge 111, Firefox 114, Safari 16.4 lub nowszych.
Starsze przeglądarki nie są obsługiwane.

---

## Skalowanie

Domyślnie jeden kontener AnsibleForms uruchamia razem aplikację webową i pracę w tle, obok jednego RTE.

Aby obsłużyć więcej użytkowników, uruchom kilka węzłów aplikacji za load balancerem (`AF_ROLE=app`) obok workera (`AF_ROLE=worker`), który uruchamia
harmonogramy, kopie zapasowe i pozostałą pracę w tle; naraz pracuje tylko jeden worker, a drugi czeka, aby przejąć jego rolę. Współdzielą one
bazę danych, folder trwały, `ACCESS_TOKEN_SECRET` i `ENCRYPTION_SECRET`. Zobacz [Skalowanie](production/scaling.html). Uruchom więcej
RTE, aby uruchamiać więcej playbooków jednocześnie: zobacz [Kilka RTE](rte/several.html).

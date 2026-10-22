---
layout: default
title: "Strona runnera"
parent: Runnery
nav_order: 4
translated_from: 4260f9b8ce60f26e8808cf17bf4a4c3993229c5d
---

# Strona runnera
{: .no_toc }

Karty runnera, tryb, połączenie i ustawienia RTE oraz Testuj połączenie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Karty

Strona runnera pokazuje kroki jego okna jako karty, a do tego to, co na nim działa:

| Karta | Co zawiera |
|---|---|
| Szczegóły | Nazwę i opis, przełącznik **Domyślne** i przełącznik **Włączony**, takie same dla każdego typu runnera |
| Typ | Produkt, jak w oknie. Dla RTE także jego **Tryb**: **Baza danych (przestarzały)**, **Przychodzący** lub **Wychodzący**, czyli `RTE_MODE`, z którym działa jego RTE (zobacz [Tryby](../rte/modes.html)) |
| RTE | Tylko dla RTE: jego **Tryb** opisany słowami, a w trybie gniazda także jego **Połączenie** i ustawienia (zobacz [Ustawienia RTE](#an-rtes-settings)) |
| Poświadczenia | **Poświadczenie**, którym się loguje, czyli poświadczenie z Połączenia > Poświadczenia typu runnera, które zawiera jego token lub login i adres jego serwera. Poświadczenie RTE zawiera jego `RTE_TOKEN` i adres RTE, chyba że jest w trybie wychodzącym. **Projekt** dla Semaphore, Rundeck i Jenkins |
| Formularze | Formularze, które na nim działają, i w jaki sposób: **Wskazuje go** lub **Jako domyślny runner**. Wiersz otwiera formularz |
| Zadania | Ostatnie 100 zadań, które na nim działały, z ich statusem, startem, końcem i czasem trwania. Wiersz otwiera zadanie |

Każda karta ma własny adres, np. `/settings/runners/<id>/rte`, więc link lub zakładka ją otwiera. Runner bez danej karty otwiera się na
Szczegóły.

Oba przełączniki karty Szczegóły zapisują się od razu. **Domyślne** ustawia runner jako domyślny dla jego typu; wyłącza się go, ustawiając
inny runner jako domyślny. **Włączony** włącza lub wyłącza runner: wyłączony nie dostaje żadnych zadań, także jako domyślny dla swojego typu (zobacz
[Domyślny i Włączony](list.html#default-and-enabled)).

RTE, które poprosiło o dołączenie, otwiera się z żółtym polem, **Ten RTE poprosił o dołączenie**, z jego odciskiem i tym, co o sobie podało, oraz z
**Zatwierdź** i **Odrzuć** (zobacz [Zatwierdzanie RTE](registration.html#approving-an-rte)). Runner z [config seed](../seed/) informuje o tym
u góry swojej strony i jest tylko do odczytu.

---

## Ustawienia RTE

Karta RTE pozwala zarządzać RTE z aplikacji, bez edytowania jego środowiska na maszynie, na której działa.

**Połączenie.** RTE w trybie gniazda pokazuje plakietkę: **Połączony** lub **Niepołączony**. Po najechaniu **Połączony** pokazuje węzeł aplikacji,
który trzyma jego gniazdo, wydanie RTE i ile jego zadań działa. **Niepołączony** oznacza, że żaden węzeł aplikacji nie trzyma do niego gniazda:
sprawdź, czy RTE działa, jego adres lub `APP_URL` oraz jego token.

**Ustawienia.** RTE w trybie wychodzącym lub przychodzącym ma cztery ustawienia, domyślnie puste:

| Ustawienie | Odpowiada | Co robi |
|---|---|---|
| Maks. równoczesnych zadań | [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Ile playbooków uruchamia naraz, domyślnie `10`; `0` oznacza brak limitu |
| Pamięć podręczna plików | [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Ile plików zadań wysłanych przez aplikację przechowuje, w MB, domyślnie `1024`; `0` nie przechowuje żadnych |
| Czas oczekiwania przy zatrzymaniu | [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | Jak długo zatrzymywane RTE czeka na działające playbooki, domyślnie `25` sekund |
| Pliki zadań | [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | **Transfer**: aplikacja wysyła pliki zadania razem z zadaniem. **Lokalnie**: działa z własnych zamontowanych folderów |

**Która wartość wygrywa.** Wartość na stronie wygrywa z tą samą zmienną ustawioną na RTE. Pole pozostawione puste używa własnej zmiennej RTE,
a w przeciwnym razie wartości domyślnej. Pod każdym polem strona mówi, która to: **Zastępuje RTE_MAX_JOBS ustawioną na RTE (3)** albo **Puste: RTE używa
własnej RTE_MAX_JOBS, 3**; tekst zastępczy pokazuje wartość, którą oznacza puste pole.

**Jak docierają do RTE.** Ustawienia są przechowywane razem z runnerem w bazie danych aplikacji. Aplikacja wysyła je przez gniazdo RTE,
gdy się ono połączy i przy każdym ich zapisaniu, a RTE od razu je stosuje: mniejsza pamięć podręczna jest przycinana, nowy limit liczy się od
następnego zadania. RTE trzyma je tylko w pamięci i nie zapisuje żadnego pliku: po restarcie dostaje je ponownie przy połączeniu, przed pierwszym zadaniem.

RTE w trybie bazy danych (przestarzałym) nie ma gniazda: odczytuje te ustawienia z własnych zmiennych, o czym informuje karta.

---

## Testuj połączenie

Przyciski w prawym górnym rogu działają na runnerze w zapisanej postaci.

Obok **Zapisz** są **Testuj połączenie** i **Usuń**, a na karcie Poświadczenia **Dodaj poświadczenie**, które tworzy poświadczenie
typu runnera i je wybiera. Token ani hasło po zapisaniu nigdy nie są już pokazywane: zmieniaj je w poświadczeniu.

**Testuj połączenie** sprawdza, czy runner odpowiada i akceptuje swój token lub login, i mówi o tym w komunikacie: **Runner connection is
OK** albo dlaczego się nie udało. Nie uruchamia żadnego zadania. Dla RTE sprawdza też kontrakt, którym mówi RTE (zobacz
[Kontrakt](../rte/images.html#the-contract)):

| RTE | Co odczytuje test | Kiedy się nie udaje |
|---|---|---|
| Wychodzący lub przychodzący | Kto trzyma jego gniazdo, według zapisu każdego węzła aplikacji, i co RTE podało przy połączeniu. Niczego nie wywołuje | Żaden węzeł aplikacji nie trzyma do niego gniazda: *the RTE '&lt;name&gt;' (outbound) is not connected: it has not dialed the app: check its APP_URL, its token and the network from the RTE to the app*, a dla RTE w trybie przychodzącym *no app node could dial it at &lt;address&gt;: check its RTE_URL, its token and the network from the app to the RTE*. Albo RTE mówi innym kontraktem niż 3 |
| Baza danych (przestarzały) | `/rte/v1/health` RTE, wywoływane z jego tokenem | RTE nie odpowiada pod swoim adresem, odrzuca token lub mówi innym kontraktem niż 2 |

Plakietka **Połączenie** na karcie RTE pokazuje ten sam stan gniazda bez testu.

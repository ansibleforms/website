---
layout: default
title: Rejestracja
parent: Runnery
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Rejestracja
{: .no_toc }

Jak RTE prosi o dołączenie i jest zatwierdzane, tokeny dołączenia dla instalacji bez nadzoru oraz tryb bazy danych
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Prośba o dołączenie

Od wersji 7.3.0 RTE w trybie gniazda (`outbound` lub `inbound`), którego aplikacja jeszcze nie zna, prosi o dołączenie, a admin je zatwierdza.
Zgłasza się z własnym `RTE_TOKEN` i swoim `RTE_NAME`: RTE w trybie wychodzącym przy pierwszym połączeniu z aplikacją, w trybie przychodzącym w swoim jednym
wywołaniu rejestracji. Bez tokenu dołączenia aplikacja wtedy:

1. Zapisuje `RTE_TOKEN` tego RTE w nowym poświadczeniu typu RTE o nazwie `<name>-rte` (z dodaną liczbą, gdy ta nazwa jest zajęta), a
   dla RTE w trybie przychodzącym także jego adres, `RTE_URL`
2. Dodaje runner nazwany według `RTE_NAME`, typu RTE, w trybie tego RTE, logujący się tym poświadczeniem, oznaczony jako **Czeka na zatwierdzenie**
   i wyłączony. Jego opis podaje host, z którego przyszła prośba

RTE w trybie wychodzącym pozostaje połączone, gdy czeka, ale nie dostaje żadnych zadań. Aplikacja nie łączy się z RTE w trybie przychodzącym, dopóki nie zostanie ono zatwierdzone. Oba zapisują
w dzienniku, że czekają na zatwierdzenie przez admina w **Połączenia > Runnery**, z odciskiem swojego tokenu.

RTE w trybie przychodzącym z `RTE_URL` w postaci `https://` wysyła też swój certyfikat, gdy prosi o dołączenie, a aplikacja go przypina: od tej pory
aplikacja łączy się z tym RTE tylko wtedy, gdy przedstawia ono ten sam certyfikat, więc samopodpisany działa bez CA (zobacz [Przychodzący](../rte/modes.html#inbound)).

Naraz na zatwierdzenie może czekać najwyżej 20 RTE: kolejne są odrzucane, dopóki część nie zostanie zatwierdzona lub odrzucona. Prośbę, której nikt nie obsłuży w ciągu
24 godzin, worker usuwa razem z jej poświadczeniem.

RTE nazwane tak jak runner, który aplikacja już zna, ale z innym tokenem, jest odrzucane i nie prosi o dołączenie. Daj mu token tego runnera
albo usuń runner, żeby RTE poprosiło o dołączenie. [Token dołączenia](#join-tokens) pomaga tylko wtedy, gdy ten runner nadal czeka na zatwierdzenie.

---

## Zatwierdzanie RTE

Runnery czekające na zatwierdzenie znikają z listy w **Połączenia > Runnery** i trafiają do pomarańczowego powiadomienia nad nią, np.
**2 Runnery czekają na zatwierdzenie**, z wierszem dla każdego runnera: jego nazwą, hostem, adresem IP, trybem, adresem i odciskiem.
Dzwonek w nagłówku je liczy, dla użytkowników, którzy widzą runnery (zobacz [dzwonek](../jobs/#the-jobs-page)).

Kliknięcie powiadomienia otwiera okno **Rozpatrz zatwierdzenie** dla każdego runnera po kolei; kliknięcie nazwy otwiera tylko ten jeden.
Jego strona pokazuje te same informacje w żółtym polu, **Ten RTE poprosił o dołączenie**. Zanim go zatwierdzisz, sprawdź, czy to RTE, które sam uruchomiłeś:

| Pole | Co pokazuje |
|---|---|
| Odcisk | Pierwsze 8 cyfr szesnastkowych SHA-256 jego `RTE_TOKEN`, jako `abcd-ef12`. RTE zapisuje go przy starcie, a [instalator](../installation/installer.html#a-runner) wypisuje go na końcu. Musi być taki sam |
| Odcisk certyfikatu | W oknie, dla RTE w trybie przychodzącym przez HTTPS: pierwsze 8 cyfr szesnastkowych SHA-256 certyfikatu, który przypina aplikacja (jego bajtów DER), jako `abcd-ef12`. RTE zapisuje go przy starcie, a [instalator](../installation/installer.html#a-runner) wypisuje go na końcu. Musi być taki sam |
| Host | Host, na którym działa |
| Adres IP | Adres, z którego wywołało aplikację |
| Tryb | Wychodzący lub Przychodzący |
| Uri | Adres RTE w trybie przychodzącym, pod który łączy się aplikacja |
| Wersja | Jego wydanie |
| Poproszono | Kiedy poprosiło o dołączenie |

**Zatwierdź** i **Odrzuć**, w oknie lub w polu na jego stronie, rozstrzygają:

| Akcja | Co się dzieje |
|---|---|
| Zatwierdź | Runner jest włączany i od teraz przyjmuje zadania. Staje się domyślnym dla swojego typu, gdy takiego nie ma |
| Odrzuć | Runner jest usuwany razem z poświadczeniem, a jego gniazdo jest zamykane. RTE może ponownie poprosić o dołączenie; wtedy znów czeka na zatwierdzenie |

Tylko admin zatwierdza lub odrzuca RTE.

---

## Tokeny dołączenia

Token dołączenia od razu zatwierdza RTE, dla instalacji bez nadzoru: RTE uruchomione z
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) albo runner zainstalowany z opcją `--join` instalatora przedstawia go raz
i jego runner jest dodawany jako włączony, bez czekania. Tokeny dołączenia nie mają strony w interfejsie: admin tworzy je przez
[REST API](../api/), pod `/api/v2/runner`:

| Wywołanie | Co robi |
|---|---|
| `POST /api/v2/runner/jointoken` | Tworzy token dołączenia. Ciało zawiera jego `name` i opcjonalnie `expiresInHours` (brak: nigdy nie wygasa) oraz `maxUses` (brak: dowolna liczba RTE) |
| `GET /api/v2/runner/jointoken` | Wyświetla tokeny dołączenia, od najnowszego, z ich użyciami i informacją, czy nadal są ważne; nigdy samych tokenów |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Unieważnia go: nie dodaje już żadnego runnera i zostaje na liście |
| `DELETE /api/v2/runner/jointoken/<id>` | Usuwa go |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

Odpowiedź zawiera token, który zaczyna się od `afj_`, ten jeden raz: przechowywany jest tylko jego SHA-256. RTE, które go przedstawi, dostaje to samo
poświadczenie i runner co takie, które [prosi o dołączenie](#asking-to-join), włączony, a jego opis wskazuje token dołączenia. Od tej pory
RTE loguje się własnym tokenem, więc token dołączenia może wygasnąć lub zostać unieważniony bez wpływu na nie. Unieważnienie lub usunięcie tokenu dołączenia
zostawia runnery, które dodał.

Token dołączenia nigdy nie daje zatwierdzonemu runnerowi nowego tokenu. Gdy runner RTE o tej nazwie już istnieje:

| Runner | Co się dzieje |
|---|---|
| Czeka na zatwierdzenie | Dostaje nowy token w swoim poświadczeniu i nadal czeka na zatwierdzenie przez admina |
| Jest zatwierdzony | Odrzucenie z `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. Token dołączenia nie zostaje zużyty |
| Pochodzi z [config seed](../seed/) | Odrzucenie: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

RTE zainstalowane ponownie z nowym tokenem loguje się więc tokenem z poświadczenia swojego runnera albo admin zmienia ten token
w **Połączenia > Poświadczenia**, albo usuwa runner, żeby RTE dołączyło jako nowe.

---

## Rejestracja w trybie bazy danych

RTE w trybie bazy danych, przestarzałym od wersji 7.3.0, domyślnie samo się rejestruje, pod swoim `RTE_URL`, a w przeciwnym razie pod własnym adresem i portem.
Worker usuwa taki runner, gdy jego RTE nie zapisało sygnału życia przez 10 minut. Runner dodany ręcznie, przez config seed lub przez
RTE w trybie gniazda nigdy nie jest usuwany w ten sposób.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), który włącza lub wyłącza tę rejestrację, jest przestarzały w 7.3.0 razem z
trybem bazy danych: RTE w trybie gniazda prosi o dołączenie albo dołącza tokenem dołączenia. Aby w międzyczasie samemu zarządzać takimi runnerami, uruchom
RTE z `RTE_REGISTER=0` i dodaj je tutaj z typem RTE, trybem **Baza danych (przestarzały)** i poświadczeniem RTE z jego adresem i
tym samym tokenem. Aby przenieść je do trybu gniazda, zobacz [Tryby](../rte/modes.html#database-deprecated).

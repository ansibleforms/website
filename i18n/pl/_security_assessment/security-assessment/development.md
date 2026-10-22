---
layout: default
title: Bezpieczne wytwarzanie
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Bezpieczne wytwarzanie
{: .no_toc }

Jak zmiany są sprawdzane i wydawane oraz co jest wspierane
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Kod źródłowy

AnsibleForms jest open source, więc wszystko na tej stronie można sprawdzić w samym repozytorium:

* Kod, jego historia i potoki budowania są publiczne na [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* [Licencja](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) to GPL-3.0.
* [Dziennik zmian](../changelog.html) wymienia każdą zmianę każdego wydania, łącznie z poprawkami bezpieczeństwa.

---

## Jak zmiana jest scalana

Każda zmiana trafia do `main` przez pull request, w ramach zestawu reguł, którego nikt nie może ominąć:

| Reguła | Co oznacza |
|---|---|
| Wymagany pull request | Nic nie jest wypychane bezpośrednio do `main` |
| Wymagane sprawdzenia | Pull request zostaje scalony tylko wtedy, gdy przejdą wszystkie poniższe sprawdzenia |
| Bez force push, bez usuwania | Historii `main` nie można przepisać ani usunąć |
| Liniowa historia | Każdy pull request staje się jednym commitem, więc każdą zmianę można prześledzić i wycofać osobno |

Sprawdzenia, które musi przejść pull request:

| Sprawdzenie | Co robi |
|---|---|
| Client, Server | Testy jednostkowe interfejsu webowego i serwera |
| CodeQL | Analiza statyczna GitHuba kodu JavaScript i TypeScript pod kątem wstrzyknięć, cross-site scripting i innych słabości |
| Public schema is up to date | Schemat bazy danych, którego oczekuje kod, zgadza się z tym, który jest z nim dostarczany |
| Title, Branch | Pull request przestrzega zasad nazewnictwa, dzięki czemu dziennik zmian pozostaje dokładny |

Dwa kolejne działają przy każdym pull requeście i raportują na jego temat:

* **Database** testuje serwer na MySQL i MariaDB, a **Browser** steruje interfejsem w przeglądarce.
* **Dependency review** blokuje nową zależność ze znaną podatnością o wysokiej lub krytycznej istotności.

---

## Analiza kodu i zależności

Kod i jego zależności są sprawdzane ponownie po scaleniu:

* **CodeQL** analizuje też każdy push do `main` i do gałęzi wydań, a co tydzień cały kod:
  nowa reguła CodeQL sprawdza wtedy również kod scalony przed jej pojawieniem się.
* **Dependabot** otwiera pull request dla każdej nowej wersji zależności: pakietów npm serwera i
  interfejsu, pakietów Pythona środowiska uruchomieniowego i GitHub Actions potoków co tydzień, a
  obrazów bazowych kontenerów codziennie.
* Obrazy bazowe są przypięte przez digest (`node:26-trixie-slim@sha256:...`), więc build używa dokładnie przejrzanego obrazu.
  Dependabot przesuwa digest, gdy obraz zostanie przebudowany u źródła.

---

## Wydania i obrazy

Wydanie jest budowane i publikowane wyłącznie przez GitHub Actions, nigdy z maszyny programisty:

* Wydanie powstaje z `main` (lub `release/6.x`), z dziennikiem zmian zbudowanym z jego pull requestów.
* Obrazy są budowane przez [workflow Publish](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  i wypychane do GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, wraz z obrazami środowiska
  uruchomieniowego. Workflow i jego logi są publiczne, więc każdy może zobaczyć, co trafiło do obrazu.
* Obrazy aplikacji i środowiska uruchomieniowego działają jako nieuprzywilejowany użytkownik `node` (uid 1000), nigdy jako root.

---

## Wspierane wersje

Poprawki bezpieczeństwa trafiają do najnowszego wydania każdej wspieranej linii:

| Wersja | Otrzymuje poprawki bezpieczeństwa |
|---|---|
| 7.x | Tak |
| 6.5.x | Tak |
| Starsze niż 6.5 | Nie: poprawką jest aktualizacja |

[Przewodnik aktualizacji](../upgrading/) opisuje przejście na nowsze wydanie, a [Aktualizacja do v7](../upgrade-7.html) przejście z 6.5.

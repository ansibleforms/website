---
layout: default
title: Typy runnerów
parent: Runnery
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Typy runnerów
{: .no_toc }

Produkty, którymi może być runner, ich adres i logowanie
{: .fs-6 .fw-300 }

Krok **Typ** oferuje jeden wybór na produkt, każdy z podpowiedzią; podpowiedź RTE rozwija jego nazwę, *Środowisko uruchomieniowe*. AAP i
Ascender są zapisywane jako runner typu `awx` z odmianą (`aap` lub `ascender`), której używa też config seed:

| Typ | Przykład Uri | Projekt | Uwierzytelnianie |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | `RTE_TOKEN` tego RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Token API lub użytkownik i hasło |
| Ascender | `https://ascender.example.com/api/v2` | | Token API lub użytkownik i hasło |
| AWX | `https://awx.example.com/api/v2` | | Token API lub użytkownik i hasło |
| Jenkins | `https://jenkins.example.com` | Folder, w którym są zadania (opcjonalnie) | Użytkownik i token API tego użytkownika |
| Rundeck | `https://rundeck.example.com` | Nazwa projektu | Token API użytkownika |
| Semaphore | `https://semaphore.example.com` | Id projektu, liczba w `/project/<id>` | Token API użytkownika |

Adres AWX, AAP lub Ascender zawiera ścieżkę API: `/api/v2` lub `/api/controller/v2` dla AAP 2.5 i nowszych.
RTE to obraz AnsibleForms uruchomiony z `AF_ROLE=rte`; jak je uruchomić, opisuje strona
[Środowiska uruchomieniowe](../rte/).

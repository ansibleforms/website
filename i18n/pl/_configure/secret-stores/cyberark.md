---
layout: default
title: CyberArk
parent: Magazyny sekretów
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Odczytuj poświadczenia przez CCP CyberArk, zapisuj je przez jego PVWA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Eksperymentalne.** Jeszcze nie przetestowane z działającą instalacją CyberArk; zgłoś swoje obserwacje.

CCP to interfejs REST Application Access Manager firmy CyberArk.

---

## Pola magazynu

Oprócz [pól, które ma każdy magazyn](./#adding-a-store), magazyn CyberArk ma te pola:

| Pole | Znaczenie |
|---|---|
| Poświadczenie | Poświadczenie **CyberArk** z [Połączenia > Poświadczenia](../credentials.html): bazowy URL CCP, np. `https://ccp.example.com` (dopisywane jest `/AIMWebService/api/Accounts`), jego ustawienia TLS, jego AppID (aplikacja zdefiniowana dla AnsibleForms w CyberArk) oraz certyfikat klienta i klucz w PEM, tylko gdy AppID tego wymaga. |

---

## Odwołanie do sekretu

Odwołanie do sekretu identyfikuje konto jako pary klucz-wartość oddzielone `;`:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Dozwolone klucze: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` przekazuje resztę odwołania jako natywne zapytanie CCP, z `QueryFormat=Exact`,
  chyba że ustawisz inaczej.
- `AppID` w odwołaniu jest ignorowany: zawsze używany jest AppID magazynu.
- Hasło konta (`Content`) staje się hasłem; `UserName`, `Address`, `Port` i
  `Database` wypełniają użytkownika, host, port i nazwę bazy danych.

---

## Zapisywanie poświadczeń

Od 7.6.0 użytkownika i hasło poświadczenia można zapisać w CyberArk przy **Zapisie** (zob. [Zapisywanie poświadczeń](./#writing-credentials)).
CCP tylko odczytuje, więc AnsibleForms zapisuje przez REST API PVWA, zalogowany własnym poświadczeniem.

Włącz **Zezwól na zapis** w **Opcjach** magazynu, a potem wypełnij:

| Pole | Znaczenie |
|---|---|
| Zezwól na zapis | Pozwala poświadczeniu zapisać użytkownika i hasło w tym magazynie przy **Zapisie**. Domyślnie wyłączone. |
| Sejfy do zapisu | Sejfy, w których można zapisywać poświadczenia, rozdzielone przecinkami, np. `Linux, DB`. Wymagane przy włączonym zapisie. |
| Adres PVWA | Bazowy URL PVWA, np. `https://pvwa.example.com`. Wymagany. |
| Poświadczenie PVWA | Własne poświadczenie typu **Użytkownik i hasło** lub **API**, nigdy nie odczytywane z magazynu sekretów, które może dodawać konta do tych sejfów i zmieniać ich hasła. Wymagane. |
| Metoda logowania | Jak loguje się poświadczenie PVWA: CyberArk (domyślnie), LDAP, RADIUS lub Windows. |
| ID platformy | Platforma dodawanych kont, np. `UnixSSH`. Potrzebne do dodania nowego konta. |

Odwołanie wskazuje konto tak jak przy odczycie, `Safe=Linux;Object=srv01-root`, z `Address=srv01.example.com`, gdy platforma go wymaga.

- Nowe konto jest dodawane do sejfu z platformą, nazwą użytkownika i hasłem.
- Istniejące konto jest zmieniane tylko po zaznaczeniu **Nadpisz sekret, który już tam jest**: najpierw nazwa użytkownika, potem hasło.
- Sesja PVWA jest wylogowywana po każdym zapisie. Logowanie OAuth Privilege Cloud nie jest obsługiwane.

---

## Dodatkowe opcje

Dodatkowe opcje magazynu ustawia się jako obiekt JSON:

| Klucz | Znaczenie |
|---|---|
| `reason` | Wysyłany jako `Reason`, gdy odwołanie go nie ma, dla audytu CyberArk. |
| `check_ref` | Odwołanie, które **Testuj połączenie** faktycznie odczytuje. Bez niego test sprawdza tylko, czy CCP odpowiada i akceptuje AppID. |
| `timeout_ms` | Limit czasu żądania, domyślnie 10000. |

Na przykład, aby wysyłać przyczynę i pozwolić **Testuj połączenie** odczytać konto testowe:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```

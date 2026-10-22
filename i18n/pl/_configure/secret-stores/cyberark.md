---
layout: default
title: CyberArk
parent: Magazyny sekretów
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Odczytuj poświadczenia z CyberArk Central Credential Provider (CCP)
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

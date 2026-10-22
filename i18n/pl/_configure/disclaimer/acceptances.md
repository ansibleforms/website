---
layout: default
title: Akceptacje
parent: Zastrzeżenie
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Akceptacje
{: .no_toc }

Kto zaakceptował którą wersję i ponowne pytanie wybranych użytkowników
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Kto zaakceptował

Każda akceptacja jest zapisywana dla użytkownika i wersji, a karta **Akceptacje** na stronie wersji wyświetla je, od najnowszej:

| Kolumna | Znaczenie |
|---|---|
| **Użytkownik** | Nazwa użytkownika |
| **Logowanie** | Jak się zalogował: lokalnie, LDAP, Microsoft Entra ID lub OpenID Connect |
| **Zaakceptowano** | Kiedy |
| **Adres IP** | Skąd |
| **Przeglądarka** | Jego przeglądarka |

---

## Ponowne pytanie użytkowników

Od wersji 7.3.0 wybranych użytkowników można poprosić o ponowną akceptację wersji, bez pytania wszystkich.

**Poproś ponownie** w menu wiersza albo na wierszach zaznaczonych na liście usuwa te akceptacje po potwierdzeniu: ci użytkownicy dostają
zastrzeżenie ponownie przy następnym żądaniu, bez ponownego logowania. Listę można też wyeksportować, jak każdą tabelę.

[Dziennik audytu](../production/logs.html#audit-trail) zapisuje też każdą akceptację, każde odrzucenie i każdą zmianę zastrzeżenia.

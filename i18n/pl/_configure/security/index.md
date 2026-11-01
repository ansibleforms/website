---
layout: default
title: Bezpieczeństwo
nav_order: 15
has_children: true
has_toc: false
permalink: /security/
translated_from: e299ab0a4ffb1c12441a3b3fec6eaaef4a19de79
---

# Bezpieczeństwo
{: .no_toc }

Zabezpiecz instancję: konto admina, jej sekrety, HTTPS oraz to, co mogą robić użytkownicy i formularze
{: .fs-6 .fw-300 }

---

Dla administratorów przygotowujących instancję do produkcji oraz do przeglądów bezpieczeństwa istniejącej instancji.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Utwardzanie](hardening.html) | Konto admina, limity logowania, baza danych, wyrażenia, dane zadań, polityka przeglądarki, funkcje opcjonalne i opcje ról |
| [HTTPS](https.html) | Gdzie kończy się TLS, udostępnianie HTTPS z aplikacji i zastąpienie przykładowego certyfikatu |
| [Sekrety i szyfrowanie](secrets.html) | `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET` i czasy życia tokenów |

Powiązane strony: [Uwierzytelnianie](../authentication/) dla metod logowania, [Walidacja uruchomień](../launch-validation/) dla
sprawdzeń każdego uruchomienia po stronie serwera oraz [Zmienne bezpieczeństwa](../customization/security.html).

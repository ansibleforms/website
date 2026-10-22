---
layout: default
title: Włączanie
parent: Asystent czatu
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Włączanie
{: .no_toc }

Włączenie asystenta i udostępnienie w nim formularzy
{: .fs-6 .fw-300 }

---

Asystent wymaga spełnienia wszystkich czterech warunków:

1. **`ENABLE_CHAT=1`** - zmienna środowiskowa. Zmieniona na stronie ustawień obowiązuje od razu, bez restartu; dopóki
   jest wyłączona, endpointy czatu odpowiadają `404`. Zobacz [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Dostawca modelu** - Ustawienia -> Połączenia -> **Asystent czatu** (lub [config seed](../seed) na Kubernetes).
3. **Formularze, które biorą udział** - `enableForChat: true` w każdym formularzu; asystent ignoruje wszystkie pozostałe.
4. **Użytkownicy, którzy mogą z niego korzystać** - opcja roli `allowChat` (domyślnie: true). Ustaw
   `allowChat: false` w roli, aby wykluczyć jej członków.

Przycisk czatu pojawia się u użytkownika, gdy wszystkie cztery warunki są spełnione.

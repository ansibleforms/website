---
layout: default
title: Przegląd
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Ocena bezpieczeństwa
{: .no_toc }

Dla przeglądów bezpieczeństwa: zabezpieczenia, proces wytwarzania i biuletyny
{: .fs-6 .fw-300 }

---

## W skrócie

AnsibleForms uruchamia playbooki i przechowuje ich poświadczenia, więc jest częścią twojego łańcucha zaufania:

* Jest **hostowany samodzielnie**: działa na twojej infrastrukturze, przechowuje dane w twojej bazie danych i niczego nie wysyła swoim twórcom.
* Jest **open source** (GPL-3.0): kod, jego potoki i każdy biuletyn są publiczne.
* Każdy przechowywany sekret jest **szyfrowany**, każda zmiana **audytowana**, a **role** sprawdzane przy każdym żądaniu.
* Podatności są **zgłaszane prywatnie**, naprawiane w każdym wspieranym wydaniu i **publikowane**.

---

## W tej sekcji

Strony odpowiadają na pytania przeglądu bezpieczeństwa, od architektury po listę CVE:

| Strona | Czego dotyczy |
|---|---|
| [Zabezpieczenia](measures.html) | Logowanie, uprawnienia, przechowywane sekrety, dziennik audytu, przeglądarka, serwer, połączenia i kontenery |
| [Bezpieczne wytwarzanie](development.html) | Jak zmiana jest przeglądana i testowana, analiza kodu i zależności, jak budowane są obrazy, wspierane wersje |
| [Zgłaszanie podatności](reporting.html) | Jak prywatnie zgłosić problem i co dzieje się potem |
| [Biuletyny bezpieczeństwa](advisories.html) | Każda opublikowana podatność, z jej CVE, istotnością i wersją z poprawką |
| [FAQ oceny](faq.html) | Krótkie odpowiedzi na pytania, które najczęściej zadają kwestionariusze bezpieczeństwa |

Aby zabezpieczyć instancję, a nie ją ocenić, zobacz [Bezpieczeństwo](../security/) w przewodniku administratora.

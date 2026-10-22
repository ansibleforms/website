---
layout: default
title: Serwer MCP
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# Serwer MCP
{: .no_toc }

Pozwól agentom AI korzystać z Twoich formularzy przez Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów i integratorów: pozwól klientom MCP wyświetlać, wypełniać i uruchamiać formularze jako użytkownik, którego token posiadają.

AnsibleForms może udostępniać serwer
[Model Context Protocol](https://modelcontextprotocol.io), dzięki czemu klient MCP, na przykład
backend czatu lub asystent w IDE, może wyświetlić formularze, z których użytkownik może korzystać, poznać ich pola,
uruchamiać zadania i śledzić ich postęp.

---

## Czym jest, a czym nie jest

Serwer MCP to techniczny interfejs do tego samego przepływu formularzy, którego używa przeglądarka. Działa
**jako użytkownik, którego token otrzymuje**: te same role formularzy, ta sama widoczność zadań, te
same kontrole zarezerwowanych extravars co przy wysłaniu z przeglądarki.

Nie dodaje żadnej własnej polityki AI. To, czy agent musi prosić o potwierdzenie przed uruchomieniem,
z których formularzy może korzystać i ile żądań może wysłać, zależy od klienta MCP. Narzędzie
uruchamiania jest oznaczone jako destrukcyjne, więc dobrze zachowujący się klient najpierw prosi o potwierdzenie,
ale serwer tego nie wymusza.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Co obejmuje |
|---|---|
| [Konfiguracja](setup.html) | Włączenie serwera i uwierzytelnienie klienta |
| [Narzędzia](tools.html) | Narzędzia, których agent używa do wypełniania, zatwierdzania i ponownego uruchamiania formularzy |
| [Ograniczenia](limitations.html) | Wyrażenia wykonywane na serwerze i to, czego serwer MCP nie robi |

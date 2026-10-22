---
layout: default
title: Acceptaties
parent: Disclaimer
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Acceptaties
{: .no_toc }

Wie welke versie accepteerde, en gekozen gebruikers opnieuw vragen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wie accepteerde

Elke acceptatie wordt vastgelegd voor de gebruiker en de versie, en het tabblad **Acceptaties** van de pagina van een versie toont ze, de nieuwste eerst:

| Kolom | Betekenis |
|---|---|
| **Gebruiker** | De gebruikersnaam |
| **Aanmelding** | Hoe ze zich aanmeldden: Lokaal, LDAP, Microsoft Entra ID of OpenID Connect |
| **Geaccepteerd** | Wanneer |
| **IP-adres** | Vanwaar |
| **Browser** | Hun browser |

---

## Gebruikers opnieuw vragen

Vanaf 7.3.0 kunnen gekozen gebruikers worden gevraagd een versie opnieuw te accepteren, zonder iedereen te vragen.

**Opnieuw vragen** in een rijmenu, of op de rijen die in de lijst zijn aangevinkt, wist die acceptaties na een bevestiging: die gebruikers krijgen de
disclaimer opnieuw bij hun volgende verzoek, zonder zich opnieuw aan te melden. De lijst kan ook worden geëxporteerd, zoals elke tabel.

Het [auditlogboek](../production/logs.html#audit-trail) legt ook elke acceptatie, elke weigering en elke wijziging van de disclaimer vast.

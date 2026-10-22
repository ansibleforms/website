---
layout: default
title: Inschakelen
parent: Chat-assistent
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Inschakelen
{: .no_toc }

Schakel de assistent in en bied er formulieren in aan
{: .fs-6 .fw-300 }

---

De assistent vereist alle vier van de volgende:

1. **`ENABLE_CHAT=1`** - de omgevingsvariabele. Gewijzigd op de instellingenpagina geldt hij meteen, zonder herstart; zolang
   hij uit staat, antwoorden de chat-endpoints `404`. Zie [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Een modelprovider** - Instellingen -> Verbindingen -> **Chat-assistent** (of de [config seed](../seed) op Kubernetes).
3. **Formulieren die meedoen** - `enableForChat: true` op elk formulier; de assistent negeert alle andere.
4. **Gebruikers die hem mogen gebruiken** - de rol-optie `allowChat` (standaard: true). Zet
   `allowChat: false` op een rol om de leden ervan uit te sluiten.

De chatknop verschijnt voor een gebruiker zodra aan alle vier de voorwaarden is voldaan.

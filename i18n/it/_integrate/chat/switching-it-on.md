---
layout: default
title: Attivarlo
parent: Assistente chat
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Attivarlo
{: .no_toc }

Abilita l'assistente e offri dei moduli al suo interno
{: .fs-6 .fw-300 }

---

L'assistente richiede tutte e quattro le condizioni seguenti:

1. **`ENABLE_CHAT=1`** - la variabile d'ambiente. Modificata nella pagina delle impostazioni, si applica subito, senza riavvio; finché
   è disattivata, gli endpoint della chat rispondono `404`. Vedi [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Un fornitore del modello** - Impostazioni -> Connessioni -> **Assistente chat** (o il [config seed](../seed) su Kubernetes).
3. **Moduli che partecipano** - `enableForChat: true` su ogni modulo; l'assistente ignora tutti gli altri.
4. **Utenti che possono usarlo** - l'opzione di ruolo `allowChat` (predefinito: true). Imposta
   `allowChat: false` su un ruolo per escluderne i membri.

Il pulsante della chat compare per un utente quando tutte e quattro le condizioni sono soddisfatte.

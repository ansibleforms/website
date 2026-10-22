---
layout: default
title: Funzionalità
parent: Variabili d'ambiente
nav_order: 4
translated_from: dbd2d865ae9b177e389409777bdfffc8f199f9da
---

# Funzionalità
{: .no_toc }

Il designer, MCP, la chat, la validazione all'avvio, la lista dei job, le metriche, l'API AWX e il log delle query
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modificale per attivare o disattivare le parti facoltative dell'applicazione.

---

## Esempio

Esponi il server MCP per gli agenti IA e applica le regole di validazione dei moduli a ogni avvio. Nel `.env` del progetto compose:

```bash
ENABLE_MCP=1
LAUNCH_VALIDATION=enforce
```

`ENABLE_MCP` ed `ENABLE_CHAT` si applicano senza riavvio: vengono lette a ogni richiesta, quindi puoi attivarle nella
pagina delle impostazioni. Finché una è disattivata, il suo endpoint (`/api/v2/mcp` o `/api/v2/chat`) risponde `404`.

Usa prima `LAUNCH_VALIDATION=log` per un po': registra ciò che `enforce` rifiuterebbe, senza rifiutarlo. Vedi [MCP](../mcp/)
e [Registrare e applicare](../launch-validation/log-and-enforce.html).

---

## Variabili

Ogni variabile di questo gruppo, con il suo tipo, il valore predefinito e la descrizione:

{% include env_vars_table.html group="features" %}

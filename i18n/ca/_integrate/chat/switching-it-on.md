---
layout: default
title: Activar-lo
parent: Assistent de xat
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Activar-lo
{: .no_toc }

Activar l'assistent i oferir-hi formularis
{: .fs-6 .fw-300 }

---

L'assistent necessita aquestes quatre coses alhora:

1. **`ENABLE_CHAT=1`** - la variable d'entorn. Si es canvia a la pàgina de configuració, s'aplica a l'instant, sense reiniciar; mentre
   està desactivada, els endpoints del xat responen `404`. Consulta [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Un proveïdor de models** - Configuració -> Connexions -> **Assistent de xat** (o el [config seed](../seed) a Kubernetes).
3. **Formularis que hi participin** - `enableForChat: true` a cada formulari; l'assistent ignora tots els altres.
4. **Usuaris que el puguin fer servir** - l'opció de rol `allowChat` (per defecte: true). Defineix
   `allowChat: false` en un rol per excloure'n els membres.

El botó de xat apareix per a un usuari quan es compleixen les quatre condicions.

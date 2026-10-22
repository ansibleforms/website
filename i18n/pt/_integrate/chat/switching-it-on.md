---
layout: default
title: Ativá-lo
parent: Assistente de chat
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Ativá-lo
{: .no_toc }

Ative o assistente e disponibilize formulários nele
{: .fs-6 .fw-300 }

---

O assistente exige as quatro condições seguintes:

1. **`ENABLE_CHAT=1`** - a variável de ambiente. Alterada na página de definições, aplica-se de imediato, sem reinício; enquanto
   estiver desligada, os endpoints do chat respondem `404`. Consulte [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Um fornecedor de modelo** - Definições -> Ligações -> **Assistente de chat** (ou o [config seed](../seed) em Kubernetes).
3. **Formulários que participam** - `enableForChat: true` em cada formulário; o assistente ignora todos os outros.
4. **Utilizadores que o podem usar** - a opção de função `allowChat` (predefinição: true). Defina
   `allowChat: false` numa função para excluir os seus membros.

O botão de chat aparece para um utilizador assim que as quatro condições estão cumpridas.

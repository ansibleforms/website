---
layout: default
title: Ligações
parent: Aparência
nav_order: 5
translated_from: b17adbc1210baac2cf6786f7b0cef5e18fea8ae1
---

# Ligações
{: .no_toc }

As ligações do cabeçalho, as integradas e as suas
{: .fs-6 .fw-300 }

**Ligações** define as ligações do cabeçalho, para todos os utilizadores com sessão iniciada, em dois separadores.

**Integradas** tem o interruptor **Designer**, guardado em [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) e aplicado
sem reiniciar. Desligado, o designer desaparece para todos: a sua ligação, a sua página e a sua API.

**Personalizadas** guarda as suas próprias ligações, como uma wiki, um runbook ou um portal de suporte. **Adicionar ligação** adiciona uma linha com estes campos:

| Campo | Significado |
|---|---|
| **Ícone** | O ícone antes da etiqueta, escolhido de uma lista |
| **Etiqueta** | O texto da ligação |
| **Endereço** | Um site (`https://…`) ou uma página da aplicação (`/forms/all`) |
| **Novo separador** | Abre a ligação num novo separador do navegador |

Os botões de uma linha movem-na: **→** coloca a ligação dentro da ligação acima dela, que passa a abrir como um menu no cabeçalho,
**←** volta a tirá-la para o cabeçalho, e as setas para cima e para baixo movem-na (um menu com as ligações que tem dentro).
Um menu não precisa de endereço próprio.

O cabeçalho comporta no máximo 5 das suas ligações depois das integradas, e no máximo 10 dentro de cada menu.

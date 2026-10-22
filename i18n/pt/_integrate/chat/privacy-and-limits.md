---
layout: default
title: Privacidade e limites
parent: Assistente de chat
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Privacidade e limites
{: .no_toc }

O que sai da rede, e os limites por utilizador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O que sai da rede

Para os formulários que participam, é enviado o seguinte ao fornecedor:

- os nomes e as descrições dos formulários, as etiquetas dos campos, os textos de ajuda, as opções e os valores que estão a ser
  preenchidos;
- a conversa.

O seguinte nunca é enviado ao fornecedor, à página nem ao registo:

- palavras-passe (o utilizador introdu-las no navegador), credenciais guardadas e a chave de API;
- a saída de uma tarefa, e as suas extravars guardadas (o assistente lê apenas o estado de uma tarefa, e só
  quando **Deixar o assistente acompanhar os seus jobs** está ativado nas definições).

Tudo o que esteja sob uma chave que pareça um segredo (`password`, `secret`, `token`, `api_key`, ...)
é mascarado antes de o modelo ou a página o verem.

Para manter os dados dos formulários dentro de casa, use o seu próprio tenant (Azure OpenAI) ou um modelo local (Ollama), e não uma API pública.

---

## Limites

Os seguintes limites são definidos na página de definições:

- **Mensagens por conversa** (20) - depois disso o utilizador tem de começar uma nova conversa.
- **Rondas de ferramentas por mensagem** (6) - quantas vezes o modelo pode chamar uma ferramenta antes de responder.
- **Tempo limite** (60 s) - por chamada ao fornecedor.

Os seguintes limites são fixos: uma mensagem de cada vez por conversa, no máximo 4000 caracteres por mensagem, 60 mensagens por
utilizador por hora, e 5 conversas por utilizador. Uma conversa é descartada após 2 horas sem mensagens.

Um cartão de resumo com um botão **Iniciar** pode ser usado uma vez, e expira ao fim de 15 minutos: Iniciar responde então que o
resumo expirou, e o utilizador pede ao assistente um novo. As conversas e os resumos são guardados em memória, por isso depois de
um reinício o utilizador tem de começar uma nova conversa.

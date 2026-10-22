---
layout: default
title: Relançamento e auditoria
parent: Assistente de chat
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Relançamento e auditoria
{: .no_toc }

Relançar a partir do chat, o registo de auditoria e as limitações
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Relançamento

Um pedido como "Executa novamente a tarefa 1234" (o utilizador tem de escrever o ID da tarefa) pré-visualiza um relançamento
com as mesmas regras que o `relaunch_job` do servidor MCP, incluindo a regra das palavras-passe da
[validação do lançamento](../launch-validation), e mostra um resumo **Relançar**; o botão
lança-o uma vez. "Executa novamente a tarefa 1234 com o servidor web02" altera apenas esse campo.

---

## Auditoria

Cada lançamento a partir do chat é registado como **chat.launch** com o utilizador, a tarefa, o formulário,
o fornecedor e o hash do payload do resumo que foi aprovado. As alterações às definições do chat são
registadas como qualquer outra alteração de definições.

---

## Limitações

O assistente de chat ainda não faz tudo o que um navegador faz:

- Os **formulários wizard** não podem participar (`enableForChat` é recusado neles), nem os
  campos que o assistente não preenche: palavras-passe e carregamentos de ficheiros.
- As respostas chegam de uma só vez; o streaming ainda não é suportado.
- O modelo pode compreender mal um pedido. O cartão de resumo mostra exatamente o que vai ser enviado;
  reveja-o antes de clicar em **Iniciar**.

---
layout: default
title: Validação no lançamento
nav_order: 4
has_children: true
has_toc: false
permalink: /launch-validation/
translated_from: 6b86704480781edc0ab1c24c25993fc2e220abf3
---

# Validação no lançamento
{: .no_toc }

Verificar no servidor cada lançamento de um formulário
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores e autores de formulários: faça com que o servidor verifique cada lançamento, as suas regras e as suas extravars, seja quem for que o envie.

A verificação aplica-se independentemente de quem ou do que lança o formulário: o navegador, um script que chama a API REST,
ou um agente de IA através do servidor MCP.

---

## Porque existe

As regras de um formulário (`required`, `regex`, `minValue`, `sameAs`, ...) sempre foram verificadas
no navegador. Depois, o navegador envia duas coisas para `POST /api/v2/job`:

- `rawFormData`: os valores dos campos tal como o utilizador os preencheu;
- `extravars`: o que o playbook recebe, construído a partir desses valores no navegador.

Sem validação no lançamento, o servidor confia em ambos. Qualquer pessoa com um token válido pode chamar esse
endpoint diretamente e enviar quaisquer extravars, sem que se aplique nenhuma regex, campo obrigatório ou regra
de lista. Para um formulário que só é usado no navegador, isso pode ser aceitável; para um
formulário que outros sistemas lançam por REST, significa que as regras do formulário não são aplicadas de todo.

Além disso, o servidor não tem forma de distinguir um pedido do navegador de um enviado por um
script: ambos usam o mesmo endpoint, o mesmo token e o mesmo corpo, e os utilizadores podem modificar
qualquer pedido que o seu próprio navegador envie. Só se pode confiar numa verificação feita no servidor, e a validação
no lançamento é essa verificação.

---

## As três vias de entrada

A forma como um lançamento é validado depende de como chega e do modo de validação no lançamento:

| Lançado por | Validado | Extravars com que a tarefa é executada |
|---|---|---|
| **Servidor MCP** (agente de IA) | sempre, no servidor | construídas sempre pelo servidor |
| **Navegador** ou **API REST**, validação no lançamento `off` | só no navegador | as que o navegador (ou quem chama) enviou |
| **Navegador** ou **API REST**, validação no lançamento `log` | no servidor, recusas apenas registadas | as enviadas; diferenças registadas |
| **Navegador** ou **API REST**, validação no lançamento `enforce` | no servidor, recusado quando inválido | **construídas pelo servidor** |

O navegador, o servidor MCP e a validação no lançamento usam o mesmo código para as regras (o
motor de formulários partilhado): as mesmas regras, pela mesma ordem, com as mesmas mensagens. Um erro que o
navegador mostra é recusado pelo servidor com o mesmo texto.

---

## Nesta secção

Cada tema tem a sua própria página:

| Página | O que abrange |
|---|---|
| [Ativá-la](switching-it-on.html) | Para toda a instância, ou para um formulário |
| [Registar e impor](log-and-enforce.html) | O que cada modo faz com um lançamento que viola as regras |
| [Linhas de listas](list-rows-and-subforms.html) | Como são validadas as linhas dos campos list |
| [Carregamento de ficheiros](file-uploads.html) | Como são validados os campos de ficheiro |
| [Palavras-passe](passwords.html) | Como os campos de palavra-passe são validados e mantidos fora das APIs |
| [Relançar](relaunching.html) | Como é validada uma tarefa relançada |
| [Implementação gradual](rolling-it-out.html) | Passar uma instância para enforce, e as limitações conhecidas |

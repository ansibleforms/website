---
layout: default
title: Aceitações
parent: Aviso legal
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Aceitações
{: .no_toc }

Quem aceitou que versão, e pedir de novo a utilizadores escolhidos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quem aceitou

Cada aceitação fica registada para o utilizador e a versão, e o separador **Aceitações** da página de uma versão lista-as, a mais recente primeiro:

| Coluna | Significado |
|---|---|
| **Utilizador** | O nome de utilizador |
| **Início de sessão** | Como iniciou sessão: Local, LDAP, Microsoft Entra ID ou OpenID Connect |
| **Aceite** | Quando |
| **Endereço IP** | De onde |
| **Navegador** | O seu navegador |

---

## Pedir de novo aos utilizadores

A partir da 7.3.0, pode pedir-se a utilizadores escolhidos que aceitem uma versão de novo, sem pedir a todos.

**Pedir novamente** no menu de uma linha, ou nas linhas marcadas na lista, apaga essas aceitações depois de uma confirmação: esses utilizadores recebem o
aviso legal de novo no seu pedido seguinte, sem voltar a iniciar sessão. A lista também pode ser exportada, como qualquer tabela.

O [registo de auditoria](../production/logs.html#audit-trail) também regista cada aceitação, cada recusa e cada alteração do aviso legal.

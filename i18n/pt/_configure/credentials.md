---
layout: default
title: Credenciais
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 08110077a1cf59a4a52e078fc2ebc252f7cae48d
---

# Credenciais
{: .no_toc }

Guarde os acessos com que se ligam os formulários, os repositórios, os cofres de segredos e os canais de notificação
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: adicione os utilizadores, palavras-passe e tokens com que o AnsibleForms se liga, guardados cifrados ou lidos de um cofre de segredos.

---

## Nesta secção

| Página | O que abrange |
|---|---|
| [Tipos de credencial](credentials/types.html) | O que cada tipo contém, e onde pode ser escolhido |
| [A página de credenciais](credentials/list.html) | A lista de credenciais, e a caixa de diálogo que adiciona uma |
| [A página de uma credencial](credentials/credential-page.html) | Os separadores de uma credencial, e o que a usa |

---

## Como funciona

Uma **credencial** é um acesso com nome, adicionado em **Ligações > Credenciais**. Os formulários e os outros objetos de administração referem-se
a ela pelo seu nome, por isso a palavra-passe propriamente dita nunca aparece num formulário. O seu utilizador e a sua palavra-passe são guardados na
base de dados do AnsibleForms, cifrados com `ENCRYPTION_SECRET`, ou lidos de um [cofre de segredos](secret-stores/) cada vez que a
credencial é usada.

---

## Quem pode alterar uma credencial

A partir da 7.3.0, uma credencial de que depende uma ligação ou um início de sessão só pode ser adicionada, alterada ou eliminada por um admin:

| Credenciais | Porquê |
|---|---|
| Tipos de ligação: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` e `cyberark` | Um runner ou um cofre de segredos obtém dela o seu endereço e o seu segredo |
| Tipos de início de sessão: `oidc`, `entraid` e `ldap` | Um fornecedor SSO ou um diretório LDAP inicia a sessão dos utilizadores com ela |
| Qualquer credencial que um runner nomeie | O runner inicia sessão com ela, e uma alteração do próprio runner também precisa de um admin |

Os outros utilizadores com acesso às credenciais veem estas só de leitura. Um utilizador que pudesse apontar uma credencial destas para outro
servidor receberia todos os segredos enviados através dela, e é por isso que a regra segue a dos runners. Mais três regras
mantêm esses utilizadores afastados de segredos que de outra forma não poderiam ler:

- **Nomear uma credencial protegida**: só um admin pode nomear uma destas credenciais noutro sítio, como num repositório,
  num canal de notificação ou nas definições do assistente de chat. Uma credencial que lê a sua palavra-passe de um cofre de segredos fica
  protegida da mesma forma, seja qual for o seu tipo.
- **Escolher um cofre de segredos**: só um admin pode apontar uma credencial para um [cofre de segredos](secret-stores/), ou alterar o
  cofre ou a referência que lê; outro utilizador pode mesmo assim devolvê-los sem alterações, ou esvaziá-los todos.
- **Mover uma credencial**: quando outro utilizador altera onde uma credencial inicia sessão (o seu host, porta, emissor, tenant ou
  endereço do servidor) sem voltar a escrever a sua palavra-passe, a palavra-passe guardada é apagada, tal como a referência ao cofre de segredos
  que lê, para que o segredo antigo nunca vá para o novo destino.

---

## Credenciais em uso

Uma credencial que ainda é nomeada por registos não pode ser eliminada nem renomeada, porque estes ficariam a apontar para nada.
A recusa indica quantos registos a usam; o separador **Usado por** da [sua página](credentials/credential-page.html) lista-os.
Aponte-os primeiro para outra credencial e depois elimine-a ou renomeie-a.

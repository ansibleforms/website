---
layout: default
title: Autenticação
parent: Repositórios git
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Autenticação
{: .no_toc }

HTTPS com um token, SSH com a chave gerada, e comandos git personalizados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Autenticação

A forma como o AnsibleForms se autentica depende da forma do **Uri**.

### HTTPS com um token

Para um remoto HTTPS privado, escolha uma **Credencial** cujo utilizador seja o utilizador git e cuja palavra-passe seja um token de acesso pessoal
(ou a palavra-passe).

A partir da 7.3.0, o git inicia sessão através de `GIT_ASKPASS`: o utilizador e o token vão para cada comando git que fala com o servidor, nunca para
o URL, pelo que não ficam guardados no `.git/config` do clone e um token alterado é usado no pull ou push seguinte. O token precisa de
acesso de leitura para fazer pull, e de acesso de escrita para fazer push. Um remoto público não precisa de credencial.

Até à 7.2.0, ambos eram inseridos no URL, como `https://<user>:<token>@git.example.com/team/forms.git`. Um clone feito nessa altura mantém
esse URL até ao seu pull ou push seguinte, que repõe o seu remoto no próprio **Uri** do repositório.

### SSH com a chave gerada

Para um remoto SSH, o AnsibleForms autentica-se com o seu próprio par de chaves, que gera no primeiro arranque.

1. Abra **Definições > Ligações > SSH**, no separador **Chave**, e copie a **Chave pública**.
2. Acrescente-a no servidor git, como deploy key do repositório (com acesso de escrita se fizer push), ou a um utilizador com acesso.
3. Acrescente o repositório com um **Uri** SSH, por exemplo `git@git.example.com:team/forms.git`, e não escolha nenhuma credencial.

O par de chaves fica em `.ssh/id_rsa` dentro de [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), por isso mantenha essa pasta em
armazenamento persistente, ou a chave muda quando o contentor é recriado.

Num clone com um Uri `user@host:path`, o AnsibleForms executa primeiro `ssh-keyscan` sobre o host e acrescenta a sua chave aos
hosts conhecidos. Para outros remotos, acrescente o host no separador **Hosts conhecidos** de **Definições > Ligações > SSH** antes do
primeiro clone.

### Comandos git personalizados

Os comandos de clone, pull e push podem ser substituídos, por exemplo para acrescentar opções do git, com três definições.

| Definição | Predefinição | O que o AnsibleForms acrescenta |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, o Uri e o nome |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

A partir da 7.3.0, estes comandos correm sem shell: as aspas funcionam, mas um operador de shell como `;`, `|`, `&&` ou `>` é recusado.

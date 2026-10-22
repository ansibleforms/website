---
layout: default
title: Desenvolvimento seguro
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Desenvolvimento seguro
{: .no_toc }

Como as alterações são verificadas e publicadas, e o que é suportado
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O código-fonte

O AnsibleForms é open source, por isso tudo o que está nesta página pode ser verificado no próprio repositório:

* O código, o seu histórico e os seus pipelines de build são públicos em [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* A [licença](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) é GPL-3.0.
* O [registo de alterações](../changelog.html) enumera todas as alterações de cada versão, incluindo as correções de segurança.

---

## Como uma alteração é integrada

Todas as alterações chegam a `main` através de um pull request, sob um conjunto de regras que ninguém pode contornar:

| Regra | O que significa |
|---|---|
| Pull request obrigatório | Nada é enviado diretamente para `main` |
| Verificações obrigatórias | O pull request só é integrado quando passam todas as verificações abaixo |
| Sem force push, sem eliminação | O histórico de `main` não pode ser reescrito nem removido |
| Histórico linear | Cada pull request torna-se um commit, para que cada alteração possa ser rastreada e revertida por si só |

As verificações que um pull request tem de passar:

| Verificação | O que faz |
|---|---|
| Client, Server | Os testes unitários da interface web e do servidor |
| CodeQL | A análise estática do GitHub ao código JavaScript e TypeScript, à procura de injeção, cross-site scripting e outras fragilidades |
| Public schema is up to date | O esquema da base de dados que o código espera corresponde ao que inclui |
| Title, Branch | O pull request segue as regras de nomes, para que o registo de alterações se mantenha exato |

Há mais duas que correm em cada pull request e reportam sobre ele:

* **Database** testa o servidor em MySQL e MariaDB, e **Browser** conduz a interface num navegador.
* **Dependency review** bloqueia uma dependência nova com uma vulnerabilidade conhecida alta ou crítica.

---

## Análise de código e dependências

O código e aquilo de que depende são verificados de novo depois de integrados:

* O **CodeQL** também analisa cada push para `main` e para os ramos de versão, e todo o código base todas as semanas:
  uma regra nova do CodeQL verifica assim também o código integrado antes dela.
* O **Dependabot** abre um pull request para cada nova versão de uma dependência: os pacotes npm do servidor e da
  interface, os pacotes Python do ambiente de execução e as GitHub Actions dos pipelines todas as semanas, e
  as imagens base dos contentores todos os dias.
* As imagens base são fixadas por digest (`node:26-trixie-slim@sha256:...`), para que um build use exatamente a imagem revista.
  O Dependabot atualiza o digest quando a imagem é reconstruída a montante.

---

## Versões e imagens

Uma versão é construída e publicada apenas pelo GitHub Actions, nunca a partir da máquina de um programador:

* Uma versão é criada a partir de `main` (ou de `release/6.x`), com um registo de alterações construído a partir dos seus pull requests.
* As imagens são construídas pelo [workflow Publish](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  e enviadas para o GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, com as imagens do ambiente de execução
  ao lado. O workflow e os seus registos são públicos, pelo que qualquer pessoa pode ver o que entrou numa imagem.
* As imagens da aplicação e do ambiente de execução correm como o utilizador sem privilégios `node` (uid 1000), nunca como root.

---

## Versões suportadas

As correções de segurança entram na versão mais recente de cada linha suportada:

| Versão | Recebe correções de segurança |
|---|---|
| 7.x | Sim |
| 6.5.x | Sim |
| Anterior à 6.5 | Não: a correção é atualizar |

O [guia de atualização](../upgrading/) explica como passar para uma versão mais recente, e [Atualizar para a v7](../upgrade-7.html) a passagem a partir da 6.5.

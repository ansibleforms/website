---
layout: default
title: Instalação
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Instalação
{: .no_toc }

Escolha um método de instalação para o AnsibleForms
{: .fs-6 .fw-300 }

---

Para administradores que estão a configurar uma nova instância: escolha um método de instalação e siga a respetiva página.

---

## Nesta secção

O AnsibleForms suporta vários métodos de instalação, cada um descrito na sua própria página:

| Página | O que abrange |
|---|---|
| [Instalador](installer.html) | Um único comando que instala um controlador ou um Runner em Docker, Podman, Kubernetes ou de forma nativa, e que depois o atualiza e faz cópias de segurança |
| [Nativa](native.html) | A instalação do instalador sem contentores: Node.js, MariaDB e Ansible no servidor, AnsibleForms como serviços systemd |
| [Docker](docker.html) | Instale o MySQL e execute a imagem Docker pré-construída com as variáveis de ambiente necessárias |
| [Docker Compose](docker-compose.html) | Descarregue o [projeto docker-compose](https://github.com/ansibleforms/docker) e use o docker-compose para iniciar o MySQL e o AnsibleForms |
| [A partir do código-fonte](from-source.html) | Instale todas as dependências manualmente e depois compile e inicie o código |
| [Kubernetes](kubernetes.html) | Instale o chart de Helm e use o Kubernetes para iniciar o AnsibleForms e a sua base de dados MySQL |

{: .note }
> **Recomendação** O instalador, desde a 7.3.0, é o caminho mais rápido para uma instância a funcionar: configura o projeto Docker Compose em
> Docker ou Podman, ou um dos outros métodos, a partir de algumas perguntas. As imagens Docker incluem todas as dependências.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Para passar uma instalação existente para uma versão mais recente, consulte [Atualizar](../upgrading/).

Todos os métodos executam um RTE ao lado da aplicação, o contentor (ou serviço) que executa os playbooks. Para adicionar outro, noutro host ou noutro
centro de dados, instale um Runner com o [instalador](installer.html#a-runner): liga-se ao AnsibleForms através de um WebSocket (de saída, consulte
[Modos](../rte/modes.html)) e não guarda credenciais da base de dados. Consulte também [Ambientes de execução](../rte/) e o seu runbook
[Um RTE noutro centro de dados](../rte/another-datacenter.html).

---

## Tags da imagem

A imagem é publicada como `ghcr.io/ansibleforms/ansibleforms` no GitHub Container Registry, que pertence ao
projeto e não limita os pulls anónimos. Todas as versões a partir da 7.0.0 são publicadas apenas aí, e as versões 6.x
também lá estão.

Desde a 7, os playbooks são executados num RTE, publicado em três camadas ao lado da aplicação (consulte [As imagens do RTE](../rte/images.html)):

| Imagem | O que é |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | A aplicação web e a API, sem python nem ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | O RTE sem python nem ansible: a base para o seu próprio |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | A base com python, ansible-core e algumas bibliotecas: aquela a que adiciona as suas coleções |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | A core com o pacote `ansible`, as suas coleções e bibliotecas: o RTE predefinido |

As quatro imagens são construídas na mesma execução e têm as mesmas tags, por isso uma tag do RTE corresponde sempre à da aplicação.

O antigo repositório do Docker Hub, `ansibleguy/ansibleforms`, já não é atualizado. Mantém as versões
existentes, mas não recebe novas versões de nenhuma das linhas. Se faz pull a partir dele, mude
para `ghcr.io/ansibleforms/ansibleforms` com a mesma tag para continuar a receber atualizações.

As seguintes tags estão disponíveis em cada imagem; as imagens do RTE começam na 7.0.0, por isso não têm tags 6.x:

| Tag | Aponta para |
|---|---|
| `latest` | a versão mais recente da versão principal mais recente |
| `7`, `6` | a versão mais recente dessa versão principal |
| `7.0`, `6.5` | a versão mais recente dessa versão secundária |
| `7.0.0`, `6.5.5` | exatamente essa versão |
| `latest-rc` | a release candidate mais recente, ou a versão mais recente quando esta for mais nova; cada candidata tem também a sua própria tag |

`latest` só avança: uma correção para uma versão principal mais antiga (por exemplo uma 6.5.x lançada
depois da 7.0.0) move `6` e `6.5`, mas nunca `latest`.

Para se manter numa versão principal, use o seu número (`6`) em vez de `latest`.

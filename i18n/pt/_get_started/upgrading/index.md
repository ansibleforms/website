---
layout: default
title: Atualizar
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Atualizar
{: .no_toc }

Passe o AnsibleForms para uma versão mais recente
{: .fs-6 .fw-300 }

---

Para administradores de uma instância em execução: passe para uma versão mais recente, com o método com que a instalou.

---

## Nesta secção

O procedimento de atualização depende da forma como instalou o AnsibleForms. Cada método é descrito na sua própria página:

| Página | O que abrange |
|---|---|
| [Atualizar para a v7](../upgrade-7.html) | O que alterar enquanto ainda está na 6.5, antes de passar para a 7 |
| [Com o instalador](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, para uma instalação feita pelo instalador: cópia de segurança, notas de versão e reversão |
| [Docker](docker.html) | Obtenha a nova imagem e recrie o contentor com as mesmas definições |
| [Docker Compose](docker-compose.html) | Obtenha a nova imagem e reinicie o projeto docker-compose |
| [A partir do código-fonte](from-source.html) | Obtenha o novo código, compile-o novamente e reinicie a aplicação |
| [Kubernetes](kubernetes.html) | Atualize o repositório de charts e execute `helm upgrade` com os seus valores |

{: .note }
> **Primeiro a cópia de segurança** Faça uma cópia de segurança antes de atualizar (**Definições → Cópias de segurança**). O esquema da base de dados é atualizado no primeiro
> arranque da nova versão, por isso a cópia de segurança é o seu ponto de reversão se algo correr mal. A partir da 7.3.0 o worker também faz
> uma sozinho antes de atualizar a partir de uma versão mais antiga, com o nome da versão, a menos que
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) seja `0`.

A versão que recebe depende da tag de imagem que executa: `latest` segue a versão principal mais recente, enquanto uma tag como `7`
se mantém nessa versão principal. Todas as tags estão listadas em [Tags da imagem](../installation/#image-tags).

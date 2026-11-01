---
layout: default
title: Variáveis de ambiente
nav_order: 9
has_children: true
has_toc: false
permalink: /customization/
translated_from: e0bc1d7c5bd2df4a3f9036a2d9413a276b228156
---

# Variáveis de ambiente
{: .no_toc }

Configure o AnsibleForms com variáveis de ambiente
{: .fs-6 .fw-300 }

---

Para administradores que implementam o AnsibleForms: as variáveis de ambiente que o servidor lê, agrupadas por tema.

O AnsibleForms ajusta-se com variáveis de ambiente, quer corra com Docker Compose, no Kubernetes ou a partir do código-fonte.

---

## De onde vêm os valores

O servidor lê cada variável da primeira destas origens que a define, por isso um valor mais acima na lista ganha sempre:

1. **O ambiente do processo**: `environment:` e `env_file:` no docker-compose (o `.env` do projeto é passado desta forma),
   `env` e `envFrom` no Kubernetes, ou a shell que arranca o `node`.
2. **`persistent/.env`**, o ficheiro que as páginas de definições escrevem (`data/.env` no projeto docker-compose, outro caminho com
   `MANAGED_ENV_PATH`). É lido em cada arranque, também em produção, e nunca se sobrepõe a uma variável que já esteja definida.
3. **`server/.env.<NODE_ENV>`**, por exemplo `.env.development`. Só é lido quando `NODE_ENV` não é `production` (ou com
   `FORCE_DOTENV=1`), na prática ao correr [a partir do código-fonte](../installation/from-source.html) em modo de desenvolvimento.
4. **A predefinição integrada**, mostrada nas tabelas de cada grupo.

As páginas de definições, em **Definições > Geral**, mostram o valor em vigor e guardam as alterações em `persistent/.env`. Muitas variáveis
aplicam-se assim que são guardadas; as outras são guardadas mas precisam de um reinício, e a página lista-as depois de guardar. Uma variável definida
no ambiente do processo não pode ser alterada aí: a página mostra-a como *Definido no ambiente, por isso não pode ser alterado aqui.*
Algumas variáveis, como `ENCRYPTION_SECRET` e `ACCESS_TOKEN_SECRET`, nunca podem ser alteradas a partir da página.

As variáveis que um RTE lê, como `AF_ROLE`, `RTE_MODE`, `APP_URL` ou `RTE_MAX_JOBS`, não estão de todo nas páginas de definições: a
aplicação não as usa, por isso defina-as no ambiente onde o RTE corre. As variáveis `RTE_*` que a própria aplicação lê,
`RTE_QUEUE_MINUTES` e `RTE_FILES_MAX_MB`, são a exceção e ficam nas páginas. Quatro variáveis do RTE, `RTE_MAX_JOBS`,
`RTE_CACHE_MB`, `RTE_FILES` e `RTE_DRAIN_SECONDS`, podem em alternativa ser definidas por RTE na sua página de runner, onde um valor prevalece sobre a
variável (consulte [As definições de um RTE](../runners/runner-page.html#an-rtes-settings)).

Com [`ALLOW_ENV_EDIT`](configuration.html#env_ALLOW_ENV_EDIT)`=0`, as páginas só mostram os valores e a gravação é recusada. Use-o
quando o ambiente está declarado num manifesto, como descrito em [Edição e auditoria](../seed/environment-and-audit.html).

O [config seed](../seed/) não define variáveis de ambiente. Declara objetos que são guardados na base de dados, e as
referências `${ENV_VAR}` que contém são resolvidas a partir do ambiente do servidor em execução.

Algumas variáveis são lidas só do ambiente e não estão nas tabelas: `MANAGED_ENV_PATH` e `FORCE_DOTENV`, descritas
acima, e as variáveis de proxy do sistema `HTTPS_PROXY` e `NO_PROXY` (também lidas em minúsculas). Um RTE de saída liga-se à aplicação através de
`HTTPS_PROXY`, e um RTE de entrada envia por ele a sua chamada de registo, a menos que o host da aplicação esteja em `NO_PROXY` (nomes de host,
sufixos `.domain`, ou `*` para todos os hosts).

As variáveis marcadas como <span class="af-badge af-badge-secret">Secreto</span> contêm uma palavra-passe, um token ou uma chave: mantenha-as fora do controlo
de versões, por exemplo num Secret do Kubernetes ou num ficheiro `.env` que não é enviado para o repositório.

---

## Nesta secção

As variáveis estão agrupadas por tema, com uma página por grupo:

| Página | O que abrange |
|---|---|
{% for g in site.data.env_groups %}| [{{ g.title }}]({{ g.slug }}.html) | {{ g.lead | slice: 0 | upcase }}{{ g.lead | slice: 1, 500 }} |
{% endfor %}
{% capture other %}{% include env_vars_table.html rest=true %}{% endcapture %}
{% if other contains "<tr>" %}
---

## Outras variáveis

As variáveis seguintes ainda não estão atribuídas a nenhum grupo:

{{ other }}
{% endif %}

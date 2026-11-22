---
layout: default
title: Configuração
parent: Variáveis de ambiente
nav_order: 5
translated_from: c15df1be69f79cf42094233023cb5766d2f56452
---

# Configuração
{: .no_toc }

O config seed, onde a configuração é guardada, git e ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para decidir de onde vem a configuração: um config seed, a base de dados, git ou templates ytt.

---

## Exemplo

Aplicar um config seed montado, verificá-lo a cada cinco minutos e manter o `config.yaml` na base de dados. No `docker-compose.yml`:

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - "CONFIG_SEED_RELOAD_CRON=*/5 * * * *"
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Um seed inválido impede o servidor de arrancar. Consulte [Config seed](../seed/) para o formato do ficheiro.

---

## De onde é lido o config.yaml

As categorias, funções e constantes vêm do `config.yaml` em disco ou da sua cópia na base de dados, decidido por esta ordem:

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), quando está definida, no ambiente ou no
   separador **Configuração** da página de definições: `1` lê a base de dados, `0` lê o ficheiro.
2. Caso contrário, a origem da configuração guardada na base de dados (`file` ou `database`), que as instâncias configuradas
   antes da 6.3.0 escolheram na página de definições.
3. Caso contrário, o ficheiro em [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Desde a 7.8.0, uma chave que um repositório contém sobrepõe-se a esta base: o repositório com o tipo de utilização **Funções**, **Categorias** ou
**Constantes** dá essa chave a partir do seu ficheiro que dá `controller_roles:`, `controller_categories:` ou
`controller_constants:`, senão do seu `config.yaml` (obsoleto). Ver [Configuração em git](../repositories/config-as-code.html#roles-categories-and-constants).

Uma `ENABLE_CONFIG_IN_DATABASE` definida explicitamente ganha sempre, até `0` sobre um `database` guardado. É lida cada vez que a
configuração é carregada, por isso uma alteração aplica-se sem reiniciar. A página **Estado** mostra a origem em uso no seu separador **Informação**.

A cópia na base de dados é a coluna `config_yaml` da tabela `settings`, chamada `forms_yaml` antes da 7.6.0: a atualização muda-lhe o
nome e mantém o seu conteúdo. `GET /api/v2/settings/config` devolve-a como `config_yaml`, e também como `forms_yaml`, obsoleto.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="configuration" %}

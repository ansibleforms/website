---
layout: default
title: Configuração
parent: Variáveis de ambiente
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
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
      - CONFIG_SEED_RELOAD_SECONDS=300
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
3. Caso contrário, o ficheiro: o `config.yaml` do repositório com **Usar para a configuração** ativado, senão o de um repositório com
   **Usar para formulários** ativado, senão o que está em [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Uma `ENABLE_CONFIG_IN_DATABASE` definida explicitamente ganha sempre, até `0` sobre um `database` guardado. É lida cada vez que a
configuração é carregada, por isso uma alteração aplica-se sem reiniciar. A página **Estado** mostra a origem em uso no seu separador **Informação**.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="configuration" %}

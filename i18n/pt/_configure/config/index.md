---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Categorias, funções e constantes para todos os formulários
{: .fs-6 .fw-300 }

---

Para administradores: o ficheiro config.yaml que contém as categorias, funções e constantes partilhadas por todos os formulários.

O AnsibleForms usa um ficheiro config.yaml para configurar categorias, funções e constantes. Se não for fornecido nenhum ficheiro, é gerado um com uma configuração mínima. A configuração pode também ser importada para a base de dados, o que dispensa o ficheiro config.yaml, e cada um dos três pode ser guardado num repositório git.

---

## Visão geral

O ficheiro config.yaml contém a configuração das categorias, funções e constantes usadas pelo AnsibleForms.

**VÍDEO**: [Crie o seu primeiro formulário](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

O config.yaml mínimo seguinte serve de ponto de partida. Contém só a categoria `Default` obrigatória e as funções `admin` e `default` obrigatórias.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Prioridade de carregamento da configuração

Desde a 7.8.0, as categorias, as funções e as constantes são lidas cada uma por si, da primeira origem abaixo que a contém.

1. **DE UM REPOSITÓRIO** : o repositório com o tipo de utilização **Categorias**, **Funções** ou **Constantes**, do seu ficheiro que dá
   `controller_categories:`, `controller_roles:` ou `controller_constants:`, com qualquer nome e em qualquer pasta (ver
   [Configuração em git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **DO config.yaml DO REPOSITÓRIO** : a chave simples no `config.yaml` desse repositório, obsoleta desde a 7.8.0 e já não
   lida na 8.0; o registo do servidor, a saída do pull e a página do repositório indicam-no
3. **DA BASE DE DADOS** : a configuração importada para a base de dados, só quando `ENABLE_CONFIG_IN_DATABASE=1`, ou quando essa
   variável não está definida e a origem da configuração guardada na base de dados é `database` (uma cópia vazia recorre ao ficheiro)
4. **DO FICHEIRO LOCAL** : o ficheiro `config.yaml` local (variável de ambiente CONFIG_PATH)

{: .warning }
> **Nota:** O interruptor **Usar para a configuração** desapareceu na 7.8.0. Uma atualização dá **Funções**, **Categorias** e **Constantes** ao
> repositório que o tinha, e `use_for_config` no config seed ou na API é um alias obsoleto dos três.

---

## Nesta secção

O ficheiro tem três atributos de topo, e cada um tem a sua própria página:

| Página | O que abrange |
|---|---|
| [Categorias](categories.html) | Agrupar os formulários no painel numa árvore de categorias com ícones |
| [Funções](roles.html) | Mapear utilizadores e grupos para funções, e definir o que cada função pode fazer |
| [Constantes](constants.html) | Objetos livres que qualquer formulário pode reutilizar |

---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Categorias, funções e constantes para todos os formulários
{: .fs-6 .fw-300 }

---

Para administradores: o ficheiro config.yaml que contém as categorias, funções e constantes partilhadas por todos os formulários.

O AnsibleForms usa um ficheiro config.yaml para configurar categorias, funções e constantes. Se não for fornecido nenhum ficheiro, é gerado um com uma configuração mínima. A configuração pode também ser importada para a base de dados, o que dispensa o ficheiro config.yaml.

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

O AnsibleForms carrega o ficheiro config.yaml pela ordem seguinte (a primeira correspondência ganha):

1. **DA BASE DE DADOS** : a configuração importada para a base de dados, só quando `ENABLE_CONFIG_IN_DATABASE=1`, ou quando essa
   variável não está definida e a origem da configuração guardada na base de dados é `database` (uma cópia vazia recorre ao ficheiro)
2. **DE UM REPOSITÓRIO (use_for_config)** : o repositório com o interruptor "use for config" ativado (novo na 6.1.0)
3. **DE UM REPOSITÓRIO (use_for_forms)** : o repositório com o interruptor "use for forms" ativado (alternativa por compatibilidade com versões anteriores)
4. **DO FICHEIRO LOCAL** : o ficheiro `config.yaml` local (variável de ambiente CONFIG_PATH)

{: .warning }
> **Nota:** Ative "use for config" num só repositório. Se vários o tiverem ativado, é registado um aviso e usa-se o primeiro.

---

## Nesta secção

O ficheiro tem três atributos de topo, e cada um tem a sua própria página:

| Página | O que abrange |
|---|---|
| [Categorias](categories.html) | Agrupar os formulários no painel numa árvore de categorias com ícones |
| [Funções](roles.html) | Mapear utilizadores e grupos para funções, e definir o que cada função pode fazer |
| [Constantes](constants.html) | Objetos livres que qualquer formulário pode reutilizar |

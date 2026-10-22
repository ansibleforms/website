---
layout: default
title: Formulários
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formulários
{: .no_toc }

Definir os formulários que os seus utilizadores preenchem
{: .fs-6 .fw-300 }

---

Para autores de formulários: como se escrevem os formulários em YAML, de onde são carregados e as propriedades de cada tipo de formulário.

Os formulários são o núcleo do AnsibleForms. Cada formulário é uma interface web que recolhe dados do utilizador e, com esses dados, executa um
playbook de Ansible, um template de AWX, AAP ou Ascender, um template de Semaphore, um job de Rundeck ou Jenkins, ou um
[workflow](../workflows/).

Os formulários são definidos em ficheiros YAML na pasta de formulários. Cada ficheiro YAML contém um único formulário ou uma lista de formulários, e podem usar-se subpastas para os organizar.

**VÍDEO**: [Crie o seu primeiro formulário](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Compreender a estrutura de um formulário

Cada formulário do AnsibleForms é configurado com um conjunto de propriedades. **[Propriedades comuns](common.html)** enumera as propriedades que se aplicam a todos os tipos de formulário; as páginas de cada tipo descrevem as restantes.

---

## Como os formulários são carregados

O AnsibleForms carrega os formulários a partir das seguintes localizações:

1. **A PARTIR DE REPOSITÓRIOS** : todos os repositórios com o interruptor "Usar para formulários" ativado (são suportados vários repositórios)
   - Os formulários de todos os repositórios ativados são juntados automaticamente.
   - Em cada repositório procura-se primeiro uma subpasta `forms/`.
   - Se não existir nenhuma subpasta `forms/`, usa-se a raiz do repositório.
   - Os formulários criados no designer e ainda não enviados (push) são mantidos numa pasta de preparação
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) e carregados juntamente com eles.

2. **A PARTIR DA PASTA LOCAL** : a pasta local `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), quando nenhum repositório tem "Usar para formulários" ativado

{: .warning }
> **Nota:** Quando "Usar para formulários" está ativado em vários repositórios, todos os seus formulários são juntados. Os nomes dos formulários têm de ser únicos entre repositórios para evitar conflitos.

---

## Onde um formulário é executado

O tipo de um formulário decide o tipo de [runner](../runners.html) em que a sua tarefa é executada: um RTE para `ansible`, um runner AWX para `awx`,
`aap` e `ascender`, e um runner do seu próprio tipo para `semaphore`, `rundeck` e `jenkins`.

- `runner: <name>` no formulário escolhe um runner desse tipo pelo nome; sem ele, a tarefa é executada no runner predefinido do tipo.
- Um runner desativado em **Ligações > Runners** faz falhar a tarefa, quer o formulário o indique, quer seja o predefinido. A tarefa
  nunca recorre a outro runner.
- Quando uma das funções do utilizador enumera `runners` no `config.yaml`, a tarefa só pode ser executada num runner que essa função enumere, caso contrário é
  recusada. As funções sem essa lista não a limitam, e um administrador nunca é limitado.

---

## Nesta secção

As páginas seguintes descrevem em detalhe as propriedades dos formulários:

| Página | O que abrange |
|---|---|
| [Propriedades comuns](common.html) | Propriedades que se aplicam a todos os tipos de formulário (`name`, `description`, `help`, `type`, `fields`) |
| [Formulários de Ansible](ansible.html) | Propriedades específicas de `type: ansible` |
| [Formulários de AWX](awx.html) | Propriedades específicas de `type: awx` |
| [Formulários de Semaphore](semaphore.html) | Propriedades específicas de `type: semaphore`, que executa um template de Semaphore |
| [Formulários de Rundeck](rundeck.html) | Propriedades específicas de `type: rundeck`, que executa um job de Rundeck |
| [Formulários de Jenkins](jenkins.html) | Propriedades específicas de `type: jenkins`, que executa um build de um job de Jenkins |
| [Formulários de vários passos](multistep.html) | Propriedades específicas de `type: multistep`, obsoleto em favor de `workflow` |
| [Formulários de workflow](workflow.html) | Propriedades específicas de `type: workflow`, que executa um [workflow](../workflows/) |
| [Assistente](wizard.html) | Dividir os dados de um formulário por várias páginas (funciona sobre qualquer tipo de formulário executável) |
| [Subform](subform.html) | Os subformulários só usam as propriedades comuns |
| [Pontos de aprovação](approval.html) | Colocar uma tarefa em pausa até ser aprovada (`approval`) |
| [Notificações](notifications.html) | Enviar emails e mensagens para canais conforme o estado ou os eventos da tarefa (`notifications`) |
| [Ações conforme o estado da tarefa](job-status-action.html) | Atuar sobre o formulário quando uma tarefa muda de estado (`onSubmit`, `onSuccess`, ...) |

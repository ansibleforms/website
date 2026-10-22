---
layout: default
title: Ativá-la
parent: Validação no lançamento
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Ativá-la
{: .no_toc }

Para toda a instância, ou para um formulário
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

A validação no lançamento tem duas definições. **Aplica-se a mais rigorosa das duas.**

---

## Para toda a instância: `LAUNCH_VALIDATION`

A variável de ambiente [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) aplica-se a todos os formulários:

- `off` - sem verificação no servidor: a tarefa é executada com as extravars que o navegador ou quem chama enviou.
- `log` - cada lançamento é verificado; o que seria recusado é escrito no registo como
  aviso, e o lançamento continua a ser executado como antes.
- `enforce` (predefinição) - um lançamento inválido é recusado, e um válido é executado com as extravars que o
  servidor constrói.

Um valor vazio ou desconhecido também equivale a `enforce`. As alterações têm efeito sem reiniciar.

{: .warning }
> **A atualização muda o comportamento.** Uma instância que não define `LAUNCH_VALIDATION` impõe
> a validação a todos os lançamentos depois da atualização. Os scripts que chamam `POST /api/v2/job` sem `rawFormData`,
> ou com valores que violam as regras de um formulário, são recusados com um `422`. Defina
> `LAUNCH_VALIDATION=log` antes de atualizar para ver o que seria recusado, ou `off` para manter o
> comportamento antigo (ver [Implementação gradual](rolling-it-out.html)).

---

## Para um formulário: `launchValidation`

Um formulário pode definir o seu próprio nível:

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Use esta definição numa instância que funciona com `off` ou `log`, para um formulário que sabe que vai ser
lançado por REST: esse formulário fica sob enforce, enquanto o resto da instância não. Também pode ser definida no designer, nas
definições do formulário.

**Um formulário pode ser tornado mais rigoroso do que a instância, nunca mais permissivo.** Com `LAUNCH_VALIDATION`
em `enforce`, o `launchValidation: off` de um formulário não tem efeito: um formulário não pode sobrepor-se
à decisão de um operador.

Os formulários com assistente também a usam: o lançamento de um assistente é verificado passo a passo, cada passo com o seu próprio
subformulário (ver [Formulários com assistente](rolling-it-out.html#wizard-forms)).

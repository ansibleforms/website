---
layout: default
title: Conceitos
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Conceitos
{: .no_toc }

Os termos usados ao longo desta documentação, cada um com ligação para a sua página
{: .fs-6 .fw-300 }

---

## Glossário

Os termos usados ao longo desta documentação:

| Termo | Significado |
|---|---|
| **[Formulário](forms/)** | Uma definição YAML que recolhe dados e executa um playbook, um template ou um workflow |
| **[Campo de formulário](formfields/)** | Uma entrada de um formulário, como `text`, `enum` ou `checkbox`; o seu valor torna-se uma extravar |
| **[Categoria](config/categories.html)** | Um grupo na árvore de formulários mostrada na página Formulários, definido em `config.yaml` |
| **[Função](config/roles.html)** | Um conjunto de utilizadores e grupos; um formulário lista as funções que o podem ver e executar, `default` para toda a gente |
| **[Expressão](expressions/)** | JavaScript que calcula o valor de um campo, no navegador (`runLocal: true`) ou no servidor |
| **[Extravars](formfields/)** | As variáveis enviadas ao playbook ou ao template, construídas a partir dos valores dos campos |
| **[Credencial](expressions/credentials.html)** | Um início de sessão guardado, cifrado com `ENCRYPTION_SECRET`: um utilizador e uma palavra-passe (e host, porta, base de dados), ou desde a 7.3.0 o endereço e os segredos de um diretório LDAP, de um fornecedor de SSO, de um runner ou de um HashiCorp Vault |
| **[Cofre de segredos](secret-stores/)** | Uma ligação ao HashiCorp Vault ou ao CyberArk que fornece o utilizador e a palavra-passe de uma credencial |
| **[Tarefa](gui/forms-and-jobs.html)** | Uma execução de um formulário, com o seu estado, extravars e saída, guardada no histórico de tarefas |
| **[Runner](runners.html)** | Onde uma tarefa é executada, adicionado em **Ligações > Runners**: `rte` para playbooks, `awx` (AWX, ou as variantes `aap` ou `ascender`), `semaphore`, `rundeck` ou `jenkins` para templates e jobs. Um formulário escolhe um com `runner:`, ou é executado no runner predefinido `rte` (playbooks) ou `awx` (templates) |
| **[RTE](rte/)** | Um ambiente de execução: o servidor AnsibleForms iniciado com `AF_ROLE=rte` no seu próprio contentor, ao lado de python e ansible, que executa os playbooks de um runner do tipo `rte` |
| **[Ponto de aprovação](forms/approval.html)** | Uma pausa numa tarefa até que um utilizador com uma função de aprovação a aprove ou rejeite |
| **[Workflow](workflows/)** | Um grafo de playbooks, aprovações e outros workflows ligados em caso de sucesso, de falha ou sempre, com a sintaxe do AWX |
| **[Formulário multistep](forms/multistep.html)** | Descontinuado desde a 7: um formulário que executa vários playbooks ou templates em sequência; um workflow substitui-o |
| **[Canal de notificação](notification-channels.html)** | Um servidor de email, um webhook do Slack ou do Teams, um chat do Telegram ou um webhook para onde vão as notificações e os pedidos de aprovação |
| **[Designer](designer/)** | O editor no navegador para formulários, playbooks, inventários e workflows, usado por uma pessoa de cada vez |
| **[Subform](forms/subform.html)** | Um conjunto reutilizável de campos que descreve as linhas de um campo `list` ou o objeto de um campo `yaml` |
| **[config.yaml](config/)** | O ficheiro com as categorias, as funções e as constantes; os formulários vivem nos seus próprios ficheiros |
| **[Config seed](seed/)** | Um ficheiro YAML (`CONFIG_SEED_PATH`) que declara os objetos de administração, como runners e credenciais |
| **[Pasta persistente](customization/paths.html)** | A pasta que contém os ficheiros que o AnsibleForms tem de manter entre reinícios e atualizações |

---
layout: default
title: Usar canais num formulário
parent: Canais de notificação
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Usar canais num formulário
{: .no_toc }

Nomear canais nas notificações e aprovações
{: .fs-6 .fw-300 }

Os formulários nomeiam os canais pelo seu nome, em `notifications` para o estado e os eventos da tarefa, e em `approval`:

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- Os canais de chat e de webhook recebem uma mensagem curta (o formulário, a tarefa, o que aconteceu) com uma ligação para a tarefa; numa
  aprovação, a página da tarefa é onde ela é aprovada ou rejeitada.
- Um canal de **email** na lista envia o email habitual para `recipients` (os endereços de `notifications` de uma aprovação) através
  desse servidor em vez do predefinido.
- Um nome que não existe, ou um canal de chat ou de webhook que está desligado, é ignorado e isso fica no registo.
- Um canal de **email** que está desligado não é ignorado: o email segue em vez disso pelo canal de email predefinido, e o
  registo indica-o.

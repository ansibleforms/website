---
layout: default
title: Recarregamento e arranque
parent: Config seed
nav_order: 3
translated_from: c3925e2d8707d37ed572380de4f675615ca31a05
---

# Recarregamento e arranque
{: .no_toc }

Alterar o ficheiro sem reiniciar, e o que acontece no arranque
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Alterar o ficheiro sem reiniciar

O processo do sistema **Recarga do config seed** lê o seed de novo a cada minuto, e aplica-o de novo quando o seu conteúdo mudou. Uma alteração enviada para o git chega assim
automaticamente a uma instância em execução: no Kubernetes, um `ConfigMap` é montado de novo no pod em
cerca de um minuto, e a verificação seguinte apanha-o. Não há rollout nem reinício, e nenhum
hook precisa de chamar nada.

Para um ficheiro inalterado, a verificação calcula um hash e para, por isso nunca reescreve uma linha que já
aplicou.

Desde a 7.8.0 a verificação corre num cron, [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON)
(`* * * * *` por predefinição), que um administrador também altera na página do processo em **Tarefas > Sistema** (ver
[Processos do sistema](../jobs/system-tasks.html)). Substitui `CONFIG_SEED_RELOAD_SECONDS`, obsoleta e ainda lida enquanto o cron não
estiver definido: o seu `0` continua a desativar a recarga.

Para aplicar o ficheiro de imediato em vez de esperar pela verificação seguinte, use uma destas formas:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Ambas **forçam** uma aplicação mesmo quando o ficheiro não mudou. Uma aplicação forçada volta a impor um
registo gerido que foi editado diretamente na base de dados, e volta a clonar um repositório declarado
cuja working tree falta.

{: .note }
> Um recarregamento **nunca é fatal**, ao contrário da aplicação no arranque. Uma instância que já está
> a servir mantém a sua configuração atual, o motivo é registado, e a linha *Config seed*
> da página Estado fica vermelha e indica-o. Um erro de escrita enviado para o git não pode deitar
> abaixo uma instância em execução sem nenhuma ação de um operador.
>
> O mesmo conteúdo com erros também não é tentado de novo em cada verificação; caso contrário, uma edição errada
> escreveria o mesmo erro no registo indefinidamente. Corrija o ficheiro, ou chame o endpoint para tentar de novo
> de imediato.

---

## Um seed com erros recusa-se a arrancar

Um ficheiro ilegível, YAML inválido, um campo desconhecido, um nome duplicado ou uma
`${VARIABLE}` por resolver fazem o servidor **sair** em vez de arrancar. Isto vale só para o caminho do
**arranque**: consulte a nota acima para o que o mesmo ficheiro faz a uma instância que já está a correr.

É intencional. Continuar com a configuração anterior deixaria uma instância cujo
comportamento já não corresponde ao manifesto que supostamente a descreve, sem nada
a assinalar a diferença. O motivo é escrito no erro padrão e também no ficheiro de registo, por isso
`kubectl logs` e `docker logs` mostram-no.

A validação é estrita: os campos desconhecidos são rejeitados em vez de ignorados, e o erro indica
a chave em causa:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Uma base de dados vazia aprovisiona-se sozinha

Com `ALLOW_SCHEMA_CREATION` ligada (a predefinição), uma base de dados que não contém **nenhuma tabela
do AnsibleForms** recebe o seu esquema criado no arranque. Uma implementação nova arranca assim
sem que ninguém tenha de chamar o endpoint `/schema` manualmente.

A condição prévia é estrita de propósito: criar o esquema **elimina primeiro todas as tabelas**, por isso
só corre contra uma base de dados completamente vazia. Uma base de dados a que falta
uma coluna, ou que tem tabelas mas nenhuma conta de utilizador, *não* está vazia e fica intacta;
os patches do esquema tratam desses casos.

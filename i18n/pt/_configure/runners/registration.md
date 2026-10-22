---
layout: default
title: Registo
parent: Runners
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Registo
{: .no_toc }

Como um RTE pede para aderir e é aprovado, join tokens para instalações sem intervenção, e o modo base de dados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pedir para aderir

Desde a 7.3.0, um RTE num modo socket (`outbound` ou `inbound`) que a aplicação ainda não conhece pede para aderir, e um admin aprova-o.
Contacta a aplicação com o seu próprio `RTE_TOKEN` e o seu `RTE_NAME`: um RTE de saída quando se liga à aplicação pela primeira vez, um de entrada na sua única
chamada de registo. Sem join token, a aplicação então:

1. Guarda o `RTE_TOKEN` do RTE numa nova credencial do tipo RTE chamada `<name>-rte` (com um número acrescentado quando esse nome está ocupado), e
   para um RTE de entrada o seu endereço, `RTE_URL`
2. Adiciona um runner com o nome de `RTE_NAME`, tipo RTE, no modo do RTE, que inicia sessão com essa credencial, marcado como **A aguardar aprovação**
   e desativado. A sua descrição indica o host de onde fez o pedido

Um RTE de saída fica ligado enquanto espera, mas não recebe nenhuma tarefa. A aplicação não se liga a um de entrada até ele ser aprovado. Ambos registam
que esperam que um admin os aprove em **Ligações > Runners**, com a impressão digital do seu token.

Um RTE de entrada com um `RTE_URL` `https://` envia também o seu certificado quando pede para aderir, e a aplicação fixa-o: a partir daí a
aplicação só se liga a esse RTE quando ele apresenta o mesmo certificado, por isso um autoassinado funciona sem CA (consulte [Entrada](../rte/modes.html#inbound)).

No máximo 20 RTE aguardam aprovação ao mesmo tempo: os seguintes são recusados até alguns serem aprovados ou rejeitados. Um pedido que ninguém trate em
24 horas é removido pelo worker, com a sua credencial.

Um RTE com o nome de um runner que a aplicação já conhece, mas com outro token, é recusado e não pede para aderir. Dê-lhe o token desse runner,
ou elimine o runner para que ele peça para aderir. Um [join token](#join-tokens) só ajuda enquanto esse runner ainda aguarda aprovação.

---

## Aprovar um RTE

Os runners a aguardar aprovação saem da lista de **Ligações > Runners** para um aviso laranja acima dela, como
**2 Runners aguardam aprovação**, com uma linha por runner: o seu nome, host, endereço IP, modo, endereço e impressão digital.
O sino do cabeçalho conta-os, para os utilizadores que podem ver os runners (consulte [o sino](../jobs/#the-jobs-page)).

Um clique no aviso abre a caixa de diálogo **Rever aprovação** para cada runner, um após o outro; um clique num nome abre só esse.
A sua página mostra os mesmos factos numa caixa amarela, **Este RTE pediu para aderir**. Verifique que é um que você arrancou antes de o aprovar:

| Campo | O que mostra |
|---|---|
| Impressão digital | Os primeiros 8 dígitos hexadecimais do SHA-256 do seu `RTE_TOKEN`, como `abcd-ef12`. O RTE regista-a no seu arranque, e o [instalador](../installation/installer.html#a-runner) mostra-a no fim. Tem de ser a mesma |
| Impressão digital do certificado | Na caixa de diálogo, para um RTE de entrada por HTTPS: os primeiros 8 dígitos hexadecimais do SHA-256 do certificado que a aplicação fixa (os seus bytes DER), como `abcd-ef12`. O RTE regista-a no seu arranque e o [instalador](../installation/installer.html#a-runner) mostra-a no fim. Tem de ser a mesma |
| Host | O host onde corre |
| Endereço IP | O endereço a partir do qual contactou a aplicação |
| Modo | Saída ou Entrada |
| Uri | O endereço de um RTE de entrada, onde a aplicação se liga a ele |
| Versão | A sua versão |
| Pedido em | Quando pediu para aderir |

**Aprovar** e **Rejeitar**, na caixa de diálogo ou na caixa da sua página, decidem:

| Ação | O que acontece |
|---|---|
| Aprovar | O runner é ativado e recebe tarefas a partir de agora. Torna-se o predefinido do seu tipo quando não há nenhum |
| Rejeitar | O runner é removido com a sua credencial, e o seu socket é fechado. O RTE pode pedir para aderir de novo; fica então outra vez a aguardar aprovação |

Só um admin aprova ou rejeita um RTE.

---

## Join tokens

Um join token aprova um RTE de imediato, para instalações sem intervenção: um RTE arrancado com
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), ou um Runner instalado com o `--join` do instalador, apresenta-o uma vez
e o seu runner é adicionado já ativado, sem esperar. Os join tokens não têm página na interface: um admin cria-os através da
[API REST](../api/), em `/api/v2/runner`:

| Chamada | O que faz |
|---|---|
| `POST /api/v2/runner/jointoken` | Cria um join token. O corpo contém o seu `name`, e opcionalmente `expiresInHours` (nenhum: nunca expira) e `maxUses` (nenhum: qualquer número de RTE) |
| `GET /api/v2/runner/jointoken` | Lista os join tokens, os mais recentes primeiro, com as suas utilizações e se ainda podem ser usados; nunca os próprios tokens |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Revoga-o: deixa de adicionar runners, e continua na lista |
| `DELETE /api/v2/runner/jointoken/<id>` | Elimina-o |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

A resposta contém o token, que começa por `afj_`, só desta vez: só o seu SHA-256 é guardado. Um RTE que o apresenta recebe a mesma
credencial e o mesmo runner que um que [pede para aderir](#asking-to-join), já ativado, e a sua descrição nomeia o join token. A partir daí o
RTE inicia sessão com o seu próprio token, por isso o join token pode expirar ou ser revogado sem o afetar. Revogar ou eliminar um join token
mantém os runners que adicionou.

Um join token nunca dá um token novo a um runner aprovado. Quando já existe um runner RTE com esse nome:

| O runner | O que acontece |
|---|---|
| Aguarda aprovação | Recebe o token novo na sua credencial, e continua a aguardar a aprovação de um admin |
| Está aprovado | Recusado com `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. O join token não é consumido |
| Vem do [config seed](../seed/) | Recusado: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Um RTE instalado de novo com um token novo inicia portanto sessão com o token da credencial do seu runner, ou um admin altera esse token
em **Ligações > Credenciais**, ou elimina o runner para que o RTE adira como novo.

---

## Registo em modo base de dados

Um RTE em modo base de dados, obsoleto desde a 7.3.0, regista-se a si próprio por predefinição, no seu `RTE_URL` ou então no seu próprio endereço e porta. O
worker remove um runner destes quando o seu RTE não escreveu nenhum heartbeat durante 10 minutos. Um runner adicionado à mão, pelo config seed ou por um
RTE num modo socket nunca é removido dessa forma.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), que liga ou desliga este registo, está obsoleta na 7.3.0 com o
modo base de dados: um RTE num modo socket pede para aderir, ou adere com um join token. Para gerir esses runners você mesmo entretanto, arranque o
RTE com `RTE_REGISTER=0` e adicione-o aqui com tipo RTE, modo **Base de dados (obsoleto)**, e uma credencial RTE com o seu endereço e o
mesmo token. Para o passar para um modo socket, consulte [Modos](../rte/modes.html#database-deprecated).

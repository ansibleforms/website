---
layout: default
title: Registar e impor
parent: Validação no lançamento
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Registar e impor
{: .no_toc }

O que cada modo faz com um lançamento que viola as regras
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O que faz `log`

Cada lançamento é verificado, mas para o utilizador nada muda. É escrito um aviso no registo quando:

- o lançamento **seria recusado**, com o motivo (só nomes de campos e tipos de regras, nunca
  valores):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- as extravars que o cliente enviou **diferem** das que o servidor constrói, com as
  chaves de primeiro nível que diferem:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Execute primeiro `log` durante algum tempo numa instância real. Mostra que formulários seriam recusados e
quais calculam valores de forma diferente no servidor, antes de alguém ser afetado.

---

## O que faz `enforce`

Com `enforce`, um lançamento inválido é recusado, e um válido é executado com as extravars que o servidor
constrói.

### Um lançamento que viola as regras é recusado

`POST /api/v2/job` responde `422` com os campos que falham:

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing` - campos obrigatórios sem valor;
- `invalid` - campos que violam uma regra, escolhas que não são uma das opções, e campos
  list com uma linha que falha;
- `waiting` - campos que não puderam ser avaliados (um campo de que precisam nunca recebeu valor);
- `validationErrors` - por campo, cada regra que falha com a mensagem que o navegador mostra;
- `rowErrors` - por campo list, as linhas que falham (ver [Linhas de listas](list-rows-and-subforms.html));
- `uploads` - campos de ficheiro cujo carregamento não pôde ser verificado.

Um lançamento **sem `rawFormData`** também é recusado: os seus valores não podem ser verificados.

### Um lançamento válido é executado com as extravars do servidor

A tarefa não é executada com as extravars que o cliente enviou. O servidor constrói-as a partir dos valores
verificados, com o mesmo código do navegador, e executa essas. Quem chama e envia `rawFormData` válido
juntamente com `extravars` diferentes recebe as extravars que correspondem aos valores, não
as que enviou.

Do pedido, o servidor mantém `__verbose__` (só para utilizadores autorizados a usar o modo verbose). As
chaves reservadas (`__playbook__`, `__inventory__`, ...) vêm do formulário, como sempre, e
`ansibleforms_user` é o utilizador que lança.

### O que o utilizador viu nem sempre é o que é executado

Construir as extravars significa avaliar de novo o formulário: cada expressão e cada consulta é executada
mais uma vez no servidor, um momento depois de o navegador a ter executado, como o utilizador que lança. Um valor
que dependa de **quando** ou **onde** é avaliado pode diferir e, nesse caso, usa-se o
valor do servidor:

| O quê | Porque pode diferir | Em que medida |
|---|---|---|
| `fn.fnTime()`, um carimbo temporal, um nome construído a partir da hora | avaliado de novo, alguns segundos depois | só importa na fronteira de um segundo ou de uma data. `fnTime` também já é executado no servidor no fluxo do navegador, com o mesmo fuso horário (o `TZ` do contentor) |
| uma consulta, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, a leitura de um ficheiro | os dados externos mudaram entretanto | só quando mudaram |
| uma expressão `runLocal` que use `new Date()`, `toLocaleString`, `Intl` | o navegador usa o fuso horário e o idioma do utilizador, o servidor os seus | só essas expressões |

O mesmo se aplica à **validação**: uma regra que lê um desses campos (`notIn` contra o resultado de uma
consulta, `validIf` sobre um indicador calculado) é verificada com o valor do servidor. Os formulários cujas
extravars diferem aparecem nos avisos de `log` descritos acima; reveja-os antes de impor.

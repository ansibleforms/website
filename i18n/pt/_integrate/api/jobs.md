---
layout: default
title: Tarefas
parent: API REST
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Tarefas
{: .no_toc }

Lance um formulário, acompanhe a tarefa, aborte-a, relance-a ou aprove-a
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Uma tarefa é uma execução de um formulário. Lance-a com o nome e os valores do formulário, e depois acompanhe-a pelo seu ID.

---

## Lance um formulário

Envie o nome do formulário e os seus valores para `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

O pedido aceita estas propriedades:

| Propriedade | Significado |
|---|---|
| `formName` | O nome do formulário a lançar. Obrigatório. |
| `extravars` | As variáveis extra da tarefa. `payload` é aceite como outro nome para ela. |
| `rawFormData` | Os valores dos campos do formulário, tal como o navegador os guarda. A [validação do lançamento](../launch-validation/) verifica-os e constrói as extravars a partir deles. |
| `credentials` | Credenciais a passar à tarefa, pelo nome. |
| `files` | Os carregamentos dos campos de ficheiro do formulário (consulte [Carregamento de ficheiros](../launch-validation/file-uploads.html)). |

A resposta contém o ID da nova tarefa:

```json
{ "id": 42 }
```

Para executar a tarefa em modo detalhado, adicione `"__verbose__": true` às extravars. Precisa da opção de função `allowVerboseMode`,
caso contrário o lançamento responde `403`.

---

## Carregue um ficheiro

Um formulário com um campo de ficheiro precisa que o ficheiro seja carregado primeiro. Envie-o como a parte multipart `file` para `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

A resposta descreve o carregamento guardado:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Passe-o sem alterações nos `files` do lançamento, com o nome do campo de ficheiro: `"files": { "firmware": { ... } }`. O servidor
verifica-o contra o seu próprio disco (consulte [Carregamento de ficheiros](../launch-validation/file-uploads.html)).

---

## Acompanhe a tarefa

Leia a tarefa pelo seu ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

A tarefa contém o seu `status`, as suas `extravars` (também como `payload`, o mesmo objeto), os seus `subjobs` e o seu `output`. A
saída é HTML com as cores da página da tarefa; adicione `?text=true` para texto simples, mais adequado a um script ou a um registo:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

O seu `status` é `running` enquanto está em execução, e `approve` enquanto aguarda uma aprovação. Uma tarefa termina com um destes:

| Estado | Significado |
|---|---|
| `success` | A tarefa terminou sem erros |
| `failed` | A tarefa falhou |
| `warning` | Uma tarefa multistep terminou, mas um passo com `continue` definido falhou pelo caminho |
| `aborted` | A tarefa foi abortada |
| `rejected` | A aprovação foi recusada, por isso o que estava à espera dela não foi executado |
| `abandoned` | O processo que acompanhava a tarefa parou (um reinício, um contentor substituído) e a tarefa foi abandonada |

Uma tarefa em execução num runner quando foi abandonada pode ainda terminar com o seu resultado real, se esse runner acabar por a concluir.

---

## Encontre tarefas

`GET /api/v2/job` lista primeiro as tarefas mais recentes, como `{ "count": ..., "records": [ ... ] }`. Estes parâmetros de consulta restringem a lista:

| Parâmetro | Significado |
|---|---|
| `records` | Quantas tarefas, no máximo. A predefinição é [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), e 5000 no máximo, a menos que `JOBS_LIST_SIZE` seja maior. |
| `user`, `user_type` | Apenas as tarefas deste utilizador. `user_type` é `local` quando omitido (`ldap`, `azuread`, `oidc` para os outros). |
| `runner` | Apenas as tarefas executadas neste runner |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Um utilizador vê as suas próprias tarefas e as tarefas que aguardam uma aprovação que uma das suas funções pode dar. Um administrador, ou uma função com a
opção `showAllJobLogs` ou `manageAllJobs`, vê todas as tarefas. Um registo contém o resumo da tarefa (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); leia
a própria tarefa para obter as suas extravars e a sua saída.

`GET /api/v2/job/approvals` responde com um número: quantas tarefas aguardam uma aprovação que o utilizador pode dar.

---

## Mais sobre uma tarefa

Estes endpoints leem mais informação de uma tarefa:

| Chamada | O que devolve |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | Os valores dos campos com que a tarefa foi lançada, tal como o formulário os guardava. Aplicam-se as mesmas permissões que num relançamento: a sua própria tarefa (ou todas as tarefas para um administrador ou uma função com `manageAllJobs`), um formulário que permita o relançamento, e a opção de função `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Os eventos estruturados de uma tarefa de playbook (a partir da 7.3.0, para um playbook num RTE da 7.3.0 ou posterior): cada play, tarefa, resultado por host e o recap, com o seu `order`, `type`, `play`, `task`, `host`, `duration` e `time` |
| `GET /api/v2/job/{id}/events/{order}` | Um desses eventos com o seu `result` completo, tal como a janela **Resultado da tarefa** o mostra; `400` quando `order` não é um número inteiro, `404` quando a tarefa não tem esse evento |
| `GET /api/v2/job/{id}/node/{nodeId}` | Um nó de uma tarefa de workflow: `{ "node", "job", "extravars", "artifacts" }`, em que `job` é o ID da tarefa própria do nó, ou `null` quando o nó não foi executado. |

---

## Outras ações

Estes endpoints atuam sobre uma tarefa existente:

| Chamada | Ação |
|---|---|
| `POST /api/v2/job/{id}/abort` | Abortar uma tarefa em execução |
| `POST /api/v2/job/{id}/relaunch` | Relançar uma tarefa, tal como foi executada ou com alterações (consulte [Relançar](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Aprovar uma tarefa que aguarda aprovação; a sua própria tarefa responde `403`, a menos que a sua aprovação defina `allowSelf: true` ou que seja administrador |
| `POST /api/v2/job/{id}/reject` | Rejeitar uma tarefa que aguarda aprovação |
| `GET /api/v2/job/{id}/download` | Descarregar a saída da tarefa |
| `DELETE /api/v2/job/{id}` | Eliminar uma tarefa |

Abortar, aprovar, rejeitar e eliminar respondem com uma mensagem, e um relançamento também com o ID da nova tarefa:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Adicione `?verbose=true` a um relançamento para executar a nova tarefa em modo detalhado, com a opção de função `allowVerboseMode`. Uma tarefa que
esteja no estado errado para a ação, por exemplo abortar uma tarefa que já terminou, responde `409`.

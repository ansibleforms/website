---
layout: default
title: Fornecedores
parent: Assistente de chat
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Fornecedores
{: .no_toc }

O modelo de linguagem por trás do assistente, e proxies
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Selecione o fornecedor na página de definições. Isto preenche o URL base, a autenticação e
a versão da API, que continuam todos editáveis. Os campos vazios usam as predefinições do fornecedor.

| Fornecedor | Protocolo | URL base (predefinido) | Chave enviada como |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | obrigatório: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, versão da API `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | nenhuma |
| **Outro compatível com OpenAI** (LiteLLM, um gateway, vLLM, LM Studio, ...) | OpenAI | obrigatório, normalmente a terminar em `/v1` | Bearer |

O ID do modelo é o que o fornecedor ou o proxy usa (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). O assistente exige um modelo que suporte **chamada de ferramentas**; o suporte varia entre
os modelos locais pequenos.

Para servidores locais e proxies que não precisam de chave, basta um URL base; não é enviado nenhum cabeçalho de autorização.

---

## A chave de API

A chave vem de uma credencial, por isso é guardada e rodada como qualquer outro segredo:

* Crie uma credencial do tipo **api** em **Definições > Ligações > Credenciais** (consulte [Credenciais](../credentials.html)),
  com a chave como palavra-passe. Também pode ler a chave a partir de um [cofre de segredos](../secret-stores/).
* Escolha-a no campo **Credencial** das definições do chat. A chave é lida em cada mensagem, por isso uma
  palavra-passe alterada aplica-se à mensagem seguinte.

Uma chave guardada na página de definições antes de existirem credenciais continua a funcionar enquanto não for escolhida nenhuma credencial. O
[config seed](../seed/) define a própria chave, como `api_key`.

---

## Para um proxy

Um proxy ou gateway à frente do modelo pode precisar destas definições:

- **Autenticação** - como a chave é enviada: `Authorization: Bearer`, `api-key`, `x-api-key`,
  ou nenhuma. Vazio usa a predefinição do fornecedor.
- **Versão da API** - o cabeçalho `anthropic-version`, ou `?api-version=` no URL para compatível com OpenAI (Azure).
- **Utilizador** - enviado em cada chamada como `user` (compatível com OpenAI) ou `metadata.user_id`
  (Anthropic). Alguns proxies exigem-no. Vazio não envia nada.
- **Ignorar erros de certificado** - inseguro; em vez disso, confie na CA do proxy com `NODE_EXTRA_CA_CERTS`.
- **Cabeçalhos extra** - um objeto JSON, p. ex. `{"X-Org": "ops"}`. Valores de texto de uma linha, no máximo 20;
  os cabeçalhos da chave e do conteúdo não podem ser substituídos.

---

## Num contentor, por trás de um proxy

O chat usa HTTPS de saída simples a partir do contentor do servidor AnsibleForms. Por trás de um
proxy de saída empresarial, defina `HTTPS_PROXY` **e** `NODE_USE_ENV_PROXY=1`; sem a segunda,
o cliente HTTP incorporado do Node ignora `HTTPS_PROXY`. Um fornecedor com um certificado de uma
CA interna exige que o Node confie nessa CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Com `NODE_USE_ENV_PROXY=1`, um modelo ou proxy dentro da rede tem de constar em
`NO_PROXY`, caso contrário a chamada vai para o proxy de saída, que não o consegue alcançar.

Um teste de ligação falhado indica o host e o motivo (DNS, ligação recusada ou certificado não fidedigno).

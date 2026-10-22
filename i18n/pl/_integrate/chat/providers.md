---
layout: default
title: Dostawcy
parent: Asystent czatu
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Dostawcy
{: .no_toc }

Model językowy stojący za asystentem oraz proxy
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Wybierz dostawcę na stronie ustawień. Wypełnia to bazowy adres URL, uwierzytelnianie i
wersję API, a wszystkie te pola można dalej edytować. Puste pola przyjmują wartości domyślne dostawcy.

| Dostawca | Protokół | Bazowy adres URL (domyślny) | Klucz wysyłany jako |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | wymagany: `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, wersja API `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | brak |
| **Inny zgodny z OpenAI** (LiteLLM, brama, vLLM, LM Studio, ...) | OpenAI | wymagany, zwykle zakończony na `/v1` | Bearer |

ID modelu to identyfikator, którego używa dostawca lub proxy (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). Asystent wymaga modelu, który obsługuje **wywoływanie narzędzi** (tool calling); wśród
małych modeli lokalnych obsługa bywa różna.

Dla serwerów lokalnych i proxy, które nie wymagają klucza, wystarczy sam bazowy adres URL; nagłówek autoryzacji nie jest wtedy wysyłany.

---

## Klucz API

Klucz pochodzi z poświadczenia, więc jest przechowywany i rotowany jak każdy inny sekret:

* Utwórz poświadczenie typu **api** w **Ustawienia > Połączenia > Poświadczenia** (zobacz [Poświadczenia](../credentials.html)),
  z kluczem jako hasłem. Może ono też odczytywać klucz z [magazynu sekretów](../secret-stores/).
* Wybierz je w polu **Poświadczenie** w ustawieniach czatu. Klucz jest odczytywany przy każdej wiadomości, więc
  zmienione hasło obowiązuje od następnej wiadomości.

Klucz zapisany na stronie ustawień, zanim pojawiły się poświadczenia, nadal działa, dopóki nie wybrano żadnego poświadczenia.
[Config seed](../seed/) ustawia sam klucz, jako `api_key`.

---

## Dla proxy

Proxy lub brama przed modelem może wymagać tych ustawień:

- **Uwierzytelnianie** - sposób wysyłania klucza: `Authorization: Bearer`, `api-key`, `x-api-key`
  albo brak. Puste oznacza wartość domyślną dostawcy.
- **Wersja API** - nagłówek `anthropic-version` albo `?api-version=` w adresie URL dla dostawców zgodnych z OpenAI (Azure).
- **Użytkownik** - wysyłany przy każdym wywołaniu jako `user` (zgodne z OpenAI) lub `metadata.user_id`
  (Anthropic). Niektóre proxy go wymagają. Puste nic nie wysyła.
- **Ignoruj błędy certyfikatów** - niebezpieczne; zamiast tego zaufaj CA proxy przez `NODE_EXTRA_CA_CERTS`.
- **Dodatkowe nagłówki** - obiekt JSON, np. `{"X-Org": "ops"}`. Jednowierszowe wartości tekstowe, najwyżej 20;
  nagłówków klucza i treści nie można zastąpić.

---

## W kontenerze, za proxy

Czat używa zwykłego wychodzącego HTTPS z kontenera serwera AnsibleForms. Za
firmowym proxy wychodzącym ustaw `HTTPS_PROXY` **oraz** `NODE_USE_ENV_PROXY=1`; bez tego drugiego
wbudowany klient HTTP Node ignoruje `HTTPS_PROXY`. Dostawca z certyfikatem wystawionym przez
wewnętrzne CA wymaga, aby Node ufał temu CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Przy `NODE_USE_ENV_PROXY=1` model lub proxy wewnątrz sieci musi być wymieniony w
`NO_PROXY`, w przeciwnym razie wywołanie trafia do proxy wychodzącego, które nie może do niego dotrzeć.

Nieudany test połączenia podaje host i przyczynę (DNS, odrzucone połączenie lub niezaufany certyfikat).

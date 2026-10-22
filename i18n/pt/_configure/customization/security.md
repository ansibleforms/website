---
layout: default
title: Variáveis de segurança
parent: Variáveis de ambiente
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Variáveis de segurança
{: .no_toc }

Tokens, cifragem, hosts REST de saída, mascaramento e as antigas definições VAULT_*
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Altere estas para definir os seus próprios segredos de token e de cifragem, e para limitar o que os formulários podem chamar e mostrar.

---

## Exemplo

Os seus próprios segredos, chamadas REST limitadas a uma API e a uma rede interna, e mais uma chave mascarada. No `.env` do projeto compose:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Defina `ENCRYPTION_SECRET` antes de guardar a primeira credencial. A partir da 7.3.0, defini-la ou alterá-la volta a cifrar todos os segredos
guardados no arranque seguinte, com `ENCRYPTION_SECRET_PREVIOUS` a indicar a chave antiga quando era sua, consulte
[Alterar o segredo de cifragem](../security/secrets.html#changing-the-encryption-secret).

---

## Chamadas REST e jq

A partir da 7.3.0, as funções auxiliares REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) verificam o
certificado do endpoint que chamam, como qualquer outra ligação; até à 7.2.0 nunca o faziam. Aplicam-se-lhes três definições:

| Variável | Predefinição | Efeito |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` salta a verificação do certificado: só para endpoints com um certificado autoassinado |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Quanto tempo uma chamada REST espera por uma resposta antes de falhar por tempo limite |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Quanto tempo um filtro jq pode correr antes de ser parado; a saída do jq também está limitada a 64 MB |

As três produzem efeito ao serem guardadas, sem reiniciar. Para um endpoint cujo certificado está assinado por uma CA privada, mantenha a verificação ligada
e dê antes essa CA ao Node.js: defina `NODE_EXTRA_CA_CERTS` com um ficheiro PEM que a contenha no ambiente da aplicação, e depois reinicie a aplicação.

---

## Variáveis

Todas as variáveis deste grupo, com o seu tipo, predefinição e descrição:

{% include env_vars_table.html group="security" %}

---
layout: default
title: HashiCorp Vault
parent: Cofres de segredos
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Leia as credenciais do HashiCorp Vault, de KV v1 ou v2 ou de um motor de segredos dinâmicos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Campos do cofre

Além dos [campos que todos os cofres têm](./#adding-a-store), um cofre HashiCorp Vault tem estes campos:

| Campo | Significado |
|---|---|
| Credencial | Uma credencial **HashiCorp Vault** de [Ligações > Credenciais](../credentials.html): o endereço do Vault, as suas definições de TLS, e o token como palavra-passe, com acesso de leitura aos caminhos que as suas credenciais usam. **Adicionar credencial** cria uma desse tipo. O AnsibleForms não renova o token. |
| Namespace | O namespace do Vault Enterprise, enviado como `X-Vault-Namespace`. Aparece quando **Vault Enterprise** está ligado, no passo **Tipo**. |
| Versão KV | `2` (predefinição) ou `1`. |
| Mount predefinido | Usado para uma referência sem barra, ex. `myapp` passa a `secret/data/myapp`. |

A referência do segredo é o caminho, ex. `secret/myapp/prod`. Para KV v2, o segmento `/data/`
é inserido quando o omite.

---

## Credenciais dinâmicas de base de dados

Uma referência da forma `<mount>/creds/<role>`, ex. `database/creds/readonly`, lê de um
motor de segredos dinâmicos como o motor de base de dados do Vault. O Vault cria então uma nova conta
de base de dados em cada leitura, válida durante a lease.

- Uma conta é reutilizada durante 80% da sua lease, não o tempo de cache; com cache `0`, cada consulta lê uma nova.
- O Vault só devolve um utilizador e uma palavra-passe: coloque o resto da ligação na linha da credencial.
- A lease nunca é revogada antecipadamente; a conta expira quando o Vault termina a lease.

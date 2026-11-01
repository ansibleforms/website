---
layout: default
title: Segurança
nav_order: 15
has_children: true
has_toc: false
permalink: /security/
translated_from: e299ab0a4ffb1c12441a3b3fec6eaaef4a19de79
---

# Segurança
{: .no_toc }

Proteja uma instância: a conta de admin, os seus segredos, o HTTPS e o que os utilizadores e os formulários podem fazer
{: .fs-6 .fw-300 }

---

Para administradores que preparam uma instância para produção, e para revisões de segurança de uma instância existente.

---

## Nesta secção

Cada tema tem uma página própria:

| Página | O que abrange |
|---|---|
| [Endurecimento](hardening.html) | A conta de admin, os limites de início de sessão, a base de dados, as expressões, os dados das tarefas, a política do navegador, as funcionalidades opcionais e as opções de função |
| [HTTPS](https.html) | Onde termina o TLS, servir HTTPS a partir da aplicação, e substituir o certificado de exemplo |
| [Segredos e cifragem](secrets.html) | `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, e a duração dos tokens |

Páginas relacionadas: [Autenticação](../authentication/) para os métodos de início de sessão, [Validação no lançamento](../launch-validation/) para as
verificações do lado do servidor em cada lançamento, e as [Variáveis de segurança](../customization/security.html).

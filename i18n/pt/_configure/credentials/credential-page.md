---
layout: default
title: "A página de uma credencial"
parent: Credenciais
nav_order: 3
translated_from: 204eca949763c8c23625369f1d8d8d0d06545c87
---

# A página de uma credencial
{: .no_toc }

Os separadores de uma credencial, e o que a usa
{: .fs-6 .fw-300 }

A página de uma credencial mostra os passos da sua caixa de diálogo como separadores, mais o que a usa:

| Separador | O que contém |
|---|---|
| Detalhes | Nome e descrição. |
| Tipo | Para que serve a credencial. |
| Acesso | Todos os campos do seu tipo, como no passo **Acesso** da caixa de diálogo: o utilizador, a palavra-passe e onde inicia sessão (host e porta, a base de dados, o servidor de correio, os servidores do diretório, o tenant ou o emissor, o endereço do servidor e o seu TLS). O AppID, o certificado de cliente e a chave de uma credencial CyberArk. |
| Armazenamento | Base de dados ou Cofre de segredos, e o cofre e a referência. Não existe para CyberArk nem para HashiCorp Vault. |
| Usado por | Tudo o que nomeia esta credencial: cofres de segredos, canais de notificação, repositórios, diretórios LDAP, fornecedores SSO, runners, [bases de dados](../databases.html) (a partir da 7.5.0), o assistente de chat, formulários e os workflows do designer. Uma linha abre-o. |

A palavra-passe é escrita no separador **Acesso**, e nunca volta a ser mostrada depois de guardada: deixada vazia, a guardada mantém-se. Numa credencial
CyberArk, deixe a chave de cliente vazia para manter a guardada. No canto superior direito estão **Testar ligação** (só para credenciais de base de dados),
**Eliminar** e **Guardar**.

A partir da 7.3.0, **Eliminar** e um nome novo são recusados enquanto **Usado por** listar alguma coisa, consulte [Credenciais em uso](../credentials.html#credentials-in-use).

Uma credencial declarada no [config seed](../seed/) é só de leitura nesta página: altere-a antes no ficheiro de seed.

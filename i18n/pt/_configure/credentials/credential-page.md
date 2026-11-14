---
layout: default
title: "A página de uma credencial"
parent: Credenciais
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
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
| Acesso | Todos os campos do seu tipo, como no passo **Acesso** da caixa de diálogo: o utilizador, a palavra-passe e onde inicia sessão (host e porta, a base de dados, o servidor de correio, os servidores do diretório, o tenant ou o emissor, o endereço do servidor e o seu TLS). O AppID, o certificado de cliente e a chave de uma credencial CyberArk. A partir da 7.6.0, a escolha de como inicia sessão, e a chave privada e a frase-passe de uma credencial SSH. |
| Armazenamento | Base de dados ou Cofre de segredos, e o cofre e a referência. Não existe para CyberArk nem para HashiCorp Vault. |
| Usado por | Tudo o que nomeia esta credencial: cofres de segredos, canais de notificação, repositórios, diretórios LDAP, fornecedores SSO, runners, [bases de dados](../databases.html) (a partir da 7.5.0), o assistente de chat, formulários e os workflows do designer. Uma linha abre-o. |

A palavra-passe é escrita no separador **Acesso**, e nunca volta a ser mostrada depois de guardada: deixada vazia, a guardada mantém-se. O mesmo
vale para a chave de cliente de uma credencial CyberArk e, a partir da 7.6.0, para a chave privada e a frase-passe de uma credencial SSH.

A partir da 7.6.0, isso só vale enquanto a escolha de início de sessão se mantém. Alterada (uma SSH de **Chave privada** para
**Palavra-passe** e vice-versa, uma SMTP de **Sem autenticação** para **Autenticação**, uma Entra ID de **Certificado** para **Segredo** e
vice-versa, um **Token** para uma **Palavra-passe** e vice-versa), nada do que está guardado lhe serve: o novo segredo de que precisa é
obrigatório, e **Guardar** pede-o. Uma credencial SSH alterada para **Palavra-passe** elimina a chave privada e a frase-passe guardadas ao
**Guardar**, como diz o separador debaixo da escolha. Com **Escrever numa chave** no separador **Armazenamento**, só são oferecidas as
escolhas com palavra-passe, consulte [Como uma credencial inicia sessão](types.html#how-a-credential-signs-in).

No canto superior direito estão **Testar ligação** (só para credenciais de base de dados), **Eliminar** e **Guardar**.

A partir da 7.3.0, **Eliminar** e um nome novo são recusados enquanto **Usado por** listar alguma coisa, consulte [Credenciais em uso](../credentials.html#credentials-in-use).

Uma credencial declarada no [config seed](../seed/) é só de leitura nesta página: altere-a antes no ficheiro de seed.

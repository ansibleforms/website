---
layout: default
title: Aviso legal
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: a22b56db001904583c51e6bd28f1281737f32a32
---

# Aviso legal
{: .no_toc }

Condições que cada utilizador aceita uma vez antes de usar a aplicação, registadas com quem aceitou que versão e quando
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: peça a todos os utilizadores que aceitem condições de utilização, em **Definições > Acesso > Aviso legal**, com a opção de função `showSettings`.

A partir da 7.3.0, a página lista todas as versões do aviso legal, e cada versão abre numa página própria com as suas aceitações.
Até à 7.2, a página tinha em vez disso três separadores (**Geral**, **Versões** e **Aceitações**); a atualização mantém todas as versões.

---

## Nesta secção

| Página | O que abrange |
|---|---|
| [Geral](disclaimer/general.html) | A lista de versões, adicionar uma, e ativar a que os utilizadores aceitam |
| [Versões](disclaimer/versions.html) | A página de uma versão, e alterar o seu texto como correção ou para todos de novo |
| [Aceitações](disclaimer/acceptances.html) | Quem aceitou que versão, e pedir de novo a utilizadores escolhidos |


---

## O que os utilizadores veem

Com uma versão ativada, todos os utilizadores que iniciam sessão recebem-na numa caixa de diálogo antes de qualquer outra coisa, admins incluídos:

1. Leem o seu título e o seu texto.
2. Marcam a caixa de verificação e clicam em **Aceitar**. **Recusar**, a vermelho, termina-lhes a sessão.

A partir da 7.3.0, a página por trás da caixa de diálogo fica desfocada até responderem.

Um utilizador aceita cada versão uma vez: não lhe é pedido de novo no início de sessão seguinte, só quando chega uma versão nova, quando
um admin guarda um texto alterado com [Pedir de novo a todos](disclaimer/versions.html#changing-the-text), ou quando um admin usa
[Pedir novamente](disclaimer/acceptances.html#asking-users-again) na sua aceitação.

Até aceitarem, a API responde a todas as chamadas da sua sessão com o estado `403` e o código `disclaimer_required`,
exceto as chamadas em `/api/v2/disclaimer` e `/api/v2/profile`, e os eventos em direto que o navegador acompanha.
Um [token de API](profile/api-token.html) nunca é solicitado, já que um script não tem ninguém que clique.


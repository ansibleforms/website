---
layout: default
title: O bloqueio do designer
parent: Designer
nav_order: 1
translated_from: f23a01e973e287a772930e69ca9ccaa7cb463c65
---

# O bloqueio do designer
{: .no_toc }

Uma pessoa edita de cada vez
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Obter o bloqueio

O designer está desligado até o ligar, com o interruptor no canto superior direito do designer. Ligá-lo obtém o
bloqueio: a partir daí é o único que pode guardar, até o desligar de novo.

Sem o bloqueio, o designer mostra **O designer não está ativo**, e não se pode editar nada.

As gravações nunca se sobrepõem: a partir da 7.3.0, enquanto decorre uma gravação, um push ou um carregamento, um segundo **Guardar** (um duplo clique, ou Ctrl+S mantido) é
ignorado, para que não possa escrever uma segunda cópia de segurança ou um segundo commit em concorrência com o primeiro.

---

## Quando outra pessoa o tem

Enquanto outro utilizador tem o bloqueio, o designer mostra **O designer está a ser usado por** esse utilizador, e mais nada: nem secções,
nem ficheiros.

O interruptor aparece ligado mas a cinzento, com **Bloqueado por** e o nome do utilizador ao lado. Pode obter o bloqueio quando ele
desligar o designer. Todos os designers abertos veem de imediato quando o bloqueio é obtido ou libertado, sem recarregar.

Quando dois utilizadores ligam o designer no mesmo instante, um deles obtém o bloqueio. A partir da 7.3.0, o outro vê quem o tem
e todos os editores ficam só de leitura, para que não se possa escrever nada que não possa ser guardado.

---

## Libertar o bloqueio de outra pessoa

Um administrador pode libertar um bloqueio que outra pessoa tem, por exemplo quando foi para casa com o designer aberto.

**Libertar**, ao lado de **Bloqueado por**, só aparece para administradores. Pede confirmação primeiro: as alterações do utilizador que não foram guardadas perdem-se.

A partir da 7.3.0, o utilizador cujo bloqueio foi libertado é avisado disso, e por quem: **O seu bloqueio do designer foi libertado por** e o nome do administrador,
com **As alterações não guardadas já não podem ser guardadas.** O seu designer não volta a obter o bloqueio sozinho; o utilizador liga-o de novo
quando quiser continuar.

---

## Um bloqueio esquecido

Um bloqueio que ninguém usa liberta-se sozinho, para que ninguém fique à espera de um designer que ninguém tem aberto.

O designer aberto de quem tem o bloqueio continua a dizer ao servidor que ainda está lá. Quando o servidor não tem notícias dele durante
5 minutos, porque o navegador foi fechado, o computador foi desligado ou a rede caiu, o bloqueio fica de novo livre. Quando
quem o tinha volta ao designer, este obtém de novo o bloqueio se mais ninguém o tiver. A libertação por um administrador é a exceção: depois dela, o
bloqueio não volta a ser obtido.

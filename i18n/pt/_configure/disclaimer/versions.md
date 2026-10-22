---
layout: default
title: Versões
parent: Aviso legal
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versões
{: .no_toc }

A página de uma versão, e alterar o seu texto como correção ou para todos de novo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A página de uma versão

A partir da 7.3.0, cada versão tem uma página própria, em `/settings/disclaimer/<version>`, com dois separadores:

| Separador | O que contém |
|---|---|
| **Detalhes** | O título, o texto e o texto da caixa, e o interruptor **Ativada**, que é guardado de imediato |
| **Aceitações** | Quem aceitou esta versão, consulte [Aceitações](acceptances.html) |

**Pré-visualizar** mostra a caixa de diálogo tal como os utilizadores a verão, e **Eliminar** remove a versão com as suas aceitações. A caixa de pesquisa acima dos
separadores pesquisa em ambos ao mesmo tempo: os campos correspondentes em **Detalhes** e as linhas correspondentes em **Aceitações**.

---

## Alterar o texto

**Guardar** num título, texto ou texto da caixa alterado que os utilizadores já aceitaram pergunta **Pedir de novo a todos?**:

| Resposta | O que acontece |
|---|---|
| **Pedir de novo a todos** | As aceitações desta versão são apagadas, e todos os utilizadores a aceitam de novo no seu pedido seguinte |
| **Manter como correção** | O texto é reescrito, por exemplo por causa de uma gralha, e as aceitações continuam a contar: ninguém é solicitado de novo |

Uma versão que ninguém aceitou ainda é guardada sem perguntar. Para manter o texto aceite, [adicione uma versão nova](general.html#adding-a-version) e ative-a.

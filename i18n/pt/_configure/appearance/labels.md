---
layout: default
title: Etiquetas
parent: Aparência
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Etiquetas
{: .no_toc }

Etiquetas ao lado do logótipo que dizem que instância é esta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## A lista

A partir da 7.3.0, **Definições > Aparência > Etiquetas** guarda várias etiquetas ao lado do logótipo do cabeçalho, como PRODUCTION e EU:

| Coluna | Significado |
|---|---|
| **Ativado** | Se a etiqueta aparece ao lado do logótipo e na página de início de sessão |
| **Etiqueta** | O seu texto, mostrado como a pílula colorida que o cabeçalho apresenta |

As linhas estão pela ordem do cabeçalho. Um clique numa linha, ou **Editar** no menu da sua linha, abre a página da etiqueta; o menu da linha tem também
**Ativar** ou **Desativar**, conforme o caso, **Mover para cima** e **Mover para baixo** para alterar a ordem, e **Eliminar**.

O cabeçalho e a página de início de sessão mostram as etiquetas ativadas pela sua ordem. A partir de três, um **+N** cinzento guarda as restantes na sua dica,
e um telemóvel mostra a primeira etiqueta e o **+N**. Uma etiqueta guardada aparece de imediato em todos os navegadores abertos.

---

## Adicionar uma etiqueta

**Adicionar etiqueta** abre uma caixa de diálogo com os dois campos da etiqueta, ambos obrigatórios:

| Campo | Significado |
|---|---|
| **Etiqueta** | O texto da etiqueta, como PRODUCTION |
| **Cor** | Azul, verde, âmbar, laranja, vermelho ou cinzento, como amostras redondas; vermelho de início |

Uma pré-visualização mostra o cabeçalho com todas as etiquetas ativadas e a nova à medida que é escrita. Uma etiqueta nova fica ativada e vem depois das
outras. A sua página tem um separador, **Detalhes**, com os mesmos campos, o interruptor **Ativado**, que é guardado de imediato, e a pré-visualização.

---

## A etiqueta de ambiente da 7.2

Até à 7.2, **Definições > Aparência > Ambiente** definia uma única etiqueta ao lado do logótipo.

Com uma só etiqueta, PRODUCTION EU e PRODUCTION US ficavam ambas como PRODUCTION quando várias instâncias estavam abertas lado a lado. A partir da 7.3.0,
a atualização faz dessa etiqueta a primeira da lista, com o seu texto, a sua cor e se aparecia ou não, e o antigo endereço **Ambiente**
abre a lista.

---

## Etiquetas no config seed

A partir da 7.3.0, o [config seed](../seed/) declara etiquetas na sua secção `labels`, cada uma com o seu texto e, opcionalmente, a sua cor:

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` é um de `blue`, `green`, `amber`, `orange`, `red` ou `grey`, e `position` ordena-as, a mais baixa primeiro. Uma etiqueta declarada
no seed fica só de leitura na sua página, como qualquer [objeto gerido](../seed/managed-objects.html).

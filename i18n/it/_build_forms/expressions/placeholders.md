---
layout: default
title: Segnaposto
parent: Espressioni
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# Segnaposto
{: .no_toc }

Fare riferimento a un altro campo, a una costante o all'utente corrente con `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Che cos'è un segnaposto

Un segnaposto è un riferimento scritto come `$(reference)`. Viene sostituito da un valore prima che il testo che lo contiene venga usato.

I segnaposto funzionano in `expression`, `query` e `default` di un campo (valutato con `evalDefault`), e in `label`,
`help` e `placeholder`. Un campo che contiene un segnaposto dipende dal campo che nomina: attende finché quel campo ha un
valore, e viene valutato di nuovo ogni volta che quel valore cambia. È così che si costruiscono i menu a tendina a cascata.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## A cosa può fare riferimento un segnaposto

Un segnaposto nomina un campo del modulo, oppure uno di questi, che ogni modulo ha:

| Riferimento | Cosa contiene |
|---|---|
| `$(field)` | il valore di un altro campo del modulo |
| `$(name)`, una costante | una [costante](../config/constants.html) di `config.yaml`, o un valore dai `varsFiles` del modulo |
| `$(__user__)` | l'utente che ha effettuato l'accesso: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | in un [sottomodulo](../forms/subform.html) (una riga di lista, un passo di wizard), un valore del modulo padre |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Accedere a una parte del valore

La notazione a punti e a indici legge una parte di un valore, purché il percorso contenga solo lettere, cifre, `_`, `-`, `.` e `[n]`:

| Segnaposto | Su | Restituisce |
|---|---|---|
| `$(field)` | un campo di testo, numero o password | il valore |
| `$(field)` | un enum di record | la `placeholderColumn` del record selezionato, altrimenti la sua prima colonna |
| `$(field.col)` | un enum di record | quella colonna del record selezionato |
| `$(field)` | un enum con `multiple: true` | la colonna scelta di ogni record selezionato, come array |
| `$(field)` | un'espressione, una lista o una costante | l'intero valore (una lista restituisce le sue righe) |
| `$(field.a.b)`, `$(f[0].x)` | un'espressione, una lista o una costante | quella parte dell'oggetto o dell'array |

Impostando `placeholderColumn: "*"` su un enum, `$(field)` restituisce l'intero record selezionato invece di una colonna.

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## Come viene inserito il valore

Il modo in cui un valore viene scritto nel testo dipende da dove si trova il segnaposto.

| Dove | Esempio | Diventa |
|---|---|---|
| un'espressione, fuori dagli apici | `$(count) + 1` | un letterale JavaScript: un numero resta un numero, un testo diventa una stringa tra apici, un oggetto o un array un letterale |
| un'espressione, l'intera stringa tra apici | `fn.fnLs('$(dir)')` | lo stesso letterale, apici compresi, così un valore che contiene un apice non può uscirne |
| un'espressione, dentro una stringa più lunga | `'$(dir)/vars'` | il testo, con l'escape per quella stringa |
| una query, un'etichetta, un testo di aiuto | `where city='$(city)'` | il testo |

Un campo i cui segnaposto non possono ancora essere risolti tutti non viene valutato; con `ignoreIncomplete: true` un valore mancante viene
invece scritto come `undefined`.

### Backtick e `${` in un valore

Dalla 7.3.0 il valore di un campo non può essere eseguito come codice quando il server lo scrive in un'espressione (espressioni remote, validazione
all'avvio, MCP e chat). Un backtick o `${` nel valore viene scritto come escape unicode (`\u0060`, `\u0024{`), così resta
testo anche dentro un template literal. Le espressioni lato server rifiutano del tutto i template literal; per quelli usa `runLocal`.

Un'espressione `runLocal` valutata nel browser inserisce il valore come indicato nella tabella sopra, senza quell'escape, quindi lì non mettere
un segnaposto dentro un template literal.

---

## Vedi anche

Pagine correlate e voci delle FAQ:

- [Espressioni locali](local.html) e [Espressioni remote](remote.html): dove si usa la maggior parte dei segnaposto
- [FAQ: Menu a tendina a cascata](../faq.html#cascaded-dropdowns) e [Segnaposto dei campi](../faq.html#field-placeholders): altri esempi
- [FAQ: Come accedo ai dati del modulo padre dentro un sottomodulo?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)

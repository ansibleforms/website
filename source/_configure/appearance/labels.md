---
layout: default
title: Labels
parent: Appearance
nav_order: 6
redirect_from:
  - /appearance/environment.html
---

# Labels
{: .no_toc }

Labels beside the logo that say which instance this is
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The list

From 7.3.0 **Settings > Appearance > Labels** holds several labels beside the header's logo, such as PRODUCTION and EU:

| Column | Meaning |
|---|---|
| **Enabled** | Whether the label shows beside the logo and on the sign-in page |
| **Label** | Its text, shown as the coloured pill the header shows |

The rows are in the header's order. A click on a row, or **Edit** in its row menu, opens the label's page; the row menu also has
**Enable** or **Disable**, whichever applies, **Move up** and **Move down** to change the order, and **Delete**.

The header and the sign-in page show the enabled labels in their order. Past three, a grey **+N** holds the others in its tooltip,
and a phone shows the first label and the **+N**. A saved label shows at once in every open browser.

---

## Adding a label

**Add label** opens a dialog with the label's two fields, both required:

| Field | Meaning |
|---|---|
| **Label** | The text of the label, such as PRODUCTION |
| **Colour** | Blue, green, amber, orange, red or grey, as round swatches; red at first |

A preview shows the header with every enabled label and the new one as it is typed. A new label is enabled and comes after the
others. Its page has one tab, **Details**, with the same fields, the **Enabled** switch, which is saved at once, and the preview.

---

## The environment label of 7.2

Up to 7.2, **Settings > Appearance > Environment** set a single label beside the logo.

With one label, PRODUCTION EU and PRODUCTION US both read PRODUCTION when several instances are open side by side. From 7.3.0
the upgrade makes that label the first of the list, with its text, its colour and whether it showed, and the old **Environment**
address opens the list.

---

## Labels in the config seed

From 7.3.0 the [config seed](../seed/) declares labels in its `labels` section, each with its text and optionally its colour:

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

`color` is one of `blue`, `green`, `amber`, `orange`, `red` or `grey`, and `position` orders them, lowest first. A label declared
in the seed is read only on its page, as every [managed object](../seed/managed-objects.html).

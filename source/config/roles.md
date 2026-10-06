---
layout: default
title: Roles
parent: config.yaml
nav_order: 2
---

# Roles
{: .no_toc }

Map users and groups to roles, and set what each role may do.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## The roles attribute

The top-level `roles` list of config.yaml:

{% include config_attribute.html name="roles" %}

---

## Role object

Each entry of the `roles` list:

{% include config_object.html name="Role" %}

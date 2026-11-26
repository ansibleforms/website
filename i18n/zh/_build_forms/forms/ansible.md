---
layout: default
title: Ansible 表单
parent: 表单
nav_order: 2
translated_from: 9ddbe366d28db1f9e009d33eb7358354339a5f77
---

# Ansible 表单
{: .no_toc }

运行本地 Ansible playbook 的表单
{: .fs-6 .fw-300 }

---

{% assign help = site.data.help %}
{% assign formsyaml = help | where: "link", "forms" | first %}
{% assign form_object = formsyaml.help | where: "name", "Form" | first %}
{% assign type_prop = form_object.items | where: "name", "type" | first %}
{% assign ansible_choice = type_prop.choices | where: "name", "ansible" | first %}

{{ ansible_choice.description | markdownify }}

{% if ansible_choice.examples.size > 0 %}
{% for e in ansible_choice.examples %}
**{{ e.name }}**
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
{% endfor %}
{% endif %}

---

## 运行 playbook 的仓库

自 7.8.0 起，表单可以用 `playbookRepository` 指定运行其 playbook 的仓库。

不指定时，playbook 与以前一样，从第一个用于 playbook 的仓库的 `playbooks` 文件夹（否则为其根目录）运行。指定时，playbook
从所指定仓库的根目录运行，因此该仓库的 `ansible.cfg`、 `roles/` 和相对路径的清单都会生效，并且 `playbook` 从根目录给出
（`playbooks/site.yml`）。布局和完整示例见[采用 Ansible 自己布局的仓库](../repositories/ansible-layout.html)。

`playbookRepository: __self__` 指向读取表单本身的仓库，因此与 playbook 放在一起的表单无需指定其仓库。
不在任何仓库中的表单（本地表单文件夹）不能使用它：其运行会被拒绝。参见[表单所在的仓库](../repositories/ansible-layout.html#the-repository-the-form-is-in)。

---

## 属性

`type: ansible` 特有的属性，是对[通用表单属性](common.html)的补充。

{% assign ansible_props = form_object.items | where_exp: "p", "p.with_types contains 'ansible'" %}
{% assign ansible_groups = ansible_props | map: "group" | uniq | sort_natural %}
{% for group in ansible_groups %}
{% assign group_props = ansible_props | where: "group", group %}

---

## {{ group | capitalize }}

<table>
  <thead>
    <tr>
      <th>属性</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    {% for var in group_props %}
    <tr>
      <td>
        <span id="ansible_{{ var.name }}"><strong>{{ var.name }}</strong></span><br>
        <span class="af-type">{{ var.type }}</span>
        {% if var.required == true %}<span class="af-required"> / 必填</span>{% endif %}
        <br>
        {% if var.version %}<span class="af-version">在版本 {{ var.version }} 中添加</span>{% endif %}
      </td>
      <td>
        <p>
          <strong>{{ var.short }}</strong><br>
          {% if var.allowed != nil %}
          <span class="af-type">{{ var.allowed }}</span>
          {% endif %}
        </p>
        <p>{{ var.description | markdownify }}</p>
        {% if var.choices.size > 0 %}
        <div>
          <strong>选项：</strong><br>
          <ul class="af-choices-list">
            {% for c in var.choices %}
            <li>
              {% if c.name == var.default %}
              <span title="{{ c.description }}" class="af-default-choice">{{ c.name }}（默认）</span>
              {% else %}
              <span title="{{ c.description }}">{{ c.name }}</span>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </div>
        {% elsif var.default != nil %}
        <div>
          <strong>默认值：</strong> {{ var.default }}
        </div>
        {% endif %}
        {% if var.examples %}
        <p><strong>示例：</strong></p>
        {% for e in var.examples %}
        <div>
          <p><strong>{{ forloop.index }}) {{ e.name }}</strong></p>
{% highlight yaml %}
{{ e.code }}
{% endhighlight %}
        </div>
        {% endfor %}
        {% endif %}
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% endfor %}

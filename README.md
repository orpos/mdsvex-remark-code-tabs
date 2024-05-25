# mdsvex-remark-code-extras
<br>
A remark plugin inspired by [@rise4fun/docusaurus-remark-plugin-code-tabs](https://www.npmjs.com/package/@rise4fun/docusaurus-remark-plugin-code-tabs) that automatically imports and manages the code tabs

---

## Configurating:

```js
// mdsvex.config.js:
import codeTabs from "mdsvex-remark-code-extras";

export default {
    remarkPlugins: [
        [
            codeTabs,
            {
                components: {
                    Tab: "$lib/Tab.svelte",
                    Tabs: "$lib/Tabs.svelte",
                },
            },
        ],
    ],
};
```

---

example:

```
```js tabs=test
// js Code
``
```ts tabs=test
// ts Code
``
```

turns into svelte code

```html
<script>
    import Tabs from "$lib/Tabs.svelte";
    import Tab from "$lib/Tab.svelte";
</script>
<Tabs single={false} defaultValue="js">
    <Tab value="js">[...code]</Tab>
    <Tab value="ts">[...code]</Tab>
</Tabs>
```

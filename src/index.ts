import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Code, Html, Parent, Root, RootContent } from "mdast";

import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";

import {
    fromAttributeValue,
    parseMeta,
    toAttributeValue,
    toParameters,
    wrapHTML,
} from "./utils.js";

function injectImport(root: Root, name: string, importUrl: string) {
    const scriptTag = root.children.findIndex(
        (n) => n.type == "html" && n.value.trim().startsWith("<script")
    );
    if (scriptTag >= 0) {
        const target = root.children[scriptTag] as Html;
        const parsedHtml = fromHtml(target.value, { fragment: true });
        const script = parsedHtml.children.find(
            (n) => n.type == "element" && n.tagName == "script"
        );
        if (script?.type == "element" && script.tagName == "script") {
            const needImport = !script.children.find(
                (n) =>
                    n.type == "text" &&
                    n.value.trim().startsWith(`import ${name} `)
            );
            if (needImport) {
                script.children.unshift({
                    type: "text",
                    value: `import ${name} from '${importUrl}';`,
                });
            }
        }
        root.children.splice(scriptTag, 1, {
            type: "html",
            value: toHtml(parsedHtml),
        });
    } else {
        root.children.unshift({
            type: "html",
            value: `<script>import ${name} from '${importUrl}';</script>`,
        });
    }
}

export type Options = {
    components: {
        Tabs: string;
        Tab: string;
    };
};

type SupportedProps = {
    default: string;
    title?: string;
    file?: string;
};

function wrapCodesToTabComponent(
    codes: Code[],
    single: boolean,
    lazy?: string,
    group?: string
) {
    let defaultCode = codes[0];
    for (const code of codes) {
        const meta = parseMeta<{
            default?: string;
        }>(code);
        if (meta.default !== undefined && code) {
            defaultCode = code;
            break;
        }
    }
    if (!defaultCode) throw new Error("No code detected");
    const { file, title } = parseMeta<SupportedProps>(defaultCode);
    const value = file || title || defaultCode.lang;
    return wrapHTML(
        "Tabs",
        {
            lazy,
            single,
            groupId: group || "default",
            defaultCode: value || "",
        },
        codes.flatMap((c) => {
            const { lang = "" } = c;
            const { title, file, ...others } = parseMeta<SupportedProps>(c);
            return wrapHTML(
                "Tab",
                {
                    value: file || title || lang,
                    label: title || undefined,
                    others,
                },
                [{ ...c }]
            );
        })
    );
}

export const plugin: Plugin<[Options?]> = (
    options = {
        components: {
            Tab: "$lib/Tab.svelte",
            Tabs: "$lib/Tabs.svelte",
        },
    }
) => {
    return (root) => {
        let needsTabsImport = false;
        const visited = new Set<Code>();
        //
        visit(root, "code", (node: Code, nodeIndex: number, parent: Parent) => {
            if (!parent || visited.has(node)) return;
            visited.add(node);

            const { lazy, tabs } = parseMeta<{
                tabs: string;
                lazy: string;
            }>(node);

            const codes = [node];
            const startIndex = nodeIndex++;
            while (
                tabs !== undefined &&
                nodeIndex < parent.children.length &&
                parent.children[nodeIndex]?.type === "code"
            ) {
                codes.push(parent.children[nodeIndex] as Code);
                nodeIndex++;
            }
            let nextIndex = startIndex + 1;
            const tabComponent = wrapCodesToTabComponent(
                codes,
                codes.length <= 1,
                lazy,
                tabs
            );
            parent.children.splice(startIndex, codes.length, ...tabComponent);
            needsTabsImport = true;
            nextIndex = startIndex + (tabComponent.length - codes.length) + 2;
            return nextIndex;
        });
        if (needsTabsImport) {
            injectImport(root as Root, "Tabs", options.components.Tabs);
            injectImport(root as Root, "Tab", options.components.Tab);
        }
        //
    };
};

export default plugin;
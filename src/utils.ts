import { Code, RootContent } from "mdast";
import { parse } from "node:querystring";

export function fromAttributeValue(s: string | string[] | undefined) {
    if (!s) return s;
    if (typeof s === "string" && s[0] === '"') {
        try {
            return JSON.parse(s);
        } catch {}
    }
    return s;
}

export function parseMeta<T>(node: Code) {
    const r = parse(node.meta || "", " ");
    Object.keys(r).forEach((k) => (r[k] = fromAttributeValue(r[k])));
    return r as T;
}

export function toAttributeValue(s: string | undefined) {
    if (!s) return s;
    try {
        const j = JSON.parse(s);
        if (typeof j === "string") s = j;
    } catch {}
    return JSON.stringify(s);
}

export function toParameters(params: [string, any][]) {
    return params
        .map(([key, value]) => {
            if (key == "single") {
                console.log(value)
            }
            if (value === "" || (typeof value === "boolean" && value==true))
                return `${key}`;
            return `${key}={${JSON.stringify(value)}}`;
        })
        .join(" ");
}

export function wrapHTML(
    tag: string,
    properties: Record<string, any>,
    children: RootContent[]
) {
    return [
        {
            type: "html",
            value: `<${tag} ${toParameters(Object.entries(properties))}>`,
        },
        ...children,
        {
            type: "html",
            value: `</${tag}>`,
        },
    ] as RootContent[];
}
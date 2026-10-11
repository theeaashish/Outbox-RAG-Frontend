import type { ExtraProps } from "streamdown";

type HtmlElement = NonNullable<ExtraProps["node"]>;
type HtmlParent = Pick<HtmlElement, "children">;

const CITATION_PATTERN = /(?<!\[)\[([1-9]\d*)\](?!\])/g;
const LITERAL_ELEMENTS = new Set(["a", "code", "pre"]);

/** Turn the backend's [n] citation syntax into links after Markdown is parsed. */
export function rehypeCitations() {
  return transformChildren;
}

function transformChildren(parent: HtmlParent): void {
  parent.children = parent.children.flatMap((node) => {
    if (node.type === "text") return citationNodes(node.value);

    if (node.type === "element" && !LITERAL_ELEMENTS.has(node.tagName)) {
      transformChildren(node);
    }

    return [node];
  });
}

function citationNodes(text: string): HtmlElement["children"] {
  const nodes: HtmlElement["children"] = [];
  let offset = 0;

  for (const match of text.matchAll(CITATION_PATTERN)) {
    const label = match[1];
    const citation = Number(label);
    if (!label || !Number.isSafeInteger(citation)) continue;

    if (match.index > offset) {
      nodes.push({ type: "text", value: text.slice(offset, match.index) });
    }

    nodes.push({
      type: "element",
      tagName: "a",
      properties: { href: `#cite-${citation}`, dataCitation: citation },
      children: [{ type: "text", value: label }],
    });
    offset = match.index + match[0].length;
  }

  if (offset < text.length) {
    nodes.push({ type: "text", value: text.slice(offset) });
  }

  return nodes;
}

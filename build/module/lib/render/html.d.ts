import { Node } from '../node';
import { Renderer } from './renderer';
export interface HtmlRendererOptions {
    safe?: any;
    softbreak?: string;
    sourcepos?: boolean;
}
export declare class HtmlRenderer extends Renderer {
    private options;
    disableTags: number;
    constructor(options?: HtmlRendererOptions);
    tag(name: string, attrs?: string[][], selfclosing?: boolean): void;
    text(node: Node): void;
    softbreak(): void;
    linebreak(): void;
    link(node: Node, entering: boolean): void;
    image(node: Node, entering: boolean): void;
    emph(node: Node, entering: boolean): void;
    strong(node: Node, entering: boolean): void;
    paragraph(node: Node, entering: boolean): void;
    heading(node: Node, entering: boolean): void;
    code(node: Node): void;
    code_block(node: Node): void;
    thematic_break(node: Node): void;
    block_quote(node: Node, entering: boolean): void;
    list(node: Node, entering: boolean): void;
    item(node: Node, entering: boolean): void;
    html_inline(node: Node): void;
    html_block(node: Node): void;
    custom_inline(node: Node, entering: boolean): void;
    custom_block(node: Node, entering: boolean): void;
    out(s: string): void;
    attrs(node: Node): string[][];
}

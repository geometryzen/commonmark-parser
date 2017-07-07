import { Node } from '../node';
export declare abstract class Renderer {
    buffer: string;
    lastOut: string;
    constructor();
    /**
     *  Walks the AST and calls member methods for each Node type.
     *
     *  @param ast {Node} The root of the abstract syntax tree.
     */
    render(ast: Node): string;
    document(node: Node, entering: boolean): void;
    paragraph(node: Node, entering: boolean): void;
    strong(node: Node, entering: boolean): void;
    text(node: Node, entering: boolean): void;
    emph(node: Node, entering: boolean): void;
    block_quote(node: Node, entering: boolean): void;
    code(node: Node, entering: boolean): void;
    code_block(node: Node, entering: boolean): void;
    image(node: Node, entering: boolean): void;
    linebreak(node: Node, entering: boolean): void;
    link(node: Node, entering: boolean): void;
    list(node: Node, entering: boolean): void;
    item(node: Node, entering: boolean): void;
    thematic_break(node: Node, entering: boolean): void;
    html_block(node: Node, entering: boolean): void;
    html_inline(node: Node, entering: boolean): void;
    heading(node: Node, entering: boolean): void;
    softbreak(node: Node, entering: boolean): void;
    /**
     *  Concatenate a literal string to the buffer.
     */
    lit(str: string): void;
    cr(): void;
    /**
     *  Concatenate a string to the buffer possibly escaping the content.
     *
     *  Concrete renderer implementations should override this method.
     */
    out(str: string): void;
}

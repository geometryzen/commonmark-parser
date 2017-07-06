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
    text(node: Node, entering: boolean): void;
    emph(node: Node, entering: boolean): void;
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

import { Node, NodeWalker, NodeWalkerEvent } from '../node';

export abstract class Renderer {
    buffer: string;
    lastOut: string;
    constructor() {
        // Do nothing
    }
    /**
     *  Walks the AST and calls member methods for each Node type.
     *
     *  @param ast {Node} The root of the abstract syntax tree.
     */
    render(ast: Node) {
        const walker: NodeWalker = ast.walker();
        let event: NodeWalkerEvent;

        this.buffer = '';
        this.lastOut = '\n';

        while ((event = walker.next())) {
            const type = event.node.type;
            switch (type) {
                case 'document': {
                    this.document(event.node, event.entering);
                    break;
                }
                case 'paragraph': {
                    this.paragraph(event.node, event.entering);
                    break;
                }
                case 'strong': {
                    this.strong(event.node, event.entering);
                    break;
                }
                case 'text': {
                    this.text(event.node, event.entering);
                    break;
                }
                case 'emph': {
                    this.emph(event.node, event.entering);
                    break;
                }
                case 'block_quote': {
                    this.block_quote(event.node, event.entering);
                    break;
                }
                case 'code': {
                    this.code(event.node, event.entering);
                    break;
                }
                case 'code_block': {
                    this.code_block(event.node, event.entering);
                    break;
                }
                case 'image': {
                    this.image(event.node, event.entering);
                    break;
                }
                case 'linebreak': {
                    this.linebreak(event.node, event.entering);
                    break;
                }
                case 'list': {
                    this.list(event.node, event.entering);
                    break;
                }
                case 'item': {
                    this.item(event.node, event.entering);
                    break;
                }
                case 'thematic_break': {
                    this.thematic_break(event.node, event.entering);
                    break;
                }
                case 'html_block': {
                    this.html_block(event.node, event.entering);
                    break;
                }
                case 'html_inline': {
                    this.html_inline(event.node, event.entering);
                    break;
                }
                case 'heading': {
                    this.heading(event.node, event.entering);
                    break;
                }
                case 'link': {
                    this.link(event.node, event.entering);
                    break;
                }
                case 'softbreak': {
                    this.softbreak(event.node, event.entering);
                    break;
                }
                default: {
                    throw new Error(`TODO: ${type}`);
                }
            }
            /*
            if (this[type]) {
                this[type](event.node, event.entering);
            }
            */
        }
        return this.buffer;
    }

    document(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    paragraph(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    strong(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    text(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    emph(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    block_quote(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    code(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    code_block(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    image(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    linebreak(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    link(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    list(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    item(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    thematic_break(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    html_block(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    html_inline(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    heading(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    softbreak(node: Node, entering: boolean) {
        throw new Error(`${node.type}`);
    }

    /**
     *  Concatenate a literal string to the buffer.
     */
    lit(str: string) {
        this.buffer += str;
        this.lastOut = str;
    }

    cr() {
        if (this.lastOut !== '\n') {
            this.lit('\n');
        }
    }

    /**
     *  Concatenate a string to the buffer possibly escaping the content.
     *
     *  Concrete renderer implementations should override this method.
     */
    out(str: string) {
        this.lit(str);
    }
}


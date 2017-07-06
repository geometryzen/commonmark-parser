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
                case 'text': {
                    this.text(event.node, event.entering);
                    break;
                }
                case 'emph': {
                    this.emph(event.node, event.entering);
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
        // Do nothing.
    }

    paragraph(node: Node, entering: boolean) {
        // Do nothing.
    }

    text(node: Node, entering: boolean) {
        // Do nothing.
    }

    emph(node: Node, entering: boolean) {
        // Do nothing.
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


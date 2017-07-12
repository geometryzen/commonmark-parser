import { Node } from '../node';
import { Renderer } from './renderer';

export interface TexRendererOptions {
    //    safe?: any;
    //    softbreak?: string;
    //    sourcepos?: boolean;
}

export class TexRenderer extends Renderer {
    constructor(private options: TexRendererOptions = {}) {
        super();
        // Do nothing yet.
        this.options = options;
    }
    document(node: Node, entering: boolean) {
        if (entering) {
            this.buffer += '\\documentclass{article}\n';
            this.buffer += '\\begin{document}\n';
        }
        else {
            this.cr();
            this.buffer += '\\end{document}\n';
        }
    }
    paragraph(node: Node, entering: boolean) {
        if (entering) {
            this.cr();
            this.buffer += '\\paragraph{}';
        }
    }
    code_block(node: Node, entering: boolean) {
        this.cr();
        this.buffer += '\\begin{equation}\n';
        this.out(node.literal as string);
        this.buffer += '\\end{equation}';
    }
    text(node: Node, entering: boolean) {
        this.out(node.literal as string);
    }
    emph(node: Node, entering: boolean) {
        if (entering) {
            this.buffer += '\\emph{';
        }
        else {
            this.buffer += '}';
        }
    }
}

import { Node } from '../node';
import { Renderer } from './renderer';
export interface TexRendererOptions {
}
export declare class TexRenderer extends Renderer {
    private options;
    constructor(options?: TexRendererOptions);
    document(node: Node, entering: boolean): void;
    paragraph(node: Node, entering: boolean): void;
    text(node: Node, entering: boolean): void;
    emph(node: Node, entering: boolean): void;
}

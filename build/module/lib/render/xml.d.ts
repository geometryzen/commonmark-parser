import { Node } from '../node';
import { Renderer } from './renderer';
export interface XmlRendererOptions {
    sourcepos?: boolean;
}
export declare class XmlRenderer extends Renderer {
    private options;
    disableTags: number;
    lastOut: string;
    indentLevel: number;
    indent: string;
    constructor(options?: XmlRendererOptions);
    render(ast: Node): string;
    /**
     *
     */
    out(s: string): void;
    /**
     *
     */
    cr(): void;
}

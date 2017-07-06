import { Node } from './node';
import { InlineParser, Reference } from './inlines';
export interface ParserOptions {
    smart?: boolean;
    time?: boolean;
}
export declare class Parser {
    doc: Node;
    tip: Node;
    oldtip: Node;
    inlineParser: InlineParser;
    options: ParserOptions;
    lineNumber: number;
    lastLineLength: number;
    offset: number;
    column: number;
    lastMatchedContainer: Node;
    currentLine: string;
    refmap: {
        [label: string]: Reference;
    };
    blank: boolean;
    private blocks;
    private blockStarts;
    partiallyConsumedTab: boolean;
    allClosed: boolean;
    indent: number;
    indented: any;
    nextNonspace: number;
    nextNonspaceColumn: number;
    constructor(options?: ParserOptions);
    parse(input: string): Node;
    incorporateLine(ln: string): void;
    advanceOffset(count: number, columns?: boolean): void;
    advanceNextNonspace(): void;
    findNextNonspace(): void;
    finalize(block: Node, lineNumber: number): void;
    processInlines(block: Node): void;
    addLine(): void;
    addChild(tag: string, offset: number): Node;
    closeUnmatchedBlocks(): void;
}

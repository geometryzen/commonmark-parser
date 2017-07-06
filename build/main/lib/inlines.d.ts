import { Node } from './node';
export interface Delimiter {
    cc: number;
    numdelims: number;
    origdelims: number;
    node: Node;
    previous: Delimiter;
    next: Delimiter;
    can_open: boolean;
    can_close: boolean;
}
export interface Reference {
    destination: string;
    title: string;
}
export interface Brackets {
    active: boolean;
    bracketAfter?: boolean;
    image: boolean;
    index: number;
    node: Node;
    previous: any;
    previousDelimiter: Delimiter;
}
export declare class InlineParser {
    subject: string;
    delimiters: Delimiter;
    brackets: Brackets;
    pos: number;
    options: {
        smart?: boolean;
    };
    refmap: {
        [label: string]: Reference;
    };
    constructor(options?: {});
    parse(block: Node): void;
    /**
     * Parse string content in block into inline children,
     * using refmap to resolve references.
     * @param block
     */
    parseInlines(block: Node): void;
    /**
     * Parse the next inline element in subject, advancing subject position.
     * On success, add the result to block's children and return true.
     * On failure, return false.
     * @param block
     */
    parseInline(block: Node): boolean;
    /**
     * Parse a newline.  If it was preceded by two spaces, return a hard
     * line break; otherwise a soft line break.
     * @param block
     */
    parseNewline(block: Node): boolean;
    /**
     * Parse a run of ordinary characters, or a single character with
     * a special meaning in markdown, as a plain string.
     * @param block
     */
    parseString(block: Node): boolean;
    /**
     * Attempt to parse an entity.
     * @param block
     */
    parseEntity(block: Node): boolean;
    /**
     * Attempt to parse a link reference, modifying refmap.
     * @param s
     * @param refmap
     */
    parseReference(s: string, refmap: {
        [label: string]: Reference;
    }): number;
    match(re: RegExp): string;
    peek(): number;
    spnl(): boolean;
    parseBackticks(block: Node): boolean;
    parseBackslash(block: Node): boolean;
    parseAutolink(block: Node): boolean;
    parseHtmlTag(block: Node): boolean;
    scanDelims(cc: number): {
        numdelims: number;
        can_open: boolean;
        can_close: boolean;
    };
    handleDelim(cc: number, block: Node): boolean;
    removeDelimiter(delim: Delimiter): void;
    removeDelimitersBetween(bottom: Delimiter, top: Delimiter): void;
    processEmphasis(stack_bottom: Delimiter): void;
    parseLinkTitle(): string;
    parseLinkDestination(): string;
    parseLinkLabel(): number;
    parseOpenBracket(block: Node): boolean;
    parseBang(block: Node): boolean;
    parseCloseBracket(block: Node): boolean;
    addBracket(node: Node, index: number, image: boolean): void;
    removeBracket(): void;
}

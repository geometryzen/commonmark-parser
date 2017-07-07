export interface ListData {
    type?: any;
    tight?: boolean;
    bulletChar?: string;
    start?: number;
    delimiter?: string;
    padding?: any;
    markerOffset?: number;
}
export declare type SourcePos = [[number, number], [number, number]];
export declare type NodeType = 'block_quote' | 'code' | 'code_block' | 'custom_block' | 'custom_inline' | 'document' | 'emph' | 'heading' | 'html_block' | 'html_inline' | 'image' | 'item' | 'linebreak' | 'link' | 'list' | 'paragraph' | 'softbreak' | 'strong' | 'text' | 'thematic_break';
export declare class Node {
    private _type;
    private _parent;
    private _firstChild;
    private _lastChild;
    private _prev;
    private _next;
    private _sourcepos?;
    _lastLineBlank: boolean;
    open: boolean;
    _string_content: string | null;
    private _literal;
    listData: ListData;
    private _info;
    private _destination;
    private _title;
    isFenced: boolean;
    fenceChar: string | null;
    fenceLength: number;
    fenceOffset: number | null;
    private _level;
    private _onEnter;
    private _onExit;
    htmlBlockType: number;
    constructor(nodeType: NodeType, sourcepos?: SourcePos);
    readonly isContainer: boolean;
    readonly type: NodeType;
    readonly firstChild: Node | null;
    readonly lastChild: Node | null;
    readonly next: Node | null;
    readonly prev: Node | null;
    readonly parent: Node | null;
    readonly sourcepos: SourcePos | undefined;
    literal: string | null;
    destination: string;
    title: string;
    info: string | null;
    level: number | null;
    listType: string;
    listTight: boolean | undefined;
    listStart: number | undefined;
    listDelimiter: string | undefined;
    onEnter: string | null;
    onExit: string | null;
    unlink(): void;
    appendChild(child: Node): void;
    prependChild(child: Node): void;
    insertAfter(sibling: Node): void;
    insertBefore(sibling: Node): void;
    walker(): NodeWalker;
}
export interface NodeWalkerEvent {
    entering: boolean;
    node: Node;
}
export declare class NodeWalker {
    current: Node | null;
    root: Node;
    entering: boolean;
    constructor(root: Node);
    next(): NodeWalkerEvent | null;
    resumeAt(node: Node, entering: boolean): void;
}

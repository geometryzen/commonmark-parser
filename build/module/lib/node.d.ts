export interface ListData {
    type?: any;
    tight?: boolean;
    bulletChar?: string;
    start?: number;
    delimiter?: string;
    padding?: any;
    markerOffset?: number;
}
export declare class Node {
    private _type;
    private _parent;
    private _firstChild;
    private _lastChild;
    private _prev;
    private _next;
    private _sourcepos;
    _lastLineBlank: boolean;
    open: boolean;
    _string_content: string;
    private _literal;
    listData: ListData;
    private _info;
    private _destination;
    private _title;
    isFenced: boolean;
    fenceChar: string;
    fenceLength: number;
    fenceOffset: number;
    private _level;
    private _onEnter;
    private _onExit;
    htmlBlockType: number;
    constructor(nodeType: string, sourcepos?: [[number, number], [number, number]]);
    readonly isContainer: boolean;
    readonly type: string;
    readonly firstChild: Node;
    readonly lastChild: Node;
    readonly next: Node;
    readonly prev: Node;
    readonly parent: Node;
    readonly sourcepos: any;
    literal: string;
    destination: string;
    title: string;
    info: string;
    level: number;
    listType: string;
    listTight: boolean;
    listStart: number;
    listDelimiter: string;
    onEnter: any;
    onExit: any;
    unlink(): void;
    appendChild(child: Node): void;
    prependChild(child: Node): void;
    insertAfter(sibling: Node): void;
    insertBefore(sibling: Node): void;
    walker(): NodeWalker;
}
export declare class NodeWalker {
    current: Node;
    root: Node;
    entering: boolean;
    constructor(root: Node);
    next(): {
        entering: boolean;
        node: Node;
    };
    resumeAt(node: Node, entering: boolean): void;
}

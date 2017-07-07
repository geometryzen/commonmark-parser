
export interface ListData {
    type?: any;
    tight?: boolean;
    bulletChar?: string;
    start?: number;
    delimiter?: string;
    padding?: any;
    markerOffset?: number;
}

export type SourcePos = [[number, number], [number, number]];

export type NodeType = 'block_quote' | 'code' | 'code_block' | 'custom_block' | 'custom_inline' | 'document' | 'emph' | 'heading' | 'html_block' | 'html_inline' | 'image' | 'item' | 'linebreak' | 'link' | 'list' | 'paragraph' | 'softbreak' | 'strong' | 'text' | 'thematic_break';

export class Node {
    private _type: NodeType;
    private _parent: Node | null;
    private _firstChild: Node | null;
    private _lastChild: Node | null;
    private _prev: Node | null;
    private _next: Node | null;
    private _sourcepos?: SourcePos;
    public _lastLineBlank: boolean;
    public open: boolean;
    public _string_content: string | null;
    private _literal: string | null;
    public listData: ListData;
    private _info: string | null;
    private _destination: any;
    private _title: any;
    public isFenced: boolean;
    public fenceChar: string | null;
    public fenceLength: number;
    public fenceOffset: number | null;
    private _level: number | null;
    private _onEnter: string | null;
    private _onExit: string | null;
    public htmlBlockType: number;
    constructor(nodeType: NodeType, sourcepos?: SourcePos) {
        this._type = nodeType;
        this._parent = null;
        this._firstChild = null;
        this._lastChild = null;
        this._prev = null;
        this._next = null;
        this._sourcepos = sourcepos;
        this._lastLineBlank = false;
        this.open = true;
        this._string_content = null;
        this._literal = null;
        this.listData = {};
        this._info = null;
        this._destination = null;
        this._title = null;
        this.isFenced = false;
        this.fenceChar = null;
        this.fenceLength = 0;
        this.fenceOffset = null;
        this._level = null;
        this._onEnter = null;
        this._onExit = null;
    }
    get isContainer() {
        switch (this.type) {
            case 'document':
            case 'block_quote':
            case 'list':
            case 'item':
            case 'paragraph':
            case 'heading':
            case 'emph':
            case 'strong':
            case 'link':
            case 'image':
            case 'custom_inline':
            case 'custom_block':
                return true;
            default:
                return false;
        }
    }
    get type(): NodeType {
        return this._type;
    }
    get firstChild(): Node | null {
        return this._firstChild;
    }
    get lastChild(): Node | null {
        return this._lastChild;
    }
    get next(): Node | null {
        return this._next;
    }
    get prev(): Node | null {
        return this._prev;
    }
    get parent(): Node | null {
        return this._parent;
    }
    get sourcepos(): SourcePos | undefined {
        return this._sourcepos;
    }
    get literal(): string | null {
        return this._literal;
    }
    set literal(s: string | null) {
        this._literal = s;
    }
    get destination(): string {
        return this._destination;
    }
    set destination(s: string) {
        this._destination = s;
    }
    get title(): string {
        return this._title;
    }
    set title(s: string) {
        this._title = s;
    }
    get info(): string | null {
        return this._info;
    }
    set info(s: string | null) {
        this._info = s;
    }
    get level(): number | null {
        return this._level;
    }
    set level(s: number | null) {
        this._level = s;
    }
    get listType(): string {
        return this.listData.type;
    }
    set listType(t: string) {
        this.listData.type = t;
    }
    get listTight(): boolean | undefined {
        return this.listData.tight;
    }
    set listTight(tight: boolean | undefined) {
        this.listData.tight = tight;
    }
    get listStart(): number | undefined {
        return this.listData.start;
    }
    set listStart(start: number | undefined) {
        this.listData.start = start;
    }
    get listDelimiter(): string | undefined {
        return this.listData.delimiter;
    }
    set listDelimiter(delimiter: string | undefined) {
        this.listData.delimiter = delimiter;
    }
    get onEnter(): string | null {
        return this._onEnter;
    }
    set onEnter(s: string | null) {
        this._onEnter = s;
    }
    get onExit(): string | null {
        return this._onExit;
    }
    set onExit(s: string | null) {
        this._onExit = s;
    }
    unlink() {
        if (this._prev) {
            this._prev._next = this._next;
        } else if (this._parent) {
            this._parent._firstChild = this._next;
        }
        if (this._next) {
            this._next._prev = this._prev;
        } else if (this._parent) {
            this._parent._lastChild = this._prev;
        }
        this._parent = null;
        this._next = null;
        this._prev = null;
    }
    appendChild(child: Node) {
        child.unlink();
        child._parent = this;
        if (this._lastChild) {
            this._lastChild._next = child;
            child._prev = this._lastChild;
            this._lastChild = child;
        } else {
            this._firstChild = child;
            this._lastChild = child;
        }
    }
    prependChild(child: Node) {
        child.unlink();
        child._parent = this;
        if (this._firstChild) {
            this._firstChild._prev = child;
            child._next = this._firstChild;
            this._firstChild = child;
        } else {
            this._firstChild = child;
            this._lastChild = child;
        }
    }
    insertAfter(sibling: Node) {
        sibling.unlink();
        sibling._next = this._next;
        if (sibling._next) {
            sibling._next._prev = sibling;
        }
        sibling._prev = this;
        this._next = sibling;
        sibling._parent = this._parent;
        if (!sibling._next) {
            if (sibling._parent) {
                sibling._parent._lastChild = sibling;
            }
        }
    }
    insertBefore(sibling: Node) {
        sibling.unlink();
        sibling._prev = this._prev;
        if (sibling._prev) {
            sibling._prev._next = sibling;
        }
        sibling._next = this;
        this._prev = sibling;
        sibling._parent = this._parent;
        if (!sibling._prev) {
            if (sibling._parent) {
                sibling._parent._firstChild = sibling;
            }
        }
    }
    walker() {
        const walker = new NodeWalker(this);
        return walker;
    }
}

export interface NodeWalkerEvent {
    entering: boolean;
    node: Node;
}

/* Example of use of walker:

 var walker = w.walker();
 var event;

 while (event = walker.next()) {
 console.log(event.entering, event.node.type);
 }

 */
export class NodeWalker {
    current: Node | null;
    root: Node;
    entering = true;
    constructor(root: Node) {
        this.current = root;
        this.root = root;
    }
    next(): NodeWalkerEvent | null {
        const cur = this.current;
        const entering = this.entering;

        if (cur === null) {
            return null;
        }

        const container = cur.isContainer;

        if (entering && container) {
            if (cur.firstChild) {
                this.current = cur.firstChild;
                this.entering = true;
            } else {
                // stay on node but exit
                this.entering = false;
            }

        }
        else if (cur === this.root) {
            this.current = null;

        }
        else if (cur.next === null) {
            this.current = cur.parent;
            this.entering = false;

        }
        else {
            this.current = cur.next;
            this.entering = true;
        }

        return { entering: entering, node: cur };
    }
    resumeAt(node: Node, entering: boolean) {
        this.current = node;
        this.entering = (entering === true);
    }
}

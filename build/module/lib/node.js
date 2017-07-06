var Node = (function () {
    function Node(nodeType, sourcepos) {
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
    Object.defineProperty(Node.prototype, "isContainer", {
        get: function () {
            switch (this._type) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "firstChild", {
        get: function () {
            return this._firstChild;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "lastChild", {
        get: function () {
            return this._lastChild;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "next", {
        get: function () {
            return this._next;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "prev", {
        get: function () {
            return this._prev;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "sourcepos", {
        get: function () {
            return this._sourcepos;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "literal", {
        get: function () {
            return this._literal;
        },
        set: function (s) {
            this._literal = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "destination", {
        get: function () {
            return this._destination;
        },
        set: function (s) {
            this._destination = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (s) {
            this._title = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "info", {
        get: function () {
            return this._info;
        },
        set: function (s) {
            this._info = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "level", {
        get: function () {
            return this._level;
        },
        set: function (s) {
            this._level = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "listType", {
        get: function () {
            return this.listData.type;
        },
        set: function (t) {
            this.listData.type = t;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "listTight", {
        get: function () {
            return this.listData.tight;
        },
        set: function (tight) {
            this.listData.tight = tight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "listStart", {
        get: function () {
            return this.listData.start;
        },
        set: function (start) {
            this.listData.start = start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "listDelimiter", {
        get: function () {
            return this.listData.delimiter;
        },
        set: function (delimiter) {
            this.listData.delimiter = delimiter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "onEnter", {
        get: function () {
            return this._onEnter;
        },
        set: function (s) {
            this._onEnter = s;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "onExit", {
        get: function () {
            return this._onExit;
        },
        set: function (s) {
            this._onExit = s;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.unlink = function () {
        if (this._prev) {
            this._prev._next = this._next;
        }
        else if (this._parent) {
            this._parent._firstChild = this._next;
        }
        if (this._next) {
            this._next._prev = this._prev;
        }
        else if (this._parent) {
            this._parent._lastChild = this._prev;
        }
        this._parent = null;
        this._next = null;
        this._prev = null;
    };
    Node.prototype.appendChild = function (child) {
        child.unlink();
        child._parent = this;
        if (this._lastChild) {
            this._lastChild._next = child;
            child._prev = this._lastChild;
            this._lastChild = child;
        }
        else {
            this._firstChild = child;
            this._lastChild = child;
        }
    };
    Node.prototype.prependChild = function (child) {
        child.unlink();
        child._parent = this;
        if (this._firstChild) {
            this._firstChild._prev = child;
            child._next = this._firstChild;
            this._firstChild = child;
        }
        else {
            this._firstChild = child;
            this._lastChild = child;
        }
    };
    Node.prototype.insertAfter = function (sibling) {
        sibling.unlink();
        sibling._next = this._next;
        if (sibling._next) {
            sibling._next._prev = sibling;
        }
        sibling._prev = this;
        this._next = sibling;
        sibling._parent = this._parent;
        if (!sibling._next) {
            sibling._parent._lastChild = sibling;
        }
    };
    Node.prototype.insertBefore = function (sibling) {
        sibling.unlink();
        sibling._prev = this._prev;
        if (sibling._prev) {
            sibling._prev._next = sibling;
        }
        sibling._next = this;
        this._prev = sibling;
        sibling._parent = this._parent;
        if (!sibling._prev) {
            sibling._parent._firstChild = sibling;
        }
    };
    Node.prototype.walker = function () {
        var walker = new NodeWalker(this);
        return walker;
    };
    return Node;
}());
export { Node };
/*
export class Document extends Node {
    constructor() {
        super('document', [[1, 1], [0, 0]]);
    }
}
*/
/* Example of use of walker:

 var walker = w.walker();
 var event;

 while (event = walker.next()) {
 console.log(event.entering, event.node.type);
 }

 */
var NodeWalker = (function () {
    function NodeWalker(root) {
        this.entering = true;
        this.current = root;
        this.root = root;
    }
    NodeWalker.prototype.next = function () {
        var cur = this.current;
        var entering = this.entering;
        if (cur === null) {
            return null;
        }
        var container = cur.isContainer;
        if (entering && container) {
            if (cur.firstChild) {
                this.current = cur.firstChild;
                this.entering = true;
            }
            else {
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
    };
    NodeWalker.prototype.resumeAt = function (node, entering) {
        this.current = node;
        this.entering = (entering === true);
    };
    return NodeWalker;
}());
export { NodeWalker };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXQTtJQXdCSSxjQUFZLFFBQWdCLEVBQUUsU0FBZ0Q7UUFDMUUsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFD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
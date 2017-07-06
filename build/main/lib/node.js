"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.Node = Node;
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
exports.NodeWalker = NodeWalker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBO0lBd0JJLGNBQVksUUFBZ0IsRUFBRSxTQUFnRDtRQUMxRSxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBQ0Qsc0JBQUksNkJBQVc7YUFBZjtZQUNJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixLQUFLLFVBQVUsQ0FBQztnQkFDaEIsS0FBSyxhQUFhLENBQUM7Z0JBQ25CLEtBQUssTUFBTSxDQUFDO2dCQUNaLEtBQUssTUFBTSxDQUFDO2dCQUNaLEtBQUssV0FBVyxDQUFDO2dCQUNqQixLQUFLLFNBQVMsQ0FBQztnQkFDZixLQUFLLE1BQU0sQ0FBQztnQkFDWixLQUFLLFFBQVEsQ0FBQztnQkFDZCxLQUFLLE1BQU0sQ0FBQztnQkFDWixLQUFLLE9BQU8sQ0FBQztnQkFDYixLQUFLLGVBQWUsQ0FBQztnQkFDckIsS0FBSyxjQUFjO29CQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCO29CQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksc0JBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksNEJBQVU7YUFBZDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksMkJBQVM7YUFBYjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksc0JBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksc0JBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksd0JBQU07YUFBVjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksMkJBQVM7YUFBYjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUkseUJBQU87YUFBWDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7YUFDRCxVQUFZLENBQVM7WUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQzs7O09BSEE7SUFJRCxzQkFBSSw2QkFBVzthQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDN0IsQ0FBQzthQUNELFVBQWdCLENBQVM7WUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQzs7O09BSEE7SUFJRCxzQkFBSSx1QkFBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzthQUNELFVBQVUsQ0FBUztZQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7OztPQUhBO0lBSUQsc0JBQUksc0JBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFDRCxVQUFTLENBQVM7WUFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNuQixDQUFDOzs7T0FIQTtJQUlELHNCQUFJLHVCQUFLO2FBQVQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2QixDQUFDO2FBQ0QsVUFBVSxDQUFTO1lBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQzs7O09BSEE7SUFJRCxzQkFBSSwwQkFBUTthQUFaO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQzlCLENBQUM7YUFDRCxVQUFhLENBQVM7WUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUM7OztPQUhBO0lBSUQsc0JBQUksMkJBQVM7YUFBYjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUMvQixDQUFDO2FBQ0QsVUFBYyxLQUFjO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNoQyxDQUFDOzs7T0FIQTtJQUlELHNCQUFJLDJCQUFTO2FBQWI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDL0IsQ0FBQzthQUNELFVBQWMsS0FBYTtZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDaEMsQ0FBQzs7O09BSEE7SUFJRCxzQkFBSSwrQkFBYTthQUFqQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUNuQyxDQUFDO2FBQ0QsVUFBa0IsU0FBaUI7WUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQ3hDLENBQUM7OztPQUhBO0lBSUQsc0JBQUkseUJBQU87YUFBWDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7YUFDRCxVQUFZLENBQU07WUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUN0QixDQUFDOzs7T0FIQTtJQUlELHNCQUFJLHdCQUFNO2FBQVY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO2FBQ0QsVUFBVyxDQUFNO1lBQ2IsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQzs7O09BSEE7SUFJRCxxQkFBTSxHQUFOO1FBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2xDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMxQyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2xDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QyxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUNELDBCQUFXLEdBQVgsVUFBWSxLQUFXO1FBQ25CLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUM5QixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDNUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDNUIsQ0FBQztJQUNMLENBQUM7SUFFRCwyQkFBWSxHQUFaLFVBQWEsS0FBVztRQUNwQixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDL0IsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQzdCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQzVCLENBQUM7SUFDTCxDQUFDO0lBRUQsMEJBQVcsR0FBWCxVQUFZLE9BQWE7UUFDckIsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMzQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7UUFDbEMsQ0FBQztRQUNELE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztRQUN6QyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUFZLEdBQVosVUFBYSxPQUFhO1FBQ3RCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDM0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLENBQUM7UUFDRCxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUNyQixPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7SUFFRCxxQkFBTSxHQUFOO1FBQ0ksSUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ0wsV0FBQztBQUFELENBQUMsQUFuT0QsSUFtT0M7QUFuT1ksb0JBQUk7QUFxT2pCOzs7Ozs7RUFNRTtBQUVGOzs7Ozs7Ozs7R0FTRztBQUNIO0lBSUksb0JBQVksSUFBVTtRQUR0QixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBRVosSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUNELHlCQUFJLEdBQUo7UUFDSSxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3pCLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFL0IsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBRWxDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSix3QkFBd0I7Z0JBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQzFCLENBQUM7UUFFTCxDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUV4QixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFMUIsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBQ0QsNkJBQVEsR0FBUixVQUFTLElBQVUsRUFBRSxRQUFpQjtRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDTCxpQkFBQztBQUFELENBQUMsQUFoREQsSUFnREM7QUFoRFksZ0NBQVUifQ==
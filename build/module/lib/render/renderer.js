var Renderer = (function () {
    function Renderer() {
        // Do nothing
    }
    /**
     *  Walks the AST and calls member methods for each Node type.
     *
     *  @param ast {Node} The root of the abstract syntax tree.
     */
    Renderer.prototype.render = function (ast) {
        var walker = ast.walker();
        var event;
        this.buffer = '';
        this.lastOut = '\n';
        while ((event = walker.next())) {
            var type = event.node.type;
            switch (type) {
                case 'document': {
                    this.document(event.node, event.entering);
                    break;
                }
                case 'paragraph': {
                    this.paragraph(event.node, event.entering);
                    break;
                }
                case 'strong': {
                    this.strong(event.node, event.entering);
                    break;
                }
                case 'text': {
                    this.text(event.node, event.entering);
                    break;
                }
                case 'emph': {
                    this.emph(event.node, event.entering);
                    break;
                }
                case 'block_quote': {
                    this.block_quote(event.node, event.entering);
                    break;
                }
                case 'code': {
                    this.code(event.node, event.entering);
                    break;
                }
                case 'code_block': {
                    this.code_block(event.node, event.entering);
                    break;
                }
                case 'image': {
                    this.image(event.node, event.entering);
                    break;
                }
                case 'linebreak': {
                    this.linebreak(event.node, event.entering);
                    break;
                }
                case 'list': {
                    this.list(event.node, event.entering);
                    break;
                }
                case 'item': {
                    this.item(event.node, event.entering);
                    break;
                }
                case 'thematic_break': {
                    this.thematic_break(event.node, event.entering);
                    break;
                }
                case 'html_block': {
                    this.html_block(event.node, event.entering);
                    break;
                }
                case 'html_inline': {
                    this.html_inline(event.node, event.entering);
                    break;
                }
                case 'heading': {
                    this.heading(event.node, event.entering);
                    break;
                }
                case 'link': {
                    this.link(event.node, event.entering);
                    break;
                }
                case 'softbreak': {
                    this.softbreak(event.node, event.entering);
                    break;
                }
                default: {
                    throw new Error("TODO: " + type);
                }
            }
            /*
            if (this[type]) {
                this[type](event.node, event.entering);
            }
            */
        }
        return this.buffer;
    };
    Renderer.prototype.document = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.paragraph = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.strong = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.text = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.emph = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.block_quote = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.code = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.code_block = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.image = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.linebreak = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.link = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.list = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.item = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.thematic_break = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.html_block = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.html_inline = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.heading = function (node, entering) {
        throw new Error("" + node.type);
    };
    Renderer.prototype.softbreak = function (node, entering) {
        throw new Error("" + node.type);
    };
    /**
     *  Concatenate a literal string to the buffer.
     */
    Renderer.prototype.lit = function (str) {
        this.buffer += str;
        this.lastOut = str;
    };
    Renderer.prototype.cr = function () {
        if (this.lastOut !== '\n') {
            this.lit('\n');
        }
    };
    /**
     *  Concatenate a string to the buffer possibly escaping the content.
     *
     *  Concrete renderer implementations should override this method.
     */
    Renderer.prototype.out = function (str) {
        this.lit(str);
    };
    return Renderer;
}());
export { Renderer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3JlbmRlci9yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTtJQUdJO1FBQ0ksYUFBYTtJQUNqQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILHlCQUFNLEdBQU4sVUFBTyxHQUFTO1FBQ1osSUFBTSxNQUFNLEdBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hDLElBQUksS0FBc0IsQ0FBQztRQUUzQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUVwQixPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDN0IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDWCxLQUFLLFVBQVUsRUFBRSxDQUFDO29CQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzFDLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELEtBQUssV0FBVyxFQUFFLENBQUM7b0JBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0MsS0FBSyxDQUFDO2dCQUNWLENBQUM7Z0JBQ0QsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN4QyxLQUFLLENBQUM7Z0JBQ1YsQ0FBQztnQkFDRCxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUNWLElBQUks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
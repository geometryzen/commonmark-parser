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
        // Do nothing.
    };
    Renderer.prototype.paragraph = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.strong = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.text = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.emph = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.block_quote = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.code = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.code_block = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.image = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.linebreak = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.link = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.list = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.item = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.thematic_break = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.html_block = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.html_inline = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.heading = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.softbreak = function (node, entering) {
        // Do nothing.
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
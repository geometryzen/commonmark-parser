"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.Renderer = Renderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3JlbmRlci9yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0lBR0k7UUFDSSxhQUFhO0lBQ2pCLENBQUM7SUFDRDs7OztPQUlHO0lBQ0gseUJBQU0sR0FBTixVQUFPLEdBQVM7UUFDWixJQUFNLE1BQU0sR0FBZSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEMsSUFBSSxLQUFzQixDQUFDO1FBRTNCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRXBCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEtBQUssVUFBVSxFQUFFLENBQUM7b0JBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDMUMsS0FBSyxDQUFDO2dCQUNWLENBQUM7Z0JBQ0QsS0FBSyxXQUFXLEVBQUUsQ0FBQztvQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMzQyxLQUFLLENBQUM7Z0JBQ1YsQ0FBQztnQkFDRCxLQUFLLFFBQVEsRUFBRSxDQUFDO29CQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3hDLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELEtBQUssTUFBTSxFQUFFLENBQUM7b0JBQ1YsSUFB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
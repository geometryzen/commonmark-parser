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
                case 'text': {
                    this.text(event.node, event.entering);
                    break;
                }
                case 'emph': {
                    this.emph(event.node, event.entering);
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
    Renderer.prototype.text = function (node, entering) {
        // Do nothing.
    };
    Renderer.prototype.emph = function (node, entering) {
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
exports.Renderer = Renderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3JlbmRlci9yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0lBR0k7UUFDSSxhQUFhO0lBQ2pCLENBQUM7SUFDRDs7OztPQUlHO0lBQ0gseUJBQU0sR0FBTixVQUFPLEdBQVM7UUFDWixJQUFNLE1BQU0sR0FBZSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEMsSUFBSSxLQUFzQixDQUFDO1FBRTNCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRXBCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM3QixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNYLEtBQUssVUFBVSxFQUFFLENBQUM7b0JBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDMUMsS0FBSyxDQUFDO2dCQUNWLENBQUM7Z0JBQ0QsS0FBSyxXQUFXLEVBQUUsQ0FBQztvQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMzQyxLQUFLLENBQUM7Z0JBQ1YsQ0FBQztnQkFDRCxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3RDLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELEtBQUssTUFBTSxFQUFFLENBQUM7b0JBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdEMsS0FBSyxDQUFDO2dCQUNWLENBQUM7Z0JBQ0QsU0FBUyxDQUFDO29CQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBUyxJQUFNLENBQUMsQ0FBQztnQkFDckMsQ0FBQztZQUNMLENBQUM7WUFDRDs7OztjQUlFO1FBQ04sQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCwyQkFBUSxHQUFSLFVBQVMsSUFBVSxFQUFFLFFBQWlCO1FBQ2xDLGNBQWM7SUFDbEIsQ0FBQztJQUVELDRCQUFTLEdBQVQsVUFBVSxJQUFVLEVBQUUsUUFBaUI7UUFDbkMsY0FBYztJQUNsQixDQUFDO0lBRUQsdUJBQUksR0FBSixVQUFLLElBQVUsRUFBRSxRQUFpQjtRQUM5QixjQUFjO0lBQ2xCLENBQUM7SUFFRCx1QkFBSSxHQUFKLFVBQUssSUFBVSxFQUFFLFFBQWlCO1FBQzlCLGNBQWM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsc0JBQUcsR0FBSCxVQUFJLEdBQVc7UUFDWCxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUN2QixDQUFDO0lBRUQscUJBQUUsR0FBRjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25CLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFHLEdBQUgsVUFBSSxHQUFXO1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBQ0wsZUFBQztBQUFELENBQUMsQUF4RkQsSUF3RkM7QUF4RnFCLDRCQUFRIn0=
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
export { Renderer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3JlbmRlci9yZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTtJQUdJO1FBQ0ksYUFBYTtJQUNqQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILHlCQUFNLEdBQU4sVUFBTyxHQUFTO1FBQ1osSUFBTSxNQUFNLEdBQWUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3hDLElBQUksS0FBc0IsQ0FBQztRQUUzQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUVwQixPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDN0IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDWCxLQUFLLFVBQVUsRUFBRSxDQUFDO29CQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzFDLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELEtBQUssV0FBVyxFQUFFLENBQUM7b0JBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDM0MsS0FBSyxDQUFDO2dCQUNWLENBQUM7Z0JBQ0QsS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUN0QyxLQUFLLENBQUM7Z0JBQ1YsQ0FBQztnQkFDRCxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3RDLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELFNBQVMsQ0FBQztvQkFDTixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVMsSUFBTSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7WUFDTCxDQUFDO1lBQ0Q7Ozs7Y0FJRTtRQUNOLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsMkJBQVEsR0FBUixVQUFTLElBQVUsRUFBRSxRQUFpQjtRQUNsQyxjQUFjO0lBQ2xCLENBQUM7SUFFRCw0QkFBUyxHQUFULFVBQVUsSUFBVSxFQUFFLFFBQWlCO1FBQ25DLGNBQWM7SUFDbEIsQ0FBQztJQUVELHVCQUFJLEdBQUosVUFBSyxJQUFVLEVBQUUsUUFBaUI7UUFDOUIsY0FBYztJQUNsQixDQUFDO0lBRUQsdUJBQUksR0FBSixVQUFLLElBQVUsRUFBRSxRQUFpQjtRQUM5QixjQUFjO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNILHNCQUFHLEdBQUgsVUFBSSxHQUFXO1FBQ1gsSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFDdkIsQ0FBQztJQUVELHFCQUFFLEdBQUY7UUFDSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxzQkFBRyxHQUFILFVBQUksR0FBVztRQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQUFDLEFBeEZELElBd0ZDIn0=
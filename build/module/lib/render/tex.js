import * as tslib_1 from "tslib";
import { Renderer } from './renderer';
var TexRenderer = (function (_super) {
    tslib_1.__extends(TexRenderer, _super);
    function TexRenderer(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        // Do nothing yet.
        _this.options = options;
        return _this;
    }
    TexRenderer.prototype.document = function (node, entering) {
        if (entering) {
            this.buffer += '\\documentclass{article}\n';
            this.buffer += '\\begin{document}\n';
        }
        else {
            this.cr();
            this.buffer += '\\end{document}\n';
        }
    };
    TexRenderer.prototype.paragraph = function (node, entering) {
        if (entering) {
            this.cr();
        }
    };
    TexRenderer.prototype.text = function (node, entering) {
        this.out(node.literal);
    };
    TexRenderer.prototype.emph = function (node, entering) {
        if (entering) {
            this.buffer += '\\emph{';
        }
        else {
            this.buffer += '}';
        }
    };
    return TexRenderer;
}(Renderer));
export { TexRenderer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9yZW5kZXIvdGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBUXRDO0lBQWlDLHVDQUFRO0lBQ3JDLHFCQUFvQixPQUFnQztRQUFoQyx3QkFBQSxFQUFBLFlBQWdDO1FBQXBELFlBQ0ksaUJBQU8sU0FHVjtRQUptQixhQUFPLEdBQVAsT0FBTyxDQUF5QjtRQUVoRCxrQkFBa0I7UUFDbEIsS0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0lBQzNCLENBQUM7SUFDRCw4QkFBUSxHQUFSLFVBQVMsSUFBVSxFQUFFLFFBQWlCO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsTUFBTSxJQUFJLDRCQUE0QixDQUFDO1lBQzVDLElBQUksQ0FBQyxNQUFNLElBQUkscUJBQXFCLENBQUM7UUFDekMsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQztRQUN2QyxDQUFDO0lBQ0wsQ0FBQztJQUNELCtCQUFTLEdBQVQsVUFBVSxJQUFVLEVBQUUsUUFBaUI7UUFDbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDO0lBQ0QsMEJBQUksR0FBSixVQUFLLElBQVUsRUFBRSxRQUFpQjtRQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFpQixDQUFDLENBQUM7SUFDckMsQ0FBQztJQUNELDBCQUFJLEdBQUosVUFBSyxJQUFVLEVBQUUsUUFBaUI7UUFDOUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDO1FBQzdCLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ3ZCLENBQUM7SUFDTCxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQUFDLEFBaENELENBQWlDLFFBQVEsR0FnQ3hDIn0=
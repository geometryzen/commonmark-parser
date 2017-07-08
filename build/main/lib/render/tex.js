"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var renderer_1 = require("./renderer");
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
}(renderer_1.Renderer));
exports.TexRenderer = TexRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9yZW5kZXIvdGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFzQztBQVF0QztJQUFpQyx1Q0FBUTtJQUNyQyxxQkFBb0IsT0FBZ0M7UUFBaEMsd0JBQUEsRUFBQSxZQUFnQztRQUFwRCxZQUNJLGlCQUFPLFNBR1Y7UUFKbUIsYUFBTyxHQUFQLE9BQU8sQ0FBeUI7UUFFaEQsa0JBQWtCO1FBQ2xCLEtBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztJQUMzQixDQUFDO0lBQ0QsOEJBQVEsR0FBUixVQUFTLElBQVUsRUFBRSxRQUFpQjtRQUNsQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxDQUFDLE1BQU0sSUFBSSw0QkFBNEIsQ0FBQztZQUM1QyxJQUFJLENBQUMsTUFBTSxJQUFJLHFCQUFxQixDQUFDO1FBQ3pDLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNWLElBQUksQ0FBQyxNQUFNLElBQUksbUJBQW1CLENBQUM7UUFDdkMsQ0FBQztJQUNMLENBQUM7SUFDRCwrQkFBUyxHQUFULFVBQVUsSUFBVSxFQUFFLFFBQWlCO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDZCxDQUFDO0lBQ0wsQ0FBQztJQUNELDBCQUFJLEdBQUosVUFBSyxJQUFVLEVBQUUsUUFBaUI7UUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBaUIsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRCwwQkFBSSxHQUFKLFVBQUssSUFBVSxFQUFFLFFBQWlCO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQztJQUNMLGtCQUFDO0FBQUQsQ0FBQyxBQWhDRCxDQUFpQyxtQkFBUSxHQWdDeEM7QUFoQ1ksa0NBQVcifQ==
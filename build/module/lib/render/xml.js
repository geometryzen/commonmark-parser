import * as tslib_1 from "tslib";
import { Renderer } from './renderer';
import { escapeXml as esc } from '../common';
var reXMLTag = /\<[^>]*\>/;
// Helper function to produce an XML tag.
function tag(name, attrs, selfclosing) {
    var result = '<' + name;
    if (attrs && attrs.length > 0) {
        var i = 0;
        var attrib = void 0;
        while ((attrib = attrs[i]) !== undefined) {
            result += ' ' + attrib[0] + '="' + esc(attrib[1]) + '"';
            i++;
        }
    }
    if (selfclosing) {
        result += ' /';
    }
    result += '>';
    return result;
}
function toTagName(s) {
    return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}
var XmlRenderer = (function (_super) {
    tslib_1.__extends(XmlRenderer, _super);
    function XmlRenderer(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.disableTags = 0;
        _this.lastOut = "\n";
        _this.indentLevel = 0;
        _this.indent = ' ';
        _this.options = options;
        return _this;
    }
    XmlRenderer.prototype.render = function (ast) {
        this.buffer = '';
        var walker = ast.walker();
        var event;
        var options = this.options;
        this.buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
        this.buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';
        while ((event = walker.next())) {
            var entering = event.entering;
            var node = event.node;
            var nodetype = node.type;
            var container = node.isContainer;
            var selfClosing = nodetype === 'thematic_break'
                || nodetype === 'linebreak'
                || nodetype === 'softbreak';
            var tagname = toTagName(nodetype);
            if (entering) {
                var attrs = [];
                switch (nodetype) {
                    case 'document':
                        attrs.push(['xmlns', 'http://commonmark.org/xml/1.0']);
                        break;
                    case 'list':
                        if (node.listType !== null) {
                            attrs.push(['type', node.listType.toLowerCase()]);
                        }
                        if (node.listStart !== null) {
                            attrs.push(['start', String(node.listStart)]);
                        }
                        if (node.listTight !== null) {
                            attrs.push(['tight', (node.listTight ? 'true' : 'false')]);
                        }
                        var delim = node.listDelimiter;
                        if (delim !== null) {
                            var delimword = '';
                            if (delim === '.') {
                                delimword = 'period';
                            }
                            else {
                                delimword = 'paren';
                            }
                            attrs.push(['delimiter', delimword]);
                        }
                        break;
                    case 'code_block':
                        if (node.info) {
                            attrs.push(['info', node.info]);
                        }
                        break;
                    case 'heading':
                        attrs.push(['level', String(node.level)]);
                        break;
                    case 'link':
                    case 'image':
                        attrs.push(['destination', node.destination]);
                        attrs.push(['title', node.title]);
                        break;
                    case 'custom_inline':
                    case 'custom_block':
                        attrs.push(['on_enter', node.onEnter]);
                        attrs.push(['on_exit', node.onExit]);
                        break;
                    default:
                        break;
                }
                if (options.sourcepos) {
                    var pos = node.sourcepos;
                    if (pos) {
                        attrs.push(['sourcepos', String(pos[0][0]) + ':' +
                                String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                                String(pos[1][1])]);
                    }
                }
                this.cr();
                this.out(tag(tagname, attrs, selfClosing));
                if (container) {
                    this.indentLevel += 1;
                }
                else if (!container && !selfClosing) {
                    var lit = node.literal;
                    if (lit) {
                        this.out(esc(lit));
                    }
                    this.out(tag('/' + tagname));
                }
            }
            else {
                this.indentLevel -= 1;
                this.cr();
                this.out(tag('/' + tagname));
            }
        }
        this.buffer += '\n';
        return this.buffer;
    };
    /**
     *
     */
    XmlRenderer.prototype.out = function (s) {
        if (this.disableTags > 0) {
            this.buffer += s.replace(reXMLTag, '');
        }
        else {
            this.buffer += s;
        }
        this.lastOut = s;
    };
    /**
     *
     */
    XmlRenderer.prototype.cr = function () {
        if (this.lastOut !== '\n') {
            this.buffer += '\n';
            this.lastOut = '\n';
            for (var i = this.indentLevel; i > 0; i--) {
                this.buffer += this.indent;
            }
        }
    };
    return XmlRenderer;
}(Renderer));
export { XmlRenderer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9yZW5kZXIveG1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXRDLE9BQU8sRUFBRSxTQUFTLElBQUksR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTdDLElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUU3Qix5Q0FBeUM7QUFDekMsYUFBYSxJQUFZLEVBQUUsS0FBa0IsRUFBRSxXQUFxQjtJQUNoRSxJQUFJLE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxNQUFNLFNBQVUsQ0FBQztRQUNyQixPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ3hELENBQUMsRUFBRSxDQUFDO1FBQ1IsQ0FBQztJQUNMLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxJQUFJLElBQUksQ0FBQztJQUNuQixDQUFDO0lBQ0QsTUFBTSxJQUFJLEdBQUcsQ0FBQztJQUNkLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUVELG1CQUFtQixDQUFTO0lBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDLFdB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
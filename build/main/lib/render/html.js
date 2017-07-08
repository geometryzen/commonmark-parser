"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var renderer_1 = require("./renderer");
var common_1 = require("../common");
var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;
var potentiallyUnsafe = function (url) {
    return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
};
var HtmlRenderer = (function (_super) {
    tslib_1.__extends(HtmlRenderer, _super);
    function HtmlRenderer(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        // by default, soft breaks are rendered as newlines in HTML
        options.softbreak = options.softbreak || '\n';
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source
        _this.disableTags = 0;
        _this.lastOut = "\n";
        _this.options = options;
        return _this;
    }
    // Helper function to produce an HTML tag.
    HtmlRenderer.prototype.tag = function (name, attrs, selfclosing) {
        if (this.disableTags > 0) {
            return;
        }
        this.buffer += ('<' + name);
        if (attrs && attrs.length > 0) {
            var i = 0;
            var attrib = void 0;
            while ((attrib = attrs[i]) !== undefined) {
                this.buffer += (' ' + attrib[0] + '="' + attrib[1] + '"');
                i++;
            }
        }
        if (selfclosing) {
            this.buffer += ' /';
        }
        this.buffer += '>';
        this.lastOut = '>';
    };
    /* Node methods */
    HtmlRenderer.prototype.document = function (node, entering) {
        // Do nothing.
    };
    HtmlRenderer.prototype.text = function (node) {
        this.out(node.literal);
    };
    HtmlRenderer.prototype.softbreak = function () {
        this.lit(this.options.softbreak);
    };
    HtmlRenderer.prototype.linebreak = function () {
        this.tag('br', [], true);
        this.cr();
    };
    HtmlRenderer.prototype.link = function (node, entering) {
        var attrs = this.attrs(node);
        if (entering) {
            if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
                attrs.push(['href', common_1.escapeXml(node.destination, true)]);
            }
            if (node.title) {
                attrs.push(['title', common_1.escapeXml(node.title, true)]);
            }
            this.tag('a', attrs);
        }
        else {
            this.tag('/a');
        }
    };
    HtmlRenderer.prototype.image = function (node, entering) {
        if (entering) {
            if (this.disableTags === 0) {
                if (this.options.safe &&
                    potentiallyUnsafe(node.destination)) {
                    this.lit('<img src="" alt="');
                }
                else {
                    this.lit('<img src="' + common_1.escapeXml(node.destination, true) +
                        '" alt="');
                }
            }
            this.disableTags += 1;
        }
        else {
            this.disableTags -= 1;
            if (this.disableTags === 0) {
                if (node.title) {
                    this.lit('" title="' + common_1.escapeXml(node.title, true));
                }
                this.lit('" />');
            }
        }
    };
    HtmlRenderer.prototype.emph = function (node, entering) {
        this.tag(entering ? 'em' : '/em');
    };
    HtmlRenderer.prototype.strong = function (node, entering) {
        this.tag(entering ? 'strong' : '/strong');
    };
    HtmlRenderer.prototype.paragraph = function (node, entering) {
        var attrs = this.attrs(node);
        if (node.parent) {
            var grandparent = node.parent.parent;
            if (grandparent !== null &&
                grandparent.type === 'list') {
                if (grandparent.listTight) {
                    return;
                }
            }
        }
        if (entering) {
            this.cr();
            this.tag('p', attrs);
        }
        else {
            this.tag('/p');
            this.cr();
        }
    };
    HtmlRenderer.prototype.heading = function (node, entering) {
        var tagname = 'h' + node.level;
        var attrs = this.attrs(node);
        if (entering) {
            this.cr();
            this.tag(tagname, attrs);
        }
        else {
            this.tag('/' + tagname);
            this.cr();
        }
    };
    HtmlRenderer.prototype.code = function (node) {
        this.tag('code');
        this.out(node.literal);
        this.tag('/code');
    };
    HtmlRenderer.prototype.code_block = function (node) {
        var info_words = node.info ? node.info.split(/\s+/) : [];
        var attrs = this.attrs(node);
        if (info_words.length > 0 && info_words[0].length > 0) {
            attrs.push(['class', 'language-' + common_1.escapeXml(info_words[0], true)]);
        }
        this.cr();
        this.tag('pre');
        this.tag('code', attrs);
        this.out(node.literal);
        this.tag('/code');
        this.tag('/pre');
        this.cr();
    };
    HtmlRenderer.prototype.thematic_break = function (node) {
        var attrs = this.attrs(node);
        this.cr();
        this.tag('hr', attrs, true);
        this.cr();
    };
    HtmlRenderer.prototype.block_quote = function (node, entering) {
        var attrs = this.attrs(node);
        if (entering) {
            this.cr();
            this.tag('blockquote', attrs);
            this.cr();
        }
        else {
            this.cr();
            this.tag('/blockquote');
            this.cr();
        }
    };
    HtmlRenderer.prototype.list = function (node, entering) {
        var tagname = node.listType === 'bullet' ? 'ul' : 'ol';
        var attrs = this.attrs(node);
        if (entering) {
            var start = node.listStart;
            if (start !== null && start !== 1) {
                attrs.push(['start', start.toString()]);
            }
            this.cr();
            this.tag(tagname, attrs);
            this.cr();
        }
        else {
            this.cr();
            this.tag('/' + tagname);
            this.cr();
        }
    };
    HtmlRenderer.prototype.item = function (node, entering) {
        var attrs = this.attrs(node);
        if (entering) {
            this.tag('li', attrs);
        }
        else {
            this.tag('/li');
            this.cr();
        }
    };
    HtmlRenderer.prototype.html_inline = function (node) {
        if (this.options.safe) {
            this.lit('<!-- raw HTML omitted -->');
        }
        else {
            this.lit(node.literal);
        }
    };
    HtmlRenderer.prototype.html_block = function (node) {
        this.cr();
        if (this.options.safe) {
            this.lit('<!-- raw HTML omitted -->');
        }
        else {
            this.lit(node.literal);
        }
        this.cr();
    };
    HtmlRenderer.prototype.custom_inline = function (node, entering) {
        if (entering && node.onEnter) {
            this.lit(node.onEnter);
        }
        else if (!entering && node.onExit) {
            this.lit(node.onExit);
        }
    };
    HtmlRenderer.prototype.custom_block = function (node, entering) {
        this.cr();
        if (entering && node.onEnter) {
            this.lit(node.onEnter);
        }
        else if (!entering && node.onExit) {
            this.lit(node.onExit);
        }
        this.cr();
    };
    /* Helper methods */
    HtmlRenderer.prototype.out = function (s) {
        this.lit(common_1.escapeXml(s, false));
    };
    HtmlRenderer.prototype.attrs = function (node) {
        var att = [];
        if (this.options.sourcepos) {
            var pos = node.sourcepos;
            if (pos) {
                att.push(['data-sourcepos', String(pos[0][0]) + ':' +
                        String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                        String(pos[1][1])]);
            }
        }
        return att;
    };
    return HtmlRenderer;
}(renderer_1.Renderer));
exports.HtmlRenderer = HtmlRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvcmVuZGVyL2h0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQXNDO0FBRXRDLG9DQUE2QztBQUU3QyxJQUFNLGdCQUFnQixHQUFHLHFDQUFxQyxDQUFDO0FBQy9ELElBQU0sa0JBQWtCLEdBQUcscUNBQXFDLENBQUM7QUFFakUsSUFBTSxpQkFBaUIsR0FBRyxVQUFVLEdBQVc7SUFDM0MsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2RSxDQUFDLENBQUM7QUFRRjtJQUFrQyx3Q0FBUTtJQUV0QyxzQkFBb0IsT0FBaUM7UUFBakMsd0JBQUEsRUFBQSxZQUFpQztRQUFyRCxZQUNJLGlCQUFPLFNBU1Y7UUFWbUIsYUFBTyxHQUFQLE9BQU8sQ0FBMEI7UUFFakQsMkRBQTJEO1FBQzNELE9BQU8sQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUM7UUFDOUMsMkNBQTJDO1FBQzNDLDJEQUEyRDtRQUUzRCxLQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNyQixLQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNwQixLQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQzs7SUFDM0IsQ0FBQztJQUVELDBDQUEwQztJQUMxQywwQkFBRyxHQUFILFVBQUksSUFBWSxFQUFFLEtBQWtCLEVBQUUsV0FBcUI7UUFDdkQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsSUFBSSxNQUFNLFNBQVUsQ0FBQztZQUNyQixPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDLEVBQUUsQ0FBQztZQUNSLENBQUM7UUFDTCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNkLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUN2QixDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLCtCQUFRLEdBQVIsVUFBUyxJQUFVLEVBQUUsUUFBaUI7UUFDbEMsY0FBYztJQUNsQixDQUFDO0lBRUQsMkJBQUksR0FBSixVQUFLLElBQVU7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFpQixDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGdDQUFTLEdBQVQ7UUFDSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBbUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxnQ0FBUyxHQUFUO1FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRCwyQkFBSSxHQUFKLFVBQUssSUFBVSxFQUFFLFFBQWlCO1FBQzlCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsa0JBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxrQkFBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pELENBQUM7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25CLENBQUM7SUFDTCxDQUFDO0lBRUQsNEJBQUssR0FBTCxVQUFNLElBQVUsRUFBRSxRQUFpQjtRQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ1gsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7b0JBQ2pCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxrQkFBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDO3dCQUMvQyxTQUFTLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztZQUNMLENBQUM7WUFDRCxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztZQUN0QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLGtCQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsMkJBQUksR0FBSixVQUFLLElBQVUsRUFBRSxRQUFpQjtRQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELDZCQUFNLEdBQU4sVUFBTyxJQUFVLEVBQUUsUUFBaUI7UUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxnQ0FBUyxHQUFULFVBQVUsSUFBVSxFQUFFLFFBQWlCO1FBQ25DLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN2QyxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBSTtnQkFDcEIsV0FBVyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDeEIsTUFBTSxDQUFDO2dCQUNYLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNMLENBQUM7SUFFRCw4QkFBTyxHQUFQLFVBQVEsSUFBVSxFQUFFLFFBQWlCO1FBQ2pDLElBQU0sT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDO0lBRUQsMkJBQUksR0FBSixVQUFLLElBQVU7UUFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQWlCLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxpQ0FBVSxHQUFWLFVBQVcsSUFBVTtRQUNqQixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzRCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFdBQVcsR0FBRyxrQkFBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBaUIsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQscUNBQWMsR0FBZCxVQUFlLElBQVU7UUFDckIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVELGtDQUFXLEdBQVgsVUFBWSxJQUFVLEVBQUUsUUFBaUI7UUFDckMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDZCxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUFJLEdBQUosVUFBSyxJQUFVLEVBQUUsUUFBaUI7UUFDOUIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztRQUN6RCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9CLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNMLENBQUM7SUFFRCwyQkFBSSxHQUFKLFVBQUssSUFBVSxFQUFFLFFBQWlCO1FBQzlCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNMLENBQUM7SUFFRCxrQ0FBVyxHQUFYLFVBQVksSUFBVTtRQUNsQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQWlCLENBQUMsQ0FBQztRQUNyQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGlDQUFVLEdBQVYsVUFBVyxJQUFVO1FBQ2pCLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNWLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBaUIsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsb0NBQWEsR0FBYixVQUFjLElBQVUsRUFBRSxRQUFpQjtRQUN2QyxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0IsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixDQUFDO0lBQ0wsQ0FBQztJQUVELG1DQUFZLEdBQVosVUFBYSxJQUFVLEVBQUUsUUFBaUI7UUFDdEMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ1YsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRCxvQkFBb0I7SUFFcEIsMEJBQUcsR0FBSCxVQUFJLENBQVM7UUFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELDRCQUFLLEdBQUwsVUFBTSxJQUFVO1FBQ1osSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUc7d0JBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUc7d0JBQ2pELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0FBQyxBQW5RRCxDQUFrQyxtQkFBUSxHQW1RekM7QUFuUVksb0NBQVkifQ==
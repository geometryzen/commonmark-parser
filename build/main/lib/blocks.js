"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./node");
var common_1 = require("./common");
var CODE_INDENT = 4;
var C_TAB = 9;
var C_NEWLINE = 10;
var C_GREATERTHAN = 62;
var C_LESSTHAN = 60;
var C_SPACE = 32;
var C_OPEN_BRACKET = 91;
var inlines_1 = require("./inlines");
var reHtmlBlockOpen = [
    /./,
    /^<(?:script|pre|style)(?:\s|>|$)/i,
    /^<!--/,
    /^<[?]/,
    /^<![A-Z]/,
    /^<!\[CDATA\[/,
    /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|title|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
    new RegExp('^(?:' + common_1.OPENTAG + '|' + common_1.CLOSETAG + ')\\s*$', 'i')
];
var reHtmlBlockClose = [
    /./,
    /<\/(?:script|pre|style)>/i,
    /-->/,
    /\?>/,
    />/,
    /\]\]>/
];
var reThematicBreak = /^(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/;
var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;
var reNonSpace = /[^ \t\f\v\r\n]/;
var reBulletListMarker = /^[*+-]/;
var reOrderedListMarker = /^(\d{1,9})([.)])/;
var reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;
var reCodeFence = /^`{3,}(?!.*`)|^~{3,}(?!.*~)/;
var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;
var reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;
var reLineEnding = /\r\n|\n|\r/;
// Returns true if string contains only space characters.
var isBlank = function (s) {
    return !(reNonSpace.test(s));
};
var isSpaceOrTab = function (c) {
    return c === C_SPACE || c === C_TAB;
};
var peek = function (ln, pos) {
    if (pos < ln.length) {
        return ln.charCodeAt(pos);
    }
    else {
        return -1;
    }
};
// DOC PARSER
// These are methods of a Parser object, defined below.
// Returns true if block ends with a blank line, descending if needed
// into lists and sublists.
var endsWithBlankLine = function (block) {
    while (block) {
        if (block._lastLineBlank) {
            return true;
        }
        var t = block.type;
        if (t === 'list' || t === 'item') {
            block = block.lastChild;
        }
        else {
            break;
        }
    }
    return false;
};
// Parse a list marker and return data on the marker (type,
// start, delimiter, bullet character, padding) or null.
var parseListMarker = function (parser, container) {
    var rest = parser.currentLine.slice(parser.nextNonspace);
    var match;
    // var nextc;
    // var spacesStartCol;
    // var spacesStartOffset;
    var data = {
        type: null,
        tight: true,
        bulletChar: null,
        start: null,
        delimiter: null,
        padding: null,
        markerOffset: parser.indent
    };
    if ((match = rest.match(reBulletListMarker))) {
        data.type = 'bullet';
        data.bulletChar = match[0][0];
    }
    else if ((match = rest.match(reOrderedListMarker)) && (container.type !== 'paragraph' || match[1] === '1')) {
        data.type = 'ordered';
        data.start = parseInt(match[1]);
        data.delimiter = match[2];
    }
    else {
        return null;
    }
    // make sure we have spaces after
    var nextc = peek(parser.currentLine, parser.nextNonspace + match[0].length);
    if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
        return null;
    }
    // if it interrupts paragraph, make sure first line isn't blank
    if (container.type === 'paragraph' && !parser.currentLine.slice(parser.nextNonspace + match[0].length).match(reNonSpace)) {
        return null;
    }
    // we've got a match! advance offset and calculate padding
    parser.advanceNextNonspace(); // to start of marker
    parser.advanceOffset(match[0].length, true); // to end of marker
    var spacesStartCol = parser.column;
    var spacesStartOffset = parser.offset;
    do {
        parser.advanceOffset(1, true);
        nextc = peek(parser.currentLine, parser.offset);
    } while (parser.column - spacesStartCol < 5 &&
        isSpaceOrTab(nextc));
    var blank_item = peek(parser.currentLine, parser.offset) === -1;
    var spaces_after_marker = parser.column - spacesStartCol;
    if (spaces_after_marker >= 5 ||
        spaces_after_marker < 1 ||
        blank_item) {
        data.padding = match[0].length + 1;
        parser.column = spacesStartCol;
        parser.offset = spacesStartOffset;
        if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
            parser.advanceOffset(1, true);
        }
    }
    else {
        data.padding = match[0].length + spaces_after_marker;
    }
    return data;
};
// Returns true if the two list items are of the same type,
// with the same delimiter and bullet character.  This is used
// in agglomerating list items into lists.
var listsMatch = function (list_data, item_data) {
    return (list_data.type === item_data.type &&
        list_data.delimiter === item_data.delimiter &&
        list_data.bulletChar === item_data.bulletChar);
};
/**
 * The types are node types
 */
var blocks = {
    'document': {
        continue: function () { return 0; },
        finalize: function (parser, block) { return; },
        canContain: function (t) { return (t !== 'item'); },
        acceptsLines: false
    },
    'list': {
        continue: function () { return 0; },
        finalize: function (parser, block) {
            var item = block.firstChild;
            while (item) {
                // check for non-final list item ending with blank line:
                if (endsWithBlankLine(item) && item.next) {
                    block.listTight = false;
                    break;
                }
                // recurse into children of list item, to see if there are
                // spaces between any of them:
                var subitem = item.firstChild;
                while (subitem) {
                    if (endsWithBlankLine(subitem) &&
                        (item.next || subitem.next)) {
                        block.listTight = false;
                        break;
                    }
                    subitem = subitem.next;
                }
                item = item.next;
            }
        },
        canContain: function (t) { return (t === 'item'); },
        acceptsLines: false
    },
    'block_quote': {
        continue: function (parser) {
            var ln = parser.currentLine;
            if (!parser.indented &&
                peek(ln, parser.nextNonspace) === C_GREATERTHAN) {
                parser.advanceNextNonspace();
                parser.advanceOffset(1, false);
                if (isSpaceOrTab(peek(ln, parser.offset))) {
                    parser.advanceOffset(1, true);
                }
            }
            else {
                return 1;
            }
            return 0;
        },
        finalize: function (parser, block) { return; },
        canContain: function (t) { return (t !== 'item'); },
        acceptsLines: false
    },
    'item': {
        continue: function (parser, container) {
            if (parser.blank) {
                if (container.firstChild == null) {
                    // Blank line after empty list item
                    return 1;
                }
                else {
                    parser.advanceNextNonspace();
                }
            }
            else if (parser.indent >=
                container.listData.markerOffset +
                    container.listData.padding) {
                parser.advanceOffset(container.listData.markerOffset +
                    container.listData.padding, true);
            }
            else {
                return 1;
            }
            return 0;
        },
        finalize: function (parser, block) { return; },
        canContain: function (t) { return (t !== 'item'); },
        acceptsLines: false
    },
    'heading': {
        continue: function () {
            // a heading can never container > 1 line, so fail to match:
            return 1;
        },
        finalize: function (parser, block) { return; },
        canContain: function () { return false; },
        acceptsLines: false
    },
    'thematic_break': {
        continue: function () {
            // a thematic break can never container > 1 line, so fail to match:
            return 1;
        },
        finalize: function () { return; },
        canContain: function () { return false; },
        acceptsLines: false
    },
    'code_block': {
        continue: function (parser, container) {
            var ln = parser.currentLine;
            var indent = parser.indent;
            if (container.isFenced) {
                var match = (indent <= 3 &&
                    ln.charAt(parser.nextNonspace) === container.fenceChar &&
                    ln.slice(parser.nextNonspace).match(reClosingCodeFence));
                if (match && match[0].length >= container.fenceLength) {
                    // closing fence - we're at end of line, so we can return
                    parser.finalize(container, parser.lineNumber);
                    return 2;
                }
                else {
                    // skip optional spaces of fence offset
                    var i = container.fenceOffset;
                    while (i > 0 && isSpaceOrTab(peek(ln, parser.offset))) {
                        parser.advanceOffset(1, true);
                        i--;
                    }
                }
            }
            else {
                if (indent >= CODE_INDENT) {
                    parser.advanceOffset(CODE_INDENT, true);
                }
                else if (parser.blank) {
                    parser.advanceNextNonspace();
                }
                else {
                    return 1;
                }
            }
            return 0;
        },
        finalize: function (parser, block) {
            if (block.isFenced) {
                // first line becomes info string
                var content = block._string_content;
                var newlinePos = content.indexOf('\n');
                var firstLine = content.slice(0, newlinePos);
                var rest = content.slice(newlinePos + 1);
                block.info = common_1.unescapeString(firstLine.trim());
                block.literal = rest;
            }
            else {
                block.literal = block._string_content.replace(/(\n *)+$/, '\n');
            }
            block._string_content = null; // allow GC
        },
        canContain: function () { return false; },
        acceptsLines: true
    },
    'html_block': {
        continue: function (parser, container) {
            return ((parser.blank && (container.htmlBlockType === 6 || container.htmlBlockType === 7)) ? 1 : 0);
        },
        finalize: function (parser, block) {
            block.literal = block._string_content.replace(/(\n *)+$/, '');
            block._string_content = null; // allow GC
        },
        canContain: function () { return false; },
        acceptsLines: true
    },
    'paragraph': {
        continue: function (parser) {
            return (parser.blank ? 1 : 0);
        },
        finalize: function (parser, block) {
            var pos;
            var hasReferenceDefs = false;
            // try parsing the beginning as link reference definitions:
            while (peek(block._string_content, 0) === C_OPEN_BRACKET &&
                (pos = parser.inlineParser.parseReference(block._string_content, parser.refmap))) {
                block._string_content = block._string_content.slice(pos);
                hasReferenceDefs = true;
            }
            if (hasReferenceDefs && isBlank(block._string_content)) {
                block.unlink();
            }
        },
        canContain: function () { return false; },
        acceptsLines: true
    }
};
// block start functions.  Return values:
// 0 = no match
// 1 = matched container, keep going
// 2 = matched leaf, no more block starts
var blockStarts = [
    // block quote
    function (parser, unused) {
        if (!parser.indented &&
            peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
            parser.advanceNextNonspace();
            parser.advanceOffset(1, false);
            // optional following space
            if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
                parser.advanceOffset(1, true);
            }
            parser.closeUnmatchedBlocks();
            parser.addChild('block_quote', parser.nextNonspace);
            return 1;
        }
        else {
            return 0;
        }
    },
    // ATX heading
    function (parser, unused) {
        var match;
        if (!parser.indented &&
            (match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeadingMarker))) {
            parser.advanceNextNonspace();
            parser.advanceOffset(match[0].length, false);
            parser.closeUnmatchedBlocks();
            var container = parser.addChild('heading', parser.nextNonspace);
            container.level = match[0].trim().length; // number of #s
            // remove trailing ###s:
            container._string_content =
                parser.currentLine.slice(parser.offset).replace(/^ *#+ *$/, '').replace(/ +#+ *$/, '');
            parser.advanceOffset(parser.currentLine.length - parser.offset);
            return 2;
        }
        else {
            return 0;
        }
    },
    // Fenced code block
    function (parser, unused) {
        var match;
        if (!parser.indented &&
            (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
            var fenceLength = match[0].length;
            parser.closeUnmatchedBlocks();
            var container = parser.addChild('code_block', parser.nextNonspace);
            container.isFenced = true;
            container.fenceLength = fenceLength;
            container.fenceChar = match[0][0];
            container.fenceOffset = parser.indent;
            parser.advanceNextNonspace();
            parser.advanceOffset(fenceLength, false);
            return 2;
        }
        else {
            return 0;
        }
    },
    // HTML block
    function (parser, container) {
        if (!parser.indented &&
            peek(parser.currentLine, parser.nextNonspace) === C_LESSTHAN) {
            var s = parser.currentLine.slice(parser.nextNonspace);
            var blockType = void 0;
            for (blockType = 1; blockType <= 7; blockType++) {
                if (reHtmlBlockOpen[blockType].test(s) &&
                    (blockType < 7 ||
                        container.type !== 'paragraph')) {
                    parser.closeUnmatchedBlocks();
                    // We don't adjust parser.offset;
                    // spaces are part of the HTML block:
                    var b = parser.addChild('html_block', parser.offset);
                    b.htmlBlockType = blockType;
                    return 2;
                }
            }
        }
        return 0;
    },
    // Setext heading
    function (parser, container) {
        var match;
        if (!parser.indented &&
            container.type === 'paragraph' &&
            ((match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeadingLine)))) {
            parser.closeUnmatchedBlocks();
            var heading = new node_1.Node('heading', container.sourcepos);
            heading.level = match[0][0] === '=' ? 1 : 2;
            heading._string_content = container._string_content;
            container.insertAfter(heading);
            container.unlink();
            parser.tip = heading;
            parser.advanceOffset(parser.currentLine.length - parser.offset, false);
            return 2;
        }
        else {
            return 0;
        }
    },
    // thematic break
    function (parser) {
        if (!parser.indented &&
            reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))) {
            parser.closeUnmatchedBlocks();
            parser.addChild('thematic_break', parser.nextNonspace);
            parser.advanceOffset(parser.currentLine.length - parser.offset, false);
            return 2;
        }
        else {
            return 0;
        }
    },
    // list item
    function (parser, container) {
        var data;
        if ((!parser.indented || container.type === 'list')
            && (data = parseListMarker(parser, container))) {
            parser.closeUnmatchedBlocks();
            // add the list if needed
            if (parser.tip.type !== 'list' ||
                !(listsMatch(container.listData, data))) {
                container = parser.addChild('list', parser.nextNonspace);
                container.listData = data;
            }
            // add the list item
            container = parser.addChild('item', parser.nextNonspace);
            container.listData = data;
            return 1;
        }
        else {
            return 0;
        }
    },
    // indented code block
    function (parser) {
        if (parser.indented &&
            parser.tip.type !== 'paragraph' &&
            !parser.blank) {
            // indented code
            parser.advanceOffset(CODE_INDENT, true);
            parser.closeUnmatchedBlocks();
            parser.addChild('code_block', parser.offset);
            return 2;
        }
        else {
            return 0;
        }
    }
];
var Parser = (function () {
    function Parser(options) {
        if (options === void 0) { options = {}; }
        this.inlineParser = new inlines_1.InlineParser(options);
        this.options = options;
    }
    // The main parsing function.  Returns a parsed document AST.
    Parser.prototype.parse = function (input) {
        this.doc = new node_1.Node('document', [[1, 1], [0, 0]]);
        this.tip = this.doc;
        this.refmap = {};
        this.lineNumber = 0;
        this.lastLineLength = 0;
        this.offset = 0;
        this.column = 0;
        this.lastMatchedContainer = this.doc;
        this.currentLine = "";
        this.blockStarts = blockStarts;
        // if (this.options.time) { console.time("preparing input"); }
        var lines = input.split(reLineEnding);
        var len = lines.length;
        if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
            // ignore last blank line created by final newline
            len -= 1;
        }
        // if (this.options.time) { console.timeEnd("preparing input"); }
        // if (this.options.time) { console.time("block parsing"); }
        for (var i = 0; i < len; i++) {
            this.incorporateLine(lines[i]);
        }
        while (this.tip) {
            this.finalize(this.tip, len);
        }
        // if (this.options.time) { console.timeEnd("block parsing"); }
        // if (this.options.time) { console.time("inline parsing"); }
        this.processInlines(this.doc);
        // if (this.options.time) { console.timeEnd("inline parsing"); }
        return this.doc;
    };
    // Analyze a line of text and update the document appropriately.
    // We parse markdown text by calling this on each line of input,
    // then finalizing the document.
    Parser.prototype.incorporateLine = function (ln) {
        var all_matched = true;
        // var t;
        var container = this.doc;
        this.oldtip = this.tip;
        this.offset = 0;
        this.column = 0;
        this.blank = false;
        this.partiallyConsumedTab = false;
        this.lineNumber += 1;
        // replace NUL characters for security
        if (ln.indexOf('\u0000') !== -1) {
            ln = ln.replace(/\0/g, '\uFFFD');
        }
        this.currentLine = ln;
        // For each containing block, try to parse the associated line start.
        // Bail out on failure: container will point to the last matching block.
        // Set all_matched to false if not all containers match.
        var lastChild;
        while ((lastChild = container.lastChild) && lastChild.open) {
            container = lastChild;
            this.findNextNonspace();
            switch (this.blocks[container.type].continue(this, container)) {
                case 0:// we've matched, keep going
                    break;
                case 1:// we've failed to match a block
                    all_matched = false;
                    break;
                case 2:// we've hit end of line for fenced code close and can return
                    this.lastLineLength = ln.length;
                    return;
                default:
                    throw 'continue returned illegal value, must be 0, 1, or 2';
            }
            if (!all_matched) {
                container = container.parent; // back up to last matching block
                break;
            }
        }
        this.allClosed = (container === this.oldtip);
        this.lastMatchedContainer = container;
        var matchedLeaf = container.type !== 'paragraph' && blocks[container.type].acceptsLines;
        var starts = this.blockStarts;
        var startsLen = starts.length;
        // Unless last matched container is a code block, try new container starts,
        // adding children to the last matched container:
        while (!matchedLeaf) {
            this.findNextNonspace();
            // this is a little performance optimization:
            if (!this.indented &&
                !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
                this.advanceNextNonspace();
                break;
            }
            var i = 0;
            while (i < startsLen) {
                var res = starts[i](this, container);
                if (res === 1) {
                    container = this.tip;
                    break;
                }
                else if (res === 2) {
                    container = this.tip;
                    matchedLeaf = true;
                    break;
                }
                else {
                    i++;
                }
            }
            if (i === startsLen) {
                this.advanceNextNonspace();
                break;
            }
        }
        // What remains at the offset is a text line.  Add the text to the
        // appropriate container.
        // First check for a lazy paragraph continuation:
        if (!this.allClosed && !this.blank &&
            this.tip.type === 'paragraph') {
            // lazy paragraph continuation
            this.addLine();
        }
        else {
            // finalize any blocks not matched
            this.closeUnmatchedBlocks();
            if (this.blank && container.lastChild) {
                container.lastChild._lastLineBlank = true;
            }
            var t = container.type;
            // Block quote lines are never blank as they start with >
            // and we don't count blanks in fenced code for purposes of tight/loose
            // lists or breaking out of lists.  We also don't set _lastLineBlank
            // on an empty list item, or if we just closed a fenced block.
            var lastLineBlank = this.blank &&
                !(t === 'block_quote' ||
                    (t === 'code_block' && container.isFenced) ||
                    (t === 'item' &&
                        !container.firstChild &&
                        container.sourcepos[0][0] === this.lineNumber));
            // propagate lastLineBlank up through parents:
            var cont = container;
            while (cont) {
                cont._lastLineBlank = lastLineBlank;
                cont = cont.parent;
            }
            if (this.blocks[t].acceptsLines) {
                this.addLine();
                // if HtmlBlock, check for end condition
                if (t === 'html_block' &&
                    container.htmlBlockType >= 1 &&
                    container.htmlBlockType <= 5 &&
                    reHtmlBlockClose[container.htmlBlockType].test(this.currentLine.slice(this.offset))) {
                    this.finalize(container, this.lineNumber);
                }
            }
            else if (this.offset < ln.length && !this.blank) {
                // create paragraph container for line
                container = this.addChild('paragraph', this.offset);
                this.advanceNextNonspace();
                this.addLine();
            }
        }
        this.lastLineLength = ln.length;
    };
    Parser.prototype.advanceOffset = function (count, columns) {
        var currentLine = this.currentLine;
        // var charsToTab, charsToAdvance;
        var c;
        while (count > 0 && (c = currentLine[this.offset])) {
            if (c === '\t') {
                var charsToTab = 4 - (this.column % 4);
                if (columns) {
                    this.partiallyConsumedTab = charsToTab > count;
                    var charsToAdvance = charsToTab > count ? count : charsToTab;
                    this.column += charsToAdvance;
                    this.offset += this.partiallyConsumedTab ? 0 : 1;
                    count -= charsToAdvance;
                }
                else {
                    this.partiallyConsumedTab = false;
                    this.column += charsToTab;
                    this.offset += 1;
                    count -= 1;
                }
            }
            else {
                this.partiallyConsumedTab = false;
                this.offset += 1;
                this.column += 1; // assume ascii; block starts are ascii
                count -= 1;
            }
        }
    };
    Parser.prototype.advanceNextNonspace = function () {
        this.offset = this.nextNonspace;
        this.column = this.nextNonspaceColumn;
        this.partiallyConsumedTab = false;
    };
    Parser.prototype.findNextNonspace = function () {
        var currentLine = this.currentLine;
        var i = this.offset;
        var cols = this.column;
        var c;
        while ((c = currentLine.charAt(i)) !== '') {
            if (c === ' ') {
                i++;
                cols++;
            }
            else if (c === '\t') {
                i++;
                cols += (4 - (cols % 4));
            }
            else {
                break;
            }
        }
        this.blank = (c === '\n' || c === '\r' || c === '');
        this.nextNonspace = i;
        this.nextNonspaceColumn = cols;
        this.indent = this.nextNonspaceColumn - this.column;
        this.indented = this.indent >= CODE_INDENT;
    };
    // Finalize a block.  Close it and do any necessary postprocessing,
    // e.g. creating string_content from strings, setting the 'tight'
    // or 'loose' status of a list, and parsing the beginnings
    // of paragraphs for reference definitions.  Reset the tip to the
    // parent of the closed block.
    Parser.prototype.finalize = function (block, lineNumber) {
        var above = block.parent;
        block.open = false;
        block.sourcepos[1] = [lineNumber, this.lastLineLength];
        this.blocks[block.type].finalize(this, block);
        this.tip = above;
    };
    // Walk through a block & children recursively, parsing string content
    // into inline content where appropriate.
    Parser.prototype.processInlines = function (block) {
        var node;
        var event;
        var walker = block.walker();
        this.inlineParser.refmap = this.refmap;
        this.inlineParser.options = this.options;
        while ((event = walker.next())) {
            node = event.node;
            var t = node.type;
            if (!event.entering && (t === 'paragraph' || t === 'heading')) {
                this.inlineParser.parse(node);
            }
        }
    };
    // Add a line to the block at the tip.  We assume the tip
    // can accept lines -- that check should be done before calling this.
    Parser.prototype.addLine = function () {
        if (this.partiallyConsumedTab) {
            this.offset += 1; // skip over tab
            // add space characters:
            var charsToTab = 4 - (this.column % 4);
            this.tip._string_content += (' '.repeat(charsToTab));
        }
        this.tip._string_content += this.currentLine.slice(this.offset) + '\n';
    };
    // Add block of type tag as a child of the tip.  If the tip can't
    // accept children, close and finalize it and try its parent,
    // and so on til we find a block that can accept children.
    Parser.prototype.addChild = function (tag, offset) {
        while (!this.blocks[this.tip.type].canContain(tag)) {
            this.finalize(this.tip, this.lineNumber - 1);
        }
        var column_number = offset + 1; // offset 0 = column 1
        var newBlock = new node_1.Node(tag, [[this.lineNumber, column_number], [0, 0]]);
        newBlock._string_content = '';
        this.tip.appendChild(newBlock);
        this.tip = newBlock;
        return newBlock;
    };
    // Finalize and close any unmatched blocks.
    Parser.prototype.closeUnmatchedBlocks = function () {
        if (!this.allClosed) {
            // finalize any blocks not matched
            while (this.oldtip !== this.lastMatchedContainer) {
                var parent = this.oldtip.parent;
                this.finalize(this.oldtip, this.lineNumber - 1);
                this.oldtip = parent;
            }
            this.allClosed = true;
        }
    };
    return Parser;
}());
exports.Parser = Parser;
// The Parser object.
/*
function Parser(options) {
    return {
        doc: new Document(),
        blocks: blocks,
        blockStarts: blockStarts,
        tip: this.doc,
        oldtip: this.doc,
        currentLine: "",
        lineNumber: 0,
        offset: 0,
        column: 0,
        nextNonspace: 0,
        nextNonspaceColumn: 0,
        indent: 0,
        indented: false,
        blank: false,
        partiallyConsumedTab: false,
        allClosed: true,
        lastMatchedContainer: this.doc,
        refmap: {},
        lastLineLength: 0,
        inlineParser: new InlineParser(options),
        findNextNonspace: findNextNonspace,
        advanceOffset: advanceOffset,
        advanceNextNonspace: advanceNextNonspace,
        addLine: addLine,
        addChild: addChild,
        incorporateLine: incorporateLine,
        finalize: finalize,
        processInlines: processInlines,
        closeUnmatchedBlocks: closeUnmatchedBlocks,
        parse: parse,
        options: options || {}
    };
}
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9ibG9ja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBd0M7QUFFeEMsbUNBQTZEO0FBRTdELElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQUV0QixJQUFNLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDaEIsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN6QixJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLElBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUUxQixxQ0FBb0Q7QUFFcEQsSUFBTSxlQUFlLEdBQUc7SUFDcEIsR0FBRztJQUNILG1DQUFtQztJQUNuQyxPQUFPO0lBQ1AsT0FBTztJQUNQLFVBQVU7SUFDVixjQUFjO0lBQ2QsbVlBQW1ZO0lBQ25ZLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxnQkFBTyxHQUFHLEdBQUcsR0FBRyxpQkFBUSxHQUFHLFFBQVEsRUFBRSxHQUFHLENBQUM7Q0FDaEUsQ0FBQztBQUVGLElBQU0sZ0JBQWdCLEdBQUc7SUFDckIsR0FBRztJQUNILDJCQUEyQjtJQUMzQixLQUFLO0lBQ0wsS0FBSztJQUNMLEdBQUc7SUFDSCxPQUFPO0NBQ1YsQ0FBQztBQUVGLElBQU0sZUFBZSxHQUFHLDhEQUE4RCxDQUFDO0FBRXZGLElBQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDO0FBRTFDLElBQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDO0FBRXBDLElBQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDO0FBRXBDLElBQU0sbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUFFL0MsSUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQztBQUVqRCxJQUFNLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQztBQUVsRCxJQUFNLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDO0FBRXJELElBQU0sbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7QUFFaEQsSUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBRWxDLHlEQUF5RDtBQUN6RCxJQUFNLE9BQU8sR0FBRyxVQUFVLENBQVM7SUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDO0FBRUYsSUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFTO0lBQ3BDLE1BQU0sQ0FBQyxDQUFDLEtBQUssT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDeEMsQ0FBQyxDQUFDO0FBRUYsSUFBTSxJQUFJLEdBQUcsVUFBVSxFQUFVLEVBQUUsR0FBVztJQUMxQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGLGFBQWE7QUFFYix1REFBdUQ7QUFFdkQscUVBQXFFO0FBQ3JFLDJCQUEyQjtBQUMzQixJQUFNLGlCQUFpQixHQUFHLFVBQVUsS0FBVztJQUMzQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ1gsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsSUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQzVCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEtBQUssQ0FBQztRQUNWLENBQUM7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7QUFFRiwyREFBMkQ7QUFDM0Qsd0RBQXdEO0FBQ3hELElBQU0sZUFBZSxHQUFHLFVBQVUsTUFBYyxFQUFFLFNBQWU7SUFDN0QsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNELElBQUksS0FBdUIsQ0FBQztJQUM1QixhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLHlCQUF5QjtJQUN6QixJQUFNLElBQUksR0FBYTtRQUNuQixJQUFJLEVBQUUsSUFBSTtRQUNWLEtBQUssRUFBRSxJQUFJO1FBQ1gsVUFBVSxFQUFFLElBQUk7UUFDaEIsS0FBSyxFQUFFLElBQUk7UUFDWCxTQUFTLEVBQUUsSUFBSTtRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNO0tBQzlCLENBQUM7SUFDRixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbEMsQ0FBQztJQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssV0FBVyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekcsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFDO1FBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsaUNBQWlDO0lBQ2pDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELCtEQUErRDtJQUMvRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkgsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsMERBQTBEO0lBQzFELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMscUJBQXFCO0lBQ25ELE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtJQUNoRSxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3JDLElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUN4QyxHQUFHLENBQUM7UUFDQSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QixLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BELENBQUMsUUFBUSxNQUFNLENBQUMsTUFBTSxHQUFHLGNBQWMsR0FBRyxDQUFDO1FBQ3ZDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN6QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEUsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztJQUMzRCxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDO1FBQ3hCLG1CQUFtQixHQUFHLENBQUM7UUFDdkIsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNiLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7UUFDL0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUM7SUFDekQsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsMkRBQTJEO0FBQzNELDhEQUE4RDtBQUM5RCwwQ0FBMEM7QUFDMUMsSUFBTSxVQUFVLEdBQUcsVUFBVSxTQUFtQixFQUFFLFNBQW1CO0lBQ2pFLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUk7UUFDckMsU0FBUyxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsU0FBUztRQUMzQyxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2RCxDQUFDLENBQUM7QUFjRjs7R0FFRztBQUNILElBQU0sTUFBTSxHQUE4QjtJQUN0QyxVQUFVLEVBQUU7UUFDUixRQUFRLEVBQUUsY0FBYyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsS0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUQsVUFBVSxFQUFFLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsWUFBWSxFQUFFLEtBQUs7S0FDdEI7SUFDRCxNQUFNLEVBQUU7UUFDSixRQUFRLEVBQUUsY0FBYyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsS0FBVztZQUMzQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQzVCLE9BQU8sSUFBSSxFQUFFLENBQUM7Z0JBQ1Ysd0RBQXdEO2dCQUN4RCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDdkMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7b0JBQ3hCLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELDBEQUEwRDtnQkFDMUQsOEJBQThCO2dCQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUM5QixPQUFPLE9BQU8sRUFBRSxDQUFDO29CQUNiLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQzt3QkFDMUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO3dCQUN4QixLQUFLLENBQUM7b0JBQ1YsQ0FBQztvQkFDRCxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixDQUFDO1FBQ0wsQ0FBQztRQUNELFVBQVUsRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELFlBQVksRUFBRSxLQUFLO0tBQ3RCO0lBQ0QsYUFBYSxFQUFFO1FBQ1gsUUFBUSxFQUFFLFVBQVUsTUFBYztZQUM5QixJQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQ2hCLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUM3QixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO1FBQ0QsUUFBUSxFQUFFLFVBQVUsTUFBYyxFQUFFLEtBQVcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVELFVBQVUsRUFBRSxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELFlBQVksRUFBRSxLQUFLO0tBQ3RCO0lBQ0QsTUFBTSxFQUFFO1FBQ0osUUFBUSxFQUFFLFVBQVUsTUFBTSxFQUFFLFNBQVM7WUFDakMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMvQixtQ0FBbUM7b0JBQ25DLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDakMsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU07Z0JBQ3BCLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWTtvQkFDL0IsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWTtvQkFDaEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFDRCxRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsS0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUQsVUFBVSxFQUFFLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsWUFBWSxFQUFFLEtBQUs7S0FDdEI7SUFDRCxTQUFTLEVBQUU7UUFDUCxRQUFRLEVBQUU7WUFDTiw0REFBNEQ7WUFDNUQsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFDRCxRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsS0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDNUQsVUFBVSxFQUFFLGNBQWMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekMsWUFBWSxFQUFFLEtBQUs7S0FDdEI7SUFDRCxnQkFBZ0IsRUFBRTtRQUNkLFFBQVEsRUFBRTtZQUNOLG1FQUFtRTtZQUNuRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELFFBQVEsRUFBRSxjQUFjLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsVUFBVSxFQUFFLGNBQWMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekMsWUFBWSxFQUFFLEtBQUs7S0FDdEI7SUFDRCxZQUFZLEVBQUU7UUFDVixRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsU0FBZTtZQUMvQyxJQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQzlCLElBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDN0IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQ3RCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQyxTQUFTO29CQUN0RCxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDcEQseURBQXlEO29CQUN6RCxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQztvQkFDRix1Q0FBdUM7b0JBQ3ZDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7b0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUNwRCxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDOUIsQ0FBQyxFQUFFLENBQUM7b0JBQ1IsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUN4QixNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUNqQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQztZQUNMLENBQUM7WUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELFFBQVEsRUFBRSxVQUFVLE1BQWMsRUFBRSxLQUFXO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixpQ0FBaUM7Z0JBQ2pDLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7Z0JBQ3RDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsS0FBSyxDQUFDLElBQUksR0FBRyx1QkFBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN6QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEUsQ0FBQztZQUNELEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUMsV0FBVztRQUM3QyxDQUFDO1FBQ0QsVUFBVSxFQUFFLGNBQWMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekMsWUFBWSxFQUFFLElBQUk7S0FDckI7SUFDRCxZQUFZLEVBQUU7UUFDVixRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsU0FBZTtZQUMvQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3hHLENBQUM7UUFDRCxRQUFRLEVBQUUsVUFBVSxNQUFjLEVBQUUsS0FBVztZQUMzQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM5RCxLQUFLLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDLFdBQVc7UUFDN0MsQ0FBQztRQUNELFVBQVUsRUFBRSxjQUFjLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLFlBQVksRUFBRSxJQUFJO0tBQ3JCO0lBQ0QsV0FBVyxFQUFFO1FBQ1QsUUFBUSxFQUFFLFVBQVUsTUFBTTtZQUN0QixNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsUUFBUSxFQUFFLFVBQVUsTUFBYyxFQUFFLEtBQVc7WUFDM0MsSUFBSSxHQUFXLENBQUM7WUFDaEIsSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFFN0IsMkRBQTJEO1lBQzNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEtBQUssY0FBYztnQkFDcEQsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNuRixLQUFLLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6RCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDNUIsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7UUFDRCxVQUFVLEVBQUUsY0FBYyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN6QyxZQUFZLEVBQUUsSUFBSTtLQUNyQjtDQUNKLENBQUM7QUFNRix5Q0FBeUM7QUFDekMsZUFBZTtBQUNmLG9DQUFvQztBQUNwQyx5Q0FBeUM7QUFDekMsSUFBTSxXQUFXLEdBQWlCO0lBQzlCLGNBQWM7SUFDZCxVQUFVLE1BQWMsRUFBRSxNQUFZO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDN0IsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDL0IsMkJBQTJCO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xDLENBQUM7WUFDRCxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM5QixNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQUVELGNBQWM7SUFDZCxVQUFVLE1BQWMsRUFBRSxNQUFZO1FBQ2xDLElBQUksS0FBdUIsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQ2hCLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRixNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDOUIsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGVBQWU7WUFDekQsd0JBQXdCO1lBQ3hCLFNBQVMsQ0FBQyxlQUFlO2dCQUNyQixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNGLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztJQUNMLENBQUM7SUFFRCxvQkFBb0I7SUFDcEIsVUFBVSxNQUFjLEVBQUUsTUFBWTtRQUNsQyxJQUFJLEtBQXVCLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUNoQixDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDcEMsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDOUIsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JFLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQzFCLFNBQVMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQ3BDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN0QyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQsYUFBYTtJQUNiLFVBQVUsTUFBYyxFQUFFLFNBQWU7UUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEQsSUFBSSxTQUFTLFNBQVEsQ0FBQztZQUV0QixHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztnQkFDOUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLENBQUMsU0FBUyxHQUFHLENBQUM7d0JBQ1YsU0FBUyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO29CQUM5QixpQ0FBaUM7b0JBQ2pDLHFDQUFxQztvQkFDckMsSUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN2RCxDQUFDLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztvQkFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDYixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRWIsQ0FBQztJQUVELGlCQUFpQjtJQUNqQixVQUFVLE1BQWMsRUFBRSxTQUFlO1FBQ3JDLElBQUksS0FBdUIsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQ2hCLFNBQVMsQ0FBQyxJQUFJLEtBQUssV0FBVztZQUM5QixDQUFDLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlCLElBQU0sT0FBTyxHQUFHLElBQUksV0FBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekQsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDO1lBQ3BELFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0IsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQsaUJBQWlCO0lBQ2pCLFVBQVUsTUFBYztRQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQ2hCLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQsWUFBWTtJQUNaLFVBQVUsTUFBYyxFQUFFLFNBQWU7UUFDckMsSUFBSSxJQUFjLENBQUM7UUFFbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7ZUFDNUMsQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRCxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUU5Qix5QkFBeUI7WUFDekIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssTUFBTTtnQkFDMUIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN6RCxTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUM5QixDQUFDO1lBRUQsb0JBQW9CO1lBQ3BCLFNBQVMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDekQsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDMUIsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixVQUFVLE1BQWM7UUFDcEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDZixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxXQUFXO1lBQy9CLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEIsZ0JBQWdCO1lBQ2hCLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0NBRUosQ0FBQztBQVFGO0lBc0JJLGdCQUFZLE9BQTJCO1FBQTNCLHdCQUFBLEVBQUEsWUFBMkI7UUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHNCQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQUNELDZEQUE2RDtJQUM3RCxzQkFBSyxHQUFMLFVBQU0sS0FBYTtRQUNmLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxXQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQiw4REFBOEQ7UUFDOUQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN4QyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25ELGtEQUFrRDtZQUNsRCxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELGlFQUFpRTtRQUNqRSw0REFBNEQ7UUFDNUQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsK0RBQStEO1FBQy9ELDZEQUE2RDtRQUM3RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixnRUFBZ0U7UUFDaEUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDcEIsQ0FBQztJQUVELGdFQUFnRTtJQUNoRSxnRUFBZ0U7SUFDaEUsZ0NBQWdDO0lBQ2hDLGdDQUFlLEdBQWYsVUFBZ0IsRUFBVTtRQUN0QixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDdkIsU0FBUztRQUVULElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7UUFFckIsc0NBQXNDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFdEIscUVBQXFFO1FBQ3JFLHdFQUF3RTtRQUN4RSx3REFBd0Q7UUFDeEQsSUFBSSxTQUFlLENBQUM7UUFDcEIsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pELFNBQVMsR0FBRyxTQUFTLENBQUM7WUFFdEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFFeEIsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELEtBQUssQ0FBQyxDQUFFLDRCQUE0QjtvQkFDaEMsS0FBSyxDQUFDO2dCQUNWLEtBQUssQ0FBQyxDQUFFLGdDQUFnQztvQkFDcEMsV0FBVyxHQUFHLEtBQUssQ0FBQztvQkFDcEIsS0FBSyxDQUFDO2dCQUNWLEtBQUssQ0FBQyxDQUFFLDZEQUE2RDtvQkFDakUsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO29CQUNoQyxNQUFNLENBQUM7Z0JBQ1g7b0JBQ0ksTUFBTSxxREFBcUQsQ0FBQztZQUNwRSxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNmLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsaUNBQWlDO2dCQUMvRCxLQUFLLENBQUM7WUFDVixDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxTQUFTLENBQUM7UUFFdEMsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLElBQUksS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDeEYsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNoQyxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2hDLDJFQUEyRTtRQUMzRSxpREFBaUQ7UUFDakQsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRWxCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRXhCLDZDQUE2QztZQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNkLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQzNCLEtBQUssQ0FBQztZQUNWLENBQUM7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQztnQkFDbkIsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdkMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1osU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQ25CLEtBQUssQ0FBQztnQkFDVixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNGLENBQUMsRUFBRSxDQUFDO2dCQUNSLENBQUM7WUFDTCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUMzQixLQUFLLENBQUM7WUFDVixDQUFDO1FBQ0wsQ0FBQztRQUVELGtFQUFrRTtRQUNsRSx5QkFBeUI7UUFFekIsaURBQWlEO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLO1lBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsOEJBQThCO1lBQzlCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVuQixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFFRixrQ0FBa0M7WUFDbEMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzlDLENBQUM7WUFFRCxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBRXpCLHlEQUF5RDtZQUN6RCx1RUFBdUU7WUFDdkUsb0VBQW9FO1lBQ3BFLDhEQUE4RDtZQUM5RCxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSztnQkFDNUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxhQUFhO29CQUNqQixDQUFDLENBQUMsS0FBSyxZQUFZLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQztvQkFDMUMsQ0FBQyxDQUFDLEtBQUssTUFBTTt3QkFDVCxDQUFDLFNBQVMsQ0FBQyxVQUFVO3dCQUNyQixTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRTVELDhDQUE4QztZQUM5QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7WUFDckIsT0FBTyxJQUFJLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztnQkFDcEMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDdkIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLHdDQUF3QztnQkFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVk7b0JBQ2xCLFNBQVMsQ0FBQyxhQUFhLElBQUksQ0FBQztvQkFDNUIsU0FBUyxDQUFDLGFBQWEsSUFBSSxDQUFDO29CQUM1QixnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO1lBRUwsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsc0NBQXNDO2dCQUN0QyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25CLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ3BDLENBQUM7SUFFRCw4QkFBYSxHQUFiLFVBQWMsS0FBYSxFQUFFLE9BQWlCO1FBQzFDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMsa0NBQWtDO1FBQ2xDLElBQUksQ0FBUyxDQUFDO1FBQ2QsT0FBTyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNiLElBQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ1YsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQy9DLElBQU0sY0FBYyxHQUFHLFVBQVUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQztvQkFDL0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUM7b0JBQzlCLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pELEtBQUssSUFBSSxjQUFjLENBQUM7Z0JBQzVCLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztvQkFDbEMsSUFBSSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUM7b0JBQzFCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO29CQUNqQixLQUFLLElBQUksQ0FBQyxDQUFDO2dCQUNmLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsdUNBQXVDO2dCQUN6RCxLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsb0NBQW1CLEdBQW5CO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ3RDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7SUFDdEMsQ0FBQztJQUVELGlDQUFnQixHQUFoQjtRQUNJLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBUyxDQUFDO1FBRWQsT0FBTyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osQ0FBQyxFQUFFLENBQUM7Z0JBQ0osSUFBSSxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixDQUFDLEVBQUUsQ0FBQztnQkFDSixJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBQ0YsS0FBSyxDQUFDO1lBQ1YsQ0FBQztRQUNMLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQztJQUMvQyxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLGlFQUFpRTtJQUNqRSwwREFBMEQ7SUFDMUQsaUVBQWlFO0lBQ2pFLDhCQUE4QjtJQUM5Qix5QkFBUSxHQUFSLFVBQVMsS0FBVyxFQUFFLFVBQWtCO1FBQ3BDLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDM0IsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDbkIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsc0VBQXNFO0lBQ3RFLHlDQUF5QztJQUN6QywrQkFBYyxHQUFkLFVBQWUsS0FBVztRQUN0QixJQUFJLElBQVUsQ0FBQztRQUNmLElBQUksS0FBSyxDQUFDO1FBQ1YsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN6QyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDN0IsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDbEIsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssV0FBVyxJQUFJLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxxRUFBcUU7SUFDckUsd0JBQU8sR0FBUDtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7WUFDbEMsd0JBQXdCO1lBQ3hCLElBQU0sVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDM0UsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSw2REFBNkQ7SUFDN0QsMERBQTBEO0lBQzFELHlCQUFRLEdBQVIsVUFBUyxHQUFXLEVBQUUsTUFBYztRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFFRCxJQUFNLGFBQWEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO1FBQ3hELElBQU0sUUFBUSxHQUFHLElBQUksV0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsUUFBUSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7UUFDcEIsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLHFDQUFvQixHQUFwQjtRQUNJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsa0NBQWtDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDL0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUN6QixDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDMUIsQ0FBQztJQUNMLENBQUM7SUFFTCxhQUFDO0FBQUQsQ0FBQyxBQXRWRCxJQXNWQztBQXRWWSx3QkFBTTtBQXlWbkIscUJBQXFCO0FBQ3JCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvQ0UifQ==
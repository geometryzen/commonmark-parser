import { Node } from './node';
import { OPENTAG, CLOSETAG, unescapeString } from './common';
var CODE_INDENT = 4;
var C_TAB = 9;
var C_NEWLINE = 10;
var C_GREATERTHAN = 62;
var C_LESSTHAN = 60;
var C_SPACE = 32;
var C_OPEN_BRACKET = 91;
import { InlineParser } from './inlines';
var reHtmlBlockOpen = [
    /./,
    /^<(?:script|pre|style)(?:\s|>|$)/i,
    /^<!--/,
    /^<[?]/,
    /^<![A-Z]/,
    /^<!\[CDATA\[/,
    /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|title|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
    new RegExp('^(?:' + OPENTAG + '|' + CLOSETAG + ')\\s*$', 'i')
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
                block.info = unescapeString(firstLine.trim());
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
            var heading = new Node('heading', container.sourcepos);
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
        this.inlineParser = new InlineParser(options);
        this.options = options;
        this.blocks = blocks;
        this.blockStarts = blockStarts;
    }
    // The main parsing function.  Returns a parsed document AST.
    Parser.prototype.parse = function (input) {
        this.doc = new Node('document', [[1, 1], [0, 0]]);
        this.tip = this.doc;
        this.refmap = {};
        this.lineNumber = 0;
        this.lastLineLength = 0;
        this.offset = 0;
        this.column = 0;
        this.lastMatchedContainer = this.doc;
        this.currentLine = "";
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
        var newBlock = new Node(tag, [[this.lineNumber, column_number], [0, 0]]);
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
export { Parser };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9ibG9ja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBWSxNQUFNLFFBQVEsQ0FBQztBQUV4QyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFN0QsSUFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBRXRCLElBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNoQixJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsSUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0QixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsSUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBRTFCLE9BQU8sRUFBRSxZQUFZLEVBQWEsTUFBTSxXQUFXLENBQUM7QUFFcEQsSUFBTSxlQUFlLEdBQUc7SUFDcEIsR0FBRztJQUNILG1DQUFtQztJQUNuQyxPQUFPO0lBQ1AsT0FBTztJQUNQLFVBQVU7SUFDVixjQUFjO0lBQ2QsbVlBQW1ZO0lBQ25ZLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLFFBQVEsR0FBRyxRQUFRLEVBQUUsR0FBRyxDQUFDO0NBQ2hFLENBQUM7QUFFRixJQUFNLGdCQUFnQixHQUFHO0lBQ3JCLEdBQUc7SUFDSCwyQkFBMkI7SUFDM0IsS0FBSztJQUNMLEtBQUs7SUFDTCxHQUFHO0lBQ0gsT0FBTztDQUNWLENBQUM7QUFFRixJQUFNLGVBQWUsR0FBRyw4REFBOEQsQ0FBQztBQUV2RixJQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztBQUUxQyxJQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQztBQUVwQyxJQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQztBQUVwQyxJQUFNLG1C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
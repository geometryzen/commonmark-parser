"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("./node");
var common_1 = require("./common");
var normalize_reference_1 = require("./normalize-reference");
var entities_1 = require("./entities");
// Constants for character codes:
var C_NEWLINE = 10;
var C_ASTERISK = 42;
var C_UNDERSCORE = 95;
var C_BACKTICK = 96;
var C_OPEN_BRACKET = 91;
var C_CLOSE_BRACKET = 93;
var C_LESSTHAN = 60;
var C_BANG = 33;
var C_BACKSLASH = 92;
var C_AMPERSAND = 38;
var C_OPEN_PAREN = 40;
var C_CLOSE_PAREN = 41;
var C_COLON = 58;
var C_SINGLEQUOTE = 39;
var C_DOUBLEQUOTE = 34;
// Some regexps used in inline parser:
var ESCAPED_CHAR = '\\\\' + common_1.ESCAPABLE;
var rePunctuation = new RegExp(/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/);
var reLinkTitle = new RegExp('^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
    '|' +
    '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
    '|' +
    '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');
var reLinkDestinationBraces = new RegExp('^(?:[<](?:[^ <>\\t\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');
var reEscapable = new RegExp('^' + common_1.ESCAPABLE);
var reEntityHere = new RegExp('^' + common_1.ENTITY, 'i');
var reTicks = /`+/;
var reTicksHere = /^`+/;
var reEllipses = /\.\.\./g;
var reDash = /--+/g;
var reEmailAutolink = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;
var reSpnl = /^ *(?:\n *)?/;
var reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;
var reWhitespace = /[ \t\n\x0b\x0c\x0d]+/g;
var reUnicodeWhitespaceChar = /^\s/;
var reFinalSpace = / *$/;
var reInitialSpace = /^ */;
var reSpaceAtEndOfLine = /^ *(?:\n|$)/;
var reLinkLabel = new RegExp('^\\[(?:[^\\\\\\[\\]]|' + ESCAPED_CHAR +
    '|\\\\){0,1000}\\]');
// Matches a string of non-special characters.
var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;
var text = function (s) {
    var node = new node_1.Node('text');
    node.literal = s;
    return node;
};
var InlineParser = (function () {
    function InlineParser(options) {
        if (options === void 0) { options = {}; }
        this.subject = '';
        this.delimiters = null;
        this.brackets = null;
        this.pos = 0;
        this.refmap = {};
        this.options = options;
    }
    InlineParser.prototype.parse = function (block) {
        return this.parseInlines(block);
    };
    /**
     * Parse string content in block into inline children,
     * using refmap to resolve references.
     * @param block
     */
    InlineParser.prototype.parseInlines = function (block) {
        this.subject = block._string_content.trim();
        this.pos = 0;
        this.delimiters = null;
        this.brackets = null;
        while (this.parseInline(block)) {
            // Do nothing else.
        }
        block._string_content = null; // allow raw string to be garbage collected
        this.processEmphasis(null);
    };
    /**
     * Parse the next inline element in subject, advancing subject position.
     * On success, add the result to block's children and return true.
     * On failure, return false.
     * @param block
     */
    InlineParser.prototype.parseInline = function (block) {
        var res = false;
        var c = this.peek();
        if (c === -1) {
            return false;
        }
        switch (c) {
            case C_NEWLINE:
                res = this.parseNewline(block);
                break;
            case C_BACKSLASH:
                res = this.parseBackslash(block);
                break;
            case C_BACKTICK:
                res = this.parseBackticks(block);
                break;
            case C_ASTERISK:
            case C_UNDERSCORE:
                res = this.handleDelim(c, block);
                break;
            case C_SINGLEQUOTE:
            case C_DOUBLEQUOTE:
                res = this.options.smart && this.handleDelim(c, block);
                break;
            case C_OPEN_BRACKET:
                res = this.parseOpenBracket(block);
                break;
            case C_BANG:
                res = this.parseBang(block);
                break;
            case C_CLOSE_BRACKET:
                res = this.parseCloseBracket(block);
                break;
            case C_LESSTHAN:
                res = this.parseAutolink(block) || this.parseHtmlTag(block);
                break;
            case C_AMPERSAND:
                res = this.parseEntity(block);
                break;
            default:
                res = this.parseString(block);
                break;
        }
        if (!res) {
            this.pos += 1;
            block.appendChild(text(String.fromCodePoint(c)));
        }
        return true;
    };
    /**
     * Parse a newline.  If it was preceded by two spaces, return a hard
     * line break; otherwise a soft line break.
     * @param block
     */
    InlineParser.prototype.parseNewline = function (block) {
        this.pos += 1; // assume we're at a \n
        // check previous node for trailing spaces
        var lastc = block.lastChild;
        if (lastc && lastc.type === 'text' && lastc.literal[lastc.literal.length - 1] === ' ') {
            var hardbreak = lastc.literal[lastc.literal.length - 2] === ' ';
            lastc.literal = lastc.literal.replace(reFinalSpace, '');
            block.appendChild(new node_1.Node(hardbreak ? 'linebreak' : 'softbreak'));
        }
        else {
            block.appendChild(new node_1.Node('softbreak'));
        }
        this.match(reInitialSpace); // gobble leading spaces in next line
        return true;
    };
    /**
     * Parse a run of ordinary characters, or a single character with
     * a special meaning in markdown, as a plain string.
     * @param block
     */
    InlineParser.prototype.parseString = function (block) {
        var m;
        if ((m = this.match(reMain))) {
            if (this.options.smart) {
                block.appendChild(text(m.replace(reEllipses, "\u2026")
                    .replace(reDash, function (chars) {
                    var enCount = 0;
                    var emCount = 0;
                    if (chars.length % 3 === 0) {
                        emCount = chars.length / 3;
                    }
                    else if (chars.length % 2 === 0) {
                        enCount = chars.length / 2;
                    }
                    else if (chars.length % 3 === 2) {
                        enCount = 1;
                        emCount = (chars.length - 2) / 3;
                    }
                    else {
                        enCount = 2;
                        emCount = (chars.length - 4) / 3;
                    }
                    return "\u2014".repeat(emCount) + "\u2013".repeat(enCount);
                })));
            }
            else {
                block.appendChild(text(m));
            }
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Attempt to parse an entity.
     * @param block
     */
    InlineParser.prototype.parseEntity = function (block) {
        var m;
        if ((m = this.match(reEntityHere))) {
            // decodeHTML comes from the entities library.
            block.appendChild(text(entities_1.decodeHTML(m)));
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Attempt to parse a link reference, modifying refmap.
     * @param s
     * @param refmap
     */
    InlineParser.prototype.parseReference = function (s, refmap) {
        this.subject = s;
        this.pos = 0;
        var rawlabel;
        var dest;
        var title;
        var matchChars;
        var startpos = this.pos;
        // label:
        matchChars = this.parseLinkLabel();
        if (matchChars === 0) {
            return 0;
        }
        else {
            rawlabel = this.subject.substr(0, matchChars);
        }
        // colon:
        if (this.peek() === C_COLON) {
            this.pos++;
        }
        else {
            this.pos = startpos;
            return 0;
        }
        //  link url
        this.spnl();
        dest = this.parseLinkDestination();
        if (dest === null || dest.length === 0) {
            this.pos = startpos;
            return 0;
        }
        var beforetitle = this.pos;
        this.spnl();
        title = this.parseLinkTitle();
        if (title === null) {
            title = '';
            // rewind before spaces
            this.pos = beforetitle;
        }
        // make sure we're at line end:
        var atLineEnd = true;
        if (this.match(reSpaceAtEndOfLine) === null) {
            if (title === '') {
                atLineEnd = false;
            }
            else {
                // the potential title we found is not at the line end,
                // but it could still be a legal link reference if we
                // discard the title
                title = '';
                // rewind before spaces
                this.pos = beforetitle;
                // and instead check if the link URL is at the line end
                atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
            }
        }
        if (!atLineEnd) {
            this.pos = startpos;
            return 0;
        }
        var normlabel = normalize_reference_1.normalizeReference(rawlabel);
        if (normlabel === '') {
            // label must contain non-whitespace characters
            this.pos = startpos;
            return 0;
        }
        if (!refmap[normlabel]) {
            refmap[normlabel] = { destination: dest, title: title };
        }
        return this.pos - startpos;
    };
    // If re matches at current position in the subject, advance
    // position in subject and return the match; otherwise return null.
    InlineParser.prototype.match = function (re) {
        var m = re.exec(this.subject.slice(this.pos));
        if (m === null) {
            return null;
        }
        else {
            this.pos += m.index + m[0].length;
            return m[0];
        }
    };
    // Returns the code for the character at the current subject position, or -1
    // there are no more characters.
    InlineParser.prototype.peek = function () {
        if (this.pos < this.subject.length) {
            return this.subject.charCodeAt(this.pos);
        }
        else {
            return -1;
        }
    };
    // Parse zero or more space characters, including at most one newline
    InlineParser.prototype.spnl = function () {
        this.match(reSpnl);
        return true;
    };
    // All of the parsers below try to match something at the current position
    // in the subject.  If they succeed in matching anything, they
    // return the inline matched, advancing the subject.
    // Attempt to parse backticks, adding either a backtick code span or a
    // literal sequence of backticks.
    InlineParser.prototype.parseBackticks = function (block) {
        var ticks = this.match(reTicksHere);
        if (ticks === null) {
            return false;
        }
        var afterOpenTicks = this.pos;
        var matched;
        var node;
        while ((matched = this.match(reTicks)) !== null) {
            if (matched === ticks) {
                node = new node_1.Node('code');
                node.literal = this.subject.slice(afterOpenTicks, this.pos - ticks.length)
                    .trim().replace(reWhitespace, ' ');
                block.appendChild(node);
                return true;
            }
        }
        // If we got here, we didn't match a closing backtick sequence.
        this.pos = afterOpenTicks;
        block.appendChild(text(ticks));
        return true;
    };
    // Parse a backslash-escaped special character, adding either the escaped
    // character, a hard line break (if the backslash is followed by a newline),
    // or a literal backslash to the block's children.  Assumes current character
    // is a backslash.
    InlineParser.prototype.parseBackslash = function (block) {
        var subj = this.subject;
        this.pos += 1;
        if (this.peek() === C_NEWLINE) {
            this.pos += 1;
            var node = new node_1.Node('linebreak');
            block.appendChild(node);
        }
        else if (reEscapable.test(subj.charAt(this.pos))) {
            block.appendChild(text(subj.charAt(this.pos)));
            this.pos += 1;
        }
        else {
            block.appendChild(text('\\'));
        }
        return true;
    };
    // Attempt to parse an autolink (URL or email in pointy brackets).
    InlineParser.prototype.parseAutolink = function (block) {
        var m;
        if ((m = this.match(reEmailAutolink))) {
            var dest = m.slice(1, m.length - 1);
            var node = new node_1.Node('link');
            node.destination = common_1.normalizeURI('mailto:' + dest);
            node.title = '';
            node.appendChild(text(dest));
            block.appendChild(node);
            return true;
        }
        else if ((m = this.match(reAutolink))) {
            var dest = m.slice(1, m.length - 1);
            var node = new node_1.Node('link');
            node.destination = common_1.normalizeURI(dest);
            node.title = '';
            node.appendChild(text(dest));
            block.appendChild(node);
            return true;
        }
        else {
            return false;
        }
    };
    // Attempt to parse a raw HTML tag.
    InlineParser.prototype.parseHtmlTag = function (block) {
        var m = this.match(common_1.reHtmlTag);
        if (m === null) {
            return false;
        }
        else {
            var node = new node_1.Node('html_inline');
            node.literal = m;
            block.appendChild(node);
            return true;
        }
    };
    // Scan a sequence of characters with code cc, and return information about
    // the number of delimiters and whether they are positioned such that
    // they can open and/or close emphasis or strong emphasis.  A utility
    // function for strong/emph parsing.
    InlineParser.prototype.scanDelims = function (cc) {
        var numdelims = 0;
        // let char_before: string, char_after, cc_after;
        var startpos = this.pos;
        // var left_flanking, right_flanking, can_open, can_close;
        // var after_is_whitespace, after_is_punctuation, before_is_whitespace, before_is_punctuation;
        if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
            numdelims++;
            this.pos++;
        }
        else {
            while (this.peek() === cc) {
                numdelims++;
                this.pos++;
            }
        }
        if (numdelims === 0) {
            return null;
        }
        var char_before = startpos === 0 ? '\n' : this.subject.charAt(startpos - 1);
        var char_after;
        var cc_after = this.peek();
        if (cc_after === -1) {
            char_after = '\n';
        }
        else {
            char_after = String.fromCodePoint(cc_after);
        }
        var after_is_whitespace = reUnicodeWhitespaceChar.test(char_after);
        var after_is_punctuation = rePunctuation.test(char_after);
        var before_is_whitespace = reUnicodeWhitespaceChar.test(char_before);
        var before_is_punctuation = rePunctuation.test(char_before);
        var left_flanking = !after_is_whitespace &&
            (!after_is_punctuation || before_is_whitespace || before_is_punctuation);
        var right_flanking = !before_is_whitespace &&
            (!before_is_punctuation || after_is_whitespace || after_is_punctuation);
        var can_open;
        var can_close;
        if (cc === C_UNDERSCORE) {
            can_open = left_flanking && (!right_flanking || before_is_punctuation);
            can_close = right_flanking && (!left_flanking || after_is_punctuation);
        }
        else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
            can_open = left_flanking && !right_flanking;
            can_close = right_flanking;
        }
        else {
            can_open = left_flanking;
            can_close = right_flanking;
        }
        this.pos = startpos;
        return {
            numdelims: numdelims,
            can_open: can_open,
            can_close: can_close
        };
    };
    // Handle a delimiter marker for emphasis or a quote.
    InlineParser.prototype.handleDelim = function (cc, block) {
        var res = this.scanDelims(cc);
        if (!res) {
            return false;
        }
        var numdelims = res.numdelims;
        var startpos = this.pos;
        var contents;
        this.pos += numdelims;
        if (cc === C_SINGLEQUOTE) {
            contents = "\u2019";
        }
        else if (cc === C_DOUBLEQUOTE) {
            contents = "\u201C";
        }
        else {
            contents = this.subject.slice(startpos, this.pos);
        }
        var node = text(contents);
        block.appendChild(node);
        // Add entry to stack for this opener
        this.delimiters = {
            cc: cc,
            numdelims: numdelims,
            origdelims: numdelims,
            node: node,
            previous: this.delimiters,
            next: null,
            can_open: res.can_open,
            can_close: res.can_close
        };
        if (this.delimiters.previous !== null) {
            this.delimiters.previous.next = this.delimiters;
        }
        return true;
    };
    InlineParser.prototype.removeDelimiter = function (delim) {
        if (delim.previous !== null) {
            delim.previous.next = delim.next;
        }
        if (delim.next === null) {
            // top of stack
            this.delimiters = delim.previous;
        }
        else {
            delim.next.previous = delim.previous;
        }
    };
    InlineParser.prototype.removeDelimitersBetween = function (bottom, top) {
        if (bottom.next !== top) {
            bottom.next = top;
            top.previous = bottom;
        }
    };
    InlineParser.prototype.processEmphasis = function (stack_bottom) {
        // var opener, old_closer;
        // var opener_inl, closer_inl;
        // var tempstack;
        // var use_delims;
        // var tmp, next;
        var opener_found;
        var openers_bottom = [];
        var odd_match = false;
        openers_bottom[C_UNDERSCORE] = stack_bottom;
        openers_bottom[C_ASTERISK] = stack_bottom;
        openers_bottom[C_SINGLEQUOTE] = stack_bottom;
        openers_bottom[C_DOUBLEQUOTE] = stack_bottom;
        // find first closer above stack_bottom:
        var closer = this.delimiters;
        while (closer !== null && closer.previous !== stack_bottom) {
            closer = closer.previous;
        }
        // move forward, looking for closers, and handling each
        while (closer !== null) {
            var closercc = closer.cc;
            if (!closer.can_close) {
                closer = closer.next;
            }
            else {
                // found emphasis closer. now look back for first matching opener:
                var opener = closer.previous;
                opener_found = false;
                while (opener !== null && opener !== stack_bottom &&
                    opener !== openers_bottom[closercc]) {
                    odd_match = (closer.can_open || opener.can_close) &&
                        (opener.origdelims + closer.origdelims) % 3 === 0;
                    if (opener.cc === closer.cc && opener.can_open && !odd_match) {
                        opener_found = true;
                        break;
                    }
                    opener = opener.previous;
                }
                var old_closer = closer;
                if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
                    if (!opener_found) {
                        closer = closer.next;
                    }
                    else {
                        // calculate actual number of delimiters used from closer
                        var use_delims = (closer.numdelims >= 2 && opener.numdelims >= 2) ? 2 : 1;
                        var opener_inl = opener.node;
                        var closer_inl = closer.node;
                        // remove used delimiters from stack elts and inlines
                        opener.numdelims -= use_delims;
                        closer.numdelims -= use_delims;
                        opener_inl.literal =
                            opener_inl.literal.slice(0, opener_inl.literal.length - use_delims);
                        closer_inl.literal =
                            closer_inl.literal.slice(0, closer_inl.literal.length - use_delims);
                        // build contents for new emph element
                        var emph = new node_1.Node(use_delims === 1 ? 'emph' : 'strong');
                        var tmp = opener_inl.next;
                        while (tmp && tmp !== closer_inl) {
                            var next = tmp.next;
                            tmp.unlink();
                            emph.appendChild(tmp);
                            tmp = next;
                        }
                        opener_inl.insertAfter(emph);
                        // remove elts between opener and closer in delimiters stack
                        this.removeDelimitersBetween(opener, closer);
                        // if opener has 0 delims, remove it and the inline
                        if (opener.numdelims === 0) {
                            opener_inl.unlink();
                            this.removeDelimiter(opener);
                        }
                        if (closer.numdelims === 0) {
                            closer_inl.unlink();
                            var tempstack = closer.next;
                            this.removeDelimiter(closer);
                            closer = tempstack;
                        }
                    }
                }
                else if (closercc === C_SINGLEQUOTE) {
                    closer.node.literal = "\u2019";
                    if (opener_found) {
                        opener.node.literal = "\u2018";
                    }
                    closer = closer.next;
                }
                else if (closercc === C_DOUBLEQUOTE) {
                    closer.node.literal = "\u201D";
                    if (opener_found) {
                        opener.node.literal = "\u201C";
                    }
                    closer = closer.next;
                }
                if (!opener_found && !odd_match) {
                    // Set lower bound for future searches for openers:
                    // We don't do this with odd_match because a **
                    // that doesn't match an earlier * might turn into
                    // an opener, and the * might be matched by something
                    // else.
                    openers_bottom[closercc] = old_closer.previous;
                    if (!old_closer.can_open) {
                        // We can remove a closer that can't be an opener,
                        // once we've seen there's no matching opener:
                        this.removeDelimiter(old_closer);
                    }
                }
            }
        }
        // remove all delimiters
        while (this.delimiters !== null && this.delimiters !== stack_bottom) {
            this.removeDelimiter(this.delimiters);
        }
    };
    // Attempt to parse link title (sans quotes), returning the string
    // or null if no match.
    InlineParser.prototype.parseLinkTitle = function () {
        var title = this.match(reLinkTitle);
        if (title === null) {
            return null;
        }
        else {
            // chop off quotes from title and unescape:
            return common_1.unescapeString(title.substr(1, title.length - 2));
        }
    };
    // Attempt to parse link destination, returning the string or
    // null if no match.
    InlineParser.prototype.parseLinkDestination = function () {
        var res = this.match(reLinkDestinationBraces);
        if (res === null) {
            // TODO handrolled parser; res should be null or the string
            var savepos = this.pos;
            var openparens = 0;
            var c = void 0;
            while ((c = this.peek()) !== -1) {
                if (c === C_BACKSLASH) {
                    this.pos += 1;
                    if (this.peek() !== -1) {
                        this.pos += 1;
                    }
                }
                else if (c === C_OPEN_PAREN) {
                    this.pos += 1;
                    openparens += 1;
                }
                else if (c === C_CLOSE_PAREN) {
                    if (openparens < 1) {
                        break;
                    }
                    else {
                        this.pos += 1;
                        openparens -= 1;
                    }
                }
                else if (reWhitespaceChar.exec(String.fromCodePoint(c)) !== null) {
                    break;
                }
                else {
                    this.pos += 1;
                }
            }
            res = this.subject.substr(savepos, this.pos - savepos);
            return common_1.normalizeURI(common_1.unescapeString(res));
        }
        else {
            return common_1.normalizeURI(common_1.unescapeString(res.substr(1, res.length - 2)));
        }
    };
    // Attempt to parse a link label, returning number of characters parsed.
    InlineParser.prototype.parseLinkLabel = function () {
        var m = this.match(reLinkLabel);
        // Note:  our regex will allow something of form [..\];
        // we disallow it here rather than using lookahead in the regex:
        if (m === null || m.length > 1001 || /[^\\]\\\]$/.exec(m)) {
            return 0;
        }
        else {
            return m.length;
        }
    };
    // Add open bracket to delimiter stack and add a text node to block's children.
    InlineParser.prototype.parseOpenBracket = function (block) {
        var startpos = this.pos;
        this.pos += 1;
        var node = text('[');
        block.appendChild(node);
        // Add entry to stack for this opener
        this.addBracket(node, startpos, false);
        return true;
    };
    // IF next character is [, and ! delimiter to delimiter stack and
    // add a text node to block's children.  Otherwise just add a text node.
    InlineParser.prototype.parseBang = function (block) {
        var startpos = this.pos;
        this.pos += 1;
        if (this.peek() === C_OPEN_BRACKET) {
            this.pos += 1;
            var node = text('![');
            block.appendChild(node);
            // Add entry to stack for this opener
            this.addBracket(node, startpos + 1, true);
        }
        else {
            block.appendChild(text('!'));
        }
        return true;
    };
    // Try to match close bracket against an opening in the delimiter
    // stack.  Add either a link or image, or a plain [ character,
    // to block's children.  If there is a matching delimiter,
    // remove it from the delimiter stack.
    InlineParser.prototype.parseCloseBracket = function (block) {
        var dest;
        var title;
        var matched = false;
        var reflabel;
        this.pos += 1;
        var startpos = this.pos;
        // get last [ or ![
        var opener = this.brackets;
        if (opener === null) {
            // no matched opener, just return a literal
            block.appendChild(text(']'));
            return true;
        }
        if (!opener.active) {
            // no matched opener, just return a literal
            block.appendChild(text(']'));
            // take opener off brackets stack
            this.removeBracket();
            return true;
        }
        // If we got here, open is a potential opener
        var is_image = opener.image;
        // Check to see if we have a link/image
        var savepos = this.pos;
        // Inline link?
        if (this.peek() === C_OPEN_PAREN) {
            this.pos++;
            if (this.spnl() &&
                ((dest = this.parseLinkDestination()) !== null) &&
                this.spnl() &&
                // make sure there's a space before the title:
                (reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
                    (title = this.parseLinkTitle()) || true) &&
                this.spnl() &&
                this.peek() === C_CLOSE_PAREN) {
                this.pos += 1;
                matched = true;
            }
            else {
                this.pos = savepos;
            }
        }
        if (!matched) {
            // Next, see if there's a link label
            var beforelabel = this.pos;
            var n = this.parseLinkLabel();
            if (n > 2) {
                reflabel = this.subject.slice(beforelabel, beforelabel + n);
            }
            else if (!opener.bracketAfter) {
                // Empty or missing second label means to use the first label as the reference.
                // The reference must not contain a bracket. If we know there's a bracket, we don't even bother checking it.
                reflabel = this.subject.slice(opener.index, startpos);
            }
            if (n === 0) {
                // If shortcut reference link, rewind before spaces we skipped.
                this.pos = savepos;
            }
            if (reflabel) {
                // lookup rawlabel in refmap
                var link = this.refmap[normalize_reference_1.normalizeReference(reflabel)];
                if (link) {
                    dest = link.destination;
                    title = link.title;
                    matched = true;
                }
            }
        }
        if (matched) {
            var node = new node_1.Node(is_image ? 'image' : 'link');
            node.destination = dest;
            node.title = title || '';
            var tmp = opener.node.next;
            while (tmp) {
                var next = tmp.next;
                tmp.unlink();
                node.appendChild(tmp);
                tmp = next;
            }
            block.appendChild(node);
            this.processEmphasis(opener.previousDelimiter);
            this.removeBracket();
            opener.node.unlink();
            // We remove this bracket and processEmphasis will remove later delimiters.
            // Now, for a link, we also deactivate earlier link openers.
            // (no links in links)
            if (!is_image) {
                opener = this.brackets;
                while (opener !== null) {
                    if (!opener.image) {
                        opener.active = false; // deactivate this opener
                    }
                    opener = opener.previous;
                }
            }
            return true;
        }
        else {
            this.removeBracket(); // remove this opener from stack
            this.pos = startpos;
            block.appendChild(text(']'));
            return true;
        }
    };
    InlineParser.prototype.addBracket = function (node, index, image) {
        if (this.brackets !== null) {
            this.brackets.bracketAfter = true;
        }
        this.brackets = {
            node: node,
            previous: this.brackets,
            previousDelimiter: this.delimiters,
            index: index,
            image: image,
            active: true
        };
    };
    InlineParser.prototype.removeBracket = function () {
        this.brackets = this.brackets.previous;
    };
    return InlineParser;
}());
exports.InlineParser = InlineParser;
// The InlineParser object.
/*
function InlineParser(options){
    return {
        subject: '',
        delimiters: null,  // used by handleDelim method
        brackets: null,
        pos: 0,
        refmap: {},
        match: match,
        peek: peek,
        spnl: spnl,
        parseBackticks: parseBackticks,
        parseBackslash: parseBackslash,
        parseAutolink: parseAutolink,
        parseHtmlTag: parseHtmlTag,
        scanDelims: scanDelims,
        handleDelim: handleDelim,
        parseLinkTitle: parseLinkTitle,
        parseLinkDestination: parseLinkDestination,
        parseLinkLabel: parseLinkLabel,
        parseOpenBracket: parseOpenBracket,
        parseBang: parseBang,
        parseCloseBracket: parseCloseBracket,
        addBracket: addBracket,
        removeBracket: removeBracket,
        parseEntity: parseEntity,
        parseString: parseString,
        parseNewline: parseNewline,
        parseReference: parseReference,
        parseInline: parseInline,
        processEmphasis: processEmphasis,
        removeDelimiter: removeDelimiter,
        options: options || {},
        parse: parseInlines
    };
}
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvaW5saW5lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE4QjtBQUM5QixtQ0FBc0Y7QUFDdEYsNkRBQTJEO0FBQzNELHVDQUF3QztBQUV4QyxpQ0FBaUM7QUFDakMsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFNLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDM0IsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNsQixJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdkIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDekIsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLElBQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN6QixJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFFekIsc0NBQXNDO0FBRXRDLElBQU0sWUFBWSxHQUFHLE1BQU0sR0FBRyxrQkFBUyxDQUFDO0FBRXhDLElBQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLHNvREFBc29ELENBQUMsQ0FBQztBQUV6cUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQzFCLFFBQVEsR0FBRyxZQUFZLEdBQUcsZUFBZTtJQUN6QyxHQUFHO0lBQ0gsS0FBSyxHQUFHLFlBQVksR0FBRyxpQkFBaUI7SUFDeEMsR0FBRztJQUNILE1BQU0sR0FBRyxZQUFZLEdBQUcsa0JB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
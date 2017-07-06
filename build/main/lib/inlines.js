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
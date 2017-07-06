import { Node } from './node';
import { ENTITY, ESCAPABLE, normalizeURI, reHtmlTag, unescapeString } from './common';
import { normalizeReference } from './normalize-reference';
import { decodeHTML } from './entities';
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
var ESCAPED_CHAR = '\\\\' + ESCAPABLE;
var rePunctuation = new RegExp(/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/);
var reLinkTitle = new RegExp('^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
    '|' +
    '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
    '|' +
    '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');
var reLinkDestinationBraces = new RegExp('^(?:[<](?:[^ <>\\t\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');
var reEscapable = new RegExp('^' + ESCAPABLE);
var reEntityHere = new RegExp('^' + ENTITY, 'i');
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
    var node = new Node('text');
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
            block.appendChild(new Node(hardbreak ? 'linebreak' : 'softbreak'));
        }
        else {
            block.appendChild(new Node('softbreak'));
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
            block.appendChild(text(decodeHTML(m)));
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
        var normlabel = normalizeReference(rawlabel);
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
                node = new Node('code');
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
            var node = new Node('linebreak');
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
            var node = new Node('link');
            node.destination = normalizeURI('mailto:' + dest);
            node.title = '';
            node.appendChild(text(dest));
            block.appendChild(node);
            return true;
        }
        else if ((m = this.match(reAutolink))) {
            var dest = m.slice(1, m.length - 1);
            var node = new Node('link');
            node.destination = normalizeURI(dest);
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
        var m = this.match(reHtmlTag);
        if (m === null) {
            return false;
        }
        else {
            var node = new Node('html_inline');
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
                        var emph = new Node(use_delims === 1 ? 'emph' : 'strong');
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
            return unescapeString(title.substr(1, title.length - 2));
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
            return normalizeURI(unescapeString(res));
        }
        else {
            return normalizeURI(unescapeString(res.substr(1, res.length - 2)));
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
                var link = this.refmap[normalizeReference(reflabel)];
                if (link) {
                    dest = link.destination;
                    title = link.title;
                    matched = true;
                }
            }
        }
        if (matched) {
            var node = new Node(is_image ? 'image' : 'link');
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
export { InlineParser };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvaW5saW5lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzNELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFeEMsaUNBQWlDO0FBQ2pDLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0QixJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDMUIsSUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQzNCLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0QixJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDekIsSUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBRXpCLHNDQUFzQztBQUV0QyxJQUFNLFlBQVksR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBRXhDLElBQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLHNvREFBc29ELENB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
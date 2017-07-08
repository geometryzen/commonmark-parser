import { Node } from '../node';
import { Renderer } from './renderer';

import { escapeXml as esc } from '../common';

const reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
const reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

const potentiallyUnsafe = function (url: string) {
    return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
};

export interface HtmlRendererOptions {
    safe?: any;
    softbreak?: string;
    sourcepos?: boolean;
}

export class HtmlRenderer extends Renderer {
    disableTags: number;
    constructor(private options: HtmlRendererOptions = {}) {
        super();
        // by default, soft breaks are rendered as newlines in HTML
        options.softbreak = options.softbreak || '\n';
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source

        this.disableTags = 0;
        this.lastOut = "\n";
        this.options = options;
    }

    // Helper function to produce an HTML tag.
    tag(name: string, attrs?: string[][], selfclosing?: boolean) {
        if (this.disableTags > 0) {
            return;
        }
        this.buffer += ('<' + name);
        if (attrs && attrs.length > 0) {
            let i = 0;
            let attrib: string[];
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
    }

    /* Node methods */
    document(node: Node, entering: boolean) {
        // Do nothing.
    }

    text(node: Node) {
        this.out(node.literal as string);
    }

    softbreak() {
        this.lit(this.options.softbreak as string);
    }

    linebreak() {
        this.tag('br', [], true);
        this.cr();
    }

    link(node: Node, entering: boolean) {
        const attrs = this.attrs(node);
        if (entering) {
            if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
                attrs.push(['href', esc(node.destination, true)]);
            }
            if (node.title) {
                attrs.push(['title', esc(node.title, true)]);
            }
            this.tag('a', attrs);
        }
        else {
            this.tag('/a');
        }
    }

    image(node: Node, entering: boolean) {
        if (entering) {
            if (this.disableTags === 0) {
                if (this.options.safe &&
                    potentiallyUnsafe(node.destination)) {
                    this.lit('<img src="" alt="');
                } else {
                    this.lit('<img src="' + esc(node.destination, true) +
                        '" alt="');
                }
            }
            this.disableTags += 1;
        } else {
            this.disableTags -= 1;
            if (this.disableTags === 0) {
                if (node.title) {
                    this.lit('" title="' + esc(node.title, true));
                }
                this.lit('" />');
            }
        }
    }

    emph(node: Node, entering: boolean) {
        this.tag(entering ? 'em' : '/em');
    }

    strong(node: Node, entering: boolean) {
        this.tag(entering ? 'strong' : '/strong');
    }

    paragraph(node: Node, entering: boolean) {
        const attrs = this.attrs(node);
        if (node.parent) {
            const grandparent = node.parent.parent;
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
    }

    heading(node: Node, entering: boolean) {
        const tagname = 'h' + node.level;
        const attrs = this.attrs(node);
        if (entering) {
            this.cr();
            this.tag(tagname, attrs);
        } else {
            this.tag('/' + tagname);
            this.cr();
        }
    }

    code(node: Node) {
        this.tag('code');
        this.out(node.literal as string);
        this.tag('/code');
    }

    code_block(node: Node) {
        const info_words = node.info ? node.info.split(/\s+/) : [];
        const attrs = this.attrs(node);
        if (info_words.length > 0 && info_words[0].length > 0) {
            attrs.push(['class', 'language-' + esc(info_words[0], true)]);
        }
        this.cr();
        this.tag('pre');
        this.tag('code', attrs);
        this.out(node.literal as string);
        this.tag('/code');
        this.tag('/pre');
        this.cr();
    }

    thematic_break(node: Node) {
        const attrs = this.attrs(node);
        this.cr();
        this.tag('hr', attrs, true);
        this.cr();
    }

    block_quote(node: Node, entering: boolean) {
        const attrs = this.attrs(node);
        if (entering) {
            this.cr();
            this.tag('blockquote', attrs);
            this.cr();
        } else {
            this.cr();
            this.tag('/blockquote');
            this.cr();
        }
    }

    list(node: Node, entering: boolean) {
        const tagname = node.listType === 'bullet' ? 'ul' : 'ol';
        const attrs = this.attrs(node);

        if (entering) {
            const start = node.listStart;
            if (start !== null && start !== 1) {
                attrs.push(['start', start.toString()]);
            }
            this.cr();
            this.tag(tagname, attrs);
            this.cr();
        } else {
            this.cr();
            this.tag('/' + tagname);
            this.cr();
        }
    }

    item(node: Node, entering: boolean) {
        const attrs = this.attrs(node);
        if (entering) {
            this.tag('li', attrs);
        } else {
            this.tag('/li');
            this.cr();
        }
    }

    html_inline(node: Node) {
        if (this.options.safe) {
            this.lit('<!-- raw HTML omitted -->');
        }
        else {
            this.lit(node.literal as string);
        }
    }

    html_block(node: Node) {
        this.cr();
        if (this.options.safe) {
            this.lit('<!-- raw HTML omitted -->');
        }
        else {
            this.lit(node.literal as string);
        }
        this.cr();
    }

    custom_inline(node: Node, entering: boolean) {
        if (entering && node.onEnter) {
            this.lit(node.onEnter);
        } else if (!entering && node.onExit) {
            this.lit(node.onExit);
        }
    }

    custom_block(node: Node, entering: boolean) {
        this.cr();
        if (entering && node.onEnter) {
            this.lit(node.onEnter);
        } else if (!entering && node.onExit) {
            this.lit(node.onExit);
        }
        this.cr();
    }

    /* Helper methods */

    out(s: string) {
        this.lit(esc(s, false));
    }

    attrs(node: Node) {
        const att = [];
        if (this.options.sourcepos) {
            const pos = node.sourcepos;
            if (pos) {
                att.push(['data-sourcepos', String(pos[0][0]) + ':' +
                    String(pos[0][1]) + '-' + String(pos[1][0]) + ':' +
                    String(pos[1][1])]);
            }
        }
        return att;
    }
}

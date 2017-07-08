import { Node, NodeWalker, NodeWalkerEvent } from '../node';
import { Renderer } from './renderer';

import { escapeXml as esc } from '../common';

const reXMLTag = /\<[^>]*\>/;

// Helper function to produce an XML tag.
function tag(name: string, attrs?: string[][], selfclosing?: boolean) {
    let result = '<' + name;
    if (attrs && attrs.length > 0) {
        let i = 0;
        let attrib: string[];
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

function toTagName(s: string) {
    return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

export interface XmlRendererOptions {
    //    safe?: any;
    //    softbreak?: string;
    sourcepos?: boolean;
}

export class XmlRenderer extends Renderer {
    disableTags = 0;
    lastOut = "\n";
    indentLevel = 0;
    indent = ' ';
    constructor(private options: XmlRendererOptions = {}) {
        super();
        this.options = options;
    }

    render(ast: Node) {

        this.buffer = '';

        const walker: NodeWalker = ast.walker();
        let event: NodeWalkerEvent | null;

        const options = this.options;

        this.buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
        this.buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';

        while ((event = walker.next())) {
            const entering = event.entering;
            const node = event.node;
            const nodetype = node.type;

            const container = node.isContainer;

            const selfClosing = nodetype === 'thematic_break'
                || nodetype === 'linebreak'
                || nodetype === 'softbreak';

            const tagname = toTagName(nodetype);

            if (entering) {

                const attrs: string[][] = [];

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
                        const delim = node.listDelimiter;
                        if (delim !== null) {
                            let delimword = '';
                            if (delim === '.') {
                                delimword = 'period';
                            } else {
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
                        attrs.push(['on_enter', node.onEnter as string]);
                        attrs.push(['on_exit', node.onExit as string]);
                        break;
                    default:
                        break;
                }
                if (options.sourcepos) {
                    const pos = node.sourcepos;
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
                    const lit = node.literal;
                    if (lit) {
                        this.out(esc(lit));
                    }
                    this.out(tag('/' + tagname));
                }
            } else {
                this.indentLevel -= 1;
                this.cr();
                this.out(tag('/' + tagname));
            }
        }
        this.buffer += '\n';
        return this.buffer;
    }
    /**
     *
     */
    out(s: string): void {
        if (this.disableTags > 0) {
            this.buffer += s.replace(reXMLTag, '');
        }
        else {
            this.buffer += s;
        }
        this.lastOut = s;
    }
    /**
     *
     */
    cr() {
        if (this.lastOut !== '\n') {
            this.buffer += '\n';
            this.lastOut = '\n';
            for (let i = this.indentLevel; i > 0; i--) {
                this.buffer += this.indent;
            }
        }
    }
}

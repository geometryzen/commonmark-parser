import { Parser } from './blocks';
import { HtmlRenderer } from './render/html';
import { XmlRenderer } from './render/xml';

describe("Parser", function () {
    describe("Tabs", function () {
        it("Example 1", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const parsed = reader.parse("\tfoo\tbaz\t\tbim");
            const result = writer.render(parsed);
            expect(result).toBe('<pre><code>foo\tbaz\t\tbim\n</code></pre>\n');
        });
        it("Example 2", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const parsed = reader.parse("  \tfoo\tbaz\t\tbim");
            const result = writer.render(parsed);
            expect(result).toBe('<pre><code>foo\tbaz\t\tbim\n</code></pre>\n');
        });
        it("Example 3", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const parsed = reader.parse("    a\ta\n    ὐ\ta");
            const result = writer.render(parsed);
            expect(result).toBe('<pre><code>a\ta\nὐ\ta\n</code></pre>\n');
        });
        it("Example 4", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const parsed = reader.parse("  - foo\n\n\tbar");
            const result = writer.render(parsed);
            const targetText = [
                '<ul>',
                '<li>',
                '<p>foo</p>',
                '<p>bar</p>',
                '</li>',
                '</ul>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Leaf blocks", function () {
        describe("Thematic breaks", function () {
            it("Example 13", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '***',
                    '---',
                    '___'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<hr />',
                    '<hr />',
                    '<hr />'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 14", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '+++'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<p>+++</p>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 15", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '==='
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<p>===</p>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("ATX headings", function () {
        describe("Simple headings", function () {
            it("Example 32", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '# foo',
                    '## foo',
                    '### foo',
                    '#### foo',
                    '##### foo',
                    '###### foo'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<h1>foo</h1>',
                    '<h2>foo</h2>',
                    '<h3>foo</h3>',
                    '<h4>foo</h4>',
                    '<h5>foo</h5>',
                    '<h6>foo</h6>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 33", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '####### foo'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<p>####### foo</p>',
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Setext headings", function () {
        describe("Simple headings", function () {
            it("Example 32", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    'Foo *bar*',
                    '=========',
                    '',
                    'Foo *bar*',
                    '---------'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<h1>Foo <em>bar</em></h1>',
                    '<h2>Foo <em>bar</em></h2>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Indented code blocks", function () {
        describe("Simple headings", function () {
            it("Example 32", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '    a simple',
                    '      indented code block'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<pre><code>a simple',
                    '  indented code block',
                    '</code></pre>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Fenced code blocks", function () {
        describe("Simple headings", function () {
            it("Example 88", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '```',
                    '<',
                    ' >',
                    '```'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<pre><code>&lt;',
                    ' &gt;',
                    '</code></pre>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 89", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '~~~',
                    '<',
                    ' >',
                    '~~~'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<pre><code>&lt;',
                    ' &gt;',
                    '</code></pre>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 98", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '```',
                    '```'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<pre><code></code></pre>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 99", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    ' ```',
                    ' aaa',
                    'aaa',
                    '```'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<pre><code>aaa',
                    'aaa',
                    '</code></pre>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 110", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '```ruby',
                    'def foo(x)',
                    '  return 3',
                    'end',
                    '```'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<pre><code class="language-ruby">def foo(x)',
                    '  return 3',
                    'end',
                    '</code></pre>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("HTML blocks", function () {
        describe("Simple headings", function () {
            it("Example 32", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '<table>',
                    '  <tr>',
                    '    <td>',
                    '          hi',
                    '    </td>',
                    '  </tr>',
                    '</table>',
                    '',
                    'okay.'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<table>',
                    '  <tr>',
                    '    <td>',
                    '          hi',
                    '    </td>',
                    '  </tr>',
                    '</table>',
                    '<p>okay.</p>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Link reference definitions", function () {
        describe("Simple headings", function () {
            it("Example 32", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '[foo]: /url "title"',
                    '',
                    '[foo]'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<p><a href="/url" title="title">foo</a></p>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
            it("Example 169", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '[ΑΓΩ]: /φου',
                    '',
                    '[αγω]'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<p><a href="/%CF%86%CE%BF%CF%85">αγω</a></p>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Paragraphs", function () {
        describe("Simple headings", function () {
            it("Example 180", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    'aaa',
                    '',
                    'bbb'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<p>aaa</p>',
                    '<p>bbb</p>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Container blocks", function () {
        describe("Block quotes", function () {
            it("Example 189", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '> # Foo',
                    '> bar',
                    '> baz'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<blockquote>',
                    '<h1>Foo</h1>',
                    '<p>bar',
                    'baz</p>',
                    '</blockquote>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
        describe("List items", function () {
            it("Example 217", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '- one',
                    '',
                    '  two'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<ul>',
                    '<li>',
                    '<p>one</p>',
                    '<p>two</p>',
                    '</li>',
                    '</ul>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
        describe("Lists", function () {
            it("Example 262", function () {
                const reader = new Parser();
                const writer = new HtmlRenderer();
                const sourceText = [
                    '1. foo',
                    '2. bar',
                    '3) baz'
                ].join('\n');
                const parsed = reader.parse(sourceText);
                const result = writer.render(parsed);
                const targetText = [
                    '<ol>',
                    '<li>foo</li>',
                    '<li>bar</li>',
                    '</ol>',
                    '<ol start="3">',
                    '<li>baz</li>',
                    '</ol>'
                ].join('\n');
                expect(result).toBe(targetText + '\n');
            });
        });
    });
    describe("Inlines", function () {
        it("Example 290", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                '\\\\*emphasis*'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p>\\<em>emphasis</em></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Code spans", function () {
        it("Example 312", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                '`foo`'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p><code>foo</code></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Strong emphasis", function () {
        it("Example 356", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                '**foo bar**'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p><strong>foo bar</strong></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Links", function () {
        it("Example 473", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                '[link]("title")'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p><a href="%22title%22">link</a></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Images", function () {
        it("Example 541", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                '![foo](/url "title")'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p><img src="/url" alt="foo" title="title" /></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Autolinks", function () {
        it("Example 563", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                '<http://foo.bar.baz>'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p><a href="http://foo.bar.baz">http://foo.bar.baz</a></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Raw HTML", function () {
        it("Example 586", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                'Foo <responsive-image src="foo.jpg" />'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p>Foo <responsive-image src="foo.jpg" /></p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Hard line break", function () {
        it("Example 603", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                'foo  ',
                'baz'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p>foo<br />',
                'baz</p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Soft line break", function () {
        it("Example 603", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                'foo',
                'baz'
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                '<p>foo',
                'baz</p>'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Textual content", function () {
        it("Example 603", function () {
            const reader = new Parser();
            const writer = new HtmlRenderer();
            const sourceText = [
                "hello $.;'there"
            ].join('\n');
            const parsed = reader.parse(sourceText);
            const result = writer.render(parsed);
            const targetText = [
                "<p>hello $.;'there</p>"
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("HTML", function () {
        const reader = new Parser();
        const writer = new HtmlRenderer();
        const parsed = reader.parse("Hello *World*");
        const result = writer.render(parsed);
        it("render", function () {
            expect(result).toBe('<p>Hello <em>World</em></p>\n');
        });
    });
    describe("XML", function () {
        const reader = new Parser();
        const writer = new XmlRenderer();
        const parsed = reader.parse("Hello *World*");
        const result = writer.render(parsed);
        it("render", function () {
            const targetText = [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<!DOCTYPE document SYSTEM "CommonMark.dtd">',
                '<document xmlns="http://commonmark.org/xml/1.0">',
                ' <paragraph>',
                '  <text>Hello </text>',
                '  <emph>',
                '   <text>World</text>',
                '  </emph>',
                ' </paragraph>',
                '</document>\n'
            ].join('\n');
            expect(result).toBe(targetText);
        });
    });
});

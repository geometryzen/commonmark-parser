import { Parser } from './blocks';
import { HtmlRenderer } from './render/html';
import { TexRenderer } from './render/tex';
import { XmlRenderer } from './render/xml';

const sourceText = [
    'Hello *World*',
    '```latex',
    'f(x) = \\sqrt{x}',
    'g(x) = x^2',
    '```',
    '\n'
].join('\n');

describe("Parser", function () {
    describe("HTML", function () {
        const reader = new Parser();
        const writer = new HtmlRenderer();
        const parsed = reader.parse(sourceText);
        const result = writer.render(parsed);
        it("render", function () {
            const targetText = [
                '<p>Hello <em>World</em></p>',
                '<pre><code class="language-latex">f(x) = \\sqrt{x}',
                'g(x) = x^2',
                '</code></pre>',
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("Tex", function () {
        const reader = new Parser();
        const writer = new TexRenderer();
        const parsed = reader.parse(sourceText);
        const result = writer.render(parsed);
        it("render", function () {
            const targetText = [
                '\\documentclass{article}',
                '\\begin{document}',
                'Hello \\emph{World}',
                '\\begin{equation}',
                'f(x) = \\sqrt{x}',
                'g(x) = x^2',
                '\\end{equation}',
                '\\end{document}'
            ].join('\n');
            expect(result).toBe(targetText + '\n');
        });
    });
    describe("XML", function () {
        const reader = new Parser();
        const writer = new XmlRenderer();
        const parsed = reader.parse(sourceText);
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
                ' <code_block info="latex">f(x) = \\sqrt{x}',
                'g(x) = x^2',
                '</code_block>',
                '</document>\n'
            ].join('\n');
            expect(result).toBe(targetText);
        });
    });
});

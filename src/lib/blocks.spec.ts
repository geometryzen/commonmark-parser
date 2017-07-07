import { Parser } from './blocks';
import { HtmlRenderer } from './render/html';
import { XmlRenderer } from './render/xml';

describe("Parser", function () {
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

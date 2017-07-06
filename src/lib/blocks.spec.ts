import { Parser } from './blocks';
import { HtmlRenderer } from './render/html';

describe("Parser", function () {
    const reader = new Parser();
    const writer = new HtmlRenderer();
    const parsed = reader.parse("Hello *world*");
    const result = writer.render(parsed);
    it("", function () {
        expect(result).toBe('<p>Hello <em>world</em></p>\n');
    });
});

const decodeCache: { [exclude: string]: string[] } = {};

const defaultChars = ';/?:@&=+$,#';

function getDecodeCache(exclude: string) {
    let cache = decodeCache[exclude];
    if (cache) { return cache; }

    cache = decodeCache[exclude] = [];

    for (let i = 0; i < 128; i++) {
        const ch = String.fromCharCode(i);
        cache.push(ch);
    }

    for (let i = 0; i < exclude.length; i++) {
        const ch = exclude.charCodeAt(i);
        cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
    }

    return cache;
}

export function decode(s: string, exclude?: string): string {

    if (typeof exclude !== 'string') {
        exclude = defaultChars;
    }

    const cache = getDecodeCache(exclude);

    return s.replace(/(%[a-f0-9]{2})+/gi, function (seq: string) {

        let b2: number;
        let b3: number;
        let b4: number;
        let chr: number;
        let result = '';

        const l = seq.length;
        for (let i = 0; i < l; i += 3) {
            const b1 = parseInt(seq.slice(i + 1, i + 3), 16);

            if (b1 < 0x80) {
                result += cache[b1];
                continue;
            }

            if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
                // 110xxxxx 10xxxxxx
                b2 = parseInt(seq.slice(i + 4, i + 6), 16);

                if ((b2 & 0xC0) === 0x80) {
                    chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

                    if (chr < 0x80) {
                        result += '\ufffd\ufffd';
                    } else {
                        result += String.fromCharCode(chr);
                    }

                    i += 3;
                    continue;
                }
            }

            if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
                // 1110xxxx 10xxxxxx 10xxxxxx
                b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                b3 = parseInt(seq.slice(i + 7, i + 9), 16);

                if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                    chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

                    if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
                        result += '\ufffd\ufffd\ufffd';
                    } else {
                        result += String.fromCharCode(chr);
                    }

                    i += 6;
                    continue;
                }
            }

            if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
                // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
                b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                b3 = parseInt(seq.slice(i + 7, i + 9), 16);
                b4 = parseInt(seq.slice(i + 10, i + 12), 16);

                if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
                    chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

                    if (chr < 0x10000 || chr > 0x10FFFF) {
                        result += '\ufffd\ufffd\ufffd\ufffd';
                    } else {
                        chr -= 0x10000;
                        result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
                    }

                    i += 9;
                    continue;
                }
            }

            result += '\ufffd';
        }

        return result;
    });
}

export function encode(s: string): string {
    throw new Error(`encode('${s}')`);
}

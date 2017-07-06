

const encodeCache: { [exclude: string]: string[] } = {};


// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache(exclude: string) {
    let cache = encodeCache[exclude];
    if (cache) { return cache; }

    cache = encodeCache[exclude] = [];

    for (let i = 0; i < 128; i++) {
        const ch = String.fromCharCode(i);

        if (/^[0-9a-z]$/i.test(ch)) {
            // always allow unencoded alphanumeric characters
            cache.push(ch);
        }
        else {
            cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
        }
    }

    for (let i = 0; i < exclude.length; i++) {
        cache[exclude.charCodeAt(i)] = exclude[i];
    }

    return cache;
}


const defaultChars = ";/?:@&=+$,-_.!~*'()#";
// const componentChars = "-_.!~*'()";

// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
export function encode(s: string, exclude?: string, keepEscaped?: boolean): string {
    let result = '';

    if (typeof exclude !== 'string') {
        // encode(string, keepEscaped)
        keepEscaped = exclude;
        exclude = defaultChars;
    }

    if (typeof keepEscaped === 'undefined') {
        keepEscaped = true;
    }

    const cache = getEncodeCache(exclude);

    const l = s.length;
    for (let i = 0; i < l; i++) {
        const code = s.charCodeAt(i);

        if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
            if (/^[0-9a-f]{2}$/i.test(s.slice(i + 1, i + 3))) {
                result += s.slice(i, i + 3);
                i += 2;
                continue;
            }
        }

        if (code < 128) {
            result += cache[code];
            continue;
        }

        if (code >= 0xD800 && code <= 0xDFFF) {
            if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
                const nextCode = s.charCodeAt(i + 1);
                if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                    result += encodeURIComponent(s[i] + s[i + 1]);
                    i++;
                    continue;
                }
            }
            result += '%EF%BF%BD';
            continue;
        }
        result += encodeURIComponent(s[i]);
    }
    return result;
}

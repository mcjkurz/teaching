(function () {
    'use strict';

    var el = {};
    var reverseCache = {};
    var forwardCache = {};

    var ENCODING_INFO = {
        'utf-8': { name: 'UTF-8', desc: 'Variable-length 1–4 bytes. ASCII-compatible; dominant on the web. CJK characters use 3 bytes, emoji use 4 bytes. Represents all of Unicode.' },
        'utf-16be': { name: 'UTF-16 BE', desc: '2 bytes per BMP character, 4 bytes (surrogate pair) beyond BMP. Big-Endian: most significant byte first. Common in Java/Windows internals.' },
        'utf-16le': { name: 'UTF-16 LE', desc: 'Same as UTF-16 BE but Little-Endian: least significant byte first. Native byte order on x86/ARM CPUs; used in JavaScript string internals.' },
        'utf-32be': { name: 'UTF-32 BE', desc: 'Fixed 4 bytes per character — one code point per unit. Wasteful (ASCII chars use 4 bytes too) but simple. Rarely used in practice.' },
        'gb18030': { name: 'GB18030', desc: 'Chinese national standard (mandatory in China). Superset of GBK; 1, 2, or 4 bytes. Represents all of Unicode. This demo covers the 2-byte (GBK) range; rare 4-byte sequences are not shown.' },
        'gbk': { name: 'GBK', desc: 'Simplified Chinese standard, superset of GB2312. 1 byte for ASCII, 2 bytes for Chinese characters. Common on older mainland Chinese systems.' },
        'big5': { name: 'Big5', desc: 'Traditional Chinese encoding, common in Taiwan and Hong Kong. 1 byte for ASCII, 2 bytes for Chinese characters. Does not support simplified-only characters or emoji.' },
        'ascii': { name: 'ASCII', desc: '7-bit American Standard Code. Only 128 characters (0–127): English letters, digits, punctuation, control codes. Cannot encode any non-English character.' },
        'iso-8859-1': { name: 'ISO-8859-1 (Latin-1)', desc: '8-bit Western European standard. Maps code points 0–255 directly to single bytes. Covers Latin alphabets but no Chinese, no emoji.' }
    };

    function cacheDom() {
        el.encodingSelect = document.getElementById('encodingSelect');
        el.encodeInput = document.getElementById('encodeInput');
        el.encodeTableBody = document.getElementById('encodeTableBody');
        el.encodeSummary = document.getElementById('encodeSummary');
        el.decodeInput = document.getElementById('decodeInput');
        el.decodeOutput = document.getElementById('decodeOutput');
        el.decodeTableBody = document.getElementById('decodeTableBody');
        el.encodingInfo = document.getElementById('encodingInfo');
        el.tabBtns = document.querySelectorAll('.tab-btn');
        el.encodePanel = document.getElementById('encodePanel');
        el.decodePanel = document.getElementById('decodePanel');
    }

    function hexByte(b) { return b.toString(16).toUpperCase().padStart(2, '0'); }
    function bytesToHex(bytes) { return bytes.map(hexByte).join(' '); }
    function bytesToBin(bytes) { return bytes.map(function (b) { return b.toString(2).padStart(8, '0'); }).join(' '); }
    function cpLabel(cp) { return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'); }
    function charDisplay(ch) {
        if (ch === ' ') return '␣ (space)';
        if (ch === '\n') return '⏎ (newline)';
        if (ch === '\t') return '⇥ (tab)';
        return ch;
    }
    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function buildLegacyCache(encoding) {
        if (reverseCache[encoding]) return;
        var dec = new TextDecoder(encoding, { fatal: false });
        var rev = {}, fwd = {};
        for (var lead = 0x81; lead <= 0xFE; lead++) {
            for (var trail = 0x40; trail <= 0xFE; trail++) {
                if (trail === 0x7F) continue;
                var str = dec.decode(new Uint8Array([lead, trail]));
                if (str.length === 1) {
                    var cp = str.codePointAt(0);
                    if (cp !== 0xFFFD && !(cp in rev)) {
                        rev[cp] = [lead, trail];
                        fwd[lead + ',' + trail] = str;
                    }
                }
            }
        }
        reverseCache[encoding] = rev;
        forwardCache[encoding] = fwd;
    }

    // ── Encode a single code point ────────────────────────────────────
    function encodeCp(cp, encoding) {
        if (encoding === 'utf-8') {
            var u8 = new TextEncoder().encode(String.fromCodePoint(cp));
            return { bytes: Array.from(u8), error: false, note: u8.length + ' byte' + (u8.length > 1 ? 's' : '') + ' (UTF-8)' };
        }
        if (encoding === 'utf-16be' || encoding === 'utf-16le') {
            var le = encoding === 'utf-16le';
            if (cp <= 0xFFFF) {
                if (cp >= 0xD800 && cp <= 0xDFFF) return { bytes: [], error: true, note: 'surrogate code point (invalid)' };
                var b = [cp >> 8, cp & 0xFF];
                return { bytes: le ? [b[1], b[0]] : b, error: false, note: '2 bytes (BMP)' };
            }
            var adj = cp - 0x10000;
            var hi = 0xD800 + (adj >> 10);
            var lo = 0xDC00 + (adj & 0x3FF);
            var bytes = [hi >> 8, hi & 0xFF, lo >> 8, lo & 0xFF];
            if (le) bytes = [bytes[1], bytes[0], bytes[3], bytes[2]];
            return { bytes: bytes, error: false, note: '4 bytes (surrogate pair)' };
        }
        if (encoding === 'utf-32be') {
            return { bytes: [(cp >> 24) & 0xFF, (cp >> 16) & 0xFF, (cp >> 8) & 0xFF, cp & 0xFF], error: false, note: '4 bytes (fixed)' };
        }
        if (encoding === 'ascii') {
            if (cp <= 0x7F) return { bytes: [cp], error: false, note: '1 byte (ASCII)' };
            return { bytes: [], error: true, note: 'not representable in ASCII' };
        }
        if (encoding === 'iso-8859-1') {
            if (cp <= 0xFF) return { bytes: [cp], error: false, note: '1 byte (Latin-1)' };
            return { bytes: [], error: true, note: 'not representable in ISO-8859-1' };
        }
        if (cp <= 0x7F) return { bytes: [cp], error: false, note: '1 byte (ASCII)' };
        buildLegacyCache(encoding);
        var rev = reverseCache[encoding];
        if (cp in rev) return { bytes: rev[cp].slice(), error: false, note: '2 bytes (' + ENCODING_INFO[encoding].name + ')' };
        return { bytes: [], error: true, note: 'not in demo ' + ENCODING_INFO[encoding].name + ' table' };
    }

    // ── Decode: per-character grouping ────────────────────────────────
    function decodeBytes(bytes, encoding) {
        if (encoding === 'utf-8') return decodeUtf8(bytes);
        if (encoding === 'utf-16be') return decodeUtf16(bytes, false);
        if (encoding === 'utf-16le') return decodeUtf16(bytes, true);
        if (encoding === 'utf-32be') return decodeUtf32(bytes);
        if (encoding === 'ascii') return decodeAscii(bytes);
        if (encoding === 'iso-8859-1') return decodeLatin1(bytes);
        return decodeLegacy(bytes, encoding);
    }

    function decodeUtf8(bytes) {
        var out = [], i = 0;
        while (i < bytes.length) {
            var b = bytes[i], n, cp, min;
            if (b < 0x80) { n = 1; cp = b; min = 0; }
            else if (b < 0xC0) { out.push({ bytes: [b], char: '\uFFFD', error: true, note: 'stray continuation byte' }); i++; continue; }
            else if (b < 0xE0) { n = 2; cp = b & 0x1F; min = 0x80; }
            else if (b < 0xF0) { n = 3; cp = b & 0x0F; min = 0x800; }
            else if (b < 0xF8) { n = 4; cp = b & 0x07; min = 0x10000; }
            else { out.push({ bytes: [b], char: '\uFFFD', error: true, note: 'invalid lead byte' }); i++; continue; }
            if (i + n > bytes.length) { out.push({ bytes: bytes.slice(i), char: '\uFFFD', error: true, note: 'truncated sequence' }); break; }
            var ok = true, consumed = [b];
            for (var j = 1; j < n; j++) { var c = bytes[i + j]; consumed.push(c); if (c < 0x80 || c >= 0xC0) { ok = false; break; } cp = (cp << 6) | (c & 0x3F); }
            if (!ok) { out.push({ bytes: consumed, char: '\uFFFD', error: true, note: 'bad continuation byte' }); i++; continue; }
            if (cp < min || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) { out.push({ bytes: consumed, char: '\uFFFD', error: true, note: 'overlong / surrogate / out of range' }); i += n; continue; }
            out.push({ bytes: consumed, char: String.fromCodePoint(cp), error: false, note: n + ' byte' + (n > 1 ? 's' : '') });
            i += n;
        }
        return out;
    }

    function decodeUtf16(bytes, le) {
        var out = [], i = 0;
        function unit(a, b) { return le ? (b << 8) | a : (a << 8) | b; }
        while (i + 1 < bytes.length) {
            var u = unit(bytes[i], bytes[i + 1]);
            if (u >= 0xD800 && u <= 0xDBFF) {
                if (i + 3 < bytes.length) {
                    var u2 = unit(bytes[i + 2], bytes[i + 3]);
                    if (u2 >= 0xDC00 && u2 <= 0xDFFF) {
                        var cp = 0x10000 + ((u - 0xD800) << 10) + (u2 - 0xDC00);
                        out.push({ bytes: [bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]], char: String.fromCodePoint(cp), error: false, note: '4 bytes (surrogate pair)' });
                        i += 4; continue;
                    }
                    out.push({ bytes: [bytes[i], bytes[i + 1]], char: '\uFFFD', error: true, note: 'lone high surrogate' }); i += 2; continue;
                }
                out.push({ bytes: bytes.slice(i), char: '\uFFFD', error: true, note: 'truncated surrogate pair' }); break;
            }
            if (u >= 0xDC00 && u <= 0xDFFF) { out.push({ bytes: [bytes[i], bytes[i + 1]], char: '\uFFFD', error: true, note: 'lone low surrogate' }); i += 2; continue; }
            out.push({ bytes: [bytes[i], bytes[i + 1]], char: String.fromCharCode(u), error: false, note: '2 bytes (BMP)' }); i += 2;
        }
        if (i < bytes.length) out.push({ bytes: [bytes[i]], char: '\uFFFD', error: true, note: 'trailing byte' });
        return out;
    }

    function decodeUtf32(bytes) {
        var out = [], i = 0;
        while (i + 3 < bytes.length) {
            var cp = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
            if (cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) out.push({ bytes: [bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]], char: '\uFFFD', error: true, note: 'invalid code point' });
            else out.push({ bytes: [bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]], char: String.fromCodePoint(cp), error: false, note: '4 bytes (fixed)' });
            i += 4;
        }
        if (i < bytes.length) out.push({ bytes: bytes.slice(i), char: '\uFFFD', error: true, note: 'trailing bytes' });
        return out;
    }

    function decodeAscii(bytes) {
        return bytes.map(function (b) {
            if (b > 0x7F) return { bytes: [b], char: '\uFFFD', error: true, note: 'byte > 127 (not ASCII)' };
            return { bytes: [b], char: String.fromCharCode(b), error: false, note: '1 byte (ASCII)' };
        });
    }

    function decodeLatin1(bytes) {
        return bytes.map(function (b) { return { bytes: [b], char: String.fromCharCode(b), error: false, note: '1 byte (Latin-1)' }; });
    }

    function decodeLegacy(bytes, encoding) {
        buildLegacyCache(encoding);
        var fwd = forwardCache[encoding];
        var out = [], i = 0;
        while (i < bytes.length) {
            var b = bytes[i];
            if (b <= 0x7F) { out.push({ bytes: [b], char: String.fromCharCode(b), error: false, note: '1 byte (ASCII)' }); i++; continue; }
            if (i + 1 < bytes.length) {
                var key = b + ',' + bytes[i + 1];
                if (fwd[key]) { out.push({ bytes: [b, bytes[i + 1]], char: fwd[key], error: false, note: '2 bytes (' + ENCODING_INFO[encoding].name + ')' }); i += 2; continue; }
                out.push({ bytes: [b, bytes[i + 1]], char: '\uFFFD', error: true, note: 'invalid byte sequence' }); i += 2; continue;
            }
            out.push({ bytes: [b], char: '\uFFFD', error: true, note: 'trailing lead byte' }); i++;
        }
        return out;
    }

    function parseHexInput(text) {
        var tokens = text.trim().split(/\s+/).filter(Boolean);
        var bytes = [], bad = [];
        tokens.forEach(function (t) {
            if (/^[0-9a-fA-F]{1,2}$/.test(t)) bytes.push(parseInt(t, 16));
            else bad.push(t);
        });
        return { bytes: bytes, bad: bad };
    }

    function renderEncode() {
        var encoding = el.encodingSelect.value;
        var text = el.encodeInput.value;
        var chars = Array.from(text);
        el.encodeTableBody.innerHTML = '';
        var totalBytes = 0, errorCount = 0;
        chars.forEach(function (ch, idx) {
            var cp = ch.codePointAt(0);
            var res = encodeCp(cp, encoding);
            var tr = document.createElement('tr');
            if (res.error) { tr.className = 'error-row'; errorCount++; }
            totalBytes += res.bytes.length;
            tr.innerHTML =
                '<td>' + (idx + 1) + '</td>' +
                '<td class="char-cell">' + escapeHtml(charDisplay(ch)) + '</td>' +
                '<td class="cp-cell">' + cpLabel(cp) + '</td>' +
                '<td class="hex-cell">' + (res.bytes.length ? escapeHtml(bytesToHex(res.bytes)) : '—') + '</td>' +
                '<td class="bin-cell">' + (res.bytes.length ? escapeHtml(bytesToBin(res.bytes)) : '—') + '</td>' +
                '<td class="note-cell">' + escapeHtml(res.note) + '</td>';
            el.encodeTableBody.appendChild(tr);
        });
        if (chars.length === 0) {
            el.encodeTableBody.innerHTML = '<tr><td colspan="6" class="empty">Enter some text above.</td></tr>';
        }
        var avg = chars.length ? (totalBytes / chars.length).toFixed(2) : '0';
        el.encodeSummary.innerHTML = '<strong>' + chars.length + '</strong> characters &rarr; <strong>' +
            totalBytes + '</strong> bytes &middot; average <strong>' + avg + '</strong> bytes/char' +
            (errorCount ? ' &middot; <span class="err-count">' + errorCount + ' unencodable</span>' : '');
    }

    function renderDecode() {
        var encoding = el.encodingSelect.value;
        var parsed = parseHexInput(el.decodeInput.value);
        el.decodeTableBody.innerHTML = '';
        if (parsed.bad.length) {
            el.decodeOutput.innerHTML = '<div class="decode-error">Invalid hex tokens ignored: ' + escapeHtml(parsed.bad.join(', ')) + '</div>';
        } else {
            el.decodeOutput.innerHTML = '';
        }
        if (parsed.bytes.length === 0) {
            el.decodeTableBody.innerHTML = '<tr><td colspan="4" class="empty">Enter hex bytes above.</td></tr>';
            el.decodeOutput.innerHTML += '<div class="decoded-string">Decoded text: <span class="empty-text">(empty)</span></div>';
            return;
        }
        var decoded = decodeBytes(parsed.bytes, encoding);
        var fullStr = '';
        decoded.forEach(function (d) {
            if (!d.error) fullStr += d.char;
            var tr = document.createElement('tr');
            if (d.error) tr.className = 'error-row';
            tr.innerHTML =
                '<td class="hex-cell">' + escapeHtml(bytesToHex(d.bytes)) + '</td>' +
                '<td class="char-cell">' + escapeHtml(charDisplay(d.char)) + '</td>' +
                '<td class="cp-cell">' + (d.error ? '—' : cpLabel(d.char.codePointAt(0))) + '</td>' +
                '<td class="note-cell">' + escapeHtml(d.note) + '</td>';
            el.decodeTableBody.appendChild(tr);
        });
        el.decodeOutput.innerHTML += '<div class="decoded-string">Decoded text: <code class="decoded-result">' + escapeHtml(fullStr) + '</code></div>';
    }

    function renderInfo() {
        var info = ENCODING_INFO[el.encodingSelect.value];
        el.encodingInfo.innerHTML = '<h4>' + info.name + '</h4><p>' + info.desc + '</p>';
    }

    function switchTab(tab) {
        el.tabBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        el.encodePanel.classList.toggle('active', tab === 'encode');
        el.decodePanel.classList.toggle('active', tab === 'decode');
    }

    function bindEvents() {
        el.encodingSelect.addEventListener('change', function () { renderEncode(); renderDecode(); renderInfo(); });
        el.encodeInput.addEventListener('input', renderEncode);
        el.decodeInput.addEventListener('input', renderDecode);
        el.tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        cacheDom();
        bindEvents();
        renderInfo();
        renderEncode();
        renderDecode();
    });
})();

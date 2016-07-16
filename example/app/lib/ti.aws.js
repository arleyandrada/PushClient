var sha;
sha = "undefined" !== typeof exports ? exports : {};
sha.hexcase = 0;
sha.b64pad = "=";
sha.hex_sha1 = function(a) {
    return sha.rstr2hex(sha.rstr_sha1(sha.str2rstr_utf8(a)))
};
sha.b64_sha1 = function(a) {
    return sha.rstr2b64(sha.rstr_sha1(sha.str2rstr_utf8(a)))
};
sha.any_sha1 = function(a, c) {
    return sha.rstr2any(sha.rstr_sha1(sha.str2rstr_utf8(a)), c)
};
sha.hex_hmac_sha1 = function(a, c) {
    return sha.rstr2hex(sha.rstr_hmac_sha1(sha.str2rstr_utf8(a), sha.str2rstr_utf8(c)))
};
sha.b64_hmac_sha1 = function(a, c) {
    return sha.rstr2b64(sha.rstr_hmac_sha1(sha.str2rstr_utf8(a), sha.str2rstr_utf8(c)))
};
sha.any_hmac_sha1 = function(a, c, b) {
    return sha.rstr2any(sha.rstr_hmac_sha1(sha.str2rstr_utf8(a), sha.str2rstr_utf8(c)), b)
};
sha.sha1_vm_test = function() {
    return "a9993e364706816aba3e25717850c26c9cd0d89d" == sha.hex_sha1("abc")
};
sha.rstr_sha1 = function(a) {
    return sha.binb2rstr(sha.binb_sha1(sha.rstr2binb(a), 8 * a.length))
};
sha.rstr_hmac_sha1 = function(a, c) {
    var b = sha.rstr2binb(a);
    16 < b.length && (b = sha.binb_sha1(b, 8 * a.length));
    for (var d = Array(16), e = Array(16), f = 0; 16 > f; f++) d[f] = b[f] ^ 909522486, e[f] = b[f] ^ 1549556828;
    b = sha.binb_sha1(d.concat(sha.rstr2binb(c)), 512 + 8 * c.length);
    return sha.binb2rstr(sha.binb_sha1(e.concat(b), 672))
};
sha.rstr2hex = function(a) {
    for (var c = sha.hexcase ? "0123456789ABCDEF" : "0123456789abcdef", b = "", d, e = 0; e < a.length; e++) d = a.charCodeAt(e), b += c.charAt(d >>> 4 & 15) + c.charAt(d & 15);
    return b
};
sha.rstr2b64 = function(a) {
    for (var c = "", b = a.length, d = 0; d < b; d += 3)
        for (var e = a.charCodeAt(d) << 16 | (d + 1 < b ? a.charCodeAt(d + 1) << 8 : 0) | (d + 2 < b ? a.charCodeAt(d + 2) : 0), f = 0; 4 > f; f++) c = 8 * d + 6 * f > 8 * a.length ? c + sha.b64pad : c + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >>> 6 * (3 - f) & 63);
    return c
};
sha.rstr2any = function(a, c) {
    var b = c.length,
        d = [],
        e, f, g, h, j = Array(Math.ceil(a.length / 2));
    for (e = 0; e < j.length; e++) j[e] = a.charCodeAt(2 * e) << 8 | a.charCodeAt(2 * e + 1);
    for (; 0 < j.length;) {
        h = [];
        for (e = g = 0; e < j.length; e++)
            if (g = (g << 16) + j[e], f = Math.floor(g / b), g -= f * b, 0 < h.length || 0 < f) h[h.length] = f;
        d[d.length] = g;
        j = h
    }
    b = "";
    for (e = d.length - 1; 0 <= e; e--) b += c.charAt(d[e]);
    d = Math.ceil(8 * a.length / (Math.log(c.length) / Math.log(2)));
    for (e = b.length; e < d; e++) b = c[0] + b;
    return b
};
sha.str2rstr_utf8 = function(a) {
    for (var c = "", b = -1, d, e; ++b < a.length;) d = a.charCodeAt(b), e = b + 1 < a.length ? a.charCodeAt(b + 1) : 0, 55296 <= d && 56319 >= d && 56320 <= e && 57343 >= e && (d = 65536 + ((d & 1023) << 10) + (e & 1023), b++), 127 >= d ? c += String.fromCharCode(d) : 2047 >= d ? c += String.fromCharCode(192 | d >>> 6 & 31, 128 | d & 63) : 65535 >= d ? c += String.fromCharCode(224 | d >>> 12 & 15, 128 | d >>> 6 & 63, 128 | d & 63) : 2097151 >= d && (c += String.fromCharCode(240 | d >>> 18 & 7, 128 | d >>> 12 & 63, 128 | d >>> 6 & 63, 128 | d & 63));
    return c
};
sha.str2rstr_utf16le = function(a) {
    for (var c = "", b = 0; b < a.length; b++) c += String.fromCharCode(a.charCodeAt(b) & 255, a.charCodeAt(b) >>> 8 & 255);
    return c
};
sha.str2rstr_utf16be = function(a) {
    for (var c = "", b = 0; b < a.length; b++) c += String.fromCharCode(a.charCodeAt(b) >>> 8 & 255, a.charCodeAt(b) & 255);
    return c
};
sha.rstr2binb = function(a) {
    for (var c = Array(a.length >> 2), b = 0; b < c.length; b++) c[b] = 0;
    for (b = 0; b < 8 * a.length; b += 8) c[b >> 5] |= (a.charCodeAt(b / 8) & 255) << 24 - b % 32;
    return c
};
sha.binb2rstr = function(a) {
    for (var c = "", b = 0; b < 32 * a.length; b += 8) c += String.fromCharCode(a[b >> 5] >>> 24 - b % 32 & 255);
    return c
};
sha.binb_sha1 = function(a, c) {
    a[c >> 5] |= 128 << 24 - c % 32;
    a[(c + 64 >> 9 << 4) + 15] = c;
    for (var b = Array(80), d = 1732584193, e = -271733879, f = -1732584194, g = 271733878, h = -1009589776, j = 0; j < a.length; j += 16) {
        for (var k = d, m = e, o = f, p = g, n = h, l = 0; 80 > l; l++) {
            b[l] = 16 > l ? a[j + l] : sha.bit_rol(b[l - 3] ^ b[l - 8] ^ b[l - 14] ^ b[l - 16], 1);
            var q = sha.safe_add(sha.safe_add(sha.bit_rol(d, 5), sha.sha1_ft(l, e, f, g)), sha.safe_add(sha.safe_add(h, b[l]), sha.sha1_kt(l))),
                h = g,
                g = f,
                f = sha.bit_rol(e, 30),
                e = d,
                d = q
        }
        d = sha.safe_add(d, k);
        e = sha.safe_add(e, m);
        f = sha.safe_add(f, o);
        g = sha.safe_add(g, p);
        h = sha.safe_add(h, n)
    }
    return [d, e, f, g, h]
};
sha.sha1_ft = function(a, c, b, d) {
    return 20 > a ? c & b | ~c & d : 40 > a ? c ^ b ^ d : 60 > a ? c & b | c & d | b & d : c ^ b ^ d
};
sha.sha1_kt = function(a) {
    return 20 > a ? 1518500249 : 40 > a ? 1859775393 : 60 > a ? -1894007588 : -899497514
};
sha.safe_add = function(a, c) {
    var b = (a & 65535) + (c & 65535);
    return (a >> 16) + (c >> 16) + (b >> 16) << 16 | b & 65535
};
sha.bit_rol = function(a, c) {
    return a << c | a >>> 32 - c
};

function AWSSigner(a, c) {
    this.accessKeyId = a;
    this.secretKey = c
}
AWSSigner.prototype.sign = function(a, c, b) {
    c = c.toISO8601();
    a = this.addFields(a, c);
    a.hasOwnProperty("AWSAccountId") && a.hasOwnProperty("QueueName") && (delete a.AWSAccountId, delete a.QueueName);
    a.Signature = this.generateSignature(this.canonicalize(a, b));
    return a
};
AWSSigner.prototype.addFields = function(a, c) {
    a.AWSAccessKeyId = this.accessKeyId;
    a.SignatureVersion = this.version;
    a.SignatureMethod = "HmacSHA1";
    a.Timestamp = c;
    return a
};
AWSSigner.prototype.generateSignature = function(a) {
    return sha.b64_hmac_sha1(this.secretKey, a)
};
AWSV2Signer.prototype = new AWSSigner;

function AWSV2Signer(a, c) {
    AWSSigner.call(this, a, c);
    this.version = 2
}
AWSV2Signer.prototype.canonicalize = function(a, c) {
    for (var b = c.verb, d = c.host.toLowerCase(), b = b + "\n" + d + "\n" + c.uriPath + "\n", d = filterAndSortKeys(a, signatureFilter, caseSensitiveComparator), e = !0, f = 0; f < d.length; f++) {
        e ? e = !1 : b += "&";
        var g = d[f],
            b = b + urlEncode(g);
        null !== a[g] && (b += "=" + urlEncode(a[g]))
    }
    return b
};

function filterAndSortKeys(a, c, b) {
    var d = [],
        e;
    for (e in a) c(e, a[e]) || d.push(e);
    return d.sort(b)
}

function signatureFilter(a, c) {
    return "Signature" === a || null === c
}
var awsHelper;
awsHelper = "undefined" !== typeof exports ? exports : {};
awsHelper.generatePayload = function(a, c, b, d) {
    return SignAndEncodeParams(a, c, b, d.replace(/.*:\/\//, ""), "POST", "/")
};
awsHelper.generateSignedURL = function(a, c, b, d, e, f) {
    var g = e,
        h = "/";
    c.Action = a;
    c.Version = f;
    c.hasOwnProperty("AWSAccountId") && c.hasOwnProperty("QueueName") && (a = c.AWSAccountId + "/" + c.QueueName + "/", h += a, g += "/" + a);
    return g += "?" + SignAndEncodeParams(c, b, d, e.replace(/.*:\/\//, ""), "GET", h)
};
awsHelper.generateSESParams = function(a) {
    return (a = generateFlattenedQueryString(a)) && 0 < a.length ? "&" + a : ""
};
awsHelper.generateSQSURL = function(a, c, b, d, e, f) {
    c.hasOwnProperty("AWSAccountId") && c.hasOwnProperty("QueueName") && (e += "/" + c.AWSAccountId + "/" + c.QueueName + "/", delete c.AWSAccountId, delete c.QueueName);
    var a = e + "?SignatureVersion=1&Action=" + a + "&Version=" + encodeURIComponent(f) + "&",
        g;
    for (g in c) e = g, (f = c[g]) && (a += e + "=" + encodeURIComponent(f) + "&");
    c = (new Date((new Date).getTime() + 6E4 * (new Date).getTimezoneOffset())).toISODate();
    a += "Timestamp=" + encodeURIComponent(c) + "&SignatureMethod=HmacSHA1&AWSAccessKeyId=" +
        encodeURIComponent(b);
    b = generateStringToSignForSQS(a);
    d = sha.b64_hmac_sha1(d, b);
    return a += "&Signature=" + encodeURIComponent(d)
};
awsHelper.generateS3Params = function(a) {
    var c = "";
    a.hasOwnProperty("CopySource") && a.hasOwnProperty("ObjectName") && (c = "x-amz-copy-source:" + a.CopySource + "\n");
    a.stringToSign = a.verb + "\n" + a.contentMD5 + "\n" + a.contentType + "\n" + a.curDate + "\n" + c + "/";
    c = "";
    a.hasOwnProperty("BucketName") && (c += a.BucketName + "/", a.hasOwnProperty("ObjectName") ? c += a.ObjectName : a.hasOwnProperty("Key") && (c += a.Key));
    c += a.subResource;
    if (a.hasOwnProperty("BucketName")) {
        var b = "";
        a.UploadId ? (b = [], a.PartNumber && b.push("partNumber=" + a.PartNumber),
            a.UploadId && b.push("uploadId=" + a.UploadId), a.VersionId && b.push("versionId=" + a.VersionId), b = b.join("&")) : a.VersionId && (b = "versionId=" + a.VersionId);
        0 < b.length && (c = "?" === a.subResource ? c + b : "" === a.subResource ? c + ("?" + b) : c + ("&" + b));
        a.url += c
    }
    a.stringToSign += c
};
awsHelper.validateApi = function(a, c, b) {
    return a.validations && (a = sessionOBJ.utility.validateParams(b, a.validations), "" != a) ? (c && (a = sessionOBJ.xmlToJSON.toJSON(a, !0, null), a.message = "Parameter validation failed", c(a.message, a)), !1) : !0
};
awsHelper.prepareExecutor = function(a) {
    a.preparer && !a.prepared && (a.preparer(), a.prepared = !0)
};
awsHelper.findMessageText = function(a) {
    if (a) {
        if (a instanceof String || "string" === typeof a) return a;
        if (a instanceof Array) return awsHelper.findMessageText(a[0]);
        if (a.message) return awsHelper.findMessageText(a.message);
        if (a.Message) return awsHelper.findMessageText(a.Message);
        if (a.Error) return awsHelper.findMessageText(a.Error);
        if (a.Errors) return awsHelper.findMessageText(a.Errors)
    }
    return null
};
awsHelper.httpError = function(a, c, b, d) {
    d && (c = c || {}, c.message = awsHelper.findMessageText(c) || b.error || "HTTP request failed", c.requestUri = a.location, c.statusCode = a.status, c.statusText = a.statusText, c.responseText = a.responseText, d(c.message, c))
};
awsHelper.httpSuccess = function(a, c, b) {
    if (b) {
        var d;
        if (a.getResponseHeaders) d = a.getResponseHeaders(), d.hasOwnProperty("Etag") && (d.ETag = d.Etag, delete d.Etag);
        else if (a.allResponseHeaders) {
            d = {};
            for (var e = a.allResponseHeaders.split("\n"), f = 0; f < e.length; f++) {
                var g = e[f].split(":");
                d[g.shift()] = g.join(":")
            }
        } else Ti.API.error("Unsupported platform! Don't know how to get headers from Ti.Network.HTTPClient!");
        a = {
            requestUri: a.location,
            statusCode: a.status,
            statusText: a.statusText,
            headers: d,
            data: c
        };
        b(a.data, a)
    }
};
awsHelper.createHttpObject = function(a, c, b) {
    var d = Ti.Network.createHTTPClient();
    d.onload = function() {
        awsHelper.httpSuccess(this, sessionOBJ.xmlToJSON.toJSON(this.responseText, !1, a.arrayProps), c)
    };
    d.onerror = function(a) {
        awsHelper.httpError(this, sessionOBJ.xmlToJSON.toJSON(this.responseText, !1, null), a, b)
    };
    return d
};

function SignAndEncodeParams(a, c, b, d, e, f) {
    var a = (new AWSV2Signer(c, b)).sign(a, new Date, {
            verb: e,
            host: d,
            uriPath: f
        }),
        c = [],
        g;
    for (g in a) null !== a[g] ? c.push(encodeURIComponent(g) + "=" + encodeURIComponent(a[g])) : c.push(encodeURIComponent(g));
    return payload = c.join("&")
}

function generateFlattenedQueryString(a) {
    var c = [];
    a && buildParams(a, null, function(a, d) {
        c.push(a + "=" + d || "")
    });
    return c.join("&")
}

function buildParams(a, c, b) {
    var d = c ? c + "." : "";
    if ("[object Array]" === Object.prototype.toString.call(a))
        for (var c = 0, e = a.length; c < e; c++) buildParams(a[c], d + "member." + (c + 1), b);
    else if ("function" === typeof a.getMimeType || "string" === typeof a) b(c, a.toString() || "");
    else if ("object" == typeof a)
        for (e in a) a.hasOwnProperty(e) && buildParams(a[e], d + e, b)
}

function generateStringToSignForSQS(a) {
    var c = "",
        a = a.split("?")[1].split("&");
    a.sort(utility.ignoreCaseSort);
    for (var b = 0; b < a.length; b++) {
        var d = a[b].split("=");
        "Signature" == d[0] || void 0 == d[1] || (c += d[0] + decodeURIComponent(d[1]))
    }
    return c
}
var md5;
md5 = "undefined" !== typeof exports ? exports : {};
var hexcase = 0,
    b64pad = "=";
hex_md5 = function(a) {
    return rstr2hex(rstr_md5(str2rstr_utf8(a)))
};
md5.b64_md5 = function(a) {
    return rstr2b64(rstr_md5(str2rstr_utf8(a)))
};

function any_md5(a, c) {
    return rstr2any(rstr_md5(str2rstr_utf8(a)), c)
}

function hex_hmac_md5(a, c) {
    return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(c)))
}
b64_hmac_md5 = function(a, c) {
    return rstr2b64(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(c)))
};

function any_hmac_md5(a, c, b) {
    return rstr2any(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(c)), b)
}

function md5_vm_test() {
    return "900150983cd24fb0d6963f7d28e17f72" == hex_md5("abc").toLowerCase()
}

function rstr_md5(a) {
    return binl2rstr(binl_md5(rstr2binl(a), 8 * a.length))
}

function rstr_hmac_md5(a, c) {
    var b = rstr2binl(a);
    16 < b.length && (b = binl_md5(b, 8 * a.length));
    for (var d = Array(16), e = Array(16), f = 0; 16 > f; f++) d[f] = b[f] ^ 909522486, e[f] = b[f] ^ 1549556828;
    b = binl_md5(d.concat(rstr2binl(c)), 512 + 8 * c.length);
    return binl2rstr(binl_md5(e.concat(b), 640))
}

function rstr2hex(a) {
    try {
        hexcase
    } catch (c) {
        hexcase = 0
    }
    for (var b = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", d = "", e, f = 0; f < a.length; f++) e = a.charCodeAt(f), d += b.charAt(e >>> 4 & 15) + b.charAt(e & 15);
    return d
}

function rstr2b64(a) {
    try {
        b64pad
    } catch (c) {
        b64pad = ""
    }
    for (var b = "", d = a.length, e = 0; e < d; e += 3)
        for (var f = a.charCodeAt(e) << 16 | (e + 1 < d ? a.charCodeAt(e + 1) << 8 : 0) | (e + 2 < d ? a.charCodeAt(e + 2) : 0), g = 0; 4 > g; g++) b = 8 * e + 6 * g > 8 * a.length ? b + b64pad : b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(f >>> 6 * (3 - g) & 63);
    return b
}

function rstr2any(a, c) {
    var b = c.length,
        d, e, f, g, h, j = Array(Math.ceil(a.length / 2));
    for (d = 0; d < j.length; d++) j[d] = a.charCodeAt(2 * d) << 8 | a.charCodeAt(2 * d + 1);
    var k = Math.ceil(8 * a.length / (Math.log(c.length) / Math.log(2))),
        m = Array(k);
    for (e = 0; e < k; e++) {
        h = [];
        for (d = g = 0; d < j.length; d++)
            if (g = (g << 16) + j[d], f = Math.floor(g / b), g -= f * b, 0 < h.length || 0 < f) h[h.length] = f;
        m[e] = g;
        j = h
    }
    b = "";
    for (d = m.length - 1; 0 <= d; d--) b += c.charAt(m[d]);
    return b
}

function str2rstr_utf8(a) {
    for (var c = "", b = -1, d, e; ++b < a.length;) d = a.charCodeAt(b), e = b + 1 < a.length ? a.charCodeAt(b + 1) : 0, 55296 <= d && 56319 >= d && 56320 <= e && 57343 >= e && (d = 65536 + ((d & 1023) << 10) + (e & 1023), b++), 127 >= d ? c += String.fromCharCode(d) : 2047 >= d ? c += String.fromCharCode(192 | d >>> 6 & 31, 128 | d & 63) : 65535 >= d ? c += String.fromCharCode(224 | d >>> 12 & 15, 128 | d >>> 6 & 63, 128 | d & 63) : 2097151 >= d && (c += String.fromCharCode(240 | d >>> 18 & 7, 128 | d >>> 12 & 63, 128 | d >>> 6 & 63, 128 | d & 63));
    return c
}

function str2rstr_utf16le(a) {
    for (var c = "", b = 0; b < a.length; b++) c += String.fromCharCode(a.charCodeAt(b) & 255, a.charCodeAt(b) >>> 8 & 255);
    return c
}

function str2rstr_utf16be(a) {
    for (var c = "", b = 0; b < a.length; b++) c += String.fromCharCode(a.charCodeAt(b) >>> 8 & 255, a.charCodeAt(b) & 255);
    return c
}

function rstr2binl(a) {
    for (var c = Array(a.length >> 2), b = 0; b < c.length; b++) c[b] = 0;
    for (b = 0; b < 8 * a.length; b += 8) c[b >> 5] |= (a.charCodeAt(b / 8) & 255) << b % 32;
    return c
}

function binl2rstr(a) {
    for (var c = "", b = 0; b < 32 * a.length; b += 8) c += String.fromCharCode(a[b >> 5] >>> b % 32 & 255);
    return c
}

function binl_md5(a, c) {
    a[c >> 5] |= 128 << c % 32;
    a[(c + 64 >>> 9 << 4) + 14] = c;
    for (var b = 1732584193, d = -271733879, e = -1732584194, f = 271733878, g = 0; g < a.length; g += 16) var h = b,
        j = d,
        k = e,
        m = f,
        b = md5_ff(b, d, e, f, a[g + 0], 7, -680876936),
        f = md5_ff(f, b, d, e, a[g + 1], 12, -389564586),
        e = md5_ff(e, f, b, d, a[g + 2], 17, 606105819),
        d = md5_ff(d, e, f, b, a[g + 3], 22, -1044525330),
        b = md5_ff(b, d, e, f, a[g + 4], 7, -176418897),
        f = md5_ff(f, b, d, e, a[g + 5], 12, 1200080426),
        e = md5_ff(e, f, b, d, a[g + 6], 17, -1473231341),
        d = md5_ff(d, e, f, b, a[g + 7], 22, -45705983),
        b = md5_ff(b, d, e, f, a[g + 8], 7,
            1770035416),
        f = md5_ff(f, b, d, e, a[g + 9], 12, -1958414417),
        e = md5_ff(e, f, b, d, a[g + 10], 17, -42063),
        d = md5_ff(d, e, f, b, a[g + 11], 22, -1990404162),
        b = md5_ff(b, d, e, f, a[g + 12], 7, 1804603682),
        f = md5_ff(f, b, d, e, a[g + 13], 12, -40341101),
        e = md5_ff(e, f, b, d, a[g + 14], 17, -1502002290),
        d = md5_ff(d, e, f, b, a[g + 15], 22, 1236535329),
        b = md5_gg(b, d, e, f, a[g + 1], 5, -165796510),
        f = md5_gg(f, b, d, e, a[g + 6], 9, -1069501632),
        e = md5_gg(e, f, b, d, a[g + 11], 14, 643717713),
        d = md5_gg(d, e, f, b, a[g + 0], 20, -373897302),
        b = md5_gg(b, d, e, f, a[g + 5], 5, -701558691),
        f = md5_gg(f, b, d, e, a[g +
            10], 9, 38016083),
        e = md5_gg(e, f, b, d, a[g + 15], 14, -660478335),
        d = md5_gg(d, e, f, b, a[g + 4], 20, -405537848),
        b = md5_gg(b, d, e, f, a[g + 9], 5, 568446438),
        f = md5_gg(f, b, d, e, a[g + 14], 9, -1019803690),
        e = md5_gg(e, f, b, d, a[g + 3], 14, -187363961),
        d = md5_gg(d, e, f, b, a[g + 8], 20, 1163531501),
        b = md5_gg(b, d, e, f, a[g + 13], 5, -1444681467),
        f = md5_gg(f, b, d, e, a[g + 2], 9, -51403784),
        e = md5_gg(e, f, b, d, a[g + 7], 14, 1735328473),
        d = md5_gg(d, e, f, b, a[g + 12], 20, -1926607734),
        b = md5_hh(b, d, e, f, a[g + 5], 4, -378558),
        f = md5_hh(f, b, d, e, a[g + 8], 11, -2022574463),
        e = md5_hh(e, f, b, d, a[g +
            11], 16, 1839030562),
        d = md5_hh(d, e, f, b, a[g + 14], 23, -35309556),
        b = md5_hh(b, d, e, f, a[g + 1], 4, -1530992060),
        f = md5_hh(f, b, d, e, a[g + 4], 11, 1272893353),
        e = md5_hh(e, f, b, d, a[g + 7], 16, -155497632),
        d = md5_hh(d, e, f, b, a[g + 10], 23, -1094730640),
        b = md5_hh(b, d, e, f, a[g + 13], 4, 681279174),
        f = md5_hh(f, b, d, e, a[g + 0], 11, -358537222),
        e = md5_hh(e, f, b, d, a[g + 3], 16, -722521979),
        d = md5_hh(d, e, f, b, a[g + 6], 23, 76029189),
        b = md5_hh(b, d, e, f, a[g + 9], 4, -640364487),
        f = md5_hh(f, b, d, e, a[g + 12], 11, -421815835),
        e = md5_hh(e, f, b, d, a[g + 15], 16, 530742520),
        d = md5_hh(d, e, f,
            b, a[g + 2], 23, -995338651),
        b = md5_ii(b, d, e, f, a[g + 0], 6, -198630844),
        f = md5_ii(f, b, d, e, a[g + 7], 10, 1126891415),
        e = md5_ii(e, f, b, d, a[g + 14], 15, -1416354905),
        d = md5_ii(d, e, f, b, a[g + 5], 21, -57434055),
        b = md5_ii(b, d, e, f, a[g + 12], 6, 1700485571),
        f = md5_ii(f, b, d, e, a[g + 3], 10, -1894986606),
        e = md5_ii(e, f, b, d, a[g + 10], 15, -1051523),
        d = md5_ii(d, e, f, b, a[g + 1], 21, -2054922799),
        b = md5_ii(b, d, e, f, a[g + 8], 6, 1873313359),
        f = md5_ii(f, b, d, e, a[g + 15], 10, -30611744),
        e = md5_ii(e, f, b, d, a[g + 6], 15, -1560198380),
        d = md5_ii(d, e, f, b, a[g + 13], 21, 1309151649),
        b = md5_ii(b,
            d, e, f, a[g + 4], 6, -145523070),
        f = md5_ii(f, b, d, e, a[g + 11], 10, -1120210379),
        e = md5_ii(e, f, b, d, a[g + 2], 15, 718787259),
        d = md5_ii(d, e, f, b, a[g + 9], 21, -343485551),
        b = safe_add(b, h),
        d = safe_add(d, j),
        e = safe_add(e, k),
        f = safe_add(f, m);
    return [b, d, e, f]
}

function md5_cmn(a, c, b, d, e, f) {
    return safe_add(bit_rol(safe_add(safe_add(c, a), safe_add(d, f)), e), b)
}

function md5_ff(a, c, b, d, e, f, g) {
    return md5_cmn(c & b | ~c & d, a, c, e, f, g)
}

function md5_gg(a, c, b, d, e, f, g) {
    return md5_cmn(c & d | b & ~d, a, c, e, f, g)
}

function md5_hh(a, c, b, d, e, f, g) {
    return md5_cmn(c ^ b ^ d, a, c, e, f, g)
}

function md5_ii(a, c, b, d, e, f, g) {
    return md5_cmn(b ^ (c | ~d), a, c, e, f, g)
}

function safe_add(a, c) {
    var b = (a & 65535) + (c & 65535);
    return (a >> 16) + (c >> 16) + (b >> 16) << 16 | b & 65535
}

function bit_rol(a, c) {
    return a << c | a >>> 32 - c
}
var utf8;
utf8 = "undefined" !== typeof exports ? exports : {};
utf8.encode = function(a) {
    for (var a = a.replace(/\r\n/g, "\n"), c = "", b = 0; b < a.length; b++) {
        var d = a.charCodeAt(b);
        128 > d ? c += String.fromCharCode(d) : (127 < d && 2048 > d ? c += String.fromCharCode(d >> 6 | 192) : (c += String.fromCharCode(d >> 12 | 224), c += String.fromCharCode(d >> 6 & 63 | 128)), c += String.fromCharCode(d & 63 | 128))
    }
    return c
};
utf8.decode = function(a) {
    for (var c = "", b = 0, d = c1 = c2 = 0; b < a.length;) d = a.charCodeAt(b), 128 > d ? (c += String.fromCharCode(d), b++) : 191 < d && 224 > d ? (c2 = a.charCodeAt(b + 1), c += String.fromCharCode((d & 31) << 6 | c2 & 63), b += 2) : (c2 = a.charCodeAt(b + 1), c3 = a.charCodeAt(b + 2), c += String.fromCharCode((d & 15) << 12 | (c2 & 63) << 6 | c3 & 63), b += 3);
    return c
};
var BedFrame;
BedFrame = "undefined" !== typeof BedFrame ? exports : {};
BedFrame.PROPERTY_TYPE_ONLY_LATEST = 0;
BedFrame.PROPERTY_TYPE_SLASH_COMBINE = 1;
BedFrame.PROPERTY_TYPE_IGNORE = 2;
BedFrame.build = function bedFrameTransformObject(c, b) {
    var d = b.children || [],
        e;
    for (e in d)
        if (d.hasOwnProperty(e)) {
            var f = d[e],
                g = f.propertyTypes || b.propertyTypes || {};
            g.children = BedFrame.PROPERTY_TYPE_IGNORE;
            for (var h in b)
                if (b.hasOwnProperty(h)) switch (g[h] || BedFrame.PROPERTY_TYPE_ONLY_LATEST) {
                    case BedFrame.PROPERTY_TYPE_ONLY_LATEST:
                        f[h] = void 0 === f[h] ? b[h] : f[h];
                        break;
                    case BedFrame.PROPERTY_TYPE_SLASH_COMBINE:
                        var j = [];
                        b[h] && j.push(b[h]);
                        f[h] && j.push(f[h]);
                        f[h] = j.join("/")
                }
                f.method && !f.children ? c[f.method] =
                function(b) {
                    return function() {
                        return b.executor.apply(b, arguments)
                    }
                }(f) : f.property && bedFrameTransformObject(c[f.property] = {}, f)
        }
};
var xmlToJS;
xmlToJS = "undefined" !== typeof exports ? exports : {};
String.prototype.trim = function() {
    return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "")
};
xmlToJS.convert = function convert(c, b) {
    var d = {},
        e = c.attributes;
    if (e && e.length)
        for (var f = 1, g = e.length; f < g; f++) {
            var h = e.item(f);
            d[h.name.split(":").join("_")] = h.getValue()
        }
    if ((g = c.childNodes) && g.length)
        for (var h = 0, j = g.length; h < j; h++) switch (f = g.item(h), f.nodeType) {
            case f.ELEMENT_NODE:
                var k = f.nodeName.split(":").join("_");
                if ("undefined" == typeof d[k]) d[k] = b && b[k] ? [convert(f, b)] : convert(f, b);
                else {
                    if ("undefined" == typeof d[k].push) {
                        var m = d[k];
                        d[k] = [];
                        d[k].push(m)
                    }
                    d[k].push(convert(f, b))
                }
                break;
            case f.TEXT_NODE:
                d =
                    f.nodeValue;
                try {
                    "{" === d.substr(0, 1) && (d = JSON.parse(f.parentNode.textContent))
                } catch (o) {}
                return d
        }
    return (!e || !e.length) && (!g || !g.length) ? null : d
};
xmlToJS.toJSON = function(a, c, b) {
    if ("string" === typeof a && null !== a && "" !== a) {
        if (c) return xmlToJS.convert(Ti.XML.parseString(a).documentElement, b);
        for (c = ""; - 1 < a.indexOf("<");) c += a.slice(a.indexOf("<"), a.indexOf(">") + 1), c += a.slice(a.indexOf(">") + 1, a.indexOf("<", a.indexOf(">"))).trim(), a = a.substring(a.indexOf(">") + 1);
        return xmlToJS.convert(Ti.XML.parseString(c).documentElement, b)
    }
    return {}
};
var utility;
utility = "undefined" !== typeof exports ? exports : {};
utility.validateParams = function(a, c) {
    var b = "",
        d;
    for (d in c)
        if (fnValidate = validators[d], data = c[d], res = fnValidate(a, data), "" == !res) {
            b = prepareMessage(res, d);
            break
        }
    return b
};
exports.compareTime = function(a, c, b) {
    return (new Date(a)).getTime() + 1E3 * b >= (new Date(c)).getTime() ? !0 : !1
};
utility.ignoreCaseSort = function(a, c) {
    var b = 0,
        a = a.toLowerCase(),
        c = c.toLowerCase();
    a > c && (b = 1);
    a < c && (b = -1);
    return b
};
validators = {
    required: function(a, c) {
        var b = c.params;
        for (x = 0; x < b.length; x++)
            if (void 0 == a[b[x]] || null == a[b[x]] || "" == a[b[x]]) return b[x];
        return ""
    },
    rangeValidator: function(a, c) {
        var b = c.params;
        for (x = 0; x < b.length; x++) {
            if (a[b[x]].length < c.min || a[b[x]].length > c.max) return L("lengthValidation");
            for (i = 0; 29 > i; i++)
                if (-1 != a[b[x]].indexOf("!@#$%^&*()+=-[]\\';,./{}|\":<>?" [i])) return L("symbolValidation")
        }
        return ""
    }
};
prepareMessage = function(a, c) {
    var b = "";
    return b = '<?xml version="1.0"?><Response><Errors><Error><Code>' + L(c) + "</Code><Message>" + a + "</Message></Error></Errors></Response>"
};
Date.prototype.toISODate = function() {
    return this.getFullYear() + "-" + addZero(this.getMonth() + 1) + "-" + addZero(this.getDate()) + "T" + addZero(this.getHours()) + ":" + addZero(this.getMinutes()) + ":" + addZero(this.getSeconds()) + ".000Z"
};
Date.prototype.toISO8601 = function() {
    return this.getUTCFullYear() + "-" + addZero(this.getUTCMonth() + 1) + "-" + addZero(this.getUTCDate()) + "T" + addZero(this.getUTCHours()) + ":" + addZero(this.getUTCMinutes()) + ":" + addZero(this.getUTCSeconds()) + ".000Z"
};

function caseInsensitiveComparator(a, c) {
    return simpleComparator(a.toLowerCase(), c.toLowerCase())
}

function caseSensitiveComparator(a, c) {
    var b = a.length;
    c.length < b && (b = c.length);
    for (var d = 0; d < b; d++) {
        var e = simpleComparator(a.charCodeAt(d), c.charCodeAt(d));
        if (0 !== e) return e
    }
    return a.length == c.length ? 0 : c.length > a.length ? -1 : 1
}

function simpleComparator(a, c) {
    return a < c ? -1 : a > c ? 1 : 0
}

function addZero(a) {
    return (0 > a || 9 < a ? "" : "0") + a
}

function urlEncode(a) {
    return encodeURIComponent(a).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A")
}
var sha256;
sha256 = "undefined" !== typeof exports ? exports : {};
sha256.hexcase = 0;
sha256.b64pad = "=";
sha256.hex_sha256 = function(a) {
    return sha256.rstr2hex(sha256.rstr_sha256(sha256.str2rstr_utf8(a)))
};
sha256.b64_sha256 = function(a) {
    return sha256.rstr_sha256(sha256.str2rstr_utf8(a))
};
sha256.any_sha256 = function(a, c) {
    return sha256.rstr2any(sha256.rstr_sha256(sha256.str2rstr_utf8(a)), c)
};
sha256.hex_hmac_sha256 = function(a, c) {
    return sha256.rstr2hex(sha256.rstr_hmac_sha256(sha256.str2rstr_utf8(a), sha256.str2rstr_utf8(c)))
};
sha256.b64_hmac_sha256 = function(a, c) {
    return sha256.rstr2b64(sha256.rstr_hmac_sha256(sha256.str2rstr_utf8(a), sha256.str2rstr_utf8(c)))
};
sha256.b64_hmac_sha256_sha256 = function(a, c) {
    return sha256.rstr2b64(sha256.rstr_hmac_sha256(a, sha256.rstr_sha256(c)))
};
sha256.any_hmac_sha256 = function(a, c, b) {
    return sha256.rstr2any(sha256.rstr_hmac_sha256(sha256.str2rstr_utf8(a), sha256.str2rstr_utf8(c)), b)
};
sha256.sha256_vm_test = function() {
    return "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" == sha256.hex_sha256("abc").toLowerCase()
};
sha256.sha256_vm_test1 = function() {
    return "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592" == sha256.hex_sha256("The quick brown fox jumps over the lazy dog").toLowerCase()
};
sha256.rstr_sha256 = function(a) {
    return sha256.binb2rstr(sha256.binb_sha256(sha256.rstr2binb(a), 8 * a.length))
};
sha256.rstr_hmac_sha256 = function(a, c) {
    var b = sha256.rstr2binb(a);
    16 < b.length && (b = sha256.binb_sha256(b, 8 * a.length));
    for (var d = Array(16), e = Array(16), f = 0; 16 > f; f++) d[f] = b[f] ^ 909522486, e[f] = b[f] ^ 1549556828;
    b = sha256.binb_sha256(d.concat(sha256.rstr2binb(c)), 512 + 8 * c.length);
    return sha256.binb2rstr(sha256.binb_sha256(e.concat(b), 768))
};
sha256.rstr2hex = function(a) {
    try {
        hexcase
    } catch (c) {
        hexcase = 0
    }
    for (var b = hexcase ? "0123456789ABCDEF" : "0123456789abcdef", d = "", e, f = 0; f < a.length; f++) e = a.charCodeAt(f), d += b.charAt(e >>> 4 & 15) + b.charAt(e & 15);
    return d
};
sha256.rstr2b64 = function(a) {
    try {
        b64pad
    } catch (c) {
        b64pad = ""
    }
    for (var b = "", d = a.length, e = 0; e < d; e += 3)
        for (var f = a.charCodeAt(e) << 16 | (e + 1 < d ? a.charCodeAt(e + 1) << 8 : 0) | (e + 2 < d ? a.charCodeAt(e + 2) : 0), g = 0; 4 > g; g++) b = 8 * e + 6 * g > 8 * a.length ? b + b64pad : b + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(f >>> 6 * (3 - g) & 63);
    return b
};
sha256.rstr2any = function(a, c) {
    var b = c.length,
        d = [],
        e, f, g, h, j = Array(Math.ceil(a.length / 2));
    for (e = 0; e < j.length; e++) j[e] = a.charCodeAt(2 * e) << 8 | a.charCodeAt(2 * e + 1);
    for (; 0 < j.length;) {
        h = [];
        for (e = g = 0; e < j.length; e++)
            if (g = (g << 16) + j[e], f = Math.floor(g / b), g -= f * b, 0 < h.length || 0 < f) h[h.length] = f;
        d[d.length] = g;
        j = h
    }
    b = "";
    for (e = d.length - 1; 0 <= e; e--) b += c.charAt(d[e]);
    d = Math.ceil(8 * a.length / (Math.log(c.length) / Math.log(2)));
    for (e = b.length; e < d; e++) b = c[0] + b;
    return b
};
sha256.str2rstr_utf8 = function(a) {
    for (var c = "", b = -1, d, e; ++b < a.length;) d = a.charCodeAt(b), e = b + 1 < a.length ? a.charCodeAt(b + 1) : 0, 55296 <= d && 56319 >= d && 56320 <= e && 57343 >= e && (d = 65536 + ((d & 1023) << 10) + (e & 1023), b++), 127 >= d ? c += String.fromCharCode(d) : 2047 >= d ? c += String.fromCharCode(192 | d >>> 6 & 31, 128 | d & 63) : 65535 >= d ? c += String.fromCharCode(224 | d >>> 12 & 15, 128 | d >>> 6 & 63, 128 | d & 63) : 2097151 >= d && (c += String.fromCharCode(240 | d >>> 18 & 7, 128 | d >>> 12 & 63, 128 | d >>> 6 & 63, 128 | d & 63));
    return c
};
sha256.str2rstr_utf16le = function(a) {
    for (var c = "", b = 0; b < a.length; b++) c += String.fromCharCode(a.charCodeAt(b) & 255, a.charCodeAt(b) >>> 8 & 255);
    return c
};
str2rstr_utf16be = function(a) {
    for (var c = "", b = 0; b < a.length; b++) c += String.fromCharCode(a.charCodeAt(b) >>> 8 & 255, a.charCodeAt(b) & 255);
    return c
};
sha256.rstr2binb = function(a) {
    for (var c = Array(a.length >> 2), b = 0; b < c.length; b++) c[b] = 0;
    for (b = 0; b < 8 * a.length; b += 8) c[b >> 5] |= (a.charCodeAt(b / 8) & 255) << 24 - b % 32;
    return c
};
sha256.binb2rstr = function(a) {
    for (var c = "", b = 0; b < 32 * a.length; b += 8) c += String.fromCharCode(a[b >> 5] >>> 24 - b % 32 & 255);
    return c
};
sha256.sha256_S = function(a, c) {
    return a >>> c | a << 32 - c
};
sha256.sha256_R = function(a, c) {
    return a >>> c
};
sha256.sha256_Ch = function(a, c, b) {
    return a & c ^ ~a & b
};
sha256.sha256_Maj = function(a, c, b) {
    return a & c ^ a & b ^ c & b
};
sha256.sha256_Sigma0256 = function(a) {
    return sha256.sha256_S(a, 2) ^ sha256.sha256_S(a, 13) ^ sha256.sha256_S(a, 22)
};
sha256.sha256_Sigma1256 = function(a) {
    return sha256.sha256_S(a, 6) ^ sha256.sha256_S(a, 11) ^ sha256.sha256_S(a, 25)
};
sha256.sha256_Gamma0256 = function(a) {
    return sha256.sha256_S(a, 7) ^ sha256.sha256_S(a, 18) ^ sha256.sha256_R(a, 3)
};
sha256.sha256_Gamma1256 = function(a) {
    return sha256.sha256_S(a, 17) ^ sha256.sha256_S(a, 19) ^ sha256.sha256_R(a, 10)
};
sha256.sha256_Sigma0512 = function(a) {
    return sha256.sha256_S(a, 28) ^ sha256.sha256_S(a, 34) ^ sha256.sha256_S(a, 39)
};
sha256.sha256_Sigma1512 = function(a) {
    return sha256.sha256_S(a, 14) ^ sha256.sha256_S(a, 18) ^ sha256.sha256_S(a, 41)
};
sha256.sha256_Gamma0512 = function(a) {
    return sha256.sha256_S(a, 1) ^ sha256.sha256_S(a, 8) ^ sha256.sha256_R(a, 7)
};
sha256.sha256_Gamma1512 = function(a) {
    return sha256.sha256_S(a, 19) ^ sha256.sha256_S(a, 61) ^ sha256.sha256_R(a, 6)
};
sha256.sha256_K = [1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998];
sha256.binb_sha256 = function(a, c) {
    var b = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225],
        d = Array(64),
        e, f, g, h, j, k, m, o, p, n, l, q;
    a[c >> 5] |= 128 << 24 - c % 32;
    a[(c + 64 >> 9 << 4) + 15] = c;
    for (p = 0; p < a.length; p += 16) {
        e = b[0];
        f = b[1];
        g = b[2];
        h = b[3];
        j = b[4];
        k = b[5];
        m = b[6];
        o = b[7];
        for (n = 0; 64 > n; n++) d[n] = 16 > n ? a[n + p] : sha256.safe_add(sha256.safe_add(sha256.safe_add(sha256.sha256_Gamma1256(d[n - 2]), d[n - 7]), sha256.sha256_Gamma0256(d[n - 15])), d[n - 16]), l = sha256.safe_add(sha256.safe_add(sha256.safe_add(sha256.safe_add(o,
            sha256.sha256_Sigma1256(j)), sha256.sha256_Ch(j, k, m)), sha256.sha256_K[n]), d[n]), q = sha256.safe_add(sha256.sha256_Sigma0256(e), sha256.sha256_Maj(e, f, g)), o = m, m = k, k = j, j = sha256.safe_add(h, l), h = g, g = f, f = e, e = sha256.safe_add(l, q);
        b[0] = sha256.safe_add(e, b[0]);
        b[1] = sha256.safe_add(f, b[1]);
        b[2] = sha256.safe_add(g, b[2]);
        b[3] = sha256.safe_add(h, b[3]);
        b[4] = sha256.safe_add(j, b[4]);
        b[5] = sha256.safe_add(k, b[5]);
        b[6] = sha256.safe_add(m, b[6]);
        b[7] = sha256.safe_add(o, b[7])
    }
    return b
};
sha256.safe_add = function(a, c) {
    var b = (a & 65535) + (c & 65535);
    return (a >> 16) + (c >> 16) + (b >> 16) << 16 | b & 65535
};
var sessionOBJ = {
        utility: utility,
        bedFrame: BedFrame,
        xmlToJSON: xmlToJS,
        awsHelper: awsHelper,
        utf8: utf8,
        sha256: sha256,
        sha: sha,
        md5: md5,
        accessKeyId: null,
        secretKey: null
    },
    isiOS = "iPhone OS" == Ti.Platform.name,
    customUserAgent = "aws-sdk-appcelerator " + Titanium.version + " " + Titanium.Platform.version + " " + Titanium.Platform.osname + " " + Titanium.Locale.currentLocale;
Titanium.userAgent = customUserAgent;
var regionEndpoint = "us-east-1",
    defaultQueryExecutor = function(a, c, b) {
        awsHelper.prepareExecutor(this);
        if (!1 == awsHelper.validateApi(this, b, a)) return !1;
        sUrl = "SQS" === this.property ? sessionOBJ.awsHelper.generateSQSURL(this.action, a, sessionOBJ.accessKeyId, sessionOBJ.secretKey, this.endpoint, this.version) : sessionOBJ.awsHelper.generateSignedURL(this.action, a, sessionOBJ.accessKeyId, sessionOBJ.secretKey, this.endpoint, this.version);
        a = awsHelper.createHttpObject(this, c, b);
        a.open(this.verb, sUrl);
        a.setRequestHeader("User-Agent",
            customUserAgent);
        a.send()
    },
    snsExecutor = function(a, c, b) {
        this.endpoint = "http://sns." + regionEndpoint + ".amazonaws.com";
        awsHelper.prepareExecutor(this);
        if (!1 == awsHelper.validateApi(this, b, a)) return !1;
        c = awsHelper.createHttpObject(this, c, b);
        a.Action = this.action;
        a.Version = this.version;
        payload = sessionOBJ.awsHelper.generatePayload(a, sessionOBJ.accessKeyId, sessionOBJ.secretKey, this.endpoint);
        isiOS ? c.open(this.verb, this.endpoint + "?" + payload) : c.open(this.verb, this.endpoint);
        c.setRequestHeader("User-Agent", customUserAgent);
        c.setRequestHeader("Host", "sns." + regionEndpoint +
            ".amazonaws.com");
        isiOS ? c.send() : c.send(payload)
    },
    s3Executor = function(a, c, b) {
        awsHelper.prepareExecutor(this);
        if (!1 == awsHelper.validateApi(this, b, a)) return !1;
        var d = Ti.Network.createHTTPClient();
        a.contentType = this.contentType || "";
        a.contentMD5 = this.computeMD5 && a.XMLTemplate ? sessionOBJ.md5.b64_md5(a.XMLTemplate) : "";
        a.hasOwnProperty("subResource") || (a.subResource = this.subResource);
        var e = (new Date).toUTCString();
        a.verb = this.verb;
        a.curDate = e;
        a.url = this.endpoint;
        a.stringToSign = "";
        "getPresignedUrl" == this.method &&
            (a.curDate = a.Expires);
        if (this.uploadFile) {
            var f = a.File.read();
            f && (a.contentType = f.mimeType);
            a.contentLength = a.File.size
        }
        sessionOBJ.awsHelper.generateS3Params(a);
        var g = sessionOBJ.sha.b64_hmac_sha1(sessionOBJ.utf8.encode(sessionOBJ.secretKey), sessionOBJ.utf8.encode(a.stringToSign));
        if ("listVersions" == this.method) a.url = "https://" + a.BucketName + this.endpoint + a.subResource;
        else if ("deleteVersion" == this.method) a.url = "https://" + a.BucketName + this.endpoint + a.Key + "?versionId=" + a.VersionId;
        else if ("getPresignedUrl" ==
            this.method) {
            a = a.url + "?AWSAccessKeyId=" + sessionOBJ.accessKeyId + "&Expires=" + a.Expires + "&Signature=" + encodeURIComponent(g);
            c(a, null);
            return
        }
        g = "AWS " + sessionOBJ.accessKeyId + ":" + g;
        d.open(this.verb, a.url);
        d.setRequestHeader("User-Agent", customUserAgent);
        d.setRequestHeader("Authorization", g);
        d.setRequestHeader("Date", e);
        "listVersions" == this.method || "deleteVersion" == this.method ? d.setRequestHeader("Host", a.BucketName + ".s3.amazonaws.com") : d.setRequestHeader("Host", "s3.amazonaws.com");
        this.contentType && d.setRequestHeader("Content-Type",
            a.contentType);
        this.uploadFile && (d.setRequestHeader("Content-Type", a.contentType), "android" !== Ti.Platform.osname && d.setRequestHeader("Content-Length", a.contentLength));
        this.computeMD5 && a.contentMD5 && d.setRequestHeader("Content-MD5", a.contentMD5);
        a.hasOwnProperty("CopySource") && d.setRequestHeader("x-amz-copy-source", a.CopySource);
        var h = this.method,
            j = this;
        d.onload = function() {
            "GET" == this.connectionType || "POST" == this.connectionType || "uploadPartCopy" == h ? "getObjectTorrent" === h || "getObject" === h ? awsHelper.httpSuccess(this,
                this.responseData, c) : "getBucketPolicy" === h ? awsHelper.httpSuccess(this, this.responseText, c) : awsHelper.httpSuccess(this, sessionOBJ.xmlToJSON.toJSON(this.responseText, !0, j.arrayProps), c) : awsHelper.httpSuccess(this, this.responseText, c)
        };
        d.onerror = function(a) {
            awsHelper.httpError(this, sessionOBJ.xmlToJSON.toJSON(this.responseText, !1, null), a, b)
        };
        a.hasOwnProperty("XMLTemplate") ? d.send(a.XMLTemplate) : f && 0 < a.contentLength ? d.send(f) : d.send()
    },
    sesExecutor = function(a, c, b) {
    	this.endpoint = "https://email." + regionEndpoint + ".amazonaws.com";
    	this.host = "email." + regionEndpoint + ".amazonaws.com";
        awsHelper.prepareExecutor(this);
        if (!1 ==
            awsHelper.validateApi(this, b, a)) return !1;
        var d = sessionOBJ.awsHelper.generateSESParams(a),
            a = (new Date).toUTCString(),
            d = sessionOBJ.utf8.encode("AWSAccessKeyId=" + sessionOBJ.accessKeyId + "&Action=" + this.action + d + "&Timestamp=" + a),
            e = "AWS3-HTTPS AWSAccessKeyId=" + sessionOBJ.accessKeyId + ",Algorithm=" + this.algorithm + ",Signature=" + sessionOBJ.sha.b64_hmac_sha1(sessionOBJ.secretKey, a),
            c = awsHelper.createHttpObject(this, c, b);
        c.open(this.verb, this.endpoint);
        c.setRequestHeader("User-Agent", customUserAgent);
        c.setRequestHeader("Content-Type",
            this.contentType);
        c.setRequestHeader("Host", this.host);
        c.setRequestHeader("Date", a);
        c.setRequestHeader("X-Amzn-Authorization", e);
        c.send(d)
    },
    stsExecutor = function(a, c, b) {
        awsHelper.prepareExecutor(this);
        a.Action = this.action;
        a.Version = this.version;
        var d = this,
            e = Ti.Network.createHTTPClient();
        e.onload = function() {
            jsResp = sessionOBJ.xmlToJSON.toJSON(this.responseText, !1, d.arrayProps);
            Ti.App.Properties.setString("tempSessionToken", jsResp.GetSessionTokenResult.Credentials.SessionToken);
            Ti.App.Properties.setString("tempSecretAccessKey",
                jsResp.GetSessionTokenResult.Credentials.SecretAccessKey);
            Ti.App.Properties.setString("tempAccessKeyID", jsResp.GetSessionTokenResult.Credentials.AccessKeyId);
            Ti.App.Properties.setString("tempExpiration", jsResp.GetSessionTokenResult.Credentials.Expiration);
            awsHelper.httpSuccess(this, jsResp, c)
        };
        e.onerror = function(a) {
            awsHelper.httpError(this, sessionOBJ.xmlToJSON.toJSON(this.responseText, !1, null), a, b)
        };
        sUrl = sessionOBJ.awsHelper.generatePayload(a, sessionOBJ.accessKeyId, sessionOBJ.secretKey, this.endpoint);
        isiOS ? e.open(this.verb, this.endpoint + "?" + payload) : e.open(this.verb, this.endpoint);
        e.setRequestHeader("User-Agent", customUserAgent);
        e.setRequestHeader("Host", "sts.amazonaws.com");
        isiOS ? e.send() : e.send(payload)
    },
    dynamoDbExecutor = function(a, c, b) {
        awsHelper.prepareExecutor(this);
        if (!1 == awsHelper.validateApi(this, b, a)) return !1;
        var d = (new Date((new Date).getTime() + 6E4 * (new Date).getTimezoneOffset())).toISODate(),
            e = this;
        null == Ti.App.Properties.getString("tempExpiration") || null != Ti.App.Properties.getString("tempExpiration") &&
            sessionOBJ.utility.compareTime(d, Ti.App.Properties.getString("tempExpiration"), 300) ? AWS.STS.getSessionToken({}, function() {
                dynamoDBCall(e, a, c, b)
            }, function() {
                b(this.responseText, null)
            }) : dynamoDBCall(e, a, c, b)
    },
    dynamoDBCall = function(a, c, b, d) {
        var e = (new Date).toUTCString(),
            f = Ti.App.Properties.getString("tempAccessKeyID"),
            g = Ti.App.Properties.getString("tempSessionToken"),
            h = Ti.App.Properties.getString("tempSecretAccessKey"),
            j = a.verb + "\n/\n\n" + ("host:" + a.host + "\nx-amz-date:" + e + "\nx-amz-security-token:" + g +
                "\nx-amz-target:DynamoDB_20111205." + a.action + "\n") + "\n" + JSON.stringify(c.RequestJSON),
            j = sessionOBJ.sha256.b64_hmac_sha256_sha256(h, j);
        "=" !== j.substring(j.length - 1) && (j += "=");
        h = Ti.Network.createHTTPClient();
        h.onload = function() {
            awsHelper.httpSuccess(this, JSON.parse(this.responseText), b)
        };
        h.onerror = function(a) {
            awsHelper.httpError(this, JSON.parse(this.responseText), a, d)
        };
        h.open(a.verb, a.endpoint);
        h.setRequestHeader("User-Agent", customUserAgent);
        f = "AWS3 AWSAccessKeyId=" + f + ",Algorithm=" + a.algorithm + ",SignedHeaders=Host;X-Amz-Date;x-amz-security-token;X-Amz-Target,Signature=" +
            j;
        h.setRequestHeader("X-Amz-Target", "DynamoDB_20111205." + a.action);
        h.setRequestHeader("Content-Type", a.contentType);
        h.setRequestHeader("x-amz-security-token", g);
        h.setRequestHeader("Date", e);
        h.setRequestHeader("X-Amz-Date", e);
        h.setRequestHeader("Host", a.host);
        h.setRequestHeader("X-Amzn-Authorization", f);
        h.send(JSON.stringify(c.RequestJSON))
    },
    AWS = {
        authorize: function(a, c) {
            sessionOBJ.accessKeyId = a;
            sessionOBJ.secretKey = c;
        },
        setRegionEndpoint : function(e) {
        	regionEndpoint = e || regionEndpoint;
        }
    };

sessionOBJ.bedFrame.build(AWS, {
    verb: "GET",
    version: "2009-04-15",
    executor: defaultQueryExecutor,
    preparer: function() {
        this.action || (initCap = this.method.substr(0, 1).toUpperCase(), this.action = initCap + this.method.substr(1))
    },
    children: [{
        property: "SimpleDB",
        endpoint: "https://sdb.amazonaws.com",
        children: [{
            method: "batchDeleteAttributes",
            validations: {
                required: {
                    params: ["DomainName"]
                }
            }
        }, {
            method: "batchPutAttributes",
            validations: {
                required: {
                    params: ["DomainName"]
                }
            }
        }, {
            method: "createDomain",
            validations: {
                required: {
                    params: ["DomainName"]
                },
                rangeValidator: {
                    min: 3,
                    max: 255,
                    params: ["DomainName"]
                }
            }
        }, {
            method: "deleteAttributes",
            validations: {
                required: {
                    params: ["DomainName", "ItemName"]
                }
            }
        }, {
            method: "deleteDomain",
            validations: {
                required: {
                    params: ["DomainName"]
                }
            }
        }, {
            method: "domainMetadata",
            validations: {
                required: {
                    params: ["DomainName"]
                }
            }
        }, {
            method: "getAttributes",
            arrayProps: {
                Attribute: 1
            },
            validations: {
                required: {
                    params: ["DomainName", "ItemName"]
                }
            }
        }, {
            method: "listDomains",
            arrayProps: {
                DomainName: 1
            }
        }, {
            method: "putAttributes",
            validations: {
                required: {
                    params: ["DomainName",
                        "ItemName"
                    ]
                }
            }
        }, {
            method: "select",
            arrayProps: {
                Item: 1,
                Attribute: 1
            },
            validations: {
                required: {
                    params: ["SelectExpression"]
                }
            }
        }]
    }, {
        property: "S3",
        endpoint: "https://s3.amazonaws.com/",
        executor: s3Executor,
        uploadFile: !1,
        subResource: "",
        children: [{
            method: "deleteBucket",
            verb: "DELETE",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "deleteBucketLifecycle",
            verb: "DELETE",
            subResource: "?lifecycle",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "deleteBucketPolicy",
            verb: "DELETE",
            subResource: "?policy",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "deleteBucketTagging",
            verb: "DELETE",
            subResource: "?tagging",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "deleteBucketWebsite",
            verb: "DELETE",
            subResource: "?website",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucket",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketAcl",
            subResource: "?acl",
            arrayProps: {
                Grant: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketLifecycle",
            subResource: "?lifecycle",
            arrayProps: {
                Rule: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketPolicy",
            subResource: "?policy",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketLocation",
            subResource: "?location",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketLogging",
            subResource: "?logging",
            arrayProps: {
                Grant: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketNotification",
            subResource: "?notification",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketTagging",
            subResource: "?tagging",
            arrayProps: {
                Tag: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketObjectVersions",
            subResource: "?versions",
            arrayProps: {
                Version: 1,
                DeleteMarker: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketRequestPayment",
            subResource: "?requestPayment",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketVersioning",
            subResource: "?versioning",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "getBucketWebsite",
            subResource: "?website",
            arrayProps: {
                Key: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "headBucket",
            verb: "HEAD",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "listMultipartUploads",
            subResource: "?uploads",
            arrayProps: {
                Upload: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "putBucket",
            verb: "PUT",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "putBucketAcl",
            verb: "PUT",
            subResource: "?acl",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketLifecycle",
            verb: "PUT",
            subResource: "?lifecycle",
            contentType: "application/xml",
            computeMD5: !0,
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketPolicy",
            verb: "PUT",
            subResource: "?policy",
            contentType: "application/json",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketLogging",
            verb: "PUT",
            subResource: "?logging",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketNotification",
            verb: "PUT",
            subResource: "?notification",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName",
                        "XMLTemplate"
                    ]
                }
            }
        }, {
            method: "putBucketTagging",
            verb: "PUT",
            subResource: "?tagging",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketRequestPayment",
            verb: "PUT",
            subResource: "?requestPayment",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketVersioning",
            verb: "PUT",
            subResource: "?versioning",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "putBucketWebsite",
            verb: "PUT",
            subResource: "?website",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "getService",
            arrayProps: {
                Bucket: 1
            }
        }, {
            method: "deleteObject",
            verb: "DELETE",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName"]
                }
            }
        }, {
            method: "deleteMultipleObjects",
            verb: "POST",
            subResource: "?delete",
            contentType: "application/xml",
            computeMD5: !0,
            arrayProps: {
                Deleted: 1,
                Error: 1
            },
            validations: {
                required: {
                    params: ["BucketName", "XMLTemplate"]
                }
            }
        }, {
            method: "getObject",
            validations: {
                required: {
                    params: ["BucketName",
                        "ObjectName"
                    ]
                }
            }
        }, {
            method: "getObjectAcl",
            subResource: "?acl",
            arrayProps: {
                Grant: 1
            },
            validations: {
                required: {
                    params: ["BucketName", "ObjectName"]
                }
            }
        }, {
            method: "getObjectTorrent",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName"]
                }
            }
        }, {
            method: "headObject",
            verb: "HEAD",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName"]
                }
            }
        }, {
            method: "putObject",
            verb: "PUT",
            uploadFile: !0,
            validations: {
                required: {
                    params: ["BucketName", "ObjectName"]
                }
            }
        }, {
            method: "putObjectAcl",
            verb: "PUT",
            subResource: "?acl",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName", "XMLTemplate"]
                }
            }
        }, {
            method: "putObjectCopy",
            verb: "PUT",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName", "CopySource"]
                }
            }
        }, {
            method: "initiateMultipartUpload",
            verb: "POST",
            subResource: "?uploads",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName"]
                }
            }
        }, {
            method: "uploadPart",
            verb: "PUT",
            uploadFile: !0,
            validations: {
                required: {
                    params: ["BucketName", "ObjectName", "UploadId", "PartNumber", "File"]
                }
            }
        }, {
            method: "uploadPartCopy",
            verb: "PUT",
            validations: {
                required: {
                    params: ["BucketName",
                        "ObjectName", "UploadId", "PartNumber"
                    ]
                }
            }
        }, {
            method: "completeMultipartUpload",
            verb: "POST",
            contentType: "application/xml",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName", "UploadId", "XMLTemplate"]
                }
            }
        }, {
            method: "abortMultipartUpload",
            verb: "DELETE",
            validations: {
                required: {
                    params: ["BucketName", "ObjectName", "UploadId"]
                }
            }
        }, {
            method: "listParts",
            arrayProps: {
                Part: 1
            },
            validations: {
                required: {
                    params: ["BucketName", "ObjectName", "UploadId"]
                }
            }
        }, {
            method: "getObjectMetadata",
            verb: "HEAD",
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "listVersions",
            verb: "GET",
            endpoint: ".s3.amazonaws.com/",
            subResource: "?versions",
            arrayProps: {
                Version: 1
            },
            validations: {
                required: {
                    params: ["BucketName"]
                }
            }
        }, {
            method: "deleteVersion",
            verb: "DELETE",
            endpoint: ".s3.amazonaws.com/",
            validations: {
                required: {
                    params: ["BucketName", "Key", "VersionId"]
                }
            }
        }, {
            method: "getPresignedUrl",
            validations: {
                required: {
                    params: ["BucketName", "Expires"]
                }
            }
        }]
    }, {
        property: "SES",
        endpoint: "https://email." + regionEndpoint + ".amazonaws.com",
        verb: "POST",
        host: "email." + regionEndpoint + ".amazonaws.com",
        algorithm: "HmacSHA1",
        contentType: "application/x-www-form-urlencoded",
        executor: sesExecutor,
        children: [{
            method: "deleteVerifiedEmailAddress",
            validations: {
                required: {
                    params: ["EmailAddress"]
                }
            }
        }, {
            method: "getSendQuota"
        }, {
            method: "getSendStatistics",
            arrayProps: {
                member: 1
            }
        }, {
            method: "listVerifiedEmailAddresses",
            arrayProps: {
                member: 1
            }
        }, {
            method: "sendEmail",
            validations: {
                required: {
                    params: ["Source", "Destination", "Message"]
                }
            }
        }, {
            method: "sendRawEmail",
            validations: {
                required: {
                    params: ["RawMessage"]
                }
            }
        }, {
            method: "verifyEmailAddress",
            validations: {
                required: {
                    params: ["EmailAddress"]
                }
            }
        }]
    }, {
        property: "SQS",
        endpoint: "http://sqs." + regionEndpoint + ".amazonaws.com",
        version: "2009-02-01",
        children: [{
            method: "addPermission",
            version: "2011-10-01"
        }, {
            method: "changeMessageVisibility",
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName", "ReceiptHandle", "VisibilityTimeout"]
                }
            }
        }, {
            method: "changeMessageVisibilityBatch",
            version: "2011-10-01",
            arrayProps: {
                ChangeMessageVisibilityBatchResultEntry: 1
            },
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName"]
                }
            }
        }, {
            method: "createQueue",
            version: "2011-10-01",
            validations: {
                required: {
                    params: ["QueueName"]
                }
            }
        }, {
            method: "deleteMessage",
            validations: {
                required: {
                    params: ["ReceiptHandle", "AWSAccountId", "QueueName"]
                }
            }
        }, {
            method: "deleteMessageBatch",
            version: "2011-10-01",
            arrayProps: {
                DeleteMessageBatchResultEntry: 1
            },
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName"]
                }
            }
        }, {
            method: "deleteQueue",
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName"]
                }
            }
        }, {
            method: "getQueueAttributes",
            arrayProps: {
                Attribute: 1
            },
            validations: {
                required: {
                    params: ["AWSAccountId",
                        "QueueName"
                    ]
                }
            }
        }, {
            method: "getQueueUrl",
            version: "2011-10-01",
            validations: {
                required: {
                    params: ["QueueName"]
                }
            }
        }, {
            method: "listQueues",
            version: "2011-10-01",
            arrayProps: {
                QueryUrl: 1
            }
        }, {
            method: "receiveMessage",
            arrayProps: {
                Attribute: 1,
                Message: 1
            },
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName"]
                }
            }
        }, {
            method: "removePermission",
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName", "Label"]
                }
            }
        }, {
            method: "sendMessage",
            version: "2011-10-01",
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName", "MessageBody"]
                }
            }
        }, {
            method: "sendMessageBatch",
            version: "2011-10-01",
            arrayProps: {
                SendMessageBatchResultEntry: 1
            },
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName"]
                }
            }
        }, {
            method: "setQueueAttributes",
            validations: {
                required: {
                    params: ["AWSAccountId", "QueueName", "Attribute.Name", "Attribute.Value"]
                }
            }
        }]
    }, {
        property: "SNS",
        endpoint: "http://sns." + regionEndpoint + ".amazonaws.com",
        verb: "POST",
        executor: snsExecutor,
        version: "2010-03-31",
        children: [{
            method: "addPermission",
            validations: {
                required: {
                    params: ["Label", "TopicArn"]
                }
            }
        }, {
            method: "confirmSubscription",
            validations: {
                required: {
                    params: ["Token", "TopicArn"]
                }
            }
        }, {
            method: "createTopic",
            validations: {
                required: {
                    params: ["Name"]
                }
            }
        }, {
            method: "deleteTopic",
            validations: {
                required: {
                    params: ["TopicArn"]
                }
            }
        }, {
            method: "getSubscriptionAttributes",
            arrayProps: {
                entry: 1
            },
            validations: {
                required: {
                    params: ["SubscriptionArn"]
                }
            }
        }, {
            method: "getTopicAttributes",
            arrayProps: {
                entry: 1
            },
            validations: {
                required: {
                    params: ["TopicArn"]
                }
            }
        }, {
            method: "listSubscriptions",
            arrayProps: {
                member: 1
            }
        }, {
            method: "listSubscriptionsByTopic",
            arrayProps: {
                member: 1
            },
            validations: {
                required: {
                    params: ["TopicArn"]
                }
            }
        }, {
            method: "listTopics",
            arrayProps: {
                member: 1
            }
        }, {
            method: "publish",
            validations: {
                required: {
                    params: ["TopicArn", "Message"]
                }
            }
        }, {
            method: "removePermission",
            validations: {
                required: {
                    params: ["Label", "TopicArn"]
                }
            }
        }, {
            method: "setSubscriptionAttributes",
            validations: {
                required: {
                    params: ["AttributeName", "AttributeValue", "SubscriptionArn"]
                }
            }
        }, {
            method: "setTopicAttributes",
            validations: {
                required: {
                    params: ["AttributeName", "AttributeValue", "TopicArn"]
                }
            }
        }, {
            method: "subscribe",
            validations: {
                required: {
                    params: ["TopicArn", "Endpoint",
                        "Protocol"
                    ]
                }
            }
        }, {
            method: "unsubscribe",
            validations: {
                required: {
                    params: ["SubscriptionArn"]
                }
            }
        }, {
            method: "createPlatformEndpoint",
            validations: {
                required: {
                    params: ["PlatformApplicationArn","Token"]
                }
            }
        }, {
            method: "setEndpointAttributes",
            validations: {
                required: {
                    params: ["EndpointArn"]
                }
            }
        }, {
            method: "getEndpointAttributes",
            validations: {
                required: {
                    params: ["EndpointArn"]
                }
            }
        }]
    }, {
        property: "STS",
        endpoint: "https://sts.amazonaws.com",
        verb: "POST",
        version: "2011-06-15",
        host: "sts.amazonaws.com",
        executor: stsExecutor,
        children: [{
            method: "getSessionToken"
        }]
    }, {
        property: "DDB",
        endpoint: "https://dynamodb." + regionEndpoint + ".amazonaws.com/",
        verb: "POST",
        host: "dynamodb." + regionEndpoint + ".amazonaws.com",
        algorithm: "HmacSHA256",
        contentType: "application/x-amz-json-1.0",
        validations: {
            required: {
                params: ["RequestJSON"]
            }
        },
        executor: dynamoDbExecutor,
        children: [{
            method: "listTables"
        }, {
            method: "batchWriteItem"
        }, {
            method: "describeTable"
        }, {
            method: "updateTable"
        }, {
            method: "updateItem"
        }, {
            method: "deleteTable"
        }, {
            method: "getItem"
        }, {
            method: "putItem"
        }, {
            method: "scan"
        }, {
            method: "query"
        }, {
            method: "deleteItem"
        }, {
            method: "batchGetItem"
        }, {
            method: "createTable"
        }]
    }]
});
module.exports = AWS;
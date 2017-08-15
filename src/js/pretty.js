// I took this from Douglas Crockford
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

// I turned it into a module, and made it return the position and line when a parser error occurs.

import options from './options'

/*
    json_parse.js
    2016-05-02

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This file creates a json_parse function.

        json_parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = json_parse(text, function (key, value) {
                var a;
                if (typeof value === "string") {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint for */

/*property
    at, b, call, charAt, f, fromCharCode, hasOwnProperty, message, n, name,
    prototype, push, r, t, text
*/

"use strict";

// This is a function that can parse a JSON text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

var stringified // ongoing string
var gap = 0 // current indent level
var line;   // line number we're up to
var pos;    // position of character
var at;     // The index of the current character
var ch;     // The current character
var escapee = {
    "\"": "\"",
    "\\": "\\",
    "/": "/",
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
};
var text;
var indentSpace;

var indent = function (num) {

    // increase or decrease the indent level

    gap += num
}

var newLine = function () {

    // add a new line to the stringified result

    line += 1
    const beginning = indentSpace.repeat(Math.max(0, gap))
    pos = beginning.length
    stringified += `\n${beginning}`
}

var append = (value, escape) => {

    // append a string to the stringified result; might need to scape chars

    if (!escape) {
        stringified += value
        pos += value.length
        return
    }

    const escapes =  {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "\"": "\\\"",
        "\\": "\\\\"
    }

    const rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    if (!rx_escapable.test(string)) {
        stringified += value;
        pos += value.length
        return
    }

    const replaced = value.replace(rx_escapable, a => {
        var c = escapes[a]
        if (typeof c === 'string') { return c }
        return `0000${a.charCodeAt(0).toString(16)}`.slice(-4)
    })

    stringified += replaced
    pos += replaced.length
}

var error = function (m) {

// Call error when something is wrong.

    throw {
        name: "SyntaxError",
        stringified: stringified + text.substr(at - 1),
        message: m,
        at: at,
        pos: pos,
        line: line,
        text: text
    };
};

var next = function (c) {

// If a c parameter is provided, verify that it matches the current character.

    if (c && c !== ch) {
        pos += 1
        error("Expected '" + c + "' instead of '" + ch + "'");
    }

// Get the next character. When there are no more characters,
// return the empty string.

    ch = text.charAt(at);
    at += 1;
    return ch;
};

var number = function () {

// Parse a number value.

    var value;
    var string = "";

    if (ch === "-") {
        string = "-";
        next("-");
    }
    while (ch >= "0" && ch <= "9") {
        string += ch;
        next();
    }
    if (ch === ".") {
        string += ".";
        while (next() && ch >= "0" && ch <= "9") {
            string += ch;
        }
    }
    if (ch === "e" || ch === "E") {
        string += ch;
        next();
        if (ch === "-" || ch === "+") {
            string += ch;
            next();
        }
        while (ch >= "0" && ch <= "9") {
            string += ch;
            next();
        }
    }
    value = +string;
    if (!isFinite(value)) {
        error("Bad number");
    } else {
        append(value)
        return value;
    }
};

var string = function () {

// Parse a string value.

    var hex;
    var i;
    var value = "";
    var uffff;

// When parsing for string values, we must look for " and \ characters.

    if (ch === "\"") {
        append(ch)
        while (next()) {
            if (ch === "\"") {
                append(value, true)
                append(ch)
                next();
                return value;
            }
            if (ch === "\\") {
                next();
                if (ch === "u") {
                    uffff = 0;
                    for (i = 0; i < 4; i += 1) {
                        hex = parseInt(next(), 16);
                        if (!isFinite(hex)) {
                            break;
                        }
                        uffff = uffff * 16 + hex;
                    }
                    value += String.fromCharCode(uffff);
                } else if (typeof escapee[ch] === "string") {
                    value += escapee[ch];
                } else {
                    break;
                }
            } else {
                value += ch;
            }
        }
    }
    error("Bad string");
};

var white = function () {

// Skip whitespace.

    while (ch && ch <= " ") {
        next();
    }
};

var word = function () {

// true, false, or null.

    switch (ch) {
    case "t":
        next("t");
        next("r");
        next("u");
        next("e");
        append('true');
        return true;
    case "f":
        next("f");
        next("a");
        next("l");
        next("s");
        next("e");
        append('false');
        return false;
    case "n":
        next("n");
        next("u");
        next("l");
        next("l");
        append('null');
        return null;
    }
    error("Unexpected '" + ch + "'");
};

var value;  // Place holder for the value function.

var array = function () {

// Parse an array value.

    var arr = [];

    if (ch === "[") {
        next("[");
        append('[');
        white();
        if (ch === "]") {
            next("]");
            append(']');
            return arr;   // empty array
        }
        indent(1);
        newLine();
        while (ch) {
            arr.push(value());
            white();
            if (ch === "]") {
                next("]");
                indent(-1);
                newLine();
                append(']');
                return arr;
            }
            next(",");
            append(',');
            newLine();
            white();
        }
    }
    error("Bad array");
};

var object = function () {

// Parse an object value.

    var key;
    var obj = {};

    if (ch === "{") {
        next("{");
        append("{");
        white();
        if (ch === "}") {
            next("}");
            append("}");
            return obj;   // empty object
        }
        indent(1);
        newLine();
        while (ch) {
            key = string();
            white();
            next(":");
            append(": ")
            if (Object.hasOwnProperty.call(obj, key)) {
                error("Duplicate key '" + key + "'");
            }
            obj[key] = value();
            white();
            if (ch === "}") {
                next("}");
                indent(-1);
                newLine();
                append("}");
                return obj;
            }
            next(",");
            append(",");
            newLine();
            white();
        }
    }
    error("Bad object");
};

value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

    white();
    switch (ch) {
    case "{":
        return object();
    case "[":
        return array();
    case "\"":
        return string();
    case "-":
        return number();
    default:
        return (ch >= "0" && ch <= "9")
            ? number()
            : word();
    }
};

// Return the json_parse function. It will have access to all of the above
// functions and variables.

export default function (source) {
    text = source;
    stringified = '';
    var indentType = options.tabType === 'tabs' ? '\t' : ' '
    indentSpace = indentType.repeat(options.length)
    gap = 0;
    at = 0;
    line = 0;
    pos = 1;
    ch = " ";
    value();
    white();
    if (ch) {
        error("Syntax error");
    }

    return stringified
}


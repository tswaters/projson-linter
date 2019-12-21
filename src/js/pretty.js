// Originally started from Douglas Crockford's impl
// https://github.com/douglascrockford/JSON-js/blob/9139a9f/json_parse.js

const escapee = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t'
}

const escapes = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"': '\\"',
  '\\': '\\\\'
}

const escape = (value, shouldEscape) => {
  const rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g

  return !shouldEscape || !rx_escapable.test(value)
    ? value
    : value.replace(rx_escapable, a =>
        escapes[a]
          ? escapes[a]
          : `0000${a.charCodeAt(0).toString(16)}`.slice(-4)
      )
}

export class Parser {
  constructor(
    source,
    { indentType = ' ', indentSize = 2, gap = 0, line = 0 } = {}
  ) {
    this.text = source
    this.indentType = indentType
    this.indentSize = indentSize
    this.indentSpace = indentType.repeat(indentSize)
    this.gap = gap
    this.line = line
    this.stringified = ''
    this.at = 0
    this.pos = 1
    this.ch = ' '
    this.value()
    this.white()
    if (this.ch) {
      this.error('Syntax error')
    }
  }

  error(m) {
    throw {
      name: 'SyntaxError',
      stringified: this.stringified + this.text.substr(this.at - 1),
      message: m,
      at: this.at,
      pos: this.pos,
      line: this.line,
      text: this.text
    }
  }

  indent(num) {
    this.gap += num
  }

  newLine() {
    this.line += 1
    const beginning = this.indentSpace.repeat(Math.max(0, this.gap))
    this.pos = beginning.length
    this.stringified += `\n${beginning}`
  }

  // Skip whitespace.
  white() {
    while (this.ch && /[\u0020\t\r\n]/.test(this.ch)) this.next()
  }

  append(value, shouldEscape) {
    const escaped = escape(value, shouldEscape)
    this.stringified += escaped
    this.pos += escaped.length
  }

  // Get the next character. When there are no more characters,
  // return the empty string.
  // If a c parameter is provided, verify that it matches the current character.
  next(c) {
    if (c && c !== this.ch) {
      this.pos += 1
      this.error("Expected '" + c + "' instead of '" + this.ch + "'")
    }

    this.ch = this.text.charAt(this.at)
    this.at += 1
    return this.ch
  }

  // Parse a number value.
  number() {
    let value
    let string = ''

    if (this.ch === '-') {
      string = '-'
      this.next('-')

      // can't have a period after a negative
      if (this.ch === '.') this.error('Bad number')
    }

    const leadingZero = this.ch === '0'
    let seenDelim = false

    while (this.ch >= '0' && this.ch <= '9') {
      string += this.ch
      this.next()
      if (this.ch === '0' && leadingZero) this.error('Bad number')
    }

    if (this.ch === '.') {
      seenDelim = true
      string += '.'
      this.next()

      // exponents cant follow a period.
      if (this.ch === 'e' || this.ch === 'E') this.error('Bad number')

      string += this.ch
      while (this.next() && this.ch >= '0' && this.ch <= '9') string += this.ch
    }

    if (this.ch === 'e' || this.ch === 'E') {
      seenDelim = true
      string += this.ch
      this.next()
      if (this.ch === '-' || this.ch === '+') {
        string += this.ch
        this.next()
      }
      while (this.ch >= '0' && this.ch <= '9') {
        string += this.ch
        this.next()
      }
    }

    // at this point we have a number in `string`
    // look for a few edge cases here,
    // otherwise use type coersion to turn it into a number.
    if (
      (leadingZero && !seenDelim && string !== '0' && string !== '-0') ||
      string.endsWith('.')
    ) {
      this.error('Bad number')
    }

    value = +string

    if (!isFinite(value)) {
      this.error('Bad number')
    } else {
      this.append(value)
      return value
    }
  }

  // Parse a string value.
  // When parsing for string values, we must look for " and \ characters.
  string(keyMode) {
    let value = ''

    if (this.ch === '"') {
      this.append(this.ch)

      while (this.next()) {
        if (this.ch === '"') {
          // end of a string
          // try to parse as JSON
          // if it fails, do the normal thing
          // otherwie append the result of the parse

          try {
            if (keyMode === true) throw new Error('nah')
            const subParser = new Parser(value, this)
            value = subParser.stringified
            this.stringified = this.stringified.slice(0, -1)
            this.append(value)
          } catch (err) {
            this.append(value, true)
            this.append(this.ch)
          }
          this.next()
          return value
        }

        // control characters must be escaped
        if (/[\u0000-\u001F]/.test(this.ch)) this.error('Bad string')

        if (this.ch === '\\') {
          this.next()
          if (this.ch === 'u') {
            let uffff = 0
            for (let i = 0; i < 4; i += 1) {
              let hex = parseInt(this.next(), 16)
              // bad hex is bad, mkay?
              if (!isFinite(hex)) this.error('Bad string')
              uffff = uffff * 16 + hex
            }
            value += String.fromCharCode(uffff)
          } else if (escapee[this.ch]) {
            value += escapee[this.ch]
          } else {
            break
          }
        } else {
          value += this.ch
        }
      }
    }
    this.error('Bad string')
  }

  // true, false, or null.
  word() {
    switch (this.ch) {
      case 't':
        this.next('t')
        this.next('r')
        this.next('u')
        this.next('e')
        this.append('true')
        return true
      case 'f':
        this.next('f')
        this.next('a')
        this.next('l')
        this.next('s')
        this.next('e')
        this.append('false')
        return false
      case 'n':
        this.next('n')
        this.next('u')
        this.next('l')
        this.next('l')
        this.append('null')
        return null
    }
    this.error("Unexpected '" + this.ch + "'")
  }

  // Parse an array value.
  array() {
    const arr = []

    if (this.ch === '[') {
      this.next('[')
      this.append('[')
      this.white()
      if (this.ch === ']') {
        this.next(']')
        this.append(']')
        return arr // empty array
      }
      this.indent(1)
      this.newLine()
      while (this.ch) {
        arr.push(this.value())
        this.white()
        if (this.ch === ']') {
          this.next(']')
          this.indent(-1)
          this.newLine()
          this.append(']')
          return arr
        }
        this.next(',')
        this.append(',')
        this.newLine()
        this.white()
      }
    }
    this.error('Bad array')
  }

  // Parse an object value.
  object() {
    const obj = {}

    if (this.ch === '{') {
      this.next('{')
      this.append('{')
      this.white()
      if (this.ch === '}') {
        this.next('}')
        this.append('}')
        return obj // empty object
      }
      this.indent(1)
      this.newLine()
      while (this.ch) {
        const key = this.string(true)
        this.white()
        this.next(':')
        this.append(': ')
        obj[key] = this.value()
        this.white()
        if (this.ch === '}') {
          this.next('}')
          this.indent(-1)
          this.newLine()
          this.append('}')
          return obj
        }
        this.next(',')
        this.append(',')
        this.newLine()
        this.white()
      }
    }
    this.error('Bad object')
  }

  // Parse a JSON value. It could be an object, an array, a string, a number,
  // or a word.
  value() {
    this.white()
    switch (this.ch) {
      case '{':
        return this.object()
      case '[':
        return this.array()
      case '"':
        return this.string()
      case '-':
        return this.number()
      default:
        return this.ch >= '0' && this.ch <= '9' ? this.number() : this.word()
    }
  }
}

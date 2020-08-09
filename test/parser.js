import { promises as fs } from 'fs'
import path from 'path'
import { Parser } from '../src/js/pretty'

describe('parser', () => {
  let failures = null
  let passes = null

  before(async () => {
    const files = await fs.readdir(path.join(__dirname, 'fixtures'))
    failures = files.filter((x) => x.startsWith('n_'))
    passes = files.filter((x) => x.startsWith('y_'))
  })

  it('has passes for successes', async () => {
    const fails = []
    await Promise.all(
      passes.map(async (file) => {
        let contents = null
        try {
          contents = await fs.readFile(
            path.join(__dirname, 'fixtures', file),
            'utf-8',
          )
          new Parser(contents)
        } catch (err) {
          fails.push({ file, contents, err: err.message })
        }
      }),
    )
    if (fails.length > 0) {
      console.table(fails)
      throw new Error('parsing failed')
    }
  })

  it('has passes for failures', async () => {
    const fails = []
    await Promise.all(
      failures.map(async (file) => {
        let contents = null
        try {
          contents = await fs.readFile(
            path.join(__dirname, 'fixtures', file),
            'utf-8',
          )
          const result = new Parser(contents)
          fails.push({ file, contents, result: result.stringified })
        } catch (err) {
          /* Success! */
        }
      }),
    )
    if (fails.length > 0) {
      console.table(fails)
      throw new Error('parsing failed')
    }
  })
})

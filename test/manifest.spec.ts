/*
* @adonisjs/ace
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import { Manifest } from '../src/Manifest'
import { join } from 'path'
import { Filesystem } from '@adonisjs/dev-utils'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Manifest', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('generated manifest from command paths', async (assert) => {
    await fs.add('Commands/Make.ts', `
    import { args, flags } from '../../../index'

    export default class Greet {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean
    }`)

    const manifest = new Manifest(fs.basePath)
    await manifest.generate(['Commands/Make.ts'])

    const manifestJSON = require(join(fs.basePath, 'ace-manifest.json'))
    assert.deepEqual(manifestJSON, {
      greet: {
        commandPath: 'Commands/Make.ts',
        commandName: 'greet',
        description: 'Greet a user',
        args: [{
          name: 'name',
          type: 'string',
          required: true,
        }],
        flags: [{
          name: 'adult',
          type: 'boolean',
        }],
      },
    })
  })

  test('raise exception when commandPath doesnt exports a command', async (assert) => {
    assert.plan(1)

    await fs.add('Commands/Make.ts', `
    import { args, flags } from '../../../index'

    export class Greet {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean
    }`)

    const manifest = new Manifest(fs.basePath)

    try {
      await manifest.generate(['Commands/Make.ts'])
    } catch ({ message }) {
      assert.equal(message, 'make sure to have a default export from {Commands/Make.ts}')
    }
  })

  test('read manifest file', async (assert) => {
    await fs.add('Commands/Make.ts', `
    import { args, flags } from '../../../index'

    export default class Greet {
      public static commandName = 'greet'
      public static description = 'Greet a user'

      @args.string()
      public name: string

      @flags.boolean()
      public adult: boolean
    }`)

    const manifest = new Manifest(fs.basePath)
    await manifest.generate(['Commands/Make.ts'])

    const manifestJSON = await manifest.load()
    assert.deepEqual(manifestJSON, {
      greet: {
        commandPath: 'Commands/Make.ts',
        commandName: 'greet',
        description: 'Greet a user',
        args: [{
          name: 'name',
          type: 'string',
          required: true,
        }],
        flags: [{
          name: 'adult',
          type: 'boolean',
        }],
      },
    })
  })
})
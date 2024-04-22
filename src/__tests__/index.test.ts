import { it, describe, test, expect } from 'vitest'
import { compile } from 'mdsvex'
import * as vfile from 'to-vfile'
import { plugin } from '..'
import path from 'path'

async function processFixture(name : string) {
    const filePath = path.join(__dirname, '__fixtures__', `${name}.md`);
    const file = await vfile.read(filePath)
    const result = await compile(file.toString(), {
        remarkPlugins: [plugin]
    })

    return result?.code
}

describe('code-tabs plugin', () => {
    it('works on groups', async () => {
        const result = await processFixture('groups')
        console.log(result)
        // return expect(result).toMatchSnapshot()
    })
    it('injects imports when necessary', async () => {
        const result = await processFixture('scripted')
        console.log(result)
        // return expect(result).toMatchSnapshot()
    })
    it("lets you import custom component manually", async () => {
        const result = await processFixture('letmebe')
        console.log(result)
        // return expect(result).toMatchSnapshot()
    })
    it("handles singles ", async () => {
        const result = await processFixture('one')
        console.log(result)
    })
})
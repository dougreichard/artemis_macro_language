const expect = require('chai').expect
let fs = require('fs').promises
let path = require('path')
const { MissionSchemaParser } = require('../lib/mission-schema.js')



describe('Mission Schema', () => {
    describe('Parse', () => {
        it("Does parse as expected", async () => {
            let schema = await MissionSchemaParser.fromFile(path.resolve('test', 'schema', 'mission-file-docs.txt'))

            expect(schema).to.exist
            let json = JSON.stringify(schema.model,null,2)
            await fs.writeFile(path.resolve('test', 'schema', 'mission-file-docs.json'),json, "utf8")
            // let test = await fs.readFile(path.resolve('test', 'schema', 'mission-file-docs.json'), 'utf-8')

        })
    });

})

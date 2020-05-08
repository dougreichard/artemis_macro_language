const { YamlModule } = require('../yaml-module.js')
const { XmlElement } = require('../xml-element.js')
const expect = require('chai').expect
let fs = require('fs').promises
let readdirSync = require('fs').readdirSync
let path = require('path')

function loopTest() {
    // Mocha is shit for async with iteration
    // so I have to use sync version of readir
    let files =  readdirSync(path.resolve(__dirname, 'modular'), { withFileTypes: true })
    for (let file of files) {
        if (file.isDirectory) {
            testModule(path.basename(file.name, ".yaml"))
        }
    }
}



async function testModule(name) {
    it(name, async () => {
        //let yaml = await fs.readFile(path.resolve(__dirname, 'fragments', name + '.yaml'), 'utf-8')
        // let expected = await fs.readFile(path.resolve(__dirname, 'fragments', name + '.xml'), 'utf-8')
        let expanded = await YamlModule.fromFile(path.resolve(__dirname, "modular", name,  name + '-mission.yaml'))
        let xml = await expanded.processAll()
        // expect(xml.begin).to.equal(expected)
    })
}

describe('expand-yaml', () => {
    describe('Fragment tests', () => {
        // allow the debugging of a specific fragment
        if (process.env.fragment) {
            testModule(process.env.fragment)
        } else {
            loopTest()
        }
        
    });

})

const { YamlModule } = require('../yaml-module.js')
const { XmlElement } = require('../xml-element.js')
const expect = require('chai').expect
let fs = require('fs').promises
let readdirSync = require('fs').readdirSync
let path = require('path')

function loopTest() {
    // Mocha is shit for async with iteration
    // so I have to use sync version of readir
    let files =  readdirSync(path.resolve(__dirname, 'fragments', 'yaml'), { withFileTypes: true })
    for (let file of files) {
        if (path.extname(file.name) == '.yaml') {
            testFileFragment(path.basename(file.name, ".yaml"))
        }
    }
}


function getFragmentType(name) {
    let calls = {
        variables: 'addVariables',
        events: 'addEvents',
        event_prototypes: 'testEventPrototypes',
        imports: 'testImports'
    }
    var s = name.split('-')
    return {type:s[0], call: calls[s[0]]}
}

async function testFileFragment(name) {
    it(name, async () => {
        //let yaml = await fs.readFile(path.resolve(__dirname, 'fragments', name + '.yaml'), 'utf-8')
        let expected = await fs.readFile(path.resolve(__dirname, 'fragments', name + '.xml'), 'utf-8')

        let expanded = await YamlModule.fromFile(path.resolve(__dirname, 'fragments', name + '.yaml'))
        let {type, call} = getFragmentType(name)
        expect(expanded.model[type]).to.exist;
        let xml = new XmlElement()
        await expanded[call](xml, expanded.model[type])
        xml.close()
        expect(xml.begin).to.equal(expected)
    })
}

describe('expand-yaml', () => {
    describe('Fragment tests', () => {
        // allow the debugging of a specific fragment
        if (process.env.fragment) {
            testFileFragment(process.env.fragment)
        } else {
            loopTest()
        }
        
    });

})

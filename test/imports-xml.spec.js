const { MissionFile } = require('../lib/mission-file.js')
const expect = require('chai').expect
let fs = require('fs').promises
let readdirSync = require('fs').readdirSync
let path = require('path')
const { MissionParser } = require('../lib/mission-parser.js')

let DEBUG = true


async function expectReadCheck(xml, filename) {
    if (DEBUG) {
        await fs.writeFile(path.resolve('test', 'fragments', 'xml', filename), xml, "utf8")
    } else {
        let content = await fs.readFile(path.resolve('test', 'fragments', 'xml', filename), xml, "utf8")
        return context === xml
    }
} 



function findFirstDiffPos(a, b) {
    var shorterLength = Math.min(a.length, b.length);

    for (var i = 0; i < shorterLength; i++) {
        if (a[i] !== b[i]) return i;
    }

    if (a.length !== b.length) return shorterLength;

    return -1;
}

function loopTest() {
    // Mocha is shit for async with iteration
    // so I have to use sync version of readir
    let files = readdirSync(path.resolve(__dirname, 'fragments'), { withFileTypes: true })
    for (let file of files) {
        if (path.basename(file.endsWith("-fragment"))) {
            let expected = path.basename(file.name.subst(-"-fragment".length)) + "-expected"
            testFileFragment(path.basename(expected, ".xml"))
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
    return { type: s[0], call: calls[s[0]] }
}

async function testFileFragment(name) {
    it(name, async () => {
        //let yaml = await fs.readFile(path.resolve(__dirname, 'fragments', name + '.yaml'), 'utf-8')
        let expected = await fs.readFile(path.resolve(__dirname, 'fragments', name + '.xml'), 'utf-8')

        let expanded = await YamlModule.fromFile(path.resolve(__dirname, 'fragments', name + '.yaml'))
        let { type, call } = getFragmentType(name)
        expect(expanded.model[type]).to.exist;
        let xml = new XmlElement()
        await expanded[call](xml, expanded.model[type])
        xml.close()
        expect(xml.begin).to.equal(expected)
    })
}

describe('Mission File', () => {
    describe('Fragment tests', () => {
        // allow the debugging of a specific fragment
        // if (process.env.fragment) {
        //     testFileFragment(process.env.fragment)
        // } else {
        //     loopTest()
        // }
        it("Test Tree Navigation", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'import-simple-fragment.xml'))
            let mission_data = mission.findFirstElement(mission.model, "mission_data")
            expect(mission_data).to.exist

            let imports = mission.findFirstElement(mission_data, "imports")
            expect(imports).to.exist

            let  {imports:ie, mission_data:md } = mission.findPath(mission.model, ["mission_data", "imports"])
            expect(imports).to.equal(ie)
            expect(mission_data).to.equal(md)

            let removed = mission.removeFirstElement(mission_data, "imports")
            expect(imports).to.equal(removed)

            let gone = mission.findFirstElement(mission_data, "imports")
            expect(gone).to.not.exist

            let xml = mission.toXML()
            let expected = await fs.readFile(path.resolve('test', 'fragments', 'xml', 'import-simple-expected.xml'), 'utf-8')
            expect(xml).to.equal(expected)
        })
        it("Ranges ", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'ranges-simple-fragment.xml'))
            mission.processRanges()
            expect(mission.ranges['Eggs']).to.exist
            expect(mission.ranges['AllShips']).to.exist
            expect(mission.ranges['Eggs'].length).to.equal(5)
            expect(mission.ranges['AllShips'].length).to.equal(8)
            expect(mission.ranges['Eggs'][0].egg).to.equal('egg1')
            expect(mission.ranges['AllShips'][0].ship).to.equal('Artemis')
            expect(mission.ranges['AllShips'][0].sideValue).to.equal('10')


            // let expected = await fs.readFile(path.resolve('test', 'fragments', 'xml', 'import-simple-expected.xml'), 'utf-8')
            //expect(xml).to.equal(expected)
        })
        it("Test simple merge", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'import-simple-fragment.xml'))
            await mission.processImports(mission)
            let xml = mission.toXML()
            await expectReadCheck(xml, 'import-simple-output.xml')
            // await fs.writeFile(path.resolve('test', 'fragments', 'xml', 'import-simple-output.xml'), xml, "utf8")

        })
        it("Test The Arena non-template merge", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'modular', 'xml', 'TheArena-mission.xml'))
            await mission.processImports(mission)
            let xml = mission.toXML()
            // await expectReadCheck(xml, 'repeat-simple-nested-output.xml')
            await fs.writeFile(path.resolve('test', 'modular', 'xml', 'MISS_TheArena.xml'), xml, "utf8")

        })
        it("Test simple repeats", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'repeat-simple-fragment.xml'))
            await mission.processFile()
            let xml = mission.toXML()
            await fs.writeFile(path.resolve('test', 'fragments', 'xml', 'repeat-simple-output.xml'), xml, "utf8")
        })
        it("Test simple nested repeats", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'repeat-simple-nested-fragment.xml'))
            await mission.processFile()
            let xml = mission.toXML()
            await expectReadCheck(xml, 'repeat-simple-nested-output.xml')

        })
        it("Test simple templates", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'expand-simple-fragment.xml'))
            await mission.processFile()
            let xml = mission.toXML()
            await expectReadCheck(xml, 'expand-simple-output.xml')
        })
        it("Test import js", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'script-simple-fragment.xml'))
            await mission.processFile()
            let xml = mission.toXML()
            await expectReadCheck(xml, 'script-simple-output.xml')
        })
       
    });

})

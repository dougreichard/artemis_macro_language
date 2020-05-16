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
        return true
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
    let files = readdirSync(path.resolve(__dirname, 'fragments','xml'), { withFileTypes: true })
    for (let file of files) {
        if (file.name.endsWith("-fragment.xml")) {
            testFileFragment(file.name)
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
        let expected = name.replace("-fragment.xml", "-expected.xml")
        name = path.resolve(__dirname, 'fragments','xml', name)
        let mission = await MissionFile.fromFile(name)
        await mission.processFile()
        mission.dumpAllErrors()
        let xml = mission.toXML()
        await expectReadCheck(xml, expected)
    })
}

describe('Mission File', () => {
    describe('Fragment tests', () => {
        //allow the debugging of a specific fragment
        if (process.env.fragment) {
            testFileFragment(process.env.fragment)
        } else {
            loopTest()
        }
        it("Test Tree Navigation", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'import-simple-fragment.xml'))

            let mission_data = mission.findFirstElement(mission.model, "mission_data")
            expect(mission_data).to.exist

            let imports = mission.findFirstElement(mission_data, "imports")
            expect(imports).to.exist

            let { imports: ie, mission_data: md } = mission.findPath(mission.model, ["mission_data", "imports"])
            expect(imports).to.equal(ie)
            expect(mission_data).to.equal(md)

            let removed = mission.removeFirstElement(mission_data, "imports")
            expect(imports).to.equal(removed)

            let gone = mission.findFirstElement(mission_data, "imports")
            expect(gone).to.not.exist

            let xml = mission.toXML()
            let expected = await expectReadCheck(xml, path.resolve('test', 'fragments', 'xml', 'import-simple-expected.xml'))
            expect(expected).to.equal(true)
        })
        it("Ranges ", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'ranges-simple-fragment.xml'))
            mission.processValues(mission)
            expect(mission.data['Eggs']).to.exist
            expect(mission.data['AllShips']).to.exist
            expect(mission.data['Eggs'].length).to.equal(5)
            expect(mission.data['AllShips'].length).to.equal(8)
            expect(mission.data['Eggs'][0].egg).to.equal('egg1')
            expect(mission.data['AllShips'][0].ship).to.equal('Artemis')
            expect(mission.data['AllShips'][0].sideValue).to.equal('10')
            // let expected = await fs.readFile(path.resolve('test', 'fragments', 'xml', 'import-simple-expected.xml'), 'utf-8')
            //expect(xml).to.equal(expected)
        })
        it("Values", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'values-simple-fragment.xml'))
            await mission.processFile()
            expect(mission.data['CONST_TIMER_SECONDS']).to.exist
            expect(mission.data['CONST_TIMER_SECONDS']).to.equal("30")

            expect(mission.data['mystructure']).to.exist
            expect(mission.data['mystructure']['inner']).to.exist
            expect(mission.data['mystructure']['inner']['XP']).to.exist
            expect(mission.data['mystructure']['inner']['health']).to.exist
            expect(mission.data.mystructure.inner.XP).to.equal("34")
            expect(mission.data.mystructure.inner.health).to.equal("5")

            let xml = mission.toXML()
            await expectReadCheck(xml, 'values-simple-expected.xml')
        })
       
        it("Test The Arena non-template merge", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'modular', 'xml', 'TheArena-mission.xml'))
            await mission.processImports(mission)
            let xml = mission.toXML()
            // await expectReadCheck(xml, 'repeat-simple-nested-expected.xml')
            await fs.writeFile(path.resolve('test', 'modular', 'xml', 'MISS_TheArena.xml'), xml, "utf8")

        })
        // it("Test simple merge", async () => {
        //     let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'import-simple-fragment.xml'))
        //     await mission.processFile()
        //     mission.dumpAllErrors()
        //     let xml = mission.toXML()
        //     await expectReadCheck(xml, 'import-simple-expected.xml')
        //     // await fs.writeFile(path.resolve('test', 'fragments', 'xml', 'import-simple-expected.xml'), xml, "utf8")

        // })
        // it("Test simple repeats", async () => {
        //     let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'repeat-simple-fragment.xml'))
        //     await mission.processFile()
        //     let xml = mission.toXML()
        //     await fs.writeFile(path.resolve('test', 'fragments', 'xml', 'repeat-simple-expected.xml'), xml, "utf8")
        // })
        // it("Test simple nested repeats", async () => {
        //     let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'repeat-simple-nested-fragment.xml'))
        //     await mission.processFile()
        //     let xml = mission.toXML()
        //     await expectReadCheck(xml, 'repeat-simple-nested-expected.xml')

        // })
        // it("Test simple templates", async () => {
        //     let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'expand-simple-fragment.xml'))
        //     await mission.processFile()
        //     let xml = mission.toXML()
        //     await expectReadCheck(xml, 'expand-simple-expected.xml')
        // })
        // it("Test import js", async () => {
        //     let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'script-simple-fragment.xml'))
        //     await mission.processFile()
        //     let xml = mission.toXML()
        //     await expectReadCheck(xml, 'script-simple-expected.xml')
        // })

    });

})

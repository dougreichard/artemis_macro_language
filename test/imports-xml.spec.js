const { MissionFile } = require('../lib/mission-file.js')
const expect = require('chai').expect
let fs = require('fs').promises
let readdirSync = require('fs').readdirSync
let path = require('path')
const { MissionParser } = require('../lib/mission-parser.js')

let DEBUG = true


async function expectReadCheck(xml, basedir, name) {
    if (DEBUG) {
        let debug = path.resolve(basedir, "debug", name)
        await fs.writeFile( debug, xml, "utf8")
    }
    let expected = path.resolve(basedir, "expected", name)
    let content = await fs.readFile(expected, "utf8")
    return content === xml

}



function findFirstDiffPos(a, b) {
    var shorterLength = Math.min(a.length, b.length);

    for (var i = 0; i < shorterLength; i++) {
        if (a[i] !== b[i]) return i;
    }

    if (a.length !== b.length) return shorterLength;

    return -1;
}

function loopTest(basedir, suffix) {
    // Mocha is shit for async with iteration
    // so I have to use sync version of readir
    let files = readdirSync(basedir, { withFileTypes: true })
    for (let file of files) {
        if (file.name.endsWith(suffix)) {
            testFileFragment(basedir, file.name)
        }
    }
}


async function testFileFragment(basedir, name) {
    let full = path.resolve(basedir, name)
    it(name, async () => {
        let mission = await MissionFile.fromFile(full)
        await mission.processFile()
        mission.dumpAllErrors()
        let xml = mission.toXML()
        let isSame = await expectReadCheck(xml, basedir, name)
        expect(isSame).to.be.true
    })
}

describe('Mission File', () => {
    describe('Fragment tests', () => {
        //allow the debugging of a specific fragment
        if (process.env.fragment) {
            let file = path.resolve(__dirname, 'fragments', 'xml', process.env.fragment)
            testFileFragment(file, "-fragment.xml")
        } if (process.env.modular) {
            let file = path.resolve(__dirname, 'modular', 'xml-templated', process.env.modular)
            testFileFragment(file, "-template.xml")
        } else {
           loopTest(path.resolve(__dirname, 'fragments', 'xml'), "-fragment.xml")
           loopTest(path.resolve(__dirname, 'modular', 'xml-templated'),"-template.xml")
           loopTest(path.resolve(__dirname, 'modular', 'cruiser_tournament'),".xml")
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
            // END test testing
           
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
            await expectReadCheck(xml, path.resolve('test', 'fragments', 'xml'), 'values-simple-fragment.xml')
        })

        it("Test The Arena non-template merge", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'modular', 'xml', 'TheArena-mission.xml'))
            await mission.processImports(mission)
            let xml = mission.toXML()
            // await expectReadCheck(xml, 'repeat-simple-nested-expected.xml')
            await fs.writeFile(path.resolve('test', 'modular', 'xml', 'MISS_TheArena.xml'), xml, "utf8")

        })
    });

})

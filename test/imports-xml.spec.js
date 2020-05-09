const { MissionFile } = require('../mission-file.js')
const expect = require('chai').expect
let fs = require('fs').promises
let readdirSync = require('fs').readdirSync
let path = require('path')


function findFirstDiffPos(a, b)
{
   var shorterLength = Math.min(a.length, b.length);

   for (var i = 0; i < shorterLength; i++)
   {
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
            let expected = path.basename(file.name.subst(-"-fragment".length))+"-expected"
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

describe('expand-yaml', () => {
    describe('Fragment tests', () => {
        // allow the debugging of a specific fragment
        // if (process.env.fragment) {
        //     testFileFragment(process.env.fragment)
        // } else {
        //     loopTest()
        // }
        it("Test Tree Navigation", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'import-simple-fragment.xml'))
            let mission_data = mission.findFirstChild(mission.model,"mission_data")
            expect(mission_data).to.exist
            
            let imports = mission.findFirstChild(mission_data,"imports")
            expect(imports).to.exist

            let {element, root} = mission.findPath(mission.model,["mission_data","imports"])
            expect(imports).to.equal(element)
            expect(mission_data).to.equal(root.mission_data)

            let removed  = mission.removeFirstChild(mission_data,"imports")
            expect(imports).to.equal(removed)

            let gone = mission.findFirstChild(mission_data, "imports")
            expect(gone).to.not.exist

            let xml = mission.toXML()
            let expected = await fs.readFile(path.resolve('test', 'fragments', 'xml', 'import-simple-expected.xml'), 'utf-8')
            expect(xml).to.equal(expected)
        })
        it("Test simple merge", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'fragments', 'xml', 'import-simple-fragment.xml'))
            await mission.processImports(mission)
            let xml = mission.toXML()

            await fs.writeFile(path.resolve('test', 'fragments', 'xml', 'import-simple-output.xml'), xml, "utf8")
 
        })
        it("Test The Arena merge", async () => {
            let mission = await MissionFile.fromFile(path.resolve('test', 'modular', 'xml', 'TheArena-mission.xml'))
            await mission.processImports(mission)
            let xml = mission.toXML()

            await fs.writeFile(path.resolve('test', 'modular', 'xml', 'MISS_TheArena.xml'), xml, "utf8")
 
        })
    });

})

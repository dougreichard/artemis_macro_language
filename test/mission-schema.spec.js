const expect = require('chai').expect
let fs = require('fs').promises
let path = require('path')
const { MissionSchemaParser } = require('../lib/mission-schema.js')

let attribValues = {
    systemType: "|systemBeam,systemTorpedo,systemTactical,systemTurning,systemImpulse,systemWarp,systemFrontShield,systemBackShield|",
    pickupType: "|0(anomaly),1(Vigoranium Nodule),2(Cetrocite Crystal),3(Lateral Array),4(Tauron Focusers)5(Infusion P-Coils),6(Carapaction Coils),7(secret code case),8(beacon)|",
    comparator: "|=,!=,<,>,<=,>=,EQUALS,NOT,GREATER,LESS,GREATER_EQUAL,LESS_EQUAL|"
}

describe('Mission Schema', () => {
    describe('Parse', () => {
        it("Does parse as expected", async () => {
            let schema = await MissionSchemaParser.fromFile(path.resolve('test', 'schema', 'mission-file-docs.txt'))

            expect(schema).to.exist
            let json = JSON.stringify(schema.model, null, 2)
            await fs.writeFile(path.resolve('test', 'schema', 'mission-file-docs.json'), json, "utf8")
            // let test = await fs.readFile(path.resolve('test', 'schema', 'mission-file-docs.json'), 'utf-8')

        })
        function getSnippet(key, value, suffix) {
            let attrib = Object.entries(value)
            let body = `<${key} `
            let description
            let prefix = key
            let attribIndex = 1
            let skip = {}
            if(value.player_name && value.player_slot && value.use_gm_selection) {
                skip.player_name = true
                skip.player_slot = true
                skip.use_gm_selection = true
            } else if(value.name && value.player_slot && value.use_gm_selection) {
                skip.name = true
                skip.player_slot = true
                skip.use_gm_selection = true
            } else if(value.name && value.player_slot) {
                skip.name = true
                skip.player_slot = true
            } else if(value.name && value.use_gm_selection) {
                skip.name = true
                skip.use_gm_selection = true
            } else if(value.name1 && value.player_slot1) {
                skip.name1 = true
                skip.player_slot1 = true
            } 
            if(value.name2 && value.player_slot2) {
                skip.name2 = true
                skip.player_slot2 = true
            }
            for (let [attribKey, attribValue] of attrib) {
                if (attribKey === 'description') {
                    description = attribValue
                    continue;
                }
                if (attribKey === "player_name" && skip.player_name && skip.player_slot && skip.use_gm_selection) {
                    body += `\${${attribIndex}|player_name,player_slot,use_gm_selection|} `
                    attribIndex++
                    body += `=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                } else if (attribKey === "name" && skip.name && skip.player_slot && skip.use_gm_selection &&!skip.player_name) {
                    body += `\${${attribIndex}|name,player_slot,use_gm_selection|} `
                    attribIndex++
                    body += `=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                } else if (attribKey === "name" && skip.name && skip.player_slot) {
                    body += `\${${attribIndex}|name,player_slot|} `
                    attribIndex++
                    body += `=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                } else if (attribKey === "name" && skip.name && skip.use_gm_selection ) {
                    body += `\${${attribIndex}|name,use_gm_selection |} `
                    attribIndex++
                    body += `=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                } else if (attribKey === "name1" && skip.name1 && skip.player_slot1) {
                    body += `\${${attribIndex}|name1,player_slot1|} `
                    attribIndex++
                    body += `=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                } else if (attribKey === "name2" && skip.name2 && skip.player_slot2) {
                    body += `\${${attribIndex}|name2,player_slot2|} `
                    attribIndex++
                    body += `=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                } else if (skip[attribKey]) {
                    // skip
                } else if (attribValues[attribKey]) {
                    body += `${attribKey}=\"\${${attribIndex}${attribValues[attribKey]}}\" `
                    attribIndex++
                } else {
                    body += `${attribKey}=\"\${${attribIndex}:${attribKey}}\" `
                    attribIndex++
                }

                
            }
            body += '/>'
            return {
                prefix,
                scope: "xml, miss",
                body,
                description
            }
        }



        it("Not a test. Create snippets", async () => {
            let schema = await MissionSchemaParser.fromFile(path.resolve('test', 'schema', 'mission-file-docs.txt'))
            let starter = await fs.readFile(path.resolve('test', 'schema', 'snippets-starter.json'), 'utf-8')
            let overrides = JSON.parse(starter)

            expect(schema).to.exist
            let snippets = {}
            let cmds = Object.entries(schema.model.commands)
            let con = Object.entries(schema.model.conditions)
            cmds = cmds.concat(con)
            let isGM = false
            for (let [key, value] of cmds) {
                snippets[key] = getSnippet(key, value)
            }
            // Override any from the file with predefined
            Object.assign(snippets, overrides)
            let json = JSON.stringify(snippets, null, 2)
            await fs.writeFile(path.resolve('test', 'schema', 'snippets.json'), json, "utf8")
            // let test = await fs.readFile(path.resolve('test', 'schema', 'mission-file-docs.json'), 'utf-8')

        })
    });

})

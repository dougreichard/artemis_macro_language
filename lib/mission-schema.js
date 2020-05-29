const readline = require('readline');
const fs = require('fs')
const path = require('path')

/** Class for parsing the mission-file-docs.txt
 * to get the set of valid commands
 */
class MissionSchemaParser {
    constructor() {
        this.model = {commands:{}, conditions: {}}
        // This dat is for concise syntax version
        this.last = {}
        this.lastAttribute = undefined
    }
    /** Creates a model from a file */
    static async fromFile(filename) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(__dirname, filename)
        }
        return new Promise((res, rej)=> {
            let parser = new MissionSchemaParser()
            const rl = readline.createInterface({
                input: fs.createReadStream(filename),
                output: process.stdout,
                terminal: false
            });
            
            rl.on('line', (line) => {
                // whitespace | 
                parser.parseLine(line)
            
            });
            rl.on('close', ()=>{
                res(parser)    
            })
            rl.on('error', (err)=>{
                rej(err)    
            })
        })
        
    }
    /** 
     * Parses a line of the concise syntax 
     */
    parseLine(s, line) {
        s =s.trim()
        if (s.startsWith("COMMAND:") ||
        s.startsWith("CONDITION:") || 
        s.startsWith("ATTRIBUTE:") || 
        s.startsWith("VALID:") ){
            let attrib =  s.startsWith("ATTRIBUTE:")
            let valid =  s.startsWith("VALID:")
            let comm =  s.startsWith("COMMAND:")

            let colon = s.search(':')
            s=s.substring(colon+1)
            s =s.trim()
            let end = s.search(/\W/)
            let description =''
            let name = s
            if (end>=0) {
                name = s.substring(0,end)
                description = s.substring(end)
                description = description.trim()
                if (description.startsWith('(')) {
                    description = description.substring(1,description.length-1)
                }

            }

            if (attrib) {
                this.last[name] = {}
                this.lastAttribute = this.last[name]
            } else if (valid) {
                this.lastAttribute.description = s
            } else {
                //this.last.exists = undefined 
                this.last = {description}
                if (comm) {
                    this.model.commands[name] = this.last
                } else {
                    this.model.conditions[name] = this.last
                }
            }
            
        } 
    }
    /** 
     * Handle  an error
     */
    error(s) {
        console.error(s)
    }
}

exports.MissionSchemaParser = MissionSchemaParser



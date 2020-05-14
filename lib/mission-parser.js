const readline = require('readline');
const fs = require('fs').promises
var convert = require('xml-js');
const path = require('path')
require('./typedefs')


/**
 * @typedef IndentionInfo
 * @property {ModelElement} object
 * @property {number} indent
 */

/** Class for parsing files into a common model
 * a hierarchy of @link ModelElement objects
 */
class MissionParser {
    constructor() {
        this.model = {elements:[]}
        // This dat is for concise syntax version
        this.last = this.model
        this.stack = [{object: this.model, indent:-1}]
    }
    /** Creates a model from a file */
    static async fromFile(filename) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(__dirname, filename)
        }
        if (path.extname(filename) === '.xml') {
            return await this.fromXml(filename)
        } else if (path.extname(filename) === '.miss') {
            return await fromMissFile(filename)
        }
    }
     /** Creates a model from an XML file */
    static async fromXml(filename) {
        try {
            let xml = await fs.readFile(filename, 'utf8')
            let result = convert.xml2js(xml, { compact: false, spaces: 4 });
            let ret = new MissionParser()
            ret.model = result
            return ret
        } catch (e) {
            this.error(JSON.stringify(e, null, 2))
        }
    }
    /** Creates a model from a concise syntax file */
    static async fromMissFile(filename) {
        return new Promise((res, rej)=> {
            let parser = MissionParser()

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
     * return the top of the indention stack 
     */
    get top() {
        return this.stack[this.stack.length-1]
    }
    /** 
     * Parses a line of the concise syntax 
     */
    parseLine(s) {
        let indent = this.top
        let spaces = ''
        let id = s.search(/\w+/)
        if (id > 0) {
            spaces = s.substring(0, id)

        } else if (id==-1) {
            // Empty line
            return
        }
        s = s.substring(id);
        let lParen = s.search(/\(/)
        let name = s
        let text 
        let attributes


        if (lParen==-1) {
            let space = s.search(/\s+/)
            if (space>=0) {
                name = s.substring(0,space)
                text = s.substring(space)
            }
            else {
                name = s
            }

        } else if (lParen) {
            name = s.substring(0, lParen);
            let rParen = s.search(/\)/)
            let attribs = s.substring(lParen + 1, rParen)
            text = s.substring(rParen+1)
            attribs = attribs.trim()
            ///////////////////////////////////////////
            /// Attribs could be enough
            let match = attribs.match(/(?<name>\b\w+\b)\s*=\s*(?<value>"[^"]*"|'[^']*'|[^"'<>\s]+)/g)

            if (match != null) {
                let json = '{'
                for (let i = 0, l = match.length; i < l; i++) {
                    let equal = match[i].search("=");
                    let key = match[i].substring(0, equal).trim();
                    let value = match[i].substring(equal + 1)
                    json += `${i ? ',' : ''}"${key}": ${value}`
                }
                json += '}'
                attributes = JSON.parse(json)
                // console.log(JSON.stringify(values, null, 2))
            }
        }
       
        name = name.trim()
        let element = {
            type: "element",
            name,
            attributes,
            elements:[]
        }

        if (text) {
            text = text.trim()
            element.elements = [{
                type: "text",
                text
            }]
        }
        

        let newIndent = spaces.length
        if (newIndent == indent.indent) {
            indent.object.elements.push(element)
        } else if (newIndent > indent.indent) {
            this.stack.push({object: this.last, indent: newIndent})
            this.top.object.elements.push(element)
        } else { 
            this.stack.pop()
            while(newIndent < this.top.indent) {
                this.stack.pop()
            }
            if (this.top.indent != newIndent) {
                this.error("Indention mismatch line:")
            }  else {
                this.top.object.elements.push(element)
            }
        }
        this.last = element
        
    }
    /** 
     * Handle  an error
     */
    error(s) {
        console.error(s)
    }
    /**
     * Creates a string representation of concise syntax from a model element
     * this recursive
     * @param {ModelElement} element 
     * @param {} indent 
     * @returns {string}
     */
    expandMissElement(element, indent) {
        let tag = element.name
        let attr = element.attributes
        
        let attrString=''
        let text=''
        let children=''
        if (attr) {
            let kv = Object.entries(attr)
            if (kv.length) {
                attrString = '('
                for (let [key, value] of kv) {
                    attrString += `${key}="${value}" `
                }
                // remove trailing space
                attrString=attrString.trimRight()+')'
            }
        }
        if(element.elements && element.elements[0]&& element.elements[0].type==='text') {
            text = ' '+element.elements[0].text
        } else if (element.elements && element.elements.length) {
            children = ''
            for(let i=0,l=element.elements.length;i<l;i++) {
                children+= '\r\n'+ this.expandMissElement(element.elements[i], indent+1)
            }
            children+= '\r\n'
        }
        let start = ' '.padStart(indent*4,' ')
        let ret = `${start}${tag}${attrString}${text}${children}`
        return ret
    
    }
    /**
     * returns a string of the file in concise syntax format 
     * @returns {string}
     */
    toMiss() {
        return this.expandMissElement(this.model.elements[0], 0).trim()

    }

}

exports.MissionParser = MissionParser



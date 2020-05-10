var fs = require('fs').promises,
    convert = require('xml-js'),
    path = require('path')

const {MissionParser} = require('./mission-parser.js')

class MissionFile {
    constructor(model, filename) {
        this.model = model
        this.filename = filename
    }
    get basedir() {
        return path.dirname(this.filename)
    }
    toXML() {
        let xml = convert.js2xml(this.model, { compact: false, spaces: 4 });
        return xml.replace(/\n/g, '\r\n')
    }


   


    static async fromFile(filename) {

        try{
            let result = await MissionParser.fromFile(filename)
            return new MissionFile(result.model, filename)
        } catch (e) {

        }
    }

    findFirstChild(parent, tag) {
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                return element
            }
        }
    }
    findChildren(parent, tag) {
        let ret = []
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                ret.push(element)
            } else if (element.type == 'element' && !tag) {
                ret.push(element)
            }
        }
        return ret
    }
    removeChildren(parent, tag) {
        let ret = []
        let filtered = []
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                ret.push(element)
            } else if (element.type == 'element' && !tag) {
                ret.push(element)
            } else {
                filtered.push(element)
            }
        }
        parent.elements = filtered
        return ret

    }
    removeFirstChild(parent, tag) {
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                return parent.elements.splice(i)[0]
            }
        }
    }
    findPath(parent, tags) {
        let element = { parent }
        let root = element
        for (let i = 0, l = tags.length; i < l; i++) {
            parent = this.findFirstChild(parent, tags[i])
            if (!parent) return { element: parent, root }
            element[tags[i]] = parent
            element = element[tags[i]]
        }
        return { element, root }
    }

    mergeStart(main) {
        let { element: main_start, root: main_root } = this.findPath(main.model, ["mission_data", "start"])
        let { element: start } = this.findPath(this.model, ["mission_data", "start"])
        // if there is nothing to merge 
        if (!start) return;

        if (!main_start) {
            if (!main_root.mission_data) {
                // Bad files
            }
            main_root.mission_data.elements.unshift(start)
            return
        }
        // Add Elements to main.start
        main_start.elements = main_start.elements.concat(start.elements)
    }

    mergeEvents(main) {
        let main_mission_data = this.findFirstChild(main.model, "mission_data")
        if (!main_mission_data) return

        let this_mission_data = this.findFirstChild(this.model, "mission_data")
        if (!this_mission_data) return

        let merge = this.findChildren(this_mission_data, "event")
        // if there is nothing to merge 
        if (!merge || !merge.length) return;
        // Add Elements to main.start
        main_mission_data.elements = main_mission_data.elements.concat(merge)
    }

    async processImports(main) {
        let mission_data = this.findFirstChild(this.model, "mission_data")
        if (!mission_data) return
        let imports = this.removeFirstChild(mission_data, "imports")
        if (!imports) return
        let importEles = this.findChildren(imports, "import")
        for (let i = 0, l = importEles.length; i < l; i++) {
            let ele = importEles[i]
            let name = ele.attributes.name
            if (!name) {

            }
            let mission = await MissionFile.fromFile(path.resolve(this.basedir, name))
            if (mission) {
                // Expand templates

                // Merge / Start
                mission.mergeStart(main)
                // Merge  events
                mission.mergeEvents(main)
            }
        }
    }
}

exports.MissionFile = MissionFile
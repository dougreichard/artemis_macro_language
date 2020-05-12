var fs = require('fs').promises,
    convert = require('xml-js'),
    path = require('path')

const { MissionParser } = require('./mission-parser.js')
const { interpolate } = require('./template-string')


/** Class representing mission file data */
class MissionFile {
    constructor(model, filename) {
        this.model = model
        this.filename = filename
        this.ranges = {}
    }
    get basedir() {
        return path.dirname(this.filename)
    }
    /**
   * Convert to a string of XML
   * @return {string} The XML as a string
   */
    toXML() {
        let xml = convert.js2xml(this.model, { compact: false, spaces: 4 });
        return xml.replace(/\n/g, '\r\n')
    }

    /**
   * Opens a file and builds the data model.
   * XML and mission file build a common model
   * @param {string} filename - The filename
   * @return {MissionFIle} The Mission File object.
   */
    static async fromFile(filename) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(__dirname, filename)
        }
        if (path.extname(filename) === '.xml') {
            return await this.fromXml(filename)
        }
    }
    /**
       * Opens an XML file and builds the data model.
       * @param {string} filename - The filename
       * @return {MissionFile} The Mission File object.
       */
    static async fromXml(filename) {
        try {
            let xml = await fs.readFile(filename, 'utf8')
            let result = convert.xml2js(xml, { compact: false, spaces: 4 });
            return new MissionFile(result, filename)
        } catch (e) {

        }
    }
    /**
       * returns the first element of a specified tag
       * XML and mission file build a common model
       * @param {string} filename - The string containing two comma-separated numbers.
       * @return {object} The Mission File object.
       */
    findFirstElement(parent, tag) {
        let { element } = this.findFirstChild(parent, tag)
        return element
    }
    /**
     * Finds the first child element to match a tag
     * @param {object} parent The element to search
     * @param {string} tag The tag to find
     * @returns {{element: object, index: number}} The element object|undefined and its index|-1
     */
    findFirstChild(parent, tag) {
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                return { element, index: i }
            }
        }
        return { element: undefined, index: -1 }
    }
    /**
   * Finds all child elements that match a tag
   * @param {object} parent The element to search
   * @param {string} tag The tag to find
   * @returns {array} The element objects matching tag
   */
    findElements(parent, tag) {
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
    /**
   * Finds all child elements that match a tag
   * @param {object} parent The element to search
   * @param {string} tag The tag to find
   * @returns {array} The element objects matching tag
   */
    findChildren(parent, tag) {
        let ret = []
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                ret.push({ element, index: i })
            } else if (element.type == 'element' && !tag) {
                ret.push({ element, i: index })
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
    removeFirstElement(parent, tag) {
        let { element } = this.removeFirstChild(parent, tag)
        return element
    }
    removeFirstChild(parent, tag) {
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                return { element: parent.elements.splice(i, 1)[0], index: i }
            }
        }
        return { element: undefined, index: -1 }
    }
    findPath(parent, tags) {
        let element = { root: parent }
        let root = element
        for (let i = 0, l = tags.length; i < l; i++) {
            parent = this.findFirstElement(parent, tags[i])
            if (!parent) return element
            element[tags[i]] = parent
            // element = element[tags[i]]
        }
        return element
    }

    mergeStart(main) {
        let { start: main_start, mission_data: main_root } = this.findPath(main.model, ["mission_data", "start"])
        let { start } = this.findPath(this.model, ["mission_data", "start"])
        // if there is nothing to merge 
        if (!start) return;

        if (!main_start) {
            if (!main_root) {
                // Bad files
            }
            main_root.elements.unshift(start)
            return
        }
        // Add Elements to main.start
        main_start.elements = main_start.elements.concat(start.elements)
    }
    mergeEvents(main) {
        let main_mission_data = this.findFirstElement(main.model, "mission_data")
        if (!main_mission_data) return

        let this_mission_data = this.findFirstElement(this.model, "mission_data")
        if (!this_mission_data) return

        let merge = this.findElements(this_mission_data, "event")
        // if there is nothing to merge 
        if (!merge || !merge.length) return;
        // Add Elements to main.start
        main_mission_data.elements = main_mission_data.elements.concat(merge)
    }

    // Ranges must be defined 
    processRanges() {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let rangesTag = this.removeFirstElement(mission_data, "ranges")
        if (!rangesTag) return
        let ranges = this.findElements(rangesTag, "range")
        for (let r = 0, rl = ranges.length; r < rl; r++) {
            let ele = ranges[r]
            let name = ele.attributes.name
            this.ranges[name] = []
            let items = this.findElements(ranges[r], "item")
            for (let i = 0, l = items.length; i < l; i++) {
                this.ranges[name].push(items[i].attributes)
            }
        }
    }
    processTemplates() {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let rangesTag = this.removeFirstElement(mission_data, "templates")
        if (!rangesTag) return
        let ranges = this.findElements(rangesTag, "template")
        for (let r = 0, rl = ranges.length; r < rl; r++) {
            let ele = ranges[r]
            let name = ele.attributes.name
            this.ranges[name] = []
            let items = this.findElements(ranges[r], "item")
            for (let i = 0, l = items.length; i < l; i++) {
                this.ranges[name].push(items[i].attributes)
            }
        }
    }
    deepInterpolate(elements, values) {
        let clones = []
        for (let i = 0, l = elements.length; i < l; i++) {
            // Interpolate the keys, the values, and any text elements
            let element = elements[i]
            let clone = {
                type: element.type,
            }
            if (element.type == "text") {
                clone.text = interpolate(element.text, values)
            } else {
                clone.name = element.name
            }

            if (element.attributes) {
                clone.attributes = {}
                // I believe the keys can't be templated
                let attribs = Object.entries(element.attributes)
                for (let [key, value] of attribs) {
                    clone.attributes[key] = interpolate(value, values)
                }
            }
            if (element.elements) {
                clone.elements = this.deepInterpolate(element.elements, values)
            }
            clones.push(clone)
        }
        return clones
    }

    // Remove repeats adding expanded version to parent
    // inserting all new elements at the same place 
    processRepeats(parent) {
        if (!parent) return
        let repeats = this.findChildren(parent, "repeat")
        if (!repeats) return
        for (let r = repeats.length - 1; r >= 0; r--) {
            let element = repeats[r].element
            let rangeName = element.attributes.range
            if (!rangeName) {
                this.error(`Range not defined for repeat`)
                continue
            }

            let range = this.ranges[rangeName]
            if (!range) {
                this.error(`Range not found ${rangeName}`)
            }
            // Accumulate all the elements
            let replaceWith = []
            let childElements = repeats[r].element.elements
            for (let i = 0, l = range.length; i < l; i++) {
                let expanded = this.deepInterpolate(childElements, range[i])
                replaceWith = replaceWith.concat(expanded)
            }
            parent.elements.splice(repeats[r].index, 1, ...replaceWith)
        }
    }

    // currently this is one level of repeat
    processAllRepeats() {
        // Process them at the top level
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        this.processRepeats(mission_data)

        // Process them in start
        // process them in every event
    }

    async processImports(main) {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let imports = this.removeFirstElement(mission_data, "imports")
        if (!imports) return
        let importEles = this.findElements(imports, "import")
        for (let i = 0, l = importEles.length; i < l; i++) {
            let ele = importEles[i]
            let name = ele.attributes.name
            if (!name) {

            }
            let mission = await MissionFile.fromFile(path.resolve(this.basedir, name))
            if (mission) {
                // Expand templates
                //mission.processFile()

                // Merge / Start
                mission.mergeStart(main)
                // Merge  events
                mission.mergeEvents(main)
            }
        }
    }


    async processFile() {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        this.processImports(this.model)
        this.processRanges()
        this.processAllRepeats()
    }
}

exports.MissionFile = MissionFile
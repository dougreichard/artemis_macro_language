var fs = require('fs').promises,
    convert = require('xml-js'),
    path = require('path')

const { MissionParser } = require('./mission-parser.js')
const { interpolate } = require('./template-string')
// For jsdoc
require('./typedefs')

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
     * Dump an error message
     */
    error(e) {
        console.error(e)
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
   * @return {MissionFile} The Mission File object.
   */
    static async fromFile(filename) {
        try {
            let result = await MissionParser.fromFile(filename)
            return new MissionFile(result.model, filename)
        } catch (e) {

        }
    }
    /**
       * returns the first element of a specified tag
       * XML and mission file build a common model
       * @param {string} filename - The string containing two comma-separated numbers.
       * @return {ModelElement} The Mission File object.
       */
    findFirstElement(parent, tag) {
        let { element } = this.findFirstChild(parent, tag)
        return element
    }
    /**
     * The element and it's index when found
     * @typedef FoundChild
     * @property {ModelElement} element The found element or undefined
     * @property {number} index The index within the parent.elements for the element
     */
    /**
     * Finds the first child element to match a tag
     * @param {object} parent The element to search
     * @param {string} tag The tag to find
     * @returns {FoundChild} The element object|undefined and its index|-1
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
   * @param {ModelElement} parent The element to search
   * @param {string} tag The tag to find
   * @returns {ModelElement[]} The element objects matching tag
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
   * @param {ModelElement} parent The element to search
   * @param {string} tag The tag to find
   * @returns {FoundChild[]} The element objects matching tag
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
    /**
  * Finds all child elements that match a tag and removes them
  * @param {ModelElement} parent The element to search
  * @param {string} tag The tag to find
  * @returns {FoundChild[]} The element objects matching tag
  */
    removeChildren(parent, tag) {
        let ret = []
        let filtered = []
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                ret.push({ element, index: i })
            } else if (element.type == 'element' && !tag) {
                ret.push(element)
            } else {
                filtered.push(element)
            }
        }
        parent.elements = filtered
        return ret
    }
    /**
  * Finds the first child element that matches a tag and removes it
  * @param {ModelElement} parent The element to search
  * @param {string} tag The tag to find
  * @returns {ModelElement} The element objects matching tag
  */
    removeFirstElement(parent, tag) {
        let { element } = this.removeFirstChild(parent, tag)
        return element
    }
    /**
     * Finds the first child element that matches a tag and removes it
     * @param {ModelElement} parent The element to search
     * @param {string} tag The tag to find
     * @returns {FoundChild[]} The element objects matching tag
     */
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
    /**
     * Merges this document's start element into a main file
     * @param {ModelElement} main The root element of the Main file 
     */
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
    /**
    * Merges this document's event elements into a main file
    * @param {ModelElement} main The root element of Main file 
    */
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

    /**
    * Finds all ranges in the file, expands them to values, then remove the elements
    */
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
    /**
    * Finds all templates in the file, caches them, then remove the elements
    */
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
    /**
     * Uses the values to expand template string. This is recursive to all child elements
     * @param {ModelElement} elements The elements to process
     * @param {object} values The values to use
     */
    deepInterpolate(element, values, as, index) {
        let clone = {
            type: element.type,
        }
        if (element.type == "text") {
            clone.text = interpolate(element.text, values)
        } else {
            clone.name = element.name
        }
        if (element.name == 'repeat') {
            return
        }
        if (element.attributes) {
            clone.attributes = {}
            // I believe the keys can't be templated
            let attribs = Object.entries(element.attributes)
            for (let [key, value] of attribs) {
                try {
                    clone.attributes[key] = interpolate(value, values)
                }
                catch (e) {
                    this.error(e.message)
                }
            }
        }
        if (element.elements) {
            let clones = []
            for (let i = 0, l = element.elements.length; i < l; i++) {
                // Interpolate the keys, the values, and any text elements
                let child = element.elements[i]
                let clone = this.deepInterpolate(child, values)
                if (clone) {
                    clones.push(clone)
                }
            }
            clone.elements = clones
        }
        return clone
    }
    /**
     * Remove repeats adding expanded version to parent
     * inserting all new elements at the same place 
     * @param {ModelElement} parent 
     */
    processRepeats(parent) {
        if (!parent) return
        let repeats = this.findChildren(parent, "repeat")
        if (!repeats) return
        if (repeats.length == 0) return

        
        let hasNested = false
        for (let r = repeats.length - 1; r >= 0; r--) {
            let element = repeats[r].element
            let rangeName = element.attributes.range
            if (!rangeName) {
                this.error(`Range not defined for repeat`)
                continue
            }

            let outerScope = {}
            // Copy the attributes of the repeat to scope
            Object.assign(outerScope, element.attributes)
            // As is used to attach to sub repeats
            // the current values as an object
            let rangeAs = rangeName
            if (element.attributes.as) {
                rangeAs = element.attributes.as
            }
            if (element.__scope) {
                Object.assign(outerScope, element.__scope)
            }
            let range = this.ranges[rangeName]
            if (!range) {
                this.error(`Range not found ${rangeName}`)
            }
            // Accumulate all the elements
            let childElements = repeats[r].element.elements
            let replaceWith = []
            for (let i = 0, l = range.length; i < l; i++) {
                let values = range[i]
                let scope = {}
                // Clone outerscope
                scope = Object.assign(scope, outerScope)
                scope[rangeAs] = values

                if (rangeAs) {
                    values[rangeAs] = values
                }
                values = Object.assign(values, outerScope)
                //////////////////////////////////////////////////////
                /// Clone and expand all the content
                for (let c = 0, cl = childElements.length; c < cl; c++) {
                    if (childElements[c].name != "repeat") {
                        let clone = this.deepInterpolate(childElements[c], values)
                        if (clone) {
                            replaceWith.push(clone)
                        }
                    } else {
                        //////////////////////////////////////
                        // For repeats we shallow clone them
                        // Attach Current scope to it
                        // and do another pss to expand them
                        hasNested = true
                        // Shallow copy
                        let clone = { }
                        Object.assign(clone, childElements[c])
                        // Add scope dat to repeats
                        clone.__scope = {}
                        Object.assign(clone.__scope, values)
                        replaceWith.push(clone)
                    }
                }
            }
            ///////////////////////////////////////////////
            // Replace the repeat with the expanded content
            parent.elements.splice(repeats[r].index, 1, ...replaceWith)
        }
        // if true We had repeats so we need another pass
        return hasNested

    }
    /**
     * Process the repeats at each level until no more exist
     * This will handle nested repeats
     * It expands all in the Mission data
     * then all in the start tag
     * the all in all events
     */
    processAllRepeats() {
        // Process them at the top level
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        this.processAllRepeatsFor(mission_data)
        // Process them in start
        let start = this.findFirstElement(mission_data, "start")
        if (start) {
            this.processAllRepeatsFor(start)
        }
        // process them in every event
        let events = this.findElements(mission_data, "event")
        if (events.length) {
            for (let i = 0, l = events.length; i < l; i++) {
                this.processAllRepeatsFor(events[i])
            }
        }
    }
    /**
     * Will process all repeats within a given element
     * @param {ModelElement} parent the parent
     */
    processAllRepeatsFor(parent) {
        if (!parent) return
        let repeatsExist = true
        while (repeatsExist) {
            repeatsExist = this.processRepeats(parent)
        }

    }
    /**
     * Merges elements for imported file. This is recursive
     * Assures given file is only imported once
     * @param {ModelElement} main The root element of the main doc
     */
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
    /**
     * Process the imports,ranges,repeats, templates and expands of a main document
     */
    async processFile() {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        this.processImports(this.model)
        this.processRanges()
        this.processAllRepeats()
    }
}

exports.MissionFile = MissionFile
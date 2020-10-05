var fs = require('fs').promises,
    convert = require('xml-js'),
    path = require('path')

const { MissionParser } = require('./mission-parser.js')
const { interpolate } = require('./template-string')
// For jsdoc
require('./typedefs')

const START_LOG_DATA = "<<<START_AML_DATA>>>"
const END_LOG_DATA = "<<<END_AML_DATA>>>"

class Utils {
    constructor(data) {
        this.data = data
    }
    lookup(s) {
        return this.data[s]
    }
    int(s) {
        return parseInt(s)
    }
    integer(s) {
        return parseInt(s)
    }
    float(s) {
        return parseFloat(s)
    }
    length(s) {
        let range = this.data[s]
        if (range && range.length) {
            return range.length
        }
    }
    get map() {
        return {
            z: (x) => {
                let keys = {
                    a: 0,
                    b: 1,
                    c: 2,
                    d: 3,
                    e: 4
                }
                x = x.trim().toLowerCase()
                let n = keys[x.substring(0, 1)]
                let fract = Number(x.substring(1))
                return (n + fract) * 20000
            }, y: (y) => {
                if (y.constructor === String) {
                    y = Number(y)
                }
                return y * 20000
            }, x: (x) => {
                if (x.constructor === String) {
                    x = Number(x)
                }
                return 120000 - x * 20000
            }
        }
    }
}

/** Class representing mission file data */
class MissionFile {
    constructor(init, filename) {
        this.filename = filename
        this.model = init.model

        this.data = {}
        this.addPlugins()

        // this.allErrors = {}
        if (init.errors) {
            this.error(init.errors)
        }
        //this.ranges = {}

        this.templates = {}
        this.plugins = {}
    }
    /**
     * Adds the global plugins to the system
     */
    addPlugins() {
        let utils = new Utils(this.data)
        this.data.utils = utils
        // this.data.map = utils.map
        // this.data.int = utils.int
        // this.data.float = utils.float
        // this.data.integer = utils.int
        this.data._ = utils
    }

    get basedir() {
        return path.dirname(this.filename)
    }
    /**
     * Add error message
     */
    error(e) {
        // if (!this.allErrors[this.filename]) {
        //     this.allErrors[this.filename] = []
        // }
        console.error(`ERROR: ${e.message} ${this.filename}`)
        //this.allErrors[this.filename].push(e)
    }
    /**
     * Add info message
     */
    info(e) {
        //  console.log(`INFO: ${e.message}`)
    }
    /**
    * Add all errors (to a main)
    */
    addErrors(mission) {
        //Object.assign(this.allErrors, mission.allErrors)
    }
    /**
     * Has erros
     */
    hasErrors() {
        if (!this.allErrors) return;
        return Object.entries(this.allErrors).length
    }
    /**
    * Dump all the error messages
    */
    dumpAllErrors() {
        if (!this.allErrors) return;
        for (let [key, value] of Object.entries(this.allErrors)) {
            console.error(`Errors from file: ${key}`)
            for (let j = 0, jl = value.length; j < jl; j++) {
                console.error(value[j].message)
            }
        }
    }
    /**
   * Convert to a string of XML
   * @return {string} The XML as a string
   */
    toXML() {
        if (!this.model) return
        let xml = convert.js2xml(this.model, { compact: false, ignoreComment: true, spaces: 2 })

        // remove those annoying empty attributes
        xml = xml.replace(/\s\w+=\"\"/gi, "");
        xml = xml.replace(/\n\s+\n/gi, "\n");
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
            return new MissionFile(result, filename)
        } catch (e) {

        }
    }
    /**
     *  Adds a plugin from javascript
     * @param {string} filename The javascript file
     */
    async fromScript(filename) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(this.basedir, filename)
        }
        let script = require(filename)
        if (script) {
            // Enable an asynchronous initialize
            if (script.init) {
                let data = await script.init(this.basedir)
                Object.assign(this.plugins, script)
            } else {
                Object.assign(this.plugins, script)
            }
        }
        return
    }
    /**
   * Opens a Json file and it to data
   * @param {string} filename - The filename
   * 
   */
    async fromJson(filename, name) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(this.basedir, filename)
        }
        try {
            let data = await fs.readFile(filename, 'utf8')
            let v = JSON.parse(data)
            if (name) {
                Object.assign(this.data[name], v)
            } else {
                Object.assign(this.data, v)
            }
        } catch (e) {
            this.error(e)
        }

    }
    /**
   * Opens a log file Json file and it to data
   * @param {string} filename - The filename
   * 
   */
    async fromLogToJson(filename, name) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(this.basedir, filename)
        }
        try {
            let json = await this.getLogData(filename, name)
            if (!json) return
            let v = JSON.parse(json)
            if (name) {
                Object.assign(this.data[name], v)
            }
            else {
                Object.assign(this.data, v)
            }
        } catch (e) {
            this.error(e)
        }
    }
    async getLogData(filename) {
        let log = await fs.readFile(filename, 'utf8')
        let start = log.search(START_LOG_DATA + '\r\n')
        let end = log.search(END_LOG_DATA)
        if (start >= 0 && end > start) {
            return log.substring(start + START_LOG_DATA.length + 2, end - 2)
        }
    }

    /**
   * Opens a log file Json file and it to data
   * @param {string} filename - The filename
   * 
   */
    async fromLogToXml(filename) {
        if (!path.isAbsolute(filename)) {
            filename = path.resolve(this.basedir, filename)
        }
        try {
            let xml = await this.getLogData(filename)
            let result = await MissionParser.fromXmlString(xml)
            return new MissionFile(result, filename)
        } catch (e) {
            this.error(e)
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
        if (parent.elements) {
            for (let i = 0, l = parent.elements.length; i < l; i++) {
                let element = parent.elements[i]
                if (element.type == 'element' && element.name === tag) {
                    return { element, index: i }
                }
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
        if (!parent.elements) {
            return ret
        }
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
    * @param {string} check_template True if should check tag is a template name
    * @returns {FoundChild[]} The element objects matching tag
    */
    findChildren(parent, tag, check_template) {
        let ret = []
        if (!parent.elements) {
            return ret
        }
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                ret.push({ element, index: i })
            } else if (element.type == 'element' && check_template && tag) {
                if (this.templates && this.templates[element.name]) {
                    if (!element.attributes) {
                        element.attributes = {}
                    }
                    element.attributes._template = element.name
                    element.name = "expand"
                    ret.push({ element, index: i })
                }

            }
            else if (element.type == 'element' && !tag) {
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
        if (!parent.elements) {
            return ret
        }
        for (let i = 0, l = parent.elements.length; i < l; i++) {
            let element = parent.elements[i]
            if (element.type == 'element' && element.name === tag) {
                ret.push({ element, index: i })
            } else if (element.type == 'element' && !tag) {
                ret.push({ element, index: i })
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
        if (parent.elements) {
            for (let i = 0, l = parent.elements.length; i < l; i++) {
                let element = parent.elements[i]
                if (element.type == 'element' && element.name === tag) {
                    return { element: parent.elements.splice(i, 1)[0], index: i }
                }
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
        if (!this.model) {
            return
        }
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
     * Merges this document's start element into a main file
     * @param {ModelElement} main The root element of the Main file 
     */
    makeSingleStart() {
        if (!this.model) {
            return
        }

        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let allStarts = this.removeChildren(mission_data, "start")

        if (allStarts.length == 1) {
            mission_data.elements.unshift(allStarts[0].element)
        } else if (allStarts.length > 1) {
            let start = { type: "element", name: "start", elements: [] }
            for (let i = 0, l = allStarts.length; i < l; i++) {
                start.elements = start.elements.concat(allStarts[i].element.elements)
            }
            mission_data.elements.unshift(start)
        }
        // Put mission description to top
        let desc = this.removeFirstChild(mission_data, "mission_description")
        if (desc.element) {
            mission_data.elements.unshift(desc.element)
        }
    }
    /**
    * Removes event that have no elements
    * 
    */
    removeEmptyEvents() {
        if (!this.model) {
            return
        }

        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let events = this.findChildren(mission_data, "event")

        for (let i = events.length - 1; i >= 0; i--) {
            if (events[i].element && (!events[i].element.elements || events[i].element.elements.length == 0)) {
                mission_data.elements.splice(events[i].index, 1)
            }
        }
    }
    /**
    * Merges this document's event elements into a main file
    * @param {ModelElement} main The root element of Main file 
    */
    mergeEvents(main) {
        if (!this.model) {
            return
        }
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
    * Finds all values in the file, expands them to values, then remove the elements
    */
    processValues(main) {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let values = this.removeFirstElement(mission_data, "values")
        if (!values) return
        this.processRanges(values, this.data)
        this.processStructs(values, this.data)
        this.processValueTags(values, this.data)
    }
    /**
    * Finds all structures  in the file, expands them to values, then remove the elements
    */
    processStructs(parent, addTo) {
        let structs = this.findElements(parent, "struct")
        for (let r = 0, rl = structs.length; r < rl; r++) {
            let ele = structs[r]
            let name = ele.attributes.name
            addTo[name] = {}
            this.processValueTags(structs[r], addTo[name])
            this.processStructs(structs[r], addTo[name])
            this.processRanges(structs[r], addTo)
        }
    }
    /**
    * Finds all value tags in the file, expands them to values, then remove the elements
    */
    processValueTags(parent, addTo) {
        let items = this.findElements(parent, "value")
        for (let i = 0, l = items.length; i < l; i++) {
            Object.assign(addTo, items[i].attributes)
        }
    }
    /**
    * Finds all ranges in the file, expands them to values, then remove the elements
    */
    processRanges(values, addTo) {
        let ranges = this.findElements(values, "range")
        for (let r = 0, rl = ranges.length; r < rl; r++) {
            let ele = ranges[r]
            let name = ele.attributes.name
            addTo[name] = []
            if (ele.elements && ele.elements.length) {
                let structs = this.findElements(ele, "struct")
                for (let i = 0, l = structs.length; i < l; i++) {
                    let item = {}
                    let ele = structs[i]
                    this.processValueTags(ele, item)
                    this.processStructs(ele, item)
                    this.processRanges(ele, item)
                    addTo[name].push(item)
                }
                let items = this.findElements(ele, "value")
                for (let i = 0, l = items.length; i < l; i++) {
                    addTo[name].push(items[i].attributes)
                }
            }
        }
    }
    /**
    * Grabs all the templates
    */
    async processTemplateParameters(template, scope) {
        let paramsTag = this.findFirstElement(template, "params")
        if (!paramsTag) return
        let params = this.findElements(paramsTag, "param")
        let valid = true
        for (let p = 0, l = params.length; p < l; p++) {
            let ele = params[p]
            let name = ele.attributes.name
            let defaultValue = ele.attributes['default']
            if (scope[name]) {
                // cool return
                continue
            } else if (defaultValue !== undefined) {
                try {
                    scope[name] = await interpolate(defaultValue, scope)
                } catch (e) {
                    this.error(
                        { message: `Expanding default template parameter ${defaultValue}"\n\t${e.message}\n\t}` })
                }
            } else {
                this.error({ message: `expanding template "${template.attributes.name}" requires parameter "${name}"` })
                valid = false
            }
        }
        return valid
    }
    /**
    * Expand all the templates
    */
    async processExpandTemplates(parent, tempStart) {
        let expands = this.findChildren(parent, "expand", true)
        // ANY expands exist, make sure we keep expanding.
        let count = expands.length;
        // Walking backward to do simple replace in place
        for (let i = expands.length - 1; i >= 0; i--) {
            let ele = expands[i].element
            let template = ele
            // Expand any macro in the attributes
            let addToStart = ele.attributes && ele.attributes._start
            if (ele.attributes && ele.attributes._template !== undefined) {
                let templateName = ele.attributes._template
                template = this.templates[templateName]
                // Allow for optional templates
                if (!template) {
                    if (!ele.attributes._optional) {
                        this.error({ message: `Template "${templateName}" not found. Missing import?` })
                    }
                    parent.elements.splice(expands[i].index, 1)
                    count--
                    continue;
                }
            }


            let outerScope = { plugins: this.plugins }
            Object.assign(outerScope, this.data)
            if (parent.__scope) {
                Object.assign(outerScope, parent.__scope)
            }
            // Include data from repeats
            if (ele.__scope) {
                Object.assign(outerScope, ele.__scope)
            }

            if (ele.attributes) {
                let clone = {}
                let attribs = Object.entries(ele.attributes)
                for (let [key, value] of attribs) {
                    try {
                        clone[key] = await interpolate(value, outerScope)
                    }
                    catch (e) {
                        this.error({ message: `no data for macro expression "${value}"\n\t${e.message}` })
                    }
                }
                Object.assign(outerScope, clone)
            }
            // Allow the skipping of this
            if (ele.attributes && ele.attributes._skip) {
                let test = await interpolate(ele.attributes._skip, outerScope)
                test = test.toString().toLowerCase();
                if (test == 'true') {
                    parent.elements.splice(expands[i].index, 1)
                    continue
                }
            }
            // 
            if (ele.attributes && ele.attributes._template) {
                await this.processTemplateParameters(template, outerScope)
            }

            let childElements = template.elements
            let replaceWith = []
            if (!childElements) {
                this.error({ message: `ERROR: Cannot have template with no elements` })
            }

            for (let c = 0, cl = childElements.length; c < cl; c++) {
                if (childElements[c].name === "params") {
                    continue
                }
                let clone = await this.deepInterpolate(childElements[c], outerScope)
                if (clone) {
                    clone.__scope = {}
                    Object.assign(clone.__scope, outerScope)
                    replaceWith.push(clone)
                }
            }
            if (addToStart && tempStart) {
                parent.elements.splice(expands[i].index, 1)
                // rember we're walking backwards
                tempStart.elements = replaceWith.concat(tempStart.elements)
            } else {
                parent.elements.splice(expands[i].index, 1, ...replaceWith)
            }

        }
        return count
    }
    /**
     * When this is called expands should eb the only thing left
     */
    async processAllExpands() {
        let count = 0
        // Process them at the top level
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let tempStart = { type: "element", name: "start", elements: [] }
        count += await this.processExpandTemplates(mission_data, tempStart)
        if (count) {
            if (tempStart.elements.length) {
                mission_data.elements.push(tempStart)
            }
            this.makeSingleStart()
        }
        // Process them in start
        let start = this.findFirstElement(mission_data, "start")
        if (start && start.elements) {
            count += await this.processExpandTemplates(start)
        }
        // process them in every event
        let events = this.findElements(mission_data, "event")
        if (events.length) {
            for (let i = 0, l = events.length; i < l; i++) {
                if (events[i].elements) {
                    count += await this.processExpandTemplates(events[i])
                }
            }
        }
        return count
    }
    /**
    * Finds all templates in the file, caches them, then remove the elements
    */
    processTemplates() {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let allTemplates = this.removeFirstElement(mission_data, "templates")
        if (!allTemplates) return
        let templates = this.findElements(allTemplates, "template")
        for (let t = 0, l = templates.length; t < l; t++) {
            let ele = templates[t]
            let name = ele.attributes.name
            this.templates[name] = templates[t]
        }
    }
    /**
     * Uses the values to expand template string. This is recursive to all child elements
     * @param {ModelElement} elements The elements to process
     * @param {object} values The values to use
     */
    async deepInterpolate(element, values, stopExpanding) {
        let clone = {
            type: element.type,
        }
        if (element.type == "text") {
            clone.text = await interpolate(element.text, values)
        } else {
            clone.name = element.name
        }
        // if (element.name == 'repeat') {
        //     return
        // }
        if (element.name == 'repeat') {
            clone.__scope = values
            stopExpanding = true
        }
        if (element.attributes) {
            clone.attributes = {}
            // I believe the keys can't be templated
            let attribs = Object.entries(element.attributes)
            for (let [key, value] of attribs) {
                try {
                    let v = value
                    if (element.name != 'repeat' && !stopExpanding) {
                        if (value.search(/\$/) >= 0) {
                            v = await interpolate(value, values)
                        }
                    }
                    clone.attributes[key] = v
                }
                catch (e) {
                    this.error({ message: `no data for macro expression "${value}"\n\t${e.message}` })
                }
            }
        }
        if (element.elements) {
            let clones = []
            for (let i = 0, l = element.elements.length; i < l; i++) {
                // Interpolate the keys, the values, and any text elements
                let child = element.elements[i]
                let clone = await this.deepInterpolate(child, values, stopExpanding)
                if (clone) {
                    clones.push(clone)
                }
            }
            clone.elements = clones
        }
        return clone
    }
    /**
    * Uses the values to expand template string. This is recursive to all child elements
    * @param {ModelElement} elements The elements to process
    * @param {object} values The values to use
    */
    async deepExpand(element, values) {
        if (element.type == "text") {
            element.text = await interpolate(element.text, values)
        }
        if (element.attributes) {
            // I believe the keys can't be templated
            let attribs = Object.entries(element.attributes)
            for (let [key, value] of attribs) {
                try {
                    if (value.search(/\$/) >= 0) {
                        element.attributes[key] = await interpolate(value, values)
                    }
                }
                catch (e) {
                    this.error({ message: `no data for macro expression "${value}"\n\t${e.message}` })
                }
            }
        }
        if (element.elements) {
            for (let i = 0, l = element.elements.length; i < l; i++) {
                // Interpolate the keys, the values, and any text elements
                let child = element.elements[i]
                await this.deepExpand(child, values)
            }
        }
    }
    /**
     * Uses the values to expand template string. This is recursive to all child elements
     * @param {ModelElement} elements The elements to process
     * @param {object} values The values to use
     */
    async shallowInterpolate(element, values) {
        if (element.type == "text") {
            element.text = await interpolate(element.text, values)
        }
        if (element.attributes) {
            // I believe the keys can't be templated
            let attribs = Object.entries(element.attributes)
            for (let [key, value] of attribs) {
                try {
                    if (value.search(/\$/) >= 0) {
                        element.attributes[key] = await interpolate(value, values)
                    }
                }
                catch (e) {
                    this.error({ message: `no data for macro expression "${value}"\n\t${e.message}` })
                }
            }
        }
    }
    /**
     * Remove repeats adding expanded version to parent
     * inserting all new elements at the same place 
     * @param {ModelElement} parent 
     */
    async processRepeats(parent) {
        if (!parent) return
        let repeats = this.findChildren(parent, "repeat")
        if (!repeats) return
        if (repeats.length == 0) return

        let hasNested = false
        for (let r = repeats.length - 1; r >= 0; r--) {
            let element = repeats[r].element

            let outerScope = { plugins: this.plugins }
            Object.assign(outerScope, this.data)
            let skipFilter = element.attributes["_skip"]
            // Copy the attributes of the repeat to scope
            Object.assign(outerScope, element.attributes)
            // As is used to attach to sub repeats
            // the current values as an object
            if (parent.__scope) {
                Object.assign(outerScope, parent.__scope)
            }
            if (element.__scope) {
                // Make sur we don't walk over this scopes
                // with the __scope data
                // e.f. range, as
                let scope = {}
                Object.assign(scope, outerScope)
                Object.assign(scope, element.__scope)
                outerScope = scope
            }

            let rangeName = element.attributes._range
            let isActuallyArray
            let range
            if (rangeName) {
                range = outerScope[rangeName]
                if (!range) {
                    this.error({ message: `Range not found ${rangeName}; Range should be defined in a values tag.` })
                    continue
                }
                isActuallyArray = Array.isArray(range)
            } else if (element.attributes._length) {
                range = { length: parseInt(element.attributes._length), isIndex:true}
                if (range.length == 0) {

                } else if (!range.length) {
                    this.error({ message: `Repeat needs a range or a length` })
                }
            }
            if (!range) {
                this.error({ message: `Repeat has no range` })
                continue;
            } else if (range.length === undefined) {
                this.error({ message: `Range "${rangeName}" is not an array` })
                continue
            }
            let rangeAs = rangeName
            if (element.attributes._as) {
                rangeAs = element.attributes._as
            }

            // Accumulate all the elements
            let childElements = repeats[r].element.elements
            let replaceWith = []
            for (let i = 0, l = range.length; i < l; i++) {
                let scope = {}
                // Clone outerscope first so we can overwrite properly
                Object.assign(scope, outerScope)
                if (isActuallyArray) {
                    Object.assign(scope, range[i])
                }
                scope._index = i

                if (rangeAs) {
                    if (range.isIndex) {
                        scope[rangeAs] = i
                    } else {
                        scope[rangeAs] = scope
                    }
                    
                }

                if (skipFilter) {
                    let test = await interpolate(skipFilter, scope)
                    if (test) {
                        test = test.toString().toLowerCase();
                    }
                    if (test == 'true') {
                        continue
                    }
                }
                //////////////////////////////////////////////////////
                /// Clone and expand all the content
                for (let c = 0, cl = childElements.length; c < cl; c++) {

                    if (childElements[c].name != "repeat") {
                        let clone = await this.deepInterpolate(childElements[c], scope)
                        clone.__scope = {}
                        Object.assign(clone.__scope, scope)
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
                        let clone = {}
                        Object.assign(clone, childElements[c])
                        // Add scope dat to repeats
                        clone.__scope = {}
                        Object.assign(clone.__scope, scope)
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
    async processAllRepeats() {
        // Process them at the top level
        let more = false
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        more = await this.processAllRepeatsFor(mission_data)
        // Process them in start
        let start = this.findFirstElement(mission_data, "start")
        if (start && start.elements) {
            more |= await this.processAllRepeatsFor(start)
        }
        // process them in every event
        let events = this.findElements(mission_data, "event")
        if (events.length) {
            for (let i = 0, l = events.length; i < l; i++) {
                if (events[i].elements) {
                    more |= await this.processAllRepeatsFor(events[i])
                }
            }
        }
        return more
    }
    /**
     * Will process all repeats within a given element
     * @param {ModelElement} parent the parent
     */
    async processAllRepeatsFor(parent) {
        if (!parent) return
        return await this.processRepeats(parent)
    }
    /**
     * Merges elements for imported file. This is recursive
     * Assures given file is only imported once
     * @param {ModelElement} main The root element of the main doc
     */
    async processImports() {
        let mission_data = this.findFirstElement(this.model, "mission_data")
        if (!mission_data) return
        let imports = this.removeFirstElement(mission_data, "imports")
        if (!imports) return
        let more = true;
        /// Process any repeats
        while (more) {
            more = false;
            more |= await this.processAllRepeatsFor(imports)
            more |= await this.processExpandTemplates(imports)
        }

        let importEles = this.findElements(imports, "import")
        for (let i = 0, l = importEles.length; i < l; i++) {
            let ele = importEles[i]
            await this.processImport(ele)
        }
    }
    async processImport(ele) {
        let name = ele.attributes.name
        let value = ele.attributes.value
        let as = ele.attributes.as
        let skip = ele.attributes.skip
        if (skip) {
            let checkSkip = await interpolate(skip, this.data)
            if (checkSkip === 'true') return;
        }
        if (!name) {
            this.error({ message: `Import without a name` })
        }
        if (path.extname(name) === ".js") {
            await this.fromScript(name)
            return
        }
        if (path.extname(name) === ".json") {
            await this.fromJson(name, value)
            return
        }

        let mission
        if (path.extname(name) === ".txt") {
            if (as === "json") {
                await this.fromLogToJson(name, value)
                return
            } else {
                mission = await this.fromLogToXml(name)
            }

        } else {
            mission = await MissionFile.fromFile(path.resolve(this.basedir, name))
        }

        if (mission) {
            // Expand templates
            await mission.processFile(this)
            /////////////////////////////////////////////
            // 
            this.removePluginsFromImport(mission)
            Object.assign(this.data, mission.data)
            Object.assign(this.templates, mission.templates)
            //main.addErrors(mission)
            if (this.model) {
                // Merge / Start
                mission.mergeStart(this)
                // Merge  events
                mission.mergeEvents(this)
            }

        }
    }
    /**
     * Removes Plugins from imports before merging into main
     * @param {MissionFile} mission The Imported Data
     */
    removePluginsFromImport(mission) {
        delete mission.data.utils
        delete mission.data.int
        delete mission.data.float
        delete mission.data.map
    }
    /**
     * Process the imports,ranges,repeats, templates and expands of a main document
     */
    async processFile(main, values) {
        if (this.model) {
            this.info({ message: `Processing - ${this.filename}` })
            let mission_data = this.findFirstElement(this.model, "mission_data")
            if (!mission_data) return
            // Process values first to allow overrides and use with imports
            this.processValues(main)
            // This is to reset any values before imports
            // incase they are used in SKIPs
            if (values) {
                Object.assign(this.data, values)
            }
            await this.processTemplates()
            await this.processImports(this)
            // This is to reset any values after imports
            if (values) {
                Object.assign(this.data, values)
            }


            // Keep expanding stuff until there isn't anymore
            let more = true
            while (more) {
                more = false
                let repeats = true
                let expand = true
                // Do all repeats you can
                while (repeats) {
                    repeats = await this.processAllRepeats()
                    more |= repeats
                }
                // then all expands
                while (expand) {
                    expand = await this.processAllExpands()
                    more |= expand
                }

            }
            //Replaces any lingering ${} statements using the data model
            await this.deepExpand(mission_data, this.data)
            await this.makeSingleStart()
            await this.removeEmptyEvents()

        }
    }
}

exports.MissionFile = MissionFile
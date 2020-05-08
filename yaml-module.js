const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path')
const { interpolate } = require('./template-string.js')
const { XmlElement } = require('./xml-element.js')


function isObject(obj) {
  return obj != null && obj.constructor.name === "Object"
}

// Make a string separator
class YamlModule {
  constructor(data, filename) {

    this.model = data
    this.model.imported = { filename: true }
    this.filename = filename
    this.basedir = path.dirname(filename)
    if (this.model.start) {
      this.model.start = [this.model.start]
    }
    // Using a very simplified way to create XML
    // Two string One building down, one building closing tags up
    this.xml = new XmlElement()
  }
  toXML() {
    return this.xml.toXML()
  }

  // This is just for testing??
  async testImports(xml, yaml) {
    await this.processImports(this.model)
    return this.addEvents(xml, this.model.events)
  }

  async processImports(mainModel) {
    let imports = this.model.imports
    if (!imports) {
      return;
    }
    for (let i = 0, l = imports.length; i < l; i++) {
      // Skip if already imported
      if (mainModel.imported[imports[i]]) continue;
      let validImports = YamlModule.config['valid-imports']
      // default to only allow events
      if (!validImports) {
        validImports = ["events"]
      }
      let filename = imports[i]
      if (!path.isAbsolute(imports[i])) {
        filename = path.resolve(this.basedir, filename)
      }
      let imported = await YamlModule.fromFile(filename)
      if (!imported) {
        this.error('Failed to import '+filename)
      }
      // should avoid circular import
      mainModel.imported[imports[i]] = true
      await imported.processImports(mainModel)
      for (let v = 0, vl = validImports.length; v < vl; v++) {
        let key = validImports[v]
        if (!imported.model[key]) continue;
        if (!mainModel[key]) {
          mainModel[key] = imported.model[key]
        } else {
          mainModel[key] = mainModel[key].concat(imported.model[key])
        }

      }

    }
  }

  async buildXml() {
    /// process imports
    this.processImports(this.model)
    // Create Mission

  }

  async processAll() {
    let xml = this.xml

    let mission = xml.append("mission_data", {version: this.model.version})
    if (this.model.mission && this.model.mission.description) {
      xml.append("mission_description", {text: this.model.mission.description})
    }
    await this.processImports(this.model)
    this.addStart(xml, this.model.start)
    this.addEvents(xml, this.model.events)
    mission.close()
    return xml
  }

  dump() {
    console.log(JSON.stringify(this.model, null, 2));
  }
  dumpSingle(s) {
    console.log(JSON.stringify(s, null, 2));
  }

  static async loadDefaults() {
    if (YamlModule.config && YamlModule.config.loaded) {
      return YamlModule.config;
    }
    try {

      let filename = path.resolve(__dirname, "yaml-config.yaml")
      let content = await fs.readFile(filename, 'utf8')
      let config = yaml.safeLoad(content);
      YamlModule.config = config ? config : YamlModule.config
      YamlModule.config.loaded = true

      return YamlModule.tagAndDefaults
    } catch (e) {

    }
  }
  static async fromFile(filename) {
    try {
      await YamlModule.loadDefaults()

      if (path.extname(filename)==='') {
        filename+='.yaml'
      }

      let doc = yaml.safeLoad(await fs.readFile(filename, 'utf8'));
      return new YamlModule(doc, filename)
    }
    catch (e) {
      return
    }
  }
  static async fromString(s) {
    try {
      await YamlModule.loadDefaults()

      let doc = yaml.safeLoad(s);
      return new YamlModule(doc)
    }
    catch (e) {
      return
    }
  }
  getEventPrototype(name) {
    return this.model.event_prototypes[name]
  }
  expandEventPrototype(name, args) {
    let proto = this.getEventPrototype(name)
    if (!proto) {
      this.error(`Use of undefined eventPrototype ${proto}`)
    }
    // Expand all keys an values macros
    let ret 
    try {
      this.expandKeyValues(proto, args)
    } catch(e) {
      this.error(e)
    }
  }
  expandKeyValues(proto, args) {
    if (proto.constructor === String) {
      return interpolate(proto, args)
    }
    let ret = {}
    for (let [key, value] of Object.entries(proto)) {
      if (isObject(value)) {
        ret[key] = this.expandKeyValues(value, args)
      } else if (Array.isArray(value)) {
        let newValue = []
        for (let i = 0, l = value.length; i < l; i++) {
          newValue.push(this.expandKeyValues(value[i], args))
        }
        ret[key] = newValue;
      }
      else if (value.constructor === String) {
        ret[key] = interpolate(value, args)
      } else {
        ret[key] = value
      }
    }
    return ret
  }

  // This is just for testing??
  testEventPrototypes(xml, yaml) {
    return this.addEvents(xml, this.model.events)
  }
  addEvents(xml, events) {
    if (!events) {
      this.error('Events list is empty')
      return
    }

    for (let c = 0, l = events.length; c < l; c++) {
      this.addEvent(xml, events[c])
    }
    return xml;
  }

  addEvent(xml, event) {
    if (event._prototype) {
      let proto = event._prototype
      event = this.expandEventPrototype(event._prototype, event)
      if (!event) {
        this.error('Cannot expandEventPrototype prototype '+proto)
        return;
      }
    }
    let name = event.name;
    if (!name) {
      this.error('Event created with no name')
      return
    }
    let eventXml = xml.append('event', { name })
    this.addEventStartContent(eventXml,event)
    return eventXml.close()
  }

  addEventStartContent(eventXml, event) {
    this.addConditions(eventXml, event.conditions)
    this.addSections(eventXml, event, YamlModule.config.tagDefaults)
    this.addVariables(eventXml, event.variables)
    this.addCommandType(eventXml, 'set_relative_position', event.relative_positions)
  }

  // Allowing the import of multiple starts 
  // we need to merge them into one.
  addStart(xml, starts) {

    let eventXml = xml.append('start')
    for(let i=0,l=starts.length;i<l;i++) {
      this.addEventStartContent(eventXml, starts[i])
    }
    return eventXml.close()
  }

  expandConditional(xml, s) {
    var separators = Object.keys(YamlModule.config.comparators)
    let reg = new RegExp(separators.join('|'), 'g')
    let oper = s.match(reg)
    oper = YamlModule.config.comparators[oper]
    var tokens = s.split(reg);
    if (oper && tokens.length == 2) {
      xml.append('if-variable', {
        name: tokens[0].trimEnd(),
        comparator: oper,
        value: tokens[1].trimStart()
      })
    } else {
      this.error('Bad condition expression ' + s)
    }

  }


  addConditions(event, conditions) {
    if (!conditions) {
      this.error('Event without conditions')
      return
    }
    if (!Array.isArray(conditions)) {
      conditions = Object.entries(conditions)
    }
    for (let c = 0, cl = conditions.length; c < cl; c++) {
      let condition = conditions[c]
      if (condition.constructor === String) {
        this.expandConditional(event, condition)
      } else {
        let kvs = Object.entries(condition)
        if (kvs.length != 1) {
          // SOomething is funky
        }
        let template = kvs[0][0]
        let value = kvs[0][1]

        event.append(template, value)
      }

    }
  }

  addSections(xml, event, sectionList) {
    for (let [key, value] of Object.entries(sectionList)) {
      if (value._section && event[key]) {
        this.addSections(xml, event[key], value)
      } else if (event[key] && !value._collection) {
        this.addSectionType(xml, key, event[key], value)
      }
    }
  }

  addSectionType(xml, type, collection, def) {
    if (!Array.isArray(collection)) {
      collection = [collection]
    }


    for (let c = 0, cl = collection.length; c < cl; c++) {
      let attrib = collection[c]
      let tag = 'create'
      if (def && def.defaults) {
        attrib = {}
        // Merge missinf defaults
        Object.assign(attrib, def.defaults, collection[c])
      } if (def && def.tag) {
        tag = def.tag
      }
      xml.append(`create`, attrib)
    }
  }



  addCommandType(xml, type, collection) {
    if (!collection) {
      return
    }
    if (!Array.isArray(collection)) {
      collection = [collection]
    }
    for (let c = 0, cl = collection.length; c < cl; c++) {
      xml.append(type, collection[c])
    }
  }

  addVariables(event, variables, struct) {
    if (!variables) {
      return
    } else if (!isObject(variables) && !Array.isArray(variables) && struct) {
      // make sure this is a string, even if empty
      event.append('set_variable', { name: struct, value: variables })
    }

    for (let [key, value] of Object.entries(variables)) {
      if (Array.isArray(value)) {
        for (let i = 0, l = value.length; i < l; i++) {
          let arrayBegin = YamlModule.config.separators.arrayBegin
          let arrayEnd = YamlModule.config.separators.arrayEnd
          let name = `${key}${arrayBegin}${i + 1}${arrayEnd}`
          struct = struct ? struct : ''
          this.addVariables(event, value[i], struct + name)
        }
      } else if (isObject(value)) {
        // make sure this is a string, even if empty
        struct = struct ? struct : ''
        this.addVariables(event, value, struct + key + YamlModule.config.separators.struct)
      } else {
        let name = key
        if (struct) {
          name = struct + key
        }
        event.append('set_variable', { name, value })
      }

    }


  }
  error(err) {
    console.error(err)
  }

}
YamlModule.config = {
  tagAndDefaults: {},
  separators: {
    struct: ".",
    arrayBegin: "[",
    arrayEnd: "]"
  },
  comparators: {
    "==": "EQUALS",
    "=": "EQUALS",
    EQUALS: "EQUALS",
    "!=": "NOT",
    NOT: "NOT",
    GREATER: "GREATER",
    LESS: "LESS",
    LESS_EQUAL: "LESS_EQUAL",
    GREATER_EQUAL: "GREATER_EQUAL",
    ">": "GREATER",
    "<": "LESS",
    "<=": "LESS_EQUAL",
    ">=": "GREATER_EQUAL",
  }
}


exports.YamlModule = YamlModule




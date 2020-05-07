const yaml = require('js-yaml');
const fs = require('fs').promises;
const {interpolate} = require('./template-string.js')
const { XmlElement } = require('./xml-element.js')

function isObject(obj) {
  return obj != null && obj.constructor.name === "Object"
}

// Make a string separator
class YamlModule {
  constructor(data) {
    this.structSeparator = '.'
    this.model = data
    // Using a very simplified way to create XML
    // Two string One building down, one building closing tags up
    this.xml = new XmlElement()
  }
  toXML() {
    return this.xml.toXML()
  }


  dump() {
    console.log(JSON.stringify(this.model, null, 2));
  }
  dumpSingle(s) {
    console.log(JSON.stringify(s, null, 2));
  }
  static async fromFile(filename) {
    try {
      let doc = yaml.safeLoad(await fs.readFile(filename, 'utf8'));
      return new YamlModule(doc)
    }
    catch (e) {
      return
    }
  }
  static fromString(s) {
    try {
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
    return this.expandKeyValues(proto, args)
  }
  expandKeyValues(proto, args) {
    if (proto.constructor === String) {
      return interpolate(proto, args)
    }
    let ret = {}
    for(let kv of Object.entries(proto)) {
      if (isObject(kv[1])) {
        ret[kv[0]] = this.expandKeyValues( kv[1], args)
      }  else if (Array.isArray(kv[1])) {
        let value = []
        for(let i=0, l=kv[1].length;i<l;i++) {
          value.push(this.expandKeyValues(kv[1][i], args))
        }
        ret[kv[0]] = value;
      }
      else if (kv[1].constructor === String) {
        ret[kv[0]] = interpolate(kv[1], args)
      } else {
        ret[kv[0]] = kv[1]
      }
    }
    return ret
  }
  /*
  TowObject:
      name: ${ship} Tow ${object}
      conditions:
        - ${object} == ${sideValue}
        - exists: ${ship}
      # note assumes object has no space in the name for mesh, minor rewrite in not 
      relative_position:
        - name2: ${object}
          distance: 100
          angle: 180
          name1: ${ship}
  */
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
      event = this.expandEventPrototype(event._prototype, event)
    }
    let name = event.name;
    if (!name) {
      this.error('Event created with no name')
      return
    }
    let eventXml = xml.append('event', { name })
    

    this.addConditions(eventXml, event.conditions)

    this.addMonsters(eventXml, event.monsters)
    this.addVariables(eventXml, event.variables)
    this.addCommandType(eventXml, 'relative_position', event.relative_positions)
    return eventXml.close()
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
      let kvs = Object.entries(condition)
      if (kvs.length!=1) {
        // SOomething is funky
      }
      let template= kvs[0][0]
      let value = kvs[0][1]
     
      event.append(template, value)
    }
  }

  addMonsters(xml, monsters) {
    if (!monsters) {
      return
    }
    if (monsters.dragons) {
      this.addMonstersType(xml, 'dragons', monsters.dragons)
    }
  }

  addMonstersType(xml, type, collection) {
    if (!Array.isArray(collection)) {
      collection = [collection]
    }
    for (let c = 0, cl = collection.length; c < cl; c++) {
      xml.append(`create_${type}`, collection[c])
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
    }

    for (let kv of Object.entries(variables)) {
      if (isObject(kv[1])) {
        // make sure this is a string, even if empty
        struct = struct ? struct : ''
        this.addVariables(event, kv[1], struct + kv[0] + this.structSeparator)
      } else {
        let name = kv[0]
        if (struct) {
          name = struct + kv[0]
        }
        event.append('set_variable', { name, value: kv[1] })
      }

    }


  }
  error(err) {
    console.error(err)
  }

}

exports.YamlModule = YamlModule




const { interpolate } = require('./template-string.js')
const { XML_TEMPLATES } = require('./xml-templates.js')

class XmlElement {
  constructor(template, values) {
    this.begin = ''

    this.expand(template, values)
    this.children = []
  }
  expand(template, values) {
    let xml = XML_TEMPLATES[template]
    if (!xml) return

    if (xml.begin) {
      this.begin = interpolate(xml.begin, values)
    }
    if (xml.end) {
      this.end = interpolate(xml.end, values)
    }
    return this
  }
  close() {
    // Already closed
    if (!this.children) {
      return this.begin
    }
    for (let i = 0, l = this.children.length; i < l; i++) {
      this.begin += this.children[i].close()
    }
    if (this.end) {
      this.begin += this.end
      this.end = undefined
    }
    this.children = undefined
    return this.begin
  }
  append(template, values) {
    if (!this.children) {
      // Error      
    }
     // Allow for default single argument
     if (values.constructor === String) {
      values = {name: values}
    }
    let child = new XmlElement(template, values)
    this.children.push(child)
    return child
  }
  toXML() {
    this.close()
    return this.begin
  }

}
exports.XmlElement = XmlElement  
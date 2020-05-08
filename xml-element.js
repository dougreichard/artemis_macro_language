const { interpolate } = require('./template-string.js')
const { XML_TEMPLATES } = require('./xml-templates.js')

const needs_end_tag = {
  'mission': true,
  'event': true,
  'start': true
}
const isText = {
  'incoming_comms_text': true,
  'mission_description': true
}

class XmlElement {
  constructor(tag, attrib) {
    this.begin = ''

    this.expand(tag, attrib)
    this.children = []
  }
  escapeText(s) {
    // Should help avoid bad text 
    return s;
  }
  // Will prepend space
  expandAttrib(attrib, skips) {
    if (!attrib) {
      return ''
    }
    let kv = Object.entries(attrib)
    let ret=''
    for (let i=0,l=kv.length;i<l;i++) {
        ret += ` ${kv[i][0]}="${kv[i][1]}"`
    }
    return ret
  }
  expand(tag, attrib) {
    if (!tag) return;
    if (attrib && attrib.text) {
      let text = this.escapeText(attrib.text)
      this.begin = `<${tag}${this.expandAttrib(attrib, {text:true})}>${text}</${tag}>`
    } else  if (needs_end_tag[tag]) {
      this.begin = `<${tag}${this.expandAttrib(attrib)}>`
      this.end = `</${tag}>`
    } else {
      this.begin = `<${tag}${this.expandAttrib(attrib)}/>`
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
     if (values && values.constructor === String) {
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
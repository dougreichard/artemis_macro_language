const { XmlElement } = require('../xml-element.js')
const expect = require('chai').expect


describe('expand-xml', function () {
  describe('raw expand', function () {
    it('Should be able to call', function () {
      let expanded = new XmlElement('set_variable', { name: 'Hello', value: 'World' })
      expect(expanded).to.exist;
      expect(expanded.end).to.not.exist;
      expect(expanded.begin).to.equal('<set_variable name="Hello" value="World"/>')
    });
    it('Supports set-variable', function () {
      let expanded = new XmlElement('set_variable', { name: 'Hello', value: 'World' })
      expect(expanded).to.exist;
      expect(expanded.end).to.not.exist;
      expect(expanded.begin).to.equal('<set_variable name="Hello" value="World"/>')
    });
    it('Support event', function () {
      let expanded = new XmlElement('event', { name: 'HelloWorld' })
      expect(expanded).to.exist;
      expect(expanded.end).to.exist;
      expect(expanded.begin).to.equal('<event name="HelloWorld">')
      expect(expanded.end).to.equal('</event>')
    });
  });
  describe('raw expand', function () {
    it('Should be able to call', function () {
      let expanded = new XmlElement('set_variable', { name: 'Hello', value: 'World' })
      expect(expanded).to.exist;
      expect(expanded.end).to.not.exist;
      expect(expanded.begin).to.equal('<set_variable name="Hello" value="World"/>')
    });
    it('Support empty event', function () {
      let expanded = new XmlElement('event', { name: 'HelloWorld' })
      expect(expanded).to.exist;
      expect(expanded.end).to.exist;
      expect(expanded.toXML()).to.equal('<event name="HelloWorld"></event>')
    });
    it('Support with content event', function () {
      let e = new XmlElement('event', { name: 'HelloWorld' })
      let v = e.append('set_variable', { name: 'Hello', value: 'World' })
      expect(v.begin).to.equal('<set_variable name="Hello" value="World"/>')
      expect(e).to.exist;
      expect(e.end).to.exist;
      expect(e.toXML()).to.equal('<event name="HelloWorld"><set_variable name="Hello" value="World"/></event>')
    });
    it('Support with multiple content event', function () {
      let e = new XmlElement('event', { name: 'HelloWorld' })
      let v1 = e.append('set_variable', { name: 'Hello', value: 'World' })
      expect(v1.begin).to.equal('<set_variable name="Hello" value="World"/>')
      let v2 = e.append('set_variable', { name: 'Artemis', value: 'Script' })
      expect(v2.begin).to.equal('<set_variable name="Artemis" value="Script"/>')
      expect(e).to.exist;
      expect(e.end).to.exist;
      expect(e.toXML()).to.equal('<event name="HelloWorld"><set_variable name="Hello" value="World"/><set_variable name="Artemis" value="Script"/></event>')
    });

  });
});
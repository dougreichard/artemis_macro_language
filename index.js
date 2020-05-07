const {YamlModule} = require('./YamlModule.js')

async function main () {
  let test =  await YamlModule.fromFile('CaptureObject.yaml')
  //test.dumpSingle(test.getEventPrototype('TowObject'))

  let testTemplate = test.interpolate("${ship} Tow ${object}", {ship: 'Artemis', object: 'egg1'})
  console.log(testTemplate)
}
main()

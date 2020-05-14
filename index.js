const { MissionFile } = require('./lib/mission-file.js')
const fs = require("fs").promises
const path = require("path")


console.log(`Processing ${process.argv[2]}`)

async function main() {
  let mission = await MissionFile.fromFile(path.resolve(process.argv[2]))
  await mission.processFile(mission)
  let xml = mission.toXML()
  
  await fs.writeFile(path.resolve('MISS_TheArena.xml'), xml, "utf8")
}
main()









/*
const run = createToken({ name: "ID", pattern: /run/ })
const load = createToken({ name: "load", pattern: /load/ })
const list = createToken({ name: "list", pattern: /list/ })
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /[ \t\n\r]+/, group: Lexer.SKIPPED })
const file = createToken({ name: "file", pattern: /[\w+\/\.]+/ })
const allTokens = [load, run, list, WhiteSpace, file]
const commandLexer = new Lexer(allTokens);



// This the main entry point

$.RULE("commands", () => {
  return $.OR([
    { ALT: () => $.SUBRULE($.loadCmd) },
    { ALT: () => $.SUBRULE($.runCmd) },
    { ALT: () => $.SUBRULE($.listCmd) }
  ])
})


$.RULE("listCmd", () => {

  $.CONSUME(list)
  for (let k of Object.keys(listener.symTable)) {
    console.log(k)
  }
  return true;
})
$.RULE("runCmd", () => {
  $.CONSUME(run)
  let story = listener.symTable['$$story']
  if (story && story.content && story.content.startup) {
    runCommandList(story.content.startup)
  }
  return true;
})

$.RULE("loadCmd", () => {
  $.CONSUME(load)
  let fileName = $.CONSUME(file).image
  let out = parser.parseFile(fileName)
})
*/
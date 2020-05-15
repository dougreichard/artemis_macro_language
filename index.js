const { MissionFile } = require('./lib/mission-file.js')
const fs = require("fs")
const path = require("path")


// console.log(`Processing ${process.argv[2]}`)
async function watch(file) {
  /// if log doesn't exist write it
  // **** log file for mission MISS_AmlTest ****
  let base = path.basename(file, ".xml")
  let log = path.resolve(base+"_LOG.txt")
  fs.watchFile(log, (curr, prev) => {
      console.log('Log changed')
      main(file)
  });
}

async function main(file) {
  
  let base = path.basename(file, ".xml")
  let src = path.resolve(base+"_SOURCE.xml")
  console.log(`Building ${base} for ${src}`)
  let mission = await MissionFile.fromFile(src)
  await mission.processFile(mission)
  let xml = mission.toXML()

  await fs.promises.writeFile(path.resolve(file), xml, "utf8")

}
let file = process.argv[2]
main(file)
if (process.argv[3]==="watch") {
  watch(file)
}









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
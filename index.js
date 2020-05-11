
const marko = require("marko/node-require");
 
var fs = require("fs");
var hello = require("./components/test/hello");

var out = fs.createWriteStream("MISS_Hello.xml", { encoding: "utf8" });
hello.render({ name: "Frank" }, out);







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
// Compiled using marko@4.21.8 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/artemis-macro-language$1.0.0/components/test/hello.marko",
    marko_renderer = require("marko/src/runtime/components/renderer"),
    marko_forOf = require("marko/src/runtime/helpers/for-of"),
    marko_attr = require("marko/src/runtime/html/helpers/attr"),
    marko_classAttr = require("marko/src/runtime/html/helpers/class-attr");

function render(input, out, __component, component, state) {
  var data = input;

  let ships = ["Aretmis", "Hera"]

  out.w("<mission_data version=1.0><mission_description>Test Test test</mission_description><start name>");

  var $for$0 = 0;

  marko_forOf(ships, function(ship) {
    var $keyScope$0 = "[" + (($for$0++) + "]");

    out.w("<if_variable" +
      marko_attr("name", ("\"" + ship) + "\"") +
      " value=value>");
  });

  out.w("<set_timer name=name seconds=value><set_variable name=name value=value><set_variable name=name randomIntLow=5><set_variable name=TheVarible randomIntLow><if_timer name=name><div" +
    marko_classAttr(input.myClassName) +
    "></div></start><event name=\"The Ancient One\"><if_variable name=name value=value><set_variable name=name value=value><set_variable name=name randomIntLow=5><set_variable name=TheVarible randomIntLow><incoming_comms_text type=Something>Text</incoming_comms_text><if_timer name=name><if_variable name=name value=value></event></mission_data>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.meta = {
    id: "/artemis-macro-language$1.0.0/components/test/hello.marko"
  };

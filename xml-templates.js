 
exports.XML_TEMPLATES = {
    event: {
      begin: '<event name="${name}">',
      end: '</event>'
    },
    if_variable: {
      begin: '<if_variable name="${name}" comparator="${operator}" value="${value}"/>'
    },
    if_timer_finished: {
      begin: '<if_timer_finished name="${name}"/>'
    },
    if_not_exists: {
      begin: '<if_not_exists name="${name}"/>'
    },
    if_exists: {
      begin: '<if_exists name="${name}"/>'
    },
    if_docked: {
        begin: '<if_docked player_name="${player_name}" name="${name}"/>'
    },
    if_variable: {
      begin: '<if_variable name="${name}" comparator="${comparator}" value="${value}"/>'
    },
    set_variable: {
      begin: '<set_variable name="${name}" value="${value}"/>'
    },
    relative_position: {
      begin: '<set_relative_position name2="${name2}" distance="${distance}" angle="${angle}" name1="${name1}"/>'
    },
    destroy: {
      begin: '<destroy name="${name}"/>'
    },
    set_timer: {
      begin: '<set_timer name="${name}" seconds="${seconds}"/>'
    },
    incoming_comms_text: {
      begin: '<incoming_comms_text from="${from}" sideValue="${sideValue}">${text}'
      +'</incoming_comms_text>'
    },
    create_dragons: {
      begin: '<create type="monster" monsterType="5" age="${age}" x="${x}" y="${y}" z="${z}" name="${name}"/>'
    }
  
  
  }
  
  
async function interpolate(template, params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${template}\`;`)(...vals);
  }
  function getDescendantProp(obj, desc) {
    var arr = desc.split('.');
    while (arr.length) {
      obj = obj[arr.shift()];
    }
    return obj;
  }

  exports.interpolate = interpolate
  exports.getDescendantProp = getDescendantProp
function interpolate(template, params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${template}\`;`)(...vals);
  }
  exports.interpolate = interpolate
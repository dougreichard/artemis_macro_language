class MyClass{
     get text() {
         return "Hello, property"
     }
     convert(v, t) {
         return `${v}, ${t}`;
     }
}

function test(v)  {
    return "Hello, "+ v
}

async function init( basedir) {
    //console.log('Plugin init')
}

exports.init = init
exports.MyPlugin = {
    message: "Hello, Javascript",
    myInstance: new MyClass(),
    test: test
}
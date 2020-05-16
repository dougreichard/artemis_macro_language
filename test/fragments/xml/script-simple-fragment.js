class MyPlugin{
     get text() {
         return "Hello, classes"
     }
}

async function init( basedir) {
    //console.log('Plugin init')
}

exports.init = init
exports.MyPlugin = {
    message: "Hello, Javascript",
    myPlugin: new MyPlugin()
}
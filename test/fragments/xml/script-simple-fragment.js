class MyClass {
    get text() {
        return "Hello, property"
    }
    convert(v, t) {
        return `${v}, ${t}`;
    }
}

function test(v) {
    return "Hello, " + v
}

function ar_func(v) {
    return ["hello","world"]
}

async function init(basedir) {
    //console.log('Plugin init')
    return {
        pA: {
            pB: {
                pC: [10, 20, 30]
            }
        }
    }
}

exports.init = init
exports.MyPlugin = {
    message: "Hello, Javascript",
    myInstance: new MyClass(),
    test: test,
    ar_func: ar_func
}
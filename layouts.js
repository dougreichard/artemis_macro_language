function circle(_index, _length, cx, cy, r) {
    let t = (_index/_length) * Math.PI
    let X = cx + (r * Math.cos(t))  
    let Y = cy + (r * Math.sin(t))
    return {x:X, y:0, z:Y}
}


for (let i=0, l=4; i < l; i++) {
    let {x,y,z} = circle(i,l, 0, 0, 4)
    console.log(`x: ${x} y: ${y} z: ${z}`)
}


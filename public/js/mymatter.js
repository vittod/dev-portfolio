// wait until libs are loaded and gneral setup
window.addEventListener('load', function() {
    // preload()
    // setup();
    // draw()

    
    Events.on(engine, 'collisionActive', function(e) {
        pairs = e.pairs
        pairs.forEach((el) => {
            // console.log('bA', el.bodyA.id, 'bB', el.bodyB.id, 'chain', chain[chain.length - 1].id, 'box', boxes[boxes.lenth - 1].id)
            if(boxes.length > 0 && !chain[chain.length - 1].isLocked) {
                if (el.bodyA.id == chain[chain.length - 1].body.id || el.bodyA == boxes[boxes.length - 1].body.id
                && el.bodyB.id == boxes[boxes.length - 1].body.id || el.bodyB == chain[chain.length - 1].body.id) {
                    console.log('match', colliCount)
                    colliCount += 1
                    if (colliCount > 50) {
                        lockBox(el.bodyA, el.bodyB)
                    }
                }
            }
        })
    })

    

})

//////////////////////////////////////////// module aliases
const Engine = Matter.Engine
const World = Matter.World
const Bodies = Matter.Bodies
const Body = Matter.Body
const Constraint = Matter.Constraint
const MouseConstraint = Matter.MouseConstraint
const Mouse = Matter.Mouse
const Collisions = Matter.SAT
const Events = Matter.Events
// const Vertices = Matter.Vertices
// const Svg = Matter.Svg

//////////////////////////////////////////// engine & world
const engine = Engine.create();
const world = engine.world
//////////////////////////////////////////// app namespace
let canvas, particle, globalPos, mouConst, mouse, currDrag, ripperTimer, chainLink, chainLinkTwo, magnet, magnetPic,
    colliCount = 0,
    buttons = [],
    cards = [],
    boxes = [],
    chain = [],
    constraints = [],
    magnets = [];
    // MAGNET_PATH = 'M39.182 3.365 C 35.124 15.995,34.402 16.830,26.628 17.873 C 15.831 19.321,14.354 23.246,17.277 42.732 L 18.639 51.811 9.051 54.995 L -0.536 58.179 0.952 76.686 C 2.896 100.863,2.948 108.217,1.273 122.065 C 0.509 128.384,0.411 135.956,1.056 138.892 L 2.229 144.231 201.114 144.231 L 400.000 144.231 400.000 100.302 L 400.000 56.374 391.346 51.923 C 383.703 47.992,382.692 46.721,382.692 41.044 L 382.692 34.615 360.096 34.467 C 347.668 34.386,334.904 34.093,331.731 33.816 C 328.558 33.539,312.548 32.710,296.154 31.973 C 259.920 30.344,254.537 29.573,253.092 25.809 C 252.451 24.139,252.785 23.383,253.868 24.052 C 256.647 25.770,256.079 22.687,252.823 18.382 C 251.271 16.329,250.000 12.786,250.000 10.507 C 250.000 -0.172,251.773 -0.000,141.615 -0.000 C 46.784 -0.000,40.194 0.217,39.182 3.365';

//////////////////////////////////////////// app setup & draw loop
function preload() {
    chainLink = loadImage('img/chain-link.png')
    chainLinkTwo = loadImage('img/chain-link_2.png')
    magnetPic = loadImage('img/magnet.png')
}
function setup() {
    canvas = new Canvas(windowWidth, windowHeight)
    canvas.origin.style('z-index', '-10')
    canvas.origin.doubleClicked(createElm) 

    ground = new Ground()
    Engine.run(engine)

    createMouseConstraint()   
    
    createChain()
}

function keyPressed() {
    console.log('key', keyCode)
    switch(keyCode) {
        case LEFT_ARROW: console.log('left'); break
        case RIGHT_ARROW: console.log('right'); break
        case DOWN_ARROW: console.log('down'); break
        case UP_ARROW: console.log('up'); break
    }
}

function draw() {
    background(100)
    boxes = boxes.filter((boxy, i) => {
        if (!boxy.isOffscreen()) {
            boxy.show()
            return true
        } else {
            boxy.remove()
            // boxes.spilce(i, 1)
            cards[i].unhook()
            cards.splice(i, 1)
        }
    })
    cards.forEach((card, i) => card.move(i))

    chain.forEach(el => el.show())

    // console.log('ang', constraints[0])

    constraints.forEach((el, i) => {
        if (el.label && el.label == 'link') {
            // console.log('el xA', el.bodyA.position.x + el.pointA.x + (el.bodyB.position.x + el.pointB.x + 2.5 - el.bodyA.position.x + el.pointA.x - 2.5 / 2))
            // if (i = 2) console.log('ely ', el.bodyA.position.y + el.pointA.y + ((el.bodyB.position.y + el.pointB.y - el.bodyA.position.y + el.pointA.y) / 2)  )

            // let linkCenterVector = createVector(
            //     el.bodyA.position.x + el.pointA.x + ((el.bodyB.position.x + el.pointB.x + 2.5 - el.bodyA.position.x + el.pointA.x - 2.5) / 2),
            //     el.bodyA.position.y + el.pointA.y + ((el.bodyB.position.y + el.pointB.y - el.bodyA.position.y + el.pointA.y) / 2) -20
            // )

            // if (i == 1) {
            //     console.log('anka', el.bodyB.position.x + el.pointB.x - el.bodyA.position.x + el.pointA.x)
            //     console.log('hypo', el.length)
            //     console.log('cosA', el.bodyB.position.x + el.pointB.x - el.bodyA.position.x + el.pointA.x / el.length)
            //     console.log('degA', atan(el.bodyB.position.x + el.pointB.x - el.bodyA.position.x + el.pointA.x / el.length))
            // }

            let atano = atan((el.bodyB.position.x + el.pointB.x - el.bodyA.position.x + el.pointA.x) / el.length)
            let linkCenter = createVector(
                (el.bodyA.position.x + el.pointA.x - 2.5 + el.bodyB.position.x + el.pointB.x + 2.5) / 2,
                (el.bodyA.position.y + el.pointA.y + el.bodyB.position.y + el.pointB.y) / 2
            )

            push()
            // rectMode(CORNERS)
            // rect(
            //     el.bodyA.position.x + el.pointA.x - 2.5, 
            //     el.bodyA.position.y + el.pointA.y,
            //     el.bodyB.position.x + el.pointB.x + 2.5, 
            //     el.bodyB.position.y + el.pointB.y
            // )

            translate(linkCenter.x, linkCenter.y)
            // rectMode(CENTER)
            // rotate(atano * -1)
            // rect(0, 0, 5, 49)

            imageMode(CENTER)
            rotate(atano * -1)
            image(chainLinkTwo, 0, 0, 5, 49)
            pop()
        }
    })

    //console.log('cards & boxes', cards.length, boxes.length, 'bodies', world.bodies.length)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

//////////////////////////////////////////// actions
function createElm(){
    boxes.push(new Box(mouseX, mouseY, 250, 300))
    cards.push(new Card(mouseX, mouseY, 250, 300))
    // magnets.push(new Magnet(mouseX, mouseY))
}

function createChain() {
    let chainOrigin = {x: windowWidth / 2, y: windowHeight / 6 * -1}
    let prev = {el: null, dist: null}
    for (let i = 4; i >= 0; i--) {
        //console.log('prev', prev)
        let option = !prev.el ? {mass: 3, isStatic: true, friction: 0.1, restitution: 0} : {mass: 3, friction: 0.3, restitution: 0}
        let parti, opt, xA, yA, xB, yB, len;
        if (i > 0) {
            parti = new Particle(chainOrigin.x + prev.dist, chainOrigin.y + prev.dist, 20, 49, option) 
            xA = 0
            yA = 21
            xB = 0
            yB = -21
            len = 49
            console.log('parti', parti)
        } else {
            option.mass = 20
            option.density = 0.5
            parti = new Magnet(chainOrigin.x + 100 + prev.dist, chainOrigin.y + prev.dist, 208, 75, option ) 
            xA = 0
            yA = 21
            xB = 0
            yB = -38
            len = 40
        }
        if (prev.el) {
            opt = {
                bodyA: prev.el.body,
                pointA: {x: xA, y: yA},
                bodyB: parti.body,
                pointB: {x: xB, y: yB},
                stiffness: 1,
                length: len,
                label: 'link'
            }
            let constraint = Constraint.create(opt)
            World.add(world, constraint)
            constraints.push(constraint)
        }
        chain.push(parti)
        prev.dist += 52
        prev.el = parti
    }
}

function lockBox(bodyA, bodyB) {
    let constraint = Constraint.create({
        bodyA: bodyA,
        bodyB: bodyB,
        stiffness: 0.4
    })
    World.add(world, constraint)
    chain[chain.length - 1].isLocked = true
    constraints.push(constraint)
}

function createMouseConstraint() {
    mouse = Mouse.create(canvas.origin.elt)
    mouse.pixelRatio = pixelDensity()
    mouConst = MouseConstraint.create(engine, {mouse: mouse})
    World.add(world, mouConst)

    Events.on(mouConst, 'startdrag', function(e) {
        currDrag = e.body
        if (constraints.length > 5) {
            constraints.forEach((el, i) => {
                if (currDrag.id == el.bodyA.id || currDrag.id == el.bodyB.id && el.body.label != 'link') startCheckRip(el, i)
                // console.log('el', el)
            })
        }
    })
    Events.on(mouConst, 'enddrag', function(e) {
        currDrag = null
        endCheckRip()
    })
}   

function startCheckRip(el, i) {
    ripperTimer = setInterval(() => {
        if (currDrag && currDrag.speed > 40) {
            World.remove(world, el)
            constraints.splice(i, 1)
            console.log('interval', el, currDrag.speed)
        }
    }, 100);
}

function endCheckRip() {
    clearInterval(ripperTimer)
}

//////////////////////////////////////////// element classes
class Canvas {
    constructor(w, h) {
        this.origin = createCanvas(w, h)        
        this.w = w
        this.h = h
    }
    tellCanvasArea() {
        console.log('cavas is' + this.w + ' x ' + this.h)
    }
}

class Particle {
    constructor(x, y, w, h, option){
        this.body = Bodies.rectangle(x, y, w, h, option)
        this.pos = this.body.position
        this.w = w
        this.h = h
        World.add(world, this.body);
    }

    show() {
        let angle = this.body.angle
        let pos = this.body.position
        this.pos = pos
        this.pos.angle = angle

        push()
        translate(pos.x, pos.y)
        //ellipse(0, 0, this.r * 2)
        // rectMode(CENTER)
        // rect(0, 0, this.w, this.h)
        rotate(angle)
        imageMode(CENTER)
        image(chainLink, 0, 0, 25, 60)
        pop()
    }

    isOffscreen() {
        return this.body.position.y > height + 100
    }

    remove() {
        World.remove(world, this.body)
    }
}

class Ground {
    constructor() {
        this.ground = Bodies.rectangle(0, height, window.innerWidth *2, 2, {isStatic: true})
        World.add(world, this.ground)
    }
}


class Card {
    constructor(x, y, w, h) {
        this.origin = createDiv(`
            <img src="img/DemoCard.png" class="card-img-top" alt="project logo img">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
        `)
            .class('card my-card')
            .position(x, y)
            .style('z-index', '10')
        this.w = w
        this.h = h

        this.mDown = this.origin.elt.addEventListener('mousedown', this.handleEvt)
        this.mMove = this.origin.elt.addEventListener('mousemove', this.handleEvt)
        this.mUp = this.origin.elt.addEventListener('mouseup', this.handleEvt)
        
    }
    move(i) { 
        this.origin.position(boxes[i].pos.x - this.w / 2, boxes[i].pos.y - this.h / 2)
        this.origin.style('transform', `rotate(${boxes[i].pos.angle}rad)`)
    }
    handleEvt(e) {
        // console.log('e', e)
        if (!Array.prototype.slice.call(e.target.classList).includes('btn')) {
            let eventCopy = new MouseEvent(e.type, {
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                view: e.view || null,
                detail: e.detail || null,
                pageX: e.pageX || null,
                pageY:e.pageY || null,
                layerY: e.layerY || null,
                clientX: e.clientX || null,
                clientY: e.clientY || null,
                ctrlKey: e.ctrlKey || null,
                altKey: e.altKey || null,
                shiftKey: e.shiftKey || null,
                metaKey: e.metaKey || null,
                button: e.button || null,
                relatedTarget: e.relatedTarget || null
            })  
            canvas.origin.elt.dispatchEvent(eventCopy)
        } 
    }
    unhook() {
        this.origin.elt.removeEventListener('mousedown', this.mDown)
        this.origin.elt.removeEventListener('mousemove', this.mMove)
        this.origin.elt.removeEventListener('mouseup', this.mUp)
    }
}

class Box {
    constructor(x, y, w, h){
        this.body = Bodies.rectangle(x, y, w, h, {
            friction: 0.8,
            restitution: 0.7
        });
        this.pos = this.body.position
        this.w = w
        this.h = h
        World.add(engine.world, this.body);
    }

    show() {
        let angle = this.body.angle
        let pos = this.body.position
        this.pos = pos
        this.pos.angle = angle

        push()
        translate(pos.x, pos.y)
        rectMode(CENTER)
        rotate(angle)
        rect(0, 0, this.w, this.h)
        pop()
    }

    isOffscreen() {
        return this.body.position.y > height + 100
    }

    remove() {
        World.remove(world, this.body)
    }
}

class Magnet {
    constructor(x, y, w, h, option) {
    //     this.points = setPathData(MAGNET_PATH)
    //     console.log('points', this.points)
    //     this.body = Bodies.fromVertices(x, y, Vertices.scale(this.points, 0.5, 0.5))
        this.body = Bodies.rectangle(x, y, w, h, option)
        this.pos = this.body.position
        this.w = w
        this.h = h
        World.add(world, this.body)
    }

    show() {
        let angle = this.body.angle
        let pos = this.body.position
        this.pos = pos
        this.pos.angle = angle

        push()
        translate(pos.x, pos.y)
        // rectMode(CENTER)
        // rect(0, 0, this.w, this.h)
        imageMode(CENTER)
        rotate(angle)
        imageMode(CENTER)
        image(magnetPic, 0, 0, 208, 75)

        // beginShape()
        // this.points.forEach(el => vertex(el.x, el.y))
        // endShape()
        pop()
    }

    isOffscreen() {
        return this.body.position.y > height + 100
    }

    remove() {
        World.remove(world, this.body)
    }
}

// function setPathData(pathData) {
//     let parts = pathData && pathData.match(/[mlhvcsqtaz][^mlhvcsqtaz]*/ig),
//         coords;
//     let array = [];
  
//     for (let i = 0, l = parts && parts.length; i < l; i++) {
//       coords = parts[i].match(/[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g);
  
//       for (let j = 0; j < coords.length; j+=2) {
//         array.push({
//           x: +coords[j],
//           y: +coords[j + 1]
//         })
//       }
//     }
  
//     return array;
//   }
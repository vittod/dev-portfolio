// wait until libs are loaded and gneral setup
window.addEventListener('load', function() {
    preload()
    setup();
    draw()
    createChain()

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
const Constraint = Matter.Constraint
const MouseConstraint = Matter.MouseConstraint
const Mouse = Matter.Mouse
const Collisions = Matter.SAT
const Events = Matter.Events

//////////////////////////////////////////// engine & world
const engine = Engine.create();
const world = engine.world
//////////////////////////////////////////// app namespace
let canvas, particle, globalPos, mouConst, mouse, currDrag, ripperTimer, chainLink,
    colliCount = 0,
    buttons = [],
    cards = [],
    boxes = [],
    chain = [],
    constraints = [];

//////////////////////////////////////////// app setup & draw loop
function preload() {
    chainLink = loadImage('img/chain-link.png')
}
function setup() {
    canvas = new Canvas(windowWidth, windowHeight)
    canvas.origin.style('z-index', '-10')
    canvas.origin.doubleClicked(createElm) 

    ground = new Ground()
    Engine.run(engine)
    

    // createElm()
    
    createMouseConstraint()    
    
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

    // if (boxes.length > 0 && chain.length > 0) {
    //     // console.log('coll', Collisions.collides(chain[9].body, boxes[0].body).collided)
    //     console.log('force', boxes[0].body)
    // }

    // if (constraints.length > 0) {
    //     console.log('const', constraints[0])
    // }

    // if (currDrag) console.log('dr', currDrag.speed)
    


    //console.log('cards & boxes', cards.length, boxes.length, 'bodies', world.bodies.length)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

//////////////////////////////////////////// actions
function createElm(){
    boxes.push(new Box(mouseX, mouseY, 250, 300))
    cards.push(new Card(mouseX, mouseY, 250, 300))
}

function createChain() {
    let prev = {el: null, dist: null}
    for (let i = 0; i < 10; i++) {
        //console.log('prev', prev)
        let option = !prev.el ? {isStatic: true, friction: 0.1, restitution: 0.7} : {friction: 0.1, restitution: 0.7}
        //console.log('opt', option)
        let parti = new Particle(100 + prev.dist, 50, 10, option)
        if (prev.el) {
            let opt = {
                bodyA: prev.el.body,
                bodyB: parti.body,
                stiffness: 0.4,
                length: 20
            }
            let constraint = Constraint.create(opt)
            World.add(world, constraint)
        }
        chain.push(parti)
        prev.dist += 50
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
        if (constraints.length > 0) {
            constraints.forEach((el, i) => {
                if (currDrag.id == el.bodyA.id || currDrag.id == el.bodyB.id) startCheckRip(el, i)
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
    constructor(x, y, r, option){
        this.body = Bodies.circle(x, y, r, option)
        this.pos = this.body.position
        this.r = r
        World.add(world, this.body);
    }

    show() {
        let angle = this.body.angle
        let pos = this.body.position
        this.pos = pos
        this.pos.angle = angle

        push()
        translate(pos.x, pos.y)
        // rectMode(CENTER)
        //rotate(angle)
        // FileList(150)
        //ellipse(0, 0, this.r * 2)
        imageMode(CENTER)
        image(chainLink, 0, 0, 75, 208)
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
        this.ground = Bodies.rectangle(0, height, window.innerWidth *2, 10, {isStatic: true})
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
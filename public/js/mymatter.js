'use strict';

const worker = new Worker('js/matterWorker.js');
worker.addEventListener('message', (evt) => console.log(evt));
worker.postMessage(window);

// wait until libs are loaded and general setup
window.addEventListener('load', function () {
  // preload()
  // setup();
  // draw()

  fetch('/api/projects.json').then(async (resp) => {
    const data = await resp.json();
    projects = data.projects;
    console.log(projects);
  });
});

//////////////////////////////////////////// require projects

//////////////////////////////////////////// module aliases
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Constraint = Matter.Constraint;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
const Collisions = Matter.SAT;
const Events = Matter.Events;
// const Vertices = Matter.Vertices
// const Svg = Matter.Svg

//////////////////////////////////////////// const
const engine = Engine.create();
const world = engine.world;
const navBar = $('#collapse-nav');
//////////////////////////////////////////// app namespace
let canvas,
  particle,
  globalPos,
  mouConst,
  mouse,
  currDrag,
  ripperTimer,
  chainLink,
  chainLinkTwo,
  magnet,
  magnetPic,
  projects,
  colliCount = 0,
  buttons = [],
  cards = [],
  boxes = [],
  chain = [],
  constraints = [],
  magnets = [],
  gameIsVisible = false;

//////////////////////////////////////////// app setup
function preload() {
  chainLink = loadImage('img/chain-link.png');
  chainLinkTwo = loadImage('img/chain-link_2.png');
  magnetPic = loadImage('img/magnet.png');
}
function setup() {
  canvas = new Canvas(windowWidth, windowHeight);
  canvas.origin.id('main-game');
  canvas.origin.style('z-index', '5');
  canvas.origin.doubleClicked(createElm);

  new Ground();
  Engine.run(engine);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//////////////////////////////////////////// events

// function keyPressed(e) {
//     console.log('key', keyCode, e.key)
//     switch(e.key) {
//         case 'Escape': toggleGameView();  break
//     }
// }

function toggleGameView() {
  if (!gameIsVisible) {
    canvas.origin.addClass('show-game');
    navBar.removeClass('translate-up');
    ////
    //   WARNING: unhook event when leaving the view
    ////
    // hookUpCollisionEvents()
    createMouseConstraint();
    createChain();
    popProjects();
  } else {
    canvas.origin.removeClass('show-game');
    boxes.forEach((el) => el.remove());
    boxes = [];
    cards.forEach((el) => {
      el.unhook();
      el.origin.remove();
    });
    cards = [];
    navBar.addClass('translate-up');
  }
  gameIsVisible = !gameIsVisible;
}

function moveLeft() {
  if (chain[0].body.position.x > 50) {
    Body.setVelocity(chain[0].body, { x: -10, y: 0 });
    Body.setPosition(chain[0].body, { x: chain[0].body.position.x - 5, y: chain[0].body.position.y });
  }
}
function moveRight() {
  if (chain[0].body.position.x < windowWidth - 50) {
    // Body.setVelocity(chain[0].body, {x: -10, y: 0})
    Body.setPosition(chain[0].body, { x: chain[0].body.position.x + 5, y: chain[0].body.position.y });
  }
}
function moveDown() {
  if (chain[0].body.position.y < -25) {
    // Body.setVelocity(chain[0].body, {x: -10, y: 0})
    Body.setPosition(chain[0].body, { x: chain[0].body.position.x, y: chain[0].body.position.y + 5 });
  }
}
function moveUp() {
  if (chain[0].body.position.y > chain.length * -80)
    // Body.setVelocity(chain[0].body, {x: -10, y: 0})
    Body.setPosition(chain[0].body, { x: chain[0].body.position.x, y: chain[0].body.position.y - 5 });
}

function hookUpCollisionEvents() {
  Events.on(engine, 'collisionActive', function (e) {
    pairs = e.pairs;
    console.log('contact pars', pairs);
  });
}

// function hookUpCollisionEvents() {
//     Events.on(engine, 'collisionActive', function(e) {
//         pairs = e.pairs
//         pairs.forEach((el) => {
//             if(boxes.length > 0 && !chain[chain.length - 1].isLocked) {
//                 if (el.bodyA.id == chain[chain.length - 1].body.id || el.bodyA == boxes[boxes.length - 1].body.id
//                 && el.bodyB.id == boxes[boxes.length - 1].body.id || el.bodyB == chain[chain.length - 1].body.id) {
//                     console.log('match', colliCount)
//                     colliCount += 1
//                     if (colliCount > 50) {
//                         lockBox(el.bodyA, el.bodyB)
//                     }
//                 }
//             }
//         })
//     })
// }

//////////////////////////////////////////// draw loop
function draw() {
  background(100, 100, 100);

  if (boxes.length > 0) {
    boxes = boxes.filter((boxy, i) => {
      if (!boxy.isOffscreen()) {
        boxy.show();
        return true;
      } else {
        boxy.remove();
        // boxes.spilce(i, 1)
        cards[i].unhook();
        cards.splice(i, 1);
      }
    });
  }

  if (cards.length > 0) {
    cards.forEach((card, i) => card.move(i));
  }

  if (chain.length > 0) {
    chain.forEach((el) => el.show());
  }

  if (constraints.length > 0) {
    constraints.forEach((el) => {
      if (el.label && el.label == 'link') {
        let atano = atan((el.bodyB.position.x + el.pointB.x - el.bodyA.position.x + el.pointA.x) / el.length);
        let linkCenter = createVector(
          (el.bodyA.position.x + el.pointA.x - 2.5 + el.bodyB.position.x + el.pointB.x + 2.5) / 2,
          (el.bodyA.position.y + el.pointA.y + el.bodyB.position.y + el.pointB.y) / 2
        );

        push();
        translate(linkCenter.x, linkCenter.y);
        imageMode(CENTER);
        rotate(atano * -1);
        image(chainLinkTwo, 0, 0, 5, 49);
        pop();
      }
    });
  }

  if (keyIsDown(LEFT_ARROW)) moveLeft();
  if (keyIsDown(RIGHT_ARROW)) moveRight();
  if (keyIsDown(DOWN_ARROW)) moveDown();
  if (keyIsDown(UP_ARROW)) moveUp();

  //console.log('cards & boxes', cards.length, boxes.length, 'bodies', world.bodies.length)
}

//////////////////////////////////////////// actions

function popProjects() {
  setTimeout(() => {
    if (cards.length < projects.length) {
      let x = Math.random() * windowWidth;
      let y = windowHeight * 0.2;
      createElm(x, y, projects[cards.length]);
      popProjects();
    }
  }, 2000);
}

function createElm(x, y, project) {
  boxes.push(new Box(x, y, 150, 200));
  cards.push(new Card(x, y, 150, 200, project));
}
// function createElm(x, y, project){
//     boxes.push(new Box(mouseX, mouseY, 150, 200))
//     cards.push(new Card(mouseX, mouseY, 150, 200, project))
// }

function createChain() {
  let chainOrigin = { x: windowWidth / 2, y: (windowHeight / 6) * -1 };
  let prev = { el: null, dist: null };
  for (let i = 12; i >= 0; i--) {
    //console.log('prev', prev)
    let option = !prev.el
      ? { mass: 3, isStatic: true, friction: 0.1, restitution: 0 }
      : { mass: 3, friction: 0.3, restitution: 0 };
    let parti, opt, xA, yA, xB, yB, len;
    if (i > 0) {
      parti = new Particle(chainOrigin.x + prev.dist, chainOrigin.y + prev.dist, 20, 49, option);
      xA = 0;
      yA = 21;
      xB = 0;
      yB = -21;
      len = 49;
      // console.log('parti', parti)
    } else {
      option.mass = 20;
      option.density = 0.5;
      parti = new Magnet(chainOrigin.x + 100 + prev.dist, chainOrigin.y + prev.dist, 208, 75, option);
      xA = 0;
      yA = 21;
      xB = 0;
      yB = -38;
      len = 40;
    }
    if (prev.el) {
      opt = {
        bodyA: prev.el.body,
        pointA: { x: xA, y: yA },
        bodyB: parti.body,
        pointB: { x: xB, y: yB },
        stiffness: 1,
        length: len,
        label: 'link',
      };
      let constraint = Constraint.create(opt);
      World.add(world, constraint);
      constraints.push(constraint);
    }
    chain.push(parti);
    prev.dist += 52;
    prev.el = parti;
  }
}

function lockBox(bodyA, bodyB) {
  let constraint = Constraint.create({
    bodyA: bodyA,
    bodyB: bodyB,
    stiffness: 0.4,
  });
  World.add(world, constraint);
  chain[chain.length - 1].isLocked = true;
  constraints.push(constraint);
}

function createMouseConstraint() {
  mouse = Mouse.create(canvas.origin.elt);
  mouse.pixelRatio = pixelDensity();
  mouConst = MouseConstraint.create(engine, { mouse: mouse });
  World.add(world, mouConst);

  // Events.on(mouConst, 'startdrag', function(e) {
  //     currDrag = e.body
  //     if (constraints.length > 5) {
  //         constraints.forEach((el, i) => {
  //             if (currDrag.id == el.bodyA.id || currDrag.id == el.bodyB.id && el.body.label != 'link') startCheckRip(el, i)
  //             // console.log('el', el)
  //         })
  //     }
  // })
  // Events.on(mouConst, 'enddrag', function(e) {
  //     currDrag = null
  //     endCheckRip()
  // })
}

// function startCheckRip(el, i) {
//     ripperTimer = setInterval(() => {
//         if (currDrag && currDrag.speed > 40) {
//             World.remove(world, el)
//             constraints.splice(i, 1)
//             // console.log('interval', el, currDrag.speed)
//         }
//     }, 100);
// }

// function endCheckRip() {
//     clearInterval(ripperTimer)
// }

//////////////////////////////////////////// element classes
class Canvas {
  constructor(w, h) {
    this.origin = createCanvas(w, h);
    this.w = w;
    this.h = h;
  }
  tellCanvasArea() {
    console.log('canvas is' + this.w + ' x ' + this.h);
  }
}

class Particle {
  constructor(x, y, w, h, option) {
    this.body = Bodies.rectangle(x, y, w, h, option);
    this.pos = this.body.position;
    this.w = w;
    this.h = h;
    World.add(world, this.body);
  }

  show() {
    let angle = this.body.angle;
    let pos = this.body.position;
    this.pos = pos;
    this.pos.angle = angle;

    push();
    translate(pos.x, pos.y);
    //ellipse(0, 0, this.r * 2)
    // rectMode(CENTER)
    // rect(0, 0, this.w, this.h)
    rotate(angle);
    imageMode(CENTER);
    image(chainLink, 0, 0, 25, 60);
    pop();
  }

  isOffscreen() {
    return this.body.position.y > height + 100;
  }

  remove() {
    World.remove(world, this.body);
  }
}

class Ground {
  constructor() {
    this.ground = Bodies.rectangle(0, height, window.innerWidth * 2, 2, { isStatic: true });
    World.add(world, this.ground);
  }
}

class Card {
  constructor(x, y, w, h, project) {
    this.origin = createDiv(`
            <img src="${project.img.thump}" class="card-img-top" alt="project logo img">
            <div class="card-body">
                <h5 class="card-title">${project.name}</h5>
                <p class="card-text">${project.category}</p>
                <div class="d-flex justify-content-end">
                    <button href="#" class="btn btn-outline-secondary btn-sm disabled"><i class="fas fa-info"></i></button>
                    <button href="#" class="btn btn-outline-danger btn-sm disabled"><i class="fas fa-eject"></i></button>
                </div>
            </div>
        `)
      .class('card my-card')
      .position(x, y)
      .style('z-index', '10');
    this.w = w;
    this.h = h;

    this.mDown = this.origin.elt.addEventListener('mousedown', this.handleEvt);
    this.mMove = this.origin.elt.addEventListener('mousemove', this.handleEvt);
    this.mUp = this.origin.elt.addEventListener('mouseup', this.handleEvt);
  }
  move(i) {
    this.origin.position(boxes[i].pos.x - this.w / 2, boxes[i].pos.y - this.h / 2);
    this.origin.style('transform', `rotate(${boxes[i].pos.angle}rad)`);
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
        pageY: e.pageY || null,
        layerY: e.layerY || null,
        clientX: e.clientX || null,
        clientY: e.clientY || null,
        ctrlKey: e.ctrlKey || null,
        altKey: e.altKey || null,
        shiftKey: e.shiftKey || null,
        metaKey: e.metaKey || null,
        button: e.button || null,
        relatedTarget: e.relatedTarget || null,
      });
      canvas.origin.elt.dispatchEvent(eventCopy);
    }
  }
  unhook() {
    this.origin.elt.removeEventListener('mousedown', this.mDown);
    this.origin.elt.removeEventListener('mousemove', this.mMove);
    this.origin.elt.removeEventListener('mouseup', this.mUp);
  }
}

class Box {
  constructor(x, y, w, h) {
    this.body = Bodies.rectangle(x, y, w, h, {
      friction: 0.8,
      restitution: 0.7,
    });
    this.pos = this.body.position;
    this.w = w;
    this.h = h;
    World.add(engine.world, this.body);
  }

  show() {
    let angle = this.body.angle;
    let pos = this.body.position;
    this.pos = pos;
    this.pos.angle = angle;

    push();
    translate(pos.x, pos.y);
    rectMode(CENTER);
    rotate(angle);
    rect(0, 0, this.w, this.h);
    pop();
  }

  isOffscreen() {
    return this.body.position.y > height + 100;
  }

  remove() {
    World.remove(world, this.body);
  }
}

class Magnet {
  constructor(x, y, w, h, option) {
    this.body = Bodies.rectangle(x, y, w, h, option);
    this.pos = this.body.position;
    this.w = w;
    this.h = h;
    World.add(world, this.body);
  }

  show() {
    let angle = this.body.angle;
    let pos = this.body.position;
    this.pos = pos;
    this.pos.angle = angle;

    push();
    translate(pos.x, pos.y);
    imageMode(CENTER);
    rotate(angle);
    imageMode(CENTER);
    image(magnetPic, 0, 0, 208, 75);
    pop();
  }

  isOffscreen() {
    return this.body.position.y > height + 100;
  }

  remove() {
    World.remove(world, this.body);
  }
}

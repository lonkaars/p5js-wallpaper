var maxDist = 500; // grootste afstand dat particles nog aangetrokken worden door de muiscursor in pixels
let particleCount = 0; // houdt het aantal particles bij, niet aanzitten
let particles = []; // de variabele die alle particles opslaat, ook niet aanzitten
let maxAcc; // variabele die de snelst mogelijke snelheid opslaat sqrt(width^2 + height^2), kun je niet veranderen dus probeer het niet
var maxLife = 300; // hoe lang te particles rondhangen in frames, wallpaper engine heeft een default van 30fps maar kan tot 60 gaan.
var TaskBarWidth = 32; // hoogte/breedte van taakbalk in pixels (mestal 40, 32, of 50 ofzo maar in ieder geval een even getal)
var MaxBlockWidth = 200; // max hoogte/breedte van de taakbalk highlighter
let currentTaskBarColor; // slaat de kleur op van de highlighter als GayMode aan staat
var GayMode = false; // jij varken
let TaskBarPos = 'left'; // left of bottom
let GayVal; // slaat de huidige kleur van alle particles op als GayMode aan staat
let GayBGVal; // slaat de huidige achtergrond kleur op als GayMode aan staat
let maxSplashsize = 300; // grootste grootte van de rimpelingen van de explosies
var startSubParticleSize = 50; // begingrootte van de vuurwerkballetjes
let splashes = []; // de variabele die alle splashes opslaat, nog steeds niet aanzitten
let splashCount = 0; // variabele die het aantal on-screen vuurwerkdingens opslaat, weer niet aanzitten
var gravityConstant = 0.5 // zwaartekrachtsconstante
var outsideThreshold = 50 // hoever de particles buiten de doos kunnen gaan bij bounce() in px
var bounceBackCoefficient = 0.5 // hoeveel kracht de particles overhouden na tegen de muur aanstoten.
var alwaysparticlesFrameCount = 5 // om de hoeveel frames er een random particle wordt gemaakt als de muis niet beweegt

// behavior vars
var gravity = false;
var interaction = true;
var showparticles = true;
var lines = true;
var debugmode = false;
var bouncy = false;
var destroyoffscreen = false;
var alwaysparticles = false;

class SubPlashParticle {
    constructor(x, y, f) {
        this.x = x
        this.y = y
        this.ox = x
        this.oy = y
        this.vx = Math.random() * (f * 2) - f
        this.vy = Math.random() * (f * 2) - f
        this.life = frameCount
        this.color = (GayMode == true) ? hslToRgb(random(0, 1), 0.5, 0.5) : random(100, 250)
    }
    move() {
        this.x = this.x + this.vx
        this.y = this.y + this.vy
        this.vx = this.vx / 1.03
        this.vy = this.vy / 1.03
    }
    draw(maxLife) {
        noStroke()
        fill(this.color)
        ellipse(this.x, this.y, map(constrain(dist(this.x, this.y, this.ox, this.oy) * 3, 0, maxDist), 0, maxDist, startSubParticleSize, 0) * map(constrain(frameCount - this.life, 0, maxLife), 0, maxLife, 1, 0))
    }
    gravity() {
        this.vy = this.vy + (gravityConstant / 2)
    }
}

class Splash {
    constructor(x, y) {
        this.maxLife = 60
        this.life = frameCount
        this.x = x
        this.y = y
        this.subParticleCount = 15
        this.subparticles = []
        this.circle = {
            "bornAt": frameCount,
            "currentSize": 0
        }
        this.expo = 1
    }
    getSubParticles() {
        for (let i = 0; i < this.subParticleCount; i++) {
            this.subparticles[i] = new SubPlashParticle(this.x, this.y, 6)
        }
    }
    drawSubParticles() {
        for (let i = 0; i < this.subParticleCount; i++) {
            this.subparticles[i].move()
            if (gravity) {
                this.subparticles[i].gravity()
            }
            this.subparticles[i].draw(this.maxLife)
        }
    }
    drawCircle() {
        if (frameCount - this.circle.bornAt <= this.maxLife) {
            noFill()
            stroke(255, 255, 255, map(frameCount - this.circle.bornAt, 0, this.maxLife, 255, 0) * 0.7)
            strokeWeight(1)

            this.expo = this.expo / 1.07
            ellipse(this.x, this.y, map(this.expo, 1, 0, 0, maxSplashsize))
        }
    }
    destroy(i) {
        if (frameCount - this.life >= this.maxLife) {
            this.subparticles = []
            splashCount--
            splashes.splice(i, 1)
        }
    }
}

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l;
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function setup() {
    mX = mouseX;
    mY = mouseY;
    createCanvas(windowWidth, windowHeight, P2D);
    maxAcc = Math.round(Math.sqrt(width ^ 2 + height ^ 2)) + 1
}

function mouseClicked() {
    tempSplash = new Splash(mouseX, mouseY)
    tempSplash.getSubParticles()
    splashes.push(tempSplash)
    splashCount++
    for (let i = 0; i < particleCount; i++) {
        particles[i].bomb()
    }
}

function draw() {
    noCursor();
    GayVal = hslToRgb((frameCount % 120) / 120, 0.5, 0.5)
    GayBGVal = hslToRgb(((frameCount + 180) % 120) / 120, 0.35, 0.07)
    if (GayMode == true) {
        background(GayBGVal[0], GayBGVal[1], GayBGVal[2]);
    } else {
        background(25);
    }

    if (mX != mouseX || mY != mouseY) {
        tempPart = new Particle(mouseX, mouseY, (mouseX - mX) * 0.8, (mouseY - mY) * 0.8)
        particles.push(tempPart)
        particleCount++
    } else {
        if (alwaysparticles) {
            if (frameCount % alwaysparticlesFrameCount == 0) {
                tempPart = new Particle(mouseX, mouseY, random(-3, 3), random(-3, 3))
                particles.push(tempPart)
                particleCount++
            }
        }
    }
    for (let i = 0; i < particleCount; i++) {
        particles[i].move()
        if (gravity) {
            particles[i].gravity()
        }
        if (interaction) {
            particles[i].interact(mX, mY)
        }
        if (showparticles) {
            particles[i].draw()
        }
        if (lines) {
            particles[i].line()
        }
        if (debugmode) {
            particles[i].debug(mX, mY)
        }
        if (bouncy) {
            particles[i].bounce(i)
        }
        if (destroyoffscreen) {
            particles[i].destroy(i)
        }
    }
    mX = mouseX
    mY = mouseY
    if (TaskBarPos == 'left') {
        if (mouseX >= 0 && mouseX <= TaskBarWidth) {
            noStroke()
            if (GayMode == true) {
                currentTaskBarColor = hslToRgb(map(mouseY, 0, height, 0, 1), 0.5, 0.5)
                fill(currentTaskBarColor[0], currentTaskBarColor[1], currentTaskBarColor[2], map(mouseX, 0, TaskBarWidth, 255, 0))
            } else {
                fill(255, 255, 255, map(mouseX, 0, TaskBarWidth, 255, 0))
            }
            rect(0, mouseY - map(mouseX, 0, TaskBarWidth, MaxBlockWidth / 2, 0), TaskBarWidth, map(mouseX, 0, TaskBarWidth, MaxBlockWidth, 0))
        }
    } else if (TaskBarPos == 'bottom') {
        if (mouseY >= height - TaskBarWidth && mouseY <= height) {
            noStroke()
            if (GayMode == true) {
                currentTaskBarColor = hslToRgb(map(mouseX, 0, width, 0, 1), 0.5, 0.5)
                fill(currentTaskBarColor[0], currentTaskBarColor[1], currentTaskBarColor[2], map(mouseY, height, height - TaskBarWidth, 255, 0))
            } else {
                fill(255, 255, 255, map(mouseY, height, height - TaskBarWidth, 255, 0))
            }
            rect(mouseX - map(mouseY, height - TaskBarWidth, height, 0, MaxBlockWidth / 2), height - TaskBarWidth, map(mouseY, height - TaskBarWidth, height, 0, MaxBlockWidth), TaskBarWidth)
            //rect(x, y, w, h)
        }
    }
    for (let i = 0; i < splashCount; i++) {
        splashes[i].drawCircle()
        if (showparticles) {
            splashes[i].drawSubParticles()
        }
        if (destroyoffscreen) {
            splashes[i].destroy()
        }
    }
}

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = frameCount;
        this.size = 10;
        this.xbo = 0;
        this.ybo = 0;
    }
    move() {
        this.x = this.x + this.vx
        this.y = this.y + this.vy
    }
    draw() {
        if (GayMode == true) {
            fill(GayVal[0], GayVal[1], GayVal[2], (map(frameCount - this.life, 0, maxLife, 255, 0)))
        } else {
            fill(255, 255, 255, (map(frameCount - this.life, 0, maxLife, 255, 0)))
        }
        this.size = (GayMode) ? 15 : 10
        noStroke()
        ellipse(this.x, this.y, this.size)
    }
    interact(mX, mY) {
        this.vx = this.vx + (((mouseX - mX) / 3) * (map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist), 0, maxDist, 1, 0) * 0.25)) * 0.98
        this.vy = this.vy + (((mouseY - mY) / 3) * (map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist), 0, maxDist, 1, 0) * 0.25)) * 0.98
    }
    destroy(i) {
        if (this.x >= width || this.y >= height || this.x <= 0 || this.y <= 0 || frameCount - this.life >= maxLife) {
            particles.splice(i, 1)
            particleCount--
        }
    }
    line() {
        if (dist(this.x, this.y, mouseX, mouseY) <= maxDist) {
            if (GayMode == true) {
                stroke(GayVal[0], GayVal[1], GayVal[2], map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist), 0, maxDist, 100, 0) * map(frameCount - this.life, 0, maxLife, 1, 0))
                strokeWeight(4)
            } else {
                stroke(255, 255, 255, map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist), 0, maxDist, 100, 0) * map(frameCount - this.life, 0, maxLife, 1, 0))
                strokeWeight(2)
            }
            line(mouseX, mouseY, this.x, this.y)
        }
    }
    debug(mX, mY) {
        stroke(255, 0, 0)
        strokeWeight(2)
        line(this.x, this.y, this.x + this.vx, this.y + this.vy)

        stroke(0, 255, 0)
        strokeWeight(4)
        line(mouseX, mouseY, mX, mY)

        stroke(0, 0, 255)
        strokeWeight(2)
        line(this.x, this.y, this.x + map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist), 0, maxDist, 1, 0), this.y)

        //console.log(`${this.vx}, ${this.vy}`)
    }
    bomb() {
        this.vx = this.vx + (((this.x - mouseX) * 0.2) * map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist / 2), 0, maxDist / 2, 1, 0))
        this.vy = this.vy + (((this.y - mouseY) * 0.2) * map(constrain(dist(this.x, this.y, mouseX, mouseY), 0, maxDist / 2), 0, maxDist / 2, 1, 0))
    }
    gravity() {
        this.vy = this.vy + gravityConstant
    }
    bounce(i) {
        /* if(this.x >= width + outsideThreshold || this.y >= height + outsideThreshold || this.x <= 0 - outsideThreshold || this.y <= 0 - outsideThreshold ){
            particles.splice(i, 1)
            particleCount--
        } */
        if (this.x >= width || this.x <= 0) {
            if (this.xbo == 0) {
                this.vx = this.vx * -bounceBackCoefficient
            } else if (this.xbo >= 1) {
                particles.splice(i, 1)
                particleCount--
            }
            this.xbo++
        }
        if (this.y >= height || this.y <= 0) {
            if (this.ybo == 0) {
                this.vy = this.vy * -bounceBackCoefficient
            } else if (this.ybo >= 1) {
                particles.splice(i, 1)
                particleCount--
            }
            this.ybo++
        }
        if (frameCount - this.life >= maxLife) {
            particles.splice(i, 1)
            particleCount--
        }
        this.xbo = 0;
        this.ybo = 0;
    }
}
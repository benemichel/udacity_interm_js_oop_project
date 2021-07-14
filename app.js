// Dino Constructor
function Dino(name, height, diet, weight, fact, where, when) {
    this.name = name;
    this.heightInches = height;
    this.diet = diet;
    this.weight = weight;
    this.fact = fact;
    this.where = where;
    this.when = when;
    this.facts = [];
}

Dino.prototype.createFacts = function (human) {
    this.facts = [];
    this.facts.push(this.compareDiet(human));
    this.facts.push(this.compareHeight(human));
    this.facts.push(this.compareWeight(human));
    this.facts.push(this.fact);
    this.facts.push(`Lived in ${this.where}`);
    this.facts.push(`Lived in ${this.when}`);
};

Dino.prototype.compareDiet = function (human) {
    return `Seems like you are on ${human.diet.toLowerCase() === this.diet ? 'the same' : 'a different'} diet`;
};

Dino.prototype.compareHeight = function (human) {
    if (human.heightInches != 0 || human.heightFeet != 0) {
        const humanHeightInches = human.heightFeet * 12 + human.heightInches;
        const factor = Math.round(this.heightInches / humanHeightInches);
        return factor <= 1 ? `I am ${factor} times taller than you` : "I am as tall as you";
    } else {
        return `I am probably taller than you`;
    }
};

Dino.prototype.compareWeight = function (human) {
    if (human.weight != 0) {
        const factor = Math.round(this.weight / human.weight);
        return `I am ${factor} bigger than you. Don't mess with me!`;
    } else {
        return `I am probably bigger than you. Don't mess with me!`;
    }
};

Dino.prototype.getRandomFact = function () {
    return this.facts[Math.floor(Math.random() * this.facts.length)];
};

Dino.prototype.createTile = function (human) {
    const newTile = document.createElement('div');
    newTile.classList.add('grid-item');
    const image = document.createElement('img');
    image.src = `./images/${this.name.toLowerCase()}.png`;
    const speciesP = this.createTextNode(human);
    newTile.appendChild(image);
    newTile.appendChild(speciesP);
    return newTile;
};

Dino.prototype.createTextNode = function (human) {
    const speciesP = document.createElement('p');
    this.createFacts(human);
    const species = document.createTextNode(`Species: ${this.name} Fact: ${this.getRandomFact()}`);
    speciesP.appendChild(species);
    return speciesP;
};

// Bird Constructor, Bird subclass of Dino
function Bird(name, height, diet, weight, fact, where, when) {
    Dino.call(this, name, height, diet, weight, fact, where, when);
}

Bird.prototype = new Dino();
Bird.prototype.createTextNode = function () {
    const speciesP = document.createElement('p');
    const species = document.createTextNode(`Species: ${this.name} Fact: ${this.fact}`);
    speciesP.appendChild(species);
    return speciesP;
};


// Fetch data from mock REST Api
const fetchDinos = async function () {
    let dinosData = [];
    await fetch('http://localhost:3000/dinos').then((res) => {
        dinosData = res.json();
    });
    return dinosData;
};


// Create Dino Objects
const createDinoObjects = async function () {
    const dinos = [];
    await fetchDinos().then((dinosData) => {
        dinosData.forEach((dino) => {
            if (dino.species !== 'Pigeon') {
                const newDino = new Dino(dino.species, dino.height, dino.diet, dino.weight, dino.fact, dino.when, dino.where);
                dinos.push(newDino);
            } else {
                const newBird = new Bird(dino.species, dino.height, dino.diet, dino.weight, dino.fact, dino.when, dino.where);
                dinos.push(newBird);
            }
        });
    });
    return dinos;
};

// Add tiles to DOM
function shuffleArray(array) {
    // source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const grid = document.getElementById('grid');

const appendTiles = function (dinos, human) {
    const tiles = [];
    dinos.forEach((dino) => {
        const dinoTile = dino.createTile(human);
        tiles.push(dinoTile);
    });

    shuffleArray(tiles);
    const humanTile = human.createTile();
    tiles.splice(4, 0, humanTile);

    tiles.forEach((tile) => {
        grid.appendChild(tile);
    });
};

const renderAllTiles = function () {
    // Use IIFE to get human data from form
    const human = (function createHumanFromFormData() {
        function Human() {
            this.name = document.getElementById('name').value;
            this.weight = document.getElementById('weight').value;
            this.heightFeet = Number(document.getElementById('feet').value);
            this.heightInches = Number(document.getElementById('inches').value);
            this.diet = document.getElementById('diet').value;

            this.createTile = function () {
                const newTile = document.createElement('div');
                newTile.classList.add('grid-item');
                const image = document.createElement('img');
                image.src = `./images/human.png`;

                const nameP = document.createElement('p');
                const text = document.createTextNode(this.name);
                nameP.appendChild(text);

                newTile.appendChild(image);
                newTile.appendChild(nameP);
                return newTile;
            };
        }
        return new Human();
    })();

    // Append tiles (dinos and human tile) to DOM
    let dinos = [];
    createDinoObjects().then(
        (dinosData) => {
            dinos = dinosData;
            appendTiles(dinos, human);
        }
    );
};

// Event listeners
const submitButton = document.getElementById('submit-btn');
submitButton.addEventListener('click', (() => {
        const form = document.getElementById("dino-compare");
        const backButton = document.getElementById('back-btn');
        return () => {
            form.hidden = true;
            backButton.style.display = 'block';
            renderAllTiles();
        }
    })()
);

const backButton = document.getElementById('back-btn');
backButton.addEventListener('click', (() => {
        const form = document.getElementById("dino-compare");
        const backButton = document.getElementById('back-btn');
        return () => {
            grid.innerHTML = '';
            form.hidden = false;
            backButton.style.display = 'none';
        }
    })()
);

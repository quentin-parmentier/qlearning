const WIDTH = 6;
const HEIGHT = 4;
const STATES = WIDTH * HEIGHT;
const jeu = '#jeu';
const START = 1;
const END = 6;
const BAD_STATES = [9,2,17]
const wProportion = 100/WIDTH
const hProportion = 100/HEIGHT
const size = wProportion/3;
const sizeh = hProportion/3;
const qTable = [];
let player;


const gamma = 0.99;
let epsilon = 1;
let learning_rate = 0.1;
const step_cost = -0.1;
const bad_cost = -1;
const recompense_fini = 1;


function createLvl(){
    for (let index = 1; index <= STATES; index++) {
        let toto = `<div class='case' id=${index}>`
        for (let zoro = 1; zoro <= 9; zoro++) {
            toto += `<div class='case_info' id='${index}_${zoro}'></div>`
        }
        toto += '</div>'
        $(jeu).append(toto)
    }

    $(`#${START}`).addClass('start')
    $(`#${END}`).addClass('maison')

    $('.case').css({'width':`calc(${wProportion}% - ${WIDTH}px)`,"heigth":`${hProportion}`})

    BAD_STATES.forEach(BAD_STATE => {
        $(`#${BAD_STATE}`).addClass('travaux')
    });
}

function createAgent(){
    player = new Player()
    player.display();
}

function initPoids(){
    for (let state = 1; state <= STATES; state++) {
        qTable[state] = [];
        for (let action = 0; action < 4; action++) {
            qTable[state][action] = 0;
            $(`#${state}_${action*2+2}`).append("0")
        }
    }
}

function calculNouveau(state,action,newstate){
    ancienPoids = qTable[state][action] * 1;
    actions_poids = qTable[newstate];
    recompense = calculRecompense(newstate);
    qTable[state][action] = (ancienPoids + learning_rate*(recompense + Math.max(...actions_poids) - ancienPoids)).toFixed(3)
    $(`#${state}_${action*2+2}`).text(qTable[state][action])
}

function calculRecompense(newstate){
    recompense = step_cost;
    //On le puni
    if(BAD_STATES.indexOf(newstate) !== -1) recompense -= 10
    //On récompense
    if(newstate == END) recompense += recompense_fini

    return recompense
}

class Player{

    constructor(){
        this.state = START;
    }

    display(){
        $("#player").remove()
        $(jeu).append(`<div id='player'> </div>`);
        this.refresh();
    }

    refresh(){
        let left = this.calculL();
        let top = this.calculT();

        $('#player').css({'width':`calc(${size}%*0.75 - 2px)`,'height':`calc(${size}% + 2px)`,'position':"absolute",'top':`calc(${top})`, 'left':`calc(${left})`})
    }

    calculL(){
        let deplacementL = wProportion * ((this.state-1)%WIDTH)*0.75;
        let lneg = (this.state-1)%WIDTH * 8;
        if(lneg == 0) lneg = 2
        return (`${size}*0.75% + ${deplacementL}% - ${lneg}px`)
    }

    calculT(){
        let deplacementH = hProportion * (Math.floor((this.state-1)/WIDTH));
        let tneg = (this.state-1)/WIDTH * 2;
        return (`${sizeh}% + ${deplacementH}% - ${tneg}px`)
    }

    deplacer(a){

        let oldState = this.state;

        switch (a) {
            case 0:
                this.haut();
                break;
            case 1:
                this.gauche()
                break;
            case 2:
                this.droite();
                break;
            case 3:
                this.bas();
                break;
        }

        calculNouveau(oldState,a,this.state);
        this.refresh();
    }

    gauche(){
        if((this.state)%WIDTH !== 1){
            //On peut aller à gauche
            this.state = this.state - 1;
        }
    }

    droite(){
        if((this.state)%WIDTH !== 0){
            //On peut aller à droite
            this.state = this.state + 1;
        }
    }

    haut(){
        let new_pos = this.state - WIDTH;
        this.state = new_pos > 0 ? new_pos : this.state;
    }

    bas(){
        let new_pos = this.state + WIDTH;
        this.state = new_pos <= STATES ? new_pos : this.state;
    }

    avance(epsilon,training){
        //On choisit si on random ou si on prend le plus opti (policy)
        let action = 0;
        if(Math.random() <= epsilon){
            action = Math.floor(Math.random()*4)
        }else{
            let lineTable = qTable[this.state]
            action = lineTable.indexOf(Math.max(...lineTable).toFixed(3).toString());
        }
        this.deplacer(action)

        if(this.state === END){
            if(training === 0) createAgent()
            else console.log("On est arrivé à la maison sans morts :)")
        }

    }
}

$(function() {
    createLvl();
    createAgent();
    initPoids();

    $('#haut').click(() => {
        player.deplacer(0);
    })

    $('#droite').click(() => {
        player.deplacer(2);
    })

    $('#bas').click(() => {
        player.deplacer(3);
    })

    $('#gauche').click(() => {
        player.deplacer(1);
    })

    $('#train').click(() => {
        
        for (let boucle = 0; boucle < 8; boucle++) {
            epsilon = 1
            for (let index = 0; index < 400; index++) {
                player.avance(epsilon,0);
                epsilon *= 0.999;
            }
        }
        createAgent()
    })

    $('#step').click(() => {
        player.avance(0,1);
    })
});

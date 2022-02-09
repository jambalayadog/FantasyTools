const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');

 console.log('javascript loaded')
 //useful links
 //https://www.hockey-reference.com/leagues/NHL_2021_games.html

var http = require('http');


// pages html
var loaded = false
var gameData
/*http.createElement('div')*/
// html string magic
var gameNumber = 1
var gameNumberMemory = 1
var htmlBase = "http://www.nhl.com"
var htmlPath = "/scores/htmlreports/20212022/ES02"
var htmlEnd = ".HTM"
var htmlString = ''
//buildHTMLString(gameNumber)
var filepath = 'Reports/HockeyReports/GameReports/'
var filetype = '.txt'
var filename = filepath + 'Game' + GameNumber(gameNumber) + filetype
// library
var games = []
var gameNumbers = []
var gameInvalid = false
var gameValid = false
var invalidGamesInARow = 0
var invalidGamesInARowMax = 50
var invalidGamesInARowLibrary = 0
var invalidGamesInARowLibraryMax = 50
var delay = 50
var savedGameLength = 0
var loopCounter = 0
var wroteAllFiles = false
var folderPath
var shouldFindGamesInCatalog = true
var shouldFindGamesOnline = true
var shouldWriteGamesToFolder = true
var gameNotInCatalog = false
//gameNumber = 325
var maxGameNumber = 1400
var loadingGames = true
var grabbingGames = true
var writingGames = true

var interval

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<div id="Demo">Hello World!</div>');
    start()
}).listen(8080);


function start() {
    console.log("start")
    if (typeof(interval) === 'undefined') {
        interval = setInterval(function(){ 
            coreLoop()
        }, delay);
    }
}

function buildHTMLString(gameNumber) {
    htmlString = htmlBase + htmlPath + GameNumber(gameNumber) + htmlEnd
    //console.log(htmlString)
}

function buildFolderPath(gameNumber) {
    //console.log('Build folder path: ', gameNumber)
    folderPath = 'Reports/HockeyReports/GameReports/Game' + GameNumber(gameNumber) + '.txt'
    //console.log(folderPath)
}

function GameNumber(gameNumber) {
    //console.log('Get Game Number', 'gameNumber: ', gameNumber, typeof(gameNumber))
    var gameNumberString = ''
    if (gameNumber < 10) {
        gameNumberString = '000' + gameNumber
    } else if (gameNumber < 100) {
        gameNumberString = '00' + gameNumber
    } else if (gameNumber < 1000) {
        gameNumberString = '0' + gameNumber
    } else {
        gameNumberString = gameNumber
    }
    //console.log(gameNumberString)
    return gameNumberString
}



function coreLoop() {
    //console.log('> loop: ', loopCounter)
    if (shouldFindGamesInCatalog) {
        if (loadingGames) {
            loadingGames = false
            console.log('Loading games from Folder.  Game #: ', gameNumber)
        }
        loadGamesFromFolder()
    } else if (shouldFindGamesOnline) {
        if (grabbingGames) {
            grabbingGames = false
            console.log('Grabbing games from Online.  Game #: ', gameNumber)
        }
        getGames()
    } else if (shouldWriteGamesToFolder) {
        if (writingGames) {
            writingGames = false
            console.log('writing games to folder')
        }
        writeGamesToFolder()
    } else {
        clearInterval(interval)
        interval = 'undefined'
        console.log("loopCounter = ", loopCounter)
    }
    loopCounter += 1;
}

//////////// WRITE TO FOLDER

function writeGamesToFolder() {
    if (!wroteAllFiles) {
        console.log('games: ', games.length)
        console.log('game Numbers: ', gameNumbers)
        writeGames()
        //clearInterval(interval)
        //interval = 'undefined'
    }
}

function writeGames(){
    for(i = 0; i < games.length; i++) {       
        filename = filepath + 'Game' + GameNumber(getGameNumberFromGame(games[i])) + filetype
        //console.log(filename)
        fs.writeFileSync(filename, games[i], function (err) {
            if (err) return console.log(err)
            console.log('File Saved?')
        })
    }
    wroteAllFiles = true
}

function getGameNumberFromGame(game) {
    //console.log(game)
    const dom = new JSDOM(game);
    const elements = dom.window.document.querySelectorAll('#GameInfo > tbody > tr > td')
    gameNumberString = elements[6].textContent
    gameNumberString = gameNumberString.replace(/\D/g,'');
    gameNumberStringNumber = Number(gameNumberString)
    //console.log(" Game Number: ", gameNumberStringNumber)
    return gameNumberStringNumber

}

///////// LOAD FROM FOLDER

function loadGamesFromFolder() {
    //console.log('Load Game From Folder: ', gameNumber)
    readGameFile(gameNumber)
    gameNumber = gameNumber + 1;
    if (gameNumber == maxGameNumber) {
        shouldFindGamesInCatalog = false
        gameNumber = gameNumber - 1
    }
    if (invalidGamesInARowLibrary >= invalidGamesInARowLibraryMax) {
        shouldFindGamesInCatalog = false
        gameNumber = gameNumberMemory
    }
}

function readGameFile(gameNumber) {
    //console.log('Read Game File: ', gameNumber)
    buildFolderPath(gameNumber)
    fs.readFile(folderPath,  "utf8", (err, data) => {
        if (err) {
            console.log('error getting game in folder')
            //shouldFindGamesInCatalog = false;
            invalidGamesInARowLibrary += 1
            if (invalidGamesInARowLibrary == 1) {
                gameNumberMemory = gameNumber
                console.log(gameNumberMemory)
            }          
        } else if (shouldFindGamesInCatalog) {
            console.log('Found game in folder: ', gameNumber, folderPath);
            gameNumbers.push(getGameNumberFromGame(data))
            games.push(data) 
            invalidGamesInARowLibrary = 0   
        }
    });
}

///////// LOAD FROM WEB

function getGames(){
    if ((invalidGamesInARow <= invalidGamesInARowMax)) {
        getPage(gameNumber)
        if (loaded) {
            //console.log('Game was loaded')
            if (gameValid) {           
                invalidGamesInARow = 0
                gameNumber += 1
                //console.log('Attempting to grab next: ', gameNumber)
            } else if (gameInvalid) {
                invalidGamesInARow += 1
                console.log('Invalid games in a row: ', invalidGamesInARow)
                gameNumber += 1
                //console.log('Attempting to grab next: ', gameNumber)
            }
            loaded = false
            gameInvalid = false
            gameValid = false
            if (gameNumber == maxGameNumber) {
                shouldFindGamesOnline = false
            }
        } else {
            //console.log('Not loaded.  Try again')
        }
    } else  {
        shouldFindGamesOnline = false
    }
}

function getPage(gameNumber){
    //console.log('Getting stats page for game: ', gameNumber)
    buildHTMLString(gameNumber)
    got(htmlString).then(response => {
        const dom = new JSDOM(response.body);
        //console.log(dom.window.document.querySelector('#GameInfo').innerHTML);
        const elements = dom.window.document.querySelectorAll('#GameInfo > tbody > tr > td')
        //elements.forEach(element => console.log('------- ', element.textContent))
        //console.log(elements[6].textContent)
        gameInfoString = elements[6].textContent
        gameInfoString = gameInfoString.replace(/\D/g,'');
        gameInfoStringNumber = Number(gameInfoString)
        //console.log('gameInfoStringNumber: ', gameInfoStringNumber, typeof(gameInfoStringNumber))
        if (gameInfoStringNumber == gameNumber) {
            //console.log('Games Length: ', games.length, ' gameNumber: ', gameNumber)
            if (!gameNumbers.includes(gameNumber)) {
                gameNumbers.push(gameNumber)
                games.push(response.body)
                gameValid = true
                console.log('Game Valid: ', gameNumber, gameInfoStringNumber, ' response updated')
            }
        } else if(gameInfoStringNumber == null) {
            gameInvalid = true
        } 
        loaded = true
    }).catch(err => {
        console.log(err);
        gameInvalid = true
        loaded = true
    });
}





function testGame(gameData) {
    const dom = new JSDOM('<!DOCTYPE html>' + gameData);
    console.log(dom.window.document.querySelector("table").innerHTML); // "Hello world"
    
}
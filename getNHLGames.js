
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
let options = {json: true}

 console.log('javascript loaded')
 //useful links
 //https://www.hockey-reference.com/leagues/NHL_2021_games.html

var http = require('http');


// pages html
/*http.createElement('div')*/
// html string magic
var gameNumber = 0
var maxGameNumber = 1312
var htmlBase = "http://www.nhl.com"
var htmlPath = "/scores/htmlreports/20212022/ES02"
var htmlEnd = ".HTM"
var htmlString = ''
//buildHTMLString(gameNumber)
var filepath = 'Reports/HockeyReports/GameReports/'
var filetype = '.txt'
var filename = filepath + 'Game' + stringifyGameNumber(gameNumber) + filetype
// library
var gameNumbers = []
var gameSummaryLibrary = []
var gamesPlayed = []
var todaysGames = []
var unplayedGameNumbers = []
var folderPath
var serverCreated = false

//'https://statsapi.web.nhl.com/api/v1/schedule?startDate=2022-01-12&endDate=2022-01-12'
var NHLAPI_schedule_base = 'https://statsapi.web.nhl.com/api/v1/schedule?startDate='
var NHLAPI_schedule_end = '&endDate='
var NHLAPI_schedule_URL
var todaysScheduleDate
var todaysGamesJSON
var loopCounter = 0
var gameNumberFromGamePk
//'https://statsapi.web.nhl.com/api/v1/game/2021020382/feed/live?site=en_nhl'
var NHLAPI_game_base = 'https://statsapi.web.nhl.com/api/v1/game/202102'
var NHLAPI_game_end = '/feed/live?site=en_nhl'
var NHLAPI_game_URL

http.createServer(function (req, res) {
    if (!serverCreated) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<div id="Demo">Hello World!</div>');
        start()
    }
    
}).listen(8080);

function addGameSummaryToLibrary(GameAPIData) {
    
    //breakAPIDataIntoVariablesForBelow()
    
    const gameSummaryObject = {
        gameSummaryDate: '',
        gameSummaryTime: '',
        gameSummaryGameNumber: '',
        gameSummaryHomeTeam: '',
        gameSummaryAwayTeam: '',
        gameSummaryHomeScore: '',
        gameSummaryAwayScore: '',
        gameSummaryAPILink: '',
        gameSummaryNHLStatsPage: '',
        gameSummaryStatus: ''
    }
    gameSummaryLibrary.push(gameSummaryObject)
}

////////////////// BUILD GAME SUMMARY LIBRARY
function buildGameSummaryLibrary() {
    gameNumber += 1
    NHLAPI_game_URL = buildGameURL(gameNumber)
    console.log(NHLAPI_game_URL)
}

function buildGameURL(gameNum) {
    return NHLAPI_game_URL = NHLAPI_game_base + stringifyGameNumber(gameNum) + NHLAPI_game_end
}

//https://statsapi.web.nhl.com/api/v1/game/2021020382/feed/live?site=en_nhl

///////////////////////////////////////////////////////////


////////////////// MAIN
function start() {
    serverCreated = true
    console.log("start")
    coreLoop()
}

function coreLoop() {
    getTodaysGames()  // fill todaysGames array with today's gameNumbers
    buildGameSummaryLibrary()
}
///////////////////////////////////////////////////////////

////////////////// GET TODAYS GAMES
function getTodaysGames() {
    todaysGames = []
    NHLAPI_schedule_URL = buildTodaysScheduleURL()
    console.log(NHLAPI_schedule_URL) 
    getJSONFromScheduleURL(NHLAPI_schedule_URL)
}

function buildTodaysScheduleURL() {
    todaysScheduleDate = new Date()
    todaysScheduleDateEST = new Date(todaysScheduleDate.getTime() - (todaysScheduleDate.getTimezoneOffset()*60*1000))  //PST is the base for North America since EST is BS
    console.log('Time EST: ', todaysScheduleDateEST)
    todaysScheduleDate = todaysScheduleDateEST.toISOString().substring(0,10);
    return NHLAPI_schedule_base + todaysScheduleDate + NHLAPI_schedule_end + todaysScheduleDate   
}

function getJSONFromScheduleURL(schedule_URL) {
    got(schedule_URL).then(response => {
        todaysGamesJSON = JSON.parse(response.body)
        getGameNumbersFromTodayGames(todaysGamesJSON)
    }).catch(err => {
        console.log(err.message)
    });
}

function getGameNumbersFromTodayGames(GamesJSON) {
    //console.log(GamesJSON)
    //console.log('total items: ', GamesJSON.totalItems)
    //console.log('dates: ', GamesJSON.dates)
    //console.log('games: ', GamesJSON.dates[0].games)
    for (var game in GamesJSON.dates[0].games) {
        //console.log('Game: ', game, ' -----', GamesJSON.dates[0].games[game])
        gameNumberFromGamePk = GamesJSON.dates[0].games[game].gamePk
        gameNumberFromGamePk = (gameNumberFromGamePk).toString().substring(6,10)
        todaysGames.push(gameNumberFromGamePk)
    }
    console.log('todays games: ', todaysGames)
}
///////////////////////////////////////////////////////////




function buildHTMLString(gameNumber) {
    htmlString = htmlBase + htmlPath + stringifyGameNumber(gameNumber) + htmlEnd
    //console.log(htmlString)
    return htmlString
}

function buildFolderPath(gameNumber) {
    //console.log('Build folder path: ', gameNumber)
    folderPath = 'Reports/HockeyReports/GameReports/Game' + stringifyGameNumber(gameNumber) + '.txt'
    //console.log(folderPath)
    return folderPath
}

function stringifyGameNumber(gameNumber) {
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

var gotResponseFromLibrary = false
var gameResultFoundInLibrary = false






//////////// WRITE TO FOLDER

function writeGameToFolder(gameNumber, gameData) {
    fpath = filepath + 'Game' + stringifyGameNumber(gameNumber) + filetype
    console.log('writing: ', fpath)
    fs.writeFileSync(fpath, gameData, (err) => {
        if (err) {
            console.log(err)
            coreLoop()
        }      
    })
    console.log('File Saved!')
    coreLoop()
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

function loadGameFromFolder() {
    //console.log('Load Game From Folder: ', gameNumber)
    readGameFile(gameNumber)
}

function readGameFile(gameNumber) {
    console.log('Try to find Game File in folder: ', gameNumber)
    fpath = buildFolderPath(gameNumber)
    fs.readFile(fpath,  "utf8", (err, data) => {
        if (err) {
            console.log("Error:  Not found in folder.  Time to go find Game# on web: ", gameNumber)
            //read game from web
            getGameFromWeb(gameNumber)
        } else {
            console.log('Success:  Found game in folder: ', gameNumber, fpath);
            gameNumbers.push(getGameNumberFromGame(data))
            //games.push(data) 
            invalidGamesInARowLibrary = 0
            gotResponseFromLibrary = true
            gameResultFoundInLibrary = true   
            coreLoop()
        }
    });
}

///////// LOAD FROM WEB
function getGameFromWeb(gameNumber) {
    console.log('Getting stats page for game from web: ', gameNumber)
    htmlURL = buildHTMLString(gameNumber)
    got(htmlURL).then(response => {
        const dom = new JSDOM(response.body);
        //console.log(dom.window.document.querySelector('#GameInfo').innerHTML);
        const elements = dom.window.document.querySelectorAll('#GameInfo > tbody > tr > td')
        //elements.forEach(element => console.log('------- ', element.textContent))
        //console.log(elements[6].textContent)
        /*gameInfoString = elements[6].textContent
        gameInfoString = gameInfoString.replace(/\D/g,'');
        gameInfoStringNumber = Number(gameInfoString)*/
        gameInfoStringNumber = getGameString(elements)
        if (gameInfoStringNumber == gameNumber) {
            if (!gameNumbers.includes(gameNumber)) {
                console.log('Game Valid: ', gameNumber, gameInfoStringNumber, ' response updated')
                gameNumbers.push(gameNumber)
                writeGameToFolder(gameNumber, response.body)
            }
        } else if(gameInfoStringNumber == null) {
            console.log('gameInfoStringNumber is NULL.  WEIRD')
        } 
    }).catch(err => {
        //console.log(err.message)
        console.log('Game not yet played: ', gameNumber)
        unplayedGameNumbers.push(gameNumber)
        coreLoop()
    });
}

function testGame(gameData) {
    const dom = new JSDOM('<!DOCTYPE html>' + gameData);
    console.log(dom.window.document.querySelector("table").innerHTML); // "Hello world"
    
}

function getGameString(elements) {
    var gameNumberInfoString = elements[6].textContent
    gameNumberInfoString = gameNumberInfoString.replace(/\D/g,'')
    return Number(gameNumberInfoString)
}
const fetch = require('cross-fetch');
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
let options = {json: true}

console.log('javascript loaded')
//useful links
//https://www.hockey-reference.com/leagues/NHL_2021_games.html

//https://www.quanthockey.com/
//https://moneypuck.com/index.html
//https://www.hockeydb.com/scoreboard/
//https://www.hockey-reference.com/
//https://www.hockey-reference.com/leagues/NHL_2023_games.html
//https://www.hockey-reference.com/leagues/NHL_2023_games.html#games

var http = require('http');


// pages html
/*http.createElement('div')*/
// html string magic
var gameNumber = 0
var maxGameNumber = 18 //82 * 16(*2)   1312
//'https://www.nhl.com/scores/htmlreports/20212022/ES020001.HTM'
var htmlBase = "http://www.nhl.com"
var htmlPath = "/scores/htmlreports/20222023/ES02"
var htmlEnd = ".HTM"
var htmlString = ''
//buildHTMLString(gameNumber)

//var filename = filepath + 'Game' + stringifyGameNumber(gameNumber) + filetype
// library
var gameNumbers = []
var gameSummaryLibrary = []
var gamesPlayed = []

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
//'https://statsapi.web.nhl.com/api/v1/game/2022020001/feed/live?site=en_nhl'
var NHLAPI_game_base = 'https://statsapi.web.nhl.com/api/v1/game/202202'
var NHLAPI_game_end = '/feed/live?site=en_nhl'
var NHLAPI_game_URL
//'Reports/HockeyReports/GameReports/Game0001.txt'
var filepath = 'Reports/HockeyReports/GameReports/Game'
var filetype = '.txt'
var filetypeJSON = '.json'
var LIBRARY_fpath
var libraryFile = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.txt'
var libraryFileJSON = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.json'
////////////////

/*
var date = new Date(); // Or the date you'd like converted.
var isoDateTimeEST = new Date(date.getTime() - (date.getTimezoneOffset() * 60000) + (180 * 60000)).toISOString();
var isoDateTimeNHLFormat = isoDateTimeEST.substring(0,19) + 'Z'
*/

function buildGameSummaryLibrary(gameSummaryData) {
    parsedJsonData = typeof(gameSummaryData) === 'string' ? JSON.parse(gameSummaryData) : gameSummaryData
    const summaryDate = new Date().toISOString().substring(0,19) + 'Z'
    const gameSummaryObject = {
        gameSummaryDate: parsedJsonData.gameData.datetime.dateTime,
        gameSummaryGameNumber: getGameNumberFromGamePk(parsedJsonData.gamePk),
        gameSummaryHomeTeam: parsedJsonData.gameData.teams.home.name,
        gameSummaryAwayTeam: parsedJsonData.gameData.teams.away.name,
        gameSummaryHomeTeamID: parsedJsonData.gameData.teams.home.id,
        gameSummaryAwayTeamID: parsedJsonData.gameData.teams.away.id,
        gameSummaryHomeScore: parsedJsonData.liveData.linescore.teams.home.goals,
        gameSummaryAwayScore: parsedJsonData.liveData.linescore.teams.away.goals,
        gameSummaryHomeShots: parsedJsonData.liveData.linescore.teams.home.shotsOnGoal,
        gameSummaryAwayShots: parsedJsonData.liveData.linescore.teams.away.shotsOnGoal,
        gameSummaryHomePowerPlays: parsedJsonData.liveData.boxscore.teams.home.teamStats.teamSkaterStats.powerPlayOpportunities,
        gameSummaryAwayPowerPlays: parsedJsonData.liveData.boxscore.teams.away.teamStats.teamSkaterStats.powerPlayOpportunities,
        gameSummaryHomePowerPlayGoals: parsedJsonData.liveData.boxscore.teams.home.teamStats.teamSkaterStats.powerPlayGoals,
        gameSummaryAwayPowerPlayGoals: parsedJsonData.liveData.boxscore.teams.away.teamStats.teamSkaterStats.powerPlayGoals,
        gameSummaryAPILink: parsedJsonData.link,
        gameSummaryNHLStatsPage: buildHTMLString(getGameNumberFromGamePk(parsedJsonData.gamePk)),
        gameSummaryStatus: parsedJsonData.gameData.status.detailedState,
        gameSummaryLastUpdated: summaryDate,
        gameSummaryPeriod: parsedJsonData.liveData.linescore.currentPeriodOrdinal,
        gameSummaryPeriodRemaining: parsedJsonData.liveData.linescore.currentPeriodTimeRemaining,
        gameSummaryWinningGoalie: typeof(parsedJsonData.liveData.decisions.winner) === 'undefined' ? '-' : parsedJsonData.liveData.decisions.winner.id,
        gameSummaryLosingGoalie: typeof(parsedJsonData.liveData.decisions.loser) === 'undefined' ? '-' : parsedJsonData.liveData.decisions.loser.id
    }
    //console.log('gameSummaryObject: ', gameSummaryObject)
    return gameSummaryObject
}

function writeGameSummaryToFile(gameLibrary, fileToUse) {
    //console.log(gameLibrary)
    //console.log(libraryPath)
    fs.writeFileSync(fileToUse, JSON.stringify(gameLibrary), (err) => {
        if (err) {
            console.log(err)
        }      
    })
    console.log('File Saved!')
}

function getGameNumberFromGamePk(gamePk) {
    gameNum = gamePk - 2022020000
    return gameNum
}

////////////////// BUILD GAME SUMMARY LIBRARY
async function getGameSummary(gameNumber) {
    LIBRARY_fpath = buildFolderPath(gameNumber)
    console.log('LIBRARY_fpath: ', LIBRARY_fpath)
    //let gameData = await readGameFile(LIBRARY_fpath)
    //console.log('gameData: ', gameData)
    //if (gameData === undefined) {           // need to also check if the file is valid
        //look the game up on the web
    NHLAPI_game_URL = buildGameURL(gameNumber)
    console.log('NHLAPI_game_URL: ', NHLAPI_game_URL)
    let response = await fetch(NHLAPI_game_URL);
    gameData = await response.json();
        //console.log(gameNumber, ' --- ', gameData, typeof(gameData))
    writeGameToFolder(LIBRARY_fpath, JSON.stringify(gameData))
    //}
    console.log('Game data type: ', typeof(gameData), gameNumber)
    return gameData
}

function buildGameURL(gameNum) {
    return NHLAPI_game_URL = NHLAPI_game_base + stringifyGameNumber(gameNum) + NHLAPI_game_end
}

//https://statsapi.web.nhl.com/api/v1/game/2021020382/feed/live?site=en_nhl

///////////////////////////////////////////////////////////

//CheckLibraryStatus()

/////////// CHECK THE LIBRARY STATUS
function CheckLibraryStatus() {
    try {
        if (fs.existsSync(libraryFile)) {
            //file exists.  we can use it as a base to determine next actions
            console.log('Found.  No need to build the library.')
            ValidateGameSummaryLibrary()
        } else {
            //file does not exist.  build the library from scratch.
            console.log('Not found.  Build the Library')
            BuildGameSummaryLibraryFromScratch()
        }
    } catch(err) {
        console.log(err)
    }
}

//UpdateLibrary()

function UpdateLibrary() {
    for (i = 1; i <= maxGameNumber; i++) {
        console.log('gameNumber')
    }
}

// EVERY DAY REBUILD THE LIBRARY
//buildLibrary()

async function buildLibrary() {
    for (i = 1; i <= maxGameNumber; i++) {
        let gameSummary = await getGameSummary(i)
        // debug - log the details
        // console.log(i, ' Got game Summary')
        // add game summary to our game summary library
        gameSummaryLibrary.push(buildGameSummaryLibrary(gameSummary))
    }
    writeGameSummaryToFile(gameSummaryLibrary, libraryFileJSON)
}

const season_start_date = new Date("2022-10-01")
const season_end_date = new Date("2022-04-13")
const first_monday_date = new Date("2022-10-03")
const todays_date = new Date()
const teams = 32
const ms_in_a_day = 86400000
//const days = (season_start_date - season_end_date) / ms_in_a_day
const days = 12
console.log(`days long: ${days}, ${season_start_date}`)

var schedule = []
var gameday = {}
var gameinfo = {}
var teams_array = ['ANA', 'ARI', 'BOS', 'BUF', 'CGY', 'CAR', 'CHI', 'COL',
                    'CBJ', 'DAL', 'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL',
                    'NSH', 'NJD', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SJS',
                    'SEA', 'STL', 'TBL', 'TOR', 'VAN', 'VGK', 'WSH', 'WPG',]

//getSchedule()
getSchedule()

async function getSchedule() {
    // get our game summary data
    const gameSummaryFilePath = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.json'
    const scheduleFilePath = 'Reports/HockeyReports/GameReports/01_NHLScheduleByTeam.json'
    let gameSummary = await readGameSummaryLibraryFile(gameSummaryFilePath)
    //console.log(`data: ${gameSummary}`)
    jsonGameSummary = JSON.parse(gameSummary)
    
    // sort the league schedule
    leagueSchedule = sortScheduleByTeam(jsonGameSummary)
    console.log(leagueSchedule)
    writeGameToFolder(scheduleFilePath, JSON.stringify(leagueSchedule))
    
    //sortGamesByDay(jsonGameSummary)
}

function sortScheduleByTeam(jsonGameSummary){
    var leagueSchedule = {} 
    for (team_index = 0; team_index < teams; team_index++) {
        // create a team schedule object
        teamSchedule = {}
        for (var summary in jsonGameSummary) {
            var hometeamabbrev = jsonGameSummary[summary].gameSummaryHomeTeamShort
            var awayteamabbrev = jsonGameSummary[summary].gameSummaryAwayTeamShort
            var gameplaydate = new Date(jsonGameSummary[summary].gameSummaryDate).toDateString()
            var hometeamscore = jsonGameSummary[summary].gameSummaryHomeScore
            var awayteamscore = jsonGameSummary[summary].gameSummaryAwayScore
            var goals_for = 0
            var goals_against = 0
            if ([hometeamabbrev,awayteamabbrev].includes(teams_array[team_index])) {
                // create a game object
                gameInfo = {} 
                //console.log(`found a game for ${hometeamabbrev}, ${awayteamabbrev} on ${gameplaydate}`)
                gameInfo.hometeam = hometeamabbrev
                gameInfo.awayteam = awayteamabbrev
                gameInfo.gamedate = gameplaydate
                gameInfo.gamenumber = jsonGameSummary[summary].gameSummaryGameNumber
                gameInfo.result = jsonGameSummary[summary].gameSummaryDetailedState
                gameInfo.periodResult = jsonGameSummary[summary].gameSummaryPeriod   // 1 2 3 and 4 (OT) and 5 (SO)
                var team_result = ""
                if (gameInfo.result == "Final") {
                    if (teams_array[team_index] == hometeamabbrev) {
                        if (hometeamscore > awayteamscore) {
                            team_result = "W " + hometeamscore + '-' + awayteamscore
                        } else {
                            team_result = "L " + awayteamscore + '-' + hometeamscore
                        }
                        goals_for = hometeamscore
                        goals_against = awayteamscore
                    } else if (teams_array[team_index] == awayteamabbrev) {
                        if (awayteamscore> hometeamscore) {
                            team_result = "W " + awayteamscore + '-' + hometeamscore
                        } else {
                            team_result = "L " + hometeamscore + '-' + awayteamscore
                        }
                        goals_for = awayteamscore
                        goals_against = hometeamscore
                    }
                }
                gameInfo.scoreResult = team_result.substring(2)
                gameInfo.teamResult = team_result.substring(0,1)
                gameInfo.goalsFor = goals_for
                gameInfo.goalsAgainst = goals_against
                //console.log(gameInfo)
                teamSchedule[gameplaydate] = gameInfo
            }
        }
        //console.log(teamSchedule)
        leagueSchedule[teams_array[team_index]] = teamSchedule
    }
    return leagueSchedule
}

function sortGamesByDay(jsonGameSummary) {
    for (i=0; i < days; i++) {
        //get today's date string
        var todays_date = new Date(season_start_date)
        todays_date.setDate(todays_date.getDate() + i)
        console.log(`${i}, ${days}, ${todays_date.toDateString()}`)
        // set today's game count to zero
        var gameCount = 0
        // go through each team
        for (team_index = 0; team_index < teams; team_index++) {
            gameFound = false    
            for (var summary in jsonGameSummary) {
                if (new Date(jsonGameSummary[summary].gameSummaryDate).toDateString() == todays_date.toDateString()) {
                    if (teams_array[team_index] == jsonGameSummary[summary].gameSummaryHomeTeamShort) {
                        console.log(`team: ${teams_array[team_index]} vs ${jsonGameSummary[summary].gameSummaryAwayTeam}`)
                        gameCount += 1
                        gameFound = true
                    }
                    if (teams_array[team_index] == jsonGameSummary[summary].gameSummaryAwayTeamShort) {
                        console.log(`team: ${teams_array[team_index]} at ${jsonGameSummary[summary].gameSummaryHomeTeam}`)
                        gameCount += 1
                        gameFound = true    
                    } 
                }
            }
            if (gameFound == false) {
                console.log(`team: ${teams_array[team_index]} - no game today`)
            }
        }
        console.log(`Game count for the day: ${gameCount/2}`)
    }
}


async function getGameSchedule() {
    const NHLSchedule_URL = 'https://www.hockey-reference.com/leagues/NHL_2023_games.html'
    let response = await fetch(NHLSchedule_URL);
    //rawSchedule = await response.json();
    rawSchedule = await response.text()
    console.log(rawSchedule)
}

/////////// VALIDATE THE LIBRARY.  THIS IS ABOUT KEEPING IT CURRENT (live games) AND ACCURATE (up to date)
async function ValidateGameSummaryLibrary() {
    // read the game library text file into json format
    // check the status and handle the file appropriately  (finalized and daily)
    let gameSummary = await readGameSummaryLibraryFile(libraryFile)
    jsonGameSummary = JSON.parse(gameSummary)
    for (var summary in jsonGameSummary) {
        //console.log(jsonGameSummary[summary].gameSummaryStatus)
    }
    /*
    let todaysGames = await getTodaysGames(buildTodaysScheduleURL)
    for (todaygame in todaysGames) {
        console.log("today game: ", todaysGames[todaygame])
        //open file
        //determine if file needs to be updated
        //check gameData.status.detailedState  // final, pre-game, scheduled, in progress
        let gameSummary = await getGameSummary(todaysGames[todaygame])
        console.log(gameSummary)
        //we now have the game summary
    }
    */
}

///////////  BUILD THE LIBRARY FROM SCRATCH
async function BuildGameSummaryLibraryFromScratch() {
    //maxGameNumber = 2
    let todaysGames = await getTodaysGames(buildTodaysScheduleURL)
    console.log('Todays games: ', todaysGames)
    for (i = 1; i <= maxGameNumber; i++) {
        let gameSummary = await getGameSummary(i)
        console.log(i, ' Got game Summary')
        gameSummaryLibrary.push(buildGameSummaryLibrary(gameSummary))
    }
    //console.log(gameSummaryLibrary)
    writeGameSummaryToFile(gameSummaryLibrary, libraryFile)
    writeGameSummaryToFile(gameSummaryLibrary, libraryFileJSON)
}
/////////////////////////////////////////////////////////////




///////////// GET TODAYS GAMES
async function getTodaysGames(scheduleURL) {
    todaysGames = []
    NHLAPI_schedule_URL = scheduleURL()
    //console.log('NHLAPI_schedule_URL: ', NHLAPI_schedule_URL)
    let response = await fetch(NHLAPI_schedule_URL);
    let data = await response.json();
    //console.log('fetched: ', data);
    todaysGames = await getGameNumbersFromTodayGames(data)
    return todaysGames
}

function buildTodaysScheduleURL() {
    todaysScheduleDate = new Date()
    todaysScheduleDateEST = new Date().toLocaleTimeString("en-US", {timeZone: 'America/New_York'});
    todaysScheduleDatePST = new Date(todaysScheduleDate.getTime() - (todaysScheduleDate.getTimezoneOffset()*60*1000))
    console.log('Time EST: ', todaysScheduleDateEST)
    todaysScheduleDate = todaysScheduleDate.toISOString().substring(0,10);
    return NHLAPI_schedule_base + todaysScheduleDate + NHLAPI_schedule_end + todaysScheduleDate   
}

async function getGameNumbersFromTodayGames(GamesJSON) {
    //console.log('GamesJSON: ', GamesJSON)
    let gamesToday = []
    for (var game in GamesJSON.dates[0].games) {
        gameNumberFromGamePk = GamesJSON.dates[0].games[game].gamePk
        gameNumberFromGamePk = (gameNumberFromGamePk).toString().substring(6,10)
        gamesToday.push(gameNumberFromGamePk)
    }
    //console.log('todays games: ', todaysGames)
    return gamesToday
}
///////////////////////////////////////////////////////////




function buildHTMLString(gameNumber) {
    htmlString = htmlBase + htmlPath + stringifyGameNumber(gameNumber) + htmlEnd
    //console.log(htmlString)
    return htmlString
}

function buildFolderPath(gameNumber) {
    //console.log('Build folder path: ', gameNumber)
    folderPath = filepath + stringifyGameNumber(gameNumber) + filetype
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





//////////// WRITE TO FOLDER
function writeGameToFolder(fpath, fileData) {
    fs.writeFileSync(fpath, fileData, (err) => {
        if (err) {
            console.log(err)
        }
        console.log('File Saved!')   
    })
}
/////////////////////////////////////////////////////////

///////// LOAD FROM FOLDER
async function readGameFile(fpath) {
    //console.log(fpath)
    return new Promise((resolve, reject) => {
        fs.readFile(fpath, 'utf8', function (err, data) {
            if (err) {
                //reject(err);
            }
            resolve(data);
        });
    });
}

async function readGameSummaryLibraryFile(fpath) {
    //console.log(fpath)
    return new Promise((resolve, reject) => {
        fs.readFile(fpath, 'utf8', function (err, data) {
            if (err) {
                //reject(err);
            }
            resolve(data);
        });
    });
}
////////////////////////////////////////////////////////
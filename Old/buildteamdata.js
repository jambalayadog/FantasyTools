const fetch = require('cross-fetch');
const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
let options = {json: true}
var http = require('http');
////////////////////////////////////////////////////////////////////
console.log('javascript loaded')
////////////////////////////////////////////////////////////////////
var gameNumber = 0
var maxGameNumber = 1312
var gameNumbers = []
var gameSummaryLibrary = []
var gamesPlayed = []
var unplayedGameNumbers = []
var folderPath
var todaysScheduleDate
var todaysGamesJSON
var loopCounter = 0
var gameNumberFromGamePk
var filepath = 'Reports/HockeyReports/GameReports/Game'
var filetype = '.txt'
var LIBRARY_fpath
var libraryFile = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.txt'
////////////////////////////////////////////////////////////////////
const homeTeamObject = {
    gameSummaryDate: '',
    gameSummaryLosingGoalie: ''
}
var teamSchedules = []
var teamSchedule = []


function populateTeamScheduleWithGame() {

/*const gameSummaryObject = {
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
}*/
}

/////////////////////////////////////////////////////////////////////
function getGameNumberFromGamePk(gamePk) {
    gameNum = gamePk - 2021020000
    return gameNum
}
///////////////////////////////////////////////////////////
CheckLibraryStatus()
/////////// CHECK THE LIBRARY STATUS
function CheckLibraryStatus() {
    try {
        if (fs.existsSync(libraryFile)) {
            //file exists.  we can use it as a base to determine next actions
            console.log('Library Found.  Read the Game Summary Data so we can analyze it')
            processGameSummaryLibrary()
        } else {
            //file does not exist.  build the library from scratch.
            console.log('Not found.  Build the Library')
        }
    } catch(err) {
        console.log(err)
    }
}
/////////// VALIDATE THE LIBRARY.  THIS IS ABOUT KEEPING IT CURRENT (live games) AND ACCURATE (up to date)
async function processGameSummaryLibrary() {
    // read the game library text file into json format
    let gameSummary = await readGameSummaryLibraryFile(libraryFile)
    updateTeamRecords(JSON.parse(gameSummary))
}
function updateTeamRecords(GameSummaries) {
    for (var summary in GameSummaries) {
        //console.log(GameSummaries[summary])
        console.log(GameSummaries[summary].gameSummaryHomeTeam)
        homeTeam = GameSummaries[summary].gameSummaryHomeTeam
        teamSchedules.push()
        console.log(GameSummaries[summary].gameSummaryAwayTeam)
        awayTeam = GameSummaries[summary].gameSummaryAwayTeam
    }
}
///////////// STRINGIFY -- MOVE THIS INTO COMMON LIBRARY WHEN YOU LEARN HOW TO DO THAT
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
///////// LOAD FROM FOLDER
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
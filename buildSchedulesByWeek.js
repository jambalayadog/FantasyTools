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
var gameSummaryLibrary = []

var folderPath

//'https://statsapi.web.nhl.com/api/v1/schedule?startDate=2022-01-12&endDate=2022-01-12'
var NHLAPI_schedule_base = 'https://statsapi.web.nhl.com/api/v1/schedule?startDate='
var NHLAPI_schedule_end = '&endDate='
var NHLAPI_schedule_URL
var todaysScheduleDate
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


function writeGameSummaryToFile(gameLibrary, fileToUse) {
    fs.writeFileSync(fileToUse, JSON.stringify(gameLibrary), (err) => {
        if (err) {
            console.log(err)
        }      
    })
    console.log('File Saved!')
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



const season_start_date = new Date("2022-10-01")
const season_end_date = new Date("2023-04-13")
const first_monday_date = new Date("2022-10-03")
const todays_date = new Date()
const number_of_teams = 32
const ms_in_a_day = 86400000
//const days = (season_start_date - season_end_date) / ms_in_a_day
const days = 12
var first_monday = new Date("2022-10-03T00:00:00")
var current_week = Math.trunc((todays_date - first_monday) / (7 * ms_in_a_day))
var total_weeks = Math.trunc((season_end_date - first_monday) / (7 * ms_in_a_day))
console.log(`current week: ${current_week}`)
console.log(`total_weeks: ${total_weeks}`)
//console.log(`days long: ${days}, ${season_start_date}`)


var teams_array = ['ANA', 'ARI', 'BOS', 'BUF', 'CGY', 'CAR', 'CHI', 'COL',
                    'CBJ', 'DAL', 'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL',
                    'NSH', 'NJD', 'NYI', 'NYR', 'OTT', 'PHI', 'PIT', 'SJS',
                    'SEA', 'STL', 'TBL', 'TOR', 'VAN', 'VGK', 'WSH', 'WPG',]


buildWeeklySchedules()

async function buildWeeklySchedules() {
    const gameSummaryFilePath = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.json'
    const scheduleFilePath = 'Reports/HockeyReports/GameReports/01_NHLScheduleByTeam.json'
    const weeklySchedulesFilePath = 'Reports/HockeyReports/GameReports/03_NHLWeeklySchedules.json'
    let scheduleSummary = await readLibraryFile(scheduleFilePath)
    JSONScheduleSummary = JSON.parse(scheduleSummary)
    //console.log('weekly schedules: ')
    weeklySchedules = sortScheduleByWeek(JSONScheduleSummary)
    //console.log('weekly schedules: ', weeklySchedules)
    //getWeeklySchedule(weeklySchedules, 13)
    writeGameToFolder(weeklySchedulesFilePath, JSON.stringify(weeklySchedules))
}

function sortScheduleByWeek(scheduleSummary) {
    //console.log(`hi!`)
    var scheduleByWeeks = {}
    for (var i = 0; i <= total_weeks; i++) {
        var teamList = {}
        //console.log(`week: ${i}`)
        for (var j = 0; j < number_of_teams; j++) {
            var temp = (teams_array[j])
            teamList[temp] = []
        }
        scheduleByWeeks[i] = teamList
    }
    for (var team in scheduleSummary) {
        //console.log(`team: ${team}`)
        for (var game in scheduleSummary[team]) {
            var gameDate = new Date(game)
            var gameWeek = Math.trunc((gameDate - first_monday) / (7 * ms_in_a_day))
            //console.log(team, game, gameDate, gameWeek)
            scheduleByWeeks[gameWeek][team].push(scheduleSummary[team][game])
        }
    }
    return scheduleByWeeks
}

// save the file to a folder

function getWeeklySchedule(weeklySchedules, weekNum) {
    console.log(weeklySchedules[weekNum]['VAN'])
}

//getSchedule()
//getSchedule()

async function getSchedule() {
    // get our game summary data
    const gameSummaryFilePath = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.json'
    const scheduleFilePath = 'Reports/HockeyReports/GameReports/01_NHLScheduleByTeam.json'
    let gameSummary = await readGameSummaryLibraryFile(gameSummaryFilePath)
    //console.log(`data: ${gameSummary}`)
    jsonGameSummary = JSON.parse(gameSummary)
    
    // sort the league schedule
    leagueSchedule = sortScheduleByTeam(jsonGameSummary)
    //console.log(leagueSchedule)
    //writeGameToFolder(scheduleFilePath, JSON.stringify(leagueSchedule))
    
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
                //gameInfo.gamedate = gameplaydate
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

async function readLibraryFile(fpath) {
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
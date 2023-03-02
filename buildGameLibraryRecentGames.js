const fetch = require('cross-fetch');
const fs = require('fs');
const fsPromises = require('fs').promises;
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require('request');
let options = {json: true}

console.log('javascript loaded')
//useful links
//https://www.hockey-reference.com/leagues/NHL_2021_games.html

var maxGameNumber = 1312 //82 * 16(*2)   1312
//'https://www.nhl.com/scores/htmlreports/20212022/ES020001.HTM'
var htmlBase = "http://www.nhl.com"
var htmlPath = "/scores/htmlreports/20222023/ES02"
var htmlEnd = ".HTM"
var htmlString = ''

// library
var gameSummaryLibrary = []
var folderPath

//'https://statsapi.web.nhl.com/api/v1/schedule?startDate=2022-01-12&endDate=2022-01-12'
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
var libraryFileJSONTemp = 'Reports/HockeyReports/GameReports/00_GameSummaryLibraryTemp.json'
////////////////

//'https://statsapi.web.nhl.com/api/v1/schedule?startDate=2022-01-12&endDate=2022-01-12'
var NHLAPI_schedule_start = 'https://statsapi.web.nhl.com/api/v1/schedule?startDate='
var NHLAPI_schedule_end = '&endDate='
var NHLAPI_schedule_URL
var game_numbers = []







/*
var date = new Date(); // Or the date you'd like converted.
var isoDateTimeEST = new Date(date.getTime() - (date.getTimezoneOffset() * 60000) + (180 * 60000)).toISOString();
var isoDateTimeNHLFormat = isoDateTimeEST.substring(0,19) + 'Z'
*/

function buildGameSummaryLibrary(gameSummaryData) {
    //console.log(`2 type of: ${typeof(gameSummaryData)}`)
    parsedJsonData = typeof(gameSummaryData) === 'string' ? JSON.parse(gameSummaryData) : gameSummaryData
    //console.log(gameSummaryData)
    //console.log(parsedJsonData)
    const summaryDate = new Date().toISOString().substring(0,19) + 'Z'
    const [empty_netters, powerplay_goalsfor, powerplay_goalsagainst] = process_gameevents(parsedJsonData)
    const parsedShort = parsedJsonData.liveData.boxscore.teams
    // vars because some values might be blank (NHL.com API problem)
    // I could add more checks here to ensure data is adequate
    // and report errors back about this - ASK PROGRAMMER BUDDY
    const home_power_plays = parsedShort.home.teamStats.teamSkaterStats != undefined ? parsedShort.home.teamStats.teamSkaterStats.powerPlayOpportunities : 0
    const away_power_plays = parsedShort.away.teamStats.teamSkaterStats != undefined ? parsedShort.away.teamStats.teamSkaterStats.powerPlayOpportunities : 0
    const home_power_play_goals = parsedShort.home.teamStats.teamSkaterStats != undefined ? parsedShort.home.teamStats.teamSkaterStats.powerPlayGoals : 0
    const away_power_play_goals = parsedShort.away.teamStats.teamSkaterStats != undefined ? parsedShort.away.teamStats.teamSkaterStats.powerPlayGoals : 0
    // make the object
    const gameSummaryObject = {
        gameSummaryDate: parsedJsonData.gameData.datetime.dateTime,
        gameSummaryGameNumber: getGameNumberFromGamePk(parsedJsonData.gamePk),
        gameSummaryDetailedState : parsedJsonData.gameData.status.detailedState,
        gameSummaryHomeTeam: parsedJsonData.gameData.teams.home.name,
        gameSummaryAwayTeam: parsedJsonData.gameData.teams.away.name,
        gameSummaryHomeTeamShort: parsedJsonData.gameData.teams.home.abbreviation,
        gameSummaryAwayTeamShort: parsedJsonData.gameData.teams.away.abbreviation,
        gameSummaryHomeTeamID: parsedJsonData.gameData.teams.home.id,
        gameSummaryAwayTeamID: parsedJsonData.gameData.teams.away.id,
        gameSummaryHomeScore: parsedJsonData.liveData.linescore.teams.home.goals,
        gameSummaryAwayScore: parsedJsonData.liveData.linescore.teams.away.goals,
        gameSummaryHomeShots: parsedJsonData.liveData.linescore.teams.home.shotsOnGoal,
        gameSummaryAwayShots: parsedJsonData.liveData.linescore.teams.away.shotsOnGoal,
        /*gameSummaryHomePowerPlays: parsedJsonData.liveData.boxscore.teams.home.teamStats.teamSkaterStats.powerPlayOpportunities,
        gameSummaryAwayPowerPlays: parsedJsonData.liveData.boxscore.teams.away.teamStats.teamSkaterStats.powerPlayOpportunities,
        gameSummaryHomePowerPlayGoals: parsedJsonData.liveData.boxscore.teams.home.teamStats.teamSkaterStats.powerPlayGoals,
        gameSummaryAwayPowerPlayGoals: parsedJsonData.liveData.boxscore.teams.away.teamStats.teamSkaterStats.powerPlayGoals,*/
        gameSummaryHomePowerPlays: home_power_plays,
        gameSummaryAwayPowerPlays: away_power_plays,
        gameSummaryHomePowerPlayGoals: home_power_play_goals,
        gameSummaryAwayPowerPlayGoals: away_power_play_goals,
        gameSummaryAPILink: parsedJsonData.link,
        gameSummaryNHLStatsPage: buildHTMLString(getGameNumberFromGamePk(parsedJsonData.gamePk)),
        gameSummaryStatus: parsedJsonData.gameData.status.detailedState,
        gameSummaryLastUpdated: summaryDate,
        gameSummaryPeriod: parsedJsonData.liveData.linescore.currentPeriodOrdinal,
        gameSummaryPeriodRemaining: parsedJsonData.liveData.linescore.currentPeriodTimeRemaining,
        gameSummaryWinningGoalie: typeof(parsedJsonData.liveData.decisions.winner) === 'undefined' ? '-' : parsedJsonData.liveData.decisions.winner.id,
        gameSummaryLosingGoalie: typeof(parsedJsonData.liveData.decisions.loser) === 'undefined' ? '-' : parsedJsonData.liveData.decisions.loser.id,
        gameSummaryEmptyNetGoals: empty_netters,
    }
    //console.log('gameSummaryObject: ', gameSummaryObject)
    return gameSummaryObject
}

function process_gameevents(parsedJsonData) {
    var empty_netters = 0
    var powerplay_goalsfor = 0
    var powerplay_goalsagainst = 0
    for (play in parsedJsonData.liveData.plays.allPlays) {
        var game_event = parsedJsonData.liveData.plays.allPlays[play]
        if (game_event.result.emptyNet) {
            empty_netters += 1
            //console.log(`empty netters: ${empty_netters}`)
        }
    }
    return [
        empty_netters,
        powerplay_goalsfor,
        powerplay_goalsagainst,
    ]
}


function countEmptyNetGoals(parsedJsonData) {
    for (play in parsedJsonData.liveData.plays.allPlays) {
        console.log(parsedJsonData.liveData.plays.allPlays[play])
    }

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
    NHLAPI_game_URL = buildGameURL(gameNumber)
    //console.log('NHLAPI_game_URL: ', NHLAPI_game_URL)
    let response = await fetch(NHLAPI_game_URL);
    gameData = await response.json();
    writeGameToFolder(LIBRARY_fpath, JSON.stringify(gameData))
    return gameData
}

async function getGameSummary_FromFolder(gameNumber) {
    //LIBRARY_fpath = buildFolderPath(gameNumber)
    NHLAPI_game_FilePath = buildGameFilePath(gameNumber)          // get file path address
    //console.log(`NHLAPI_game_FilePath: ${NHLAPI_game_FilePath}`)
    let gameData = JSON.parse(fs.readFileSync(NHLAPI_game_FilePath))
    //console.log(`gameData from file: ${typeof(gameData)}`);
    //console.log(`2 gameData from file: ${gameData}`);
    //let response = await fetch(NHLAPI_game_FilePath);        // read it
    //gameData = await response.json();                   // set our data to it
    //writeGameToFolder(LIBRARY_fpath, JSON.stringify(gameData))
    return gameData                                    // return it
}

function buildGameURL(gameNum) {
    return NHLAPI_game_URL = NHLAPI_game_base + stringifyGameNumber(gameNum) + NHLAPI_game_end
}

function buildGameFilePath(gameNum) {
    return filepath + stringifyGameNumber(gameNum) + filetypeJSON
}

//https://statsapi.web.nhl.com/api/v1/game/2021020382/feed/live?site=en_nhl

///////////////////////////////////////////////////////////


// EVERY DAY REBUILD THE LIBRARY
buildLibrary()

async function buildLibrary() {
    //performance timing
    const start = Date.now()
    
    // get relevant game numbers (within some days of today's date)
    let gameNumbers_to_get = await getGameNumbers()
    //console.log(`gameNumbers_to_get: ${gameNumbers_to_get}`)
    
    // go through all the year's games
    for (i = 1; i <= maxGameNumber; i++) {
        //console.log(`index: ${i}, ${gameNumbers_to_get.indexOf(stringifyGameNumber(i))}`)
        if (gameNumbers_to_get.indexOf(stringifyGameNumber(i)) >= 0) {
            console.log(`game within a few days of today: ${i}`)
            let gameSummary = await getGameSummary(i)
            //console.log(`web - gameSummary: ${i}, ${gameSummary}, ${i}`)
            gameSummaryLibrary.push(buildGameSummaryLibrary(gameSummary))
        } else {
            console.log(`game out of range: ${i}`)
            let gameSummary = await getGameSummary_FromFolder(i)
            //console.log(`file - gameSummary: ${i}, ${gameSummary}, ${i}`)
            gameSummaryLibrary.push(buildGameSummaryLibrary(gameSummary))
        }
    }
    
    //write library file
    writeGameSummaryToFile(gameSummaryLibrary, libraryFileJSON)
    var sorted_library = sortGameLibrary(gameSummaryLibrary)
    
    // sort gameSummaryLibrary by Date rather than GameNumber
    //writeGameSummaryToFile(sorted_library, libraryFileJSONTemp)
    writeGameSummaryToFile(sorted_library, libraryFileJSON)

    //performance timing
    const end = Date.now()
    console.log(`Execution time: ${(end - start)/1000} s`)
    
}

function sortGameLibrary(library) {
    var new_library = []
    new_library = library
    //new_library.sort((x,y) => x.gameSummaryDate - y.gameSummaryDate)
    new_library.sort(sortFunc)
    //gameSummaryDate
    //gameSummaryGameNumber
    return new_library
}

function sortFunc(a, b) {
    var a = new Date(a.gameSummaryDate)
    var b = new Date(b.gameSummaryDate)
    console.log('a,b: ', a, ' ', b)
    return a > b ? 1 : b > a ? -1 : 0;
    //console.log('2a,2b: ', new Date(a.gameSummaryDate), ' ', new Date(b.gameSummaryDate))
    //console.log('3a,3b: ', new Date(a.gameSummaryDate) - new Date(b.gameSummaryDate))

}

// let todays_games = []
// let this_weeks_games = []
// let last_weeks_games = []  // all games from today +7 to -7 days
// fetch the schedule and store those game numbers


async function getGameNumbers() {
    
    NHLAPI_schedule_URL = buildURL_ScheduleToGetGamesFrom()
    let response = await fetch(NHLAPI_schedule_URL);
    gameData = await response.json();
    let game_nums = getGameNumbersFromGames(gameData)
    console.log(game_nums)
    return game_nums
}

function buildURL_ScheduleToGetGamesFrom() {
    todaysScheduleDate = new Date()
    todaysScheduleDateEST = new Date(todaysScheduleDate.getTime() - (todaysScheduleDate.getTimezoneOffset()*60*1000))  //PST is the base for North America since EST is BS
    //todaysScheduleDateEST = new Date(todaysScheduleDate.getTime())  //PST is the base for North America since EST is BS
    console.log('Time PST: ', todaysScheduleDateEST)
    one_week_ahead = new Date(todaysScheduleDateEST.getTime() + (3 * 24 * 60 * 60 * 1000))
    one_week_behind = new Date(todaysScheduleDateEST.getTime() - (3 * 24 * 60 * 60 * 1000))
    todaysScheduleDate = todaysScheduleDateEST.toISOString().substring(0,10);
    one_week_ahead_string = one_week_ahead.toISOString().substring(0,10);
    one_week_behind_string = one_week_behind.toISOString().substring(0,10);
    return NHLAPI_schedule_start + one_week_behind_string + NHLAPI_schedule_end + one_week_ahead_string
}


function getGameNumbersFromGames(GamesJSON) {
    var game_numbers_in_range = []
    //console.log(GamesJSON)
    //console.log('games: ', GamesJSON.dates[0].games)
    for (var date in GamesJSON.dates) {
        //console.log(GamesJSON.dates[date], date)
        for (var game in GamesJSON.dates[date].games) {
            //console.log('Game: ', game, ' -----', GamesJSON.dates[0].games[game])
            gameNumberFromGamePk = GamesJSON.dates[date].games[game].gamePk
            gameNumberFromGamePk = (gameNumberFromGamePk).toString().substring(6,10)
            game_numbers_in_range.push(gameNumberFromGamePk)
        }
    }
    
    //console.log('todays games: ', game_numbers)
    return game_numbers_in_range
}

// previous stuff






function buildHTMLString(gameNumber) {
    htmlString = htmlBase + htmlPath + stringifyGameNumber(gameNumber) + htmlEnd
    //console.log(htmlString)
    return htmlString
}

function buildFolderPath(gameNumber) {
    //console.log('Build folder path: ', gameNumber)
    folderPath = filepath + stringifyGameNumber(gameNumber) + filetypeJSON
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
function writeGameToFolder(fpath, gameData) {
    fs.writeFileSync(fpath, gameData, (err) => {
        if (err) {
            console.log(err)
        }
        console.log('File Saved!')   
    })
}
/////////////////////////////////////////////////////////



//Load HTTP module
const http = require("http");
const fs = require('fs').promises
const hostname = '127.0.0.1';
const port = 3000;

//const schedule

//................. HTML PAGE BLANK



const players = JSON.stringify([
    { playerName: "Alf", goals: 5, pim: 17},
    { playerName: "B Willy 3", goals: 2, pim: 4}
])

//................. SORT REQUESTS

const requestListener = function (req, res){
    /*fs.readFile("index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html")
            res.writeHead(200)
            res.end(contents)
        })*/
    console.log(req.url)
    console.log(res.getHeaderNames())
    //console.log(req)
    /*if (req.url === '/favicon.ico') {
        console.log("HELP ME")
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return
    }/*
    if (req.url === '/hockeystyle.css') {
        console.log("hockey style")
        res.writeHead(200, {'Content-Type': 'text/css'} );
        res.end()
        return
    }*/
    //res.setHeader("Content-Type", "application/json");
    switch (req.url) {
        case "/schedule":
            console.log("schedule")
            res.setHeader("Content-Type", "text/html");
            serveFile(scheduleFilePath, req, res)
            break
        case "/players":
            console.log("players")    
            res.writeHead(200)
            res.end(players)
            break
        case "/hockeystyle.css":
            fs.readFile("hockeystyle.css")
                .then(contents => {
                    res.end(contents)
                })
        default:
            console.log("default")
            serveFile(scheduleFilePath, req, res)
            //res.setHeader("Content-Type", "application/json");    
            //readDataFile(gameSummaryFilePath, req, res)
    }
}

////.............. SERVER SET UP


const server = http.createServer(requestListener);

server.listen(port, hostname, () => {
    console.log(`Server is running on http://${hostname}:${port}`);
})

const gameSummaryFilePath = 'Reports/HockeyReports/GameReports/00_GameSummaryLibrary.json'
const scheduleFilePath = 'Reports/HockeyReports/GameReports/01_NHLScheduleByTeam.json'

//................. READ DATA FILES

function serveFile(dataFile, req, res) {
    //console.log("read data file ", dataFile)
    fs.readFile("index.html")
        .then(contents => {
            contents = processContents(contents, req)
            res.writeHead(200)
            res.end(contents)
        })
        .catch(err => {
            console.log("err: ", err)
            res.writeHead(500)
            res.end(err)
            return
        })
}

function processContents(contents, req) {
    switch (req.url) {
        case "/schedule":
            console.log('schedule2')
            console.log("contents1: ", contents)
            contents = format_schedule(contents)
            console.log("contents3: ", contents)
            break
        case "/players":
            console.log('players2')
            break
        default:
            console.log('default2')
    }
    return contents
}


//////................. PROCESS THE CONTENTS


const season_start_date = new Date("2022-10-01")
const season_end_date = new Date("2022-04-13")
const first_monday_date = new Date("2022-10-03")
const todays_date = new Date()
const teams = 32
const ms_in_a_day = 86400000
const days = (season_start_date - season_end_date) / ms_in_a_day
//const days = 12
console.log(`days long: ${days}, ${season_start_date}`)




function format_schedule(contents) {
    console.log("format the schedule")
    var leagueSchedule = JSON.parse(contents)
    var htmlstring = "<table>"
    //console.log(leagueSchedule)
    for (teamSchedule in leagueSchedule) {
        htmlstring += "<tr>"
        htmlstring += "<td>"
        htmlstring += teamSchedule
        htmlstring += "</td>"
        for (i=0; i < days; i++) {
            //get search date string
            var search_date = new Date(season_start_date)
            search_date.setDate(search_date.getDate() + i)
            gamefound = false
            for (gameInfo in leagueSchedule[teamSchedule]) {
                //console.log(`gameinfo: ${gameInfo} ... teamschedule[gameinfo]: ${leagueSchedule[teamSchedule][gameInfo]}`)
                if (gameInfo == search_date.toDateString()) {
                    // want to set this to @Opp or Opp
                    var hometeam = leagueSchedule[teamSchedule][gameInfo].hometeam
                    var awayteam = leagueSchedule[teamSchedule][gameInfo].awayteam
                    if (hometeam == teamSchedule) {
                        htmlstring += "<td>" + awayteam + "</td>"
                    } else {
                        htmlstring += "<td>" + "@" + hometeam + "</td>"
                    }
                    delete leagueSchedule[teamSchedule][gameInfo]
                    gamefound = true
                    break
                }
            }
            if (gamefound == false) {
                htmlstring += "<td></td>"
            }
        }
        htmlstring += "</tr>"
    }
    htmlstring += "</table>"
    //console.log(htmlstring)
    //return htmlstring
    console.log("contents2: ", contents)
    return contents
}




/*
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
*/
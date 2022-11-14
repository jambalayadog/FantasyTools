var express = require('express');
var router = express.Router();
var fs = require('fs')


const schedule_file = "files/01_NHLScheduleByTeam.json"
var schedule_data

const teamStats_file = "files/02_NHLTeamStats.json"
var teamstats_data




/* GET home page. 
router.get('/', function(req, res, next) {
    res.render('schedule', { title: 'Express2' });
});*/

/* GET home page. */
router.get('/', function(req, res, next) {
    fs.readFile(schedule_file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        //console.log(data);
        schedule_data = data
        //res.render('schedule', {schedule_data: schedule_data});
        fs.readFile(teamStats_file, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            //console.log(data);
            teamstats_data = data
            var combined_data = JSON.stringify({schedule_data: schedule_data, teamstats_data: teamstats_data})
            console.log('1 ', (schedule_data).substring(0,50))
            console.log('2 ', (teamstats_data).substring(0,55))
            console.log('3 ', (combined_data).substring(0,60))
            res.render('schedule', {schedule_data: schedule_data, teamstats_data: teamstats_data});
            //res.render('schedule', JSON.stringify({schedule_data: schedule_data, teamstats_data: teamstats_data}));
        });
    });
    //console.log('To render: ', (schedule_data).substring(0,50), ' -- type: ', typeof(schedule_data))
    //res.render('schedule', {schedule_data: schedule_data});
});


module.exports = router;

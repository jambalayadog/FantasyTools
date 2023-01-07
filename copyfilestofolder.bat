set source_location=I:\Projects\FantasyTools\FantasyTools\Reports\HockeyReports\GameReports
set target_location=I:\Projects\FantasyTools\FantasyTools\fantasytoolsapp

robocopy I:\Projects\FantasyTools\FantasyTools\Reports\HockeyReports\GameReports I:\Projects\FantasyTools\FantasyTools\fantasytoolsapp\files
copy I:\Projects\FantasyTools\FantasyTools\fantasytoolsapp\files\01_NHLScheduleByTeam.json I:\Projects\fantasytoolsapp\files\
copy I:\Projects\FantasyTools\FantasyTools\fantasytoolsapp\files\02_NHLTeamStats.json I:\Projects\fantasytoolsapp\files\
copy I:\Projects\FantasyTools\FantasyTools\fantasytoolsapp\files\03_NHLWeeklySchedules.json I:\Projects\fantasytoolsapp\files\
:: cd I:\Projects\FantasyTools\FantasyTools\fantasytoolsapp\files
:: ftp -i -s:I:\Projects\FantasyTools\FantasyTools\CopyFilesToFTP.ftp
cd /D I:\Projects\fantasytoolsapp\files\
:: call git status
call git add 01_NHLScheduleByTeam.json
call git add 02_NHLTeamStats.json
call git add 03_NHLWeeklySchedules.json
call git commit -m "stats update"
call git push origin main
:: call git status
:: pause

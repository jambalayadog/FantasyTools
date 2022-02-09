// player stats page
// set start to X \* 100 and limit to 100

https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=[{"property":"points","direction":"DESC"},{"property":"gamesPlayed","direction":"ASC"},{"property":"playerId","direction":"ASC"}]&start=100&limit=100&factCayenneExp=gamesPlayed>=1&cayenneExp=gameTypeId=2 and seasonId<=20212022 and seasonId>=20212022

// nhl season standings

https://statsapi.web.nhl.com/api/v1/standings?hydrate=record(overall),division,conference,team(nextSchedule(team),previousSchedule(team))&season=20212022&site=en_nhl

// nhl schedule
// season start = oct 12 ... 2021-10-12
// season end = apr 29 ... 2022-04-29

https://statsapi.web.nhl.com/api/v1/schedule?startDate=2022-01-11&endDate=2022-01-16&hydrate=team,linescore,broadcasts(all),tickets,game(content(media(epg)),seriesSummary),radioBroadcasts,metadata,seriesSummary(series)&site=en_nhlCA&teamId=&gameType=&timecode=

https://statsapi.web.nhl.com/api/v1/schedule?startDate=2021-10-12&endDate=2022-04-29&hydrate=team,linescore,broadcasts(all),tickets,game(content(media(epg)),seriesSummary),radioBroadcasts,metadata,seriesSummary(series)&site=en_nhlCA&teamId=&gameType=&timecode=

// nhl games

https://statsapi.web.nhl.com/api/v1/game/2021020382/feed/live?site=en_nhl //game 0382

// nhl game action




function getGameNumberFromGamePk(gamePk) {
    gameNum = gamePk - 2021020000
    return gameNum
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

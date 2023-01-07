const testhttp = require('http')
const options = {
    hostname: 'nhl.com',
    port: 80,
    path: htmlPath + gameNumber,
    method: 'GET'
}

const req = testhttp.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        console.log('hi')
        process.stdout.write(d)
    })
})

req.on('error', error => {
    console.error(error)
})

req.end


function getNHLGame(gameNumber) {
    var count = 0
    var jsonObject = []
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        console.log('on ready state change -- function', 'this.readyState: ', this.readyState, 'this.status: ', this.status)
        if (this.readyState == 4 && this.status == 200) {
            gotResultsFromWeb = true
            //console.log('this: ', this)
            statsPage.innerHTML = this.responseText
            console.log('statsPage.childNodes[4]: ', statsPage.childElementCount, statsPage)
        }
    };
    console.log('opening')
    htmlString = htmlBase + htmlPath + gameNumber + htmlEnd
    xmlhttp.open("GET", htmlString, true);
    console.log('opened, sending')
    xmlhttp.send();
    console.log('sent')
}



function getImportantStats() {
    console.log('hi')
    console.log('statepage: ', statsPage)
}

function displayImportantStats() {
    console.log('page: ', page)
    console.log('statsPage: ', statsPage)
    page.appendChild(statsPage)
}


function exportJSON(statePagetoExport) {
    var json = JSON.stringify(statePagetoExport)
}


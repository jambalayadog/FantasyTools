var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    
console.log(localISOTime)


var date = new Date(); // Or the date you'd like converted.
var isoDateTimeEST = new Date(date.getTime() - (date.getTimezoneOffset() * 60000) + (180 * 60000)).toISOString();
var isoDateTimeNHLFormat = isoDateTimeEST.substring(0,19) + 'Z'

console.log(isoDateTimeNHLFormat)


var dateTimeEST = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000) + (180 * 60000)).toISOString().substring(0,19) + 'Z'
console.log(dateTimeEST)


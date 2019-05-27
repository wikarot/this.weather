let wr = {
    api: 'http://api.openweathermap.org/data/2.5/weather?q=',
    city: 'Montevideo,UY',
    key: '&appid=b280c897878592322aafe56701248929',
    units: '&units=metric',
    lang: '&lang=es'
}

let wrData;
let wrLink = wr.api + wr.city + wr.key + wr.units + wr.lang;

window.onload = () => {
    jsonRequest(wrData, wrLink);
}

function jsonRequest(dataHandler, dataSrc) {
    fetch(dataSrc).then(Response => {
        // Get the data from JSON formatt
        return Response.json();
    }).then(data => {
        // Store the data into your handler
        dataHandler = data;
    }).catch(e => {
        // FAIL!
        console.log("Error!", e);
    })
}


/**
 * {
"coord": {
"lon": -56.17,
"lat": -34.83
},
"weather": [
{
"id": 800,
"main": "Clear",
"description": "clear sky",
"icon": "01d"
}
],
"base": "stations",
"main": {
"temp": 25.02,
"pressure": 1008,
"humidity": 60,
"temp_min": 24,
"temp_max": 26
},
"visibility": 10000,
"wind": {
"speed": 7.2,
"deg": 290,
"gust": 12.3
},
"clouds": {
"all": 0
},
"dt": 1542286800,
"sys": {
"type": 1,
"id": 4616,
"message": 0.0036,
"country": "UY",
"sunrise": 1542270634,
"sunset": 1542320917
},
"id": 3441575,
"name": "Montevideo",
"cod": 200
}
 */
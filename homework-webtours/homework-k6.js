import http from 'k6/http';
import {check, group} from 'k6';
import {SharedArray} from 'k6/data';


export const options = {
    iterations: 1
};

const BASE_URL = 'http://webtours.load-test.ru:1080';
let userSession = null;
let cities = null;
const data = new SharedArray('get Users', function () {
    const file = JSON.parse(open('./resources/users.json'));
    return file.users;
});

export function getMainPage() {

    let response = http.get(`${BASE_URL}/webtours/`);
    checkStatusIs200(response);

    response = http.get(`${BASE_URL}/cgi-bin/welcome.pl?signOff=true`);
    checkStatusIs200(response);


    response = http.get(`${BASE_URL}/cgi-bin/nav.pl?in=home`)
    checkStatusIs200(response);


    userSession = response.body.match(/<input type="hidden" name="userSession" value="([^"]+)"/)[1];
}

export function postLogin() {

    let response = http.post(`${BASE_URL}/cgi-bin/login.pl`, {
        userSession: `${userSession}`,
        username: `${data[0].username}`,
        password: `${data[0].password}`
    });
    checkStatusIs200(response);


    response = http.get(`${BASE_URL}/cgi-bin/nav.pl?page=menu&in=home`);
    checkStatusIs200(response);


    response = http.get(`${BASE_URL}/cgi-bin/login.pl?intro=true`);
    checkStatusIs200(response);

}

export function getFindFlights() {
    let response = http.get(`${BASE_URL}/cgi-bin/welcome.pl?page=search`);
    checkStatusIs200(response);


    response = http.get(`${BASE_URL}/cgi-bin/reservations.pl?page=welcome`);
    let regExpMatchArray = response.body.match(/<option value="([^"]+)">([^<]+)<\/option>/g);
    cities = [...new Set(regExpMatchArray.map(option => option.match(/<option value="([^"]+)">/)[1]))];

    response = http.get(`${BASE_URL}/cgi-bin/nav.pl?page=menu&in=flights`);
    checkStatusIs200(response);

}

export function postReservationFlights() {
    let response = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, {
        advanceDiscount: "0",
        depart: getRandomValuesFromArray(cities),
        departDate: "06/16/2025",
        arrive: getRandomValuesFromArray(cities),
        returnDate: "06/17/2025",
        numPassengers: "1",
        seatPref: "None",
        seatType: "Coach",
        'findFlights.x': "50",
        'findFlights.y': "14",
        '.cgifields': "roundtrip",
        '.cgifields': "seatType",
        '.cgifields': "seatPref"
    });
    checkStatusIs200(response);

    let outboundFlights = response.body.match(/ name="outboundFlight" value="([^"]+)"/g);
    outboundFlights = outboundFlights.map(flight => flight.match(/value="([^"]+)"/)[1]);

    response = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, {
        "outboundFlight": getRandomValuesFromArray(outboundFlights),
        "numPassengers": "1",
        "advanceDiscount": "0",
        "seatType": "Coach",
        "seatPref": "None",
        "reserveFlights.x": "69",
        "reserveFlights.y": "9",
    })
    checkStatusIs200(response);
    let outboundFlight = response.body.match(/name="outboundFlight" value="([^"]+)"/)[1];

    response = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, {
        "firstName": "",
        "lastName": "",
        "address1": "",
        "address2": "",
        "pass1": " ",
        "creditCard": "creditcard",
        "expDate": "expCa",
        "saveCC": "on",
        "oldCCOption": "on",
        "numPassengers": "1",
        "seatType": "Coach",
        "seatPref": "None",
        "outboundFlight": outboundFlight,
        "advanceDiscount": "0",
        "returnFlight": "",
        "JSFormSubmit": "off",
        "buyFlights.x": "16",
        "buyFlights.y": "11",
        ".cgifields": "saveCC"
    });
    checkStatusIs200(response);
}

export function signOff(){

    let response = http.get(`${BASE_URL}/cgi-bin/welcome.pl?signOff=1`);
    checkStatusIs200(response);

    response = http.get(`${BASE_URL}/cgi-bin/nav.pl?in=home`);
    checkStatusIs200(response);

    response = http.get(`${BASE_URL}/WebTours/home.html`);
    checkStatusIs200(response);
}

export default function () {
    group('Root page', () => {
        getMainPage();
        postLogin();
        getFindFlights();
        postReservationFlights();
        signOff();
    })
}

//Вспомогательные функции
function getRandomNumber(n) {
    return Math.floor(Math.random() * n);
}

function getRandomValuesFromArray(values) {
    return values[getRandomNumber(values.length)];
}

function checkStatusIs200(response) {
    check(
        response,
        {'status code is 200': (res) => res.status === 200}
    );
}


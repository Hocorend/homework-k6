import http from 'k6/http';
import {check, group} from 'k6';

const YA_RPS = __ENV.YA_RPS ? parseInt(__ENV.YA_RPS) : 60;
const WWW_RPS = __ENV.WWW_RPS ? parseInt(__ENV.WWW_RPS)  : 120;

export let options = {
    scenarios: {
        getYandex: {
            executor: 'ramping-arrival-rate',
            exec: 'getYaRu',
            startRate: 0,
            timeUnit: '1m',
            preAllocatedVUs: 50,
            stages: [
                {target: YA_RPS, duration: '300s'},
                {target: YA_RPS, duration: '600s'},
                {target: YA_RPS * 1.2, duration: '300s'},
                {target: YA_RPS * 1.2, duration: '600s'},
            ],
        },
        getWWW: {
            executor: 'ramping-arrival-rate',
            exec: 'getWWWRu',
            startRate: 0,
            timeUnit: '1m',
            preAllocatedVUs: 50,
            stages: [
                {target: WWW_RPS, duration: '300s'},
                {target: WWW_RPS, duration: '600s'},
                {target: WWW_RPS * 1.2, duration: '300s'},
                {target: WWW_RPS * 1.2, duration: '600s'},
            ],
        }
    }
};


const YA_URL = 'https://ya.ru/';
const WWW_URL = 'http://www.ru/';

export function getYaRu() {
    let response = http.get(`${YA_URL}`);
    check(
        response,
        {'status code is 200': (res) => res.status === 200}
    )
}

export function getWWWRu() {
    let response = http.get(`${WWW_URL}`);
    check(
        response,
        {'status code is 200': (res) => res.status === 200}
    )
}

export default function (){
    group('getYandex', () => { getYaRu(); });
    group('getWWW', () => { getWWWRu(); });
}

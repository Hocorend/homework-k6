import http from 'k6/http';
import {check, group} from 'k6';

const YA_INTENSITY = __ENV.YA_INTENSITY ? parseInt(__ENV.YA_INTENSITY) : 60;
const WWW_INTENSITY = __ENV.WWW_INTENSITY ? parseInt(__ENV.WWW_INTENSITY)  : 120;

export let options = {
    scenarios: {
        getYandex: {
            executor: 'ramping-arrival-rate',
            exec: 'getYaRu',
            startRate: 0,
            timeUnit: '1m',
            preAllocatedVUs: 50,
            stages: [
                {target: YA_INTENSITY, duration: '300s'},
                {target: YA_INTENSITY, duration: '600s'},
                {target: YA_INTENSITY * 1.2, duration: '300s'},
                {target: YA_INTENSITY * 1.2, duration: '600s'},
            ],
        },
        getWWW: {
            executor: 'ramping-arrival-rate',
            exec: 'getWWWRu',
            startRate: 0,
            timeUnit: '1m',
            preAllocatedVUs: 50,
            stages: [
                {target: WWW_INTENSITY, duration: '300s'},
                {target: WWW_INTENSITY, duration: '600s'},
                {target: WWW_INTENSITY * 1.2, duration: '300s'},
                {target: WWW_INTENSITY * 1.2, duration: '600s'},
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

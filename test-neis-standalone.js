
const https = require('https');

const API_KEY = "3b72e900f7d2482a87bb19092998d666";
const OFFICE_CODE = "S10";
const SCHOOL_CODE = "9010033";
const BASE_URL = "https://open.neis.go.kr/hub";

function fetchData(endpoint, params) {
    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/${endpoint}?${query}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const DD = String(today.getDate()).padStart(2, '0');
    const dateStr = `${YYYY}${MM}${DD}`;

    console.log(`Testing NEIS API for date: ${dateStr}`);

    try {
        // 1. Meals
        const mealParams = {
            KEY: API_KEY,
            Type: 'json',
            pIndex: '1',
            pSize: '10',
            ATPT_OFCDC_SC_CODE: OFFICE_CODE,
            SD_SCHUL_CODE: SCHOOL_CODE,
            MLSV_YMD: dateStr,
        };

        console.log('Fetching Meals...');
        const mealData = await fetchData('mealServiceDietInfo', mealParams);

        if (mealData.mealServiceDietInfo) {
            console.log('✅ Meals Found:', mealData.mealServiceDietInfo[1].row.length, 'items');
            mealData.mealServiceDietInfo[1].row.forEach(m => console.log(`  - ${m.MMEAL_SC_NM}: ${m.DDISH_NM}`));
        } else {
            console.log('⚠️ No Meal Data (might be weekend/holiday code:', mealData.RESULT?.CODE, ')');
        }

        // 2. Timetable (Try generic date if today fails, or just check response code)
        const timeParams = {
            KEY: API_KEY,
            Type: 'json',
            pIndex: '1',
            pSize: '100',
            ATPT_OFCDC_SC_CODE: OFFICE_CODE,
            SD_SCHUL_CODE: SCHOOL_CODE,
            ALL_TI_YMD: dateStr,
            GRADE: '1',
            CLASS_NM: '1',
        };

        console.log('Fetching Timetable (Grade 1, Class 1)...');
        const timeData = await fetchData('hisTimetable', timeParams);

        if (timeData.hisTimetable) {
            console.log('✅ Timetable Found:', timeData.hisTimetable[1].row.length, 'periods');
        } else {
            console.log('⚠️ No Timetable Data (might be weekend/holiday code:', timeData.RESULT?.CODE, ')');
        }

    } catch (err) {
        console.error('❌ API Error:', err);
    }
}

test();

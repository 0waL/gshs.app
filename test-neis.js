
const { getMeals, getTimetable } = require('./src/lib/neis');

async function testNeis() {
    console.log('Testing NEIS API...');

    // Test with a likely valid school date (e.g., a known weekday)
    // Let's us today or a recent weekday.
    const today = new Date();
    // Adjust to ensure it's a weekday if needed, but simple test first.
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const DD = String(today.getDate()).padStart(2, '0');
    const dateStr = `${YYYY}${MM}${DD}`;

    console.log(`Fetching meals for ${dateStr}...`);
    const meals = await getMeals(dateStr);
    console.log('Meals:', JSON.stringify(meals, null, 2));

    console.log(`Fetching timetable for ${dateStr} (Grade 2, Class 1)...`);
    const timetable = await getTimetable(dateStr, '2', '1');
    console.log('Timetable:', JSON.stringify(timetable, null, 2));
}

// Mock environment variables if running directly with node
process.env.NEXT_PUBLIC_NEIS_API_KEY = "3b72e900f7d2482a87bb19092998d666";

testNeis();

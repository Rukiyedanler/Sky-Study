require('dotenv').config();

async function run() {
    const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
    const url = `https://api.pexels.com/videos/search?query=KAYSERI+city&orientation=portrait&size=medium&per_page=1`;
    const res = await fetch(url, { headers: { Authorization: apiKey } });
    const data = await res.json();
    console.log(JSON.stringify(data.videos[0].video_files, null, 2));
}
run();

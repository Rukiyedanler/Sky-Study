const fs = require('fs');
require('dotenv').config();

async function run() {
    const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
    const url = `https://api.pexels.com/videos/search?query=Istanbul+aerial&orientation=landscape&size=large&per_page=1`;
    const res = await fetch(url, { headers: { Authorization: apiKey } });
    const data = await res.json();
    if(data.videos && data.videos.length > 0) {
        const mp4s = data.videos[0].video_files.filter(f => f.file_type === 'video/mp4').sort((a,b) => b.width - a.width);
        const best = mp4s.find(f => f.width <= 1920) || mp4s[0];
        fs.writeFileSync('ist_landscape.txt', best.link);
    }
}
run();

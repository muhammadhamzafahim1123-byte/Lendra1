import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

const processFiles = async () => {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
        if (file.toLowerCase().endsWith('.png')) {
            const inputPath = path.join(publicDir, file);
            const nameWithoutExt = path.parse(file).name;
            const outputPath = path.join(publicDir, `${nameWithoutExt}.webp`);

            console.log(`Processing: ${file}`);
            const stats = fs.statSync(inputPath);
            console.log(`Original size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(outputPath);

            const outStats = fs.statSync(outputPath);
            console.log(`New size: ${(outStats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log('---');
        }
    }
};

processFiles().then(() => console.log('All massive assets squashed into lightweight WebPs!'));

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';

const DIRECTORIES_TO_SCAN = ['content', 'public'];
const MAX_WIDTH = 1920;
const QUALITY = 80;

async function compressImages() {
  console.log('🔍 Memulai pemindaian gambar besar...');
  let totalSavedBytes = 0;
  let compressedCount = 0;

  for (const dir of DIRECTORIES_TO_SCAN) {
    if (!fs.existsSync(dir)) continue;

    // Scan for png, jpg, jpeg, webp
    const files = await glob(`${dir}/**/*.{png,jpg,jpeg,webp}`, { ignore: 'node_modules/**' });
    
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        
        // Only process files larger than 500KB to save time
        if (stats.size > 500 * 1024) {
          console.log(`\n⏳ Mengompresi: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          
          const tempPath = `${file}.tmp.webp`;
          
          await sharp(file)
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toFile(tempPath);
            
          const newStats = fs.statSync(tempPath);
          const savedBytes = stats.size - newStats.size;
          
          if (savedBytes > 0) {
            // Remove old file and replace with new webp
            const dirName = path.dirname(file);
            const baseName = path.basename(file, path.extname(file));
            const finalPath = path.join(dirName, `${baseName}.webp`);
            
            // If the original wasn't a webp, we delete the original
            if (file !== finalPath) {
              fs.unlinkSync(file);
            }
            
            fs.renameSync(tempPath, finalPath);
            
            totalSavedBytes += savedBytes;
            compressedCount++;
            console.log(`✅ Berhasil! Ukuran baru: ${(newStats.size / 1024).toFixed(2)} KB (Menghemat ${(savedBytes / 1024 / 1024).toFixed(2)} MB)`);
          } else {
            // Clean up if the new file is somehow larger
            fs.unlinkSync(tempPath);
            console.log(`⏭️ Dilewati (kompresi tidak mengurangi ukuran).`);
          }
        }
      } catch (err) {
        console.error(`❌ Gagal memproses ${file}:`, err.message);
      }
    }
  }

  console.log('\n========================================');
  console.log(`Selesai! Mengompresi ${compressedCount} gambar.`);
  console.log(`Total kapasitas GitHub terselamatkan: ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB 🚀`);
  console.log('========================================');
}

compressImages();

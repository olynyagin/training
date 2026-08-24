import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Jimp from 'jimp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL) {
  // Fetch image with proper headers since some servers block default requests
  const response = await fetch(inputURL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ImageFilter/1.0)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`URL did not return an image. Content-Type: ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const photo = await Jimp.read(buffer);

  const outpath = path.join(__dirname, '..', 'tmp', `filtered.${Math.floor(Math.random() * 2000)}.jpg`);
  await photo
    .resize(256, 256) // resize
    .quality(60) // set JPEG quality
    .greyscale() // set greyscale
    .writeAsync(outpath);

  return outpath;
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

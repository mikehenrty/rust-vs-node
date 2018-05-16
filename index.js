const fs = require('fs');
const path = require('path');
const mp3Duration = require('mp3-duration');

const MP3_FOLDER = "./mp3s/test";
const CONCURRENCY = 50;

/**
 * Create a function that is the promise version of standard callback apis.
 */
function promisify(ctx, func) {
  return function(...args) {
    return new Promise((res, rej) => {
      args.push((err, result) => {
        if (err) {
          rej(err);
          return;
        }
        res(result);
      });
      func.apply(ctx, args);
    });
  };
}

/**
 * Promise versions of fs node standard lib.
 */
const readdirPromise = promisify(fs, fs.readdir);
const readFilePromise = promisify(fs, fs.readFile);
const renamePromise = promisify(fs, fs.rename);
const durationPromise = promisify(this, mp3Duration);

let sum = 0;

async function processClip(path) {
  const duration = await durationPromise(path);
  sum += duration;
}

async function processAllMP3s(files) {
  let = i = 0;
  while (i < files.length) {
    let slice = new Array(CONCURRENCY);
    for (let j = 0; j < CONCURRENCY; j++) {
      let filePath = files[i + j];
      if (filePath) {
        slice[j] = processClip(filePath);
      }
    }
    await Promise.all(slice);
    i += CONCURRENCY;
  }
}

async function readDurations() {
  let mp3s = [];

  try {
    let files = await readdirPromise(MP3_FOLDER);
    for (let i = 0; i < Math.floor(files.length); i++) {
      let file = files[i];

      // Only use folders.
      if (file.indexOf('.mp3') === -1) {
        continue;
      }

      const filePath = path.join(MP3_FOLDER, file);
      mp3s.push(filePath);
    }

    await processAllMP3s(mp3s);
    console.log('minutes is', Math.round(sum / 60));
  } catch (e) {
    console.error('error', e);
  }
}

readDurations().catch(err => {
  console.error('unhandled exception', err);
});

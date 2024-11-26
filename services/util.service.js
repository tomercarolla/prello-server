import fs from 'fs';

export const utilService = {
  makeId,
  makeLorem,
  getRandomIntInclusive,
  readJsonFile,
  writeJsonFile,
  generateId
};

function makeId(length = 6) {
  var txt = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return txt;
}

function makeLorem(size = 100) {
  var words = [
    'The sky',
    'above',
    'the port',
    'was',
    'the color of television',
    'tuned',
    'to',
    'a dead channel',
    '.',
    'All',
    'this happened',
    'more or less',
    '.',
    'I',
    'had',
    'the story',
    'bit by bit',
    'from various people',
    'and',
    'as generally',
    'happens',
    'in such cases',
    'each time',
    'it',
    'was',
    'a different story',
    '.',
    'It',
    'was',
    'a pleasure',
    'to',
    'burn',
  ];
  var txt = '';
  while (size > 0) {
    size--;
    txt += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return txt;
}

function generateId(prefix) {
    const randomNumbers = Math.floor(100 + Math.random() * 900); // Generates a random 3-digit number
    return `${prefix}${randomNumbers}`;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function readJsonFile(path) {
  const str = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(str);
  return json;
}

function writeJsonFile(path, data) {
  return new Promise((resolve, reject) => {
    const str = JSON.stringify(data, null, 2);
    fs.writeFile(path, str, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

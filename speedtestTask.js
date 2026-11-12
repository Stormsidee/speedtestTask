const https = require('node:https');

const URL = 'https://github.com';
const COUNT = 10;

function download() {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    let bytes = 0;

    const req = https.get(URL, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      res.on('data', (chunk) => {
        bytes += chunk.length;
      });

      res.on('end', () => {
        resolve({ bytes, ms: performance.now() - start });
      });

      res.on('error', reject);
    });

    req.setTimeout(15000, () => req.destroy(new Error('Timeout')));
    req.on('error', reject);
  });
}

async function main() {
  let totalBytes = 0;
  let totalMs = 0;
  let successful = 0;

  for (let i = 1; i <= COUNT; i++) {
    try {
      const { bytes, ms } = await download();

      const speed = (bytes * 8) / (ms * 1000);

      totalBytes += bytes;
      totalMs += ms;
      successful++;

      console.log(`${i}. ${ms.toFixed(0)} мс | ${speed.toFixed(2)} Мбит/с`);
    } catch (error) {
      console.log(`${i}. Ошибка: ${error.message}`);
    }
  }

  if (successful === 0) {
    console.log('Все запросы завершились ошибкой');
    return;
  }

  console.log('\nРезультат:');
  console.log(`Успешных запросов: ${successful}/${COUNT}`);
  console.log(`Среднее время: ${(totalMs / successful).toFixed(0)} мс`);
  console.log(`Скачано: ${totalBytes} байт`);
  console.log(`Средняя скорость: ${((totalBytes * 8) / (totalMs * 1000)).toFixed(2)} Мбит/с`);
}

main();

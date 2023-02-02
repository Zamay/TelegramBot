import TelegramBot  from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import cron  from 'node-cron';

const token = '5892485332:AAFoliCUt8ZuDRGGwP4tLU1SgWWrYl3Mv1U'
const bot = new TelegramBot(token, { polling: true })
let data;

// bot.sendMessage(-1001864669827, "Have a nice day ");

// cron - планувальник завдань
cron.schedule('0 0 7 * * *', async () =>  {
  const body =  {"person_accnt": "310089406"};

  const response = await fetch('https://interruptions.energy.cn.ua/api/info_disable', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  });

  data = await response.json();
  // [час обнови даних, час відправки смс, проміжок часу віключення]
  const msTimeToSend = checkDate(data);

  if (msTimeToSend[1] !== 0) {
    setTimeout(() => {
      bot.sendMessage(-1001864669827, `Можливе відключення світла через 10 хвилин (${msTimeToSend[2]})`);
    } ,msTimeToSend[0])
  }


});

// const data = {
//   "status": "ok",
//   "aData": [{
//     "cause": "Заходи обмеження",
//     "acc_begin": "01-02-2023 17:00",
//     "place": null,
//     "accend_plan": "01-02-2023 23:00"
//   }, {
//     "cause": "Заходи обмеження",
//     "acc_begin": "02-02-2023 02:00",
//     "place": null,
//     "accend_plan": "02-02-2023 08:00"
//   }, {
//     "cause": "Заходи обмеження",
//     "acc_begin": "02-02-2023 11:00",
//     "place": null,
//     "accend_plan": "02-02-2023 17:00"
//   }, {
//     "cause": "Заходи обмеження",
//     "acc_begin": "02-02-2023 20:00",
//     "place": null,
//     "accend_plan": "03-02-2023 05:00"
//   }]
// }
//
// Роблю запрос о 7 ранку -> отримую відповідь
// Беру перший масив -> беру дату початку і кінця -> порівнюю сій час і час початку
// Якщо мій час false, то записую початок часу - 10 хв коли треба відправити смс
// Якщо мій час true, тобі час запроса міняю на час кінця + 10 хв.

// "01-02-2023 23:00"
function checkDate(data) {
  const todayDate = new Date().toISOString();
  const tTime = todayDate.split('T')[1].slice(0,5);
  const tTimeNum = tTime.split(':')[0]*60 + tTime.split(':')[1]*1;
  const serverDateBegin = data?.aData[0]?.acc_begin;
  const sTimeB = serverDateBegin.split(' ')[1];
  const sTimeBNum = sTimeB.split(':')[0]*60 + sTimeB.split(':')[1]*1;
  const serverDateEnd = data?.aData[0]?.accend_plan;
  const sTimeE = serverDateEnd.split(' ')[1];
  const sTimeENum = sTimeE.split(':')[0]*60 + sTimeE.split(':')[1]*1;
  let msSendSms = 0;

  // якщо час раніше тривоги, то відправити смс за 10 хв до початку
  if (tTimeNum > sTimeBNum) {
    msSendSms = (Math.abs(tTimeNum - sTimeBNum) - 10) * 60000;
  }

  const msSendServer = ( sTimeENum + 60 ) * 60000;
  return [msSendServer, msSendSms, `${sTimeB} - ${sTimeE}`]
}


console.log()

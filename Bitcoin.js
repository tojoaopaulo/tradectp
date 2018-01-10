var CTPClient = require('./coreCTPClient.js');

module.exports.PrecoBTC = async function PrecoBTC()
{
  var result = await CTPClient.APIQUERY('GetMarkets', ['USDT']);

  var BTCUSDT = result.filter(function (item) {
    return item.Label == 'BTC/USDT';
  })[0];
  
  return BTCUSDT.LastPrice;
}
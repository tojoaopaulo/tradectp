var CTPClient = require('./coreCTPClient.js');

var precoBTC = 0;
var ultimaConsulta = new Date();

module.exports.PrecoBTC = async function PrecoBTC()
{
  var agora = new Date();
  var atualizaPorTempo =  new Date(agora - ultimaConsulta).getMinutes() >= 1;
  if(!precoBTC > 0 || atualizaPorTempo)
  {
    ultimaConsulta = agora;
    var result = await CTPClient.BuscarMercados('USDT');

    var BTCUSDT = result.filter(function (item) {
      return item.Label == 'BTC/USDT';
    })[0];
    
    precoBTC = BTCUSDT.LastPrice;
    console.log('Valor BTC Atualizado');
  }
  
  return precoBTC;
}
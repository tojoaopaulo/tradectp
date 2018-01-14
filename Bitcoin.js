var CTPClient = require('./coreCTPClient.js');

var precoBTC = 0;
var ultimaConsulta = new Date();

module.exports.PrecoBTC = async function PrecoBTC() {
  var agora = new Date();
  var atualizaPorTempo = new Date(agora - ultimaConsulta).getMinutes() >= 1;
  if (!precoBTC > 0 || atualizaPorTempo) {
    ultimaConsulta = agora;
    //var result = await CTPClient.BuscarMercados('USDT');
    var cota = await CTPClient.BuscarMoedaEspecifica('BITCOIN');

    /*
    var BTCUSDT = result.filter(function (item) {
      return item.Nome == 'BTC';
    })[0];
    */
    //precoBTC = cota.UltimoPreco;
    precoBTC = cota.UltimoPreco;
    console.log('Valor BTC Atualizado');
  }

  return precoBTC;
}
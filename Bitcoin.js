var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');

var cotacao = new Cota();
var ultimaConsulta = new Date();

module.exports.ConsultarCotacaoBTC = async function ConsultarCotacaoBTC()
{
  //var result = await CTPClient.BuscarMercados('USDT');
  cotacao = await CTPClient.BuscarMoedaEspecifica('BITCOIN');
  console.log('Valor BTC Atualizado');
  return cotacao;

  /*
  var BTCUSDT = result.filter(function (item) {
    return item.Nome == 'BTC';
  })[0];
  */
  //precoBTC = cota.UltimoPreco;
  
}

module.exports.PrecoBTC = async function PrecoBTC() {
  var agora = new Date();
  var atualizaPorTempo = new Date(agora - ultimaConsulta).getMinutes() >= 5;
  if (cotacao.UltimoPreco === undefined || !cotacao.UltimoPreco > 0 || atualizaPorTempo) {
    ultimaConsulta = agora;
    await this.ConsultarCotacaoBTC();
  }

  return cotacao.UltimoPreco;
}
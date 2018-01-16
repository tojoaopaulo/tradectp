var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');

var cotacao = new Cota();
var ultimaConsulta = new Date();
var tempoAtualizacaoPreco = 5;
module.exports.tempoAtualizacaoPreco = tempoAtualizacaoPreco;

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
  var atualizaPorTempo = new Date(agora - ultimaConsulta).getMinutes() >= tempoAtualizacaoPreco;
  if (cotacao.UltimoPreco === undefined || !cotacao.UltimoPreco > 0 || atualizaPorTempo) {
    ultimaConsulta = agora;
    await this.ConsultarCotacaoBTC();
  }

  return cotacao.UltimoPreco;
}

module.exports.CotacaoBTC = async function CotacaoBTC () {
  // Garante atualizacao preco BTC
  await this.PrecoBTC();
  
  return cotacao;
}
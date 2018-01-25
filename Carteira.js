var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');
var Bitcoin = require('./Bitcoin.js');
var manipulaCota = require('./manipulaCota.js');

var public_set = ['GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders'];
var private_set = ['GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip'];

module.exports.MinhaCarteira = async function MinhaCarteira() {

  var cotasSalvas = await manipulaCota.LeCotas();

  //TODO: implementar flag para so tentar atualizar cota se houver alteracao
  var carteiraOficial = await CTPClient.ConsultarCarteira();

  for (let [index, cota] of carteiraOficial.entries()) {
    var cotaLocal = cotasSalvas.filter(c => c.Nome == cota.Nome);

    // Se ja existir passa a informação do preço
    if (cotaLocal.length > 0) {
      cota.UltimoPreco = cotaLocal[0].UltimoPreco;
      cota.MaiorPreco = cotaLocal[0].MaiorPreco;
      cota.ValorCompra = cotaLocal[0].ValorCompra;
    }

    cota.ValorCompra = typeof cota.ValorCompra != 'number' ? await this.BuscarPrecoCompra(cota) : cota.ValorCompra;

    carteiraOficial[index] = cota;
    //TODO: implementar depois para pegar valor das cotas compradas que não estão na carteira ainda
  }

  return carteiraOficial;
}

module.exports.BuscarPrecoCompra = async function BuscarPrecoCompra(cota) {
  var historicoTrades = await CTPClient.BuscarHistoricoTrade(cota.Label);

  // Hoje parte da premissa de que ja vem ordenado, logo eh so pegar o primeiro que é o mais recente
  return historicoTrades[0].ValorCompra;
}

module.exports.ImprimirCarteira = async function ImprimirCarteira() {
  var carteira = await this.MinhaCarteira();
  carteira.map(c => console.log("Nome: " + c.Nome + " Total: " + c.Quantidade));
}

exports.EmitirOrdemVenda = async function EmitirOrdemVenda(cota, valor) {

  var result = await CTPClient.CriarOrdemVenda(cota.Label, valor, cota.Quantidade);

  console.log('Ordem de venda: ' + result.OrderID);
}

exports.EmitirOrdemCompra = async function EmitirOrdemCompra(cota) {
  
  var result = await CTPClient.CriarOrdemCompra(cota);

  console.log('Ordem de compra: ' + result.OrderID);
}

module.exports.CancelarOrdem = async function CancelarOrdem(cota) {
  // TODO: SO CANCELAR A VENDA SE A QUANTIDADE RESTANTE FOR MAIOR DO QUE A TX MINIMA DA CORRETORA
  await CTPClient.CancelarOrdem(cota.TradePairId);
}

exports.CalcularTotal = async function CalcularTotal(cotas) {

  if(cotas == undefined)
    cotas = await this.MinhaCarteira();

  var total = 0;

  cotas.forEach((cota) => {
    total += + cota.QuantidadeBTC();
  });

  console.log('Total: $' + total * await Bitcoin.PrecoBTC());
  return total;
}
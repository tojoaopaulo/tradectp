var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');
var Bitcoin = require('./Bitcoin.js');
var manipulaCota = require('./manipulaCota.js');

var public_set = ['GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders'];
var private_set = ['GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip'];

module.exports.MinhaCarteira = async function MinhaCarteira(){

  var cotasSalvas = await manipulaCota.LeCotas();

  //TODO: implementar flag para so tentar atualizar cota se houver alteracao
  var carteiraOficial = await CTPClient.ConsultarCarteira();

  for (let [index, cota] of carteiraOficial.entries())
  {
    var cotaLocal = cotasSalvas.filter(c => c.Nome == cota.Nome );

    // Se ja existir passa a informação do preço
    if(cotaLocal.length > 0)
    {
      cota.UltimoPreco = cotaLocal[0].UltimoPreco;
      cota.MaiorPreco = cotaLocal[0].MaiorPreco;
      cota.ValorCompra = cotaLocal[0].ValorCompra;
    }

    carteiraOficial[index] = cota;
    //TODO: implementar depois para pegar valor das cotas compradas que não estão na carteira ainda
  }

  return carteiraOficial;
}

module.exports.ImprimirCarteira = async function ImprimirCarteira() {
  var carteira = await this.MinhaCarteira();
  carteira.map(c => console.log("Nome: " + c.Nome + " Total: " + c.Quantidade));
}

async function EmitirOrdemVenda(cota, valor) {
  
  var result = await CTPClient.CriarOrdemVenda(cota.Label, preco, cota.Quantidade);

  console.log('Ordem de venda: ' + result.OrderID);
}

module.exports.CancelarOrdem = async function CancelarOrdem(cota) {
  await CTPClient.CancelarOrdem(cota.TradePairId);
}


async function CalcularTotal(cotas) {
  var total = 0;

  cotas.forEach((cota) => {
    total += + cota.QuantidadeBTC();
  });

  console.log('Total: $' + total * await Bitcoin.PrecoBTC());
}

exports.CalcularTotal = CalcularTotal;
exports.EmitirOrdemVenda = EmitirOrdemVenda;

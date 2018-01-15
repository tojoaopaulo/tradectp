var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');
var Bitcoin = require('./Bitcoin.js');


var public_set = ['GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders'];
var private_set = ['GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip'];

async function MinhaCarteira() {
  var result = await CTPClient.ConsultarCarteira();

  result = result.filter(function (item) {
    return item.Total > 0;
  });

  result.map(r => console.log("Nome: " + r.Symbol + " Total: " + r.Total));

  //console.log(JSON.stringify(result));
}

async function EmitirOrdemVenda(cota, valor) {
  
  //var result = await CTPClient.CriarOrdemVenda(cota.Label, preco, cota.Quantidade);

  console.log('Ordem de venda: ' + result.OrderID);
}

async function CalcularTotal(cotas) {
  var total = 0;

  cotas.forEach((cota) => {
    if (cota.Nome === 'BTC')
      total += + cota.Quantidade;
    else
      total += cota.Quantidade * cota.UltimoPreco
  });

  console.log('Total: $' + total * await Bitcoin.PrecoBTC());
}

exports.CalcularTotal = CalcularTotal;
exports.MinhaCarteira = MinhaCarteira;
exports.EmitirOrdemVenda = EmitirOrdemVenda;

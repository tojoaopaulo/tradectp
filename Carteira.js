var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');
var Bitcoin = require('./Bitcoin.js');


var public_set = ['GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders'];
var private_set = ['GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip'];

async function MinhaCarteira() {
  var cotas  = await CTPClient.ConsultarCarteira();

  cotas.map(c => console.log("Nome: " + c.Nome + " Total: " + c.Quantidade));
}

async function EmitirOrdemVenda(cota, valor) {
  
  //var result = await CTPClient.CriarOrdemVenda(cota.Label, preco, cota.Quantidade);

  console.log('Ordem de venda: ' + result.OrderID);
}

async function CalcularTotal(cotas) {
  var total = 0;

  cotas.forEach((cota) => {
    total += + cota.QuantidadeBTC();
  });

  console.log('Total: $' + total * await Bitcoin.PrecoBTC());
}

exports.CalcularTotal = CalcularTotal;
exports.MinhaCarteira = MinhaCarteira;
exports.EmitirOrdemVenda = EmitirOrdemVenda;

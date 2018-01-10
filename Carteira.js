var CTPClient = require('./coreCTPClient.js');
var Cota = require('./cota.js');

var public_set = [ 'GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders' ];
var private_set = [ 'GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip' ];


async function MinhaCarteira()
{
  var result = await CTPClient.APIQUERY('GetBalance');

  result = result.filter(function (item) {
    return item.Total > 0;
  });

  result.map(r => console.log("Nome: "+ r.Symbol + " Total: "+  r.Total));

  //console.log(JSON.stringify(result));
}

async function EmitirOrdemVenda(cota)
{
  var params = {
    Market: cota.Label,
    Type: 'Sell',
    Rate: '11111111',
    Amount: 0.00001
  };
  var result = await CTPClient.APIQUERY('SubmitTrade', params);

  console.log(result.Success + ' ' + result.Error);
}

exports.MinhaCarteira = MinhaCarteira;
exports.EmitirOrdemVenda = EmitirOrdemVenda;

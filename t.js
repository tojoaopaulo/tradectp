process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 
var CTPClient = require('./coreCTPClient.js');

AnalisarHistoricoMercado();

function AnalisarHistoricoMercado(Label, Tempo = 1){
  var public_set = [ 'GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders' ];
  var private_set = [ 'GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip' ];
    
  var param = [Label,Tempo];
  //var param = ['BTC_USD','1'];  

  // PARAM P/ PRIVATE { 'Market': "020/DOGE", 'Type': "Sell", 'Rate': 0.001, 'Amount': 1000 }
  CTPClient.APIQUERY(CalculaTendenciaPorOrdens,'GetMarketHistory', param);
}

function CalculaTendenciaPorOrdens(err, ordens)
{
  var histOrdens = JSON.parse(ordens);
  CalculaTendenciaPorRange(histOrdens, 200);
  CalculaTendenciaPorRange(histOrdens, 20);
}

function CalculaTendenciaPorRange(ordens, qtdOrdensAAnalisar)
{
  var valorProporcao = (15 / 100) * qtdOrdensAAnalisar;
  var amostraOrdens = ordens.Data.slice(0,qtdOrdensAAnalisar);
  
  var compra = amostraOrdens.filter(function (item) {
    return item.Type == "Buy";
  });

  var venda = amostraOrdens.filter(function (item) {
    return item.Type == "Sell";
  });
  
  var proporcaoCxV = compra.length - venda.length;
  
  if(Math.abs(proporcaoCxV) < valorProporcao)
    console.log("MERCADO LATERALIZADO " + proporcaoCxV);
  else if(proporcaoCxV > 0)
    console.log("MERCADO COMPRANDO " + proporcaoCxV);  
  else
    console.log("MERCADO VENDENDO " + proporcaoCxV);
}
var crypto = require('crypto');
const axios = require("axios");
var fs = require('fs');
var Cota = require('./cota.js');

API_KEY = '';
API_SECRET = '';

function CarregarKeys() {
  var keys = JSON.parse(fs.readFileSync('config', 'utf8'));
  API_KEY = keys.API_KEY;
  API_SECRET = keys.API_SECRET;
}

async function apiQuery(method, params) {
  CarregarKeys();

  if (!params) params = {};

  var public_set = ['GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders'];
  var private_set = ['GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip'];
  var host_name = 'https://www.cryptopia.co.nz';

  var uri = '/Api/' + method + '/';

  if (public_set.indexOf(method) > -1) {

    if (params) uri += params.join('/');

    try {
      var url = host_name + uri;
      const resp = await axios.get(url);
      return resp.data.Data;
    } catch (error) {
      console.log(error.message);
    }

  }
  else if (private_set.indexOf(method) > -1) {
    var nonce = Math.floor(new Date().getTime() / 1000);
    var md5 = crypto.createHash('md5').update(JSON.stringify(params)).digest();
    var requestContentBase64String = md5.toString('base64');
    var signature = API_KEY + 'POST' + encodeURIComponent(host_name + uri).toLowerCase() + nonce + requestContentBase64String;

    var hmacsignature = crypto.createHmac('sha256', new Buffer(API_SECRET, 'base64')).update(signature).digest().toString('base64');

    var header_value = 'amx ' + API_KEY + ':' + hmacsignature + ':' + nonce;
    var headers = { 'Authorization': header_value, 'Content-Type': 'application/json; charset=utf-8' };

    try {
      var url = host_name + uri;
      const resp = await axios.post(url, params, { headers: headers });

      return resp.data;
    } catch (error) {
      console.log(error.message);
    }
  }
}

module.exports.BuscarUltimasOrdensEfetivadas = async function BuscarUltimasOrdensEfetivadas(Label, Tempo) {
  //var param = ['BTC_USD','1']; 
  var LblAnalise = Label.replace('/', '_');
  var param = [LblAnalise, Tempo];
  return await apiQuery('GetMarketHistory', param);
}

module.exports.BuscarUltimasOrdensAbertas = async function BuscarUltimasOrdensAbertas(Label) {
  //var param = ['BTC_USD','1']; 
  var LblAnalise = Label.replace('/', '_');
  var param = [LblAnalise];
  return await apiQuery('GetMarketOrders', param);
}

module.exports.BuscarMercados = async function BuscarMercados(Mercado) {

  var cotasCTP = await apiQuery('GetMarkets', [Mercado]);

  var cotas = [];
  for (let cotaCTP of cotasCTP) {
    var nome = cotaCTP.Label.split('/')[0];
    var cota = new Cota(nome, cotaCTP.LastPrice);
    cota.UltimoPreco = cotaCTP.LastPrice;
    cota.Label = cotaCTP.Label;
    cota.TradePairId = cotaCTP.TradePairId;
    cotas.push(cota);
  }

  return cotas;
}

module.exports.CriarOrdemVenda = async function CriarOrdemVenda(label, preco, quantidade) {
  var params = {
    Market: label,
    Type: 'Sell',
    Rate: preco,
    Amount: quantidade
  };
  return await apiQuery('SubmitTrade', params);
}

module.exports.ConsultarCarteira = async function ConsultarCarteira() {
  var result = await apiQuery('GetBalance');

  var cotas = [];
  
  if(result.Success)
  {
    var cotasResp = result.Data.filter(function (item) {
      return item.Total > 0;
    });

    for (let cotaResp of cotasResp) {
      var cota = new Cota(cotaResp.Symbol, undefined, cotaResp.Total);
      cota.UltimoPreco = cotaResp.price_btc;
      cotas.push(cota);
    }
  } 
  return cotas;
}

module.exports.BuscarMercadosExterno = async function (mercado, quantidade = 400) {
  var uri = 'https://api.coinmarketcap.com/v1/ticker/?limit=' + quantidade;

  try {
    const resp = await axios.get(uri);

    var cotas = [];
    for (let cotaResp of resp.data) {
      var cota = new Cota(cotaResp.symbol, cotaResp.price_btc);
      cota.UltimoPreco = cotaResp.price_btc;
      cotas.push(cota);
    }

    return cotas;
  } catch (error) { console.log(error.message); }
}

module.exports.BuscarMoedaEspecifica = async function (label) {
  var uri = 'https://api.coinmarketcap.com/v1/ticker/' + label;

  try {
    const resp = await axios.get(uri);

    var cota = new Cota();
    cota.Nome = resp.data[0].symbol;
    cota.UltimoPreco = label === 'BITCOIN' ? resp.data[0].price_usd : resp.data[0].price_btc;

    cota.Variacao1h = resp.data[0].percent_change_1h;
    cota.Variacao24h = resp.data[0].percent_change_24h;
    cota.Variacao7d = resp.data[0].percent_change_7d;

    return cota;
  } catch (error) { console.log(error.message); }
}

module.exports.CancelarOrdem = async function (TradePairId) {
    var param = { 'Type':  'TradePair', 'TradePairId':TradePairId  };
    return await apiQuery('CancelTrade', param);
}



/*
async.series([
	function(callback) {
		// Public:
		// apiQuery( callback, "GetCurrencies" );
		// +
		// apiQuery( callback, "GetMarket", [ 100, 6 ] );
		// +
		// Private:
		 apiQuery( callback, "GetBalance" );
		// +
		// apiQuery( callback, "SubmitTrade", { 'Market': "020/DOGE", 'Type': "Sell", 'Rate': 0.001, 'Amount': 1000 } )
		// [ '{"Success":true,"Error":null,"Data":{"OrderId":496433,"FilledOrders":[]}}' ]
		//apiQuery( callback, 'CancelTrade', { 'CancelType':  'Trade', 'OrderId': 496433 } );
		// +
		// [ '{"Success":true,"Error":null,"Data":[496433]}' ]
	},
], function(error, results) {
	console.log(results);
});
*/
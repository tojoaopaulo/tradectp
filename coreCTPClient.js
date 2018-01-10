var https = require('https');
var async = require('async');
var crypto = require('crypto');
const axios = require("axios");
var fs = require('fs');

API_KEY='';
API_SECRET='';

function CarregarKeys()
{
  var keys = JSON.parse(fs.readFileSync('config','utf8'));
  API_KEY = keys.API_KEY;
  API_SECRET = keys.API_SECRET;  
}

async function apiQuery(method, params ) {
  CarregarKeys();

	if ( ! params ) params = {};
	
  var public_set = [ 'GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders' ];
  var private_set = [ 'GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip' ];
  var host_name = 'https://www.cryptopia.co.nz';

	var uri = '/Api/' + method + '/';
	
  if ( public_set.indexOf( method ) > -1 ) {

    if ( params ) uri += params.join('/');

    try {
      var url = host_name+uri;
      const resp = await axios.get(url);
      return resp.data;
    } catch (error) {
      console.log(error.message);
    }
		
  } 
  else if (  private_set.indexOf( method ) > -1 )
  {
    var nonce = Math.floor(new Date().getTime() / 1000);
    var md5 = crypto.createHash('md5').update( JSON.stringify( params ) ).digest();
    var requestContentBase64String = md5.toString('base64');
		var signature = API_KEY + 'POST' + encodeURIComponent( host_name + uri ).toLowerCase() + nonce + requestContentBase64String;
		
		var hmacsignature = crypto.createHmac('sha256', new Buffer( API_SECRET, 'base64' ) ).update( signature ).digest().toString('base64');
		
    var header_value = 'amx ' + API_KEY + ':' + hmacsignature + ':' + nonce;
		var headers = { 'Authorization': header_value, 'Content-Type':'application/json; charset=utf-8' };
		
    try {
      var url = host_name+uri;
      const resp = await axios.post(url,params, { headers: headers });

      return resp.data.Data;
    } catch (error) {
      console.log(error.message);
    }
  }
}

exports.APIQUERY = apiQuery;

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
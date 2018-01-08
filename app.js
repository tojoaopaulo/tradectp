process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

var Cota = require('./cota.js')
var cadastroCota = require('./gravacota.js')
const https = require('https');
var inquirer = require('inquirer');

var CTPClient = require('./coreCTPClient.js');


var opts = require('url').parse('https://www.cryptopia.co.nz/api/GetMarkets/BTC');

var precoBTC = 0;

opts.headers = { 
  'User-Agent' : 'javascript',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

//var debug = true;
var debug = false;

if(debug)
{
  cadastroCota.LeCotas(processaCotas);
  
  //var cotas = [];
  //var js = '[{"Nome":"LUX","ValorCompra":0.00111200}]';
  //var arrcota = JSON.parse('[{"Nome":"LUX","ValorCompra":0.00111200}]');

  //arrcota.forEach(element => {
  //  myC = Object.assign( new Cota(), element);
  //  myC.UltimoPreco = 10;
  //  cotas.push(myC);

  //myC.variacaoDePreco();
  //  var a = myC.variacaoPercentualPreco();

  //  imprime(myC);
  //});
  
  //processaCotas(cotas);

  //ConverterCotaBTCXUSD();
}
else
{
  if(process.argv[2] !== undefined)
    ProcessaAcao(process.argv[2]);
  else
    ControlaFluxo();
} 

function ProcessaAcao(acao)
{
  switch(acao)
  {
  case 'q':
    cadastroCota.LeCotas(processaCotas);
    break;
  case 'c':
    cadastroCota.LeCotas(cadastroCota.cadastrarCotas);
    break;
  case 'r':
    cadastroCota.LeCotas(cadastroCota.removerCotas); 
    break;
  case 'i':
    IntegracaoCTPCLient();
    break;
  }
}

function ControlaFluxo()
{
  var questions = [
    {
      type: 'input',
      name: 'acao',
      message: "vai fazer o q viado? q = cotacao, s = sair, c = cadastrar, r = remover"
    }];

  inquirer.prompt(questions).then(answers => {
    ProcessaAcao(answers.acao);
  });
}

function processaCotas(cotas)
{
  https.get(opts, (resp) => {
    let data = '';
   
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
   
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      var cotacoes = JSON.parse(data).Data;

      cotas.forEach((c, index) => {

        c = Object.assign( new Cota(), c);

        if(c.Nome == "BTC")
        {
          c.UltimoPreco = c.ValorCompra;
        }
        else
        {         
          var itemCota = cotacoes.filter(function (item) {
            return item.Label == c.Nome+"/BTC";
          })[0];
  
          c.UltimoPreco = itemCota.LastPrice; 
  
          // salvar cotas
        }
        
        imprimir(c);
        cotas[index] = c;
      });

      cadastroCota.GravaCota(cotas);
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function ConverterCotaBTCXUSD(nome, qtdBTC = 1){
  if(precoBTC == 0)
  {
    var url = 'https://www.cryptopia.co.nz/api/GetMarkets/USDT';
  
    opts = require('url').parse(url);
  
    https.get(opts, (resp) => {
      let data = '';
     
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
     
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        var cotacoes = JSON.parse(data).Data;
    
        var BTCUSDT = cotacoes.filter(function (item) {
          return item.Label == "BTC/USDT";
        })[0];
  
        precoBTC = BTCUSDT.LastPrice;

        //console.log(nome + ": " + (precoBTC * qtdBTC));
        
        var valor = Math.round((precoBTC * qtdBTC) * 100) / 100;
        console.log(nome + ": " + valor);

        //return precoBTC * qtdBTC; asnyc await
          
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
}

function imprimir(cota)
{
  var valor = Math.round(cota.VariacaoPercentualPreco() * 100) / 100;

  console.log(cota.Nome + ' ' + valor * 100 + '%   '  + cota.VariacaoMaiorPreco() +'%         ' + JSON.stringify(cota));

  imprimirLiquidacoes(cota);

  ConverterCotaBTCXUSD(cota.Nome,cota.QuantidadeBTC());
}

function imprimirLiquidacoes(cota){
  if(cota.MelhorLiquidar())
    console.log("Liquidar " + cota.Nome);
}

function IntegracaoCTPCLient(){
  var public_set = [ 'GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders' ];
  var private_set = [ 'GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip' ];
  
  var param = ['BTC_USDT','10'];  
  // PARAM P/ PRIVATE { 'Market': "020/DOGE", 'Type': "Sell", 'Rate': 0.001, 'Amount': 1000 }
  CTPClient.APIQUERY(Imprimir,"GetMarketHistory", param);
}

function Imprimir(err, qlqrCoisa)
{
  console.log(qlqrCoisa);
}
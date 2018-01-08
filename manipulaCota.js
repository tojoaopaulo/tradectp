var inquirer = require('inquirer');
var Cota = require('./cota.js');
const https = require('https');
var CTPClient = require('./coreCTPClient.js');
var opts = require('url').parse('https://www.cryptopia.co.nz/api/GetMarkets/BTC');

opts.headers = { 
  'User-Agent' : 'javascript',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

var precoBTC = 0;

exports.LeCotas = (acaoSeguinte) => LeCotas(acaoSeguinte);

function LeCotas(acaoSeguinte)
{
  const fs = require('fs');

  fs.readFile('./cotas.txt', function(err,data){
    if (err) throw err;

    var cotas = data.length != 0 ? JSON.parse(data) : [];

    acaoSeguinte(cotas);
  }); 
}

exports.removerCotas = removerCotas;

function removerCotas(cotas){
  console.log(JSON.stringify(cotas));
  var questions = [
    {
      type: 'input',
      name: 'nome',
      message: "Deleta o que? [NOME]"
    }
  ];

  inquirer.prompt(questions).then(answers => 
  { 
    cotas = cotas.filter(e => e.Nome !== answers.nome);

    console.log(JSON.stringify(cotas));
    GravaCota(cotas);  
  });

}

exports.cadastrarCotas = cadastrarCotas;

function cadastrarCotas(cotas){
  LeQlqrMerda(cotas);
}

function LeQlqrMerda(cotas)
{
  var questions = [
    {
      type: 'input',
      name: 'nome',
      message: "moeda"
    },
    {
      type: 'input',
      name: 'valor',
      message: "valor"
    },
    {
      type: 'input',
      name: 'quantidade',
      message: "quantidade"
    }
  ];
  console.log(JSON.stringify(cotas));

  inquirer.prompt(questions).then(answers => 
  {   
    try {
      cotas.push(new Cota(answers.nome, answers.valor, answers.quantidade));  
    } 
    catch (error) 
    {
      console.log('DEU BODE NA CRIAÇÃO DA COTA ' + JSON.stringify(error));  
    }
    GravaCota(cotas);  
  });
}

exports.GravaCota = GravaCota;

function GravaCota(cotas)
{
  const fs = require('fs');

  fs.writeFile('cotas.txt', JSON.stringify(cotas), (err) => {
    if(err) throw err;

    console.log('salvado viado');
  });
}

exports.ConverterCotaBTCXUSD = ConverterCotaBTCXUSD;

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
          return item.Label == 'BTC/USDT';
        })[0];
  
        precoBTC = BTCUSDT.LastPrice;
        
        var valor = Math.round((precoBTC * qtdBTC) * 100) / 100;
        console.log(nome + ': ' + valor);          
      });
    }).on('error', (err) => {
      console.log('Error: ' + err.message);
    });
  }
}

exports.AnalisarHistoricoMercado = AnalisarHistoricoMercado;
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


exports.processaCotas = processaCotas;
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

        if(c.Nome == 'BTC')
        {
          c.UltimoPreco = c.ValorCompra;
        }
        else
        {         
          var itemCota = cotacoes.filter(function (item) {
            return item.Label == c.Label;
          })[0];
  
          c.UltimoPreco = itemCota.LastPrice; 
  
          // salvar cotas
        }
        
        imprimir(c);
        cotas[index] = c;
      });

      GravaCota(cotas);
    });
  }).on('error', (err) => {
    console.log('Error: ' + err.message);
  });
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
    console.log('Liquidar ' + cota.Nome);
}
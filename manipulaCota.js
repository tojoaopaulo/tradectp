var inquirer = require('inquirer');
var Cota = require('./cota.js');
var Bitcoin = require('./Bitcoin.js');
var CTPClient = require('./coreCTPClient.js');

var public_set = [ 'GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders' ];
var private_set = [ 'GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip' ];

var precoBTC = 0;

async function LeCotas()
{
  const fs = require('fs-promise');

  var cotas = await fs.readFile('./cotas.txt', 'utf8');
  cotas = cotas != undefined && cotas != '' ? JSON.parse(cotas) : [];

  return cotas;
}

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

function GravaCota(cotas)
{
  const fs = require('fs');

  fs.writeFile('cotas.txt', JSON.stringify(cotas), (err) => {
    if(err) throw err;
  });
}

async function ConverterCotaBTCXUSD(nome, qtdBTC = 1){
  var precoBTC = await Bitcoin.PrecoBTC();
  var valor = Math.round((precoBTC * qtdBTC) * 100) / 100;
  console.log(nome + ': ' + valor);  
}

async function AnalisarHistoricoMercado(Label, Tempo = 1){

  var param = [Label,Tempo];
  //var param = ['BTC_USD','1'];  

  // PARAM P/ PRIVATE { 'Market': "020/DOGE", 'Type': "Sell", 'Rate': 0.001, 'Amount': 1000 }
  var result = await CTPClient.APIQUERY('GetMarketHistory', param);

  if(result != null)
    CalculaTendenciaPorOrdens(result);
  else
    console.log("deu ruim ");
}

function CalculaTendenciaPorOrdens(ordens)
{
  var histOrdens = ordens;
  CalculaTendenciaPorRange(histOrdens, 200);
  CalculaTendenciaPorRange(histOrdens, 20);
}

function CalculaTendenciaPorRange(ordens, qtdOrdensAAnalisar)
{
  var valorProporcao = (15 / 100) * qtdOrdensAAnalisar;
  var amostraOrdens = ordens.slice(0,qtdOrdensAAnalisar);
  
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

async function processaCotas(cotas)
{
  var cotacoes = await CTPClient.APIQUERY('GetMarkets', ['BTC'] );

  for(let c of cotas)
  {
    c = Object.assign( new Cota(), c);

    if(c.Nome == 'BTC')
      c.UltimoPreco = await Bitcoin.PrecoBTC();
    else
    {         
      var itemCota = cotacoes.filter(function (item) {
        return item.Label == c.Label;
      })[0];
  
       c.UltimoPreco = itemCota.LastPrice; 
    }
    await imprimir(c);
    //cotas[index] = c;
  }
/*
  cotas.forEach(async (c, index) => {
    c = Object.assign( new Cota(), c);

    if(c.Nome == 'BTC')
      c.UltimoPreco = await Bitcoin.PrecoBTC();
    else
    {         
      var itemCota = cotacoes.filter(function (item) {
        return item.Label == c.Label;
      })[0];
  
       c.UltimoPreco = itemCota.LastPrice; 
    }
      imprimir(c);
      cotas[index] = c;
  });*/
  ImprimirValorBTC();
  GravaCota(cotas);
}

function ImprimirValorBTC()
{
  ConverterCotaBTCXUSD('BTC');
}

async function imprimir(cota)
{
  var valor = Math.round(cota.VariacaoPercentualPreco() * 100) / 100;

  console.log(cota.Nome + ' ' + valor * 100 + '%   '  + cota.VariacaoMaiorPreco() +'%         ' + JSON.stringify(cota));

  await imprimirLiquidacoes(cota);

  await ConverterCotaBTCXUSD(cota.Nome,cota.QuantidadeBTC());
}

function imprimirLiquidacoes(cota){
  if(cota.MelhorLiquidar())
    console.log('Liquidar ' + cota.Nome);
}

exports.removerCotas = removerCotas;
exports.ConverterCotaBTCXUSD = ConverterCotaBTCXUSD;
exports.LeCotas = LeCotas;
exports.cadastrarCotas = cadastrarCotas;
exports.GravaCota = GravaCota;
exports.AnalisarHistoricoMercado = AnalisarHistoricoMercado;
exports.processaCotas = processaCotas;

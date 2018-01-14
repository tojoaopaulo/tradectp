var inquirer = require('inquirer');
var Cota = require('./cota.js');
var Bitcoin = require('./Bitcoin.js');
var CTPClient = require('./coreCTPClient.js');
var Estrategia = require('./Estrategia.js');
var Carteira = require('./Carteira.js');

var public_set = ['GetCurrencies', 'GetTradePairs', 'GetMarkets', 'GetMarket', 'GetMarketHistory', 'GetMarketOrders'];
var private_set = ['GetBalance', 'GetDepositAddress', 'GetOpenOrders', 'GetTradeHistory', 'GetTransactions', 'SubmitTrade', 'CancelTrade', 'SubmitTip'];

var precoBTC = 0;

async function LeCotas() {
  const fs = require('fs-promise');

  var cotas = await fs.readFile('./cotas.txt', 'utf8');
  cotas = cotas != undefined && cotas != '' ? JSON.parse(cotas) : [];

  for (let [index, cota] of cotas.entries()) {
    cota = Object.assign(new Cota(), cota);
    cotas[index] = cota;
  }

  return cotas;
}

function removerCotas(cotas) {
  console.log(JSON.stringify(cotas));
  var questions = [
    {
      type: 'input',
      name: 'nome',
      message: "Deleta o que? [NOME]"
    }
  ];

  inquirer.prompt(questions).then(answers => {
    cotas = cotas.filter(e => e.Nome !== answers.nome);

    console.log(JSON.stringify(cotas));
    GravaCota(cotas);
  });

}

function cadastrarCotas(cotas) {
  LeQlqrMerda(cotas);
}

function LeQlqrMerda(cotas) {
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

  inquirer.prompt(questions).then(answers => {
    try {
      cotas.push(new Cota(answers.nome, answers.valor, answers.quantidade));
    }
    catch (error) {
      console.log('DEU BODE NA CRIAÇÃO DA COTA ' + JSON.stringify(error));
    }
    GravaCota(cotas);
  });
}

function GravaCota(cotas) {
  const fs = require('fs');
  var JSONCotas = JSON.stringify(cotas);
  fs.writeFile('cotas.txt', JSONCotas, (err) => {
    if (err) throw err;
    //console.log(JSONCotas);
  });
}

async function ConverterCotaBTCXUSD(nome, qtdBTC = 1) {
  var precoBTC = await Bitcoin.PrecoBTC();
  var valor = Math.round((precoBTC * qtdBTC) * 100) / 100;
  console.log(nome + ': ' + valor);
}

async function processaCotas(cotas) {
  var cotacoes = await CTPClient.BuscarMercados('BTC');
  //var cotacoes = await CTPClient.BuscarMercadosExterno('BTC');

  for (let [index, cota] of cotas.entries()) {
    cota = Object.assign(new Cota(), cota);

    if (cota.Nome == 'BTC')
      cota.UltimoPreco = await Bitcoin.PrecoBTC();
    else {
      var itemCota = cotacoes.filter(function (item) {
        return item.Label == cota.Label;
      })[0];

      cota.UltimoPreco = itemCota.UltimoPreco;
    }
    await imprimir(cota);
    cotas[index] = cota;
  }

  ImprimirValorBTC();
  GravaCota(cotas);
  Carteira.CalcularTotal(cotas);
}

function ImprimirValorBTC() {
  ConverterCotaBTCXUSD('BTC');
}

async function imprimir(cota) {
  var valor = Math.round(cota.VariacaoPercentualPreco() * 100) / 100;

  console.log(cota.Nome + ' ' + valor * 100 + '%   ' + cota.VariacaoMaiorPreco() + '%         ' + cota.UltimoPreco + '|' + cota.ValorCompra + '|' + cota.MaiorPreco);

  await ConverterCotaBTCXUSD(cota.Nome, cota.QuantidadeBTC());
  await imprimirLiquidacoes(cota);
}

async function imprimirLiquidacoes(cota) {
  if (await Estrategia.MelhorVender(cota))
    console.log('Liquidar ' + cota.Nome);
}

module.exports.removerCotas = removerCotas;
module.exports.ConverterCotaBTCXUSD = ConverterCotaBTCXUSD;
module.exports.LeCotas = LeCotas;
module.exports.cadastrarCotas = cadastrarCotas;
module.exports.GravaCota = GravaCota;
module.exports.processaCotas = processaCotas;
module.exports.imprimirLiquidacoes = imprimirLiquidacoes;

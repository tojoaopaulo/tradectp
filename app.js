process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

var Cota = require('./cota.js');
var manipulaCota = require('./manipulaCota.js');
const https = require('https');
var inquirer = require('inquirer');
var CTPClient = require('./coreCTPClient.js');


//var debug = true;
var debug = false;

if(debug)
{
  manipulaCota.LeCotas(processaCotas);
  
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
    manipulaCota.LeCotas(manipulaCota.processaCotas);
    break;
  case 'c':
    manipulaCota.LeCotas(manipulaCota.cadastrarCotas);
    break;
  case 'r':
    manipulaCota.LeCotas(manipulaCota.removerCotas); 
    break;
  case 'i':
    manipulaCota.AnalisarHistoricoMercado('LUX_BTC',1);
    break;
  }
}

function ControlaFluxo()
{
  var questions = [
    {
      type: 'input',
      name: 'acao',
      message: 'vai fazer o q viado? q = cotacao, s = sair, c = cadastrar, r = remover'
    }];

  inquirer.prompt(questions).then(answers => {
    ProcessaAcao(answers.acao);
  });
}
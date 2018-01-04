var Cota = require('./cota.js')
var cadastroCota = require('./gravacota.js')

const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

var url = 'https://www.cryptopia.co.nz/api/GetMarkets/BTC';
var inquirer = require('inquirer');
var opts = require('url').parse(url);

opts.headers = { 
  'User-Agent' : 'javascript',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

//var debug = true;
var debug = false;

if(debug)
{
  //cadastroCota.LeCotas(processaCotas);
  var cotas = [];
  var js = '[{"Nome":"LUX","Valor":0.00111200}]';
  var arrcota = JSON.parse('[{"Nome":"LUX","Valor":0.00111200}]');

  arrcota.forEach(element => {
    myC = Object.assign( new Cota(), element);
    myC.UltimoPreco = 10;
    cotas.push(myC);

    //myC.variacaoDePreco();
    var a = myC.variacaoPercentualPreco();

    imprime(myC);
  });
  
  processaCotas(cotas);
}
else
  ControlaFluxo();
  
function ControlaFluxo()
{
  var questions = [
    {
      type: 'input',
      name: 'acao',
      message: "vai fazer o q viado? q = cotacao, s = sair, c = cadastrar, r = remover"
    }];

    inquirer.prompt(questions).then(answers => {
      switch(answers.acao)
      {
        case 'q':
          cadastroCota.LeCotas(processaCotas);
          break;
        case 'c':
          cadastroCota.LeCotas(cadastroCota.cadastrarCotas); //.then(ControlaFluxo());
          break;
        case 'r':
          processaCotas();
          break;
      }

      //var cotas = [];
      //cotas.push(new Cota(answers.nome, answers.valor));
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
  
      cotas.forEach(c => {

        c = Object.assign( new Cota(), c);

        var itemCota = cotacoes.filter(function (item) {
          return item.Label == c.Nome+"/BTC";
        })[0];

        c.UltimoPreco = itemCota.LastPrice; 

        imprime(c);
      });
  
    });
   1
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  
}

function imprime(cota)
{
  var desc = "Ganhando ";
  if (cota.variacaoDePreco()> 0)
    desc = "Perdeu trouxa ";

  var valor = (cota.variacaoPercentualPreco() * 100) / 100;

  console.log(cota.Nome + " - " + desc + valor * 100 + ' %' + ' ' + JSON.stringify(cota));
}
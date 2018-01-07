process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

var Cota = require('./cota.js')
var cadastroCota = require('./gravacota.js')
const https = require('https');
var inquirer = require('inquirer');
var opts = require('url').parse('https://www.cryptopia.co.nz/api/GetMarkets/BTC');

var precoBTC = 0;

opts.headers = { 
  'User-Agent' : 'javascript',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

//var debug = true;
var debug = false;

if(debug)
{
  cadastroCota.LeCotas(processaCotas);
  
  //var cotas = [];
  //var js = '[{"Nome":"LUX","Valor":0.00111200}]';
  //var arrcota = JSON.parse('[{"Nome":"LUX","Valor":0.00111200}]');

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
          c.UltimoPreco = c.Valor;
        }
        else
        {         
          var itemCota = cotacoes.filter(function (item) {
            return item.Label == c.Nome+"/BTC";
          })[0];
  
          c.UltimoPreco = itemCota.LastPrice; 
  
          // salvar cotas
        }
        
        imprime(c);
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

          console.log(nome + ": " + (precoBTC * qtdBTC));
          //return precoBTC * qtdBTC; asnyc await
          
        });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
}

function imprime(cota)
{
  var valor = Math.round(cota.VariacaoPercentualPreco() * 100) / 100;

  console.log(cota.Nome + ' ' + valor * 100 + '%              ' + JSON.stringify(cota));

  ConverterCotaBTCXUSD(cota.Nome,cota.QuantidadeBTC());
}
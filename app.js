var geracota = require('./cota.js')
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

try {
  ControlaFluxo();
} catch (error) {
  console.log('deu merda' + error.message);
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
      switch(answers.acao)
      {
        case 'q':
          processaCotas();
          break;
        case 'c':
          cadastroCota.LeCotas(cadastroCota.cadastrarCotas);
          break;
        case 'r':
          processaCotas();
          break;
      }

      //var cotas = [];
      //cotas.push(new Cota(answers.nome, answers.valor));
    });
}

function processaCotas()
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
  
      var LUX = cotacoes.filter(function (item) {
        return item.Label === "LUX/BTC";
      } );
  
      var DBET = cotacoes.filter(function (item) {
        return item.Label === "DBET/BTC";
      } );
  
      var SEND = cotacoes.filter(function (item) {
        return item.Label === "SEND/BTC";
      } );
  
      var SKY = cotacoes.filter(function (item) {
        return item.Label === "SKY/BTC";
      } );
  
      var testedoido = 0;
  
      var luxComprado = 0.00111200;
      var dbetComprado = 0.00003801;
      var sendComprado = 0.00002400;
      var skyComprado = 0.00359239;
  
      var luxDif = (luxComprado - LUX[0].LastPrice)/luxComprado;
      var dbetDif = (dbetComprado - DBET[0].LastPrice)/dbetComprado;
      var sendDif = (sendComprado - SEND[0].LastPrice)/sendComprado;
      var skyDif = (skyComprado - SKY[0].LastPrice)/skyComprado;
  
      imprime(LUX[0].Label, luxDif);
      imprime(DBET[0].Label, dbetDif);
      imprime(SEND[0].Label, sendDif);
      imprime(SKY[0].Label, skyDif);
  
      var total = luxDif + dbetDif + sendDif + skyDif;
      total = total / 4;
  
    });
   1
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  
}

function imprime(lbl, valor)
{
  var desc = " Ganhando ";
  if (valor > 0)
    desc = " Perdeu trouxa ";
    
  
  valor = Math.round(valor * 100) / 100;

  console.log(lbl +  desc + valor * 100 + ' %' );
}
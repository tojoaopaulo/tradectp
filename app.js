const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

var url = 'https://www.cryptopia.co.nz/api/GetMarkets/BTC';

var opts = require('url').parse(url);
opts.headers = { 
  'User-Agent' : 'javascript',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

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

    //console.log(LUX[0].LastPrice + DBET[0].LastPrice + SEND[0].LastPrice + SKY[0].LastPrice);

    //console.log(data);   
  });
 1
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

function imprime(lbl, valor)
{
  var desc = " Ganhando ";
  if (valor > 0)
    desc = " Perdeu trouxa ";
    
  
  valor = Math.round(valor * 100) / 100;

  console.log(lbl +  desc + valor * 100 + ' %' );
} if (valor > 0)
    desc = " Perdeu trouxa ";
    
  
  valor = Math.round(valor * 100) / 100;

  console.log(lbl +  desc + valor * 100 + ' %' );
}

function GravaCota()
{
  const fs = require('fs');

  let teste = "vai mano";

  fs.writeFile('cotas.txt', teste, (err) => {
    if(err) throw err;

    console.log('salvado viado');
  })

}

function Cota(nome, valor )
{
  this.Valor = valor;
  this.Nome = nome;
}

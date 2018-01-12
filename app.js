process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

var Carteira = require('./Carteira.js');
var manipulaCota = require('./manipulaCota.js');
var Estrategia = require('./Estrategia.js');
var inquirer = require('inquirer');

if(process.argv[2] !== undefined)
  ProcessaAcao(process.argv[2]);
else
  ControlaFluxo();

async function ProcessaAcao(acao)
{
  switch(acao)
  {
  case 'q':
  try {
    manipulaCota.processaCotas(await manipulaCota.LeCotas());    
  } catch (error) {
    console.log(error)
  }
    break;
  case 'c':
    manipulaCota.cadastrarCotas(await manipulaCota.LeCotas());
    break;
  case 'r':
    manipulaCota.removerCotas(await manipulaCota.LeCotas()); 
    break;
  case 'i':
    Estrategia.AnalisarHistoricoMercado('SKY_BTC',1);
    break;
  case 'm':
    Carteira.MinhaCarteira();
    break;
  case 'v':
    Carteira.EmitirOrdemVenda({Label: 'SKY/BTC'});
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

module.exports.ProcessaAcao = ProcessaAcao;
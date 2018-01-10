process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

var Carteira = require('./Carteira.js');
var manipulaCota = require('./manipulaCota.js');
var inquirer = require('inquirer');

if(process.argv[2] !== undefined)
  ProcessaAcao(process.argv[2]);
else
  ControlaFluxo();

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
    manipulaCota.AnalisarHistoricoMercado('SKY_BTC',1);
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
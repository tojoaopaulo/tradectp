var inquirer = require('inquirer');

var Cota = require('./cota.js')

//LeCotas(cadastrarCotas);    

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

function GravaCota(cotas)
{
  const fs = require('fs');

  fs.writeFile('cotas.txt', JSON.stringify(cotas), (err) => {
    if(err) throw err;

    console.log('salvado viado');
  });
}

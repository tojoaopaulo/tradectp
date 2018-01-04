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
    console.log('chamou acao seguinte');
  }); 
}

exports.cadastrarCotas = cadastrarCotas;

function cadastrarCotas(cotas){
  console.log('acao seguinte ' + JSON.stringify(cotas));
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
    }
  ];
  console.log('le qlqr merda ' + JSON.stringify(cotas));

  inquirer.prompt(questions).then(answers => 
  {   
    console.log('inq 1 ' + JSON.stringify(cotas));

    try {
      cotas.push(new Cota(answers.nome, answers.valor));  
    } 
    catch (error) 
    {
      console.log('DEU BODE NA CRIAÇÃO DA COTA ' + JSON.stringify(error));  
    }
    GravaCota(cotas);  

    console.log('inq 2 ' + JSON.stringify(cotas));
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

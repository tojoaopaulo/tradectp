var inquirer = require('inquirer');

var geracota = require('./cota.js')


//LeCotas(cadastrarCotas);    


exports.LeCotas = (acaoSeguinte) => LeCotas(acaoSeguinte);

function LeCotas(acaoSeguinte)
{
  const fs = require('fs');

  fs.readFile('cotas.txt', function(err,data){
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

  inquirer.prompt(questions).then(answers => {
    //var cotas = [];11

    console.log('inq 1 ' + JSON.stringify(cotas));

    cotas.push(geracota.NovaCota(answers.nome, answers.valor));
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
  })
}

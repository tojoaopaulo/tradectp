var assert = require('assert');
var Carteira = require('../Carteira.js');
var Bitcoin = require('../Bitcoin.js');
var Cota = require('../Cota.js');
var Controlador = require('../app.js');

/*
describe('Carteira', ()=> {
  it('Deve imprimir minha carteira na CTP', () => {
    Carteira.MinhaCarteira('SKY/BTC');
  });

  it('Deve criar uma ordem com sucesso', () => {
    Carteira.EmitirOrdemVenda({ 'Label': 'SKY/BTC' });
  });

});*/

describe('Bitcoin', () => {
  it('Deve retornar o valor do bitcoin', async () => {
    assert.ok(await Bitcoin.PrecoBTC() > 0);
    //done();
  });
});

describe('Cota', () => {
  it('Ao criar uma nova cota e atribuir um ultimo valor, deve atualizar o maior valor', () => {
    var cota = new Cota('BTC', 100, 1);
    cota.UltimoPreco = 10;
    assert.equal(cota.MaiorPreco, cota.UltimoPreco);
  });

  it('Ao criar uma nova cota via JSON e atribuir um ultimo valor, deve atualizar o maior valor', () => {
    var json = '{"Nome":"BTC","Label":"BTC/BTC","ValorCompra":"13990","Quantidade":"0.00537","MaiorPreco":{},"ultimoPreco":{}}';

    var cota = JSON.parse(json);

    cota = Object.assign( new Cota(), cota);

    cota.UltimoPreco = 10;
    assert.equal(cota.MaiorPreco, cota.UltimoPreco);
  });
});

describe('Controlador de fluxo', () =>
    it('Ao tentar processar as cotas o sistema deve conseguir realizar todas as operacoes com sucesso', () => {
        Controlador.ProcessaAcao('q');
    })
);

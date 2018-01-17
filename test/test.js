var assert = require('assert');
var Carteira = require('../Carteira.js');
var Bitcoin = require('../Bitcoin.js');
var Cota = require('../Cota.js');
var Estrategia = require('../Estrategia.js');
var Controlador = require('../app.js');
var manipulaCota = require('../manipulaCota.js');
var CTPClient = require('../coreCTPClient.js');

describe('Carteira', () => {
  it('Deve imprimir minha carteira na CTP', async () => {
    await Carteira.MinhaCarteira('SKY/BTC');
  });

  it('Deve calcular o valor total em USD de acordo com a cotacao atual', async () => {
    var cotas = await manipulaCota.LeCotas();
    await Carteira.CalcularTotal();
  });
  /*
    it('Deve criar uma ordem com sucesso', async() => {
      await Carteira.EmitirOrdemVenda({ 'Label': 'SKY/BTC' });
    });
  */

});

describe('Bitcoin', () => {
  it('Deve retornar o valor do bitcoin', async () => {
    assert.ok(await Bitcoin.PrecoBTC() > 0);
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

    cota = Object.assign(new Cota(), cota);

    cota.UltimoPreco = 10;
    assert.equal(cota.MaiorPreco, cota.UltimoPreco);
  });
});

describe('Controlador de fluxo', () => {
  it.only('Ao tentar processar as cotas o sistema deve conseguir realizar todas as operacoes com sucesso', async () => {
    await Controlador.ProcessaAcao('q');
  })
});

describe('Manipulador de cota', () => {
  it('Ao verificar se é melhor vender, deve calcular se o mercado esta em queda ou subindo e analisar a tendencia', async () => {

    var cota = new Cota('LUX', 13990, 1);
    cota.UltimoPreco = 13500;
    cota.MaiorPreco = 15000;

    //manipulaCota.MelhorVender(cota);
    manipulaCota.imprimirLiquidacoes(cota);
  });
});

describe('Estrategia', () => {
    it('Calcula o melhor valor de venda para BTC deve criar uma ordem de venda no segundo menor valor existente', async() => {
        var cota = new Cota();
        cota.Label = 'BTC/USDT';
        cota.Quantidade = 1;

        Estrategia.GerarMelhorOrdemVenda(cota);
    });

    it('Verifica se esta na hora de sair de determinado ativo, seja pelo preço da BTC ou por tendencia do mercado', async() => {
      var cota = new Cota();
      cota.Label = 'LUX/BTC';
      cota.Quantidade = 1;

      Estrategia.MelhorVender(cota);
  });
});

describe('CORE CTP', () => {
    it('Deve cancelar uma ordem em aberto', async() => {
        var result = await CTPClient.CancelarOrdem(5074); // BTX PAIR
        assert.ok(result.Success);
    })
})

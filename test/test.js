var assert = require('assert');
var Carteira = require('../Carteira.js');
var Bitcoin = require('../Bitcoin.js');
var Cota = require('../Cota.js');
var Estrategia = require('../Estrategia.js');
var Controlador = require('../app.js');
var manipulaCota = require('../manipulaCota.js');
var CTPClient = require('../coreCTPClient.js');

function MockCota() {
  var cota = new Cota();
    cota.Nome = 'BTC';
    cota.Label = 'BTC/USDT';
    cota.ValorCompra = 14000;
    cota.MaiorPreco = 11358.7,
    cota.UltimoPreco = 10000,
    cota.TradePairId = 4909;
    cota.Quantidade = 1;

  return cota;
}

describe('Carteira', () => {
  it('Deve imprimir minha carteira na CTP', async () => {
    await Carteira.MinhaCarteira();
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

  it('Deve buscar o historico das ultimas trades', async () => {
    var preco = await Carteira.BuscarPrecoCompra(MockCota());

    assert.ok(typeof preco === 'number');
  });
  

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

  it('Verifica se um ativo esta em queda', () => {
    var json = '{"Nome":"DOGE","Label":"DOGE/BTC","ValorCompra":7.2e-7,"Quantidade":5000,"MaiorPreco":7e-7,"ultimoPreco":6.6e-7,"TradePairId":102}';

    var cota = JSON.parse(json);

    cota = Object.assign(new Cota(), cota);

    Nuassert.ok(cota.EstaEmQueda());
  });

  it.only('Verifica se esta atualizando o maior valor corretamente', () => {
    var json = '{"Nome":"RKC","Label":"RKC/BTC","ValorCompra":0.00015397,"Quantidade":20.21475591,"MaiorPreco":0.00015657,"ultimoPreco":0.00016102,"TradePairId":5466}';

    var cota = JSON.parse(json);

    cota = Object.assign(new Cota(), cota);

    cota.UltimoPreco = 0.00016102;

    assert.ok(cota.MaiorPreco == cota.UltimoPreco);
  });

});

describe('Controlador de fluxo', () => {
  it('Ao tentar processar as cotas o sistema deve conseguir realizar todas as operacoes com sucesso', async () => {
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
    cota.Nome = 'BTC';
    cota.Label = 'BTC/USDT';
    cota.ValorCompra = 14000;
    cota.MaiorPreco = 11358.7,
    cota.UltimoPreco = 10000,
    cota.TradePairId = 4909;
    cota.Quantidade = 1;

    Estrategia.MelhorVender(cota);
  });

  it('Deve analisar o historico do mercado e dar 5 sugestões de compra de ativos em alta', async() => {
    Estrategia.SugestaoCompra();
});
  
});

describe('CORE CTP', () => {
    it('Deve cancelar uma ordem em aberto', async() => {
        var result = await CTPClient.CancelarOrdem(5074); // BTX PAIR
        assert.ok(result.Success);
    })
})

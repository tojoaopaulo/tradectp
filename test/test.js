var assert = require('assert');
var Carteira = require('../Carteira.js');

describe('Carteira', ()=> {
  it('Deve imprimir minha carteira na CTP', () => {
    Carteira.MinhaCarteira('SKY/BTC');
  });

  it('Deve criar uma ordem com sucesso', () => {
    Carteira.EmitirOrdemVenda({ 'Label': 'SKY/BTC' });
  });

});
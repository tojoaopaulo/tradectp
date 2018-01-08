'use strict';

class Cota
{
  constructor (nome, valor, quantidade)
  {
    this.Nome = nome;
    this.Label = nome + '/BTC';
    this.ValorCompra = valor;
    this.Quantidade = quantidade;
    this.MaiorPreco = 0;
    // privada
    var ultimoPreco;
  }

  get UltimoPreco(){
    return this.ultimoPreco;
  }

  set UltimoPreco(value){
    this.ultimoPreco = value;

    if(value > this.MaiorPreco)
      this.MaiorPreco = value;
  }

  VariacaoDePreco() {
    return this.UltimoPreco - this.ValorCompra;
  }

  VariacaoPercentualPreco()
  {
    return this.VariacaoDePreco()/this.ValorCompra;
  }

  QuantidadeBTC()
  {
    if(this.Nome === 'BTC')
      return this.Quantidade;

    return this.UltimoPreco * this.Quantidade;
  }

  VariacaoMaiorPreco()
  {
    return Math.round(((this.UltimoPreco - this.MaiorPreco) / this.MaiorPreco) * 100);
  }

  MelhorLiquidar()
  {
    // Se ja existiu alguma alta, entao considera o valor de down em 5%
    if(this.MaiorPreco > this.ValorCompra  && this.VariacaoMaiorPreco() < -5)
      return true;
    else
      // Se nao houver alta e o preco atual tiver queda de > 7% vende
      return this.VariacaoMaiorPreco() < -7;
  }
}

module.exports = Cota;

function testeCota()
{
  var c = new Cota('vai', 10);
  c.UltimoPreco = 11;

  console.log(JSON.stringify(c));
  console.log(c.variacaoDePreco());
  console.log(c.variacaoPercentualPreco());
}

//testeCota();
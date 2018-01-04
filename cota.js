"use strict"

class Cota
{
  constructor (nome, valor, quantidade)
  {
      this.Nome = nome;
      this.Valor = valor;
      this.Quantidade = quantidade;
      this.MaiorPreco;
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
    return this.UltimoPreco - this.Valor;
  }

  VariacaoPercentualPreco()
  {
    return this.VariacaoDePreco()/this.Valor;
  }

  QuantidadeBTC()
  {
    if(this.Nome === "BTC")
      return this.Quantidade;

    return this.UltimoPreco * this.Quantidade;
  }
}

module.exports = Cota;

function testeCota()
{
  var c = new Cota("vai", 10);
  c.UltimoPreco = 11;

  console.log(JSON.stringify(c));
  console.log(c.variacaoDePreco());
  console.log(c.variacaoPercentualPreco());
}

//testeCota();
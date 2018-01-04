"use strict"

class Cota
{
  constructor (nome, valor )
  {
      this.Nome = nome;
      this.Valor = valor;
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

  variacaoDePreco() {
    return this.Valor - this.UltimoPreco;
  }

  variacaoPercentualPreco()
  {
    return this.variacaoDePreco()/this.Valor;
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
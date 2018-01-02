function Cota(nome, valor )
{
  this.Nome = nome;
  this.Valor = valor;
  this.UltimoPreco;
  this.MaiorPreco;
}

exports.NovaCota = (nome, valor) => new Cota(nome, valor); 
//
const express = require("express");
const rotas = express();

const { listarCategorias } = require("./controladores/categorias");
const { verificarLogin } = require("./intermediarios/autenticacao");

const {
  cadastrarUsuarios,
  loginUsuario,
  detalharUsuario,
  atualizarUsuario,
} = require("./controladores/usuarios");

const {
  detalharTransacao,
  listarTransacoes,
  atualizarTransacao,
  excluirTransacao,
  cadastrarTransacao,
} = require("./controladores/transacoes");

rotas.post("/usuario", cadastrarUsuarios);
rotas.post("/login", loginUsuario);

rotas.use(verificarLogin);

rotas.get("/usuario", detalharUsuario);
rotas.post("/transacao", cadastrarTransacao);
rotas.put("/usuario", atualizarUsuario);
rotas.get("/categoria", listarCategorias);
rotas.get("/transacao", listarTransacoes);
rotas.get("/transacao/:id", detalharTransacao);
rotas.put("/transacao/:id", atualizarTransacao);
rotas.delete("/transacao/:id", excluirTransacao);

module.exports = rotas;

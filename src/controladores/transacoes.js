//
const pool = require("../conexao/conexao");

const detalharTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows, rowCount } = await pool.query(
      "select * from transacoes where  id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Transação não encontrada" });
    }

    const categoriaNome = await pool.query(
      "select descricao from categorias where id = $1",
      [rows[0].categoria_id]
    );

    const transacaoDetalhada = {
      id: rows[0].id,
      descricao: rows[0].descricao,
      valor: rows[0].valor,
      data: rows[0].data,
      categoria_id: rows[0].categoria_id,
      tipo: rows[0].tipo,
      usuario_id: rows[0].usuario_id,
      categoria_nome: categoriaNome.rows[0].descricao,
    };

    return res.json(transacaoDetalhada);
  } catch (error) {
    return res.status(500).json("Erro interno do servidor");
  }
};

const cadastrarTransacao = async (req, res) => {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const id = req.usuario.id;

  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }
    const categoriaExiste = await pool.query(
      "select * from categorias where id = $1",
      [categoria_id]
    );
    if (categoriaExiste.rowCount === 0) {
      return res.status(400).json({ mensagem: "Digite uma categoria válida" });
    }
    if (tipo != "entrada" && tipo != "saida") {
      return res.status(400).json({ mensagem: "Digite um tipo válido" });
    }
    const query =
      "insert into transacoes (descricao,valor,data,categoria_id,tipo,usuario_id) values ($1,$2,$3,$4,$5,$6) returning *";
    const { rows } = await pool.query(query, [
      descricao,
      valor,
      data,
      categoria_id,
      tipo,
      id,
    ]);

    const novaTransacao = {
      id: rows[0].id,
      descricao: rows[0].descricao,
      valor: rows[0].valor,
      data: rows[0].data,
      categoria_id: rows[0].categoria_id,
      tipo: rows[0].tipo,
      usuario_id: id,
      categoria_nome: categoriaExiste.rows[0].descricao,
    };

    return res.status(200).json(novaTransacao);
  } catch (error) {
    return res.status(500).json("Erro interno do servidor");
  }
};

const listarTransacoes = async (req, res) => {
  const { id } = req.usuario;
  const { filtro } = req.query;

  try {
    let query = `SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
                 FROM transacoes t
                 JOIN categorias c ON t.categoria_id = c.id
                 WHERE t.usuario_id = $1`;
    let valores = [id];

    const { rows: listagem } = await pool.query(query, valores);

    if (filtro) {
      transacoesFiltrada = listagem.filter((transacao) => {
        return filtro.includes(transacao.categoria_nome);
      });
    }

    return res.status(200).json(listagem);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const atualizarTransacao = async (req, res) => {
  const { usuario_id, id } = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;

  try {
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }

    let query = `SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2`;
    let valores = [id, usuario_id];

    const transacaoExistente = await pool.query(query, valores);

    if (transacaoExistente.rowCount === 0) {
      return res.status(404).json({
        mensagem: "Transação não encontrada ou não pertence ao usuário logado.",
      });
    }

    let query2 = `SELECT id FROM categorias WHERE id = $1`;
    let valores2 = [categoria_id];

    const categoriaExistente = await pool.query(query2, valores2);

    if (categoriaExistente.rowCount === 0) {
      return res.status(400).json({ mensagem: "Categoria não encontrada." });
    }
    if (tipo !== "entrada" && tipo !== "saida") {
      return res
        .status(400)
        .json({ mensagem: "Todos os campos são obrigatórios" });
    }

    let query3 = `UPDATE transacoes 
                    SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 
                    WHERE id = $6`;
    let valores3 = [descricao, valor, data, categoria_id, tipo, id];

    await pool.query(query3, valores3);

    return res.status(204).json({ mensagem: "Atualização realizada" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const excluirTransacao = async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.usuario.id;
  try {
    let query = `SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2`;
    let valores = [id, usuario_id];

    const transacaoExistente = await pool.query(query, valores);

    if (transacaoExistente.rowCount === 0) {
      return res.status(404).json({ mensagem: "Transação não encontrada." });
    }

    let query2 = `DELETE FROM transacoes WHERE id = $1`;
    let valores2 = [id];

    await pool.query(query2, valores2);

    return res.status(204).json({ mensagem: "Transação excluida com sucesso" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  detalharTransacao,
  listarTransacoes,
  cadastrarTransacao,
  atualizarTransacao,
  excluirTransacao,
};

//
const pool = require('../conexao/conexao');


const listarCategorias = async (req, res) => {

    try {

        let query = `SELECT id, descricao FROM categorias`;
        const { rows: categoria } = await pool.query(query)

        return res.status(200).json(categoria);

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
};

module.exports = { listarCategorias };
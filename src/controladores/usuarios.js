//
const bcrypt = require("bcrypt");
const pool = require("../conexao/conexao");
const jwt = require("jsonwebtoken");
const senhaJwt = require("../seguranca/senhaJwt");

const cadastrarUsuarios = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Todos os campos obrigatórios devem ser informados.",
      });
    }
    const emailExiste = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );

    if (emailExiste.rowCount > 0) {
      return res.status(400).json({ mensagem: "Esse email já existe" });
    }
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const query =
      "insert into usuarios (nome,email,senha) values ($1,$2,$3) returning *";

    const { rows } = await pool.query(query, [nome, email, senhaCriptografada]);

    const { senha: _, ...usuario } = rows[0];
    return res.status(201).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro do servidor" });
  }
};

const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res
      .status(401)
      .json({ mensagem: "O email e a senha são obrigatórios" });
  }
  try {
    const usuario = await pool.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (usuario.rowCount === 0) {
      return res.status(400).json({ mensagem: "Email ou senha inválido" });
    }

    const { senha: senhaDoUsuario } = usuario.rows[0];

    const senhaCorreta = await bcrypt.compare(senha, senhaDoUsuario);
    if (!senhaCorreta) {
      return res.status(400).json({ mensagem: "Email ou senha inválido" });
    }

    const token = jwt.sign({ id: usuario.rows[0].id }, senhaJwt, {
      expiresIn: "8h",
    });

    const novoUsuario = {
      id: usuario.rows[0].id,
      nome: usuario.rows[0].nome,
      email: usuario.rows[0].email,
    };

    return res.status(200).json({ novoUsuario, token });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro do servidor" });
  }
};

const detalharUsuario = async (req, res) => {
  const { id } = req.usuario;

  try {
    let query = `SELECT id, nome, email FROM usuarios WHERE id = $1`;
    let valores = [id];

    const usuarioEncontrado = await pool.query(query, valores);

    if (usuarioEncontrado.rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário nao encontrado" });
    }

    const usuario = usuarioEncontrado.rows[0];
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const atualizarUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  const { nome, email, senha } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Os campos nome, email e senha são obrigatórios" });
    }

    let query = `SELECT id FROM usuarios WHERE email = $1 AND id != $2`;
    let valores = [email, usuario_id];

    const verificarEmail = await pool.query(query, valores);

    if (verificarEmail.rows[0]) {
      //testar
      return res
        .status(400)
        .json({ mensagem: "O e-mail informado já está sendo utilizado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    let query2 = `UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4`;
    let valores2 = [nome, email, senhaCriptografada, usuario_id];

    await pool.query(query2, valores2); //testar

    return res.status(204).json({ mensagem: "Dados atualizados com sucesso" });
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  cadastrarUsuarios,
  loginUsuario,
  detalharUsuario,
  atualizarUsuario,
};

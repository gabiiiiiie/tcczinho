import json
from flask import Flask, request, jsonify
import mysql.connector
from werkzeug.security import check_password_hash

app = Flask(__name__)


# CONEXÃO COM O BANCO
def conectar():
    return mysql.connector.connect(
        host="localhost",
        port=3306,
        database="almoxarifado",
        user="root",
        password=""
    )


# =========================
# LOGIN
# =========================

@app.route("/api/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True) or request.get_json(force=True)

    if not dados or not isinstance(dados, dict):
        return jsonify({"erro": "Envie os dados no formato JSON válido"}), 400

    username = dados.get("username")
    password = dados.get("password")

    if not username or not password:
        return jsonify({"erro": "Usuário e senha são obrigatórios"}), 400

    banco = conectar()
    cursor = banco.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM usuarios WHERE username = %s",
        (username,)
    )

    usuario = cursor.fetchone()

    cursor.close()
    banco.close()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    if not check_password_hash(usuario["password"], password):
        return jsonify({"erro": "Senha incorreta"}), 401

    return jsonify({
        "mensagem": "Login realizado",
        "usuario": usuario["username"],
        "role": usuario["role"]
    })


# =========================
# 1. LISTAR ITENS (GET)
# =========================
@app.route("/api/itens", methods=["GET"])
def listar_itens():
    try:
        banco = conectar()
        cursor = banco.cursor(dictionary=True)

        cursor.execute("SELECT * FROM estoque ORDER BY Id ASC")
        itens = cursor.fetchall()

        cursor.close()
        banco.close()

        return jsonify(itens), 200

    except Exception as erro:
        return jsonify({"erro_banco": str(erro)}), 500


# =========================
# 2. CADASTRAR ITEM (POST)
# =========================
@app.route("/api/itens", methods=["POST"])
def cadastrar_item():
    dados = request.get_json(silent=True) or request.get_json(force=True)

    if isinstance(dados, str):
        try:
            dados = json.loads(dados)
        except Exception:
            pass

    if not isinstance(dados, dict):
        return jsonify({"erro": "Envie os dados em formato JSON válido"}), 400

    campos_obrigatorios = {
        "nome": "O campo 'nome' é obrigatório.",
        "quantidade": "O campo 'quantidade' é obrigatório.",
        "estoque": "O campo 'estoque' é obrigatório.",
        "descricao": "O campo 'descricao' é obrigatório.",
        "preco": "O campo 'preco' é obrigatório.",
        "categoria": "O campo 'categoria' é obrigatório.",
        "foto": "O campo 'foto' é obrigatório."
    }

    for campo, mensagem_erro in campos_obrigatorios.items():
        valor = dados.get(campo)
        if valor is None or (isinstance(valor, str) and valor.strip() == ""):
            return jsonify({"erro": mensagem_erro}), 400

    try:
        banco = conectar()
        cursor = banco.cursor()

        cursor.execute(
            """
            INSERT INTO estoque
            (Nome, Quantidade, Estoque, Descricao, Preco, Categoria, Foto)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                dados["nome"],
                int(dados["quantidade"]),
                int(dados["estoque"]),
                dados["descricao"],
                float(dados["preco"]),
                dados["categoria"],
                dados["foto"]
            )
        )

        banco.commit()
        cursor.close()
        banco.close()

        return jsonify({"mensagem": "Item cadastrado com sucesso"}), 201

    except Exception as erro:
        return jsonify({"erro_banco": str(erro)}), 500


# =========================
# MOVIMENTAÇÃO
# =========================

@app.route("/api/movimentacao", methods=["POST"])
def movimentacao():
    dados = request.get_json(silent=True) or request.get_json(force=True)

    if not dados or not isinstance(dados, dict):
        return jsonify({
            "erro": "Envie os dados no formato JSON válido e com o cabeçalho Content-Type: application/json"
        }), 400

    id_item = dados.get("id_item")
    tipo = dados.get("tipo")
    quantidade = dados.get("quantidade")

    if not id_item or not tipo or quantidade is None:
        return jsonify({
            "erro": "Informe id_item, tipo e quantidade"
        }), 400

    if tipo not in ["entrada", "saida"]:
        return jsonify({
            "erro": "Tipo deve ser entrada ou saida"
        }), 400

    try:
        quantidade = int(quantidade)
    except ValueError:
        return jsonify({"erro": "A quantidade deve ser um número inteiro"}), 400

    if quantidade <= 0:
        return jsonify({
            "erro": "A quantidade deve ser maior que zero"
        }), 400

    banco = conectar()
    cursor = banco.cursor()

    cursor.execute(
        "SELECT Quantidade FROM estoque WHERE Id = %s",
        (id_item,)
    )

    item = cursor.fetchone()

    if not item:
        cursor.close()
        banco.close()

        return jsonify({
            "erro": "Item não encontrado"
        }), 404

    quantidade_atual = item[0]

    if tipo == "entrada":
        nova_quantidade = quantidade_atual + quantidade
    else:
        if quantidade > quantidade_atual:
            cursor.close()
            banco.close()

            return jsonify({
                "erro": "Estoque insuficiente",
                "estoque_atual": quantidade_atual
            }), 400

        nova_quantidade = quantidade_atual - quantidade

    cursor.execute(
        """
        UPDATE estoque
        SET Quantidade = %s
        WHERE Id = %s
        """,
        (nova_quantidade, id_item)
    )

    banco.commit()

    cursor.close()
    banco.close()

    return jsonify({
        "mensagem": "Estoque atualizado",
        "quantidade_anterior": quantidade_atual,
        "quantidade_atual": nova_quantidade
    }), 200



# =========================
# 1. LISTAR USUÁRIOS (GET)
# =========================
@app.route("/api/usuarios", methods=["GET"])
def listar_usuarios():
    try:
        banco = conectar()
        cursor = banco.cursor(dictionary=True)

        # Não retornamos a senha por questões de segurança
        cursor.execute("SELECT id, username, role FROM usuarios ORDER BY id ASC")
        usuarios = cursor.fetchall()

        cursor.close()
        banco.close()

        return jsonify(usuarios), 200

    except Exception as erro:
        return jsonify({"erro_banco": str(erro)}), 500


# =========================
# 2. CADASTRAR USUÁRIO (POST)
# =========================
@app.route("/api/usuarios", methods=["POST"])
def cadastrar_usuario():
    dados = request.get_json(silent=True) or request.get_json(force=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Envie os dados em formato JSON válido"}), 400

    # Validação dos campos obrigatórios
    campos_obrigatorios = {
        "username": "O campo 'username' é obrigatório.",
        "password": "O campo 'password' é obrigatório.",
        "role": "O campo 'role' é obrigatório."
    }

    for campo, mensagem in campos_obrigatorios.items():
        valor = dados.get(campo)
        if valor is None or (isinstance(valor, str) and valor.strip() == ""):
            return jsonify({"erro": mensagem}), 400

    # Criptografa a senha antes de salvar
    senha_hash = generate_password_hash(dados["password"])

    try:
        banco = conectar()
        cursor = banco.cursor()

        cursor.execute(
            """
            INSERT INTO usuarios (username, password, role)
            VALUES (%s, %s, %s)
            """,
            (dados["username"], senha_hash, dados["role"])
        )

        banco.commit()
        cursor.close()
        banco.close()

        return jsonify({"mensagem": "Usuário cadastrado com sucesso"}), 201

    except Exception as erro:
        # Trata caso tente cadastrar um username que já existe (UNIQUE)
        if "Duplicate entry" in str(erro):
            return jsonify({"erro": "Este nome de usuário já está em uso."}), 400
        return jsonify({"erro_banco": str(erro)}), 500

# =========================
# INICIAR API
# =========================

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5001
    )
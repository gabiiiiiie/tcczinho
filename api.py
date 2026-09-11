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

    dados = request.get_json()

    username = dados.get("username")
    password = dados.get("password")

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
# LISTAR ESTOQUE
# =========================

@app.route("/api/itens", methods=["GET"])
def listar_itens():

    banco = conectar()
    cursor = banco.cursor(dictionary=True)

    cursor.execute("SELECT * FROM estoque ORDER BY Id ASC")

    itens = cursor.fetchall()

    cursor.close()
    banco.close()

    return jsonify(itens)


# =========================
# CADASTRAR ITEM
# =========================

@app.route("/api/itens", methods=["POST"])
def cadastrar_item():

    dados = request.get_json()

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
            dados["quantidade"],
            dados["estoque"],
            dados["descricao"],
            dados["preco"],
            dados["categoria"],
            dados["foto"]
        )
    )

    banco.commit()

    cursor.close()
    banco.close()

    return jsonify({
        "mensagem": "Item cadastrado com sucesso"
    }), 201


# =========================
# MOVIMENTAÇÃO
# =========================

@app.route("/api/movimentacao", methods=["POST"])
def movimentacao():

    dados = request.get_json()

    if not dados:
        return jsonify({
            "erro": "Envie os dados em JSON"
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

    quantidade = int(quantidade)

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
# INICIAR API
# =========================

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5001
    )

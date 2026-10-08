from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import mysql.connector
# IMPORTAÇÃO DA CRIPTOGRAFIA (Adicionado)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'chave_secreta_para_seguranca'

# CONFIGURAÇÃO DE CONEXÃO PADRÃO 
def obter_conexao():
    return mysql.connector.connect(
        host="db",
        port=3306,
        database="almoxarifado",
        user='root',
        password="mysql_root",
        charset= "utf8mb4"
)

# 1. ROTA INDEX
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


# ROTA QUE VALIDA O LOGIN
@app.route("/login", methods=["POST"])
def login():
    username_digitado = request.form.get("username")
    password_digitada = request.form.get("password")
    role_selecionado = request.form.get(
        "role"
    )  # Pega o 1 (Admin) ou 2 (Usuário) do HTML

    # VALIDAÇÃO OBRIGATÓRIA DO SELECT NO BACKEND
    if not role_selecionado or role_selecionado not in ["1", "2"]:
        flash("Por favor, selecione um nível de acesso.", "erro_login")
        return redirect(url_for("index"))

    try:
        conexao = obter_conexao()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM usuarios WHERE username = %s", (username_digitado,)
        )
        usuario_encontrado = cursor.fetchone()

        cursor.close()
        conexao.close()

        # Ajustado de 'senha' para 'password' para bater com o seu INSERT do banco
        if usuario_encontrado and check_password_hash(
            usuario_encontrado["password"], password_digitada
        ):

            # Bloqueia o login se o cargo selecionado na tela inicial não bater com o cargo real do banco
            # Ex: Se o banco diz 'admin' mas no select ele colocou '2' (Usuário), ou vice-versa.
            cargo_banco = usuario_encontrado["role"]
            if (role_selecionado == "1" and cargo_banco != "admin") or (
                role_selecionado == "2" and cargo_banco != "user"
            ):
                flash(
                    "O nível de acesso selecionado não corresponde ao deste usuário.",
                    "erro_login",
                )
                return redirect(url_for("index"))

            session["usuario_logado"] = username_digitado
            session["usuario_role"] = cargo_banco  # Salva 'admin' ou 'user'

            return redirect(url_for("banco"))

        else:
            flash("Usuário ou senha incorretos!", "erro_login")
            return redirect(url_for("index"))

    except mysql.connector.Error as erro:
        print(f"Erro no banco de dados: {erro}")
        flash("Erro técnico ao conectar com o banco.", "erro_login")
        return redirect(url_for("index"))


# ROTA DE CADASTRO DE USUÁRIOS
@app.route("/cadastrar_usuarios", methods=["GET", "POST"])
def cadastrar_usuarios():
    # BARREIRA DE SEGURANÇA: Se não for administrador, barra o acesso
    if (
        "usuario_logado" not in session
        or session.get("usuario_role") != "admin"
    ):
        flash(
            "Acesso negado. Esta página é restrita a administradores.",
            "erro_login",
        )
        return redirect(url_for("index"))

    # =====================================================
    # PROCESSA O CADASTRO (QUANDO FOR POST)
    # =====================================================
    if request.method == "POST":
        novo_username = request.form.get("username")
        nova_senha = request.form.get("password")
        nova_role = request.form.get("role")  # Captura a escolha do HTML

        #

        # CRIPTOGRAFIA: Transforma a senha em uma hash segura
        senha_criptografada = generate_password_hash(nova_senha)

   

        try:
            conexao = obter_conexao()
            cursor = conexao.cursor()

            cursor.execute(
                "INSERT INTO usuarios (username, password, role) VALUES (%s, %s, %s)",
                (novo_username, senha_criptografada, nova_role),
            )

            conexao.commit()
            cursor.close()
            conexao.close()
            
            flash("Novo usuário cadastrado com sucesso!", "sucesso")
            return redirect(url_for("cadastrar_usuarios"))  # Redireciona para limpar a tela e mostrar a mensagem

        except mysql.connector.Error as err:
            print(f"Erro no Banco de Dados: {err}")
            flash(
                "Erro ao cadastrar usuário (Nome de usuário já pode existir).",
                "erro",
            )
            # Garante o fechamento mesmo em caso de erro no POST antes de continuar
            if 'cursor' in locals() and cursor: cursor.close()
            if 'conexao' in locals() and conexao: conexao.close()

    # =====================================================
    # BUSCAR USUÁRIOS DO MYSQL (EXECUTA SEMPRE NO GET)
    # =====================================================
    try:
        conexao = obter_conexao()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT id, username, role
            FROM usuarios
            ORDER BY id ASC
        """)

        usuarios = cursor.fetchall()

        cursor.close()
        conexao.close()
        
    except mysql.connector.Error as err:
        print(f"Erro ao buscar usuários: {err}")
        usuarios = [] # Lista vazia para não quebrar o HTML caso o banco falhe

    # =====================================================
    # ENVIA OS USUÁRIOS PARA O HTML
    # =====================================================
    return render_template(
        'cadastrar_usuarios.html',
        usuarios=usuarios
    )

   

# ROTA QUE MOSTRA OS ITENS DO ESTOQUE (Unificada e Protegida)
@app.route('/banco', methods=['GET'])
def banco():
    if 'usuario_logado' not in session:
        return redirect(url_for('index'))

    try:
        conexao = obter_conexao()
        cursor = conexao.cursor()
        cursor.execute('SELECT * FROM estoque ORDER BY Id ASC')
        resposta = cursor.fetchall()
        
        cursor.close()
        conexao.close()
        return render_template('banco.html', resposta=resposta)
    except mysql.connector.Error as erro:
        return f"Erro ao carregar estoque: {erro}", 500


# ROTA PARA LOGOUT (Limpa toda a sessão com segurança)
@app.route('/logout')
def logout():
    session.clear() 
    return redirect(url_for('index'))


# ROTA QUE RECEBE OS DADOS DO FORMULÁRIO E SALVA NO BANCO
# 1. ROTA QUE CARREGA A PÁGINA DO FORMULÁRIO (GET)
@app.route('/adicionaritens', methods=['GET'])
def adicionaritens():
    if 'usuario_logado' not in session: 
        return redirect(url_for('index'))
    return render_template('adicionaritens.html')


# 2. ROTA QUE RECEBE OS DADOS E SALVA NO BANCO (POST)
@app.route('/salvaritem', methods=['POST'])
def salvaritem():
    if 'usuario_logado' not in session:
        return redirect(url_for('index'))

    nome = request.form.get('nome')
    quantidade = request.form.get('quantidade')
    estoque = request.form.get('estoque')
    descricao = request.form.get('descricao')
    preco = request.form.get('preco')
    categoria = request.form.get('categoria')
    foto = request.form.get('foto')

    # Validação no servidor: se faltar algo, redireciona de volta com aviso
    if not all([nome, quantidade, estoque, descricao, preco, categoria, foto]):
        flash("Todos os campos devem ser preenchidos!", "erro")
        return redirect(url_for('adicionaritens'))

    try:
        conexao = obter_conexao()
        cursor = conexao.cursor()

        comando_sql = """
            INSERT INTO estoque 
            (Nome, Quantidade, Estoque, Descricao, Preco, Categoria, Foto)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        valores = (nome, int(quantidade), int(estoque), descricao, float(preco), categoria, foto)

        cursor.execute(comando_sql, valores)
        conexao.commit()

        cursor.close()
        conexao.close()

        flash("Item cadastrado com sucesso!", "sucesso")
        return redirect(url_for('banco'))

    except mysql.connector.Error as erro:
        print(f"Erro ao salvar item: {erro}")
        flash("Erro interno ao tentar salvar o item.", "erro")
        return redirect(url_for('adicionaritens'))
    

# ROTA PARA PAGINA MOVIMENTAÇÃO 
@app.route('/movimentacao', methods=['GET', 'POST'])
def tela_movimentar():
    if 'usuario_logado' not in session: 
        return redirect(url_for('index'))
    try:
        conexao = obter_conexao()
        cursor = conexao.cursor()
        cursor.execute('SELECT Id, Nome, Quantidade FROM estoque')
        itens = cursor.fetchall()
        cursor.close()
        conexao.close()
        return render_template('movimentacao.html', itens=itens)
    except mysql.connector.Error as erro:
        return "Erro ao carregar itens", 500


@app.route('/salvar', methods=['POST'])
def salvar():
    if 'usuario_logado' not in session: 
        return redirect(url_for('index'))
    
    id = request.form.get('id_item')
    opcao = request.form.get('tipo')
    qtde = int(request.form.get('quantidade'))
    
    try:
        conexao = obter_conexao()
        cursor = conexao.cursor()
        cursor.execute('SELECT Quantidade FROM estoque WHERE id = %s', (id,))
        qtde_banco = cursor.fetchone()

        if qtde_banco:
            if opcao == 'entrada':
                qtde_atualizada = qtde_banco[0] + qtde
            elif opcao == 'saida':
                qtde_atualizada = qtde_banco[0] - qtde
                
            cursor.execute('UPDATE estoque SET Quantidade = %s WHERE id = %s', (qtde_atualizada, id,))
            conexao.commit()
            
        cursor.close()
        conexao.close()
        return redirect(url_for('banco'))
        
    except mysql.connector.Error as erro:
        print(f"Erro ao atualizar quantidade: {erro}")
        return "Erro ao atualizar quantidade no banco", 500


####################################
@app.route("/api/login", methods=["POST"])
def login_web():
    dados = request.get_json(silent=True) or request.get_json(force=True)

    if not dados or not isinstance(dados, dict):
        return jsonify({"erro": "Envie os dados no formato JSON válido"}), 400

    username = dados.get("username")
    password = dados.get("password")

    if not username or not password:
        return jsonify({"erro": "Usuário e senha são obrigatórios"}), 400


    banco = obter_conexao()
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
        banco = obter_conexao()
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

    if not dados:
         return jsonify({"erro": "Preencha todos os campos!"}), 400


    campos_obrigatorios = {
        "nome": "O campo 'nome' é obrigatório.",
        "quantidade": "O campo 'quantidade' é obrigatório.",
        "estoque": "O campo 'estoque' é obrigatório.",
        "descricao": "O campo 'descricao' é obrigatório.",
        "preco": "O campo 'preco' é obrigatório.",
        "categoria": "O campo 'categoria' é obrigatório.",
        "foto": "O campo 'foto' é obrigatório."
    }

    erros = []

    # Verifica todos os campos e guarda as mensagens de erro
    for campo, mensagem_erro in campos_obrigatorios.items():
        valor = dados.get(campo)
        if valor is None or (isinstance(valor, str) and valor.strip() == ""):
            erros.append(mensagem_erro)

    # Se encontrar um ou mais erros, retorna a lista completa
    if erros:
        return jsonify({"erros": erros}), 400

    # Conversão de tipos com validação prévia
    try:
        quantidade = int(dados["quantidade"])
        estoque = int(dados["estoque"])
        preco = float(dados["preco"])
    except ValueError:
        return jsonify({"erro": "Os campos quantidade, estoque e preço devem ser números válidos."}), 400

    try:
        banco = obter_conexao()
        cursor = banco.cursor()

        cursor.execute(
            """
            INSERT INTO estoque 
            (Nome, Quantidade, Estoque, Descricao, Preco, Categoria, Foto)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                dados["nome"].strip(),
                quantidade,
                estoque,
                dados["descricao"].strip(),
                preco,
                dados["categoria"].strip(),
                dados["foto"].strip()
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

    banco = obter_conexao()
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
        banco = obter_conexao()
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

    # Validação do tamanho mínimo da senha
    senha = dados.get("password", "")
    if len(str(senha)) < 4:
        return jsonify({"erro": "A senha deve conter no mínimo 4 caracteres."}), 400

    for campo, mensagem in campos_obrigatorios.items():
        valor = dados.get(campo)
        if valor is None or (isinstance(valor, str) and valor.strip() == ""):
            return jsonify({"erro": mensagem}), 400

    # Criptografa a senha antes de salvar
    senha_hash = generate_password_hash(dados["password"])

    try:
        banco = obter_conexao()
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
        port=5000
    )
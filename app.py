from flask import Flask, render_template, request, redirect, url_for, flash, session
import mysql.connector
# IMPORTAÇÃO DA CRIPTOGRAFIA (Adicionado)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'chave_secreta_para_seguranca'

# CONFIGURAÇÃO DE CONEXÃO PADRÃO 
def obter_conexao():
    return mysql.connector.connect(
        host='localhost',
        port=3306,
        database='almoxarifado',
        user='root',
        password=''
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
@app.route('/salvaritem', methods=['POST'])
def salvar_item():
    if 'usuario_logado' not in session: 
        return redirect(url_for('index'))
    
    nome = request.form['nome']
    quantidade = request.form['quantidade']
    estoque = request.form['estoque']
    descricao = request.form['descricao']
    preco_form = request.form['preco']  
    categoria = request.form.get('categoria')
    foto = request.form['foto']

    try:
        conexao = obter_conexao()
        cursor = conexao.cursor()

        comando_sql = """
            INSERT INTO estoque (Nome, Quantidade, Estoque, Descricao, Preco, Categoria, Foto) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        valores = (nome, quantity := quantidade, estoque, descricao, preco_form, categoria, foto)
        
        cursor.execute(comando_sql, valores)
        conexao.commit()
        
        cursor.close()
        conexao.close()

        return redirect(url_for('banco'))
    except mysql.connector.Error as erro:
        print(f"Erro ao salvar item: {erro}")
        return "Erro ao salvar item no banco", 500


# 4. ROTA PARA ADICIONAR ITENS 
@app.route('/adicionaritens', methods=['POST', 'GET'])
def adicionaritens():
    if 'usuario_logado' not in session: 
        return redirect(url_for('index'))
    return render_template('adicionaritens.html')
    

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0,')

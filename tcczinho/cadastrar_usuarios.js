import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';

export default function CadastrarUsuariosScreen({ navegar }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' ou 'admin'

  // Dados mockados simulando a lista do banco de dados do seu HTML
  const [usuarios, setUsuarios] = useState([
    ['1', 'admin_senai', 'admin'],
    ['2', 'joao_silva', 'user'],
    ['3', 'maria_almoxarifado', 'user'],
  ]);

  const lidarComCadastro = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios!');
      return;
    }

    // Adiciona o novo usuário na lista simulada (Simula o POST do Flask)
    const novoId = String(usuarios.length + 1);
    setUsuarios([...usuarios, [novoId, username, role]]);

    Alert.alert('Pronto!', `Usuário "${username}" cadastrado com sucesso!`);
    
    // Limpa os campos do formulário
    setUsername('');
    setPassword('');
    setRole('user');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* CARD DO FORMULÁRIO */}
        <View style={styles.card}>
          <Text style={styles.formTitulo}>Cadastro de Usuário</Text>

          {/* CAMPO NOME */}
          <Text style={styles.label}>Nome de Usuário</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Digite o login" 
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          {/* CAMPO SENHA */}
          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Digite a senha" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* CAMPO NÍVEL DE PERMISSÃO */}
          <Text style={styles.label}>Nível de Permissão</Text>
          <View style={styles.rowSelector}>
            <TouchableOpacity 
              style={[styles.btnSelect, role === 'user' && styles.btnSelectAtivo]} 
              onPress={() => setRole('user')}
            >
              <Text style={[styles.txtSelect, role === 'user' && styles.txtSelectAtivo]}>Usuário</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnSelect, role === 'admin' && styles.btnSelectAtivo]} 
              onPress={() => setRole('admin')}
            >
              <Text style={[styles.txtSelect, role === 'admin' && styles.txtSelectAtivo]}>Administrador</Text>
            </TouchableOpacity>
          </View>

          {/* BOTÕES DE AÇÃO */}
          <TouchableOpacity style={styles.botaoRegistrar} onPress={lidarComCadastro}>
            <Text style={styles.txtBotaoRegistrar}>REGISTRAR NO BANCO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoVoltar} onPress={() => navegar('Banco')}>
            <Text style={styles.txtBotaoVoltar}>Voltar ao Almoxarifado</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE USUÁRIOS EXISTENTES (Tabela) */}
        <View style={styles.usuariosExistentesContainer}>
          <Text style={styles.tituloUsuariosListados}>Usuários cadastrados</Text>
          
          {/* Cabeçalho da Tabela */}
          <View style={styles.tabelaHeader}>
            <Text style={[styles.tabelaCellHeader, { flex: 1 }]}>ID</Text>
            <Text style={[styles.tabelaCellHeader, { flex: 3 }]}>Usuário</Text>
            <Text style={[styles.tabelaCellHeader, { flex: 3 }]}>Permissão</Text>
          </View>

          {/* Linhas da Tabela (Fica dentro de uma caixinha com rolagem interna de até 120px igual ao HTML original) */}
          <View style={styles.tabelaScrollWrapper}>
            <ScrollView nestedScrollEnabled={true}>
              {usuarios.map((usuario, index) => (
                <View key={index} style={styles.tabelaLinha}>
                  <Text style={[styles.tabelaCell, { flex: 1 }]}>{usuario[0]}</Text>
                  <Text style={[styles.tabelaCell, { flex: 3 }]}>{usuario[1]}</Text>
                  <View style={[{ flex: 3 }, styles.badgeContainer]}>
                    <Text style={usuario[2] === 'admin' ? styles.permissaoAdmin : styles.permissaoUser}>
                      {usuario[2] === 'admin' ? 'Administrador' : 'Usuário'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  scrollContainer: { padding: 20, alignItems: 'center' },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 4, marginBottom: 25 },
  formTitulo: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#496483', marginBottom: 6 },
  input: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 15, fontSize: 14, backgroundColor: '#fafafa', color: '#333' },
  rowSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnSelect: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', backgroundColor: '#fff' },
  btnSelectAtivo: { backgroundColor: '#496483', borderColor: '#496483' },
  txtSelect: { color: '#333', fontWeight: 'bold', fontSize: 13 },
  txtSelectAtivo: { color: '#fff' },
  botaoRegistrar: { backgroundColor: '#007acc', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  txtBotaoRegistrar: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  botaoVoltar: { padding: 12, alignItems: 'center', marginTop: 10 },
  txtBotaoVoltar: { color: '#007acc', fontWeight: '500', fontSize: 14, textDecorationLine: 'underline' },
  
  // ESTILOS DA TABELA DE USUÁRIOS
  usuariosExistentesContainer: { width: '100%', maxWidth: 360, backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 3 },
  tituloUsuariosListados: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  tabelaHeader: { flexDirection: 'row', backgroundColor: '#496483', padding: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  tabelaCellHeader: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'left', paddingHorizontal: 4 },
  tabelaScrollWrapper: { maxHeight: 120, borderWidth: 1, borderColor: '#eee', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  tabelaLinha: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', backgroundColor: '#fff' },
  tabelaCell: { fontSize: 13, color: '#555', paddingHorizontal: 4 },
  badgeContainer: { alignItems: 'flex-start' },
  permissaoAdmin: { fontSize: 11, fontWeight: 'bold', color: '#d9534f', backgroundColor: '#fdf7f7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  permissaoUser: { fontSize: 11, fontWeight: 'bold', color: '#5cb85c', backgroundColor: '#f4f9f4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }
});

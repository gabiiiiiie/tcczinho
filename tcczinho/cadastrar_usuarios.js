import React, { useState, useEffect } from 'react';
import Menu from './Menu';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView 
} from 'react-native';

import { URL_API } from './config';


export default function CadastrarUsuariosScreen({ navegar, nivelAcesso }) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 💡 Sigla curta padrão para evitar estouro de tamanho no banco (4 letras)

  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarUsuarios = () => {
    setCarregando(true);
    fetch(`${URL_API}/api/usuarios`)
      .then((res) => res.json())
      .then((dados) => {
        if (Array.isArray(dados)) {
          setListaUsuarios(dados);
        } else {
          setListaUsuarios([]);
        }
        setCarregando(false);
      })
      .catch((erro) => {
        console.error(erro);
        setCarregando(false);
        Alert.alert('Erro de Conexão', 'Não foi possível buscar a lista de usuários do Docker.');
      });
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const salvarUsuario = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios!');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Erro', 'A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    fetch(`${URL_API}/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password,
        role: role // Envia "adm" ou "user" (siglas curtas e seguras)
      })
    })
    .then(async (res) => {
      const dados = await res.json();
      if (res.ok) {
        Alert.alert('Sucesso', dados.mensagem || 'Usuário cadastrado com sucesso!');
        setUsername('');
        setPassword('');
        carregarUsuarios();
      } else {
        Alert.alert('Erro no Backend', dados.erro || 'Não foi possível salvar.');
      }
    })
    .catch((erro) => {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Falha ao conectar à API do Docker para salvar.');
    });
  };

  const renderUsuario = ({ item }) => {
    const nomeUsuario = item?.username || 'Sem nome';
    const nivelUsuario = item?.role || 'user';
    const idUsuario = item?.id ? String(item.id) : '-';

    // Formata o texto visualmente para ficar mais amigável na lista
    const textoExibicaoRole = String(nivelUsuario).toLowerCase() === 'adm' ? 'ADMINISTRADOR' : 'USUÁRIO COMUM';

    return (
      <View style={styles.cardUsuario}>
        <View>
          <Text style={styles.txtUsername}>👤 {nomeUsuario}</Text>
          <Text style={styles.txtRole}>Nível: {textoExibicaoRole}</Text>
        </View>
        <Text style={styles.txtId}>ID: {idUsuario}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, padding: 15 }}>
        <Text style={styles.titulo}>Gerenciar Usuários</Text>

        <View style={styles.formulario}>
          <TextInput 
            style={styles.input} 
            placeholder="Nome de Usuário" 
            value={username} 
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Senha (mínimo 4 dígitos)" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />

          <View style={styles.rowSelector}>
            <TouchableOpacity 
              style={[styles.btnSelect, role === 'adm' && styles.btnSelectAtivo]} 
              onPress={() => setRole('adm')}
            >
              <Text style={[styles.txtSelect, role === 'adm' && styles.txtSelectAtivo]}>Administrador</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnSelect, role === 'user' && styles.btnSelectAtivo]} 
              onPress={() => setRole('user')}
            >
              <Text style={[styles.txtSelect, role === 'user' && styles.txtSelectAtivo]}>Usuário Comum</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarUsuario}>
            <Text style={styles.txtBtnSalvar}>Cadastrar Usuário</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitulo}>Usuários no Sistema:</Text>
        {carregando ? (
          <Text style={styles.txtAviso}>Buscando dados no MySQL do Docker...</Text>
        ) : (
          <FlatList
            data={listaUsuarios}
            keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
            renderItem={renderUsuario}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.txtAviso}>Nenhum usuário cadastrado.</Text>}
          />
        )}
      </View>

      <Menu navegar={navegar} telaAtiva="cadastrar_usuarios" nivelAcesso={nivelAcesso} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 10 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', color: '#496483', marginTop: 15, marginBottom: 10 },
  formulario: { backgroundColor: '#fff', padding: 15, borderRadius: 8, elevation: 2, marginBottom: 10 },
  input: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 10, backgroundColor: '#fafafa', color: '#333' },
  rowSelector: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  btnSelect: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', backgroundColor: '#fff' },
  btnSelectAtivo: { backgroundColor: '#496483', borderColor: '#496483' },
  txtSelect: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  txtSelectAtivo: { color: '#fff' },
  btnSalvar: { backgroundColor: '#007acc', padding: 12, borderRadius: 6, alignItems: 'center' },
  txtBtnSalvar: { color: '#fff', fontWeight: 'bold' },
  cardUsuario: { backgroundColor: '#fff', padding: 12, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  txtUsername: { fontSize: 14, fontWeight: 'bold', color: '#212529' },
  txtRole: { fontSize: 11, color: '#6c757d', marginTop: 2 },
  txtId: { fontSize: 12, color: '#999', fontWeight: 'bold' },
  txtAviso: { textAlign: 'center', color: '#7f8c8d', marginTop: 15, fontStyle: 'italic' }
});

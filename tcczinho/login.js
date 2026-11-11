import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { URL_API } from './config';

export default function LoginScreen({ navegar }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const tentarLogin = () => {
    setErro('');
    if (!role) return setErro('Selecione Admin ou Usuário.');
    if (!username.trim() || !password.trim()) return setErro('Preencha usuário e senha.');

    setCarregando(true);
    fetch(`${URL_API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password })
    })
      .then(async (res) => {
        setCarregando(false);
        const dados = await res.json();
        if (res.ok) {
          navegar('banco', dados.role || role);
        } else {
          setErro(dados.erro || 'Credenciais inválidas.');
        }
      })
      .catch(() => {
        setCarregando(false);
        setErro(`Falha ao conectar em ${URL_API}`);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>SENAI</Text>
        <Text style={styles.subtitulo}>Gestão de Estoque</Text>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btnOpt, role === '1' && styles.ativo]} onPress={() => setRole('1')}>
            <Text style={[styles.txtOpt, role === '1' && styles.txtBranco]}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOpt, role === '2' && styles.ativo]} onPress={() => setRole('2')}>
            <Text style={[styles.txtOpt, role === '2' && styles.txtBranco]}>Usuário</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Usuário" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.botao} onPress={tentarLogin} disabled={carregando}>
          <Text style={styles.txtBranco}>{carregando ? 'Conectando...' : 'Entrar'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', maxWidth: 360, backgroundColor: '#fff', padding: 25, borderRadius: 12, elevation: 4 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#ff0000', textAlign: 'center', letterSpacing: 2 },
  subtitulo: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnOpt: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center' },
  ativo: { backgroundColor: '#496483', borderColor: '#496483' },
  txtOpt: { color: '#333', fontWeight: 'bold' },
  txtBranco: { color: '#fff', fontWeight: 'bold' },
  input: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 12, backgroundColor: '#fafafa' },
  erro: { color: '#dc3545', textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
  botao: { backgroundColor: '#007acc', padding: 14, borderRadius: 6, alignItems: 'center' }
});

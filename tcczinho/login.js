import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

// 💡 Mantendo o IP e a porta do seu container Docker:
const URL_API = 'http://10.154.20.172:5000'; 

export default function LoginScreen({ navegar }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // '1' para Admin, '2' para Usuário comum

  const tentarLogin = () => {
    if (!role) {
      Alert.alert('Erro', 'Por favor, selecione um nível de acesso visual.');
      return;
    }
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Usuário e senha são obrigatórios!');
      return;
    }

    // 🔥 ENVIANDO REQUISIÇÃO EM FORMATO JSON CONFORME O SEU CÓDIGO FLASK EXIGE
    fetch(`${URL_API}/api/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password
      })
    })
    .then(async (res) => {
      const dados = await res.json();
      
      if (res.ok) {
        // Puxa o 'role' real vindo diretamente da tabela de usuários do seu banco MySQL
        const nivelAcessoReal = String(dados.role); // Certifica que vira texto ('1' ou '2')
         Alert.alert("Teste de Retorno do Docker", "O Flask retornou:\n" + JSON.stringify(dados));

        Alert.alert('Sucesso', `Logado como ${nivelAcessoReal.toLowerCase() === 'admin' ? 'Administrador' : 'Usuário'}!`);

        
        if (typeof navegar === 'function') {
          // Passamos o nível de acesso adiante na navegação para que o App.js gerencie a Tab Bar
          navegar('banco', nivelAcessoReal); 
        }
      } else {
        // Exibe o erro tratado pelo Flask ("Usuário não encontrado" ou "Senha incorreta")
        Alert.alert('Erro de Autenticação', dados.erro || 'Credenciais inválidas.');
      }
    })
    .catch((erro) => {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Não foi possível se comunicar com a rota /api/login do Docker.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.caixaLogin}>
        
        <Text style={styles.logoSenai}>SENAI</Text>
        <Text style={styles.subtitulo}>Gestão de Estoque</Text>

        <Text style={styles.label}>Nível de Acesso Esperado:</Text>
        <View style={styles.rowSelector}>
          <TouchableOpacity 
            style={[styles.btnSelect, role === '1' && styles.btnSelectAtivo]} 
            onPress={() => setRole('1')}
          >
            <Text style={[styles.txtSelect, role === '1' && styles.txtSelectAtivo]}>Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btnSelect, role === '2' && styles.btnSelectAtivo]} 
            onPress={() => setRole('2')}
          >
            <Text style={[styles.txtSelect, role === '2' && styles.txtSelectAtivo]}>Usuário</Text>
          </TouchableOpacity>
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Nome de Usuário" 
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.botao} onPress={tentarLogin}>
          <Text style={styles.txtBotao}>Entrar</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', justifyContent: 'center', alignItems: 'center' },
  caixaLogin: { width: '85%', maxWidth: 360, backgroundColor: '#fff', padding: 25, borderRadius: 12, elevation: 4 },
  logoSenai: { fontSize: 32, fontWeight: 'bold', color: '#ff0000', textAlign: 'center', letterSpacing: 2 },
  subtitulo: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 25, marginTop: 5 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#496483', marginBottom: 6 },
  rowSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnSelect: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, alignItems: 'center', backgroundColor: '#fff' },
  btnSelectAtivo: { backgroundColor: '#496483', borderColor: '#496483' },
  txtSelect: { color: '#333', fontWeight: 'bold', fontSize: 13 },
  txtSelectAtivo: { color: '#fff' },
  input: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 15, fontSize: 14, backgroundColor: '#fafafa', color: '#333' },
  botao: { backgroundColor: '#007acc', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  txtBotao: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});

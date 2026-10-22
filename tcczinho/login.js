import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

export default function LoginScreen({ navegar }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Armazena '1' (Admin) ou '2' (Usuário)

  const tentarLogin = () => {
    // Validação de nível de acesso igual ao seu select do HTML
    if (!role) {
      Alert.alert('Erro', 'Por favor, selecione um nível de acesso.');
      return;
    }
    
    // Validação de campos vazios
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Usuário e senha são obrigatórios!');
      return;
    }

    // Alerta de sucesso nativo
    Alert.alert('Sucesso', `Logado como ${role === '1' ? 'Administrador' : 'Usuário'}!`);
    
    // Executa a função que joga o aplicativo para a tela do estoque
    if (typeof navegar === 'function') {
      navegar('Banco');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.caixaLogin}>
        
        {/* Identificação visual do Senai */}
        <Text style={styles.logoSenai}>SENAI</Text>
        <Text style={styles.subtitulo}>Gestão de Estoque</Text>

        {/* Seletor simplificado (Substitui o <select>) */}
        <Text style={styles.label}>Nível de Acesso:</Text>
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

        {/* Campo de Usuário */}
        <TextInput 
          style={styles.input} 
          placeholder="Nome de Usuário" 
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        {/* Campo de Senha */}
        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Botão Entrar */}
        <TouchableOpacity style={styles.botao} onPress={tentarLogin}>
          <Text style={styles.txtBotao}>Entrar</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// Estilizações limpas baseadas na sua folha de estilos original do almoxarifado
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

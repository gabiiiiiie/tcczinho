import React, { useState } from 'react';
import Menu from './Menu';
import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

// 💡 Defina o IP e a porta do seu container Docker diretamente aqui:
const URL_API = 'http://10.154.20.172:5000'; 

export default function AdicionarItensScreen({ navegar, nivelAcesso }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('Geral'); 
  const [foto, setFoto] = useState(''); // 🔥 ESTADO CORRIGIDO PARA PEGAR O LINK DIGITADO PELO USUÁRIO

  const validarEEnviar = () => {
    // Adicionada a validação da foto e da categoria para bater com as regras obrigatórias do Flask
    if (!nome.trim() || !quantidade.trim() || !estoqueMinimo.trim() || !descricao.trim() || !preco.trim() || !categoria.trim() || !foto.trim()) {
      Alert.alert('Erro', 'Todos os campos, incluindo Link da Imagem e Categoria, são obrigatórios!');
      return;
    }

    // 🔥 ENVIANDO OS DADOS PARA O SEU FLASK NO DOCKER
    fetch(`${URL_API}/api/itens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: nome.trim(),
        quantidade: parseInt(quantidade),
        estoque: parseInt(estoqueMinimo), 
        descricao: descricao.trim(),
        preco: parseFloat(preco),
        categoria: categoria.trim(),      
        foto: foto.trim() // 💡 Passando o link inserido na caixa de texto
      })
    })
    .then(async (res) => {
      const textoBruto = await res.text();
      
      try {
        const dados = JSON.parse(textoBruto);
        if (res.ok) {
          Alert.alert('Sucesso', dados.mensagem || 'Item cadastrado com sucesso!');
          navegar('banco'); 
        } else {
          Alert.alert('Erro no Backend', dados.erro || 'O servidor recusou os dados.');
        }
      } catch (erroJson) {
        Alert.alert(
          'Erro no Servidor Docker', 
          `Status HTTP: ${res.status}\nResposta: ${textoBruto.substring(0, 100)}...`
        );
      }
    })
    .catch((erro) => {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao container Docker. Verifique a rede.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.titulo}>Cadastrar Novo Item</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nome do Item:</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />

            <Text style={styles.label}>Quantidade:</Text>
            <TextInput style={styles.input} value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" />

            <Text style={styles.label}>Estoque Mínimo:</Text>
            <TextInput style={styles.input} value={estoqueMinimo} onChangeText={setEstoqueMinimo} keyboardType="numeric" />

            <Text style={styles.label}>Descrição:</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={descricao} onChangeText={setDescricao} multiline />

            <Text style={styles.label}>Preço:</Text>
            <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" />

            <Text style={styles.label}>Categoria:</Text>
            <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholder="Ex: Ferramentas, Equipamentos" />

            {/* 🔥 NOVO CAMPO ADICIONADO PARA O LINK DA IMAGEM */}
            <Text style={styles.label}>Link da Imagem (URL):</Text>
            <TextInput 
              style={styles.input} 
              value={foto} 
              onChangeText={setFoto} 
              placeholder="https://exemplo.com"
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.botoesContainer}>
              <TouchableOpacity style={[styles.botao, { backgroundColor: '#007acc' }]} onPress={validarEEnviar}>
                <Text style={styles.textBotao}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.botao, { backgroundColor: '#d97736' }]} onPress={() => navegar('banco')}>
                <Text style={styles.textBotao}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <Menu navegar={navegar} telaAtiva="adicionaritens" nivelAcesso={nivelAcesso} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#d97736', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#496483', marginBottom: 5 },
  input: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 15, backgroundColor: '#fff', color: '#333' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botao: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
  textBotao: { color: '#fff', fontWeight: 'bold' }
});

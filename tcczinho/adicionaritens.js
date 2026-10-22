import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

export default function AdicionarItensScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');

  const validarEEnviar = () => {
    if (!nome.trim() || !quantidade.trim() || !estoqueMinimo.trim() || !descricao.trim() || !preco.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }
    Alert.alert('Sucesso', 'Item pronto para salvar!');
  };

  return (
    <SafeAreaView style={styles.container}>
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

          <View style={styles.botoesContainer}>
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#007acc' }]} onPress={validarEEnviar}>
              <Text style={styles.textBotao}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botao, { backgroundColor: '#d97736' }]} onPress={() => {}}>
              <Text style={styles.textBotao}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#d97736', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#496483', marginBottom: 5 },
  input: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 15, backgroundColor: '#fff' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botao: { flex: 1, padding: 12, borderRadius: 6, alignItems: 'center' },
  textBotao: { color: '#fff', fontWeight: 'bold' }
});

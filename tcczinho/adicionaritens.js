import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Menu from './Menu';
import { URL_API } from './config';

export default function AdicionarItensScreen({ navegar, nivelAcesso }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [estoque, setEstoque] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [foto, setFoto] = useState('');
  const [msg, setMsg] = useState('');

  const salvar = () => {
    if (!nome || !quantidade || !estoque || !descricao || !preco || !foto) {
      return setMsg('Preencha todos os campos!');
    }

    fetch(`${URL_API}/api/itens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.trim(),
        quantidade: parseInt(quantidade),
        estoque: parseInt(estoque),
        descricao: descricao.trim(),
        preco: parseFloat(preco.replace(',', '.')),
        categoria: categoria.trim(),
        foto: foto.trim()
      })
    })
      .then(async (res) => {
        const dados = await res.json();
        if (res.ok) navegar('banco');
        else setMsg(dados.erro || 'Erro ao cadastrar.');
      })
      .catch(() => setMsg('Erro de conexão com o servidor.'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.titulo}>Novo Item</Text>
        <View style={styles.card}>
          <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Estoque Mínimo" value={estoque} onChangeText={setEstoque} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
          <TextInput style={styles.input} placeholder="Preço (ex: 50.00)" value={preco} onChangeText={setPreco} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Categoria" value={categoria} onChangeText={setCategoria} />
          <TextInput style={styles.input} placeholder="Link da Foto (URL)" value={foto} onChangeText={setFoto} autoCapitalize="none" />

          {msg ? <Text style={styles.erro}>{msg}</Text> : null}

          <TouchableOpacity style={styles.botao} onPress={salvar}>
            <Text style={styles.txtBranco}>Salvar Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Menu navegar={navegar} telaAtiva="adicionaritens" nivelAcesso={nivelAcesso} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2 },
  input: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 12 },
  erro: { color: '#dc3545', textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
  botao: { backgroundColor: '#007acc', padding: 14, borderRadius: 6, alignItems: 'center' },
  txtBranco: { color: '#fff', fontWeight: 'bold' }
});

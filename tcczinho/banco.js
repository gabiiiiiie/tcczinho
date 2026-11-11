import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList, Image, SafeAreaView } from 'react-native';
import Menu from './Menu';
import { URL_API } from './config';

export default function BancoScreen({ navegar, nivelAcesso }) {
  const [pesquisa, setPesquisa] = useState('');
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch(`${URL_API}/api/itens`)
      .then((res) => res.json())
      .then((dados) => {
        setItens(dados.map((i) => ({
          id: i.Id || i.id,
          nome: i.Nome || i.nome || 'Sem Nome',
          quantidade: parseInt(i.Quantidade ?? i.quantidade ?? 0),
          estoqueMin: parseInt(i.Estoque ?? i.EstoqueMin ?? 0),
          preco: i.Preco ?? i.preco ?? '0.00',
          categoria: i.Categoria || i.categoria || 'Geral',
          foto: i.Foto || i.foto || ''
        })));
      })
      .catch(() => setErro('Erro ao carregar itens do servidor.'));
  }, []);

  const filtrados = itens.filter((i) =>
    i.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    i.categoria.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        <Text style={styles.titulo}>Almoxarifado</Text>
        <TextInput style={styles.input} placeholder="Pesquisar..." value={pesquisa} onChangeText={setPesquisa} />
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <FlatList
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.card, item.quantidade < item.estoqueMin && styles.alerta]}>
              <Image source={{ uri: item.foto || 'https://flaticon.com' }} style={styles.foto} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.nome}>#{item.id} - {item.nome}</Text>
                <Text style={styles.sub}>Qtd: {item.quantidade} (Mín: {item.estoqueMin})</Text>
                <Text style={styles.sub}>{item.categoria} | R$ {item.preco}</Text>
              </View>
            </View>
          )}
        />
      </View>
      <Menu navegar={navegar} telaAtiva="banco" nivelAcesso={nivelAcesso} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  alerta: { borderColor: '#dc3545', backgroundColor: '#fff5f5' },
  foto: { width: 50, height: 50, borderRadius: 6, backgroundColor: '#eee' },
  nome: { fontSize: 15, fontWeight: 'bold' },
  sub: { fontSize: 12, color: '#666', marginTop: 2 },
  erro: { color: '#dc3545', textAlign: 'center', marginBottom: 10 }
});

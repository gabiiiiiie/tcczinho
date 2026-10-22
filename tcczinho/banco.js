import React, { useState, useEffect } from 'react';
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

export default function EstoqueScreen() {
  // LISTA FICTÍCIA (Simulando os dados que viriam da tabela MySQL pelo {% for item in resposta %})
  const dadosMock = [
    { id: 1, nome: 'Chave de Fenda', quantidade: 15, estoqueMin: 5, descricao: 'Ferramenta de aço', preco: '25.00', categoria: 'Ferramentas', foto: 'https://placeholder.com' },
    { id: 2, nome: 'Martelo', quantidade: 2, estoqueMin: 4, descricao: 'Martelo 40mm', preco: '42.50', categoria: 'Ferramentas', foto: '' },
  ];

  const [pesquisa, setPesquisa] = useState('');
  const [itensFiltrados, setItensFiltrados] = useState(dadosMock);

  // Função equivalente ao seu 'filtrarTabela()' em JavaScript
  const filtrarTabela = (texto) => {
    setPesquisa(texto);
    if (!texto.trim()) {
      setItensFiltrados(dadosMock);
      return;
    }
    const termo = texto.toLowerCase();
    const resultado = dadosMock.filter(item => 
      item.nome.toLowerCase().includes(termo) || 
      item.descricao.toLowerCase().includes(termo) ||
      item.categoria.toLowerCase().includes(termo)
    );
    setItensFiltrados(resultado);
  };

  // Função equivalente ao seu 'verFoto()' que usava SweetAlert2
  const verFoto = (url, nome) => {
    if (!url || url.trim() === '') {
      Alert.alert('Foto não encontrada', 'Este produto não possui uma foto cadastrada.');
      return;
    }
    // Mostra um alerta nativo com o link (No app real, você pode usar um componente de <Image>)
    Alert.alert(nome, `Link da imagem:\n${url}`);
  };

  // Renderiza cada linha/card do estoque
  const renderItem = ({ item }) => {
    // Alerta visual simples se o estoque estiver abaixo do mínimo
    const estoqueBaixo = item.quantidade < item.estoqueMin;

    return (
      <View style={[styles.cardItem, estoqueBaixo && styles.alertaEstoque]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nomeItem}>#{item.id} - {item.nome}</Text>
          <Text style={styles.txtSecundario}>Qtd: {item.quantidade} (Mín: {item.estoqueMin})</Text>
          <Text style={styles.txtSecundario}>Cat: {item.categoria} | R\$ {item.preco}</Text>
          <Text style={styles.descricao} numberOfLines={1}>{item.descricao}</Text>
        </View>

        <TouchableOpacity style={styles.btnFoto} onPress={() => verFoto(item.foto, item.nome)}>
          <Text style={styles.txtBtn}>Imagem</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Almoxarifado</Text>

      {/* Caixa de Pesquisa */}
      <TextInput
        style={styles.inputPesquisa}
        placeholder="Pesquise por nome do item..."
        value={pesquisa}
        onChangeText={filtrarTabela}
      />

      {/* Tabela/Lista em formato de Cards */}
      <FlatList
        data={itensFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum item encontrado.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 15 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 15 },
  inputPesquisa: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, fontSize: 14 },
  cardItem: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2 
  },
  alertaEstoque: { borderColor: '#dc3545', backgroundColor: '#fff5f5' }, // Visual sutil se faltar estoque
  nomeItem: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  txtSecundario: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  descricao: { fontSize: 12, color: '#999', marginTop: 4, fontStyle: 'italic' },
  btnFoto: { backgroundColor: '#007acc', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10 },
  txtBtn: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  listaVazia: { textAlign: 'center', color: '#6c757d', marginTop: 20, fontStyle: 'italic' }
});

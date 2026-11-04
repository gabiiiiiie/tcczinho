import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Image, // 💡 Importado o componente Image do React Native
  SafeAreaView 
} from 'react-native';

// Importa o componente Menu que criamos separado
import Menu from './Menu'; 

// 💡 Mantendo o IP e a porta do seu container Docker diretamente na página:
const URL_API = 'http://10.154.20.172:5000';

export default function BancoScreen({ navegar, nivelAcesso }) {
  const [pesquisa, setPesquisa] = useState('');
  const [todosOsItens, setTodosOsItens] = useState([]); 
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // 🔥 BUSCA OS ITENS DO BANCO DE DADOS DO DOCKER AO ABRIR A TELA
  useEffect(() => {
    fetch(`${URL_API}/api/itens`)
      .then((res) => res.json())
      .then((dados) => {
        const dadosFormatados = dados.map(item => ({
          id: item.Id || item.id || '',
          nome: item.Nome || item.nome || 'Sem Nome',
          quantidade: parseInt(item.Quantidade || item.quantidade || 0),
          estoqueMin: parseInt(item.EstoqueMin || item.estoque_minimo || item.estoqueMin || 0),
          descricao: item.Descricao || item.descricao || '',
          preco: item.Preco || item.preco || '0.00',
          categoria: item.Categoria || item.categoria || 'Geral',
          foto: item.Foto || item.foto || '' // Puxa a string do link da foto salva no MySQL
        }));

        setTodosOsItens(dadosFormatados);
        setItensFiltrados(dadosFormatados);
        setCarregando(false);
      })
      .catch((erro) => {
        console.error(erro);
        setCarregando(false);
        Alert.alert('Erro de Conexão', 'Não foi possível carregar os produtos reais do contêiner Docker.');
      });
  }, []);

  const filtrarTabela = (texto) => {
    setPesquisa(texto);
    if (!texto.trim()) {
      setItensFiltrados(todosOsItens);
      return;
    }
    const termo = texto.toLowerCase();
    const resultado = todosOsItens.filter(item => 
      item.nome.toLowerCase().includes(termo) || 
      item.descricao.toLowerCase().includes(termo) ||
      item.categoria.toLowerCase().includes(termo)
    );
    setItensFiltrados(resultado);
  };

  const verFoto = (url, nome) => {
    if (!url || url.trim() === '' || url.includes('placeholder')) {
      Alert.alert('Foto não encontrada', 'Este produto não possui uma foto válida cadastrada no banco.');
      return;
    }
    Alert.alert(nome, `Link completo da imagem:\n${url}`);
  };

  const renderItem = ({ item }) => {
    const estoqueBaixo = item.quantidade < item.estoqueMin;
    
    // 💡 Define uma imagem padrão caso o link do banco esteja vazio ou inválido
    const imagemValida = item.foto && item.foto.trim() !== '' && !item.foto.includes('placeholder')
      ? { uri: item.foto } 
      : { uri: 'https://flaticon.com' }; // Ícone de caixa/produto genérico

    return (
      <View style={[styles.cardItem, estoqueBaixo && styles.alertaEstoque]}>
        
        {/* 🔥 EXIBE A FOTO REAL DO PRODUTO DIRETO NO CARD */}
        <Image source={imagemValida} style={styles.miniaturaFoto} resizeMode="cover" />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.nomeItem}>#{item.id} - {item.nome}</Text>
          <Text style={styles.txtSecundario}>Qtd: {item.quantidade} (Mín: {item.estoqueMin})</Text>
          <Text style={styles.txtSecundario}>Cat: {item.categoria} | R\$ {item.preco}</Text>
          <Text style={styles.descricao} numberOfLines={1}>{item.descricao}</Text>
        </View>

        <TouchableOpacity style={styles.btnFoto} onPress={() => verFoto(item.foto, item.nome)}>
          <Text style={styles.txtBtn}>Link</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>Almoxarifado</Text>

        <TextInput
          style={styles.inputPesquisa}
          placeholder="Pesquise por nome do item..."
          value={pesquisa}
          onChangeText={filtrarTabela}
        />

        {carregando ? (
          <Text style={styles.listaVazia}>Carregando estoque do MySQL...</Text>
        ) : (
          <FlatList
            data={itensFiltrados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 15 }}
            ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum item encontrado.</Text>}
          />
        )}
      </View>

      <Menu navegar={navegar} telaAtiva="banco" nivelAcesso={nivelAcesso} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', paddingHorizontal: 15, paddingTop: 10 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginVertical: 15 },
  inputPesquisa: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, fontSize: 14 },
  cardItem: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2 
  },
  miniaturaFoto: {
    width: 55,
    height: 55,
    borderRadius: 6,
    backgroundColor: '#eee'
  },
  alertaEstoque: { borderColor: '#dc3545', backgroundColor: '#fff5f5' },
  nomeItem: { fontSize: 15, fontWeight: 'bold', color: '#212529' },
  txtSecundario: { fontSize: 12, color: '#6c757d', marginTop: 1 },
  descricao: { fontSize: 11, color: '#999', marginTop: 3, fontStyle: 'italic' },
  btnFoto: { backgroundColor: '#007acc', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, marginLeft: 5 },
  txtBtn: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  listaVazia: { textAlign: 'center', color: '#6c757d', marginTop: 20, fontStyle: 'italic' }
});

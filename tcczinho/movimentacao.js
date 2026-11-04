import React, { useState, useEffect } from 'react';
import Menu from './Menu';
import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

// 💡 Mantendo o IP e a porta do seu container Docker:
const URL_API = 'http://10.154.20.172:5000'; 

export default function MovimentacaoScreen({ navegar, nivelAcesso })  {
  // Inicializamos o estado como uma lista vazia para receber os dados do Docker
  const [itens, setItens] = useState([]);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada'); // 'entrada' ou 'saida'
  const [quantidade, setQuantidade] = useState('');
  const [carregando, setCarregando] = useState(true);

  // 🔥 BUSCA OS ITENS DO BANCO DE DADOS DO DOCKER AO ABRIR A TELA
  useEffect(() => {
    // Nota: Certifique-se de ajustar a rota '/api/itens' para o endpoint exato da sua rota GET de listagem
    fetch(`${URL_API}/api/itens`)
      .then((res) => res.json())
      .then((dados) => {
        // Mapeia os dados do MySQL para o formato esperado pelos componentes da tela
        // Se a sua API já retornar propriedades em letras minúsculas (id, nome, atual), remova o .map
        const itensFormatados = dados.map(item => ({
          id: String(item.Id || item.id || ''),
          nome: item.Nome || item.nome || '',
          atual: parseInt(item.Quantidade || item.quantidade || 0)
        }));
        
        setItens(itensFormatados);
        setCarregando(false);
      })
      .catch((erro) => {
        console.error(erro);
        setCarregando(false);
        Alert.alert('Erro', 'Não foi possível carregar a lista de produtos reais do Docker.');
      });
  }, []);

  const salvarMovimentacao = () => {
    if (!itemSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um item.');
      return;
    }
    if (!quantidade.trim() || parseInt(quantidade) < 1) {
      Alert.alert('Erro', 'Digite uma quantidade válida maior que 0.');
      return;
    }

    // 🔥 ENVIANDO EXATAMENTE O JSON QUE O SEU FLASK ESPERA
    fetch(`${URL_API}/api/movimentacao`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        id_item: parseInt(itemSelecionado.id), // 'id_item' esperado pelo Flask
        tipo: tipoMovimentacao,                // 'entrada' ou 'saida'
        quantidade: parseInt(quantidade)       // Tratado como número inteiro
      })
    })
    .then(async (res) => {
      const dados = await res.json();
      
      if (res.ok) {
        Alert.alert('Sucesso', dados.mensagem || 'Estoque atualizado com sucesso!');
        navegar('banco'); // Redireciona de volta para a lista de estoque
      } else {
        Alert.alert('Erro na Operação', dados.erro || 'Falha ao atualizar estoque.');
      }
    })
    .catch((erro) => {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao container Docker.');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
          
          <View style={styles.cartaoFormulario}>
            <Text style={styles.titulo}>Atualizar Quantidade</Text>

            {/* Selecionar Item */}
            <Text style={styles.label}>Item do Banco:</Text>
            
            {carregando ? (
              <Text style={styles.txtCarregando}>Carregando produtos do MySQL...</Text>
            ) : (
              <ScrollView style={styles.containerListaItens} nestedScrollEnabled={true}>
                {itens.length === 0 ? (
                  <Text style={styles.txtListaVazia}>Nenhum item encontrado no banco.</Text>
                ) : (
                  itens.map((item) => (
                    <TouchableOpacity 
                      key={item.id}
                      style={[styles.itemOpcao, itemSelecionado?.id === item.id && styles.itemOpcaoAtivo]}
                      onPress={() => setItemSelecionado(item)}
                    >
                      <Text style={{ color: itemSelecionado?.id === item.id ? '#fff' : '#333', fontSize: 13 }}>
                        {item.nome} (Atual: {item.atual})
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {/* Tipo de Operação */}
            <Text style={styles.label}>Tipo de Movimentação:</Text>
            <View style={styles.rowSelector}>
              <TouchableOpacity 
                style={[styles.btnSelect, tipoMovimentacao === 'entrada' && { backgroundColor: '#1867a8', borderColor: '#1867a8' }]} 
                onPress={() => setTipoMovimentacao('entrada')}
              >
                <Text style={{ color: tipoMovimentacao === 'entrada' ? '#fff' : '#333', fontWeight: 'bold', fontSize: 13 }}>Entrada (+)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btnSelect, tipoMovimentacao === 'saida' && { backgroundColor: '#1867a8', borderColor: '#1867a8' }]} 
                onPress={() => setTipoMovimentacao('saida')}
              >
                <Text style={{ color: tipoMovimentacao === 'saida' ? '#fff' : '#333', fontWeight: 'bold', fontSize: 13 }}>Saída (-)</Text>
              </TouchableOpacity>
            </View>

            {/* Campo Quantidade */}
            <Text style={styles.label}>Quantidade:</Text>
            <TextInput 
              style={styles.input} 
              value={quantidade} 
              onChangeText={setQuantidade} 
              keyboardType="numeric"
              placeholder="Digite a quantidade..."
            />

            {/* Ações / Botões */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity style={styles.btnPrincipal} onPress={salvarMovimentacao}>
                <Text style={styles.txtBtn}>Salvar item</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSecundario} onPress={() => navegar('banco')}>
                <Text style={styles.txtBtn}>Cancelar</Text>
              </TouchableOpacity>
            </View>

          </View>

        </ScrollView>
      </View>

     
<Menu navegar={navegar} telaAtiva="movimentacao" nivelAcesso={nivelAcesso} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1867a8' }, 
  cartaoFormulario: { width: '95%', maxWidth: 450, backgroundColor: '#ffffff', borderRadius: 12, padding: 25, elevation: 5, marginTop: '10%' },
  titulo: { textAlign: 'center', color: '#c46c3b', marginBottom: 20, fontSize: 18, fontWeight: 'bold' }, 
  label: { fontWeight: '600', fontSize: 14, color: '#333', marginBottom: 5 },
  input: { padding: 10, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, marginBottom: 15, backgroundColor: '#f8f9fa', color: '#333' },
  containerListaItens: { maxHeight: 120, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 5, marginBottom: 15, backgroundColor: '#f8f9fa' },
  itemOpcao: { padding: 8, borderRadius: 4, marginBottom: 4 },
  itemOpcaoAtivo: { backgroundColor: '#496483' },
  rowSelector: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnSelect: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, alignItems: 'center', backgroundColor: '#f8f9fa' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnPrincipal: { flex: 1, backgroundColor: '#1867a8', padding: 12, borderRadius: 6, alignItems: 'center' }, 
  btnSecundario: { flex: 1, backgroundColor: '#d97736', padding: 12, borderRadius: 6, alignItems: 'center' }, 
  txtBtn: { color: 'white', fontWeight: 'bold' },
  txtCarregando: { color: '#666', fontStyle: 'italic', marginBottom: 15, textAlign: 'center' },
  txtListaVazia: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 10 }
});

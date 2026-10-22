import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

export default function MovimentacaoScreen({ navegar }) {
  // Lista fictícia de produtos simulando o seu {% for item in itens %} do MySQL
  const [itens] = useState([
    { id: '1', nome: 'Chave de Fenda', atual: 15 },
    { id: '2', nome: 'Martelo', atual: 2 },
    { id: '3', nome: 'Fita Isolante', atual: 40 },
  ]);

  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada'); // 'entrada' ou 'saida'
  const [quantidade, setQuantidade] = useState('');

  const salvarMovimentacao = () => {
    if (!itemSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um item.');
      return;
    }
    if (!quantidade.trim() || parseInt(quantidade) < 1) {
      Alert.alert('Erro', 'Digite uma quantidade válida maior que 0.');
      return;
    }

    Alert.alert(
      'Sucesso', 
      `Movimentação de ${tipoMovimentacao === 'entrada' ? 'Entrada (+)' : 'Saída (-)'} de ${quantidade} unidade(s) registrada!`
    );
    
    // Redireciona para a página de sucesso unificada do fluxo
    navegar('ItemCadastrado');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        <View style={styles.cartaoFormulario}>
          <Text style={styles.titulo}>Atualizar Quantidade</Text>

          {/* Selecionar Item */}
          <Text style={styles.label}>Item:</Text>
          <ScrollView style={styles.containerListaItens} nestedScrollEnabled={true}>
            {itens.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={[styles.itemOpcao, itemSelecionado?.id === item.id && styles.itemOpcaoAtivo]}
                onPress={() => setItemSelecionado(item)}
              >
                <Text style={{ color: itemSelecionado?.id === item.id ? '#fff' : '#333', fontSize: 13 }}>
                  {item.nome} (Atual: {item.atual})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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

            <TouchableOpacity style={styles.btnSecundario} onPress={() => navegar('Banco')}>
              <Text style={styles.txtBtn}>Cancelar</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos baseados fielmente nas variáveis CSS do seu HTML original
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1867a8' }, // Cor --azul-fundo original
  cartaoFormulario: { width: '95%', maxWidth: 450, backgroundColor: '#ffffff', borderRadius: 12, padding: 25, elevation: 5, marginTop: '10%' },
  titulo: { textAlign: 'center', color: '#c46c3b', marginBottom: 20, fontSize: 18, fontWeight: 'bold' }, // Cor --cor-titulo
  label: { fontWeight: '600', fontSize: 14, color: '#333', marginBottom: 5 },
  input: { padding: 10, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, marginBottom: 15, backgroundColor: '#f8f9fa', color: '#333' },
  
  // Lista rolante interna para seleção do item
  containerListaItens: { maxHeight: 120, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 5, marginBottom: 15, backgroundColor: '#f8f9fa' },
  itemOpcao: { padding: 8, borderRadius: 4, marginBottom: 4 },
  itemOpcaoAtivo: { backgroundColor: '#496483' },

  rowSelector: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  btnSelect: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, alignItems: 'center', backgroundColor: '#f8f9fa' },
  
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnPrincipal: { flex: 1, backgroundColor: '#1867a8', padding: 12, borderRadius: 6, alignItems: 'center' }, // Cor --azul-botao
  btnSecundario: { flex: 1, backgroundColor: '#d97736', padding: 12, borderRadius: 6, alignItems: 'center' }, // Cor --laranja-botao
  txtBtn: { color: 'white', fontWeight: 'bold' }
});

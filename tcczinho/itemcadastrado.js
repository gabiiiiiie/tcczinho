import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function ItemCadastradoScreen({ navegar }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.caixaSucesso}>
        
        {/* Ícone de check em texto */}
        <Text style={styles.iconeSucesso}>✓</Text>
        
        <Text style={styles.titulo}>Item Cadastrado com Sucesso!</Text>
        
        <Text style={styles.texto}>
          O produto já foi salvo no banco de dados e está visível no estoque.
        </Text>
       
        {/* Botão que usa o navegador simples para voltar para a tela 'Banco' */}
        <TouchableOpacity 
          style={styles.btnVoltar} 
          onPress={() => navegar('Banco')}
        >
          <Text style={styles.txtBtn}>Voltar para a Tabela</Text>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f4f6f9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  caixaSucesso: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#004B87', // Azul escuro do seu CSS original
    padding: 40,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  iconeSucesso: { 
    fontSize: 50, 
    color: '#128b45', // Verde do check original
    fontWeight: 'bold',
    marginBottom: 15 
  },
  titulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#e3eaf0', 
    textAlign: 'center',
    marginBottom: 15 
  },
  texto: { 
    fontSize: 14, 
    color: '#f8f7f7', 
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20
  },
  btnVoltar: {
    backgroundColor: '#2182c2', // Azul do botão voltar original
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center'
  },
  txtBtn: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 15 
  }
});

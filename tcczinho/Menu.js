import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default function Menu({ navegar, telaAtiva, nivelAcesso }) {
  const isAdmin = String(nivelAcesso).toLowerCase().includes('adm') || String(nivelAcesso) === '1';

  const botoes = [
    { id: 'banco', label: 'Estoque' },
    { id: 'adicionaritens', label: '+ Item' },
    { id: 'movimentacao', label: 'Movimento' },
  ];

  if (isAdmin) botoes.push({ id: 'cadastrar_usuarios', label: 'Usuários' });
  botoes.push({ id: 'login', label: 'Sair' });

  return (
    <View style={styles.tabBar}>
      {botoes.map((btn) => {
        const ativo = telaAtiva.toLowerCase() === btn.id;
        return (
          <TouchableOpacity key={btn.id} style={[styles.btn, ativo && styles.btnAtivo]} onPress={() => navegar(btn.id)}>
            <Text style={[styles.txt, ativo && styles.txtAtivo]}>{btn.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 60, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e0e0e0', marginBottom: 20 },
  btn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnAtivo: { borderTopWidth: 3, borderTopColor: '#007acc' },
  txt: { fontSize: 11, color: '#7f8c8d', fontWeight: '600' },
  txtAtivo: { color: '#007acc', fontWeight: 'bold' }
});

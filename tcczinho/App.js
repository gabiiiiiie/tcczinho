import React, { useState } from 'react';

// Importações blindadas com caminhos e extensões exatas dos seus arquivos na raiz do Snack
import LoginScreen from './components/login.js';
import BancoScreen from './components/banco.js';
import AdicionarItensScreen from './components/adicionaritens.js';
import ItemCadastradoScreen from './components/itemcadastrado.js';
import MovimentacaoScreen from './components/movimentacao.js';

export default function App() {
  // O aplicativo inicia obrigatoriamente na tela de Login
  const [telaAtual, setTelaAtual] = useState('Login');

  // Função centralizada para gerenciar a troca de páginas
  const navegarPara = (nomeDaTela) => {
    setTelaAtual(nomeDaTela);
  };

  // Switch de navegação nativo (If/Else) 
  if (telaAtual === 'Login') {
    return <LoginScreen navegar={navegarPara} />;
  } 
  
  if (telaAtual === 'Banco') {
    return <BancoScreen navegar={navegarPara} />;
  } 
  
  if (telaAtual === 'AdicionarItens') {
    return <AdicionarItensScreen navegar={navegarPara} />;
  } 
  
  if (telaAtual === 'ItemCadastrado') {
    return <ItemCadastradoScreen navegar={navegarPara} />;
  } 
  
  if (telaAtual === 'Movimentacao') {
    return <MovimentacaoScreen navegar={navegarPara} />;
  }
}

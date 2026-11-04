import React, { useState } from 'react';

// Importações blindadas dos arquivos na pasta components
import LoginScreen from './login';
import BancoScreen from './banco';
import AdicionarItensScreen from './adicionaritens';
import ItemCadastradoScreen from './itemcadastrado';
import MovimentacaoScreen from './movimentacao';
import CadastrarUsuariosScreen from './cadastrar_usuarios'; 

export default function App() {
  const [telaAtual, setTelaAtual] = useState('Login');
  const [nivelAcesso, setNivelAcesso] = useState(''); // Guarda 'admin', 'adm' ou 'usuario' vindo da API

  // Função adaptada para receber o nível de acesso vindo do login do Docker
  const navegarPara = (nomeDaTela, roleDoUsuario = null) => {
    if (roleDoUsuario !== null) {
      setNivelAcesso(String(roleDoUsuario).trim());
    }
    setTelaAtual(nomeDaTela);
  };

  const telaFormatada = telaAtual.toLowerCase();

  if (telaFormatada === 'login') {
    return <LoginScreen navegar={navegarPara} />;
  } 
  
  if (telaFormatada === 'banco') {
    return <BancoScreen navegar={navegarPara} nivelAcesso={nivelAcesso} />;
  } 
  
  if (telaFormatada === 'adicionaritens') {
    return <AdicionarItensScreen navegar={navegarPara} nivelAcesso={nivelAcesso} />;
  } 
  
  if (telaFormatada === 'itemcadastrado') {
    return <ItemCadastradoScreen navegar={navegarPara} nivelAcesso={nivelAcesso} />;
  } 
  
  if (telaFormatada === 'movimentacao') {
    return <MovimentacaoScreen navegar={navegarPara} nivelAcesso={nivelAcesso} />;
  }

  if (telaFormatada === 'cadastrar_usuarios') {
    const roleLimpa = nivelAcesso.toLowerCase();
    // 🔒 Barreira de segurança: se não for admin/adm, impede o acesso à tela
    if (roleLimpa !== 'admin' && roleLimpa !== 'adm') {
      return <BancoScreen navegar={navegarPara} nivelAcesso={nivelAcesso} />;
    }
    return <CadastrarUsuariosScreen navegar={navegarPara} nivelAcesso={nivelAcesso} />;
  }

  return null;
}

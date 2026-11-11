import React, { useState } from 'react';
import LoginScreen from './login';
import BancoScreen from './banco';
import AdicionarItensScreen from './adicionaritens';
import MovimentacaoScreen from './movimentacao';
import CadastrarUsuariosScreen from './cadastrar_usuarios';

export default function App() {
  const [tela, setTela] = useState('login');
  const [nivelAcesso, setNivelAcesso] = useState('');

  const navegar = (novaTela, role = null) => {
    if (role !== null) setNivelAcesso(String(role).trim().toLowerCase());
    setTela(novaTela.toLowerCase());
  };

  const isAdmin = nivelAcesso === '1' || nivelAcesso.includes('adm');

  if (tela === 'login') return <LoginScreen navegar={navegar} />;
  if (tela === 'banco') return <BancoScreen navegar={navegar} nivelAcesso={nivelAcesso} />;
  if (tela === 'adicionaritens') return <AdicionarItensScreen navegar={navegar} nivelAcesso={nivelAcesso} />;
  if (tela === 'movimentacao') return <MovimentacaoScreen navegar={navegar} nivelAcesso={nivelAcesso} />;
  if (tela === 'cadastrar_usuarios' && isAdmin) {
    return <CadastrarUsuariosScreen navegar={navegar} nivelAcesso={nivelAcesso} />;
  }

  return <BancoScreen navegar={navegar} nivelAcesso={nivelAcesso} />;
}

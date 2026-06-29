import React, { useEffect } from 'react';
// @ts-ignore: expo-router may not have type declarations available in this environment
import { Stack } from 'expo-router';
import { setupDatabase } from '../src/database/database';


export default function Layout() {
  useEffect(() => {
    setupDatabase(); // Inicializa a tabela e insere dados de demonstração no SQLite
  }, []);

  // Retorna estrutura de navegação Stack com 3 telas principais
  return (
    <Stack screenOptions={{ headerShown: false }}> {/* Desativa o header padrão do Expo Router */}
      <Stack.Screen name="index" /> {/* Tela Home - Listagem de produtos */}
      <Stack.Screen name="detail" /> {/* Tela de Detalhes - Visualização individual */}
      <Stack.Screen name="form" /> {/* Tela de Formulário - Cadastro/Edição */}
    </Stack>
  );
}
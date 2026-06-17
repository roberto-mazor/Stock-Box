import React, { useEffect } from 'react';
// @ts-ignore: expo-router may not have type declarations available in this environment
import { Stack } from 'expo-router';
import { setupDatabase } from '../src/database/database';

export default function Layout() {
  useEffect(() => {
    setupDatabase(); // Inicializa o SQLite
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="form" />
    </Stack>
  );
}
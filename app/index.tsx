import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Product } from '../src/types';
import { database } from '../src/database/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 
 * 
 * Responsabilidades:
 * - Exibe lista de produtos em grid 2 colunas
 * - Permite filtrar produtos por nome em tempo real
 * - Calcula e exibe estatísticas (total de produtos e valor do estoque)
 * - Gerencia erro ao carregar imagens com fallback para placeholder
 * - Navega para tela de detalhes ou formulário
 * 
 * @returns {JSX.Element} Tela com FlatList de produtos e campo de filtro
 */
export default function HomeScreen() { // Tela principal de listagem de produtos
  const insets = useSafeAreaInsets(); // Hook que retorna valores de espaçamento seguro (notches, câmeras, etc)
  const [products, setProducts] = useState<Product[]>([]); // Estado que armazena lista de produtos para renderização
  const [search, setSearch] = useState<string>('');   // Estado que armazena o termo de busca digitado no campo de filtro
  
  // Estado que rastreia quais imagens falharam ao carregar da URL (para mostrar fallback)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const loadProducts = useCallback(() => {
    
    const data = search ? database.getFiltered(search) : database.getAll(); // Se há termo de busca, busca produtos que contenham o termo; senão carrega todos
    setProducts(data); // Atualiza estado local com o resultado da busca/carregamento
  }, [search]); // Dependência: função é recriada quando 'search' muda

  useFocusEffect( // Hook que executa função sempre que a tela ganha foco (volta do detalhe/form)
    useCallback(() => {
      loadProducts(); // Recarrega lista quando volta para a tela
    }, [loadProducts])
  );


  const totalProducts = products.length;   // Calcula quantidade total de produtos na lista
  const totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0); // Calcula valor total do estoque: soma de (preço × quantidade) de cada produto

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <Text style={styles.headerTitle}>stock box</Text>

      {/* Campo de input para filtrar produtos por nome em tempo real */}
      <TextInput
        style={styles.inputFilter}
        placeholder="filtro por nome"
        placeholderTextColor="#9ca3af"
        value={search} 
        onChangeText={setSearch} 
      />

      <View style={styles.summaryContainer}> {/* Resumo com estatísticas do estoque */}
        <Text style={styles.summaryText}>total de produtos: {totalProducts}</Text> {/* Exibe quantidade total de produtos na lista */}
        <Text style={styles.summaryText}>valor total estoque: R$ {totalStockValue.toFixed(2)}</Text> {/* Exibe valor monetário total em estoque (preço × qtd para cada item) */}
      </View>

      {/* Lista virtual com 2 colunas para renderizar produtos de forma eficiente */}
      <FlatList
        data={products} 
        keyExtractor={(item) => item.id.toString()} 
        numColumns={2} 
        columnWrapperStyle={styles.row} 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false} 
        renderItem={({ item }) => {
          // Verifica se a imagem do produto falhou ao carregar
          const hasError = imageErrors[item.id];
          // Verifica se URL da imagem é válida e não vazia
          const hasValidUrl = item.image_url && item.image_url.trim() !== "";

          return (
            // Card clicável que navega para tela de detalhes
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => router.push({ pathname: '/detail', params: { productId: item.id } })} 
            >
              {/* Imagem do produto com fallback para placeholder */}
              <Image 
                source={
                  // Se URL é válida E não teve erro, carrega da URL; senão mostra placeholder
                  hasValidUrl && !hasError
                    ? { uri: item.image_url } 
                    : require('../assets/placeholder.png')
                } 
                style={styles.cardImage} 
                // Se imagem falhar ao carregar, marca erro no estado
                onError={() => {
                  if (hasValidUrl) {
                    setImageErrors(prev => ({ ...prev, [item.id]: true }));
                  }
                }}
              />
              {/* Nome do produto (máximo 1 linha) */}
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              {/* Quantidade em estoque do produto */}
              <Text style={styles.cardQty}>qntd. {item.quantity}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Botão flutuante no rodapé com padding seguro */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Botão primário para navegar até formulário de novo produto */}
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/form')}>
          <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20 },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addButton: {
    backgroundColor: '#4c7de7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4c7de7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 18, color: '#1f2937' },
  inputFilter: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#fff', fontSize: 15 },
  summaryContainer: { marginBottom: 15 },
  summaryText: { fontSize: 16, color: '#4b5563', fontWeight: '500', lineHeight: 22 },
  row: { justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: 'center', 
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardTitle: { fontWeight: 'bold', color: '#4c7de7', textAlign: 'center', fontSize: 15, marginBottom: 4 },
  cardQty: { color: '#6b7280', fontSize: 13 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});
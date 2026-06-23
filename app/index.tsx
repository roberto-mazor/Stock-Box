import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Product } from '../src/types';
import { database } from '../src/database/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');
  
  // 🆕 ESTADO NOVO: Guarda quais imagens falharam ao carregar da internet
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const loadProducts = useCallback(() => {
    const data = search ? database.getFiltered(search) : database.getAll();
    setProducts(data);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <Text style={styles.headerTitle}>stock box</Text>

      <TextInput
        style={styles.inputFilter}
        placeholder="filtro por nome"
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>total de produtos: {totalProducts}</Text>
        <Text style={styles.summaryText}>valor total estoque: R$ {totalStockValue.toFixed(2)}</Text>
      </View>

      {/* 🔄 AQUI ESTÁ A FLATLIST ATUALIZADA E INTELIGENTE */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const hasError = imageErrors[item.id];
          const hasValidUrl = item.image_url && item.image_url.trim() !== "";

          return (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => router.push({ pathname: '/detail', params: { productId: item.id } })}
            >
              <Image 
                source={
                  hasValidUrl && !hasError
                    ? { uri: item.image_url } 
                    : require('../assets/placeholder.png')
                } 
                style={styles.cardImage} 
                onError={() => {
                  if (hasValidUrl) {
                    setImageErrors(prev => ({ ...prev, [item.id]: true }));
                  }
                }}
              />
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardQty}>qntd. {item.quantity}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
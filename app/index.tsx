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
    <View style={styles.container}>
      <Text style={styles.headerTitle}>stock box</Text>

      <TextInput
        style={styles.inputFilter}
        placeholder="filtro por nome"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>total de produtos: {totalProducts}</Text>
        <Text style={styles.summaryText}>valor total estoque: R$ {totalStockValue.toFixed(2)}</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        // Esse padding impede que os últimos cards fiquem escondidos atrás do botão fixo
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push({ pathname: '/detail', params: { productId: item.id } })}
          >
            <Image 
              source={item.image_url ? { uri: item.image_url } : require('../assets/placeholder.png')} 
              style={styles.cardImage} 
            />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardQty}>qntd. {item.quantity}</Text>
          </TouchableOpacity>
        )}
      />

      {/* REVISADO: Container do botão adicionado de volta e aplicando a Área Segura dinamicamente */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/form')}>
          <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20, paddingTop: 20 },
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
    shadowColor: '#4c7de7', // Ajustado para combinar com a cor do próprio botão azul
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 18 },
  inputFilter: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#fff' },
  summaryContainer: { marginBottom: 15 },
  summaryText: { fontSize: 16, color: '#333' },
  row: { justifyContent: 'space-between' },
  card: { width: '47%', borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 10, marginBottom: 15, alignItems: 'center', backgroundColor: '#fff' },
  cardImage: { width: 60, height: 60, resizeMode: 'contain', marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', color: '#0056b3', textAlign: 'center' },
  cardQty: { color: '#0056b3' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});
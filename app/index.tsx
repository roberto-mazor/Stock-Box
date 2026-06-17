import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Product } from '../src/types';
import { database } from '../src/database/database';

export default function HomeScreen() {
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
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            // Passando o ID via query param
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

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/form')}>
        <Text style={styles.addButtonText}>adicionar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 18 },
  inputFilter: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15 },
  summaryContainer: { marginBottom: 15 },
  summaryText: { fontSize: 16, color: '#333' },
  row: { justifyContent: 'space-between' },
  card: { width: '47%', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 10, marginBottom: 15, alignItems: 'center' },
  cardImage: { width: 60, height: 60, resizeMode: 'contain', marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', color: '#0056b3', textAlign: 'center' },
  cardQty: { color: '#0056b3' },
  addButton: { borderWidth: 1, borderColor: 'red', borderRadius: 25, padding: 15, alignItems: 'center', marginTop: 10 },
  addButtonText: { color: 'red', fontWeight: 'bold', fontSize: 16 }
});
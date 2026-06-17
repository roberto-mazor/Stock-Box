import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Product } from '../src/types';
import { database } from '../src/database/database';


export default function DetailScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (productId) {
        const data = database.getById(Number(productId));
        setProduct(data);
      }
    }, [productId])
  );

  if (!product) {
    return <View style={styles.containerCenter}><Text>Carregando...</Text></View>;
  }

  const grossValue = product.price * product.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>pagina atual</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/form', params: { productId: product.id } })}>
          <Text style={styles.editIcon}>✏️ editar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image 
          source={product.image_url ? { uri: product.image_url } : require('../assets/placeholder.png')} 
          style={styles.productImage} 
        />
        <Text style={styles.imageLabel}>imagem do produto</Text>
      </View>

      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.infoText}>qntd. estoque: {product.quantity}</Text>
      <Text style={styles.priceText}>R$ {product.price.toFixed(2)}</Text>
      <Text style={styles.grossPriceText}>R$ {grossValue.toFixed(2)}</Text>
      
      <Text style={styles.descriptionText}>{product.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backArrow: { fontSize: 24, color: '#0056b3' },
  headerTitle: { fontSize: 18, color: '#0056b3' },
  editIcon: { fontSize: 16, color: '#0056b3' },
  imageContainer: { borderWidth: 1, borderColor: '#0056b3', borderRadius: 15, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  productImage: { width: '80%', height: '80%', resizeMode: 'contain' },
  imageLabel: { color: '#0056b3', marginTop: 5 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#0056b3', marginBottom: 5 },
  infoText: { fontSize: 16, color: '#0056b3', marginBottom: 5 },
  priceText: { fontSize: 18, color: '#0056b3', marginBottom: 5 },
  grossPriceText: { fontSize: 18, color: '#0056b3', fontWeight: 'bold', marginBottom: 15 },
  descriptionText: { fontSize: 14, color: '#0056b3', lineHeight: 20 }
});
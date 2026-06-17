import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Product } from '../src/types';
import { database } from '../src/database/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importação adicionada

export default function DetailScreen() {
  const insets = useSafeAreaInsets(); // Hook para afastar o conteúdo da câmera
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
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const grossValue = product.price * product.quantity;

  return (
    // Usamos ScrollView para garantir que descrições longas não cortem a tela em celulares menores
    <ScrollView 
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho alinhado e protegido da câmera */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Detalhes</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/form', params: { productId: product.id } })}>
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Container da Imagem Clean */}
      <View style={styles.imageContainer}>
        <Image 
          source={product.image_url ? { uri: product.image_url } : require('../assets/placeholder.png')} 
          style={styles.productImage} 
        />
      </View>

      {/* Card de Informações do Produto */}
      <View style={styles.infoCard}>
        <Text style={styles.productName}>{product.name}</Text>
        
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Quantidade em Estoque:</Text>
          <Text style={styles.value}>{product.quantity} un.</Text>
        </View>

        <View style={styles.rowInfo}>
          <Text style={styles.label}>Preço Unitário:</Text>
          <Text style={styles.priceValue}>R$ {product.price.toFixed(2)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowInfo}>
          <Text style={styles.labelTotal}>Valor Total do Estoque:</Text>
          <Text style={styles.grossPriceText}>R$ {grossValue.toFixed(2)}</Text>
        </View>
      </View>

      {/* Seção de Descrição */}
      {product.description ? (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  loadingText: { color: '#6b7280', fontSize: 16 },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25,
    marginTop: 10
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#e5e7eb', // Cinza sutil idêntico ao formulário
  },
  backButtonText: { fontSize: 15, fontWeight: '600', color: '#4b5563' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#4c7de7', // Azul combinando com as ações do app
  },
  editButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  imageContainer: { 
    backgroundColor: '#fff',
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    height: 240, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: { width: '85%', height: '85%', resizeMode: 'contain' },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  label: { fontSize: 15, color: '#4b5563' },
  labelTotal: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  value: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  priceValue: { fontSize: 16, fontWeight: '600', color: '#4c7de7' },
  
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  grossPriceText: { fontSize: 18, color: '#10b981', fontWeight: 'bold' }, // Verde para indicar valor monetário total

  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  descriptionText: { fontSize: 15, color: '#4b5563', lineHeight: 22 }
});
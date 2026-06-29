import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Product } from '../src/types';
import { database } from '../src/database/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importação adicionada

/**
 * DetailScreen - Tela de visualização detalhada do produto
 * 
 * Responsabilidades:
 * - Exibe informações completas do produto (nome, quantidade, preço, descrição)
 * - Calcula e exibe o valor total do estoque (preço × quantidade)
 * - Permite navegação para tela de edição
 * - Carrega dados do banco quando a tela recebe foco
 * - Trata falta de produto com mensagem de carregamento
 * 
 * @returns {JSX.Element} ScrollView com detalhes do produto ou loading state
 */
export default function DetailScreen() {
  // Hook que retorna espaçamento seguro da câmera e bordas do dispositivo
  const insets = useSafeAreaInsets();
  // Extrai parâmetro 'productId' passado pela rota ao navegar
  const { productId } = useLocalSearchParams<{ productId: string }>();
  // Estado que armazena dados completos do produto
  const [product, setProduct] = useState<Product | null>(null);

  // Hook que executa quando a tela ganha foco (volta do formulário)
  useFocusEffect(
    useCallback(() => {
      // Se productId está disponível, busca o produto no banco
      if (productId) {
        const data = database.getById(Number(productId));
        setProduct(data); // Atualiza estado com os dados do produto
      }
    }, [productId])
  );

  // Renderiza loading enquanto os dados não são carregados
  if (!product) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Calcula o valor monetário total do produto em estoque (preço × quantidade)
  const grossValue = product.price * product.quantity;

  return (
    // ScrollView permite scroll vertical em descrições longas que não cabem na tela
    <ScrollView 
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false} 
    >
      {/* Cabeçalho com 3 botões: voltar, título e editar */}
      <View style={styles.header}>
        {/* Botão voltar - retorna à tela anterior */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        
        {/* Título centralizado da página */}
        <Text style={styles.headerTitle}>Detalhes</Text>
        
        {/* Botão editar - navega para formulário em modo edição passando o ID */}
        <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/form', params: { productId: product.id } })}>
          <Text style={styles.editButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Container para a imagem do produto com espaçamento */}
      <View style={styles.imageContainer}>
        {/* Imagem com fallback: se não tiver URL ou falhar, mostra placeholder */}
        <Image 
          source={product.image_url ? { uri: product.image_url } : require('../assets/placeholder.png')} 
          style={styles.productImage} 
        />
      </View>

      {/* Card branco com informações principais do produto */}
      <View style={styles.infoCard}>
        {/* Nome do produto em destaque */}
        <Text style={styles.productName}>{product.name}</Text>
        
        {/* Linha: Quantidade em Estoque */}
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Quantidade em Estoque:</Text>
          <Text style={styles.value}>{product.quantity} un.</Text> {/* Exibe qtd + unidade */}
        </View>

        {/* Linha: Preço Unitário em azul */}
        <View style={styles.rowInfo}>
          <Text style={styles.label}>Preço Unitário:</Text>
          <Text style={styles.priceValue}>R$ {product.price.toFixed(2)}</Text> {/* Formatado com 2 casas decimais */}
        </View>

        {/* Separador visual entre preço unitário e total */}
        <View style={styles.divider} />

        {/* Linha: Valor Total do Estoque em verde (destaque importante) */}
        <View style={styles.rowInfo}>
          <Text style={styles.labelTotal}>Valor Total do Estoque:</Text>
          {/* Total = preço × quantidade */}
          <Text style={styles.grossPriceText}>R$ {grossValue.toFixed(2)}</Text>
        </View>
      </View>

      {/* Seção de descrição - renderiza apenas se o produto tiver descrição */}
      {product.description ? (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      ) : null} {/* Se não tiver descrição, não renderiza nada */}
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
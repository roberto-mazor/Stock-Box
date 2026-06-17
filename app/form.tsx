import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { database } from '../src/database/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importação adicionada

export default function FormScreen() {
  const insets = useSafeAreaInsets(); // Hook para gerenciar o espaçamento do topo e da câmera
  const { productId } = useLocalSearchParams<{ productId?: string }>();

  const [imageUrl, setImageUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');

  useEffect(() => {
    if (productId) {
      const product = database.getById(Number(productId));
      if (product) {
        setImageUrl(product.image_url || '');
        setName(product.name);
        setDescription(product.description || '');
        setQuantity(product.quantity.toString());
        setPrice(product.price.toString());
      }
    }
  }, [productId]);

  const handleSave = () => {
    if (!name || !quantity || !price) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
      return;
    }

    const productData = {
      name,
      description,
      quantity: parseInt(quantity, 10) || 0,
      price: parseFloat(price) || 0,
      image_url: imageUrl
    };

    if (productId) {
      database.update(Number(productId), productData);
    } else {
      database.insert(productData);
    }

    router.replace('/');
  };

  return (
    // Adicionamos o paddingTop dinâmico no container para empurrar todo o conteúdo para baixo da câmera
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      
      <View style={styles.header}>
        {/* Adicionado padding interno e fundo sutil para criar uma área de clique gigante no botão voltar */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Voltar</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {productId ? 'Editar Produto' : 'Novo Produto'}
        </Text>
        
        {/* View vazia apenas para manter o título perfeitamente centralizado no flexbox */}
        <View style={{ width: 80 }} />
      </View>

      {/* Alterados os placeholders e cores de borda para tons neutros e profissionais */}
      <TextInput style={styles.input} placeholder="URL da imagem (opcional)" placeholderTextColor="#9ca3af" value={imageUrl} onChangeText={setImageUrl} />
      <TextInput style={styles.input} placeholder="Nome do produto *" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Descrição do produto (opcional)" placeholderTextColor="#9ca3af" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Quantidade atual em estoque *" placeholderTextColor="#9ca3af" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
      <TextInput style={styles.input} placeholder="Valor unitário (R$) *" placeholderTextColor="#9ca3af" keyboardType="numeric" value={price} onChangeText={setPrice} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Confirmar e Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20 },
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
    backgroundColor: '#e5e7eb', // Cinza sutil de fundo para destacar o botão
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 15, fontWeight: '600', color: '#4b5563' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  input: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    color: '#1f2937',
    backgroundColor: '#fff', // Fundo branco limpo para contraste
    fontSize: 15,
    // Sombra sutil para os inputs seguirem o padrão moderno
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButton: { 
    backgroundColor: '#4c7de7', // Combinando com o tom azul de sucesso que você escolheu!
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4c7de7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { database } from '../src/database/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importação adicionada


export default function FormScreen() {
  const insets = useSafeAreaInsets();  // espaçamento seguro para notches/câmeras
  // Extrai productId da rota - opcional, indica se é edição ou novo cadastro
  const { productId } = useLocalSearchParams<{ productId?: string }>();

  // Estados para cada campo do formulário
  const [imageUrl, setImageUrl] = useState<string>(''); // URL da imagem do produto
  const [name, setName] = useState<string>(''); // Nome do produto (obrigatório)
  const [description, setDescription] = useState<string>(''); // Descrição (opcional)
  const [quantity, setQuantity] = useState<string>(''); // Quantidade em estoque (obrigatório)
  const [price, setPrice] = useState<string>(''); // Preço unitário (obrigatório)

  useEffect(() => {
    if (productId) { // Se há ID, significa modo edição
      const product = database.getById(Number(productId)); // Busca produto pelo ID no banco de dados
      if (product) { // Se encontrou, preenche todos os campos com os dados
        setImageUrl(product.image_url || ''); // URL ou string vazia
        setName(product.name); // Nome obrigatório
        setDescription(product.description || ''); // Descrição ou vazia
        setQuantity(product.quantity.toString()); // Converte number para string
        setPrice(product.price.toString()); // Converte number para string
      }
    }
  }, [productId]); // Dependência: recria quando productId muda


  const handleSave = () => {
    // Valida campos obrigatórios
    if (!name || !quantity || !price) {
      // Mostra alerta se faltam campos obrigatórios
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
      return; // Interrompe execução
    }

    // Monta objeto com dados do produto
    const productData = {
      name, // String
      description, // String
      quantity: parseInt(quantity, 10) || 0, // Converte string para inteiro
      price: parseFloat(price) || 0, // Converte string para decimal
      image_url: imageUrl // URL ou string vazia
    };

    // Se há productId, está em modo edição; senão, novo cadastro
    if (productId) {
      database.update(Number(productId), productData); // Atualiza produto existente
    } else {
      database.insert(productData); // Insere novo produto
    }

    // Navega de volta à home e substitui esta tela do histórico
    router.replace('/');
  };

  return (
    // Container principal com padding seguro da câmera/notch
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      
      {/* Cabeçalho com botão voltar, título dinâmico e view vazia para centralizar */}
      <View style={styles.header}>
        {/* Botão voltar - retorna à tela anterior */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Voltar</Text>
        </TouchableOpacity>
        
        {/* Título dinâmico: "Editar Produto" ou "Novo Produto" conforme o modo */}
        <Text style={styles.headerTitle}>
          {productId ? 'Editar Produto' : 'Novo Produto'} {/* Muda título baseado no modo */}
        </Text>
        
        {/* View vazia mantém o título perfeitamente centralizado no flexbox */}
        <View style={{ width: 80 }} />
      </View>

      {/* Campo 1: URL da imagem (opcional) */}
      <TextInput 
        style={styles.input} 
        placeholder="URL da imagem (opcional)" 
        placeholderTextColor="#9ca3af" 
        value={imageUrl} 
        onChangeText={setImageUrl} 
      />
      
      {/* Campo 2: Nome do produto (obrigatório) */}
      <TextInput 
        style={styles.input} 
        placeholder="Nome do produto *" 
        placeholderTextColor="#9ca3af" 
        value={name} 
        onChangeText={setName} 
      />
      
      {/* Campo 3: Descrição (opcional) */}
      <TextInput 
        style={styles.input} 
        placeholder="Descrição do produto (opcional)" 
        placeholderTextColor="#9ca3af" 
        value={description} 
        onChangeText={setDescription} 
      />
      
      {/* Campo 4: Quantidade (obrigatório, só aceita números) */}
      <TextInput 
        style={styles.input} 
        placeholder="Quantidade atual em estoque *" 
        placeholderTextColor="#9ca3af" 
        keyboardType="numeric" 
        value={quantity} 
        onChangeText={setQuantity} 
      />
      
      {/* Campo 5: Preço unitário (obrigatório, só aceita números) */}
      <TextInput 
        style={styles.input} 
        placeholder="Valor unitário (R$) *" 
        placeholderTextColor="#9ca3af" 
        keyboardType="numeric" 
        value={price} 
        onChangeText={setPrice} 
      />

      {/* Botão de salvamento primário */}
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
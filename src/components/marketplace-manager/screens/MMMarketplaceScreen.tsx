import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ToastAndroid, StyleSheet } from 'react-native';

// Mock data for fallback
const mockData = [
    { id: '1', name: 'Product 1', price: 100 },
    { id: '2', name: 'Product 2', price: 200 },
    { id: '3', name: 'Product 3', price: 300 },
];

const MMMarketplaceScreen = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Simulate fetching data from the database
        const fetchData = async () => {
            try {
                // Replace with actual database call
                const response = await fetch('https://api.example.com/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error(error); // Normally handle the error properly
                // Fallback to mock data
                setProducts(mockData);
            }
        };

        fetchData();
    }, []);

    const handleDemoClick = (productName) => {
        ToastAndroid.show(`Demo for ${productName} clicked!`, ToastAndroid.SHORT);
    };

    const handleBuyClick = (productName) => {
        ToastAndroid.show(`Buying ${productName}!`, ToastAndroid.SHORT);
    };

    const renderItem = ({ item }) => {
        const discountedPrice = (item.price * 0.7).toFixed(2); // 30% discount
        return (
            <View style={styles.productContainer}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>Price: ${discountedPrice}</Text>
                <Button title="Demo" onPress={() => handleDemoClick(item.name)} />
                <Button title="Buy" onPress={() => handleBuyClick(item.name)} />
            </View>
        );
    };

    return (
        <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    productContainer: {
        marginBottom: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 16,
        color: '#555',
    },
});

export default MMMarketplaceScreen;

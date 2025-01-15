import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { database, ref, get } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [macAddresses, setMacAddresses] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMacAddresses = async () => {
      try {
        const snapshot = await get(ref(database, '/'));
        const data = snapshot.val();
        if (data) {
          const macs = Object.keys(data);
          setMacAddresses(macs);
        }
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    };

    fetchMacAddresses();
  }, []);

  const renderGarbageItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        navigation.navigate('TrashDetails', { 
          macAddress: item,
          garbageName: `Garbage ${index + 1}`,
        });
      }}
    >
      <Text style={styles.cardTitle}>Garbage {index + 1}</Text>
      <Text style={styles.cardSubtitle}>MAC Address: {item}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/garbage.jpeg')} // Correct path to your image
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerText}>List of Garbages</Text>

        <FlatList
          data={macAddresses}
          keyExtractor={item => item}
          renderItem={renderGarbageItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No garbages found.</Text>}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF', // Solid white background
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    marginTop: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { database, ref, get } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native'; // For navigation

export default function HomeScreen() {
  const [macAddresses, setMacAddresses] = useState([]);
  const navigation = useNavigation();

  // Récupérer les données des poubelles depuis Firebase
  useEffect(() => {
    const fetchMacAddresses = async () => {
      try {
        const snapshot = await get(ref(database, '/'));
        const data = snapshot.val();
        if (data) {
          const macs = Object.keys(data); // Récupérer les adresses MAC
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
      style={styles.macItem}
      onPress={() => navigation.navigate('TrashDetails', { macAddress: item })}
    >
      <Text style={styles.macText}>Garbage {index + 1}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>List of Garbages</Text>

      <FlatList
        data={macAddresses}
        keyExtractor={item => item}
        renderItem={renderGarbageItem}
        ListHeaderComponent={<Text style={styles.listHeader}>Garbage Names</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No garbages found.</Text>}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  macItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  macText: {
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
    marginTop: 32,
  },
});

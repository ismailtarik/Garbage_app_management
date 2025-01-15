import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { ProgressBar, IconButton } from 'react-native-paper';
import { database, ref, get } from './firebaseConfig';

export default function TrashDetails({ route }) {
  const { macAddress } = route.params;
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const snapshot = await get(ref(database, `/${macAddress}/sensorData`));
        const data = snapshot.val();

        if (data) {
          const entries = Object.entries(data);
          const lastEntry = entries[entries.length - 1];
          const [timestamp, values] = lastEntry;
          setLatestData({ timestamp, ...values });
        }
      } catch (error) {
        console.error("Error fetching trash data:", error);
      }
    };

    fetchLatestData();
  }, [macAddress]);

  const getGasLevelProps = (ppm) => {
    if (ppm < 30) return { label: 'Safe', color: 'green', icon: 'check-circle' };
    if (ppm < 70) return { label: 'Warning', color: 'orange', icon: 'alert-circle' };
    return { label: 'Alert', color: 'red', icon: 'alert-octagon' };
  };

  const getFillLevelColor = (distance) => {
    if (distance < 20) return 'green';
    if (distance < 50) return 'yellow';
    return 'red';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Details for {macAddress}</Text>

      {latestData ? (
        <View style={styles.dataContainer}>
          <Text style={styles.label}>Last Updated: {latestData.timestamp}</Text>

          {/* Distance Level */}
          <Text style={styles.label}>Distance:</Text>
          <ProgressBar
            progress={1 - latestData.distance_cm / 100}
            color={getFillLevelColor(latestData.distance_cm)}
            style={styles.progressBar}
          />
          <Text style={styles.value}>{`${latestData.distance_cm} cm`}</Text>

          {/* Gas Level */}
          <Text style={styles.label}>Gas Level:</Text>
          <View style={styles.gasIndicator}>
            <IconButton
              icon={getGasLevelProps(latestData.ppm).icon}
              iconColor={getGasLevelProps(latestData.ppm).color}
              size={24}
            />
            <Text style={[styles.value, { marginLeft: 10 }]}>
              {getGasLevelProps(latestData.ppm).label.toUpperCase()} - {latestData.ppm} ppm
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>No data available.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 1,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
  },
  gasIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});

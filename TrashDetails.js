import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { ProgressBar, IconButton } from "react-native-paper";
import { database, ref, onValue } from "./firebaseConfig";

export default function TrashDetails({ route }) {
  const { macAddress, garbageName } = route.params;
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const dataRef = ref(database, `/${macAddress}/sensorData`);

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const entries = Object.entries(data);
          const lastEntry = entries[entries.length - 1];
          const [timestamp, values] = lastEntry;
          setLatestData({ timestamp, ...values });
        }
      },
      (error) => {
        console.error("Error fetching trash data:", error);
      }
    );

    return () => unsubscribe();
  }, [macAddress]);

  const getGasLevelProps = (ppm) => {
    if (ppm < 800) return { label: "Safe", color: "green", icon: "check-circle" };
    if (ppm < 1500) return { label: "Warning", color: "orange", icon: "alert-circle" };
    return { label: "Alert", color: "red", icon: "alert-octagon" };
  };

  const getFillLevelColor = (distance) => {
    if (distance < 10) return "green";
    if (distance < 15) return "yellow";
    return "red";
  };

  const renderDistanceProgressBar = () => {
    if (latestData?.distance_cm != null && !isNaN(latestData.distance_cm)) {
      const progress = Math.max(0, Math.min(1, 1 - latestData.distance_cm / 100));
      return (
        <>
          <ProgressBar
            progress={progress}
            color={getFillLevelColor(latestData.distance_cm)}
            style={styles.progressBar}
          />
          <Text style={styles.value}>{`${latestData.distance_cm} cm`}</Text>
        </>
      );
    }
    return <Text style={styles.value}>Distance data unavailable</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Details for the Garbage</Text>

      {latestData ? (
        <View style={styles.dataContainer}>
          <Text style={styles.label}>Last Updated: {latestData.timestamp}</Text>

          {/* Distance Level */}
          <Text style={styles.label}>Distance:</Text>
          {renderDistanceProgressBar()}

          {/* Gas Level */}
          <Text style={styles.label}>Gas Level:</Text>
          <View style={styles.gasIndicator}>
            <IconButton
              icon={getGasLevelProps(latestData.ppm).icon}
              iconColor={getGasLevelProps(latestData.ppm).color}
              size={24}
            />
            <Text style={[styles.value, { marginLeft: 10 }]}>
              {getGasLevelProps(latestData.ppm).label.toUpperCase()} - {latestData.ppm || "N/A"} ppm
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
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dataContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
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
    flexDirection: "row",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});

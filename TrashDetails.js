import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { ProgressBar, IconButton } from "react-native-paper";
import { database, ref, onValue } from "./firebaseConfig";
import * as Notifications from "expo-notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TrashDetails({ route }) {
  const { macAddress, garbageName, vebreur } = route.params;  // Added vebreur
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted!');
      }
    };

    requestPermissions();

    const dataRef = ref(database, `/${macAddress}/sensorData`);

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('Received data:', data); // Log the data
        if (data) {
          const entries = Object.entries(data);
          const lastEntry = entries[entries.length - 1];
          const [timestamp, values] = lastEntry;
          const newData = { timestamp, ...values };
          setLatestData(newData);
          checkForAlerts(newData); // Check for alerts when data updates
        }
      },
      (error) => {
        console.error("Error fetching trash data:", error);
      }
    );

    return () => unsubscribe();
  }, [macAddress]);

  const checkForAlerts = (data) => {
    const gasAlert = data.ppm >= 1500; // Alert for high gas levels
    const fillAlert = data.distance_cm >= 20; // Alert for high fill level

    console.log('Checking for alerts:', { gasAlert, fillAlert });

    if (gasAlert || fillAlert) {
      let alertMessage = "Alert: ";

      if (gasAlert) alertMessage += "High gas levels detected. ";
      if (fillAlert) alertMessage += "Garbage is almost full.";

      triggerNotification(alertMessage);  // Notify for all users, including the Vebreur
      if (vebreur) {
        triggerVebreurNotification(alertMessage);  // Notify the specific Vebreur
      }
    }
  };

  const triggerNotification = async (message) => {
    console.log('Triggering notification with message:', message);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Garbage Alert",
        body: message,
      },
      trigger: null, // Immediate notification
    });
  };

  const triggerVebreurNotification = async (message) => {
    console.log('Triggering notification for vebreur with message:', message);
    // Sending a specific notification to the vebreur user
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Vebreur Alert",
        body: `Attention Vebreur: ${message}`,
      },
      trigger: null, // Immediate notification
    });
  };

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
            <Text style={[styles.value, { marginLeft: 10 }]}>{getGasLevelProps(latestData.ppm).label.toUpperCase()} - {latestData.ppm || "N/A"} ppm</Text>
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

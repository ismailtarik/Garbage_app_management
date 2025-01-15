import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from "react-native";
import { ProgressBar, IconButton } from "react-native-paper";
import { database, ref, onValue } from "../firebaseConfig";
import * as Notifications from "expo-notifications";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TrashDetails({ route }) {
  const { macAddress, garbageName, vebreur } = route.params;
  const [latestData, setLatestData] = useState(null);
  const [gasChartData, setGasChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`, // Gas chart color
      },
    ],
  });
  const [distanceChartData, setDistanceChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Distance chart color
      },
    ],
  });

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permission not granted!');
      }
    };
    requestPermissions();

    const dataRef = ref(database, `/${macAddress}/sensorData`);

    // Listening for data changes to get all entries
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const entries = Object.entries(data);
          const labels = [];
          const gasData = [];
          const distanceData = [];

          entries.forEach(([timestamp, values]) => {
            const formattedDate = formatDate(timestamp);
            const hour = new Date(timestamp).getHours();  // Extract hour for X-axis
            labels.push(`${hour}:00`);
            gasData.push(values.ppm && !isNaN(values.ppm) ? values.ppm : 0);  // Ensure valid data
            distanceData.push(values.distance_cm && !isNaN(values.distance_cm) ? values.distance_cm : 0);  // Ensure valid data
          });

          // Update Gas Chart Data
          setGasChartData({
            labels: labels.slice(-10),  // Limit to last 10 entries for the chart
            datasets: [
              { ...gasChartData.datasets[0], data: gasData.slice(-10) },
            ],
          });

          // Update Distance Chart Data
          setDistanceChartData({
            labels: labels.slice(-10),  // Limit to last 10 entries for the chart
            datasets: [
              { ...distanceChartData.datasets[0], data: distanceData.slice(-10) },
            ],
          });

          // Optionally set the latest data for display
          setLatestData({
            timestamp: entries[entries.length - 1][0],
            ...entries[entries.length - 1][1],
          });
        }
      },
      (error) => {
        console.error("Error fetching trash data:", error);
      }
    );

    return () => unsubscribe();
  }, [macAddress]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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

  const getFillLevelColor = (distance) => {
    if (distance > 10) return "green";
    if (distance > 5) return "yellow";
    return "red";
  };

  const getGasLevelProps = (ppm) => {
    if (ppm < 800) return { label: "Safe", color: "green", icon: "check-circle" };
    if (ppm < 1500) return { label: "Warning", color: "orange", icon: "alert-circle" };
    return { label: "Alert", color: "red", icon: "alert-octagon" };
  };

  const formatPPM = (ppm) => {
    if (ppm != null && !isNaN(ppm)) {
      return Math.round(ppm); // Ensure ppm is a valid number
    }
    return "N/A"; // If ppm is invalid or null
  };

  const currentDate = new Date().toLocaleDateString();  // Get today's date

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Details for {garbageName}</Text>

        {latestData ? (
          <View style={styles.dataContainer}>
            <Text style={styles.label}>Last Updated: {latestData.timestamp}</Text>

            <Text style={styles.label}>Distance:</Text>
            {renderDistanceProgressBar()}

            <Text style={styles.label}>Gas Level:</Text>
            <View style={styles.gasIndicator}>
              <IconButton
                icon={getGasLevelProps(latestData.ppm).icon}
                iconColor={getGasLevelProps(latestData.ppm).color}
                size={24}
              />
              <Text style={[styles.value, { marginLeft: 10 }]}>{getGasLevelProps(latestData.ppm).label.toUpperCase()} - {formatPPM(latestData.ppm)} ppm</Text>
            </View>

            {/* Distance Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Distance ({currentDate})</Text>
              <LineChart
                data={distanceChartData}
                width={Dimensions.get("window").width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                style={styles.chartStyle}
              />
            </View>

            {/* Gas Level Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Gas Levels ({currentDate})</Text>
              <LineChart
                data={gasChartData}
                width={Dimensions.get("window").width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 150, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                style={styles.chartStyle}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>No data available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    paddingBottom: 20,
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
  chartContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

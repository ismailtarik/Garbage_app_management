import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions, ScrollView } from "react-native";
import { database } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";
import { LineChart, BarChart } from "react-native-chart-kit";

export default function App() {
    const [sensorData, setSensorData] = useState([]);

    useEffect(() => {
        const sensorRef = ref(database, "sensorData");
        const unsubscribe = onValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newSensorData = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    distance_cm: data.distance_cm,
                    ppm: data.ppm,
                };
                setSensorData((prevData) => [...prevData, newSensorData]); // Ajouter de nouvelles données
            }
        });

        return () => unsubscribe();
    }, []);

    const distances = sensorData.map((data) => data.distance_cm);
    const ppmValues = sensorData.map((data) => data.ppm);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Gestion des Poubelles</Text>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Distance des Déchets (cm)</Text>
                <LineChart
                    data={{
                        labels: distances.map((_, index) => `T${index + 1}`),
                        datasets: [{ data: distances }],
                    }}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    yAxisSuffix="cm"
                    chartConfig={chartConfig}
                    style={styles.chart}
                />
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Niveau de Gaz (ppm)</Text>
                <BarChart
                    data={{
                        labels: ppmValues.map((_, index) => `T${index + 1}`),
                        datasets: [{ data: ppmValues }],
                    }}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    yAxisSuffix=" ppm"
                    chartConfig={chartConfig}
                    style={styles.chart}
                />
            </View>
            <FlatList
                data={sensorData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.bin}>
                        <Text style={styles.text}>
                            Distance des Déchets : {item.distance_cm.toFixed(2)} cm
                        </Text>
                        <Text style={styles.text}>Niveau de Gaz (ppm) : {item.ppm}</Text>
                    </View>
                )}
            />
        </ScrollView>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(26, 123, 237, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 1,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A7BED",
        textAlign: "center",
        marginVertical: 20,
    },
    chartContainer: {
        marginBottom: 20,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 10,
    },
    chart: {
        borderRadius: 10,
    },
    bin: {
        marginVertical: 10,
        padding: 15,
        backgroundColor: "#e8f4fd",
        borderRadius: 10,
        borderColor: "#1A7BED",
        borderWidth: 1,
    },
    text: {
        fontSize: 16,
        color: "#333",
    },
});

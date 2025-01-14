import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { database } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function App() {
    const [sensorData, setSensorData] = useState([]);

    // Fonction de validation et nettoyage des données
    const sanitizeData = (data) => {
        if (!data) return { distance_cm: 0, ppm: 0 }; // Retourne des valeurs par défaut si les données sont manquantes ou invalides

        const distance = parseFloat(data.distance_cm);
        const ppm = parseFloat(data.ppm);

        // Si les données ne sont pas valides, on retourne des valeurs par défaut
        return {
            distance_cm: isNaN(distance) ? 0 : distance,
            ppm: isNaN(ppm) ? 0 : ppm,
        };
    };

    useEffect(() => {
        const sensorRef = ref(database, "sensorData");
        const unsubscribe = onValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Données brutes reçues :", data);

            if (data) {
                const formattedData = Object.keys(data).map((key) => {
                    const cleanedData = sanitizeData(data[key]);
                    return {
                        id: key,
                        ...cleanedData,
                        timestamp: key, // Ajout de l'horodatage pour l'affichage
                    };
                });

                console.log("Données nettoyées :", formattedData); // Vérification des données nettoyées
                setSensorData(formattedData); // Mise à jour de l'état avec les données nettoyées
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Gestion des Poubelles</Text>

            {/* Affichage des données sous forme de liste */}
            <FlatList
                data={sensorData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.bin}>
                        <Text style={styles.text}>Temps : {item.timestamp}</Text>
                        <Text style={styles.text}>
                            Distance des Déchets : {item.distance_cm.toFixed(2)} cm
                        </Text>
                        <Text style={styles.text}>
                            Niveau de Gaz (ppm) : {item.ppm.toFixed(2)}
                        </Text>
                    </View>
                )}
            />
        </ScrollView>
    );
}

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

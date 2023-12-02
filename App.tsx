import "dotenv/config";
import React, { useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { Button, PaperProvider, Snackbar } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { IData } from "./types";

const firebaseConfig = {
  databaseURL: process.env.FIREBASE_RTDB_URL,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, "/");

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <HomeScreen />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function HomeScreen() {
  const [data, setData] = React.useState<IData>({
    lastIrCommand: "",
    externalTemperature: 0,
    lastUpdate: 0,
  });
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

  useEffect(
    () =>
      onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        setData(data);
      }),
    []
  );

  const sendCommand = (command: string, temperature?: number) => {
    const commandRef = ref(db, "/command");
    console.log("Sending command: " + command);
    set(commandRef, { command, temperature: temperature || 0 });
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 3000);
  };

  const onDismissSnackBar = () => setSnackbarVisible(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24 }}>Värmepump</Text>
        <Text>
          Uppdaterad: {new Date(data.lastUpdate).toLocaleString("sv-SE")}
        </Text>
        <Text>Temp: {data.externalTemperature.toFixed(1)}&deg;C</Text>
        <Text>Senaste kommando: {data.lastIrCommand}</Text>
        <Text style={{ marginTop: 25, marginBottom: 5 }}>Kommandon:</Text>
        <Button
          style={{ margin: 5 }}
          mode="contained"
          buttonColor="orange"
          onPress={() => sendCommand("heat", 22)}
        >
          Värme 22&deg;C
        </Button>
        <Button
          style={{ margin: 5 }}
          mode="contained"
          buttonColor="green"
          onPress={() => sendCommand("isave", 10)}
        >
          iSave 10&deg;C
        </Button>
        <Button
          style={{ margin: 5 }}
          mode="contained"
          buttonColor="red"
          onPress={() => sendCommand("off")}
        >
          Stäng av
        </Button>
        <Snackbar visible={snackbarVisible} onDismiss={onDismissSnackBar}>
          Kommando skickat!
        </Snackbar>
      </View>
    </SafeAreaView>
  );
}

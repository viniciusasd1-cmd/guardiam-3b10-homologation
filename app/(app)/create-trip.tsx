import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { createSafeTrip } from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { AppButton } from '../../src/components/AppButton';
import { AppInput } from '../../src/components/AppInput';
import { Screen } from '../../src/components/Screen';
import { colors } from '../../src/constants/colors';
import { TripType } from '../../src/types/safeTrip';

export default function CreateTripScreen() {
  const { accessToken } = useAuth();
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [tripType, setTripType] = useState<TripType>('RIDE_APP');
  const [loading, setLoading] = useState(false);

  async function handleCreateTrip() {
    if (!accessToken) {
      return;
    }

    setLoading(true);

    try {
      const safeTrip = await createSafeTrip(accessToken, {
        tripType,
        originAddress: originAddress.trim() || undefined,
        destinationAddress: destinationAddress.trim() || undefined,
        destinationName: destinationName.trim() || undefined,
      });
      router.replace({
        pathname: '/(app)/active-trip',
        params: { safeTripId: safeTrip.id },
      });
    } catch (error) {
      Alert.alert('Falha ao criar viagem', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Criar viagem segura</Text>
        <Text style={styles.subtitle}>
          Informe destino e tipo de deslocamento para preparar o acompanhamento.
        </Text>
      </View>

      <View style={styles.form}>
        <AppInput label="Origem" onChangeText={setOriginAddress} value={originAddress} />
        <AppInput
          label="Destino"
          onChangeText={setDestinationAddress}
          value={destinationAddress}
        />
        <AppInput
          label="Nome do destino"
          onChangeText={setDestinationName}
          value={destinationName}
        />
        <AppInput
          autoCapitalize="characters"
          label="Tipo da viagem"
          onChangeText={(value) => setTripType(value.trim().toUpperCase() as TripType)}
          value={tripType}
        />
        <AppButton loading={loading} onPress={handleCreateTrip} title="Criar viagem" />
      </View>
    </Screen>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
});

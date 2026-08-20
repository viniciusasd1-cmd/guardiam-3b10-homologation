import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { createSafeTrip } from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';
import type { TripType } from '../../src/types/safeTrip';

type IconName = ComponentProps<typeof Ionicons>['name'];

type ReadinessItemProps = {
  description: string;
  icon: IconName;
  title: string;
  tone?: 'blue' | 'green' | 'red';
};

const PROTECTION_SESSION_TYPE: TripType = 'RIDE_APP';

export default function CreateTripScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleActivateProtection() {
    if (!accessToken) {
      Alert.alert(
        'Sessão expirada',
        'Faça login novamente para ativar o Modo Proteção.',
      );
      return;
    }

    try {
      setLoading(true);

      const safeTrip = await createSafeTrip(accessToken, {
        tripType: PROTECTION_SESSION_TYPE,
      });

      router.replace({
        pathname: '/(app)/active-trip',
        params: { safeTripId: safeTrip.id },
      });
    } catch (error) {
      Alert.alert('Não foi possível ativar a proteção', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#0F172A" name="chevron-back" size={22} />
          </Pressable>

          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons color="#1B6EE0" name="shield-checkmark-outline" size={20} />
            </View>

            <Text style={styles.brand}>GUARDIAM</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons color="#10B981" name="shield-outline" size={42} />
          </View>

          <Text style={styles.eyebrow}>Modo Proteção</Text>
          <Text style={styles.title}>Ativar proteção</Text>

          <Text style={styles.subtitle}>
            O GUARDIAM ficará pronto para registrar sua localização e acionar seus
            contatos de segurança quando você precisar.
          </Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>Configuração rápida</Text>
          </View>
        </View>

        <View style={styles.readinessCard}>
          <Text style={styles.sectionTitle}>O que será preparado</Text>

          <ReadinessItem
            description="Seus contatos poderão ser usados em caso de alerta."
            icon="people-outline"
            title="Contatos de segurança"
            tone="blue"
          />

          <ReadinessItem
            description="A próxima etapa libera o envio de localização real em primeiro plano."
            icon="location-outline"
            title="Localização"
            tone="green"
          />

          <ReadinessItem
            description="O botão SOS ficará disponível com acionamento por pressão longa."
            icon="alert-circle-outline"
            title="SOS discreto"
            tone="red"
          />
        </View>

        <View style={styles.noteCard}>
          <Ionicons color="#1B6EE0" name="lock-closed-outline" size={18} />

          <Text style={styles.noteText}>
            O MVP ainda usa a base técnica validada anteriormente, mas a experiência
            agora é focada em proteção pessoal.
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Ativar proteção"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={handleActivateProtection}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !loading ? styles.primaryButtonPressed : null,
            loading ? styles.primaryButtonDisabled : null,
          ]}
        >
          <View style={styles.primaryButtonIcon}>
            <Ionicons
              color="#0F172A"
              name={loading ? 'hourglass-outline' : 'power-outline'}
              size={24}
            />
          </View>

          <View style={styles.primaryButtonTextBox}>
            <Text style={styles.primaryButtonTitle}>
              {loading ? 'Ativando proteção...' : 'Ativar Modo Proteção'}
            </Text>

            <Text style={styles.primaryButtonSubtitle}>
              {loading
                ? 'Preparando sua sessão de proteção.'
                : 'Deixe o GUARDIAM pronto para uso.'}
            </Text>
          </View>

          {!loading ? (
            <Ionicons color="#E0F2FE" name="chevron-forward" size={22} />
          ) : null}
        </Pressable>

        <Text style={styles.footerText}>
          Você poderá desativar a proteção quando quiser.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReadinessItem({
  description,
  icon,
  title,
  tone = 'blue',
}: ReadinessItemProps) {
  return (
    <View style={styles.readinessItem}>
      <View style={[styles.readinessIcon, getReadinessIconStyle(tone)]}>
        <Ionicons color={getReadinessIconColor(tone)} name={icon} size={19} />
      </View>

      <View style={styles.readinessTextBox}>
        <Text style={styles.readinessTitle}>{title}</Text>
        <Text style={styles.readinessDescription}>{description}</Text>
      </View>
    </View>
  );
}

function getReadinessIconColor(tone: ReadinessItemProps['tone']) {
  if (tone === 'green') {
    return '#10B981';
  }

  if (tone === 'red') {
    return '#DC2626';
  }

  return '#1B6EE0';
}

function getReadinessIconStyle(tone: ReadinessItemProps['tone']) {
  if (tone === 'green') {
    return styles.readinessIconGreen;
  }

  if (tone === 'red') {
    return styles.readinessIconRed;
  }

  return styles.readinessIconBlue;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#0F172A',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
    borderColor: 'rgba(125, 211, 252, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  brand: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerSpacer: {
    width: 42,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 28, 48, 0.94)',
    borderColor: 'rgba(56, 189, 248, 0.24)',
    borderRadius: 30,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 26,
    shadowColor: '#1B6EE0',
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(134, 239, 172, 0.28)',
    borderRadius: 32,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    marginBottom: 16,
    width: 72,
  },
  eyebrow: {
    color: '#1B6EE0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 310,
    textAlign: 'center',
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.66)',
    borderColor: 'rgba(134, 239, 172, 0.2)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusDot: {
    backgroundColor: '#10B981',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  statusBadgeText: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '800',
  },
  readinessCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 26,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  readinessItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  readinessIcon: {
    alignItems: 'center',
    borderRadius: 17,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  readinessIconBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  readinessIconGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  readinessIconRed: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  readinessTextBox: {
    flex: 1,
  },
  readinessTitle: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '800',
  },
  readinessDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  noteCard: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(8, 28, 48, 0.66)',
    borderColor: 'rgba(56, 189, 248, 0.16)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    padding: 14,
  },
  noteText: {
    color: '#B6C8DA',
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1B6EE0',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 17,
    shadowColor: '#1B6EE0',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
  },
  primaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    opacity: 0.72,
  },
  primaryButtonIcon: {
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  primaryButtonTextBox: {
    flex: 1,
  },
  primaryButtonTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
  },
  primaryButtonSubtitle: {
    color: '#0F3556',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 16,
    textAlign: 'center',
  },
});
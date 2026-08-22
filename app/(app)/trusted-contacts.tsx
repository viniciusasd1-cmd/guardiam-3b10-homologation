import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Mail,
  Users,
  UserPlus,
  Phone,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';

import { ApprovedHeader } from '../../src/components/layout';
import {
  ApprovedButton,
  ApprovedCard,
  ApprovedContactItem,
  ApprovedInput,
} from '../../src/components/ui';
import { createTrustedContact, listTrustedContacts } from '../../src/api/trustedContactsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { useGuardiamTheme } from '../../src/theme/GuardiamThemeProvider';
import type { TrustedContact, TrustedContactRelationship } from '../../src/types/trustedContact';

const RELATIONSHIP_LABELS: Record<TrustedContactRelationship, string> = {
  FAMILY: 'Família',
  FRIEND: 'Amigo(a)',
  COMPANY: 'Empresa',
  HOTEL: 'Hotel',
  OTHER: 'Outro',
};

export default function TrustedContactsScreen() {
  const router = useRouter();
  const { theme, resolvedMode } = useGuardiamTheme();
  const { accessToken } = useAuth();
  const isDark = resolvedMode === 'dark' || resolvedMode === 'darkNavy';
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('FRIEND');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void loadContacts();
  }, [accessToken]);

  async function loadContacts() {
    if (!accessToken) {
      setLoadingContacts(false);
      setLoadError('Sua sessão expirou. Entre novamente para acessar seus contatos.');
      return;
    }

    setLoadingContacts(true);
    setLoadError(null);

    try {
      setContacts(await listTrustedContacts(accessToken));
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoadingContacts(false);
    }
  }

  async function handleCreate() {
    if (!accessToken) {
      Alert.alert('Sessão expirada', 'Entre novamente para adicionar um contato.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      Alert.alert('Preencha os dados', 'Informe o nome e o telefone do contato.');
      return;
    }

    setLoading(true);

    try {
      await createTrustedContact(accessToken, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationship: relationship.trim().toUpperCase() as 'FRIEND',
        canReceiveAlerts: true,
      });
      setName('');
      setPhone('');
      setEmail('');
      setRelationship('FRIEND');
      await loadContacts();
    } catch (error) {
      Alert.alert('Não foi possível adicionar o contato', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ApprovedHeader
        title="Contatos de segurança"
        showBack
        onBack={() => router.back()}
        variant={isDark ? 'dark' : 'light'}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ApprovedCard variant={isDark ? 'dark' : 'default'} style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: theme.surface2 }]}>
            <Users color={theme.brand} size={28} />
          </View>
          <Text style={[styles.eyebrow, { color: theme.brand }]}>Sua rede de apoio</Text>
          <Text style={[styles.title, { color: theme.text }]}>Contatos de segurança</Text>
          <Text style={[styles.subtitle, { color: theme.text2 }]}>
            Pessoas que poderão ser avisadas quando você acionar um alerta no GUARDIAM.
          </Text>
          <View style={[styles.infoRow, { backgroundColor: theme.surface2 }]}>
            <ShieldCheck color={theme.active} size={16} />
            <Text style={[styles.infoText, { color: theme.text2 }]}>
              Essas pessoas poderão ser avisadas em caso de alerta
            </Text>
          </View>
        </ApprovedCard>

        <ApprovedCard variant={isDark ? 'dark' : 'default'} style={styles.formCard}>
          <View style={styles.sectionHeading}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.surface2 }]}>
              <UserPlus color={theme.brand} size={18} />
            </View>
            <View style={styles.sectionText}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Adicionar contato</Text>
              <Text style={[styles.sectionDescription, { color: theme.text2 }]}>
                Cadastre alguém que poderá ajudar em um alerta.
              </Text>
            </View>
          </View>

          <ApprovedInput
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Nome completo"
            leftIcon={<Users color={theme.text3} size={18} />}
          />
          <ApprovedInput
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            leftIcon={<Phone color={theme.text3} size={18} />}
          />
          <ApprovedInput
            label="E-mail opcional"
            value={email}
            onChangeText={setEmail}
            placeholder="nome@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color={theme.text3} size={18} />}
          />
          <ApprovedInput
            label="Relação"
            value={relationship}
            onChangeText={setRelationship}
            placeholder="FRIEND"
            autoCapitalize="characters"
            leftIcon={<ShieldCheck color={theme.text3} size={18} />}
          />
          <ApprovedButton
            fullWidth
            variant="primary"
            isLoading={loading}
            disabled={loading}
            leftIcon={<UserPlus color={isDark ? '#111318' : '#FFFFFF'} size={18} />}
            onPress={() => void handleCreate()}
          >
            {loading ? 'Adicionando contato...' : 'Adicionar contato'}
          </ApprovedButton>
        </ApprovedCard>

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.text }]}>Seus contatos</Text>
            {!loadingContacts && !loadError && contacts.length > 0 ? (
              <View style={[styles.countBadge, { backgroundColor: theme.surface2 }]}>
                <Text style={[styles.countText, { color: theme.brand }]}>{contacts.length}</Text>
              </View>
            ) : null}
          </View>

          {loadingContacts ? (
            <ApprovedCard variant={isDark ? 'dark' : 'default'} style={styles.stateCard}>
              <ActivityIndicator color={theme.brand} size="large" />
              <Text style={[styles.stateTitle, { color: theme.text }]}>Carregando contatos</Text>
              <Text style={[styles.stateDescription, { color: theme.text2 }]}>
                Estamos preparando sua rede de apoio.
              </Text>
            </ApprovedCard>
          ) : loadError ? (
            <ApprovedCard variant={isDark ? 'dark' : 'default'} style={styles.stateCard}>
              <RefreshCw color={theme.sos} size={28} />
              <Text style={[styles.stateTitle, { color: theme.text }]}>Não foi possível carregar</Text>
              <Text style={[styles.stateDescription, { color: theme.text2 }]}>{loadError}</Text>
              <ApprovedButton
                variant="outline"
                leftIcon={<RefreshCw color={theme.brand} size={16} />}
                onPress={() => void loadContacts()}
              >
                Tentar novamente
              </ApprovedButton>
            </ApprovedCard>
          ) : contacts.length === 0 ? (
            <ApprovedCard variant={isDark ? 'dark' : 'default'} style={styles.stateCard}>
              <Users color={theme.brand} size={28} />
              <Text style={[styles.stateTitle, { color: theme.text }]}>
                Nenhum contato cadastrado
              </Text>
              <Text style={[styles.stateDescription, { color: theme.text2 }]}>
                Adicione uma pessoa para começar sua rede de segurança.
              </Text>
            </ApprovedCard>
          ) : (
            <ApprovedCard variant={isDark ? 'dark' : 'default'} style={styles.contactsCard}>
              {contacts.map((contact) => (
                <ApprovedContactItem
                  key={contact.id}
                  contact={{
                    id: contact.id,
                    name: contact.name,
                    phone: contact.phone,
                    status: contact.status.toLowerCase() === 'pending' ? 'pending' : 'active',
                  }}
                />
              ))}
            </ApprovedCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 110 },
  heroCard: { alignItems: 'center', padding: 22 },
  heroIcon: { alignItems: 'center', borderRadius: 28, justifyContent: 'center', height: 56, width: 56 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginTop: 14, textTransform: 'uppercase' },
  title: { fontSize: 26, fontWeight: '900', marginTop: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 320, textAlign: 'center' },
  infoRow: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 8, marginTop: 18, padding: 11 },
  infoText: { flexShrink: 1, fontSize: 12, fontWeight: '700', lineHeight: 17, textAlign: 'center' },
  formCard: { gap: 14, padding: 17 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: 11, marginBottom: 2 },
  sectionIcon: { alignItems: 'center', borderRadius: 15, height: 36, justifyContent: 'center', width: 36 },
  sectionText: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  sectionDescription: { fontSize: 12, marginTop: 2 },
  listSection: { gap: 12 },
  listHeader: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  listTitle: { fontSize: 18, fontWeight: '900' },
  countBadge: { alignItems: 'center', borderRadius: 999, justifyContent: 'center', minHeight: 24, minWidth: 24, paddingHorizontal: 7 },
  countText: { fontSize: 12, fontWeight: '900' },
  stateCard: { alignItems: 'center', gap: 10, padding: 24 },
  stateTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  stateDescription: { fontSize: 13, lineHeight: 19, maxWidth: 280, textAlign: 'center' },
  contactsCard: { paddingHorizontal: 12, paddingVertical: 4 },
});

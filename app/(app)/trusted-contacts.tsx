import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createTrustedContact,
  listTrustedContacts,
} from '../../src/api/trustedContactsApi';
import { useAuth } from '../../src/auth/AuthContext';
import type {
  TrustedContact,
  TrustedContactRelationship,
} from '../../src/types/trustedContact';

type IconName = ComponentProps<typeof Ionicons>['name'];

type ContactInputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon: IconName;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

const RELATIONSHIP_LABELS: Record<TrustedContactRelationship, string> = {
  FAMILY: 'Família',
  FRIEND: 'Amigo(a)',
  COMPANY: 'Empresa',
  HOTEL: 'Hotel',
  OTHER: 'Outro',
};

export default function TrustedContactsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('FRIEND');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#E7F3FF" name="chevron-back" size={22} />
          </Pressable>

          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons color="#7DD3FC" name="shield-checkmark-outline" size={20} />
            </View>
            <Text style={styles.brand}>GUARDIAM</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons color="#7DD3FC" name="people-outline" size={34} />
          </View>
          <Text style={styles.eyebrow}>Sua rede de apoio</Text>
          <Text style={styles.title}>Contatos de segurança</Text>
          <Text style={styles.subtitle}>
            Pessoas que poderão ser avisadas quando você acionar um alerta no GUARDIAM.
          </Text>

          <View style={styles.infoBadge}>
            <Ionicons color="#86EFAC" name="shield-checkmark-outline" size={16} />
            <Text style={styles.infoBadgeText}>
              Essas pessoas poderão ser avisadas em caso de alerta
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <Ionicons color="#7DD3FC" name="person-add-outline" size={18} />
            </View>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionTitle}>Adicionar contato</Text>
              <Text style={styles.sectionDescription}>
                Cadastre alguém que poderá ajudar em um alerta.
              </Text>
            </View>
          </View>

          <ContactInput
            icon="person-outline"
            label="Nome"
            onChangeText={setName}
            placeholder="Nome completo"
            value={name}
          />
          <ContactInput
            icon="call-outline"
            keyboardType="phone-pad"
            label="Telefone"
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            value={phone}
          />
          <ContactInput
            autoCapitalize="none"
            icon="mail-outline"
            keyboardType="email-address"
            label="E-mail opcional"
            onChangeText={setEmail}
            placeholder="nome@exemplo.com"
            value={email}
          />
          <ContactInput
            autoCapitalize="characters"
            icon="heart-outline"
            label="Relação"
            onChangeText={setRelationship}
            placeholder="FRIEND"
            value={relationship}
          />

          <Pressable
            accessibilityLabel="Adicionar contato"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
            disabled={loading}
            onPress={handleCreate}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !loading ? styles.primaryButtonPressed : null,
              loading ? styles.primaryButtonDisabled : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#04111F" size="small" />
            ) : (
              <Ionicons color="#04111F" name="person-add-outline" size={21} />
            )}
            <Text style={styles.primaryButtonText}>
              {loading ? 'Adicionando contato...' : 'Adicionar contato'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Seus contatos</Text>
            {!loadingContacts && !loadError && contacts.length > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{contacts.length}</Text>
              </View>
            ) : null}
          </View>

          {loadingContacts ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color="#38BDF8" size="large" />
              <Text style={styles.stateTitle}>Carregando contatos</Text>
              <Text style={styles.stateDescription}>Estamos preparando sua rede de apoio.</Text>
            </View>
          ) : loadError ? (
            <View style={styles.stateCard}>
              <View style={[styles.stateIcon, styles.errorIcon]}>
                <Ionicons color="#FDA4AF" name="cloud-offline-outline" size={26} />
              </View>
              <Text style={styles.stateTitle}>Não foi possível carregar</Text>
              <Text style={styles.stateDescription}>{loadError}</Text>
              <Pressable
                accessibilityLabel="Tentar novamente"
                accessibilityRole="button"
                onPress={loadContacts}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons color="#7DD3FC" name="refresh-outline" size={18} />
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.stateCard}>
              <View style={styles.stateIcon}>
                <Ionicons color="#7DD3FC" name="people-outline" size={28} />
              </View>
              <Text style={styles.stateTitle}>Nenhum contato cadastrado</Text>
              <Text style={styles.stateDescription}>
                Adicione uma pessoa para começar sua rede de segurança.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {contacts.map((contact) => (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>
                      {contact.name.trim().charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>

                  <View style={styles.contactContent}>
                    <Text numberOfLines={1} style={styles.contactName}>
                      {contact.name}
                    </Text>
                    <View style={styles.relationshipRow}>
                      <Ionicons color="#7DD3FC" name="heart-outline" size={14} />
                      <Text style={styles.relationshipText}>
                        {RELATIONSHIP_LABELS[contact.relationship]}
                      </Text>
                    </View>
                    <View style={styles.contactMetaRow}>
                      <Ionicons color="#94A3B8" name="call-outline" size={14} />
                      <Text style={styles.contactMeta}>{contact.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.readyIcon}>
                    <Ionicons color="#86EFAC" name="checkmark" size={17} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactInput({
  autoCapitalize,
  icon,
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  value,
}: ContactInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons color="#64748B" name={icon} size={18} />
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente em instantes.';
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#04111F',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
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
    color: '#E7F3FF',
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
    paddingVertical: 24,
    shadowColor: '#0EA5E9',
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(125, 211, 252, 0.25)',
    borderRadius: 28,
    borderWidth: 1,
    height: 62,
    justifyContent: 'center',
    marginBottom: 14,
    width: 62,
  },
  eyebrow: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 320,
    textAlign: 'center',
  },
  infoBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(134, 239, 172, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  infoBadgeText: {
    color: '#D1FAE5',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.84)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 26,
    borderWidth: 1,
    gap: 14,
    marginBottom: 22,
    padding: 17,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    marginBottom: 2,
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 15,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sectionHeadingText: {
    flex: 1,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
  },
  sectionDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  inputGroup: {
    gap: 7,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(4, 17, 31, 0.72)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  input: {
    color: '#F8FAFC',
    flex: 1,
    fontSize: 15,
    minHeight: 50,
    paddingVertical: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 3,
    minHeight: 54,
    paddingHorizontal: 18,
    shadowColor: '#38BDF8',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  primaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#04111F',
    fontSize: 16,
    fontWeight: '900',
  },
  listSection: {
    gap: 12,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  listTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 24,
    minWidth: 24,
    paddingHorizontal: 7,
  },
  countBadgeText: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '900',
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(8, 28, 48, 0.74)',
    borderColor: 'rgba(56, 189, 248, 0.16)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 9,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  stateIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 24,
    height: 52,
    justifyContent: 'center',
    marginBottom: 3,
    width: 52,
  },
  errorIcon: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  stateTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 280,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(125, 211, 252, 0.24)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: '#7DD3FC',
    fontSize: 14,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  contactCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.84)',
    borderColor: 'rgba(148, 163, 184, 0.14)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    padding: 15,
  },
  contactAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.13)',
    borderColor: 'rgba(125, 211, 252, 0.22)',
    borderRadius: 20,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  contactInitial: {
    color: '#7DD3FC',
    fontSize: 18,
    fontWeight: '900',
  },
  contactContent: {
    flex: 1,
  },
  contactName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  relationshipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 4,
  },
  relationshipText: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '700',
  },
  contactMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  contactMeta: {
    color: '#94A3B8',
    flexShrink: 1,
    fontSize: 13,
  },
  readyIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
});

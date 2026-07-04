import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  createTrustedContact,
  listTrustedContacts,
} from '../../src/api/trustedContactsApi';
import { useAuth } from '../../src/auth/AuthContext';
import { AppButton } from '../../src/components/AppButton';
import { AppInput } from '../../src/components/AppInput';
import { Screen } from '../../src/components/Screen';
import { StatusPill } from '../../src/components/StatusPill';
import { colors } from '../../src/constants/colors';
import { TrustedContact } from '../../src/types/trustedContact';

export default function TrustedContactsScreen() {
  const { accessToken } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('FRIEND');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    if (!accessToken) {
      return;
    }

    try {
      setContacts(await listTrustedContacts(accessToken));
    } catch (error) {
      Alert.alert('Falha ao carregar contatos', getErrorMessage(error));
    }
  }

  async function handleCreate() {
    if (!accessToken) {
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
      await loadContacts();
    } catch (error) {
      Alert.alert('Falha ao criar contato', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Contatos de confianÃ§a</Text>
        <Text style={styles.subtitle}>
          Pessoas que podem receber notificaÃ§Ãµes internas quando um alerta de segurança for acionado.
        </Text>
      </View>

      <View style={styles.form}>
        <AppInput label="Nome" onChangeText={setName} value={name} />
        <AppInput keyboardType="phone-pad" label="Telefone" onChangeText={setPhone} value={phone} />
        <AppInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="E-mail opcional"
          onChangeText={setEmail}
          value={email}
        />
        <AppInput
          autoCapitalize="characters"
          label="Relacionamento"
          onChangeText={setRelationship}
          value={relationship}
        />
        <AppButton loading={loading} onPress={handleCreate} title="Adicionar contato" />
      </View>

      <View style={styles.list}>
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <StatusPill label={contact.status} tone="neutral" />
            </View>
            <Text style={styles.contactMeta}>{contact.phone}</Text>
            {contact.email ? <Text style={styles.contactMeta}>{contact.email}</Text> : null}
          </View>
        ))}
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
  list: {
    gap: 10,
  },
  contactCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    gap: 6,
    padding: 16,
  },
  contactHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  contactMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
});


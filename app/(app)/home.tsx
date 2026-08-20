import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createSafeTrip, getActiveTrip, startTrip } from '../../src/api/safeTripsApi';
import { useAuth } from '../../src/auth/AuthContext';

type IconName = ComponentProps<typeof Ionicons>['name'];
type QuickActionAccent = 'blue' | 'green' | 'red';
type QuickActionCardProps = { accent?: QuickActionAccent; helper: string; icon: IconName; onPress: () => void; title: string; value: string };

export default function HomeScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [activating, setActivating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleOpenNotifications() { Alert.alert('Notificações', 'Notificações reais entrarão em uma fase própria do GUARDIAM.'); }
  async function handleActivateProtection() {
    if (activating) return;
    if (!accessToken) { Alert.alert('Sessão expirada', 'Faça login novamente para ativar o Modo Proteção.'); return; }
    setActivating(true);
    let createdSafeTripId: string | null = null;
    try {
      const existingSafeTrip = await getActiveTrip(accessToken);
      if (existingSafeTrip) { router.replace({ pathname: '/(app)/active-trip', params: { safeTripId: existingSafeTrip.id } }); return; }
      const safeTrip = await createSafeTrip(accessToken, { tripType: 'RIDE_APP' });
      createdSafeTripId = safeTrip.id;
      const startedSafeTrip = await startTrip(accessToken, safeTrip.id);
      if (startedSafeTrip.status !== 'ACTIVE') throw new Error('A proteção não retornou como ativa.');
      router.replace({ pathname: '/(app)/active-trip', params: { safeTripId: startedSafeTrip.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tente novamente em instantes.';
      if (createdSafeTripId) Alert.alert('Não foi possível ativar a proteção', message, [{ text: 'Agora não', style: 'cancel' }, { text: 'Tentar novamente', onPress: () => router.replace({ pathname: '/(app)/active-trip', params: { safeTripId: createdSafeTripId as string } }) }]);
      else Alert.alert('Não foi possível ativar a proteção', message);
    } finally { setActivating(false); }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brandRow}><View style={styles.logoMark}><Ionicons color="#6EE7D8" name="shield-checkmark" size={22} /></View><View><Text style={styles.brand}>GUARDIAM</Text><Text style={styles.headerMeta}>CENTRAL DE PROTEÇÃO</Text></View></View>
            <View style={styles.headerActions}>
              <Pressable accessibilityLabel="Notificações" accessibilityRole="button" onPress={handleOpenNotifications} style={styles.iconButton}><Ionicons color="#F2FAFF" name="notifications-outline" size={20} /></Pressable>
              <Pressable accessibilityLabel={menuOpen ? 'Fechar menu' : 'Abrir menu'} accessibilityRole="button" onPress={() => setMenuOpen((open) => !open)} style={[styles.iconButton, menuOpen && styles.iconButtonActive]}><Ionicons color="#F2FAFF" name={menuOpen ? 'close' : 'menu'} size={23} /></Pressable>
            </View>
          </View>

          {menuOpen ? <View style={styles.menuPanel}>
            <Text style={styles.menuLabel}>ACESSO RÁPIDO</Text>
            <MenuItem icon="shield-checkmark-outline" label="Modo Proteção" onPress={() => { setMenuOpen(false); router.push('/(app)/active-trip'); }} />
            <MenuItem icon="people-outline" label="Contatos confiáveis" onPress={() => { setMenuOpen(false); router.push('/(app)/trusted-contacts'); }} />
            <MenuItem icon="add-circle-outline" label="Criar proteção" onPress={() => { setMenuOpen(false); router.push('/(app)/create-trip'); }} />
            <MenuItem icon="notifications-outline" label="Alertas / Histórico" onPress={() => { setMenuOpen(false); router.push('/(app)/alerts'); }} />
            <MenuItem icon="settings-outline" label="Configurações" onPress={() => { setMenuOpen(false); router.push('/(app)/settings'); }} />
          </View> : null}

          <View style={styles.welcome}><Text style={styles.eyebrow}>BEM-VINDO AO GUARDIAM</Text><Text style={styles.greeting}>Olá, usuário</Text><Text style={styles.welcomeCopy}>Sua proteção está pronta quando você precisar.</Text></View>

          <View style={styles.statusCard}>
            <View style={styles.cardTop}><View style={styles.statusIcon}><Ionicons color="#6EE7D8" name="shield-checkmark" size={28} /></View><View style={styles.statusCopy}><Text style={styles.cardEyebrow}>STATUS DA PROTEÇÃO</Text><Text style={styles.statusTitle}>Proteção desativada</Text><Text style={styles.statusDescription}>Você ainda não está protegido.`r`nAtive para compartilhar sua localização.</Text></View><View style={styles.offPill}><View style={styles.offDot} /><Text style={styles.offText}>OFF</Text></View></View>
            <View style={styles.statusFooter}><Ionicons color="#FCD34D" name="information-circle-outline" size={17} /><Text style={styles.statusFooterText}>Ative para compartilhar sua localização em tempo real.</Text></View>
          </View>

          <Pressable accessibilityLabel="Ativar proteção" accessibilityRole="button" accessibilityState={{ disabled: activating }} disabled={activating} onPress={() => void handleActivateProtection()} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}><View style={styles.primaryIcon}><Ionicons color="#06202D" name="power" size={24} /></View><View style={styles.primaryCopy}><Text style={styles.primaryTitle}>{activating ? 'Ativando proteção...' : 'Ativar proteção'}</Text><Text style={styles.primarySubtitle}>Ative para começar a usar o GUARDIAM.</Text></View><Ionicons color="#06202D" name="arrow-forward" size={22} /></Pressable>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Acesso rápido</Text><Text style={styles.sectionHint}>GUARDIAM</Text></View>
          <View style={styles.quickGrid}><QuickActionCard accent="blue" helper="Segurança" icon="people-outline" onPress={() => router.push('/(app)/trusted-contacts')} title="Contatos" value="2 prontos" /><QuickActionCard accent="green" helper="Sinal" icon="location-outline" onPress={() => router.push('/(app)/active-trip')} title="Localização" value="Pronta" /><QuickActionCard accent="red" helper="Registro" icon="alert-circle-outline" onPress={() => router.push('/(app)/active-trip')} title="Alertas" value="Histórico" /></View>

          <Pressable accessibilityLabel="Ver proteção" accessibilityRole="button" onPress={() => router.push('/(app)/active-trip')} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}><View style={styles.secondaryIcon}><Ionicons color="#6EE7D8" name="radio-outline" size={19} /></View><View style={styles.secondaryCopy}><Text style={styles.secondaryTitle}>Ver proteção</Text><Text style={styles.secondaryDescription}>Acompanhe sua proteção e localização.</Text></View><Ionicons color="#8EA8B8" name="chevron-forward" size={19} /></Pressable>
          <View style={styles.footerNote}><Ionicons color="#6EE7D8" name="lock-closed-outline" size={15} /><Text style={styles.footerText}>Proteção simples, discreta e sempre pronta.</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}><Ionicons color="#6EE7D8" name={icon} size={20} /><Text style={styles.menuItemText}>{label}</Text><Ionicons color="#7593A4" name="chevron-forward" size={17} /></Pressable>; }
function QuickActionCard({ accent = 'blue', helper, icon, onPress, title, value }: QuickActionCardProps) { return <Pressable accessibilityLabel={`${title}: ${value}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><View style={[styles.quickIcon, getIconStyle(accent)]}><Ionicons color={getIconColor(accent)} name={icon} size={18} /></View><Text numberOfLines={1} style={styles.quickTitle}>{title}</Text><Text numberOfLines={1} style={styles.quickValue}>{value}</Text><Text numberOfLines={1} style={styles.quickHelper}>{helper}</Text></Pressable>; }
function getIconColor(accent: QuickActionAccent) { return accent === 'green' ? '#86EFAC' : accent === 'red' ? '#FDA4AF' : '#7DD3FC'; }
function getIconStyle(accent: QuickActionAccent) { return accent === 'green' ? styles.quickGreen : accent === 'red' ? styles.quickRed : styles.quickBlue; }

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F4F7FC', flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  container: { gap: 16, paddingHorizontal: 24, paddingTop: 8 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', height: 64 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  logoMark: { alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, height: 48, justifyContent: 'center', width: 48 },
  brand: { color: '#0F172A', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  headerMeta: { color: '#475569', fontSize: 10, fontWeight: '600', letterSpacing: 0.8, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 20, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  iconButtonActive: { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
  menuPanel: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 16, borderWidth: 1, gap: 4, padding: 12 },
  menuLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 2, paddingHorizontal: 8 },
  menuItem: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 12, paddingHorizontal: 8, paddingVertical: 12 },
  menuItemText: { color: '#475569', flex: 1, fontSize: 14, fontWeight: '600' },
  welcome: { gap: 6, paddingTop: 16 },
  eyebrow: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
  greeting: { color: '#0F172A', fontSize: 28, fontWeight: '800' },
  welcomeCopy: { color: '#475569', fontSize: 15, lineHeight: 22 },
  statusCard: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 24, borderWidth: 1, padding: 24 },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  statusIcon: { alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 40, height: 64, justifyContent: 'center', width: 64 },
  statusCopy: { flex: 1 },
  cardEyebrow: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  statusTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  statusDescription: { color: '#475569', fontSize: 13, marginTop: 4 },
  offPill: { alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 999, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  offDot: { backgroundColor: '#F59E0B', borderRadius: 4, height: 7, width: 7 },
  offText: { color: '#F59E0B', fontSize: 10, fontWeight: '800' },
  statusFooter: { alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 13, flexDirection: 'row', gap: 7, marginTop: 18, paddingHorizontal: 11, paddingVertical: 10 },
  statusFooterText: { color: '#475569', flex: 1, fontSize: 12, lineHeight: 17 },
  primaryAction: { alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  primaryIcon: { alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  primaryCopy: { flex: 1 },
  primaryTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  primarySubtitle: { color: '#CBD5E1', fontSize: 12, fontWeight: '500', marginTop: 3 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  sectionHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  sectionHint: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  quickGrid: { flexDirection: 'row', gap: 8 },
  quickAction: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 16, borderWidth: 1, flex: 1, minHeight: 119, padding: 12 },
  quickIcon: { alignItems: 'center', borderRadius: 12, height: 32, justifyContent: 'center', marginBottom: 9, width: 32 },
  quickBlue: { backgroundColor: '#E8EEF8' }, quickGreen: { backgroundColor: '#E6F7F0' }, quickRed: { backgroundColor: '#FDECEC' },
  quickTitle: { color: '#475569', fontSize: 12, fontWeight: '700', marginBottom: 4 }, quickValue: { color: '#0F172A', fontSize: 14, fontWeight: '800', marginBottom: 2 }, quickHelper: { color: '#94A3B8', fontSize: 11 },
  secondaryAction: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 11, paddingHorizontal: 13, paddingVertical: 13 },
  secondaryIcon: { alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 13, height: 32, justifyContent: 'center', width: 32 }, secondaryCopy: { flex: 1 }, secondaryTitle: { color: '#0F172A', fontSize: 14, fontWeight: '800' }, secondaryDescription: { color: '#475569', fontSize: 12, marginTop: 2 },
  footerNote: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center', paddingHorizontal: 8, paddingTop: 2 }, footerText: { color: '#94A3B8', flexShrink: 1, fontSize: 12, lineHeight: 17, textAlign: 'center' },
});
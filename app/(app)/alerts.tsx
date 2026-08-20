import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Clock, ShieldAlert } from 'lucide-react-native';
import { Pressable } from 'react-native';

const theme = { bg: '#F4F7FC', surface: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', text2: '#475569', text3: '#94A3B8', sos: '#EF4444' };

export default function AlertsScreen() {
  return <View style={styles.page}><View style={styles.header}><Pressable accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.headerButton}><ChevronLeft color={theme.text} size={24} /></Pressable><Text style={styles.headerTitle}>Alertas</Text><View style={styles.headerSpacer} /></View><ScrollView contentContainerStyle={styles.content}><View style={styles.timeline}><View style={styles.emptyIcon}><Clock color={theme.text3} size={28} /></View><Text style={styles.emptyTitle}>Nenhum alerta registrado</Text><Text style={styles.emptyCopy}>Os alertas reais do GUARDIAM aparecerão aqui quando houver um registro.</Text></View></ScrollView></View>;
}

const styles = StyleSheet.create({ page: { backgroundColor: theme.bg, flex: 1 }, header: { alignItems: 'center', backgroundColor: theme.bg, flexDirection: 'row', height: 64, justifyContent: 'space-between', paddingHorizontal: 16 }, headerButton: { padding: 8 }, headerSpacer: { width: 40 }, headerTitle: { color: theme.text, fontSize: 18, fontWeight: '700' }, content: { padding: 24 }, timeline: { alignItems: 'center', borderLeftColor: theme.border, borderLeftWidth: 2, minHeight: 220, paddingHorizontal: 24, paddingTop: 24 }, emptyIcon: { alignItems: 'center', backgroundColor: theme.surface, borderColor: theme.border, borderRadius: 32, borderWidth: 1, height: 64, justifyContent: 'center', marginBottom: 16, width: 64 }, emptyTitle: { color: theme.text, fontSize: 17, fontWeight: '700', marginBottom: 8, textAlign: 'center' }, emptyCopy: { color: theme.text2, fontSize: 14, lineHeight: 21, textAlign: 'center' } });

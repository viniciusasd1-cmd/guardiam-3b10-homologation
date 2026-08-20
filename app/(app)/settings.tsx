import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronLeft, ChevronRight, Lock, Moon, ShieldCheck, Sun, User } from 'lucide-react-native';
import { Pressable } from 'react-native';

const theme = {
  bg: '#F4F7FC',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#0F172A',
  text2: '#475569',
  text3: '#94A3B8',
  active: '#10B981',
  danger: '#DC2626',
};

export default function SettingsScreen() {
  return (
    <View style={styles.page}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel>Aparência</SectionLabel>
        <View style={styles.card}>
          <SettingRow icon={<Sun color={theme.text2} size={18} />} title="Modo Escuro" description="Altera o tema de todo o aplicativo." trailing={<SwitchVisual active={false} />} />
        </View>

        <SectionLabel>Botão de Proteção Discreto</SectionLabel>
        <View style={styles.card}>
          <SettingRow icon={<ShieldCheck color={theme.text2} size={18} />} title="Ativar botão flutuante" description="Visível apenas com proteção ativa." trailing={<SwitchVisual active={false} />} />
          <View style={styles.divider} />
          <View style={styles.innerBlock}>
            <Text style={styles.optionTitle}>Aparência do botão</Text>
            <View style={styles.iconOptions}>
              <View style={[styles.iconOption, styles.iconOptionSelected]}><ShieldCheck color={theme.surface} size={18} /></View>
              <View style={styles.iconOption}><User color={theme.text2} size={18} /></View>
              <View style={styles.iconOption}><Bell color={theme.text2} size={18} /></View>
            </View>
          </View>
        </View>

        <SectionLabel>Geral</SectionLabel>
        <View style={styles.card}>
          <SettingsItem icon={<User color={theme.text2} size={18} />} label="Perfil" />
          <SettingsItem icon={<Lock color={theme.text2} size={18} />} label="Permissões" />
          <SettingsItem icon={<Bell color={theme.text2} size={18} />} label="Notificações" />
          <SettingsItem icon={<ShieldCheck color={theme.text2} size={18} />} label="Privacidade" last />
        </View>

        <Text style={styles.note}>Estas opções visuais ainda não possuem fluxo funcional no GUARDIAM.</Text>
      </ScrollView>
    </View>
  );
}

function Header() {
  return <View style={styles.header}><Pressable accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.headerButton}><ChevronLeft color={theme.text} size={24} /></Pressable><Text style={styles.headerTitle}>Configurações</Text><View style={styles.headerSpacer} /></View>;
}

function SectionLabel({ children }: { children: string }) { return <Text style={styles.sectionLabel}>{children}</Text>; }

function SwitchVisual({ active }: { active: boolean }) { return <View style={[styles.switch, active && styles.switchActive]}><View style={[styles.switchKnob, active && styles.switchKnobActive]} /></View>; }

function SettingRow({ icon, title, description, trailing }: { icon: React.ReactNode; title: string; description: string; trailing: React.ReactNode }) {
  return <View style={styles.settingRow}><View style={styles.settingCopy}><View style={styles.iconWrap}>{icon}</View><View style={styles.flex}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View></View>{trailing}</View>;
}

function SettingsItem({ icon, label, last = false }: { icon: React.ReactNode; label: string; last?: boolean }) {
  return <View style={[styles.item, !last && styles.itemBorder]}><View style={styles.settingCopy}><View style={styles.iconWrap}>{icon}</View><Text style={styles.itemLabel}>{label}</Text></View><ChevronRight color={theme.text3} size={18} /></View>;
}

const styles = StyleSheet.create({
  page: { backgroundColor: theme.bg, flex: 1 },
  header: { alignItems: 'center', backgroundColor: theme.bg, flexDirection: 'row', height: 64, justifyContent: 'space-between', paddingHorizontal: 16 },
  headerButton: { padding: 8 }, headerSpacer: { width: 40 }, headerTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
  content: { padding: 24, paddingBottom: 48 }, sectionLabel: { color: theme.text3, fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
  card: { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  settingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 16 }, settingCopy: { alignItems: 'center', flexDirection: 'row', flex: 1 }, iconWrap: { marginRight: 12 }, flex: { flex: 1 }, settingTitle: { color: theme.text, fontSize: 15, fontWeight: '500' }, description: { color: theme.text2, fontSize: 12, marginTop: 2 },
  switch: { backgroundColor: theme.borderStrong, borderRadius: 12, height: 24, justifyContent: 'center', paddingHorizontal: 4, width: 48 }, switchActive: { backgroundColor: theme.active }, switchKnob: { backgroundColor: theme.surface, borderRadius: 8, height: 16, width: 16 }, switchKnobActive: { transform: [{ translateX: 24 }] }, divider: { backgroundColor: theme.border, height: 1 }, innerBlock: { padding: 16 }, optionTitle: { color: theme.text, fontSize: 14, fontWeight: '500', marginBottom: 12 }, iconOptions: { flexDirection: 'row', gap: 12 }, iconOption: { alignItems: 'center', backgroundColor: theme.bg, borderColor: theme.border, borderRadius: 20, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 }, iconOptionSelected: { backgroundColor: theme.text },
  item: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', padding: 16 }, itemBorder: { borderBottomColor: theme.border, borderBottomWidth: 1 }, itemLabel: { color: theme.text, fontSize: 15, fontWeight: '500' }, note: { color: theme.text3, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});

import { CheckCircle2, Clock, Share2 } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { ApprovedAvatar } from './ApprovedAvatar';

export interface ApprovedContact {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  status?: 'active' | 'pending';
  allowEvidenceAccess?: boolean;
  notifyOnActivate?: boolean;
  notifyOnSos?: boolean;
}

export interface ApprovedContactItemProps {
  contact: ApprovedContact;
  onEdit?: (contact: ApprovedContact) => void;
  onRemove?: (contact: ApprovedContact) => void;
  onResendInvite?: (contact: ApprovedContact) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ApprovedContactItem: React.FC<ApprovedContactItemProps> = ({
  contact,
  onEdit,
  onRemove,
  onResendInvite,
  style,
  testID,
}) => {
  const isPending = contact.status === 'pending';

  return (
    <View
      style={[styles.container, style]}
      testID={testID || `contact-item-${contact.id}`}
    >
      <View style={styles.leftRow}>
        <ApprovedAvatar name={contact.name} src={contact.avatarUrl} size="md" />
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.nameText}>
              {contact.name}
            </Text>
            {isPending ? (
              <View style={styles.pendingBadge}>
                <Clock size={10} color="#B45309" />
                <Text style={styles.pendingBadgeText}>Pendente</Text>
              </View>
            ) : (
              <View style={styles.activeBadge}>
                <CheckCircle2 size={10} color="#047857" />
                <Text style={styles.activeBadgeText}>Guardião</Text>
              </View>
            )}
          </View>
          <Text style={styles.phoneText}>{contact.phone}</Text>
        </View>
      </View>

      <View style={styles.actionsCol}>
        {isPending ? (
          <Pressable
            accessibilityLabel="Reenviar convite"
            accessibilityRole="button"
            onPress={() => onResendInvite?.(contact)}
            style={styles.actionButton}
          >
            <Share2 size={12} color="#0284C7" />
            <Text style={styles.resendText}>Reenviar</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Editar contato"
            accessibilityRole="button"
            onPress={() => onEdit?.(contact)}
            style={styles.actionButton}
          >
            <Text style={styles.editText}>Editar</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityLabel="Remover contato"
          accessibilityRole="button"
          onPress={() => onRemove?.(contact)}
          style={styles.actionButton}
        >
          <Text style={styles.removeText}>Remover</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 14,
    width: '100%',
  },
  leftRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginRight: 10,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  nameText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  phoneText: {
    color: '#64748B',
    fontSize: 12,
  },
  activeBadge: {
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  activeBadgeText: {
    color: '#047857',
    fontSize: 9,
    fontWeight: '700',
  },
  pendingBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  pendingBadgeText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '700',
  },
  actionsCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 2,
  },
  editText: {
    color: '#1565C0',
    fontSize: 12,
    fontWeight: '700',
  },
  resendText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  removeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
});

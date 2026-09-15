import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Users, Search, Shield, UserX, Edit } from 'lucide-react-native';
import { userService } from '@/services/userService';
import type { User, UserRole } from '@/types';
import Colors from '@/constants/colors';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  kycStatus?: string;
}

function toRow(user: User): AdminUserRow {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim() || user.email,
    email: user.email,
    role: user.role,
    status: user.isActive ? 'active' : 'inactive',
    kycStatus: user.role === 'guard' ? user.kycStatus : undefined,
  };
}

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'client' | 'guard' | 'company'>('all');
  const [allUsers, setAllUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clients, guards, companies] = await Promise.all([
        userService.listByRole('client'),
        userService.listByRole('guard'),
        userService.listByRole('company'),
      ]);
      setAllUsers([...clients, ...guards, ...companies].map(toRow));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (userId: string, userName: string) => {
    Alert.alert(
      'Edit User',
      `Edit details for ${userName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => {
            Alert.alert('Info', 'User editing interface would open here');
          },
        },
      ]
    );
  };

  const handleSuspendUser = (userId: string, userName: string, isActive: boolean) => {
    const verb = isActive ? 'suspend' : 'reactivate';
    Alert.alert(
      isActive ? 'Suspend User' : 'Reactivate User',
      isActive
        ? `Are you sure you want to suspend ${userName}? They will not be able to access the platform.`
        : `Reactivate ${userName}'s access to the platform?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isActive ? 'Suspend' : 'Reactivate',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await userService.setUserActive(userId, !isActive);
              await loadUsers();
              Alert.alert('Success', `${userName} has been ${isActive ? 'suspended' : 'reactivated'}.`);
            } catch (error) {
              console.error(`[AdminUsers] Failed to ${verb} user:`, error);
              Alert.alert('Error', `Failed to ${verb} ${userName}.`);
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'guard':
        return Colors.gold;
      case 'client':
        return Colors.info;
      case 'company':
        return Colors.success;
      case 'admin':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('all')}
          >
            <Text style={[styles.filterText, selectedRole === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'client' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('client')}
          >
            <Text style={[styles.filterText, selectedRole === 'client' && styles.filterTextActive]}>
              Clients
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'guard' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('guard')}
          >
            <Text style={[styles.filterText, selectedRole === 'guard' && styles.filterTextActive]}>
              Guards
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedRole === 'company' && styles.filterButtonActive]}
            onPress={() => setSelectedRole('company')}
          >
            <Text style={[styles.filterText, selectedRole === 'company' && styles.filterTextActive]}>
              Companies
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.gold} />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {allUsers.length === 0
                ? 'No real accounts exist yet besides your own.'
                : 'Try adjusting your search or filters'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.badges}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                    <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(user.role) }]}>
                      {user.role.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: user.status === 'active' ? Colors.success + '20' : Colors.textTertiary + '20' }]}>
                    <Text style={[styles.statusText, { color: user.status === 'active' ? Colors.success : Colors.textTertiary }]}>
                      {user.status}
                    </Text>
                  </View>
                </View>
              </View>

              {user.role === 'guard' && user.kycStatus && (
                <View style={styles.kycInfo}>
                  <Shield size={14} color={user.kycStatus === 'approved' ? Colors.success : Colors.warning} />
                  <Text style={[styles.kycText, { color: user.kycStatus === 'approved' ? Colors.success : Colors.warning }]}>
                    KYC: {user.kycStatus}
                  </Text>
                </View>
              )}

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditUser(user.id, user.name)}
                >
                  <Edit size={16} color={Colors.textPrimary} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.suspendButton}
                  onPress={() => handleSuspendUser(user.id, user.name, user.status === 'active')}
                >
                  <UserX size={16} color={Colors.error} />
                  <Text style={styles.suspendButtonText}>
                    {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filters: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badges: {
    gap: 8,
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'capitalize' as const,
  },
  kycInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  kycText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  suspendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error + '20',
    paddingVertical: 10,
    borderRadius: 12,
  },
  suspendButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});

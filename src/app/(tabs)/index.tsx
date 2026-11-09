import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Plus,
  UserCheck,
} from 'lucide-react-native';
import { usePrestago } from '@/context/PrestagoContext';
import { Cliente } from '@/types';
import { Colors, BrandColors, BorderRadius, Shadows, MaxContentWidth } from '@/constants/theme';
import { HeaderBar } from '@/components/HeaderBar';
import { ClienteCard } from '@/components/ClienteCard';
import { ClienteModalDetail } from '@/components/ClienteModalDetail';

export default function ClientesScreen() {
  const {
    clientes,
    isDarkMode,
    toggleTheme,
    metricas,
    registrarPago,
    getHistorialByCliente,
    actualizarCliente,
    eliminarCliente,
  } = usePrestago();

  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filtrado reactivo en tiempo real
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const matchSearch =
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.documento.includes(searchQuery) ||
        c.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filtroEstado === 'todos') return true;
      if (filtroEstado === 'al_dia') return c.estadoMora === 'al_dia';
      if (filtroEstado === 'mora_1') return c.estadoMora === 'mora_1';
      if (filtroEstado === 'mora_2') return c.estadoMora === 'mora_2';
      if (filtroEstado === 'mora_3') return c.estadoMora === 'mora_3';
      if (filtroEstado === 'paz_y_salvo') return c.estadoMora === 'paz_y_salvo';
      return true;
    });
  }, [clientes, searchQuery, filtroEstado]);

  const handleOpenDetail = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalVisible(true);
  };

  const historialClienteActual = selectedCliente
    ? getHistorialByCliente(selectedCliente.id)
    : [];

  const handleRenovarDesdeModal = () => {
    setModalVisible(false);
    if (selectedCliente) {
      router.push({
        pathname: '/new-client',
        params: { renovarClienteId: selectedCliente.id },
      });
    }
  };

  const FILTROS = [
    { id: 'todos', label: 'Todos', count: clientes.length, color: BrandColors.primary },
    {
      id: 'al_dia',
      label: 'Al Día',
      count: clientes.filter((c) => c.estadoMora === 'al_dia').length,
      color: '#1AA965',
    },
    {
      id: 'mora_1',
      label: '1 Mes',
      count: clientes.filter((c) => c.estadoMora === 'mora_1').length,
      color: '#F59E0B',
    },
    {
      id: 'mora_2',
      label: '2 Meses',
      count: clientes.filter((c) => c.estadoMora === 'mora_2').length,
      color: '#F97316',
    },
    {
      id: 'mora_3',
      label: '3+ Meses',
      count: clientes.filter((c) => c.estadoMora === 'mora_3').length,
      color: '#EF4444',
    },
    {
      id: 'paz_y_salvo',
      label: 'Paz y Salvo',
      count: clientes.filter((c) => c.estadoMora === 'paz_y_salvo').length,
      color: '#10B981',
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Barra Superior con Marca e Indicadores */}
      <HeaderBar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        capitalEnLaCalle={metricas.capitalEnLaCalle}
        clientesActivos={metricas.clientesActivos}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Barra de Búsqueda */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>
            <Search size={18} color={theme.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre, documento o ciudad..."
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
        </View>

        {/* Filtros de Semáforo Horizontales */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {FILTROS.map((f) => {
            const isActive = filtroEstado === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFiltroEstado(f.id)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive
                      ? f.color
                      : isDarkMode
                      ? '#161D27'
                      : '#FFFFFF',
                    borderColor: isActive ? f.color : theme.border,
                  },
                ]}>
                <View
                  style={[
                    styles.pillDot,
                    {
                      backgroundColor: isActive ? '#FFFFFF' : f.color,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: isActive ? '#FFFFFF' : theme.text,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}>
                  {f.label} ({f.count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Título de Sección y Total */}
        <View style={styles.listHeader}>
          <Text style={[styles.listHeaderTitle, { color: theme.text }]}>
            Cartera de Clientes ({clientesFiltrados.length})
          </Text>
          <Text style={[styles.listHeaderSub, { color: theme.textSecondary }]}>
            Mostrando créditos vigentes
          </Text>
        </View>

        {/* Lista de Tarjetas */}
        {clientesFiltrados.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>
            <UserCheck size={36} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No se encontraron clientes
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Intenta con otro término de búsqueda o cambia el filtro seleccionado.
            </Text>
          </View>
        ) : (
          clientesFiltrados.map((cli) => (
            <ClienteCard
              key={cli.id}
              cliente={cli}
              isDarkMode={isDarkMode}
              onPress={() => handleOpenDetail(cli)}
              onQuickPay={() => handleOpenDetail(cli)}
            />
          ))
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Botón Flotante para Crear Préstamo / Registrar Cliente */}
      <Pressable
        onPress={() => router.push('/new-client')}
        style={({ pressed }) => [
          styles.fab,
          { opacity: pressed ? 0.85 : 1 },
          Shadows.glowGreen,
        ]}>
        <LinearGradient
          colors={[BrandColors.primary, BrandColors.primaryDark]}
          style={styles.fabGradient}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.fabText}>Nuevo Crédito</Text>
        </LinearGradient>
      </Pressable>

      {/* Modal / BottomSheet de Detalle de Cliente y Simulador de Abonos */}
      <ClienteModalDetail
        visible={modalVisible}
        cliente={selectedCliente}
        historial={historialClienteActual}
        isDarkMode={isDarkMode}
        onClose={() => setModalVisible(false)}
        onRegistrarPago={(params) => {
          registrarPago(params);
          // Refrescar el cliente seleccionado
          if (selectedCliente) {
            const updated = clientes.find((c) => c.id === selectedCliente.id);
            if (updated) setSelectedCliente(updated);
          }
        }}
        onRenovar={handleRenovarDesdeModal}
        onActualizarCliente={(id, data) => {
          actualizarCliente(id, data);
          setSelectedCliente((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev));
        }}
        onEliminarCliente={(id) => {
          eliminarCliente(id);
          setModalVisible(false);
          setSelectedCliente(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  searchSection: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  listHeaderSub: {
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});



import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import {
  Administrador,
  Cliente,
  HistorialPago,
  MetricasFinancieras,
  ModalidadCredito,
  TipoPago,
} from '@/types';
import {
  aplicarAbonoACliente,
  calcularCuota,
  PLAZO_INDEFINIDO_CUOTAS,
} from '@/utils/finance';

interface PrestagoContextType {
  admin: Administrador;
  clientes: Cliente[];
  historialPagos: HistorialPago[];
  isDarkMode: boolean;
  metricas: MetricasFinancieras;
  toggleTheme: () => void;
  agregarCliente: (data: Omit<Cliente, 'id' | 'capitalPendiente' | 'interesPendiente' | 'totalPendiente' | 'cuotasPagadas' | 'estadoMora' | 'diasMora'> & {
    capitalPendiente?: number;
    interesPendiente?: number;
    cuotasPagadas?: number;
  }) => Promise<Cliente | undefined>;
  actualizarCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  eliminarCliente: (id: string) => Promise<void>;
  registrarPago: (params: {
    clienteId: string;
    monto: number;
    tipo: TipoPago;
    subtipo?: 'Capital' | 'Interés' | 'Mixto' | 'Cuota';
    nota?: string;
  }) => Promise<boolean>;
  renovarPrestamo: (params: {
    clienteId: string;
    nuevoMonto: number;
    tasaInteres: number;
    cuotasTotales: number;
    modalidad: ModalidadCredito;
  }) => Promise<boolean>;
  getClienteById: (id: string) => Cliente | undefined;
  getHistorialByCliente: (clienteId: string) => HistorialPago[];
  actualizarFotoAdmin: (nuevaFotoUri: string) => Promise<void>;
  actualizarAdmin: (datos: Partial<Administrador>) => Promise<void>;
  reiniciarDatosMock: () => Promise<void>;
  // Métodos y Estado de Autenticación
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  iniciarSesion: (identificador: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  registrarUsuario: (datos: {
    nombres: string;
    documento: string;
    celular: string;
    email: string;
    password: string;
    negocio?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  recuperarContrasena: (email: string) => Promise<{ success: boolean; message: string }>;
  cerrarSesion: () => Promise<void>;
}

const STORAGE_KEY_THEME = '@prestago_theme_v1';

const INITIAL_ADMIN: Administrador = {
  uid: '',
  nombres: 'Cargando...',
  documento: '',
  celular: '',
  fotoPerfil: undefined,
  email: '',
  negocio: 'PrestaGo',
};

const PrestagoContext = createContext<PrestagoContextType | undefined>(undefined);

export function PrestagoProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [admin, setAdmin] = useState<Administrador>(INITIAL_ADMIN);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [historialPagos, setHistorialPagos] = useState<HistorialPago[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 1. Cargar preferencia de tema visual
  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'dark');
        }
      } catch (e) {
        console.warn('Error loading theme', e);
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY_THEME, next ? 'dark' : 'light').catch(console.warn);
      return next;
    });
  };

  // 2. Escuchar cambios de autenticación de Firebase en tiempo real
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAdmin(INITIAL_ADMIN);
        setClientes([]);
        setHistorialPagos([]);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 3. Sincronización en tiempo real con Firestore cuando el usuario está autenticado
  useEffect(() => {
    if (!firebaseUser) return;

    const uid = firebaseUser.uid;

    // A. Escuchar documento del administrador: /administradores/{uid}
    const adminRef = doc(db, 'administradores', uid);
    const unsubscribeAdmin = onSnapshot(adminRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const nombresCompletos = [data.nombres, data.apellidos].filter(Boolean).join(' ') || data.nombres || firebaseUser.displayName || 'Administrador';

        setAdmin({
          uid,
          nombres: nombresCompletos,
          documento: data.documento || '',
          celular: data.celular || '',
          email: data.correo || firebaseUser.email || '',
          negocio: data.usuario || 'PrestaGo Créditos',
          fotoPerfil: data.fotoPerfil || data.fotoUrl || firebaseUser.photoURL || undefined,
        });
      } else {
        // Si no existe aún el documento, inicializamos con los datos de Firebase Auth
        setAdmin({
          uid,
          nombres: firebaseUser.displayName || 'Administrador',
          documento: '',
          celular: '',
          email: firebaseUser.email || '',
          negocio: 'PrestaGo',
          fotoPerfil: firebaseUser.photoURL || undefined,
        });
      }
      setIsAuthLoading(false);
    }, (error) => {
      console.warn('Error al escuchar administrador en Firestore:', error);
      setIsAuthLoading(false);
    });

    // B. Escuchar subcolección de clientes: /administradores/{uid}/clientes
    const clientesRef = collection(db, 'administradores', uid, 'clientes');
    const unsubscribeClientes = onSnapshot(clientesRef, (querySnap) => {
      const lista: Cliente[] = querySnap.docs.map((docSnap) => {
        const d = docSnap.data();

        // Tipos de datos compatibles con Flutter (números guardados como String)
        const monto = parseFloat(d.monto?.toString() || '0');
        const cuota = parseFloat(d.cuota?.toString() || '0');
        const capitalPendiente = parseFloat(d.capitalPendiente?.toString() || '0');
        const interesPendiente = parseFloat(d.interesPendiente?.toString() || '0');
        const totalPendiente = parseFloat(d.totalPendiente?.toString() || (capitalPendiente + interesPendiente).toString());
        const cuotasPagadas = parseInt(d.cuotasPagadas?.toString() || '0', 10);
        const cuotasTotales = parseInt(d.cuotasTotales?.toString() || '1', 10);

        // Parseo de fechas (Timestamp a YYYY-MM-DD)
        let fechaInicio = new Date().toISOString().split('T')[0];
        let fechaInicioDate = new Date();
        if (d.fechaInicio && typeof d.fechaInicio.toDate === 'function') {
          fechaInicioDate = d.fechaInicio.toDate();
          fechaInicio = fechaInicioDate.toISOString().split('T')[0];
        } else if (typeof d.fechaInicio === 'string') {
          fechaInicio = d.fechaInicio;
          fechaInicioDate = new Date(d.fechaInicio);
        }

        // Cálculo de Mora idéntico a Flutter PrestaGo
        const ahora = new Date();
        const mesesPasados = Math.max(
          0,
          (ahora.getFullYear() - fechaInicioDate.getFullYear()) * 12 +
            ahora.getMonth() -
            fechaInicioDate.getMonth() -
            (ahora.getDate() < fechaInicioDate.getDate() ? 1 : 0)
        );

        // Prepago del sistema PrestaGo: el primer día genera cuota causada
        const cuotasGeneradas = mesesPasados + 1;
        const cuotasAtrasadas = Math.max(0, cuotasGeneradas - cuotasPagadas);

        let estadoMora: Cliente['estadoMora'] = 'al_dia';
        let diasMora = 0;

        if (totalPendiente <= 0 || (capitalPendiente <= 0 && interesPendiente <= 0)) {
          estadoMora = 'paz_y_salvo';
          diasMora = 0;
        } else if (cuotasAtrasadas >= 3) {
          estadoMora = 'mora_3';
          diasMora = cuotasAtrasadas * 30;
        } else if (cuotasAtrasadas === 2) {
          estadoMora = 'mora_2';
          diasMora = 60;
        } else if (cuotasAtrasadas === 1) {
          estadoMora = 'mora_1';
          diasMora = 30;
        }

        // Próximo cobro: fechaInicio + (cuotasPagadas + 1) meses
        const prox = new Date(fechaInicioDate);
        prox.setMonth(prox.getMonth() + cuotasPagadas + 1);
        const proximoCobro = prox.toISOString().split('T')[0];

        const modalidad: ModalidadCredito = d.modalidad?.includes('Solo Intereses')
          ? 'Solo Intereses'
          : 'Amortizado';

        const tasaInteres = monto > 0 && cuota > 0
          ? Math.round((cuota / monto) * 100)
          : 10;

        return {
          id: docSnap.id,
          nombre: d.nombre || 'Sin Nombre',
          documento: d.documento || '',
          celular: d.celular || '',
          ubicacion: d.ubicacion || '',
          coordenadas: d.coordenadas,
          direccionDetalle: d.direccionDetalle,
          modalidad,
          monto,
          tasaInteres,
          cuota,
          cuotasPagadas,
          cuotasTotales,
          capitalPendiente,
          interesPendiente,
          totalPendiente,
          fechaInicio,
          proximoCobro,
          estadoMora,
          diasMora,
          esMigrado: d.tipoRegistro === 'Migrado',
          notas: d.notas,
        };
      });

      setClientes(lista);
    }, (error) => {
      console.warn('Error al escuchar clientes en Firestore:', error);
    });

    return () => {
      unsubscribeAdmin();
      unsubscribeClientes();
    };
  }, [firebaseUser]);

  // 4. Métricas Financieras calculadas en tiempo real
  const metricas = useMemo<MetricasFinancieras>(() => {
    let capitalEnLaCalle = 0;
    let dineroRecuperado = 0;
    let gananciasIntereses = 0;
    let clientesActivos = 0;
    let clientesEnMora = 0;

    clientes.forEach((c) => {
      capitalEnLaCalle += c.capitalPendiente;

      if (c.monto > c.capitalPendiente) {
        dineroRecuperado += c.monto - c.capitalPendiente;
      }

      if (c.cuotasPagadas > 0) {
        if (c.modalidad === 'Solo Intereses') {
          gananciasIntereses += c.cuota * c.cuotasPagadas;
        } else {
          const interesPorCuota = (c.monto * (c.tasaInteres / 100)) / (c.cuotasTotales === 999 ? 12 : c.cuotasTotales);
          gananciasIntereses += interesPorCuota * c.cuotasPagadas;
        }
      }

      if (c.totalPendiente > 0) {
        clientesActivos++;
        if (c.estadoMora !== 'al_dia') {
          clientesEnMora++;
        }
      }
    });

    return {
      capitalEnLaCalle,
      dineroRecuperado,
      gananciasIntereses,
      clientesActivos,
      clientesEnMora,
      totalClientes: clientes.length,
    };
  }, [clientes]);

  // 5. Cargar historial de pagos de un cliente desde Firestore
  const getHistorialByCliente = (clienteId: string): HistorialPago[] => {
    // Si ya los tenemos en memoria local los retornamos
    const locales = historialPagos.filter((p) => p.clienteId === clienteId);
    if (locales.length > 0) return locales;

    // Si hay usuario autenticado, cargamos los documentos de la subcolección en segundo plano
    if (firebaseUser) {
      const pagosRef = collection(db, 'administradores', firebaseUser.uid, 'clientes', clienteId, 'historial_pagos');
      getDocs(pagosRef).then((snap) => {
        const nuevosPagos: HistorialPago[] = snap.docs.map((docSnap) => {
          const p = docSnap.data();
          let fechaPago = new Date().toISOString();
          if (p.fechaPago && typeof p.fechaPago.toDate === 'function') {
            fechaPago = p.fechaPago.toDate().toISOString();
          }

          const clienteRelacionado = clientes.find((c) => c.id === clienteId);

          return {
            id: docSnap.id,
            clienteId,
            clienteNombre: clienteRelacionado?.nombre,
            monto: parseFloat(p.monto?.toString() || '0'),
            tipo: (p.tipo as TipoPago) || 'Abono Libre',
            abonoCapital: p.abonoCapital ? parseFloat(p.abonoCapital.toString()) : 0,
            abonoInteres: p.abonoInteres ? parseFloat(p.abonoInteres.toString()) : 0,
            numeroCuota: typeof p.numeroCuota === 'number' ? p.numeroCuota : 1,
            fechaPago,
            nota: p.tipo,
          };
        });

        if (nuevosPagos.length > 0) {
          setHistorialPagos((prev) => {
            const filtrados = prev.filter((p) => p.clienteId !== clienteId);
            return [...filtrados, ...nuevosPagos];
          });
        }
      }).catch(console.warn);
    }

    return locales;
  };

  // 6. Operaciones CRUD con Firestore
  const agregarCliente = async (
    data: Omit<Cliente, 'id' | 'capitalPendiente' | 'interesPendiente' | 'totalPendiente' | 'cuotasPagadas' | 'estadoMora' | 'diasMora'> & {
      capitalPendiente?: number;
      interesPendiente?: number;
      cuotasPagadas?: number;
    }
  ): Promise<Cliente | undefined> => {
    if (!firebaseUser) return undefined;

    const modalidadFirestore = data.modalidad === 'Solo Intereses'
      ? 'Solo Intereses (Capital al final)'
      : 'Amortizado (Capital + Interés)';

    const capitalPendiente = data.capitalPendiente ?? data.monto;
    const interesPendiente = data.interesPendiente ?? 0;
    const totalPendiente = capitalPendiente + interesPendiente;

    const docData: Record<string, any> = {
      nombre: data.nombre.trim(),
      documento: data.documento.trim(),
      celular: data.celular.trim(),
      ubicacion: data.ubicacion.trim(),
      modalidad: modalidadFirestore,
      monto: data.monto.toString(),
      cuota: data.cuota.toString(),
      cuotasPagadas: data.cuotasPagadas || 0,
      cuotasTotales: data.cuotasTotales,
      capitalPendiente: capitalPendiente.toString(),
      interesPendiente: interesPendiente.toString(),
      totalPendiente: totalPendiente.toString(),
      fechaInicio: Timestamp.fromDate(data.fechaInicio ? new Date(data.fechaInicio) : new Date()),
      tipoRegistro: data.esMigrado ? 'Migrado' : 'Nuevo',
    };

    if (data.coordenadas) docData.coordenadas = data.coordenadas;
    if (data.direccionDetalle) docData.direccionDetalle = data.direccionDetalle;
    if (data.notas) docData.notas = data.notas;

    const docRef = await addDoc(
      collection(db, 'administradores', firebaseUser.uid, 'clientes'),
      docData
    );

    return {
      ...data,
      id: docRef.id,
      capitalPendiente,
      interesPendiente,
      totalPendiente,
      cuotasPagadas: data.cuotasPagadas || 0,
      estadoMora: 'al_dia',
      diasMora: 0,
    };
  };

  const actualizarCliente = async (id: string, data: Partial<Cliente>) => {
    if (!firebaseUser) return;

    const updateData: Record<string, any> = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre.trim();
    if (data.documento !== undefined) updateData.documento = data.documento.trim();
    if (data.celular !== undefined) updateData.celular = data.celular.trim();
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion.trim();
    if (data.monto !== undefined) updateData.monto = data.monto.toString();
    if (data.cuota !== undefined) updateData.cuota = data.cuota.toString();
    if (data.capitalPendiente !== undefined) updateData.capitalPendiente = data.capitalPendiente.toString();
    if (data.interesPendiente !== undefined) updateData.interesPendiente = data.interesPendiente.toString();
    if (data.totalPendiente !== undefined) updateData.totalPendiente = data.totalPendiente.toString();
    if (data.cuotasPagadas !== undefined) updateData.cuotasPagadas = data.cuotasPagadas;
    if (data.cuotasTotales !== undefined) updateData.cuotasTotales = data.cuotasTotales;
    if (data.coordenadas !== undefined) updateData.coordenadas = data.coordenadas;
    if (data.direccionDetalle !== undefined) updateData.direccionDetalle = data.direccionDetalle;
    if (data.notas !== undefined) updateData.notas = data.notas;
    if (data.modalidad !== undefined) {
      updateData.modalidad = data.modalidad === 'Solo Intereses'
        ? 'Solo Intereses (Capital al final)'
        : 'Amortizado (Capital + Interés)';
    }

    await updateDoc(doc(db, 'administradores', firebaseUser.uid, 'clientes', id), updateData);
  };

  const eliminarCliente = async (id: string) => {
    if (!firebaseUser) return;
    await deleteDoc(doc(db, 'administradores', firebaseUser.uid, 'clientes', id));
  };

  const registrarPago = async (params: {
    clienteId: string;
    monto: number;
    tipo: TipoPago;
    subtipo?: 'Capital' | 'Interés' | 'Mixto' | 'Cuota';
    nota?: string;
  }): Promise<boolean> => {
    if (!firebaseUser) return false;

    const cliente = clientes.find((c) => c.id === params.clienteId);
    if (!cliente) return false;

    const tipoParaCalculo = params.subtipo === 'Interés' ? 'Interés' : 'Capital';
    const resultado = aplicarAbonoACliente(
      cliente,
      params.monto,
      tipoParaCalculo
    );

    const nuevasCuotas = cliente.cuotasPagadas + resultado.cuotasPagadasIncremento;

    // 1. Actualizar cliente en Firestore
    await updateDoc(doc(db, 'administradores', firebaseUser.uid, 'clientes', params.clienteId), {
      capitalPendiente: resultado.nuevoCapitalPendiente.toString(),
      interesPendiente: resultado.nuevoInteresPendiente.toString(),
      totalPendiente: resultado.nuevoTotalPendiente.toString(),
      cuotasPagadas: nuevasCuotas,
    });

    // 2. Registrar en la subcolección historial_pagos
    const extraInfo = resultado.cuotasPagadasIncremento > 0 ? ` (Avanza ${resultado.cuotasPagadasIncremento} cuotas)` : '';
    await addDoc(
      collection(db, 'administradores', firebaseUser.uid, 'clientes', params.clienteId, 'historial_pagos'),
      {
        monto: params.monto.toString(),
        tipo: `${params.tipo}${extraInfo}`,
        fechaPago: serverTimestamp(),
        numeroCuota: nuevasCuotas,
      }
    );

    return true;
  };

  const renovarPrestamo = async (params: {
    clienteId: string;
    nuevoMonto: number;
    tasaInteres: number;
    cuotasTotales: number;
    modalidad: ModalidadCredito;
  }): Promise<boolean> => {
    if (!firebaseUser) return false;

    const calculo = calcularCuota({
      monto: params.nuevoMonto,
      tasaInteres: params.tasaInteres,
      cuotasTotales: params.cuotasTotales,
      modalidad: params.modalidad,
    });

    const modalidadFirestore = params.modalidad === 'Solo Intereses'
      ? 'Solo Intereses (Capital al final)'
      : 'Amortizado (Capital + Interés)';

    await updateDoc(doc(db, 'administradores', firebaseUser.uid, 'clientes', params.clienteId), {
      monto: params.nuevoMonto.toString(),
      cuota: calculo.cuota.toString(),
      modalidad: modalidadFirestore,
      cuotasTotales: params.cuotasTotales,
      cuotasPagadas: 0,
      capitalPendiente: params.nuevoMonto.toString(),
      interesPendiente: calculo.interesTotal.toString(),
      totalPendiente: calculo.totalAPagar.toString(),
      fechaInicio: serverTimestamp(),
    });

    return true;
  };

  const getClienteById = (id: string) => clientes.find((c) => c.id === id);

  const actualizarAdmin = async (datos: Partial<Administrador>) => {
    if (!firebaseUser) return;

    const updateObj: Record<string, any> = {};
    if (datos.nombres !== undefined) updateObj.nombres = datos.nombres;
    if (datos.documento !== undefined) updateObj.documento = datos.documento;
    if (datos.celular !== undefined) updateObj.celular = datos.celular;
    if (datos.email !== undefined) updateObj.correo = datos.email;
    if (datos.negocio !== undefined) updateObj.usuario = datos.negocio;
    if (datos.fotoPerfil !== undefined) updateObj.fotoPerfil = datos.fotoPerfil;

    await updateDoc(doc(db, 'administradores', firebaseUser.uid), updateObj);
  };

  const actualizarFotoAdmin = async (nuevaFotoUri: string) => {
    await actualizarAdmin({ fotoPerfil: nuevaFotoUri });
  };

  const reiniciarDatosMock = async () => {
    // Modo seguro con base de datos en producción: no borra datos reales
    console.log('PrestaGo conectado en vivo a Firebase');
  };

  // 7. Funciones de Autenticación con Firebase Auth
  const iniciarSesion = async (
    identificador: string,
    contrasena: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = identificador.trim().toLowerCase();
      const cleanPass = contrasena.trim();

      if (!cleanEmail || !cleanPass) {
        return { success: false, error: 'Ingresa tu correo y contraseña.' };
      }

      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      return { success: true };
    } catch (err: any) {
      console.warn('Error en iniciarSesion con Firebase:', err);
      let errorMsg = 'No se pudo iniciar sesión. Verifica tus credenciales.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Correo o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Demasiados intentos fallidos. Intenta más tarde.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const registrarUsuario = async (datos: {
    nombres: string;
    documento: string;
    celular: string;
    email: string;
    password: string;
    negocio?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = datos.email.trim().toLowerCase();
      const cleanPass = datos.password.trim();

      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const user = cred.user;

      // Crear documento inicial en /administradores/{uid} compatible con Flutter
      await setDoc(doc(db, 'administradores', user.uid), {
        nombres: datos.nombres.trim(),
        apellidos: '',
        celular: datos.celular.trim(),
        correo: cleanEmail,
        documento: datos.documento.trim(),
        usuario: datos.negocio?.trim() || 'Fercho',
        fecha_creacion: serverTimestamp(),
        fotoPerfil: null,
        fotoUrl: null,
      });

      return { success: true };
    } catch (err: any) {
      console.warn('Error en registrarUsuario con Firebase:', err);
      let errorMsg = 'No se pudo crear la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Ya existe una cuenta registrada con este correo.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const recuperarContrasena = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Hemos enviado un enlace oficial para restablecer tu contraseña a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
      };
    } catch (err: any) {
      console.warn('Error en recuperarContrasena con Firebase:', err);
      let errorMsg = 'No fue posible procesar la solicitud.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No encontramos ninguna cuenta asociada a este correo.';
      }
      return { success: false, message: errorMsg };
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Error al cerrar sesión:', err);
    }
  };

  return (
    <PrestagoContext.Provider
      value={{
        admin,
        clientes,
        historialPagos,
        isDarkMode,
        metricas,
        toggleTheme,
        agregarCliente,
        actualizarCliente,
        eliminarCliente,
        registrarPago,
        renovarPrestamo,
        getClienteById,
        getHistorialByCliente,
        actualizarFotoAdmin,
        actualizarAdmin,
        reiniciarDatosMock,
        isAuthenticated: !!firebaseUser,
        isAuthLoading,
        iniciarSesion,
        registrarUsuario,
        recuperarContrasena,
        cerrarSesion,
      }}>
      {children}
    </PrestagoContext.Provider>
  );
}

export function usePrestago() {
  const context = useContext(PrestagoContext);
  if (!context) {
    throw new Error('usePrestago debe ser utilizado dentro de un PrestagoProvider');
  }
  return context;
}

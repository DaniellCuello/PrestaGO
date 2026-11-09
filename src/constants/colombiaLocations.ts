export interface MunicipioColombia {
  id: string;
  ciudad: string;
  departamento: string;
  lat: number;
  lng: number;
}

// Catálogo de municipios y ciudades de Colombia con coordenadas de referencia
export const MUNICIPIOS_COLOMBIA: MunicipioColombia[] = [
  // Antioquia
  { id: 'ant-med', ciudad: 'Medellín', departamento: 'Antioquia', lat: 6.2442, lng: -75.5812 },
  { id: 'ant-bel', ciudad: 'Bello', departamento: 'Antioquia', lat: 6.3373, lng: -75.5580 },
  { id: 'ant-ita', ciudad: 'Itagüí', departamento: 'Antioquia', lat: 6.1846, lng: -75.5991 },
  { id: 'ant-env', ciudad: 'Envigado', departamento: 'Antioquia', lat: 6.1664, lng: -75.5833 },
  { id: 'ant-sab', ciudad: 'Sabaneta', departamento: 'Antioquia', lat: 6.1514, lng: -75.6163 },
  { id: 'ant-est', ciudad: 'La Estrella', departamento: 'Antioquia', lat: 6.1578, lng: -75.6433 },
  { id: 'ant-cal', ciudad: 'Caldas', departamento: 'Antioquia', lat: 6.0911, lng: -75.6358 },
  { id: 'ant-cop', ciudad: 'Copacabana', departamento: 'Antioquia', lat: 6.3472, lng: -75.5097 },
  { id: 'ant-gir', ciudad: 'Girardota', departamento: 'Antioquia', lat: 6.3769, lng: -75.4469 },
  { id: 'ant-bar', ciudad: 'Barbosa', departamento: 'Antioquia', lat: 6.4386, lng: -75.3314 },
  { id: 'ant-rio', ciudad: 'Rionegro', departamento: 'Antioquia', lat: 6.1552, lng: -75.3737 },
  { id: 'ant-mar', ciudad: 'Marinilla', departamento: 'Antioquia', lat: 6.1736, lng: -75.3353 },
  { id: 'ant-cej', ciudad: 'La Ceja', departamento: 'Antioquia', lat: 6.0336, lng: -75.4264 },
  { id: 'ant-gua', ciudad: 'Guarne', departamento: 'Antioquia', lat: 6.2803, lng: -75.4431 },
  { id: 'ant-car', ciudad: 'El Carmen de Viboral', departamento: 'Antioquia', lat: 6.0828, lng: -75.3364 },
  { id: 'ant-ret', ciudad: 'El Retiro', departamento: 'Antioquia', lat: 6.0594, lng: -75.5031 },
  { id: 'ant-apa', ciudad: 'Apartadó', departamento: 'Antioquia', lat: 7.8825, lng: -76.6258 },
  { id: 'ant-tur', ciudad: 'Turbo', departamento: 'Antioquia', lat: 8.0925, lng: -76.7283 },
  { id: 'ant-cau', ciudad: 'Caucasia', departamento: 'Antioquia', lat: 7.9867, lng: -75.1936 },
  { id: 'ant-yar', ciudad: 'Yarumal', departamento: 'Antioquia', lat: 6.9631, lng: -75.4172 },
  { id: 'ant-stf', ciudad: 'Santa Fe de Antioquia', departamento: 'Antioquia', lat: 6.5572, lng: -75.8281 },
  { id: 'ant-chi', ciudad: 'Chigorodó', departamento: 'Antioquia', lat: 7.6681, lng: -76.6806 },

  // Bogotá D.C. y Cundinamarca
  { id: 'bog-bog', ciudad: 'Bogotá D.C.', departamento: 'Bogotá D.C.', lat: 4.7110, lng: -74.0721 },
  { id: 'bog-sub', ciudad: 'Bogotá (Suba)', departamento: 'Bogotá D.C.', lat: 4.7431, lng: -74.0844 },
  { id: 'bog-usa', ciudad: 'Bogotá (Usaquén)', departamento: 'Bogotá D.C.', lat: 4.6976, lng: -74.0321 },
  { id: 'bog-ken', ciudad: 'Bogotá (Kennedy)', departamento: 'Bogotá D.C.', lat: 4.6292, lng: -74.1528 },
  { id: 'bog-eng', ciudad: 'Bogotá (Engativá)', departamento: 'Bogotá D.C.', lat: 4.7008, lng: -74.1136 },
  { id: 'bog-bos', ciudad: 'Bogotá (Bosa)', departamento: 'Bogotá D.C.', lat: 4.6186, lng: -74.1906 },
  { id: 'bog-cha', ciudad: 'Bogotá (Chapinero)', departamento: 'Bogotá D.C.', lat: 4.6469, lng: -74.0617 },
  { id: 'cun-soa', ciudad: 'Soacha', departamento: 'Cundinamarca', lat: 4.5800, lng: -74.2167 },
  { id: 'cun-chi', ciudad: 'Chía', departamento: 'Cundinamarca', lat: 4.8614, lng: -74.0569 },
  { id: 'cun-zip', ciudad: 'Zipaquirá', departamento: 'Cundinamarca', lat: 5.0272, lng: -74.0042 },
  { id: 'cun-fac', ciudad: 'Facatativá', departamento: 'Cundinamarca', lat: 4.8142, lng: -74.3542 },
  { id: 'cun-mos', ciudad: 'Mosquera', departamento: 'Cundinamarca', lat: 4.7061, lng: -74.2303 },
  { id: 'cun-mad', ciudad: 'Madrid', departamento: 'Cundinamarca', lat: 4.7328, lng: -74.2642 },
  { id: 'cun-fun', ciudad: 'Funza', departamento: 'Cundinamarca', lat: 4.7164, lng: -74.2122 },
  { id: 'cun-caj', ciudad: 'Cajicá', departamento: 'Cundinamarca', lat: 4.9197, lng: -74.0269 },
  { id: 'cun-fus', ciudad: 'Fusagasugá', departamento: 'Cundinamarca', lat: 4.3375, lng: -74.3644 },
  { id: 'cun-gir', ciudad: 'Girardot', departamento: 'Cundinamarca', lat: 4.3019, lng: -74.8031 },

  // Valle del Cauca
  { id: 'val-cal', ciudad: 'Cali', departamento: 'Valle del Cauca', lat: 3.4516, lng: -76.5320 },
  { id: 'val-pal', ciudad: 'Palmira', departamento: 'Valle del Cauca', lat: 3.5394, lng: -76.3036 },
  { id: 'val-bue', ciudad: 'Buenaventura', departamento: 'Valle del Cauca', lat: 3.8839, lng: -77.0311 },
  { id: 'val-tul', ciudad: 'Tuluá', departamento: 'Valle del Cauca', lat: 4.0847, lng: -76.1964 },
  { id: 'val-car', ciudad: 'Cartago', departamento: 'Valle del Cauca', lat: 4.7464, lng: -75.9117 },
  { id: 'val-bug', ciudad: 'Guadalajara de Buga', departamento: 'Valle del Cauca', lat: 3.9008, lng: -76.2978 },
  { id: 'val-jam', ciudad: 'Jamundí', departamento: 'Valle del Cauca', lat: 3.2606, lng: -76.5417 },
  { id: 'val-yum', ciudad: 'Yumbo', departamento: 'Valle del Cauca', lat: 3.5828, lng: -76.4950 },
  { id: 'val-can', ciudad: 'Candelaria', departamento: 'Valle del Cauca', lat: 3.4072, lng: -76.3486 },
  { id: 'val-pra', ciudad: 'Pradera', departamento: 'Valle del Cauca', lat: 3.4194, lng: -76.2444 },
  { id: 'val-sev', ciudad: 'Sevilla', departamento: 'Valle del Cauca', lat: 4.2678, lng: -75.9317 },

  // Atlántico
  { id: 'atl-bar', ciudad: 'Barranquilla', departamento: 'Atlántico', lat: 10.9685, lng: -74.7813 },
  { id: 'atl-sol', ciudad: 'Soledad', departamento: 'Atlántico', lat: 10.9183, lng: -74.7644 },
  { id: 'atl-mal', ciudad: 'Malambo', departamento: 'Atlántico', lat: 10.8592, lng: -74.7739 },
  { id: 'atl-sab', ciudad: 'Sabanalarga', departamento: 'Atlántico', lat: 10.6319, lng: -74.9208 },
  { id: 'atl-pue', ciudad: 'Puerto Colombia', departamento: 'Atlántico', lat: 10.9878, lng: -74.9547 },
  { id: 'atl-gal', ciudad: 'Galapa', departamento: 'Atlántico', lat: 10.8981, lng: -74.8872 },

  // Santander
  { id: 'san-buc', ciudad: 'Bucaramanga', departamento: 'Santander', lat: 7.1254, lng: -73.1198 },
  { id: 'san-flo', ciudad: 'Floridablanca', departamento: 'Santander', lat: 7.0622, lng: -73.0864 },
  { id: 'san-gir', ciudad: 'Girón', departamento: 'Santander', lat: 7.0683, lng: -73.1697 },
  { id: 'san-pie', ciudad: 'Piedecuesta', departamento: 'Santander', lat: 6.9886, lng: -73.0494 },
  { id: 'san-bar', ciudad: 'Barrancabermeja', departamento: 'Santander', lat: 7.0653, lng: -73.8547 },
  { id: 'san-gil', ciudad: 'San Gil', departamento: 'Santander', lat: 6.5567, lng: -73.1344 },
  { id: 'san-soc', ciudad: 'Socorro', departamento: 'Santander', lat: 6.4689, lng: -73.2625 },

  // Bolívar
  { id: 'bol-car', ciudad: 'Cartagena de Indias', departamento: 'Bolívar', lat: 10.3910, lng: -75.4794 },
  { id: 'bol-mag', ciudad: 'Magangué', departamento: 'Bolívar', lat: 9.2428, lng: -74.7547 },
  { id: 'bol-tur', ciudad: 'Turbaco', departamento: 'Bolívar', lat: 10.3308, lng: -75.4142 },
  { id: 'bol-arj', ciudad: 'Arjona', departamento: 'Bolívar', lat: 10.2589, lng: -75.3444 },
  { id: 'bol-car-bol', ciudad: 'El Carmen de Bolívar', departamento: 'Bolívar', lat: 9.7178, lng: -75.1206 },

  // Eje Cafetero (Risaralda, Caldas, Quindío)
  { id: 'ris-per', ciudad: 'Pereira', departamento: 'Risaralda', lat: 4.8133, lng: -75.6961 },
  { id: 'ris-dos', ciudad: 'Dosquebradas', departamento: 'Risaralda', lat: 4.8344, lng: -75.6797 },
  { id: 'ris-str', ciudad: 'Santa Rosa de Cabal', departamento: 'Risaralda', lat: 4.8692, lng: -75.6214 },
  { id: 'cal-man', ciudad: 'Manizales', departamento: 'Caldas', lat: 5.0689, lng: -75.5174 },
  { id: 'cal-vil', ciudad: 'Villamaría', departamento: 'Caldas', lat: 5.0456, lng: -75.5150 },
  { id: 'cal-dor', ciudad: 'La Dorada', departamento: 'Caldas', lat: 5.4539, lng: -74.6644 },
  { id: 'cal-chi', ciudad: 'Chinchiná', departamento: 'Caldas', lat: 4.9814, lng: -75.6047 },
  { id: 'qui-arm', ciudad: 'Armenia', departamento: 'Quindío', lat: 4.5339, lng: -75.6811 },
  { id: 'qui-cal', ciudad: 'Calarcá', departamento: 'Quindío', lat: 4.5294, lng: -75.6417 },
  { id: 'qui-mon', ciudad: 'Montenegro', departamento: 'Quindío', lat: 4.5661, lng: -75.7508 },
  { id: 'qui-qui', ciudad: 'Quimbaya', departamento: 'Quindío', lat: 4.6236, lng: -75.7636 },

  // Tolima y Huila
  { id: 'tol-iba', ciudad: 'Ibagué', departamento: 'Tolima', lat: 4.4389, lng: -75.2322 },
  { id: 'tol-esp', ciudad: 'El Espinal', departamento: 'Tolima', lat: 4.1492, lng: -74.8847 },
  { id: 'tol-mel', ciudad: 'Melgar', departamento: 'Tolima', lat: 4.2047, lng: -74.6408 },
  { id: 'hui-nei', ciudad: 'Neiva', departamento: 'Huila', lat: 2.9273, lng: -75.2819 },
  { id: 'hui-pit', ciudad: 'Pitalito', departamento: 'Huila', lat: 1.8533, lng: -76.0506 },
  { id: 'hui-gar', ciudad: 'Garzón', departamento: 'Huila', lat: 2.1958, lng: -75.6278 },

  // Norte de Santander
  { id: 'nds-cuc', ciudad: 'Cúcuta', departamento: 'Norte de Santander', lat: 7.8939, lng: -72.5078 },
  { id: 'nds-oca', ciudad: 'Ocaña', departamento: 'Norte de Santander', lat: 8.2389, lng: -73.3556 },
  { id: 'nds-vdr', ciudad: 'Villa del Rosario', departamento: 'Norte de Santander', lat: 7.8339, lng: -72.4742 },
  { id: 'nds-los', ciudad: 'Los Patios', departamento: 'Norte de Santander', lat: 7.8469, lng: -72.5069 },
  { id: 'nds-pam', ciudad: 'Pamplona', departamento: 'Norte de Santander', lat: 7.3756, lng: -72.6481 },

  // Meta y Llanos Orientales
  { id: 'met-vil', ciudad: 'Villavicencio', departamento: 'Meta', lat: 4.1420, lng: -73.6266 },
  { id: 'met-aca', ciudad: 'Acacías', departamento: 'Meta', lat: 3.9872, lng: -73.7578 },
  { id: 'met-gra', ciudad: 'Granada', departamento: 'Meta', lat: 3.5461, lng: -73.7067 },
  { id: 'cas-yop', ciudad: 'Yopal', departamento: 'Casanare', lat: 5.3378, lng: -72.3958 },
  { id: 'cas-agu', ciudad: 'Aguazul', departamento: 'Casanare', lat: 5.1728, lng: -72.5458 },
  { id: 'ara-ara', ciudad: 'Arauca', departamento: 'Arauca', lat: 7.0847, lng: -70.7592 },

  // Nariño y Cauca
  { id: 'nar-pas', ciudad: 'Pasto', departamento: 'Nariño', lat: 1.2136, lng: -77.2811 },
  { id: 'nar-ipi', ciudad: 'Ipiales', departamento: 'Nariño', lat: 0.8303, lng: -77.6444 },
  { id: 'nar-tum', ciudad: 'Tumaco', departamento: 'Nariño', lat: 1.7986, lng: -78.8156 },
  { id: 'cau-pop', ciudad: 'Popayán', departamento: 'Cauca', lat: 2.4419, lng: -76.6063 },
  { id: 'cau-qui', ciudad: 'Santander de Quilichao', departamento: 'Cauca', lat: 3.0094, lng: -76.4844 },

  // Costa Caribe (Córdoba, Cesar, Magdalena, Sucre, Guajira)
  { id: 'cor-mon', ciudad: 'Montería', departamento: 'Córdoba', lat: 8.7479, lng: -75.8814 },
  { id: 'cor-lor', ciudad: 'Lorica', departamento: 'Córdoba', lat: 9.2392, lng: -75.8139 },
  { id: 'cor-cer', ciudad: 'Cereté', departamento: 'Córdoba', lat: 8.8839, lng: -75.7908 },
  { id: 'cor-sah', ciudad: 'Sahagún', departamento: 'Córdoba', lat: 8.9472, lng: -75.4431 },
  { id: 'ces-val', ciudad: 'Valledupar', departamento: 'Cesar', lat: 10.4631, lng: -73.2532 },
  { id: 'ces-agu', ciudad: 'Aguachica', departamento: 'Cesar', lat: 8.3086, lng: -73.6172 },
  { id: 'mag-sta', ciudad: 'Santa Marta', departamento: 'Magdalena', lat: 11.2408, lng: -74.1990 },
  { id: 'mag-cie', ciudad: 'Ciénaga', departamento: 'Magdalena', lat: 11.0069, lng: -74.2503 },
  { id: 'suc-sin', ciudad: 'Sincelejo', departamento: 'Sucre', lat: 9.3047, lng: -75.3978 },
  { id: 'suc-cor', ciudad: 'Corozal', departamento: 'Sucre', lat: 9.3167, lng: -75.2944 },
  { id: 'lag-rio', ciudad: 'Riohacha', departamento: 'La Guajira', lat: 11.5444, lng: -72.9072 },
  { id: 'lag-mai', ciudad: 'Maicao', departamento: 'La Guajira', lat: 11.3814, lng: -72.2411 },

  // Boyacá
  { id: 'boy-tun', ciudad: 'Tunja', departamento: 'Boyacá', lat: 5.5353, lng: -73.3678 },
  { id: 'boy-dui', ciudad: 'Duitama', departamento: 'Boyacá', lat: 5.8267, lng: -73.0336 },
  { id: 'boy-sog', ciudad: 'Sogamoso', departamento: 'Boyacá', lat: 5.7144, lng: -72.9339 },
  { id: 'boy-chi', ciudad: 'Chiquinquirá', departamento: 'Boyacá', lat: 5.6172, lng: -73.8169 },
  { id: 'boy-pai', ciudad: 'Paipa', departamento: 'Boyacá', lat: 5.7806, lng: -73.1158 },
  { id: 'boy-vdl', ciudad: 'Villa de Leyva', departamento: 'Boyacá', lat: 5.6331, lng: -73.5286 },

  // Chocó, Caquetá, Putumayo, Amazonas, Guaviare, San Andrés
  { id: 'cho-qui', ciudad: 'Quibdó', departamento: 'Chocó', lat: 5.6947, lng: -76.6583 },
  { id: 'caq-flo', ciudad: 'Florencia', departamento: 'Caquetá', lat: 1.6144, lng: -75.6061 },
  { id: 'put-moc', ciudad: 'Mocoa', departamento: 'Putumayo', lat: 1.1528, lng: -76.6522 },
  { id: 'put-pua', ciudad: 'Puerto Asís', departamento: 'Putumayo', lat: 0.5061, lng: -76.5008 },
  { id: 'ama-let', ciudad: 'Leticia', departamento: 'Amazonas', lat: -4.2153, lng: -69.9406 },
  { id: 'gua-sjg', ciudad: 'San José del Guaviare', departamento: 'Guaviare', lat: 2.5728, lng: -72.6458 },
  { id: 'san-san', ciudad: 'San Andrés', departamento: 'San Andrés y Providencia', lat: 12.5847, lng: -81.7006 },
];

/**
 * Normaliza una cadena de texto eliminando acentos y signos diacríticos
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca municipios en Colombia coincidentes con el término ingresado
 */
export function buscarMunicipiosColombia(
  busqueda: string,
  limite: number = 8
): MunicipioColombia[] {
  if (!busqueda || busqueda.trim().length === 0) {
    return MUNICIPIOS_COLOMBIA.slice(0, limite);
  }

  const queryNorm = normalizarTexto(busqueda);

  return MUNICIPIOS_COLOMBIA.filter((m) => {
    const ciudadNorm = normalizarTexto(m.ciudad);
    const deptoNorm = normalizarTexto(m.departamento);
    const combinado = `${ciudadNorm} ${deptoNorm}`;

    return (
      ciudadNorm.includes(queryNorm) ||
      deptoNorm.includes(queryNorm) ||
      combinado.includes(queryNorm)
    );
  }).slice(0, limite);
}


export const iconMap = { 
  'birthday': 'FaBirthdayCake',
  'christmas': 'FaSnowman', 
  'gift': 'FaGift',
  'hourglass': 'FaHourglassHalf',
  'love': 'FaHeart',
  'rocket': 'FaRocket',
  'party': 'GiPartyPopper',
  'celebration': 'MdCelebration',
  'event': 'BiSolidParty'
};

// Función para obtener la clave del icono por nombre
export const getIconKeyByName = (iconName) => {
  return iconMap[iconName] || 'FaHourglassHalf';
};

// Lista de iconos para mostrar en el formulario de creación
export const getDefaultIcons = () => [
  { name: 'Pastel', key: 'FaBirthdayCake', type: 'birthday' },
  { name: 'Fiesta', key: 'GiPartyPopper', type: 'party' },
  { name: 'Regalo', key: 'FaGift', type: 'gift' },
  { name: 'Reloj', key: 'FaHourglassHalf', type: 'hourglass' },
  { name: 'Corazón', key: 'FaHeart', type: 'love' },
  { name: 'Cohete', key: 'FaRocket', type: 'rocket' },
  { name: 'Celebración', key: 'MdCelebration', type: 'celebration' },
  { name: 'Navidad', key: 'FaSnowman', type: 'christmas' },
  { name: 'Evento', key: 'BiSolidParty', type: 'event' }
];
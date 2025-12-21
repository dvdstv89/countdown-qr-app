import React from 'react';
import { FaBirthdayCake, FaGift, FaHeart, FaRocket, FaHourglassHalf, FaSnowman } from 'react-icons/fa';
import { MdCelebration } from "react-icons/md";
import { GiPartyPopper } from "react-icons/gi";
import { BiSolidParty } from "react-icons/bi";

// Mapeo de claves a componentes reales
const iconComponents = {
  'FaBirthdayCake': FaBirthdayCake,
  'GiPartyPopper': GiPartyPopper,
  'FaGift': FaGift,
  'FaHourglassHalf': FaHourglassHalf,
  'FaHeart': FaHeart,
  'FaRocket': FaRocket,
  'MdCelebration': MdCelebration,
  'FaSnowman': FaSnowman,
  'BiSolidParty': BiSolidParty
};

const IconRenderer = ({ 
  iconKey = 'FaHourglassHalf', 
  color = 'currentColor', 
  size = '1.5em', 
  className = '',
  animate = false 
}) => {
  const IconComponent = iconComponents[iconKey] || FaHourglassHalf;
  
  return (
    <div className={`inline-flex items-center justify-center ${animate ? 'animate-float' : ''} ${className}`}>
      <IconComponent style={{ color, fontSize: size }} />
    </div>
  );
};

export default IconRenderer;
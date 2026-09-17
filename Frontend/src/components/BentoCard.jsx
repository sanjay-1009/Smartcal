import React from 'react';
import { motion } from 'framer-motion';

export const BentoCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false,
  title,
  subtitle,
  icon: Icon,
  action,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`glass-card p-5 sm:p-6 flex flex-col relative overflow-hidden ${
        glow ? 'shadow-glass-glow border-[#B9B28A]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#B9B28A]/30">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-[#504B38] text-[#F8F3D9] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#EBE5C2]" />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-sm sm:text-base text-[#504B38] leading-tight">{title}</h3>}
              {subtitle && <p className="text-[11px] text-[#8C8563] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

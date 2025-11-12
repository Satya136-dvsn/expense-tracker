import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, stagger } from '../../utils/animations';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={stagger()}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0 }}
    >
      <motion.div variants={fadeIn}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;

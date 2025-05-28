import { useTranslation } from 'react-i18next';
import iconBrasil from './../../assets/icons8-brasil-48.png';
import iconEua from './../../assets/icons8-eua-48.png';
import iconSpain from './../../assets/icons8-espanha-2-48.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { IoLanguage } from 'react-icons/io5';
import './traductionButton.css';

const TraductionButton = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    })
  };

  return (
    <>
      <motion.button
        className="language-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 180 : 0,
          backgroundColor: isOpen ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <IoLanguage className="text-white text-2xl" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className='container-icons-traduction'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              variants={buttonVariants}
              custom={0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="language-button"
              onClick={() => changeLanguage('en')}
            >
              <img src={iconEua} alt="English" className="w-8 h-8" />
              <span className="language-text">EN</span>
            </motion.button>

            <motion.button
              variants={buttonVariants}
              custom={1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="language-button"
              onClick={() => changeLanguage('es')}
            >
              <img src={iconSpain} alt="Spanish" className="w-8 h-8" />
              <span className="language-text">ES</span>
            </motion.button>

            <motion.button
              variants={buttonVariants}
              custom={2}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="language-button"
              onClick={() => changeLanguage('pt-BR')}
            >
              <img src={iconBrasil} alt="Portuguese" className="w-8 h-8" />
              <span className="language-text">PT-BR</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TraductionButton;

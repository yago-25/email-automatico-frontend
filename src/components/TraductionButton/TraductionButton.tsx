import { useTranslation } from 'react-i18next';
import iconBrasil from './../../assets/icons8-brasil-48.png';
import iconEua from './../../assets/icons8-eua-48.png';
import iconSpain from './../../assets/icons8-espanha-2-48.png';
import './traductionButton.css';

const TraductionButton = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className='container-icons-traduction'>
      <img 
        src={iconEua} 
        alt="English" 
        onClick={() => changeLanguage('en')} 
      />
      <img 
        src={iconSpain} 
        alt="Spanish" 
        onClick={() => changeLanguage('es')} 
      />
      <img 
        src={iconBrasil} 
        alt="Portuguese" 
        onClick={() => changeLanguage('pt-BR')} 
      />
    </div>
  );
};

export default TraductionButton;

import React from 'react';
import { Select } from 'antd';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectClientProps {
  options: Option[];               // Aceitar a lista de opções
  value: string[];                 // O valor agora será um array de strings (IDs dos clientes)
  onChange: (value: string[]) => void;  // onChange vai retornar um array de strings
  placeholder: string;
}

const MultiSelectClient: React.FC<MultiSelectClientProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder 
}) => {
  return (
    <div>
      <Select
        mode="multiple"           // Permite a seleção múltipla
        options={options}         // Passa as opções para o Select
        value={value}             // Passa os clientes selecionados
        onChange={onChange}       // Passa a função para atualizar os clientes selecionados
        placeholder={placeholder} // Placeholder do Select
        style={{ width: '100%' }}  // Garante que o Select ocupe toda a largura disponível
      />
    </div>
  );
};

export default MultiSelectClient;

import React from 'react';
import { Select } from 'antd';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectClientProps {
  options: Option[];               
  value: string[];                 
  onChange: (value: string[]) => void; 
  placeholder: string;
  onSearch: (e:any) => void;
}

const MultiSelectClient: React.FC<MultiSelectClientProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder,
  onSearch
}) => {
  console.log(options, "escreve alguma coisa na frente")
  return (
    <div>
      <Select
        mode="multiple"           
        options={options}        
        value={value}             
        onChange={onChange} 
        onSearch={onSearch}      
        placeholder={placeholder} 
        style={{ width: '100%' }}  
      />
    </div>
  );
};

export default MultiSelectClient;

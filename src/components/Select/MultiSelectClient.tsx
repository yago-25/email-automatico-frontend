import React from 'react';
import { Select } from 'antd';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectClientProps {

  showSearch?: boolean;
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
  showSearch = true,
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
        placeholder={placeholder}
        style={{ width: '100%', height: '40px', display: 'flex',  }}
        allowClear
        showSearch={showSearch}
        onSearch={onSearch}
      />
    </div>
  );
};

export default MultiSelectClient;

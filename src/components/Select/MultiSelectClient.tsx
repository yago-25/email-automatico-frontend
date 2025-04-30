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
  showSearch?: boolean;
}

const MultiSelectClient: React.FC<MultiSelectClientProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder,
  showSearch = true
}) => {
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
      />
    </div>
  );
};

export default MultiSelectClient;

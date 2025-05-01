import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

interface Option {
  label: string;
  value: string;
  mail?: string;
}

interface MultiSelectClientProps {
  showSearch?: boolean;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  onSearch?: (e: string) => void;
}

const MultiSelectClient: React.FC<MultiSelectClientProps> = ({
  options,
  value,
  onChange,
  placeholder,
  showSearch = true,
  onSearch,
}) => {
  return (
    <Select
      mode="multiple"
      options={options as SelectProps['options']}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: '100%' }}
      allowClear
      showSearch={showSearch}
      onSearch={onSearch}
      filterOption={false}
      className="mt-1 bg-gray-100 rounded-md text-gray-700"
    />
  );
};

export default MultiSelectClient;

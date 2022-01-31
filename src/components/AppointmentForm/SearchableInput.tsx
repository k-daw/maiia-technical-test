import React, { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import { Controller } from 'react-hook-form';

// ---- External Imports ----
import config from 'config';
import MenuList from '../MenuList';
// ---- Local imports ----

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

interface SearchableInputProps {
  name: string;
  apiPath: string;
  control: any;
  optionsNormalizer: CallableFunction;
  errors: unknown;
  isRested: boolean;
  onFormChangeHandler?: CallableFunction;
  query?: string;
}

const SearchableInput = (props: SearchableInputProps) => {
  const {
    name,
    apiPath,
    query,
    control,
    isRested,
    optionsNormalizer,
    onFormChangeHandler,
  } = props;

  const [options, setOptions] = useState([]);

  let selectRef = null;

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `${SERVER_API_ENDPOINT}/${apiPath}${query ?? ''}`,
      );
      const parsedResponse = await response.json();
      const options = parsedResponse.map((entry) => optionsNormalizer(entry));
      setOptions(options);
    }
    fetchData();
  }, [apiPath, query]);

  useEffect(() => {
    if (isRested) {
      selectRef.clearValue();
    }
  }, [isRested]);

  const onChangeHandler = useCallback(() => {
    onFormChangeHandler?.();
  }, [onFormChangeHandler]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      render={({ field: { onChange } }) => (
        <Select
          ref={(ref) => {
            selectRef = ref;
          }}
          components={{ MenuList }}
          options={options}
          isClearable
          isSearchable={true}
          onChange={(val) => {
            onChange(val?.value);
            onChangeHandler?.();
          }}
          className="react-dropdown"
          classNamePrefix="dropdown"
        />
      )}
    />
  );
};

const areEqual = (prevProps, nextProps) => {
  const { name, isRested, query } = prevProps;
  return (
    name === nextProps.name &&
    isRested === nextProps.isRested &&
    query === nextProps.query
  );
};

export default React.memo(SearchableInput, areEqual);

import { useCallback, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { updateTimestamp } from 'store/appointments';
// ---- External Imports ----
import config from 'config';
import SearchableInput from './SearchableInput';
// ---- Local imports ----

const SERVER_API_ENDPOINT = config.get(
  'SERVER_API_ENDPOING',
  '/api/appointments',
);

interface IFormInputs {
  practitionerId: number;
  patientId: number;
  timeSlot: string;
  singleErrorInput: string;
}

const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
  const [startDate, endDate] = data['timeSlotId'].split(',');
  const reqData = {
    practitionerId: data['practitionerId'],
    patientId: data['patientId'],
    startDate,
    endDate,
  };

  const requestOptions = {
    method: 'POST',
    body: JSON.stringify(reqData),
  };

  const response = await fetch(SERVER_API_ENDPOINT, requestOptions);

  console.log(response.json());
};

const AppointmentForm = () => {
  const {
    control,
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    getValues,
    reset,
  } = useForm<IFormInputs>();

  const [shouldReset, setShouldReset] = useState(false);
  const [practitionerId, setPractitionerId] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSubmitSuccessful) {
      setShouldReset(true);
      dispatch(updateTimestamp());
      reset();
    } else {
      setShouldReset(false);
    }
  }, [isSubmitSuccessful, reset]);

  const onPractitionerInputChange = useCallback(() => {
    setPractitionerId(getValues('practitionerId') ?? null);
  }, []);

  const nameFieldOptionNormalizer = useCallback((entry) => {
    return { value: entry.id, label: `${entry.firstName} ${entry.lastName}` };
  }, []);

  const availabilitiesOptionNormalizer = useCallback((entry) => {
    return {
      value: `${entry.startDate},${entry.endDate}`,
      label: `${entry.startDate} ==> ${entry.endDate}`,
    };
  }, []);

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Practitioners</h2>
        <SearchableInput
          name="practitionerId"
          apiPath="practitioners"
          control={control}
          isRested={shouldReset}
          errors={errors}
          optionsNormalizer={nameFieldOptionNormalizer}
          onFormChangeHandler={onPractitionerInputChange}
        />
        {errors.practitionerId && errors.practitionerId.type === 'required' ? (
          <span>This is required</span>
        ) : (
          <br />
        )}
        <h2>Patients</h2>
        <SearchableInput
          name="patientId"
          apiPath="patients"
          isRested={shouldReset}
          errors={errors}
          control={control}
          optionsNormalizer={nameFieldOptionNormalizer}
        />
        {errors.patientId && errors.patientId.type === 'required' ? (
          <span>This is required</span>
        ) : (
          <br />
        )}
        {practitionerId && (
          <>
            <h2>Availabilities</h2>
            <SearchableInput
              apiPath="availabilities"
              name="timeSlot"
              isRested={shouldReset}
              errors={errors}
              query={`?practitionerId=${practitionerId}`}
              control={control}
              optionsNormalizer={availabilitiesOptionNormalizer}
            />
            {errors.timeSlot && errors.timeSlot.type === 'required' ? (
              <span>This is required</span>
            ) : (
              <br />
            )}
          </>
        )}
        <input type="submit" style={{ display: 'block' }} />
      </form>
    </div>
  );
};

export default AppointmentForm;

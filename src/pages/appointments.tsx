import AppointmentForm from 'components/AppointmentForm';
import AppointmentList from 'components/AppointmentList';

const AppointmentsPage = () => {
  return (
    <>
      <AppointmentForm />
      <AppointmentList />
    </>
  );
};

AppointmentsPage.pageTitle = 'Appointments';
AppointmentsPage.pageSubtitle = "Let's get to work 👩‍💻";

export default AppointmentsPage;

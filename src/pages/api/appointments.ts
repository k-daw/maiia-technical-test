import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'prisma/client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      let appointments;
      let appointmentsCount = 0;
      const pageSize = Number(req.query.pageSize);
      const skip = Number(req.query.skip);
      const searchTerm = req.query?.searchTerm as string;
      const filterBy = req.query?.filterBy as string;

      if (searchTerm !== 'null' && filterBy !== 'null') {
        let entries;
        if (filterBy === 'practitioner') {
          entries = await prisma.practitioner.findMany({
            where: {
              OR: [
                {
                  firstName: {
                    startsWith: searchTerm,
                  },
                },
                {
                  lastName: {
                    startsWith: searchTerm,
                  },
                },
              ],
            },
          });
          const ids = entries.map((entry) => entry.id);

          appointments = await prisma.appointment.findMany({
            where: { practitionerId: { in: ids } },
          });
        }
        if (filterBy === 'patient') {
          entries = await prisma.patient.findMany({
            where: {
              OR: [
                {
                  firstName: {
                    startsWith: searchTerm,
                  },
                },
                {
                  lastName: {
                    startsWith: searchTerm,
                  },
                },
              ],
            },
          });
          const ids = entries.map((entry) => entry.id);
          appointments = await prisma.appointment.findMany({
            where: { patientId: { in: ids } },
          });
        }
        appointmentsCount = appointments.length;
      } else if (pageSize === -1) {
        appointments = await prisma.appointment.findFirst({
          take: -1,
        });
        appointments = [appointments];
      } else {
        appointments = await prisma.appointment.findMany({
          skip: skip,
          take: -1 * pageSize,
        });
      }
      appointmentsCount = await prisma.appointment.count();
      const practitionersId = appointments.map((app) => app.practitionerId);
      const patientsId = appointments.map((app) => app.patientId);

      const patients = await prisma.patient.findMany({
        where: { id: { in: patientsId } },
      });

      const practitioners = await prisma.practitioner.findMany({
        where: { id: { in: practitionersId } },
      });

      appointments = appointments.map((app) => {
        const patient = patients.filter(
          (patient) => patient.id === app.patientId,
        )[0];
        const practitioner = practitioners.filter(
          (practitioner) => practitioner.id === app.practitionerId,
        )[0];

        return {
          patient: `${patient.firstName} ${patient.lastName}`,
          practitioner: `${practitioner.firstName} ${practitioner.lastName}`,
          ...app,
        };
      });
      appointments.reverse();
      res.status(200).json({ appointments, appointmentsCount });
      break;
    case 'POST':
      const { patientId, practitionerId, startDate, endDate } = JSON.parse(
        req.body,
      );
      const appointment = await prisma.appointment.create({
        data: {
          patientId: parseInt(patientId),
          practitionerId: parseInt(practitionerId),
          startDate: startDate,
          endDate: endDate,
        },
      });
      res.status(200).json(appointment);
      break;
  }
};

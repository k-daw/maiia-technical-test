import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'prisma/client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const allAvailabilities = await prisma.availability.findMany({
    where: { practitionerId: +req.query.practitionerId },
  });

  const bookedAppointmentDates = await prisma.appointment.findMany({
    where: { practitionerId: +req.query.practitionerId },
    select: { startDate: true, practitionerId: true },
  });

  const bookedTimeslots = bookedAppointmentDates.map((entry) =>
    entry.startDate.getTime(),
  );

  const availabilities = allAvailabilities.filter((entry) => {
    return !bookedTimeslots.includes(entry.startDate.getTime());
  });

  res.status(200).json(availabilities);
};

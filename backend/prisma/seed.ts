import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean existing data (order matters due to foreign keys) ──────────────
  await prisma.auditLog.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.careUnit.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────
  const [nursePassword, pharmacistPassword, adminPassword] = await Promise.all([
    bcrypt.hash('nurse123', 10),
    bcrypt.hash('pharmacist123', 10),
    bcrypt.hash('admin123', 10),
  ]);

  await Promise.all([
    prisma.user.create({
      data: { name: 'Anna Lindgren', email: 'nurse@meditrack.se', password: nursePassword, role: 'Sjukskoterska' },
    }),
    prisma.user.create({
      data: { name: 'Erik Svensson', email: 'pharmacist@meditrack.se', password: pharmacistPassword, role: 'Apotekare' },
    }),
    prisma.user.create({
      data: { name: 'Admin', email: 'admin@meditrack.se', password: adminPassword, role: 'Admin' },
    }),
  ]);
  console.log('✅ Users created');

  // ─── Care Units ───────────────────────────────────────────────────────────
  const [avd1A, avd2B, akuten, iva, barnmed] = await Promise.all([
    prisma.careUnit.create({ data: { name: 'Avdelning 1A – Medicin' } }),
    prisma.careUnit.create({ data: { name: 'Avdelning 2B – Kirurgi' } }),
    prisma.careUnit.create({ data: { name: 'Akutmottagningen' } }),
    prisma.careUnit.create({ data: { name: 'Intensivvårdsavdelningen' } }),
    prisma.careUnit.create({ data: { name: 'Barnmedicin' } }),
  ]);
  console.log('✅ Care units created');

  // ─── Medications ──────────────────────────────────────────────────────────
  const [
    alvedon, morfin, ipren, kavepenin, fragmin, metformin, furosemid, warfarin,
    amoxicillin, omeprazol, losartan, simvastatin, oxynorm, betapred, diklofenak, paracetamolMixtur,
  ] = await Promise.all([
    prisma.medication.create({
      data: { name: 'Alvedon', atcCode: 'N02BE01', form: 'Tablett', strength: '500 mg', stockBalance: 200, threshold: 50 },
    }),
    prisma.medication.create({
      data: { name: 'Morfin', atcCode: 'N02AA01', form: 'Injektion', strength: '10 mg/ml', stockBalance: 45, threshold: 20 },
    }),
    prisma.medication.create({
      data: { name: 'Ipren', atcCode: 'M01AE01', form: 'Tablett', strength: '400 mg', stockBalance: 150, threshold: 40 },
    }),
    prisma.medication.create({
      data: { name: 'Kåvepenin', atcCode: 'J01CE01', form: 'Oral lösning', strength: '125 mg/5 ml', stockBalance: 60, threshold: 15 },
    }),
    prisma.medication.create({
      data: { name: 'Fragmin', atcCode: 'B01AB04', form: 'Injektionslösning', strength: '2500 IE/0,2 ml', stockBalance: 30, threshold: 10 },
    }),
    prisma.medication.create({
      data: { name: 'Metformin', atcCode: 'A10BA02', form: 'Tablett', strength: '500 mg', stockBalance: 18, threshold: 50 }, // below threshold
    }),
    prisma.medication.create({
      data: { name: 'Furosemid', atcCode: 'C03CA01', form: 'Tablett', strength: '40 mg', stockBalance: 85, threshold: 30 },
    }),
    prisma.medication.create({
      data: { name: 'Warfarin', atcCode: 'B01AA03', form: 'Tablett', strength: '5 mg', stockBalance: 110, threshold: 25 },
    }),
    prisma.medication.create({
      data: { name: 'Amoxicillin', atcCode: 'J01CA04', form: 'Kapsel', strength: '500 mg', stockBalance: 12, threshold: 40 }, // below threshold
    }),
    prisma.medication.create({
      data: { name: 'Omeprazol', atcCode: 'A02BC01', form: 'Kapsel', strength: '20 mg', stockBalance: 95, threshold: 30 },
    }),
    prisma.medication.create({
      data: { name: 'Losartan', atcCode: 'C09CA01', form: 'Tablett', strength: '50 mg', stockBalance: 130, threshold: 35 },
    }),
    prisma.medication.create({
      data: { name: 'Simvastatin', atcCode: 'C10AA01', form: 'Tablett', strength: '20 mg', stockBalance: 8, threshold: 30 }, // below threshold
    }),
    prisma.medication.create({
      data: { name: 'OxyNorm', atcCode: 'N02AA05', form: 'Oral lösning', strength: '5 mg/ml', stockBalance: 22, threshold: 10 },
    }),
    prisma.medication.create({
      data: { name: 'Betapred', atcCode: 'H02AB02', form: 'Tablett', strength: '0,5 mg', stockBalance: 75, threshold: 20 },
    }),
    prisma.medication.create({
      data: { name: 'Diklofenak', atcCode: 'M01AB05', form: 'Tablett', strength: '50 mg', stockBalance: 60, threshold: 25 },
    }),
    prisma.medication.create({
      data: { name: 'Paracetamol mixtur', atcCode: 'N02BE01', form: 'Oral lösning', strength: '24 mg/ml', stockBalance: 18, threshold: 20 }, // below threshold
    }),
  ]);
  console.log('✅ Medications created');

  // ─── Orders ───────────────────────────────────────────────────────────────
  // One order per status so the frontend order list shows a realistic spread.

  // Levererad — already delivered, stock would have been updated at delivery
  await prisma.order.create({
    data: {
      careUnitId:  avd1A.id,
      status:      'Levererad',
      deliveredAt: new Date('2026-03-01T11:30:00Z'),
      createdAt:   new Date('2026-03-01T09:12:00Z'),
      lines: {
        create: [
          {
            medicationId:   alvedon.id,
            medicationName: alvedon.name,
            form:           alvedon.form,
            strength:       alvedon.strength,
            quantity:       200,
          },
          {
            medicationId:   ipren.id,
            medicationName: ipren.name,
            form:           ipren.form,
            strength:       ipren.strength,
            quantity:       100,
          },
        ],
      },
    },
  });

  // Bekräftad — confirmed, awaiting delivery
  await prisma.order.create({
    data: {
      careUnitId: avd2B.id,
      status:     'Bekräftad',
      createdAt:  new Date('2026-03-03T13:45:00Z'),
      lines: {
        create: [
          {
            medicationId:   morfin.id,
            medicationName: morfin.name,
            form:           morfin.form,
            strength:       morfin.strength,
            quantity:       30,
          },
          {
            medicationId:   fragmin.id,
            medicationName: fragmin.name,
            form:           fragmin.form,
            strength:       fragmin.strength,
            quantity:       50,
          },
        ],
      },
    },
  });

  // Skickad — sent, awaiting confirmation
  await prisma.order.create({
    data: {
      careUnitId: akuten.id,
      status:     'Skickad',
      createdAt:  new Date('2026-03-05T08:30:00Z'),
      lines: {
        create: [
          {
            medicationId:   alvedon.id,
            medicationName: alvedon.name,
            form:           alvedon.form,
            strength:       alvedon.strength,
            quantity:       300,
          },
          {
            medicationId:   kavepenin.id,
            medicationName: kavepenin.name,
            form:           kavepenin.form,
            strength:       kavepenin.strength,
            quantity:       20,
          },
          {
            medicationId:   furosemid.id,
            medicationName: furosemid.name,
            form:           furosemid.form,
            strength:       furosemid.strength,
            quantity:       60,
          },
        ],
      },
    },
  });

  // Utkast — draft, not yet sent
  await prisma.order.create({
    data: {
      careUnitId: avd1A.id,
      status:     'Utkast',
      createdAt:  new Date('2026-03-08T11:00:00Z'),
      lines: {
        create: [
          {
            medicationId:   warfarin.id,
            medicationName: warfarin.name,
            form:           warfarin.form,
            strength:       warfarin.strength,
            quantity:       90,
          },
        ],
      },
    },
  });

  // Utkast — another draft from a different unit
  await prisma.order.create({
    data: {
      careUnitId: iva.id,
      status:     'Utkast',
      createdAt:  new Date('2026-03-10T14:22:00Z'),
      lines: {
        create: [
          {
            medicationId:   morfin.id,
            medicationName: morfin.name,
            form:           morfin.form,
            strength:       morfin.strength,
            quantity:       15,
          },
          {
            medicationId:   metformin.id,
            medicationName: metformin.name,
            form:           metformin.form,
            strength:       metformin.strength,
            quantity:       120,
          },
        ],
      },
    },
  });

  // Skickad — from Barnmedicin
  await prisma.order.create({
    data: {
      careUnitId: barnmed.id,
      status:     'Skickad',
      createdAt:  new Date('2026-03-11T09:05:00Z'),
      lines: {
        create: [
          { medicationId: kavepenin.id, medicationName: kavepenin.name, form: kavepenin.form, strength: kavepenin.strength, quantity: 40 },
          { medicationId: alvedon.id,   medicationName: alvedon.name,   form: alvedon.form,   strength: alvedon.strength,   quantity: 150 },
        ],
      },
    },
  });

  // Levererad — IVA, older order
  await prisma.order.create({
    data: {
      careUnitId:  iva.id,
      status:      'Levererad',
      deliveredAt: new Date('2026-02-20T14:00:00Z'),
      createdAt:   new Date('2026-02-19T10:30:00Z'),
      lines: {
        create: [
          { medicationId: morfin.id,   medicationName: morfin.name,   form: morfin.form,   strength: morfin.strength,   quantity: 25 },
          { medicationId: fragmin.id,  medicationName: fragmin.name,  form: fragmin.form,  strength: fragmin.strength,  quantity: 60 },
          { medicationId: betapred.id, medicationName: betapred.name, form: betapred.form, strength: betapred.strength, quantity: 50 },
        ],
      },
    },
  });

  // Levererad — Akutmottagningen, older order
  await prisma.order.create({
    data: {
      careUnitId:  akuten.id,
      status:      'Levererad',
      deliveredAt: new Date('2026-02-25T11:00:00Z'),
      createdAt:   new Date('2026-02-24T08:00:00Z'),
      lines: {
        create: [
          { medicationId: omeprazol.id,  medicationName: omeprazol.name,  form: omeprazol.form,  strength: omeprazol.strength,  quantity: 80 },
          { medicationId: diklofenak.id, medicationName: diklofenak.name, form: diklofenak.form, strength: diklofenak.strength, quantity: 40 },
        ],
      },
    },
  });

  // Bekräftad — Barnmedicin
  await prisma.order.create({
    data: {
      careUnitId: barnmed.id,
      status:     'Bekräftad',
      createdAt:  new Date('2026-03-12T10:15:00Z'),
      lines: {
        create: [
          { medicationId: paracetamolMixtur.id, medicationName: paracetamolMixtur.name, form: paracetamolMixtur.form, strength: paracetamolMixtur.strength, quantity: 30 },
          { medicationId: amoxicillin.id,       medicationName: amoxicillin.name,       form: amoxicillin.form,       strength: amoxicillin.strength,       quantity: 60 },
        ],
      },
    },
  });

  // Skickad — Avdelning 2B
  await prisma.order.create({
    data: {
      careUnitId: avd2B.id,
      status:     'Skickad',
      createdAt:  new Date('2026-03-13T07:50:00Z'),
      lines: {
        create: [
          { medicationId: losartan.id,    medicationName: losartan.name,    form: losartan.form,    strength: losartan.strength,    quantity: 100 },
          { medicationId: simvastatin.id, medicationName: simvastatin.name, form: simvastatin.form, strength: simvastatin.strength, quantity: 80 },
          { medicationId: warfarin.id,    medicationName: warfarin.name,    form: warfarin.form,    strength: warfarin.strength,    quantity: 50 },
        ],
      },
    },
  });

  // Utkast — IVA, pain management
  await prisma.order.create({
    data: {
      careUnitId: iva.id,
      status:     'Utkast',
      createdAt:  new Date('2026-03-14T15:30:00Z'),
      lines: {
        create: [
          { medicationId: oxynorm.id, medicationName: oxynorm.name, form: oxynorm.form, strength: oxynorm.strength, quantity: 10 },
          { medicationId: morfin.id,  medicationName: morfin.name,  form: morfin.form,  strength: morfin.strength,  quantity: 20 },
        ],
      },
    },
  });

  // Utkast — Avdelning 1A
  await prisma.order.create({
    data: {
      careUnitId: avd1A.id,
      status:     'Utkast',
      createdAt:  new Date('2026-03-15T08:20:00Z'),
      lines: {
        create: [
          { medicationId: metformin.id,  medicationName: metformin.name,  form: metformin.form,  strength: metformin.strength,  quantity: 150 },
          { medicationId: omeprazol.id,  medicationName: omeprazol.name,  form: omeprazol.form,  strength: omeprazol.strength,  quantity: 60 },
        ],
      },
    },
  });

  // Levererad — Avdelning 2B, recent
  await prisma.order.create({
    data: {
      careUnitId:  avd2B.id,
      status:      'Levererad',
      deliveredAt: new Date('2026-03-10T13:00:00Z'),
      createdAt:   new Date('2026-03-09T09:00:00Z'),
      lines: {
        create: [
          { medicationId: furosemid.id, medicationName: furosemid.name, form: furosemid.form, strength: furosemid.strength, quantity: 120 },
          { medicationId: ipren.id,     medicationName: ipren.name,     form: ipren.form,     strength: ipren.strength,     quantity: 80 },
        ],
      },
    },
  });

  console.log('✅ Orders and order lines created');
  console.log('🎉 Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

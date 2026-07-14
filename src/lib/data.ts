import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

export interface ScheduleStop {
  day: string;
  date: string;
  location: string;
  time: string;
}

export interface MenuItem {
  section: 'staple' | 'special';
  name: string;
  description: string;
  price: { label: string; price: number }[];
}

const dataDir = path.resolve(process.cwd(), 'data');

export function getSchedule(): ScheduleStop[] {
  const raw = fs.readFileSync(path.join(dataDir, 'schedule.yaml'), 'utf-8');
  const parsed = load(raw) as { stops: ScheduleStop[] };
  return parsed.stops;
}

export function getMenu(): MenuItem[] {
  const raw = fs.readFileSync(path.join(dataDir, 'menu.yaml'), 'utf-8');
  const parsed = load(raw) as { items: MenuItem[] };
  return parsed.items;
}

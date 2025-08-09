export type Msg = {
  id: string;
  source: 'gmail' | 'slack';
  from: string;
  subject?: string;
  text: string;
  ts: number; // ms
};

export function score(msg: Msg) {
  let s = 0;
  const t = (msg.text + ' ' + (msg.subject ?? '')).toLowerCase();
  if (t.includes('urgent')) s += 10;
  if (t.includes('?')) s += 5;
  // newer slightly higher
  s += Math.min(5, (Date.now() - msg.ts) / (1000 * 60 * 60 * 24) * -0.5);
  return s;
}

export function prioritize(msgs: Msg[]) {
  return [...msgs].sort((a, b) => score(b) - score(a));
}



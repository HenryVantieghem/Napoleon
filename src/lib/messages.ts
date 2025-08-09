import { prioritize, type Msg } from './priority';

function daysAgo(n: number) { return Date.now() - n * 24 * 60 * 60 * 1000; }

const MOCK: Msg[] = [
  { id: 'g1', source: 'gmail', from: 'ceo@bigco.com', subject: 'Board deck?', text: 'Can you send the final board deck?', ts: daysAgo(1) },
  { id: 's1', source: 'slack', from: 'COO (Slack)', text: 'URGENT: Need ARR figure before 3pm', ts: daysAgo(0.5) },
  { id: 'g2', source: 'gmail', from: 'hr@partner.com', subject: 'Onsite logistics', text: 'Confirm visitor badges.', ts: daysAgo(3) },
  { id: 's2', source: 'slack', from: 'EA (Slack)', text: 'Lunch moved to 1:15pm — ok?', ts: daysAgo(0.2) },
  { id: 'g3', source: 'gmail', from: 'cto@bigco.com', subject: 'Security review', text: 'No blockers. Ship when ready.', ts: daysAgo(2) },
];

export function getMessages() {
  const sevenDays = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return prioritize(MOCK.filter(m => m.ts >= sevenDays));
}



import axios from 'axios';
import { API_BASE_URL, CURRENT_USER_ID } from '../constants/config';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-user-id': CURRENT_USER_ID,
  },
});

export async function fetchCompetitionDetails(competitionId) {
  const res = await client.get(`/competitions/${competitionId}`);
  return res.data; // { competition, state, userRegistration }
}

export async function registerForCompetition(competitionId) {
  const res = await client.post(`/competitions/${competitionId}/register`);
  return res.data;
}

export async function submitEntry(competitionId, submissionUrl) {
  const res = await client.post(`/competitions/${competitionId}/submit`, {
    submissionUrl,
  });
  return res.data;
}
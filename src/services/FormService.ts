import axios from 'axios';
import { type Form, FormType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const FormService = {
  async getForm(eventId: string, type: FormType) {
    const response = await axios.get(`${API_URL}/events/${eventId}/forms/${type}`);
    return response.data;
  },

  async createForm(eventId: string, form: Form) {
    const response = await axios.post(`${API_URL}/events/${eventId}/forms`, form);
    return response.data;
  },

  async updateForm(eventId: string, type: FormType, form: Partial<Form>) {
    const response = await axios.patch(`${API_URL}/events/${eventId}/forms/${type}`, form);
    return response.data;
  },

  async getResponses(eventId: string, type: FormType) {
    // TODO: When backend is ready, uncomment these lines:
    // const response = await axios.get(`${API_URL}/events/${eventId}/forms/${type}/responses`);
    // return response.data;

    // --- MOCK DATA FOR YOUR SPECIFIC EVENT & REGISTRATION FORM ---
    if (eventId === 'aa94d172-29c3-4ef0-b015-379e995c35e7' && type === 'REGISTRATION') {
      return {
        totalResponses: 10,
        responses: [
          { id: 'STU-001', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Chaiwat Prompetch' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '19' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Economics' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Extrovert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Asian' }] },
          { id: 'STU-002', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Su Su' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '18' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Software Engineering' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Introvert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Western' }] },
          { id: 'STU-003', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Min Thant Ko' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '20' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Computer Science' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Introvert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Asian' }] },
          { id: 'STU-004', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Saw Rory Yin' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '19' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Economics' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Extrovert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Western' }] },
          { id: 'STU-005', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Nadech Kugimiya' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '21' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Business Administration' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Extrovert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Asian, Western' }] },
          { id: 'STU-006', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Yaya Urassaya' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '18' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Communication Arts' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Introvert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Western' }] },
          { id: 'STU-007', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Mario Maurer' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '20' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Economics' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Extrovert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Asian' }] },
          { id: 'STU-008', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Mai Davika' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '19' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Data Science' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Introvert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Asian' }] },
          { id: 'STU-009', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Baifern Pimchanok' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '19' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Marketing' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Extrovert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Western' }] },
          { id: 'STU-010', answers: [{ formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', label: 'Name', value: 'Bright Vachirawit' }, { formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', label: 'Age', value: '20' }, { formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', label: 'Major', value: 'Economics' }, { formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', label: 'Personality', value: 'Introvert' }, { formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', label: 'Preferable Meal', value: 'Asian' }] }
        ]
      };
    }

    // Default fallback empty state for any other forms/events you click on
    return { totalResponses: 0, responses: [] };
  },

  async getResponsesSummary(eventId: string, type: FormType) {
    // TODO: When backend is ready, uncomment these lines:
    // const response = await axios.get(`${API_URL}/events/${eventId}/forms/${type}/responses/summary`);
    // return response.data;

    // --- MOCK DATA FOR YOUR SPECIFIC EVENT & REGISTRATION FORM ---
    if (eventId === 'aa94d172-29c3-4ef0-b015-379e995c35e7' && type === 'REGISTRATION') {
      return {
        totalResponses: 10,
        summary: [
          { 
            formFieldId: 'e9d03d1b-c8c9-44d7-b68c-aaf234011062', 
            label: 'Name', 
            answers: [{ value: 'Chaiwat Prompetch' }, { value: 'Su Su' }, { value: 'Min Thant Ko' }, { value: 'Saw Rory Yin' }, { value: 'Nadech Kugimiya' }, { value: 'Yaya Urassaya' }, { value: 'Mario Maurer' }, { value: 'Mai Davika' }, { value: 'Baifern Pimchanok' }, { value: 'Bright Vachirawit' }] 
          },
          { 
            formFieldId: 'b5b013d9-ed3f-47e5-86dc-28b5c09bda2c', 
            label: 'Age', 
            answers: [{ value: '19' }, { value: '18' }, { value: '20' }, { value: '19' }, { value: '21' }, { value: '18' }, { value: '20' }, { value: '19' }, { value: '19' }, { value: '20' }] 
          },
          { 
            formFieldId: '03b7d66c-41c4-4940-a3e2-006e0ddd9294', 
            label: 'Major', 
            answers: [{ value: 'Economics' }, { value: 'Software Engineering' }, { value: 'Computer Science' }, { value: 'Economics' }, { value: 'Business Administration' }, { value: 'Communication Arts' }, { value: 'Economics' }, { value: 'Data Science' }, { value: 'Marketing' }, { value: 'Economics' }] 
          },
          { 
            formFieldId: 'bf140e75-1e99-4474-a98c-967e23dae244', 
            label: 'Personality', 
            answers: [{ value: 'Extrovert' }, { value: 'Introvert' }, { value: 'Introvert' }, { value: 'Extrovert' }, { value: 'Extrovert' }, { value: 'Introvert' }, { value: 'Extrovert' }, { value: 'Introvert' }, { value: 'Extrovert' }, { value: 'Introvert' }] 
          },
          { 
            formFieldId: '06a6b049-fa8f-47f7-9921-9f2c3b9ce536', 
            label: 'Preferable Meal', 
            answers: [{ value: 'Asian' }, { value: 'Western' }, { value: 'Asian' }, { value: 'Western' }, { value: 'Asian, Western' }, { value: 'Western' }, { value: 'Asian' }, { value: 'Asian' }, { value: 'Western' }, { value: 'Asian' }] 
          }
        ]
      };
    }

    // Default fallback empty state
    return { totalResponses: 0, summary: [] };
  }, 
  
  async getFormsByEventId(eventId: string) {
    const response = await axios.get(`${API_URL}/events/${eventId}/forms`);
    return response.data;
  }
}
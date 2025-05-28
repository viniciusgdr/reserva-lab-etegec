import { User, Professor, Laboratory, TimeSlot, Reservation } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Função auxiliar para fazer requisições
const fetchAPI = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Erro na requisição: ${response.status}`);
  }

  if (response.status !== 204) {
    return response.json();
  }

  return {} as T;
};

// API de Professores
export const professorApi = {
  getAll: async (): Promise<Professor[]> => {
    return fetchAPI<Professor[]>('/professors');
  },
  
  add: async (professor: Omit<Professor, "id">): Promise<Professor> => {
    return fetchAPI<Professor>('/professors', 'POST', professor);
  },
  
  update: async (professor: Professor): Promise<Professor> => {
    return fetchAPI<Professor>(`/professors/${professor.id}`, 'PUT', professor);
  },
  
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/professors/${id}`, 'DELETE');
  }
};

// API de Laboratórios
export const laboratoryApi = {
  getAll: async (): Promise<Laboratory[]> => {
    return fetchAPI<Laboratory[]>('/laboratories');
  },
  
  add: async (laboratory: Omit<Laboratory, "id">): Promise<Laboratory> => {
    return fetchAPI<Laboratory>('/laboratories', 'POST', laboratory);
  },
  
  update: async (laboratory: Laboratory): Promise<Laboratory> => {
    return fetchAPI<Laboratory>(`/laboratories/${laboratory.id}`, 'PUT', laboratory);
  },
  
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/laboratories/${id}`, 'DELETE');
  }
};

// API de Horários
export const timeSlotApi = {
  getAll: async (): Promise<TimeSlot[]> => {
    return fetchAPI<TimeSlot[]>('/timeSlots');
  },
  
  add: async (timeSlot: Omit<TimeSlot, "id">): Promise<TimeSlot> => {
    return fetchAPI<TimeSlot>('/timeSlots', 'POST', timeSlot);
  },
  
  update: async (timeSlot: TimeSlot): Promise<TimeSlot> => {
    return fetchAPI<TimeSlot>(`/timeSlots/${timeSlot.id}`, 'PUT', timeSlot);
  },
  
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/timeSlots/${id}`, 'DELETE');
  }
};

// API de Reservas
export const reservationApi = {
  getAll: async (): Promise<Reservation[]> => {
    return fetchAPI<Reservation[]>('/reservations');
  },
  
  add: async (reservation: Omit<Reservation, "id" | "createdAt">): Promise<Reservation> => {
    return fetchAPI<Reservation>('/reservations', 'POST', reservation);
  },
  
  update: async (reservationId: string, status: "active" | "cancelled"): Promise<Reservation> => {
    return fetchAPI<Reservation>(`/reservations/${reservationId}`, 'PUT', { status });
  }
};

// API de Usuário
export const userApi = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      return await fetchAPI<User>('/users/me');
    } catch {
      return null;
    }
  },
  
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    return fetchAPI<User>('/auth/login', 'POST', credentials);
  },
  
  logout: async (): Promise<void> => {
    return fetchAPI<void>('/auth/logout', 'POST');
  }
};

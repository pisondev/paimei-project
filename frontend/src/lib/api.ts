// frontend/src/lib/api.ts

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/api' 
  : 'https://paimei-api.tierratie.com/api'; // Ganti dengan URL backend-mu nanti

// Fungsi untuk mengambil token dari Cookie Browser
const getAuthToken = () => {
  if (typeof document !== 'undefined') {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('paimei_session='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
  return null;
};

// Fungsi Fetch Terpusat
export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // PERBAIKAN: Jangan lempar ke halaman login jika endpoint-nya memang "/login"!
  // Biarkan halaman page.tsx yang menangani pesan error "Password salah" dll.
  if (response.status === 401 && !endpoint.includes('/login')) {
    if (typeof window !== 'undefined') {
      document.cookie = 'paimei_session=; Max-Age=0; path=/'; 
      window.location.href = '/'; 
    }
  }

  return response;
};
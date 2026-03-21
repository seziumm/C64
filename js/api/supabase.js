/* js/api/supabase.js
 * Thin Supabase REST client.
 * Exposes only the endpoints the app needs.
 */

const DB = (() => {
  const BASE_URL = 'https://axskiojmvkbdayrajcla.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4c2tpb2ptdmtiZGF5cmFqY2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODAwMDAsImV4cCI6MjA4OTM1NjAwMH0.WHqrFPstLZuGc_eyHGMVMUyh0xynFeUZY9XOG885YrI';

  const HEADERS = {
    'Content-Type': 'application/json',
    'apikey':        ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`,
  };

  /**
   * Performs a GET request against the Supabase REST API.
   *
   * @param   {string} path  e.g. 'posts?order=created_at.desc'
   * @returns {Promise<any>}
   * @throws  {Error} on non-2xx responses
   */
  async function get(path) {
    const res = await fetch(`${BASE_URL}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  return {
    /** @returns {Promise<object[]>} */
    getPosts()    { return get('posts?order=created_at.desc');    },

    /** @returns {Promise<object[]>} */
    getProjects() { return get('projects?order=created_at.desc'); },
  };
})();

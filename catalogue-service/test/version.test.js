const axios = require('axios');

describe('Catalogue version endpoint', () => {
  test('should return version info', async () => {
    const response = await axios.get('http://localhost:3001/version');
    
    expect(response.status).toBe(200);
    expect(response.data.service).toBe('catalogue');
    expect(response.data.version).toBe('1.0.1');
  });
});



async function testRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'Password123!',
        role: 'victim'
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Register success:', data);
    } else {
      console.error('Register failed:', data);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testRegister();

'use strict';
const form = document.querySelector('form');
const login = document.getElementById('login');
const password = document.getElementById('password');
form.addEventListener('submit', loginUser);

function loginUser(event) {
  event.preventDefault();
  fetch('/api/v1/login', {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
    }, body: JSON.stringify({ login: login.value, password: password.value }),
  }).then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      alert('Invalid creds');
      throw new Error('Invalid creds');
    }
  }).then((data) => {
    localStorage.setItem('token', data.result);
    window.location = '/';
  }).catch(e => console.error(e));
}

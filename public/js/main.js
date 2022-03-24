'use strict';

const queryInput = document.getElementById('query');
const nameInput = document.getElementById('name');
const newQuery = document.getElementById('new-query');
const queriesField = document.getElementById('queries');
const token = 'Bearer ' + localStorage.getItem('token');

newQuery.addEventListener('submit', (event) => {
  event.preventDefault();
  fetch('/api/v1/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({ name: nameInput.value, query: queryInput.value }),
  })
    .then((response) => {
      if (response.status === 401) {
        window.location = '/login';
      }
      return response.json();
    })
    .then((data) => addNewQuery(data.result))
    .catch(e => console.log(e));
});

function addNewQuery(query) {
  const div = document.createElement('div');
  div.className = 'checkbox-field';
  div.title = JSON.stringify(query.query, null, 2);

  const delButton = document.createElement('button');
  delButton.innerText = 'Delete';
  delButton.className = 'btn-del';
  delButton.setAttribute('query-id', query._id);
  delButton.addEventListener('click', (event) => {
    const id = event.target.getAttribute('query-id');
    fetch(`/api/v1/query/${ id }`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': token },
    }).then((response) => {
      if (response.status === 401) {
        window.location = '/login';
      }
      queriesField.removeChild(div);
    });
  });

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = query._id;
  checkbox.checked = query.active;

  label.setAttribute('for', query._id);
  label.innerText = query.name;
  queriesField.appendChild(div);
  div.appendChild(checkbox);
  div.appendChild(label);
  div.appendChild(delButton);

  checkbox.addEventListener('change', (event) => {
    fetch('/api/v1/query', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({ active: event.target.checked, _id: event.target.id }),
    }).then((response) => {
      if (response.status === 401) {
        window.location = '/login';
      }
    }).catch(e => console.log(e));
  });
}

fetch('/api/v1/query', {
  headers: { 'Authorization': token },
})
  .then(response => {
    if (response.status === 401) {
      window.location = '/login';
    }
    return response.json();
  })
  .then(data => data.result.forEach(addNewQuery))
  .catch(e => console.log(e));

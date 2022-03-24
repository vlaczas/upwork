'use strict';

const queryInput = document.getElementById('query');
const nameInput = document.getElementById('name');
const newQuery = document.getElementById('new-query');
const queriesField = document.getElementById('queries');

newQuery.addEventListener('submit', (event) => {
  event.preventDefault();
  fetch('/api/v1/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value, query: queryInput.value }),
  })
    .then((response) => response.json())
    .then((data) => addNewQuery(data.result))
    .catch(e => console.log(e));
});

function addNewQuery(query) {
  const div = document.createElement('div');
  div.className = 'checkbox-field';
  div.title = JSON.stringify(query.query, null, 2);
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

  checkbox.addEventListener('change', (event) => {
    fetch('/api/v1/query', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: event.target.checked, _id: event.target.id }),
    }).catch(e => console.log(e));
  });
}

fetch('/api/v1/query')
  .then(response => response.json())
  .then(data => data.result.forEach(addNewQuery))
  .catch(e => console.log(e));

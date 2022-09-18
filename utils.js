function insertH2(msg) {
  const h2 = document.createElement('h2');
  h2.append(msg);
  document.body.appendChild(h2);
}

export { insertH2 };

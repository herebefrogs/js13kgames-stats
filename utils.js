function insertTitle(nodeType, msg) {
  const title = document.createElement(nodeType);
  title.append(msg);
  document.body.appendChild(title);
}

export { insertTitle };

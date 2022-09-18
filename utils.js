function insertTitle(nodeType, msg) {
  const title = document.createElement(nodeType);
  title.append(msg);
  document.body.appendChild(title);
}

function colorsFromGroupedBarChartLegend() {
  return Array.from(document.querySelectorAll('figure div svg')).map(node => node.attributes['fill'].value);
}

export {
  colorsFromGroupedBarChartLegend,
  insertTitle
};

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.append(row);
    row.closest('div').querySelector('div').className = 'llama-info';
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}

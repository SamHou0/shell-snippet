(function(){
  const searchInput = document.getElementById('search');
  const resultsEl = document.getElementById('results');
  const titleEl = document.getElementById('detail-title');
  const bodyEl = document.getElementById('detail-body');

  let items = [];

  function renderResults(list){
    resultsEl.innerHTML = '';
    const ul = document.createElement('ul');
    list.forEach(({id, description}) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = (description || '').slice(0, 120) || id;
      btn.title = description || id;
      btn.addEventListener('click', () => loadDetail(id));
      li.appendChild(btn);
      ul.appendChild(li);
    });
    resultsEl.appendChild(ul);
  }

  async function loadIndex(){
    const res = await fetch('assets/index.json');
    items = await res.json();
    renderResults(items);
  }

  async function loadDetail(id){
    titleEl.textContent = '加载中...';
    bodyEl.textContent = '';
    const res = await fetch(`assets/snippets/${id}.json`);
    const sn = await res.json();
    titleEl.textContent = sn.description || id;
    bodyEl.textContent = sn.body || '';
  }

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = q ? items.filter(it => (it.description || '').toLowerCase().includes(q)) : items;
    renderResults(filtered);
  });

  loadIndex().catch(err => {
    resultsEl.textContent = '加载索引失败：' + err;
  });
})();

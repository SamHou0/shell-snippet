(function(){
  const searchInput = document.getElementById('search');
  const resultsEl = document.getElementById('results');
  const titleEl = document.getElementById('detail-title');
  const bodyEl = document.getElementById('detail-body');
  const copyBtn = document.getElementById('copy-btn');
  const themeToggle = document.getElementById('theme-toggle');

  // Dark Mode
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    const text = bodyEl.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = '已复制!';
      setTimeout(() => copyBtn.textContent = orig, 1500);
    });
  });

  let items = [];
  let selectedId = null;

  function renderResults(list){
    resultsEl.innerHTML = '';
    const ul = document.createElement('ul');
    list.forEach(({id, description}) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.dataset.id = id;
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
    if (id === selectedId) return;
    selectedId = id;
    document.querySelectorAll('#results button').forEach(b => {
      b.classList.toggle('selected', b.dataset.id === id);
    });
    titleEl.textContent = '加载中...';
    bodyEl.textContent = '';
    copyBtn.style.display = 'none';

    try {
      const res = await fetch(`assets/snippets/${id}.json`);
      const sn = await res.json();
      titleEl.textContent = sn.description || id;
      bodyEl.textContent = sn.body || '';
      if (sn.body) copyBtn.style.display = 'block';
    } catch (e) {
      titleEl.textContent = 'Error';
      bodyEl.textContent = e.message;
    }
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

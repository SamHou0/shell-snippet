(function(){
  const searchInput = document.getElementById('search');
  const resultsEl = document.getElementById('results');
  const detailSection = document.getElementById('detail');
  const emptyState = document.getElementById('empty-state');
  const titleEl = document.getElementById('detail-title');
  const explanationEl = document.getElementById('detail-explanation');
  const bodyEl = document.getElementById('detail-body');
  const copyBtn = document.getElementById('copy-btn');
  const editBtn = document.getElementById('edit-btn');
  const themeToggle = document.getElementById('theme-toggle');

  // Dark Mode
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    let textToCopy = currentSnippetBody;
    const textarea = bodyEl.querySelector('textarea');
    if (textarea) {
      textToCopy = textarea.value;
    }
    
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = '已复制!';
      setTimeout(() => copyBtn.textContent = orig, 1500);
    });
  });

  // Edit
  editBtn.addEventListener('click', () => {
    const isEditing = !!bodyEl.querySelector('textarea');
    if (isEditing) {
      // Reset to view mode
      renderSnippetView(currentSnippetBody);
      editBtn.textContent = 'Edit';
    } else {
      // Switch to edit mode
      bodyEl.innerHTML = '';
      const textarea = document.createElement('textarea');
      textarea.value = currentSnippetBody;
      // Auto-resize
      textarea.style.height = (currentSnippetBody.split('\n').length * 1.5 + 2) + 'rem';
      bodyEl.appendChild(textarea);
      textarea.focus();
      editBtn.textContent = 'Reset';
    }
  });

  let currentSnippetBody = '';
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

  function renderSnippetView(text) {
    bodyEl.innerHTML = '';
    if (text) {
      const ol = document.createElement('ol');
      text.split('\n').forEach(line => {
          const li = document.createElement('li');
          li.textContent = line || ' '; 
          ol.appendChild(li);
      });
      bodyEl.appendChild(ol);
    }
  }

  async function loadDetail(id){
    if (id === selectedId) return;
    selectedId = id;
    
    // Show detail, hide empty state
    detailSection.style.display = 'block';
    emptyState.style.display = 'none';

    document.querySelectorAll('#results button').forEach(b => {
      b.classList.toggle('selected', b.dataset.id === id);
    });
    titleEl.textContent = '加载中...';
    explanationEl.textContent = '';
    bodyEl.textContent = '';
    copyBtn.style.display = 'none';
    editBtn.style.display = 'none';
    editBtn.textContent = 'Edit';

    try {
      const res = await fetch(`assets/snippets/${id}.json`);
      const sn = await res.json();
      titleEl.textContent = sn.description || id;
      explanationEl.textContent = sn.explanation || '';
      
      currentSnippetBody = sn.body || '';
      
      if (currentSnippetBody) {
        renderSnippetView(currentSnippetBody);
        copyBtn.style.display = 'block';
        editBtn.style.display = 'block';
      }
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

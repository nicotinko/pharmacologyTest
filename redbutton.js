(function () {
  window.__ghButtonLoaded = true;

  function renderRedButton() {
    var host = document.getElementById('gh-test-button-host');
    if (!host) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Тестовая красная кнопка';

    btn.style.background = '#d62828';
    btn.style.color = '#fff';
    btn.style.border = '0';
    btn.style.borderRadius = '8px';
    btn.style.padding = '12px 18px';
    btn.style.fontSize = '16px';
    btn.style.fontWeight = '700';
    btn.style.cursor = 'pointer';

    btn.onclick = function () {
      alert('Кнопка отрисована, внешний JS выполнился');
    };

    host.innerHTML = '';
    host.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRedButton);
  } else {
    renderRedButton();
  }
})();
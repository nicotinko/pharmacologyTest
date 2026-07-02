(function() {
  if (document.getElementById('mg-styles')) return; // защита от повтора

  // Вставляем CSS в head
  var style = document.createElement('style');
  style.id = 'mg-styles';
  style.textContent = `
html { scrollbar-gutter: stable; }
.ab-topics-root { margin: 16px 0 32px; padding: 0; box-sizing: border-box; font-family: sans-serif; }
.ab-topics-status { font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; line-height: 1.4; margin: 0 auto 12px; padding: 10px 12px; border: 1px solid #999; border-radius: 10px; background: #fff8db; color: #222; max-width: 1200px; box-sizing: border-box; }
 .ab-topics-wrap { margin: 0 auto; max-width: 1400px; box-sizing: border-box; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; align-items: flex-start; } /* Flexbox: карточки центрируются, своей высоты */
.ab-topic-card { box-sizing: border-box; border: 1px solid #cfcfcf; border-radius: 10px; background: #ffffff !important; display: flex; flex-direction: column; flex: 0 0 320px; min-width: 318px; position: relative; z-index: 1; transition: border-radius 0.3s step-end, z-index 0.3s step-end; } /* Фиксированная ширина 320px, relative для наложения */
.ab-topic-card.ab-open { z-index: 100; border-radius: 10px 10px 0 0; transition: border-radius 0s, z-index 0s; }
 
 /* Стили для заголовка раздела */
 .ab-topics-root > h2 { 
     font-family: Arial, sans-serif; 
     font-size: 24px; /* Увеличим размер шрифта для заголовка раздела */
     font-weight: 800; /* Сделаем жирнее */
     color: #111827; 
     margin-top: 16px;
     margin-bottom: 16px;
 }
 
@media (max-width: 900px) {
  .ab-topics-wrap { justify-content: center; }
  .ab-topic-card { flex: 0 0 100%; position: relative; transition: none !important; }
  .ab-topic-card.ab-open { border-radius: 10px; overflow: hidden; }
  #ab-topics-status { margin-left: 8px; margin-right: 8px; }
  /* Адаптивность кнопок */
  .ab-topic-main-buttons { flex-wrap: wrap; justify-content: center; }
  .ab-btn-main-ppt, .ab-btn-more { flex: 1 1 45%; padding: 4px 6px; font-size: 12px; } /* Уменьшим кнопки */
  
  /* Перевод раскрываемого блока в поток на мобильных */
  .ab-topic-extra {
      position: static !important;
      border: none !important;
      border-radius: 0 !important;
      background: transparent !important; /* Бесшовное слияние с фоном карточки */
      width: auto !important;
      left: auto !important;
      padding: 0 12px 12px !important; /* На мобильных паддинг снизу всегда 12px для стабильности */
  }
  }
 

 /* Для выравнивания содержимого карточек: */
 .ab-topic-header { 
     font-family: Arial, sans-serif; 
     font-size: 15px; 
     font-weight: 700; 
     padding: 6px 10px 4px; 
     color: #111827;
     display: flex;
     align-items: center;
 }
 .ab-topic-main { 
     padding: 0 12px 4px; /* Уменьшаем нижний padding */
     display: flex; /* Используем flexbox для основного контента */
     flex-direction: column; /* Элементы идут сверху вниз */
     flex-grow: 1; /* Позволяет блоку растягиваться, чтобы кнопки были внизу */
 }
 
 /* Превью 16:9 */
 .ab-topic-preview { width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 8px; background: #000; border: 1px solid #cfcfcf; }
 .ab-topic-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
 
 .ab-topic-main-buttons { 
     display: flex; 
     justify-content: space-between; 
     align-items: center; 
     gap: 8px; 
     padding: 8px 0 4px; 
     margin-top: auto; /* Прижимает кнопки к низу карточки */
 }
 
 /* Общая база для всех кнопок */
.ab-btn { display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 6px 8px; border-radius: 4px; font-size: 12px; text-decoration: none; cursor: pointer; white-space: nowrap; }
 
  .ab-btn-main-ppt { flex: 1 1 0; text-align: center; border: 1px solid #d5defa; background: #f0f4ff !important; color: #1a3a8c !important; }
  .ab-btn-more { flex: 1 1 0; border: 1px solid #cccccc; background: #f9f9f9; color: #333333; }
 
.ab-topic-extra {
    box-sizing: border-box; /* Гарантируем, что паддинги не будут увеличивать ширину блока */
    position: absolute;
    top: 100%;
    left: -1px;
    width: calc(100% + 2px); /* Задаем точную ширину во избежание субпиксельного двоения границ */
    z-index: 100;
    padding: 0 12px 12px; /* Паддинг снизу ВСЕГДА равен 12px для стабильного замера scrollHeight в JS */
    font-size: 13px;
    background: #ffffff !important; /* Принудительно задаем белый цвет во избежание разницы в цветах */
    border: 1px solid transparent; /* Прозрачный бордер изначально, чтобы не торчал 1px снизу */
    border-top: none;
    border-radius: 0 0 10px 10px;
    max-height: 0; /* Скрываем по умолчанию */
    overflow: hidden; /* Обрезаем содержимое */
    visibility: hidden; /* Полностью скрываем видимость на десктопе, чтобы не вылезала линия */
    transition: max-height 0.3s ease-out, border-color 0.3s ease-out, visibility 0.3s step-end; /* Плавные переходы без анимации паддинга во избежание багов */
    will-change: max-height; /* Подсказка браузеру для оптимизации */
}
.ab-topic-card.ab-open .ab-topic-extra {
    padding: 0 12px 12px; /* Всегда 12px в открытом состоянии */
    border-color: #cfcfcf; /* Включаем бордер */
    visibility: visible;
    box-shadow: 0 6px 16px rgba(0,0,0,0.1); /* Тень для отделения от нижележащей карточки */
    transition: max-height 0.3s ease-out, border-color 0s, visibility 0s;
}

/* Убираем верхнюю серую черту-стык у первой лекции/блока внутри extra */
.ab-topic-extra > .ab-extra-block:first-child,
.ab-topic-extra > .ab-extra-lecture:first-of-type,
.ab-topic-extra > .ab-extra-test-item:first-of-type {
    border-top: none !important;
}

/* Последний модуль — раскрытие в потоке (чтобы не обрезалось Moodle) */
.ab-topics-root.ab-last-module .ab-topic-extra {
    position: static !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    width: auto !important;
    left: auto !important;
    padding: 0 12px 12px !important;
    box-shadow: none !important;
}
.ab-topics-root.ab-last-module .ab-topic-card.ab-open {
    border-radius: 10px;
}
.ab-topics-root.ab-last-module {
    margin-bottom: 0;
}

.ab-extra-block { margin-top: 8px; } /* Отступ сверху для блока */
.ab-extra-block + .ab-extra-block { border-top: 1px solid #eeeeee; padding-top: 8px; margin-top: 8px; } /* Черта между блоками */
.ab-extra-title { font-weight: 600; margin-bottom: 4px; }

.ab-extra-lecture { padding: 0 0 12px 12px; } /* Отступ снизу 12px для разделения, слева для выравнивания */
.ab-extra-lecture-title { margin-bottom: 4px; }
.ab-extra-lecture-buttons { display: flex; flex-wrap: wrap; gap: 6px; }

.ab-btn-video { flex: 0 0 auto; border: 1px solid #d5e6ff; background: #eef7ff !important; color: #114b8c !important; }
.ab-btn-ppt { flex: 0 0 auto; border: 1px solid #f0e0d0; background: #fff0e0 !important; color: #c08040 !important; } /* Бледный оранжево-коричневый */

 .ab-btn-method { display: inline-flex; align-items: center; justify-content: flex-start; padding: 6px 8px 6px 12px; border-radius: 4px; border: 1px solid #e0e0e0; background: #fafafa !important; color: #333333 !important; font-size: 13px; box-sizing: border-box; margin-top: 2px; white-space: normal; height: auto; } /* Изменено display, удалено width: 100%, добавлено выравнивание */

 .ab-extra-test-item { margin-top: 0; padding: 0 0 12px 12px; } /* Отступ снизу 12px для разделения, слева для выравнивания */
 .ab-extra-test-title { margin-bottom: 6px; } /* Стиль для заголовка каждого теста */
 .ab-extra-test-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
 .ab-btn-test-online { flex: 0 0 auto; border: 1px solid #c7e9d3; background: #e9f7ef !important; color: #146c43 !important; }
 .ab-btn-test-doc { flex: 0 0 auto; border: 1px solid #d5e6ff; background: #eef7ff !important; color: #114b8c !important; } /* Голубоватый, как у видео */
`;
  document.head.appendChild(style);

  // Вставляем HTML в #mg-root
  var root = document.getElementById('mg-root');
  if (!root) return;
  root.innerHTML = `
<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Введение в фармакологию</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="intro">
  <div class="ab-topic-header">Тема 1. Предмет и задачи фармакологии. Испытания новых ЛС</div>
  <div class="ab-topic-main">
    
    
    
    <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1pEXQ1oExehl7f5ZEJ6soXKSWKblzfjlv" alt="Видео-лекции пока нет"></div>
    
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1UIUW7wbvP6W0HP5phfBRy6ctyzTJd4CN/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

    
    
    

    
    
    
<div class="ab-extra-block ab-extra-fallback">
  <div class="ab-extra-title">Для подготовки к этой теме используйте рекомендованные источники</div>
  <a class="ab-btn ab-btn-method" href="#rec_sources" target="_blank" rel="noopener">Перейти</a> 
</div>
    
  </div>
</div>


<div class="ab-topic-card" id="kinetics">
  <div class="ab-topic-header">Тема 2. Фармакокинетика</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239030" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1V7U0NhVNuOVIk95mxEHd4othZm_5inOb" alt="Тема 2. Фармакокинетика"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/15cVSvkZKTBQbms68YEm9PmuCIev6Cvwo/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Фармакокинетика. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1MLA0T7Rrrn7JWHRMsHWGojj_b0kagAna/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

    
    
  </div>
</div>


<div class="ab-topic-card" id="dynamics">
  <div class="ab-topic-header">Тема 3. Фармакодинамика</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239028" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1I2OUKNSprmTOsJqnpdB_sybNZ38j6YVY" alt="Тема 3. Фармакодинамика"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Фармакодинамика. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1Me4OK0ciGGDpcV70OlPMTTbUnjz_9jem/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

    
    
  </div>
</div>


<div class="ab-topic-card" id="prescriptions">
  <div class="ab-topic-header">Тема 4. Рецептура</div>
  <div class="ab-topic-main">
    
    
    
    <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1pEXQ1oExehl7f5ZEJ6soXKSWKblzfjlv" alt="Видео-лекции пока нет"></div>
    
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

<div class="ab-extra-block ab-extra-methods">
  <div class="ab-extra-title">Методические пособия</div>
  
  <a class="ab-btn ab-btn-method" href="https://drive.google.com/file/d/1e5lEb9Z3HVjX8IzAk9khYCRdvUnEKRxJ/view?usp=drive_link" target="_blank" rel="noopener">📚 Рецептура. Аскирко Н.В., Сидоров А.В.</a>
  
  <a class="ab-btn ab-btn-method" href="https://docs.google.com/document/d/1NYMYVn9_1RcMFWxnItHyld4a-Id3nqLH/export?format=docx" target="_blank" rel="noopener">📚 Демо-вариант контрольной работы по рецептуре</a>
  
</div>

    
    
    

    
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Медиаторная фармакология</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="cholinergia">
  <div class="ab-topic-header">Тема 5. Холинергические средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239043" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1xpuweLUw5xFQpHZDvnwHgqxo5y01dlCr" alt="Тема 5. Холинергические средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Холиномиметики. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239039" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Холинолитики. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239032" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Холиномиметики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239066" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Холинолитики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239060" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Холинергические средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1zmgHmUMBInBmM3aqeP4xfXJRaNhtyMFo/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Холинергические средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/kholinergicheskie_sredstva.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1p9kmDDwsZqb7OMDUudkKcXRlc8tHcQMP/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="adrenomimetics">
  <div class="ab-topic-header">Тема 6. Адреномиметики</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239023" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1tJsxmFf2kiEBXHlsuRrvg3nhBKZjlGVg" alt="Тема 6. Адреномиметики"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Адреномиметики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239051" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Адренергические средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1gTMyE7l34HRohviM9w3CDBelqVybR12L/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Адреномиметики</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/adrenomimetiki.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1fa6-74iNcR0iLPhReG_OlKYDmLGigieh/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="adrenilytics">
  <div class="ab-topic-header">Тема 7. Адренолитики. Антигистаминные</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239024" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=194370bxOROj4HEDW0qlDRzQcTRqgjfUy" alt="Тема 7. Адренолитики. Антигистаминные"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Адренолитики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239065" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Адренергические средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1gTMyE7l34HRohviM9w3CDBelqVybR12L/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Антигистаминные средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/10UPjRqBFMfSxo6ZxyAclS_e6orfVmie1/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Адренолитики</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/adrenolitiki.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1fa6-74iNcR0iLPhReG_OlKYDmLGigieh/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Кардиофармакология</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="RAAS">
  <div class="ab-topic-header">Тема 9. Антигипертензивные препараты. Препараты, влияющие на РААС</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239052" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1srANPKnBG2OaLaXi15aa7UdfYDGexq-x" alt="Тема 9. Антигипертензивные препараты. Препараты, влияющие на РААС"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Гипотензивные средства. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1qtbxBsrEWIi2j9BQSl2HFIxe7SkF0fZ7/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, влияющие на РААС</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239050" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1cGj0_RBJITx2CZKtVp29Fg1Er82WX1h1/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Гипотензивные средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/gipotenzivnye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/118LJq0bHqXh9-gNRQmBC9PpDV0X3uWxV/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="diuretics">
  <div class="ab-topic-header">Тема 10. Диуретики. Гипотензивные ЛС центрального действия</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239019" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1vjnLbgNNl3pSXKQkJYrYc3rei-65mUrx" alt="Тема 10. Диуретики. Гипотензивные ЛС центрального действия"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Диуретики</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/diuretiki.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1PPJEjeRJrxTwydBdSYYIf1v5TDGPcDIg/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="antiangin">
  <div class="ab-topic-header">Тема 11. Антиангинальные, гипохолестеринемические и влияющие на кровоток мозга препараты</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239018" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=12RwkGSpulxxqmNF5DrYZ6zShzQ7oqP8H" alt="Тема 11. Антиангинальные, гипохолестеринемические и влияющие на кровоток мозга препараты"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Антиаритмики и антиангинальные средства. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1fO1ciCuvxU49lKpBdMa-qzf8kR2DtY6k/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Фармакотерапия атеросклероза. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/14uFK4nqTsoy3oNgmMJJE7WArmEGQu3yw/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Антиангинальные средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/antianginalnye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1Q-QM63Y-2pJDXpwH7l-CZRsiTnBI__Xp/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="antiarhytmics">
  <div class="ab-topic-header">Тема 12. Антиаритмики. Кардиотоники</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239021" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1qabO2lhj0_6ZFS2YiamskvZbjyQ9hTtl" alt="Тема 12. Антиаритмики. Кардиотоники"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Антиаритмики и антиангинальные средства. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1fO1ciCuvxU49lKpBdMa-qzf8kR2DtY6k/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

<div class="ab-extra-block ab-extra-methods">
  <div class="ab-extra-title">Методические пособия</div>
  
  <a class="ab-btn ab-btn-method" href="https://drive.google.com/file/d/1TP_jYCsdLvuBAJEmFXvQdaI3NdwXTkBP/view?usp=drivesdk" target="_blank" rel="noopener">📚 Антиаритмики. Солтатова О.Н</a>
  
</div>

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Антиаритмики</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/antiaritmiki.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/13MRCb4IE7e985vphTy9QMDcVQNNJXGt0/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Фармакология ЦНС, боли и воспаления</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="analgetics">
  <div class="ab-topic-header">Тема 14. Анальгетики. НПВС. Противоподагрические средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239046" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1Ef5UiQmwQ6aKIln6NYtkz0rau_I19mjS" alt="Тема 14. Анальгетики. НПВС. Противоподагрические средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Наркотические анальгетики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239045" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1MmMKXMIrcrUC0JQ5foBRruwbzAlBuVZS/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Ненаркотические анальгетики и НПВП. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239054" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1IyRaxnh69zCl8euT69SKbhE9qzLFoaMW/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">НПВС. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1gENUp85iGAqrj-f3_UkTocqR12SDSOsA/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Анальгетики. НПВС</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/analgetiki_npvs.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1-rfWfqqZbkU5AIIQMgOKlqfb9fgT8OPc/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="anxiolytics">
  <div class="ab-topic-header">Тема 15. Анксиолитики. Снотворные. Противосудорожные</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239042" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1f1mLD6qF_epDs-SOt-OWRVU1wqlbEQk4" alt="Тема 15. Анксиолитики. Снотворные. Противосудорожные"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Психотропные средства. Краткий обзор. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239034" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Анксиолитики.Снотворные. Противоэпилептические.</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/anksiolitiki_snotvornye_protivosudorozhnye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1-o_p9UfgGKz8BMbxSJ4L4vlqhnhp62uv/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="neuroleptics">
  <div class="ab-topic-header">Тема 16. Нейролептики и антипаркинсонические средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239055" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1_7TqwFv8ntdGN0FzQkIrAnIzCu3mp3eq" alt="Тема 16. Нейролептики и антипаркинсонические средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Нейролептики. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239061" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1CEbh3ThrJ5TDQmVj2Z8ipeFvMfdTOfRq/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Противопаркинсонические средства. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239029" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1CM6GgeL7PspTrnMtv4pmQ2AC8blFx1WM/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Нейролептики и противопаркинсонические средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/neyroleptiki_i_protivoparkinsonicheskie_sredstva.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1SXpjEJ65S58Lv5kWKw1g2fys0_pg8M56/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="antidepressants">
  <div class="ab-topic-header">Тема 17. Антидепрессанты. Нормотимики. Психостимуляторы</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239025" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=12t5WoFou4fOeBO1Dq28cPJfV0q7pCd9e" alt="Тема 17. Антидепрессанты. Нормотимики. Психостимуляторы"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1i4JvMM8v3tmgdbe1mwsA-f-gVn1UAC4c/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Антидепрессанты. Нормотимики. Психостимуляторы</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/antidepressanty_normotimiki_psikhostimulyatory.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1PtcbyCEIhpkiHkjkzXJlJGHpg5F-GpUI/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="anaestetics">
  <div class="ab-topic-header">Тема 18. Анестетики и спирты</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239031" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1vTjHxW9tRyi8vu-fNkKWO9-w_XsnmcMD" alt="Тема 18. Анестетики и спирты"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Местные анестетики. Обволакивающие, вяжущие, адсорбирующие средства. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239036" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Анестетики. Спирты</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/anestetiki_spirty.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1FFhOAnX7e_NQdDD-F27F00SpBV8-YHN5/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Химиотерапевтические средства</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="antibiotics-1">
  <div class="ab-topic-header">Тема 19-20. Антибиотики</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239033" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1Hvpd9gpuGCBGhvELcv2x50gL25YJomQW" alt="Тема 19-20. Антибиотики"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/122JN8Vil3z7tAxidHYi79_iP9Zw9_9V9/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Антибактериальные средства. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239020" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Антибиотики. Часть 1.</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/antibiotiki_osnovnye_ponyatiya_beta_laktamy_i_makrolidy.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1HVe04RGX6cO3smjaf2ssaduuHPotF-VF/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Антибиотики. Часть 2.</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/antibiotiki_chast_2.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="synthetics">
  <div class="ab-topic-header">Тема 21. Синтетические противомикробные средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239027" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1rICCZ_md402cjTNRQh0-OAtC1cuDXcX1" alt="Тема 21. Синтетические противомикробные средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Синтетические противомикробные средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/sinteticheskie_protivomikrobnye_sredstva.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1XX4WntPFjBo1EYWT7S138Zch0bQAgZLc/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="tbc-virus">
  <div class="ab-topic-header">Тема 22. Противотуберкулёзные и противовирусные средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239035" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1IDwgt1egCSwYIxlPAYIYwHo4xtSw61eF" alt="Тема 22. Противотуберкулёзные и противовирусные средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1dkCNr3NoxuDlxJSncb5g_jWXtcwbGC4-/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Противотуберкулёзные средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239017" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1rMV4Pth9zkNUWeQCWakvLEDDpjyo35Fz/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Противовирусные средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/protivovirusnye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1Xa7NTXPIdHXZ5eo5n4KfdGP1aq8wECfL/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Противотуберкулёзные средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/protivotuberkulyoznye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1QZW5-g-lcJyfxHkPd9Q_SORIXco51fXe/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="fungi-verm-protoz">
  <div class="ab-topic-header">Тема 23. Противогрибковые. Противоглистные. Противопротозойные</div>
  <div class="ab-topic-main">
    
    
    
    <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1pEXQ1oExehl7f5ZEJ6soXKSWKblzfjlv" alt="Видео-лекции пока нет"></div>
    
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Противогрибковые средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/157GSR5r2Ss4bHbF6IojBubTM-XUP5z6x/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Синтетические противомикробные и антипротозойные средства. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/16gy-VzDcDy9HfaLk_q8VFl1JgsF4ghgx/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Противогрибковые средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/protivogribkovye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1SSVMrMuJ118fIbXlAeElxGacSeusLuS4/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Антигельминтные средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/antigelmintnye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1R4Z5cc1Fi6yKn04IxvJWk2FY3wwhy0--/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
    
<div class="ab-extra-block ab-extra-fallback">
  <div class="ab-extra-title">Для подготовки к этой теме используйте рекомендованные источники</div>
  <a class="ab-btn ab-btn-method" href="#rec_sources" target="_blank" rel="noopener">Перейти</a> 
</div>
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Фармакология эндокринной системы</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="gormon-1">
  <div class="ab-topic-header">Тема 24. Гормоны: общие понятия, гормоны гипоталамуса, гипофиза, щитовидной железы, надпочечников</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239022" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1ow11ztRifLxM-JFiELC3NBRXvVKsiAPv" alt="Тема 24. Гормоны: общие понятия, гормоны гипоталамуса, гипофиза, щитовидной железы, надпочечников"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1Y0tw6Yy6fpEYKMyz5zoGzjOdS-ZjioTI/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Лекарственные препараты в эндокринологии. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1w40mxvaySTtj0FzbEoCpnuvWnSj1aNc_/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Полипептидные гормоны. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1VXT-atpFdBGx9OeL76Mvic3jg7o1gFTl/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Гормоны и их антагонисты</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/gormony.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1w4xeIVHC5D_o2cfTptdPzBl3XSFxCz4g/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="gormon-2">
  <div class="ab-topic-header">Тема 25. Инсулины и синтетичесике сахароснижающие препараты</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239059" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1J-oXUlvSvQbt2ymu90Z7AV7M7npvZ8Ly" alt="Тема 25. Инсулины и синтетичесике сахароснижающие препараты"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1GC_OAQwOgFoXpffzbeZVVl_zguSMqATz/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Лекарственные препараты в эндокринологии. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1w40mxvaySTtj0FzbEoCpnuvWnSj1aNc_/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Полипептидные гормоны. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1VXT-atpFdBGx9OeL76Mvic3jg7o1gFTl/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Гормоны и их антагонисты</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/gormony.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1w4xeIVHC5D_o2cfTptdPzBl3XSFxCz4g/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="gormon-3">
  <div class="ab-topic-header">Тема 26. Половые гормоны и их анатгонисты. Маточные средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239056" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=11TxbKXfCZfL1p_7iXsZxeiEd50_2r_Yw" alt="Тема 26. Половые гормоны и их анатгонисты. Маточные средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/10fu57uJPlfsgl9zZE7PhPODvDW703o8e/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Лекарственные препараты в эндокринологии. Лилеева Е.Г.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1w40mxvaySTtj0FzbEoCpnuvWnSj1aNc_/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Гормоны и их антагонисты</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/gormony.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1w4xeIVHC5D_o2cfTptdPzBl3XSFxCz4g/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Противоопухолевые, иммуно-, гемато- и метаботропные средства</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="cancer">
  <div class="ab-topic-header">Тема 27. Противоопухолевые средства</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239064" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1-Mf-NdWrDo9QCkUz1YpmEyQg68na5cDB" alt="Тема 27. Противоопухолевые средства"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1qMV0lCTYbGBXft5H-hOa4ykTGdasWVm3/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Противоопухолевые средства</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/protivoopukholevye.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1iMpYRsRzNE-MvAO3D-ittnkownDeaaSs/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="immune">
  <div class="ab-topic-header">Тема 28. Иммунофармакологические средства</div>
  <div class="ab-topic-main">
    
    
    
    <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1pEXQ1oExehl7f5ZEJ6soXKSWKblzfjlv" alt="Видео-лекции пока нет"></div>
    
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Иммуннофармакология. Спешилова С.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1mhPWfNku0tIKnnA4_Ey8T_CTTYqWM_nl/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

    
    
  </div>
</div>


<div class="ab-topic-card" id="vitamins">
  <div class="ab-topic-header">Тема 29. Витамины и ферменты. Средства, влияющие на кальциево-фосфорный обмен</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239038" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1iEGKXOLfX7sTc-6HUa6w9PsJSRCQyTAt" alt="Тема 29. Витамины и ферменты. Средства, влияющие на кальциево-фосфорный обмен"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://docs.google.com/presentation/d/1Ac6DcOKLeRf9l9RFcGig57C1R6sSt4BA/export/pptx" target="_blank" rel="noopener">📊 PPTX</a>
      
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

    
    
    

    
    
    

    
    
  </div>
</div>


<div class="ab-topic-card" id="blood">
  <div class="ab-topic-header">Тема 30-31. Препараты, влияющие на кроветворение и гемостаз</div>
  <div class="ab-topic-main">
    
    <a href="https://drive.google.com/file/d/1W-4v3zqPNz-8CTYsevKE4DpjIya54_v8/view" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1NebiF4iiZqU_QbVPO71qIxAK5Sd6IgYZ" alt="Тема 30-31. Препараты, влияющие на кроветворение и гемостаз"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://drive.google.com/file/d/1fZpzQ2axwGeCSoJ0074fRyn-53ekgl8k/view?usp=drivesdk" target="_blank" rel="noopener">📊 PDF</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, влияющие на кроветворение (часть 1/2). Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239049" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1q4gq6i3kj-pARe-Xnyx3Pz3Mttod_h-2/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, влияющие на кроветворение (часть 2/2). Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239062" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1q4gq6i3kj-pARe-Xnyx3Pz3Mttod_h-2/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, влияющие на кроветворение. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1UsBylKgDE-YAk2rBzQmEKaDC_L0nel6E/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Антикоагулянты. Антиагреганты. Фибринолитики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239053" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1toLA-xQ3qmrPdgVwr6nIcQxePluCN3s0/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Гемостатики. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239047" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1toLA-xQ3qmrPdgVwr6nIcQxePluCN3s0/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Кроветворение</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/krovetvorenie.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1IlQd8Q2tJJHdyO8LIxSjOvBhN8WVUVYO/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Гемостаз</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/gemostaz.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1jl_Pb5FmbheTbSl7mPau_U1MxZGLlYcH/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>

  </div>
</div>

<div class="ab-topics-root ab-last-module">
  <!-- Заголовок раздела -->
  <h2 style="text-align: center; width: 100%;">Фармакология дыхания и ЖКТ</h2>
  <div class="ab-topics-wrap">
    <!-- Сетка карточек -->
    

<div class="ab-topic-card" id="breath">
  <div class="ab-topic-header">Тема 32. Препараты, влияющие на функции органов дыхания</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-234383017_456239017?list=ln-073Aszkr5lpC98Zn1w" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1GUGzVyifvLclP0Q6jiXe5TpFcVfOmROz" alt="Тема 32. Препараты, влияющие на функции органов дыхания"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://drive.google.com/file/d/12jWfuy_10Jqi4LScPtK9oLM77Mf0Ic0F/view?usp=drivesdk" target="_blank" rel="noopener">📊 PDF</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, применяемые при заболеваниях системы органов дыхания. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239041" target="_blank" rel="noopener">🎬 Видео</a>
      
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, применяемые при заболеваниях системы органов дыхания. Солдатова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1vupL8RPU93s6VBHR-govbRzLNHWhUJ9z/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">Средства, применяемые при заболеваниях системы органов дыхания</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/dykhanie.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
       <a class="ab-btn ab-btn-test-doc" href="https://docs.google.com/document/d/1UNJztzII1CqHLLGCVNwo_gKmU9qZN0xQ/export?format=docx" target="_blank" rel="noopener">📄 Скачать DOCX</a>
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="gastro">
  <div class="ab-topic-header">Тема 33. Препараты, влияющие на ЖКТ</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-234383017_456239018?list=ln-tz5nz26f6AV5SRuGD0" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1Q5KgG1sBmu0gfPdgcU7VLE16HPzrt8lv" alt="Тема 33. Препараты, влияющие на ЖКТ"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      <a class="ab-btn ab-btn-main-ppt" href="https://drive.google.com/file/d/1yZaheEwZ2VJyGQcwqkzzqOSObNRlzFv6/view?usp=drivesdk" target="_blank" rel="noopener">📊 PDF</a>
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, влияющие на органы пищеварения. Смирнов Н.А.</div>
    <div class="ab-extra-lecture-buttons">
      
      <a class="ab-btn ab-btn-video nomediaplugin" href="https://vkvideo.ru/video-213207208_456239040" target="_blank" rel="noopener">🎬 Видео</a>
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1i4iLiNV7vmeluhnHi9uhS9CXt2NgToZz/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Средства, влияющие на органы пищеварения. Сироткина А.М.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1DhrN4OOrU1It0jUxGoryyh61DshowVpz/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

<div class="ab-extra-block ab-extra-test">
  <div class="ab-extra-title">Тесты</div> 
  
  <div class="ab-extra-test-item"> 
    <div class="ab-extra-test-title">ЖКТ</div> 
    <div class="ab-extra-test-buttons">
       
        <a class="ab-btn ab-btn-test-online" href="https://nicotinko.github.io/pharmacologyTest/tests/zhkt.html" target="_blank" rel="noopener">✅ Решать онлайн</a>
       
       
    </div>
  </div>
  
</div>

    
    
  </div>
</div>


<div class="ab-topic-card" id="tox">
  <div class="ab-topic-header">Тема 34. Лечение острых отравлений</div>
  <div class="ab-topic-main">
    
    <a href="https://vkvideo.ru/video-213207208_456239048" target="_blank" rel="noopener" class="nomediaplugin">
      <div class="ab-topic-preview"><img class="img-fluid" src="https://drive.google.com/thumbnail?sz=w400&id=1t_44JOHTt64d2YhJzPc8xQo5BVqUdHSW" alt="Тема 34. Лечение острых отравлений"></div>
    </a>
    

    <div class="ab-topic-main-buttons">
      
      
      <button class="ab-btn ab-btn-more" type="button">Ещё ▾</button>
      
    </div>
  </div>
  
  <div class="ab-topic-extra">
    
    

<div class="ab-extra-block ab-extra-lectures">
  <div class="ab-extra-title">Ещё лекции</div>
  
  <div class="ab-extra-lecture">
    <div class="ab-extra-lecture-title">Лечение отравлений. Антидоты. Захарова М.Н.</div>
    <div class="ab-extra-lecture-buttons">
      
      
      <a class="ab-btn ab-btn-ppt" href="https://docs.google.com/presentation/d/1Erg77V9Sjdkfvdg0qqH3porssYTNZRt1/export/pptx" target="_blank" rel="noopener">📊 Презентация</a>
      
    </div>
  </div>
  
</div>

    
    
    

    
    
    

    
    
  </div>
</div>

  </div>
</div>`;

  // Запускаем логику карточек (DOM уже готов)
  
document.addEventListener('DOMContentLoaded', function() {
  // Закрытие раскрытых карточек при клике вне их
  document.addEventListener('click', function(e) {
    var openCards = document.querySelectorAll('.ab-topic-card.ab-open');
    if (!openCards.length) return;
    for (var i = 0; i < openCards.length; i++) {
      if (!openCards[i].contains(e.target)) {
        openCards[i].classList.remove('ab-open');
        var extra = openCards[i].querySelector('.ab-topic-extra');
        if (extra) extra.style.maxHeight = '0px';
      }
    }
  });

  // Обрабатываем все разделы на странице
  var roots = document.querySelectorAll('.ab-topics-root');

  roots.forEach(function(root) {
    var wrap = root.querySelector('.ab-topics-wrap');
    if (!wrap) return;

    var cards = Array.prototype.slice.call(wrap.getElementsByClassName('ab-topic-card'));

    cards.forEach(function(card) {
      var moreButton = card.querySelector('.ab-btn-more');
      var extra = card.querySelector('.ab-topic-extra');

      if (moreButton && extra) {
        moreButton.addEventListener('click', function() {
          var isOpen = card.classList.contains('ab-open');

          // Аккордеон: закрываем другие открытые карточки ТОЛЬКО в этом разделе
          cards.forEach(function(otherCard) {
            if (otherCard !== card && otherCard.classList.contains('ab-open')) {
              otherCard.classList.remove('ab-open');
              var otherExtra = otherCard.querySelector('.ab-topic-extra');
              if (otherExtra) {
                otherExtra.style.maxHeight = '0px';
              }
            }
          });

          if (isOpen) {
            card.classList.remove('ab-open');
            extra.style.maxHeight = '0px';
          } else {
            card.classList.add('ab-open');
            extra.style.maxHeight = extra.scrollHeight + 'px';
          }
        });
      }
    });

    // Выравнивание заголовков и превью карточек по рядам
    function alignCards() {
      var cols = window.matchMedia('(max-width: 900px)').matches ? 1 : 4;
      var headers = wrap.querySelectorAll('.ab-topic-header');
      var previews = wrap.querySelectorAll('.ab-topic-preview');
      if (!headers.length) return;

      // Сбрасываем высоту перед пересчётом
      for (var i = 0; i < headers.length; i++) {
        headers[i].style.minHeight = '';
      }
      for (var i = 0; i < previews.length; i++) {
        previews[i].style.minHeight = '';
      }

      // Группируем по рядам
      var rows = [];
      for (var i = 0; i < headers.length; i += cols) {
        rows.push(Array.prototype.slice.call(headers, i, i + cols));
      }

      rows.forEach(function(row) {
        var maxH = 0;
        row.forEach(function(h) { maxH = Math.max(maxH, h.offsetHeight); });
        row.forEach(function(h) { h.style.minHeight = maxH + 'px'; });
      });

      // Выравниваем превью по тому же принципу
      var previewRows = [];
      for (var i = 0; i < previews.length; i += cols) {
        previewRows.push(Array.prototype.slice.call(previews, i, i + cols));
      }

      previewRows.forEach(function(row) {
        var maxH = 0;
        row.forEach(function(p) { maxH = Math.max(maxH, p.offsetHeight); });
        row.forEach(function(p) { p.style.minHeight = maxH + 'px'; });
      });
    }

    alignCards();
    // Пересчитываем при изменении размера окна
    window.addEventListener('resize', alignCards);
  });
});

})();

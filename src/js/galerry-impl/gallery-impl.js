import galleriesList from './gallery-db.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryList = document.querySelector('.gallery');
const implLinkBtn = document.querySelectorAll('.js-impl-gallery');
const impProjectsPage = document.querySelector('.hidden-wrap');
const impGalleryPage = document.querySelector('#implementation-gallery');
const impBackBtn = document.querySelector('#imp-gallery-back');
const loadMoreBtn = document.querySelector('#load-more');
const LoadPageObserver = document.querySelector('.load-more');

let lightbox = null;
let currentGallery = [];
let loadedCount = 0;

let ITEMS_PER_PAGE = window.innerWidth >= 1200 ? 6 : 12;

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        renderNextImages();
      }
    });
  },
  {
    root: null,
    rootMargin: '200px',
    threshold: 0,
  }
);

function backToProjects() {
  impProjectsPage.classList.remove('hidden');
  impGalleryPage.classList.add('hidden');

  if (lightbox) {
    try {
      lightbox.destroy();
    } catch (e) {
      console.warn('Lightbox destroy error:', e);
    }
    lightbox = null;
  }

  galleryList.innerHTML = '';
  currentGallery = [];
  loadedCount = 0;
}

if (impBackBtn) {
  impBackBtn.addEventListener('click', () => {
    history.back();
  });
}

implLinkBtn.forEach(btn => {
  btn.addEventListener('click', handleCreateGallery);
});

function handleCreateGallery(evt) {
  evt.preventDefault();

  const scrollY = window.scrollY;
  history.replaceState({ section: 'imp-projects', scrollY }, '', location.href);

  impProjectsPage.classList.add('hidden');
  impGalleryPage.classList.remove('hidden');

  const buttonData = evt.currentTarget.dataset.implgallery;
  const gallery = galleriesList[buttonData];

  if (lightbox) {
    try {
      lightbox.destroy();
    } catch (e) {
      console.warn('Lightbox destroy error:', e);
    }
    lightbox = null;
  }

  galleryList.innerHTML = '';

  if (gallery && gallery.length > 0) {
    currentGallery = gallery;
    loadedCount = 0;

    renderNextImages();

    if (LoadPageObserver) {
      observer.observe(LoadPageObserver);
      setTimeout(() => {
        checkIfNeedMore, lightbox.refresh();
      }, 300);
    }
  } else {
    galleryList.innerHTML = '<p> 🏗️ Zdjęcia tej realizacji już wkrótce!</p>';
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
  }

  setTimeout(() => {
    toScrollProject('implementation-gallery');
  }, 100);

  if (history.state?.section !== 'gallery') {
    history.pushState(
      { section: 'imp-projects', scrollTo: 'imp-projects' },
      '',
      '?gallery'
    );
  }
}

window.addEventListener('popstate', event => {
  if (event.state?.section === 'imp-projects') {
    backToProjects();

    setTimeout(() => {
      if (event.state.scrollY !== undefined) {
        window.scrollTo({
          top: event.state.scrollY,
          behavior: 'smooth',
        });
      } else {
        toScrollProject('imp-projects');
      }
    }, 400);
  }
});

function renderNextImages() {
  const nextItems = currentGallery.slice(
    loadedCount,
    loadedCount + ITEMS_PER_PAGE
  );

  galleryList.insertAdjacentHTML('beforeend', createHtmlEl(nextItems));
  loadedCount += ITEMS_PER_PAGE;

  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', { history: false });
  }
  if (lightbox) {
    lightbox.on('closed.simplelightbox', () => {
      lightbox.refresh();
    });
  }

  if (loadedCount >= currentGallery.length) {
    if (LoadPageObserver) {
      observer.unobserve(LoadPageObserver);
    }
  }
}

function checkIfNeedMore() {
  if (!LoadPageObserver) return;

  const rect = LoadPageObserver.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    renderNextImages();
  }
}

window.addEventListener('load', () => {
  setTimeout(checkIfNeedMore, 300);
});

function createHtmlEl(arr) {
  return arr
    .map(
      item => `
    <li class="gallery-item">
      <a class="gallery-link" href="${item['1x']}">
        <img
          class="gallery-image"
          src="${item['1x']}"
          srcset="${item['1x']} 1x, ${item['2x']} 2x"
          alt="img"
        />
      </a>
    </li>
  `
    )
    .join('');
}

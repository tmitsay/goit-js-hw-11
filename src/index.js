import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { URL, options } from './api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let totalHits = 0;
let reachedEnd = false;
let isLoadMore = false;

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryDiv: document.querySelector('.gallery'),
  loaderEl: document.querySelector('.loader'),
  searchInput: document.querySelector('input[name]'),
};

const lightbox = new SimpleLightbox('.lightbox', {
  /* options */
  captionsData: 'alt',
  captionDelay: 250,
  close: false,
  enableKeyboard: true,
});

const { formEl, galleryDiv, loaderEl, searchInput } = refs;

// console.dir(searchInput.value);

window.addEventListener('scroll', onScrollMore);
formEl.addEventListener('submit', onFormSubmit);
document.addEventListener('DOMContentLoaded', hideLoader);

function loaderShow() {
  loaderEl.style.display = 'block';
}

function hideLoader() {
  loaderEl.style.display = 'none';
}

async function loadMore() {
  options.params.page += 1;
  isLoadMore = true;

  try {
    loaderShow();
    const response = await axios.get(URL, options);
    const hits = response.data.hits;
    createMarkup(hits);
  } catch (err) {
    Notify.failure(err);
    hideLoader();
  } finally {
    hideLoader();
    isLoadMore = false;
  }
}

function onScrollMore() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const scrollMax = 300;
  if (
    scrollTop + clientHeight >= scrollHeight - scrollMax &&
    galleryDiv.innerHTML !== '' &&
    !isLoadMore &&
    reachedEnd
  ) {
    loadMore();
  }
}

async function onFormSubmit(event) {
  event.preventDefault();
  options.params.q = searchInput.value.trim();
  if (options.params.q === '') {
    return;
  }
  options.params.page = 1;
  reachedEnd = false;
  galleryDiv.innerHTML = '';

  try {
    loaderShow();
    const response = await axios.get(URL, options);
    totalHits = response.data.totalHits;
    const hits = response.data.hits;

    if (hits.length === 0) {
      Notify.failure('Sorry. Try again, please');
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);

      createMarkup(hits);
    }
    input.name.value = '';
    hideLoader();
  } catch (err) {
    // Notify.failure(err);
    hideLoader();
  }
}

function createMarkup(hits) {
  const markup = hits
    .map(hit => {
      return `<a href="${hit.largeImageURL} class="lightbox">
 <div class="photo-card">
  <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${hit.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${hit.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${hit.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${hit.downloads}
    </p>
  </div>
</div>;
    </a>`;
    })
    .join('');

  galleryDiv.insertAdjacentHTML('beforeend', markup);

  if (options.params.per_page * options.params.page >= totalHits) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");

      reachedEnd = true;
    }
  }
  lightbox.refresh();
}

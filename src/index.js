import { fetchImages } from './pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchBtn = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');
let query = '';
let page = 1;
const simpleGallery = new SimpleLightbox('.gallery a');
const perPage = 40;

const handleSearchBtn = async event => {
  try {
    event.preventDefault();
    page = 1;
    query = event.currentTarget.searchQuery.value;
    gallery.innerHTML = '';
    loadMoreBtn.classList.add('is-hidden');

    if (query === '') {
      Notiflix.Notify.failure(
        'The entered value cannot be empty. Please specify your query.'
      );
      return;
    }

    await fetchImages(query, page, perPage).then(({ data }) => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderGallery(data.hits);
        simpleGallery.refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden');
        }
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    searchBtn.reset();
  }
};

function renderGallery(images) {
  const markup = images
    .map(image => {
      const {
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
          <a class="gallery-link" href="${largeImageURL}">
            <div class="photo-card" id="${id}">
              <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
              </div>
            </div>
          </a>
        `;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

const handleLoadMoreBtn = async () => {
  page += 1;
  try {
    const { data } = await fetchImages(query, page, perPage);
    renderGallery(data.hits);
    simpleGallery.refresh();

    const totalPages = Math.ceil(data.totalHits / perPage);

    if (page > totalPages) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
};

searchBtn.addEventListener('submit', handleSearchBtn);
loadMoreBtn.addEventListener('click', handleLoadMoreBtn);
const URL = 'https://pixabay.com/api/';
const KEY = '39956878-8b7c9a3843687fe6a4d1d60b3';
const options = {
  params: {
    key: KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: 1,
    per_page: 40,
    q: '',
  },
};
export { URL, KEY, options };

import axios from 'axios';
import { URL, options } from './api';

export function requestOnApi() {
  const response = axios.get(URL, options);
  console.log(response);
  return response;
}

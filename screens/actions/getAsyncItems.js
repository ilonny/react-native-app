import { API_URL } from '../../constants/api'
export default async function getItemsFromApiAsync() {
return fetch(API_URL + '/items')
    .then((response) => {
        return response.json()
    })
    .catch((error) => {
        console.error(error);
    });
}
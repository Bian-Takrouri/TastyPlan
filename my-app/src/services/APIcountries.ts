
// import countries from "../data/countries.json"

// export function getCountryFlag(countryName:string){
//     const country=countries.find(
//         (country)=>country.country.toLowerCase()=== countryName.toLowerCase()
//     )
//     return country?.flag;
// }


// import axios from "axios";

// const URL = "https://api.restcountries.com/countries/v5";
// const API_KEY = import.meta.env.VITE_API_KEY;
// export async function getCountryFlag(countryName: string) {
//     const response = await axios.get(
//         `${URL}?q=${encodeURIComponent(countryName)}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${API_KEY}`
//             }
//         }
//     );
// /*console.log(response.data);*/
// return (response.data.data?.objects[0]?.flag?.url_png);
// }

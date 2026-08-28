import axios from "axios";
import {writeFile} from "fs/promises";
import dotenv from "dotenv";

dotenv.config();
const URL = "https://api.restcountries.com/countries/v5";
const API_KEY = process.env.API_KEY;
async function fetchCountries(){
    const response =await axios.get(`${URL}?q=all`,{
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
    })
    const countries=response.data.data.objects.map((country:any)=>({
        country : country.names.common,
        flag : country.flag.url_png
    }))
    await writeFile("data/countries.json", JSON.stringify(countries,null,2));

    console.log(`Saved ${countries.length} countries successfully!`);//for testing ^-^
}
fetchCountries();
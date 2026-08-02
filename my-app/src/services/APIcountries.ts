const URL="https://restcountries.com/v5";
export async function getCountryFlag(countryName:string) {
    const response = await fetch(`${URL}/name/${countryName}?fields=flags,name `);
    if (!response.ok) {
        throw new Error("Country not found");
    }
    const data = await response.json();
    return data; 
}
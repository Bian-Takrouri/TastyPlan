const URL = "https://restcountries.com/v5";
const API_KEY = import.meta.env.VITE_API_KEY;
export async function getCountryFlag(countryName: string) {
    const response = await fetch(
        `${URL}/name/${encodeURIComponent(countryName)}?fields=flags,name`,
        {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
        }
    );
    if (!response.ok) {
        throw new Error("Country not found");
    }
    const data = await response.json();
    return data[0]?.flags?.svg ?? null;
}

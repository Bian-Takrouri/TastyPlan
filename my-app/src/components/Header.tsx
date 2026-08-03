import SearchBar from "./SearchBar";
import "./Header.css";
import sun from "../assets/icons/sun.svg"
import moon from "../assets/icons/moon.svg"
type Props={
    value: string;
    searchForValue : (value : string)=> void ;
}
function Header({value,searchForValue}:Props){
    return(
        <div className="HeaderContainer">
            <div className="logo">
            <img className="logoImg" src="/logo.png" alt="Logo" />
            </div>
            <SearchBar value={value}searchForValue={searchForValue}/>
            <div className="mood">
                <img src={sun} alt="light mode"/>
                <img src={moon} alt="dark mode"/>
            </div>
        </div>
    );
}
export default Header
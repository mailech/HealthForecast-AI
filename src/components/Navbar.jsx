import {
    FaBell,
    FaEnvelope,
    FaSearch
} from "react-icons/fa";

function Navbar() {

    return (

        <header className="navbar">

            <div className="navbar-left">

                <h2>

                    Welcome 👋

                </h2>

                <p>

                    HealthForecast AI Dashboard

                </p>

            </div>

            <div className="navbar-center">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search..."
                    />

                </div>

            </div>

            <div className="navbar-right">

                            <div className="icon">

                    <FaBell />

                    <span>3</span>

                </div>

                <div className="icon">

                    <FaEnvelope />

                    <span>5</span>

                </div>

                <div className="profile">

                    <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="Admin"
                    />

                    <div>

                        <h4>

                            Admin

                        </h4>

                        <p>

                            Hospital Administrator

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}

export default Navbar;
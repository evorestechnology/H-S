import { Construction, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import "./UnderConstruction.css";
const UnderConstruction = ({ pageTitle }) => {
    return (<div className="under-construction-container">
            <div className="under-construction-card">
                <div className="construction-icon-wrapper">
                    <Construction size={40}/>
                </div>
                <span className="construction-badge">{pageTitle}</span>
                <h2>Page Under Construction</h2>
                <p>
                    We are currently building and enhancing the <strong>{pageTitle}</strong> section. Check back soon for updates!
                </p>
                <Link to="/wallet" className="btn btn-primary" style={{ marginTop: "10px" }}>
                    <Wallet size={18}/>
                    <span>Go to Wallet Overview</span>
                </Link>
            </div>
        </div>);
};
export default UnderConstruction;

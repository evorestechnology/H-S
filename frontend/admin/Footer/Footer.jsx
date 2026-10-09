import "./Footer.css";
const Footer = () => {
    return (<footer className="footer">
            <div>
                © {new Date().getFullYear()} <strong>H&S</strong>. Powered by <strong>Evores Technologies</strong>. All rights reserved.
            </div>

        </footer>);
};
export default Footer;

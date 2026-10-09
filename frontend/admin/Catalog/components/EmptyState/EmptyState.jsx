import { FolderOpen } from "lucide-react";
import "./EmptyState.css";
const EmptyState = ({ onAction }) => {
    return (<div className="catalog-empty">
            <div className="empty-icon-wrapper">
                <FolderOpen size={48} className="empty-icon"/>
            </div>
            <h3>No Drops Found</h3>
            <p>Get started by creating your first clothing drop.</p>
            <button className="btn btn-primary mt-20" onClick={onAction}>
                Create First Drop
            </button>
        </div>);
};
export default EmptyState;

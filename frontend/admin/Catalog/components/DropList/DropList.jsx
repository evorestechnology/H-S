import DropCard from "../DropCard/DropCard";
const DropList = ({ drops, onEdit, onDelete, onAddProduct, onEditProduct, onUpdateStatus, onUpdateProductPrice }) => {
    return (<div className="drop-list">
            {drops.map(drop => (<DropCard key={drop.id} drop={drop} onEdit={onEdit} onDelete={onDelete} onAddProduct={onAddProduct} onEditProduct={onEditProduct} onUpdateStatus={onUpdateStatus} onUpdateProductPrice={onUpdateProductPrice}/>))}
        </div>);
};
export default DropList;

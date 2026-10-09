export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "Pending";
    OrderStatus["COMPLETED"] = "Completed";
    OrderStatus["CANCELLED"] = "Cancelled";
    OrderStatus["SHIPPING"] = "Shipping";
    OrderStatus["IN_PROGRESS"] = "In Progress";
    OrderStatus["CANCEL_REQUESTED"] = "Cancel Requested";
})(OrderStatus || (OrderStatus = {}));

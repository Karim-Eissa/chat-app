const sendResponse = (res, status, success, message, data = null) => {
    res.status(status).json({ success, message, ...(data && { data }) });
};

export default sendResponse;

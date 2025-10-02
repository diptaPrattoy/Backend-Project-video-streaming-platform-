// 1st approach , chatgpt said this is better
const asyncHandler = (fnc) => {
    return (req, res, next) => {
        Promise.resolve(fnc(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };

//2nd approach
// const asyncHandler = (fnc) => {
//     return async (req, res, next) => {
//         try {
//             await fnc(req, res, next);
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 message: error.message,
//                 success: false,
//             });
//         }
//     };
// };

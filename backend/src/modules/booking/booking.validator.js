const { body } = require('express-validator');

exports.createBookingValidator = [
    body('roomId').isMongoId().withMessage('Room ID không hợp lệ'),
    body('checkInDate').isISO8601().withMessage('Ngày nhận phòng không hợp lệ'),
    body('checkOutDate').isISO8601().withMessage('Ngày trả phòng không hợp lệ'),
    body('guestCount.adults').optional().isInt({min:1}).withMessage('Số khách tối thiểu 1')
];

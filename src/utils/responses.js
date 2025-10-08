const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    error: { message }
  };

  if (errors) {
    response.error.details = errors;
  }

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      hasMore: pagination.hasMore,
      cursor: pagination.cursor,
      total: pagination.total || null
    }
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
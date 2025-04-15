//check if year-month match with other year-month
export const matchYearMonth = (db_date, payload_date) => {
  if (db_date.toISOString().slice(0, 7) === payload_date.slice(0, 7)) {
    return true;
  } else {
    return false;
  }
};

//check if month-day match with other month-day
export const matchMonthDay = (db_date, payload_date) => {
  if (db_date.toISOString().slice(5, 10) === payload_date.slice(5, 10)) {
    return true;
  } else {
    return false;
  }
};

//check if year-month-day match with other year-month-day
export const matchYearMonthDay = (db_date, payload_date) => {
  if (db_date.toISOString().slice(0, 10) === payload_date.slice(0, 10)) {
    return true;
  } else {
    return false;
  }
};

//check if month match with query param month
export const matchQueryParamMonth = (db_date, query_param_month) => {
  if (
    parseInt(db_date.toISOString().slice(5, 7)) ===
    parseInt(query_param_month.toString())
  ) {
    return true;
  } else {
    return false;
  }
};

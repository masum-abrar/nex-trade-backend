import { matchQueryParamMonth } from "./dateTime.js";

//filter by month
export const filterByMonth = (initialArray, array, month) => {
  let monthWiseData = initialArray;
  const monthlyArrayLength = array.length;

  for (var i = 0; i < monthlyArrayLength; i++) {
    if (matchQueryParamMonth(array[i].date, month)) {
      monthWiseData.push(array[i]);
    }
  }

  if (monthWiseData.length === 0) {
    return initialArray;
  } else {
    return monthWiseData;
  }
};

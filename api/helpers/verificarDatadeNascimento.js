const moment = require('moment');
const MAX_AGE = 120;

module.exports = data_nasc => {
  return !(
    (moment().diff(moment(data_nasc, 'DD/MM/YYYY'), 'years') > MAX_AGE)
    ||
    (moment().isSameOrBefore(moment(data_nasc, 'DD/MM/YYYY')))
  )
}

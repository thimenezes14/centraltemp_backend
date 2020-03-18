const bcrypt = require('bcrypt-nodejs');


module.exports.hash = async password => {
    const salt = await bcrypt.genSaltSync(10);
    return await bcrypt.hashSync(password,salt,null);
}

module.exports.compare = (senha, senhaV, callback) => {
    bcrypt.compare(senha, senhaV, (err, isMatch) => {
        callback(err, isMatch);
    });
}
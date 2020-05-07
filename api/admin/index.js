const args = process.argv.slice(2, 3)[0];
const resetPassword = require('./setPassword');
const reboot = require('./reboot');
const profiles = require('./adminprofiles');

if(!RegExp(/^\$2[ayb]\$.{56}$/).test(process.env.ADMIN_PASS)) {
    console.log("Nenhuma senha padrão foi detectada. Redirecionando para redefinição de senha...");
    resetPassword();
}

switch (args) {
    case 'reboot':
        console.log("Redefinir sistema.");
        reboot();
        break;
    case 'profiles':
        console.log("Gerenciamento de perfis.");
        profiles();
        break;
    case 'reset-pass':
        console.log("Redefinir senha de administrador. ");
        resetPassword();
        break;
    default:
        console.log('\x1b[31m%s\x1b[0m', "Opção inválida ");
        process.exit(1);
}
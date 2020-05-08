const args = process.argv.slice(2, 3)[0];
const resetPassword = require('./scripts/setPassword');
const reboot = require('./scripts/reboot');
const profiles = require('./scripts/adminprofiles');
const verAdmin = require('./scripts/criarAdmin').verificarSeHaAdmin;
const newAdmin = require('./scripts/criarAdmin').cadastrar;

async function menu(opcao) {
    switch (opcao) {
        case 'reboot':
            console.log("Redefinir sistema.");
            await reboot();
            break;
        case 'profiles':
            console.log("Gerenciamento de perfis.");
            await profiles();
            break;
        case 'reset-pass':
            console.log("Redefinir senha de administrador. ");
            await resetPassword();
            break;
        default:
            console.log('\x1b[31m%s\x1b[0m', "Opção inválida ");
            process.exit(1);
    }
}

async function main() {
    console.clear();
    try {
        const isAdmin = await verAdmin();
        if (!isAdmin) {
            console.log("Para prosseguir, crie uma conta de administrador. ");
            await newAdmin();
        }
        menu(args);
    } catch (err) {
        console.log("Ocorreu um erro. " + err);
    }
}

main();
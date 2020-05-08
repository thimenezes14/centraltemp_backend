"use strict";
const nodemailer = require("nodemailer");

function configurarEmaildeEnvio() {
    let transporter = nodemailer.createTransport({
        connectionTimeout: 10000,
        maxConnections: 3,
        maxMessages: 50,
        pool: true,
        host: "smtp.office365.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASS
        }
      });

    return transporter;
}

module.exports = async (senhaGerada, emailDestino, modo) => {
    let assunto = '', mensagemHTML = '';
    try {
        switch (modo) {
            case 'password':
                assunto = "Solicitação de nova senha";
                mensagemHTML =  "<p>Uma solicitação de nova senha para o administrador foi efetuada. Anote a senha abaixo:</p><p style='font-family: Courier, monospace; text-align: center'><strong>" + senhaGerada + "</strong></p><h6>Atenção: esta deve ser uma senha TEMPORÁRIA e deve ser trocada assim que recebida!</h6>"
                break;
            case 'confirmation':
                assunto = "Confirmação de cadastro";
                mensagemHTML =  "<p>Confirme seu cadastro. Anote a senha abaixo para validar o processo:</p><p style='font-family: Courier, monospace; text-align: center'><strong>" + senhaGerada + "</strong></p><h6>Atenção: o cadastro não será completado sem esta etapa!</h6>";
                break;
            default:
                process.exit(1);
        }
        let transporter = await configurarEmaildeEnvio();
        let info = await transporter.sendMail({
            from: '"CentralTemp" <centraltemp@outlook.com>', 
            to: emailDestino, 
            subject: assunto, 
            html: mensagemHTML
        }); 
        console.log('\x1b[36m%s\x1b[0m', "Mensagem enviada. ID: %s", info.messageId);
        transporter.close();
        return true;
    } catch (error) {
        console.log("Ocorreu um erro: " + error);
        return false;
    }
}
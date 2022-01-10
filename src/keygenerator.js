//Gera as chaves públicas e privadas

//Importa a biblioteca 'elliptic' que permite gerar chaves públicas e privadas, possui métodos para assinatura e verificação
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//key: cria o par de chaves
//publicKey: extrai a chave pública
//privateKey: extrai a chave privada
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');


//Mostra as chaves no console
console.log();
console.log('Private key:',privateKey);

console.log();
console.log('Public key:',publicKey);

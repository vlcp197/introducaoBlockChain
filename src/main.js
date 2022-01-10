//importa as classes Blockchain e Transaction do arquivo blockchain.js
const{Blockchain,Transaction} = require('./blockchain');

//importa a biblioteca 'elliptic'
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate("6fe73b15460e4bc26e1fe17b88ff5e5dba1bedddabe3988a37d028660f53f682");
const myWalletAddress = myKey.getPublic('hex');

//Aqui é criada uma instância da classe Blockchain e seus parâmetros são passados.
let viCoin = new Blockchain();

//Aqui é criada a transação
const tx1 = new Transaction(myWalletAddress,'public key goes here',10);
tx1.signTransaction(myKey);
viCoin.addTransaction(tx1);

console.log("\n Starting the miner... ");
viCoin.minePendingTransactions(myWalletAddress);

console.log("\nBalance of Vinicius is: "+ viCoin.getBalanceOfAddress(myWalletAddress));



console.log("Is chain valid?",viCoin.isChainValid());
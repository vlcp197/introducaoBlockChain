//importa os arquivos das bibliotecas 'crypto-js' e 'elliptic'
const SHA256 = require('crypto-js/sha256');
const EC = require("elliptic").ec;
const ec = new EC('secp256k1');

class Transaction{
    /*fromAddress: Quem está enviando na transação;
    toAddress: Quem está recebendo na transação;
    amount: Quantidade transacionada.
    */
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    //calcula o hash da transação
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    //Assina a transação
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error("You cannor sign transactions for other wallets!");

        }
        //hashTx: Hash da transação
        //sig: Assinatura da transação
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex');
    }

    //Verifica se a assinatura nesta transação é válida
    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error("No signature in this transaction");
        }

        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}

class Block{
    /*timestamp: Quando o bloco foi criado;
    transactions: Refere-se às transações. 
    previousHash: String do hash do bloco anterior.
    hash: código da blockchain;
    nonce: números aleatórios que serão usados para resolver os desafios da blockchain
    */
    constructor(timestamp,transactions,previousHash = ' '){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    //calculateHash: Método que recebe como parâmetros os atributos do bloco e retorna o hash do bloco 
    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }
    //Implementação da 'proof of work', ou mineração
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
            this.nonce++;
            this.hash = this.calculateHash();
        }; 
        console.log("Block mined: "+this.hash);
    };

    //hasValidTransactions: Método que verifica todas a transações no bloco atual
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}



class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    //createGenesisBlock: Método que cria o primeiro bloco da blockchain, normalmente chamado de "Genesis block".
    createGenesisBlock(){
        return new Block(Date.parse("01/01/2022"),[],'0');
    }

    //getLatestBlock: retorna o último bloco da cadeia.
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //Este método envia a recompensa para o endereço que estiver no parâmetro. O endereço do parâmetro será o que conseguiu realizar a mineração
    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null,miningRewardAddress,this.miningReward);
        this.pendingTransactions.push(rewardTx);
        
        let block = new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined! ");
        this.chain.push(block);

        this.pendingTransactions = []
    };
    
    //Este método recebe uma transação e a adiciona às transações pendentes
    addTransaction(transaction){

        //Verifica se os os endereços de remetente e destinatário estão preenchidos
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include from and to address");
        }

        //Verifica se a transação que será inserida é válida
        if (!transaction.isValid()){
            throw new Error("Cannot add invalid transaction to chain");
        }

        this.pendingTransactions.push(transaction);
    }

    //Este método verifica o balanço de uma transação
    getBalanceOfAddress(address){
        let balance = 0;

        //Para verificar o balanço de uma carteira, é necessário verificar cada bloco de uma blockchain que se refere ao endereço da carteira e verificar cada transação feita em cada um desses blocos. 
        for(const block of this.chain){
            for (const trans of block.transactions){
                //Aqui o dono da carteira envia uma certa quantidade para outra carteira
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
                //Aqui o dono da carteira recebe uma certa quantidade de outra carteira
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    //isChainValid: método que itera sobre todos os blocos da cadeia e verifica se o hash de cada bloco está correto e se referencia o hash do bloco anterior
    //currentBlock: constante que se refere ao bloco atual.
    //previousBlock: constante que se refere ao bloco anterior.
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.calculateHash()){
                return false;
            }
        }
        
        return true;
    }
}

//Exporta as classes Blockchain e Transaction como um elemento para outros arquivos usarem
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
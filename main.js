const SHA256 = require('crypto-js/sha256');

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
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    //calculateHash: Método que recebe como parâmetros os atributos do bloco e retorna o hash do bloco 
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }
    //Implementação da 'proof of work', ou mineração
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
            this.nonce++;
            this.hash = this.calculateHash();
        }; 
        console.log("Block mined: "+this.hash);
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
        return new Block("01/01/2022","Genesis Block",'0');
    }

    //getLatestBlock: retorna o último bloco da cadeia.
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //Este método envia a recompensa para o endereço que estiver no parâmetro. O endereço do parâmetro será o que conseguiu realizar a mineração
    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined! ");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null,miningRewardAddress, this.miningReward)
        ]
    };
    
    //Este método recebe uma transação e a adiciona às transações pendentes
    createTransaction(transaction){
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
                    balance += trans.amount
                }
            }
        }
        return balance;
    }

    //isChainValid: método que verifica a integridade do bloco que será inserido na blockchain
    //currentBlock: constante que se refere ao bloco atual.
    //previousBlock: constante que se refere ao bloco anterior.
    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}


//Aqui é criada uma instância da classe Blockchain e seus parâmetros são passados.
let viCoin = new Blockchain();


viCoin.createTransaction(new Transaction('address1','address2',100));
viCoin.createTransaction(new Transaction('address2','address1',50));

console.log("\n Starting the miner... ");
viCoin.minePendingTransactions('vinicius-address');

console.log("\nBalance of Vinicius is: "+ viCoin.getBalanceOfAddress('vinicius-address'));

console.log("\nStarting the miner again...");
viCoin.minePendingTransactions("vinicius-address");

console.log("\nBalance of Vinicius is: "+ viCoin.getBalanceOfAddress('vinicius-address'));

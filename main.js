const SHA256 = require('crypto-js/sha256');

class Block{
    /*index: Índice do bloco onde o mesmo se localiza na cadeia;
    timestamp: Quando o bloco foi criado;
    data: Quaisquer tipos de dados associados com o bloco. Pode ser o nome das partes envolvidas na transação, o valor envolvido etc;
    previousHash: String do hash do bloco anterior.
    */
    constructor(index,timestamp,data,previousHash = ' '){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }
    //calculateHash: Método que recebe como parâmetros os atributos do bloco e retorna o hash do bloco 
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }
    //createGenesisBlock: Método que cria o primeiro bloco da blockchain, normalmente chamado de "Genesis block".
    createGenesisBlock(){
        return new Block(0,"01/01/2022","Genesis Block",'0');
    }

    //getLatestBlock: retorna o último bloco da cadeia.
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //addBlock: adiciona um novo bloco na cadeia.
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
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
viCoin.addBlock(new Block(1,'08/01/2022',{amount: 4}));
viCoin.addBlock(new Block(2,"09/01/2022",{amount:50}));

//Aqui a blockchain é impressa no console.
console.log(JSON.stringify(viCoin,null,4));
//Aqui é impressa a verificação de integridade da blockchain
console.log('\nIs blockchain valid? \n' + viCoin.isChainValid());

